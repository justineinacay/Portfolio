# Portfolio V19 — activate real visitor analytics

Your portfolio now includes a real first-party analytics client, a secure owner dashboard and a discreet public counter. **No real numbers can be shown until a dedicated analytics backend is connected.** The current `assets/analytics-config.js` intentionally has empty credentials. It does not simulate visits.

## 1. Create a DEDICATED Supabase project

Use a new project such as `Justine Portfolio Insights`. Do **not** use the existing JOBSystems, NakNak, or tjc-portal databases, because their business and personal data are unrelated.

In Supabase Dashboard > SQL Editor, run the reviewed migration file:

`supabase/migrations/20261109000000_portfolio_analytics.sql`

The migration creates one restricted event table, indexes, and two server-only aggregate RPCs. The table has RLS enabled and grants no reads/writes to `anon` or `authenticated` browser roles. Only the backend may write analytics or read aggregate statistics.

## 2. Create the owner account

In Authentication > Users, invite or create the verified account for the owner, such as `justineluisinacay@gmail.com`. Disable public user signup if you do not need it. Make sure the owner can sign in with a one-time email link.

In Authentication > URL Configuration, add the URL of the deployed dashboard to **Redirect URLs**, for example:

`https://justineinacay.github.io/Portfolio/admin/insights.html`

If you use a different domain or repository directory, substitute its exact dashboard URL.

## 3. Deploy the Edge Function

The function is provided in:

`supabase/functions/portfolio-analytics/index.ts`

Function configuration is in `supabase/config.toml` and specifies `verify_jwt = false` because the public counter/visit collection endpoint must be accessible to visitors. **The private statistics endpoint still independently verifies the signed-in user and checks the configured owner email or user ID.**

With the current Supabase CLI, first run `supabase --help`, `supabase functions --help`, and `supabase functions deploy --help` to confirm syntax; link the new project and deploy `portfolio-analytics` using those documented commands. Alternatively, use the Edge Function editor in Supabase Dashboard and paste the function contents, with JWT verification disabled for the public endpoint.

In the new project's Edge Function secrets, set:

- `PORTFOLIO_OWNER_EMAIL` = your verified email; or set `PORTFOLIO_OWNER_USER_ID` = owner's Supabase Auth UID (stronger).
- `PORTFOLIO_ALLOWED_ORIGINS` = `https://justineinacay.github.io` (comma-separated origins if you also use a custom domain).
- `PORTFOLIO_HASH_SECRET` = at least 32 random characters generated securely (for example `openssl rand -hex 32`). **Never put this secret into the static website.**

The function reads `SUPABASE_URL` and server-only credentials from Supabase's Edge Function environment; it never exports service-role or secret keys to the browser. Do not add an admin key, secret key, or service-role key to `assets/analytics-config.js`.

## 4. Configure the static website

Edit `assets/analytics-config.js`, which is meant to be public:

```js
window.JUSTINE_ANALYTICS_CONFIG = Object.freeze({
  endpoint: 'https://YOUR-PROJECT.supabase.co/functions/v1/portfolio-analytics',
  supabaseUrl: 'https://YOUR-PROJECT.supabase.co',
  publishableKey: 'sb_publishable_YOUR_PUBLIC_KEY',
  ownerEmail: 'justineluisinacay@gmail.com',
  cloudflareBeaconToken: ''
});
```

Use a **publishable** key, not a service-role or secret key. You can get the project URL and publishable key from the Supabase Dashboard API settings.

Upload the entire website directory to GitHub Pages or another static host, keeping `assets/`, `admin/`, `notes/`, and `case-studies/` intact. Tracking is intentionally disabled for `file://` previews and localhost; it begins when deployed as a public site.

Open your own dashboard at:

`https://justineinacay.github.io/Portfolio/admin/insights.html`

Sign in using the owner account's emailed link. Visitors do not have access to the private dashboard statistics, even if they guess its URL.

## 5. Optional: Cloudflare Web Analytics

Cloudflare Web Analytics can independently show visitor trends, referral sources, countries and web performance metrics. It does not require moving your GitHub Pages domain or using Cloudflare DNS. Create a Web Analytics site in your Cloudflare account and copy the beacon token into `cloudflareBeaconToken` in `assets/analytics-config.js`.

Source: https://developers.cloudflare.com/web-analytics/about/

This is **optional**. The first-party page counter and private interaction dashboard work without Cloudflare, once Supabase is connected.

## What each number means

- **Portfolio page views**: counted page load events; repeat visits count again.
- **About / profile views**: page views specifically on `about.html`.
- **Estimated unique sessions**: distinct temporary browser-tab session IDs within the selected period. These are **not** unique humans and do not persist between tabs or browser restarts.
- **Résumé downloads**: clicks on the résumé link, not confirmation that the file finished downloading.
- **Contact clicks**: email and LinkedIn link clicks, not proof that anyone sent a message.
- **Project opens**: clicks on project-detail dialogs.
- **Traffic sources**: sanitized UTM source and referrer hostname where available; no full URL or query-string collection.

Counts start at zero when tracking is first activated; **historical visits before activation cannot be recovered** from this new database. Visits can be missed (ad blocking, privacy settings, offline use), and simple counters can be manipulated by determined bots, so use data for directional insights rather than verified people counts.

## Privacy and controls

The client skips recording for Do Not Track, Global Privacy Control, your `portfolio_analytics_optout` browser choice, and offline/local preview sessions. It does not store raw IPs, names, email addresses, user-agent strings, or full referrer URLs. The server saves only a salted hash of a temporary `sessionStorage` identifier.

Public visitors can read `privacy.html` and opt out. Analytics administrative access is verified server-side against the actual Supabase Auth user. Keep your environment secrets private and rotate the hashing secret if compromised. Review privacy rules relevant to the regions where your visitors live.

## Validation checklist

1. Open the deployed website, confirm `POST` analytics requests return HTTP 202.
2. Open `?mode=count` from the site and confirm an integer response (may initially be 0).
3. Confirm the public counter appears **only when the endpoint succeeds**.
4. Sign in as the owner and check the private dashboard against the recorded test visits.
5. Confirm a visitor without owner credentials receives 401 or 403 on `?mode=stats`.
6. Re-test light/dark mode, mobile navigation, résumé link, case-study pages, and projects.
7. Confirm scripts are not tracking `file://` previews and that the opt-out toggle prevents new events.

## Included files

- `assets/analytics-config.js`: safe, public client-side configuration.
- `assets/portfolio-analytics.js`: frontend tracking and counter display.
- `assets/portfolio-analytics.css`: small footer counter styling.
- `admin/insights.html`, `.css`, `.js`: owner-only dashboard interface.
- `privacy.html`: visitor privacy explanation and opt-out controls.
- `supabase/migrations/20261109000000_portfolio_analytics.sql`: restricted schema.
- `supabase/functions/portfolio-analytics/index.ts`: secure API endpoint.
- `supabase/config.toml`: function deployment configuration.
