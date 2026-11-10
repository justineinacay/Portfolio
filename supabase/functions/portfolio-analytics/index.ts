// Justine Inacay — V18 dedicated Supabase analytics edge endpoint.
// Endpoint is public for tracking / counters. Admin results require a verified
// Supabase Auth user whose email or UID matches the configured owner.
// NOTE: Deploy with verify_jwt=false; this function performs its own checks.
import { createClient } from 'npm:@supabase/supabase-js@2.95.0';

const url = Deno.env.get('SUPABASE_URL') || '';
const keyMap = (() => { try { return JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') || '{}'); } catch { return {}; } })();
const secretKey: string = keyMap.default || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const admin = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
const ownerEmail = (Deno.env.get('PORTFOLIO_OWNER_EMAIL') || '').toLowerCase().trim();
const ownerUserId = (Deno.env.get('PORTFOLIO_OWNER_USER_ID') || '').trim();
const hashSecret = Deno.env.get('PORTFOLIO_HASH_SECRET') || '';
const origins = new Set((Deno.env.get('PORTFOLIO_ALLOWED_ORIGINS') || 'https://justineinacay.github.io')
  .split(',').map(s => s.trim()).filter(Boolean));

function headers(origin: string) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
    'Access-Control-Max-Age': '600',
    'Vary': 'Origin',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  };
}
const result = (value: unknown, status: number, origin: string) =>
  new Response(JSON.stringify(value), { status, headers: headers(origin) });
const valid = (s: unknown, regex: RegExp, max: number) =>
  typeof s === 'string' && s.length <= max && regex.test(s);

async function hashVisitor(id: string) {
  const bytes = new TextEncoder().encode(hashSecret + ':' + id);
  const buffer = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') || '';
  if (!origins.has(origin)) return result({ error: 'Origin not allowed' }, 403, 'null');
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: headers(origin) });
  if (!url || !secretKey || hashSecret.length < 32 || (!ownerEmail && !ownerUserId)) {
    return result({ error: 'Analytics server is not configured' }, 503, origin);
  }
  const requestUrl = new URL(req.url);

  if (req.method === 'GET' && requestUrl.searchParams.get('mode') === 'count') {
    const { data, error } = await admin.rpc('portfolio_public_count');
    if (error) return result({ error: 'Counter unavailable' }, 503, origin);
    return result(data, 200, origin);
  }

  if (req.method === 'GET' && requestUrl.searchParams.get('mode') === 'stats') {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '').trim();
    if (!token) return result({ error: 'Sign in required' }, 401, origin);
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user || !user.email_confirmed_at ||
        (ownerUserId ? user.id !== ownerUserId : user.email?.toLowerCase() !== ownerEmail)) {
      return result({ error: 'Not authorized' }, 403, origin);
    }
    const daysInput = Number(requestUrl.searchParams.get('days') || 30);
    const days = [7, 30, 90, 365].includes(daysInput) ? daysInput : 30;
    const { data, error } = await admin.rpc('portfolio_owner_stats', { lookback_days: days });
    if (error) return result({ error: 'Unable to load statistics' }, 503, origin);
    return result(data, 200, origin);
  }

  if (req.method === 'POST') {
    const length = Number(req.headers.get('content-length') || 0);
    if (length > 4096) return result({ error: 'Payload too large' }, 413, origin);
    let payload: Record<string, unknown>;
    try { payload = await req.json(); } catch { return result({ error: 'Invalid JSON' }, 400, origin); }
    const { event_id, event_name, path, session, referrer_domain, utm_source } = payload;
    if (!valid(event_id, /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i, 36) ||
        !['page_view','resume_download','contact_click','project_open','case_study_open'].includes(String(event_name)) ||
        !valid(path, /^[a-z0-9/_-]+\.html$/i, 140) ||
        !valid(session, /^[a-z0-9-]{20,60}$/i, 60)) {
      return result({ error: 'Invalid event' }, 400, origin);
    }
    const visitorHash = await hashVisitor(String(session));
    // Simple defense against accidental refresh loops or rapid-fire events.
    const recentSince = new Date(Date.now() - 10_000).toISOString();
    const { count: recentCount, error: checkError } = await admin.from('portfolio_events')
      .select('id', { count: 'exact', head: true }).eq('visitor_hash', visitorHash).gte('occurred_at', recentSince);
    if (checkError) return result({ error: 'Tracking unavailable' }, 503, origin);
    if ((recentCount || 0) >= 12) return result({ accepted: false, reason: 'rate_limited' }, 429, origin);
    const cleanRef = valid(referrer_domain, /^[a-z0-9.-]*$/i, 100) ? referrer_domain : '';
    const cleanSource = valid(utm_source, /^[a-z0-9._-]*$/i, 48) ? utm_source : '';
    const { error } = await admin.from('portfolio_events').insert({
      event_id, event_name, path, visitor_hash: visitorHash,
      referrer_domain: cleanRef, utm_source: cleanSource,
    });
    if (error?.code === '23505') return result({ accepted: true, duplicate: true }, 200, origin);
    if (error) return result({ error: 'Unable to save event' }, 503, origin);
    return result({ accepted: true }, 202, origin);
  }
  return result({ error: 'Not found' }, 404, origin);
});
