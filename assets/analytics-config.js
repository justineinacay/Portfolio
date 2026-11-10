/* Portfolio V18: public client configuration ONLY. Never put a secret or service-role key here.
   Activate after creating a dedicated Supabase project and deploying the analytics Edge Function. */
window.JUSTINE_ANALYTICS_CONFIG = Object.freeze({
  endpoint: '',                 // e.g. https://YOUR-PROJECT.supabase.co/functions/v1/portfolio-analytics
  supabaseUrl: '',              // e.g. https://YOUR-PROJECT.supabase.co
  publishableKey: '',          // sb_publishable_... (safe to expose; not a secret)
  ownerEmail: 'justineluisinacay@gmail.com',
  cloudflareBeaconToken: ''     // Optional; get from Cloudflare Web Analytics dashboard
});
