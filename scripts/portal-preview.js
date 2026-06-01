const { chromium } = require('@playwright/test');

const COMPANY = {
  id: 'mock-company-id',
  slug: 'pets-delight',
  name: 'Pets Delight',
  logo_url: null,
  retainer_aed: 5500,
  package_name: 'Growth Package — 15 Reels/month',
  start_date: '2026-03-01',
  video_quota: 15,
  pending_videos: 2,
  total_videos: 7,
  unpaid_invoices: 1,
};

const VIDEOS = [
  { id: 'v1', company_id: 'mock-company-id', title: 'Persian cat grooming routine — step by step', type: 'Reel', month: '2026-06', number: 1, stream_url: null, caption: 'Keep your Persian looking runway-ready ✨🐾', posted_url: null, status: 'ready_for_review', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v2', company_id: 'mock-company-id', title: 'Rabbit care 101 — what nobody tells you', type: 'Reel', month: '2026-06', number: 2, stream_url: null, caption: 'Thinking of getting a rabbit? Watch this first 🐰', posted_url: null, status: 'idea_pending', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v3', company_id: 'mock-company-id', title: 'Summer heat & pets — safety guide', type: 'Reel', month: '2026-06', number: 3, stream_url: null, caption: 'Dubai summers hit different for pets 🌡️❤️', posted_url: null, status: 'idea_approved', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v4', company_id: 'mock-company-id', title: 'Golden Retriever Bath Day — slow-mo drop in', type: 'Reel', month: '2026-05', number: 1, stream_url: null, caption: "It's bath time! 🐾 Our Golden loves the attention", posted_url: 'https://instagram.com/p/example1', status: 'posted', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v5', company_id: 'mock-company-id', title: 'Cat vs. Automatic Feeder — First Reaction', type: 'Reel', month: '2026-05', number: 2, stream_url: null, caption: 'Watch Luna meet her new best friend 😂🐱', posted_url: 'https://instagram.com/p/example2', status: 'posted', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v6', company_id: 'mock-company-id', title: 'Behind the shelves — new arrivals tour', type: 'Reel', month: '2026-05', number: 3, stream_url: null, caption: 'New stock just landed! 🛒 Premium pet food & toys', posted_url: null, status: 'client_approved', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'v7', company_id: 'mock-company-id', title: 'Dog training tip — sit in 3 steps', type: 'Reel', month: '2026-05', number: 4, stream_url: null, caption: 'Every dog can learn this in one session 🐶', posted_url: null, status: 'in_production', client_note: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const METRICS = [
  { id: 'm1', company_id: 'mock-company-id', month: '2026-05', followers: 4820, followers_change: 312, views: 84200, reach: 61300, engagement_rate: 4.7, top_post_url: null, notes: 'Best month so far. The Golden Retriever bath reel hit 28K views on its own.' },
  { id: 'm2', company_id: 'mock-company-id', month: '2026-04', followers: 4508, followers_change: 241, views: 67100, reach: 49800, engagement_rate: 3.9, top_post_url: null, notes: null },
  { id: 'm3', company_id: 'mock-company-id', month: '2026-03', followers: 4267, followers_change: 190, views: 52300, reach: 39100, engagement_rate: 3.4, top_post_url: null, notes: null },
];

const INVOICES = [
  { id: 'i1', company_id: 'mock-company-id', invoice_number: 'PD-JUN-004', month: '2026-06', invoice_date: '2026-06-01', due_date: '2026-06-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'pending', paid_date: null, notes: null, line_items: [{ description: 'Social Media Management — June 2026 (15 Reels)', amount: 5500 }] },
  { id: 'i2', company_id: 'mock-company-id', invoice_number: 'PD-MAY-003', month: '2026-05', invoice_date: '2026-05-01', due_date: '2026-05-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'paid', paid_date: '2026-05-04', notes: null, line_items: [{ description: 'Social Media Management — May 2026 (15 Reels)', amount: 5500 }] },
  { id: 'i3', company_id: 'mock-company-id', invoice_number: 'PD-APR-002', month: '2026-04', invoice_date: '2026-04-01', due_date: '2026-04-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'paid', paid_date: '2026-04-03', notes: null, line_items: [{ description: 'Social Media Management — April 2026 (15 Reels)', amount: 5500 }] },
];

const INTERNAL_COMPANIES = [{ ...COMPANY }];

async function interceptAPIs(page) {
  await page.route('**/api/portal/v2/companies**', route => {
    const url = new URL(route.request().url());
    const slug = url.searchParams.get('slug');
    if (slug === 'pets-delight') return route.fulfill({ contentType: 'application/json', body: JSON.stringify(COMPANY) });
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(INTERNAL_COMPANIES) });
  });

  await page.route('**/api/portal/v2/videos**', route => {
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(VIDEOS) });
  });

  await page.route('**/api/portal/v2/metrics**', route => {
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(METRICS) });
  });

  await page.route('**/api/portal/v2/invoices**', route => {
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify(INVOICES) });
  });

  await page.route('**/api/portal/admin/me', route => {
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, role: 'ADMIN' }) });
  });
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  // ── Page 1: Internal Login ──────────────────────────────────────────────────
  const loginPage = await ctx.newPage();
  await loginPage.goto('http://localhost:3000/portal/internal/login');
  await loginPage.waitForLoadState('networkidle');
  await loginPage.screenshot({ path: '/tmp/01-internal-login.png', fullPage: false });
  console.log('✓ Internal login page');

  // ── Page 2: Client Portal — Dashboard ──────────────────────────────────────
  const clientPage = await ctx.newPage();
  await interceptAPIs(clientPage);
  await clientPage.goto('http://localhost:3000/portal/client/pets-delight');
  await clientPage.waitForLoadState('networkidle');
  await clientPage.waitForTimeout(1500);
  await clientPage.screenshot({ path: '/tmp/02-client-dashboard.png', fullPage: false });
  console.log('✓ Client portal dashboard');

  // ── Page 3: Client Portal — Content ────────────────────────────────────────
  await interceptAPIs(clientPage);
  await clientPage.goto('http://localhost:3000/portal/client/pets-delight/content');
  await clientPage.waitForLoadState('networkidle');
  await clientPage.waitForTimeout(1500);
  await clientPage.screenshot({ path: '/tmp/03-client-content.png', fullPage: false });
  console.log('✓ Client portal content');

  // ── Page 4: Client Portal — Analytics ──────────────────────────────────────
  await interceptAPIs(clientPage);
  await clientPage.goto('http://localhost:3000/portal/client/pets-delight/analytics');
  await clientPage.waitForLoadState('networkidle');
  await clientPage.waitForTimeout(1000);
  await clientPage.screenshot({ path: '/tmp/04-client-analytics.png', fullPage: false });
  console.log('✓ Client portal analytics');

  // ── Page 5: Client Portal — Billing ────────────────────────────────────────
  await interceptAPIs(clientPage);
  await clientPage.goto('http://localhost:3000/portal/client/pets-delight/billing');
  await clientPage.waitForLoadState('networkidle');
  await clientPage.waitForTimeout(1000);
  await clientPage.screenshot({ path: '/tmp/05-client-billing.png', fullPage: false });
  console.log('✓ Client portal billing');

  // ── Page 6: Internal Portal — Client Directory ─────────────────────────────
  const internalPage = await ctx.newPage();
  await interceptAPIs(internalPage);
  // Set admin cookie
  await ctx.addCookies([{ name: 'portal-admin', value: 'cactus2026', domain: 'localhost', path: '/' }]);
  await internalPage.goto('http://localhost:3000/portal/internal');
  await internalPage.waitForLoadState('networkidle');
  await internalPage.waitForTimeout(1500);
  await internalPage.screenshot({ path: '/tmp/06-internal-directory.png', fullPage: false });
  console.log('✓ Internal portal directory');

  // ── Page 7: Internal Portal — Client Overview ───────────────────────────────
  await interceptAPIs(internalPage);
  await internalPage.goto('http://localhost:3000/portal/internal/pets-delight');
  await internalPage.waitForLoadState('networkidle');
  await internalPage.waitForTimeout(1000);
  await internalPage.screenshot({ path: '/tmp/07-internal-client.png', fullPage: false });
  console.log('✓ Internal portal — Pets Delight overview');

  // ── Page 8: Internal Portal — Videos ───────────────────────────────────────
  await interceptAPIs(internalPage);
  await internalPage.goto('http://localhost:3000/portal/internal/pets-delight/videos');
  await internalPage.waitForLoadState('networkidle');
  await internalPage.waitForTimeout(1000);
  await internalPage.screenshot({ path: '/tmp/08-internal-videos.png', fullPage: false });
  console.log('✓ Internal portal — Videos management');

  console.log('\nAll done! Browser staying open for review.');
})();
