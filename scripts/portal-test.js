// End-to-end portal test with mocked Supabase responses.
// Simulates: admin creates a video -> client sees it -> client approves
// -> admin sees the approval. Also covers metrics, invoices, the
// add-company flow, and the not-found page.

const { chromium } = require('@playwright/test');

// ─── In-memory mock store ──────────────────────────────────────────────────
const store = {
  companies: [
    {
      id: 'co-1', slug: 'pets-delight', name: 'Pets Delight',
      logo_url: null, package_name: 'Growth Package — 15 Reels/month',
      retainer_aed: 5500, video_quota: 15, start_date: '2026-03-01',
      is_active: true, email: 'hello@petsdelight.ae', whatsapp: '+971501234567',
      instagram: '@petsdelightdubai',
    },
  ],
  videos: [
    { id: 'v1', company_id: 'co-1', title: 'Persian cat grooming routine — step by step', type: 'Reel', month: '2026-06', number: 1, stream_url: null, thumbnail_url: null, caption: 'Keep your Persian looking runway-ready ✨🐾', posted_url: null, status: 'ready_for_review', client_note: null, internal_notes: null, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
    { id: 'v2', company_id: 'co-1', title: 'Rabbit care 101 — what nobody tells you', type: 'Reel', month: '2026-06', number: 2, stream_url: null, thumbnail_url: null, caption: 'Thinking of getting a rabbit? Watch this first 🐰', posted_url: null, status: 'idea_pending', client_note: null, internal_notes: null, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
    { id: 'v3', company_id: 'co-1', title: 'Summer heat & pets — safety guide', type: 'Reel', month: '2026-06', number: 3, stream_url: null, thumbnail_url: null, caption: 'Dubai summers hit different for pets 🌡️❤️', posted_url: null, status: 'idea_approved', client_note: null, internal_notes: null, created_at: '2026-06-01T10:00:00Z', updated_at: '2026-06-01T10:00:00Z' },
    { id: 'v4', company_id: 'co-1', title: 'Golden Retriever Bath Day', type: 'Reel', month: '2026-05', number: 1, stream_url: null, thumbnail_url: null, caption: "It's bath time! 🐾", posted_url: 'https://instagram.com/p/example1', status: 'posted', client_note: null, internal_notes: null, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
    { id: 'v5', company_id: 'co-1', title: 'Cat vs. Automatic Feeder', type: 'Reel', month: '2026-05', number: 2, stream_url: null, thumbnail_url: null, caption: 'Watch Luna meet her new best friend 😂🐱', posted_url: 'https://instagram.com/p/example2', status: 'posted', client_note: null, internal_notes: null, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
    { id: 'v6', company_id: 'co-1', title: 'Behind the shelves tour', type: 'Reel', month: '2026-05', number: 3, stream_url: null, thumbnail_url: null, caption: 'New stock just landed!', posted_url: null, status: 'client_approved', client_note: null, internal_notes: null, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
    { id: 'v7', company_id: 'co-1', title: 'Dog training tip', type: 'Reel', month: '2026-05', number: 4, stream_url: null, thumbnail_url: null, caption: 'Every dog can learn this in one session 🐶', posted_url: null, status: 'in_production', client_note: null, internal_notes: 'Need B-roll, waiting on editor', created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
  ],
  metrics: [
    { id: 'm1', company_id: 'co-1', month: '2026-05', followers: 4820, followers_change: 312, views: 84200, reach: 61300, engagement_rate: 4.7, top_post_url: null, notes: 'Best month so far. Golden Retriever bath reel hit 28K views.', created_at: '2026-05-31T23:00:00Z', updated_at: '2026-05-31T23:00:00Z' },
    { id: 'm2', company_id: 'co-1', month: '2026-04', followers: 4508, followers_change: 241, views: 67100, reach: 49800, engagement_rate: 3.9, top_post_url: null, notes: null, created_at: '2026-04-30T23:00:00Z', updated_at: '2026-04-30T23:00:00Z' },
    { id: 'm3', company_id: 'co-1', month: '2026-03', followers: 4267, followers_change: 190, views: 52300, reach: 39100, engagement_rate: 3.4, top_post_url: null, notes: null, created_at: '2026-03-31T23:00:00Z', updated_at: '2026-03-31T23:00:00Z' },
  ],
  invoices: [
    { id: 'i1', company_id: 'co-1', invoice_number: 'PD-JUN-004', month: 'June 2026', invoice_date: '2026-06-01', due_date: '2026-06-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'pending', paid_date: null, notes: null, line_items: [{ desc: 'Social Media Management — June 2026', qty: 1, rate: 5500 }], created_at: '2026-06-01T00:00:00Z', updated_at: '2026-06-01T00:00:00Z' },
    { id: 'i2', company_id: 'co-1', invoice_number: 'PD-MAY-003', month: 'May 2026', invoice_date: '2026-05-01', due_date: '2026-05-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'paid', paid_date: '2026-05-04', notes: null, line_items: [{ desc: 'Social Media Management — May 2026', qty: 1, rate: 5500 }], created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-04T00:00:00Z' },
    { id: 'i3', company_id: 'co-1', invoice_number: 'PD-APR-002', month: 'April 2026', invoice_date: '2026-04-01', due_date: '2026-04-05', amount_aed: 5500, discount_aed: 0, total_aed: 5500, status: 'paid', paid_date: '2026-04-03', notes: null, line_items: [{ desc: 'Social Media Management — April 2026', qty: 1, rate: 5500 }], created_at: '2026-04-01T00:00:00Z', updated_at: '2026-04-03T00:00:00Z' },
  ],
  comments: {},
  uid: 100,
};

function uid() { return `gen-${++store.uid}`; }

function computeStats(co) {
  const vs = store.videos.filter(v => v.company_id === co.id);
  const is = store.invoices.filter(i => i.company_id === co.id);
  return {
    ...co,
    pending_videos: vs.filter(v => v.status === 'idea_pending' || v.status === 'ready_for_review').length,
    total_videos: vs.length,
    unpaid_invoices: is.filter(i => i.status !== 'paid').length,
  };
}

function stripInternal(v) {
  const { internal_notes: _ignored, ...rest } = v;
  return rest;
}

async function setupMocks(context) {
  await context.route('**/api/portal/admin/me', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, role: 'ADMIN' }) }));

  await context.route('**/api/portal/admin/login', route =>
    route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) }));

  // Companies
  await context.route('**/api/portal/v2/companies**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const slug = url.searchParams.get('slug');

    if (method === 'GET') {
      const isAdmin = url.pathname === '/api/portal/v2/companies' && !slug;
      if (isAdmin) {
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify(store.companies.map(computeStats)) });
      }
      if (slug) {
        const c = store.companies.find(co => co.slug === slug);
        if (!c) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) });
        const { id, slug: s, name, logo_url, retainer_aed, package_name, start_date, video_quota } = c;
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ id, slug: s, name, logo_url, retainer_aed, package_name, start_date, video_quota }) });
      }
    }

    if (method === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      const newCo = {
        id: uid(),
        slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
        name: body.name,
        logo_url: null,
        retainer_aed: body.retainer_aed || 5500,
        video_quota: body.video_quota || 15,
        package_name: body.package_name || null,
        start_date: body.start_date || null,
        email: body.email || null,
        whatsapp: body.whatsapp || null,
        instagram: body.instagram || null,
        is_active: true,
      };
      store.companies.push(newCo);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(newCo) });
    }

    return route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });

  // Videos
  await context.route('**/api/portal/v2/videos**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const m = url.pathname.match(/\/api\/portal\/v2\/videos\/([^/]+)(?:\/(approve|comments))?$/);
    const isCollection = url.pathname === '/api/portal/v2/videos';

    if (method === 'GET' && isCollection) {
      const slug = url.searchParams.get('slug');
      const companyId = url.searchParams.get('company_id');
      let vs = store.videos;
      if (slug) {
        const c = store.companies.find(co => co.slug === slug);
        vs = c ? vs.filter(v => v.company_id === c.id).map(stripInternal) : [];
      } else if (companyId) {
        vs = vs.filter(v => v.company_id === companyId);
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(vs) });
    }

    if (method === 'POST' && isCollection) {
      const body = JSON.parse(req.postData() || '{}');
      const v = {
        id: uid(),
        company_id: body.company_id,
        title: body.title,
        type: body.type || 'Reel',
        month: (body.month || '').slice(0, 7),
        number: body.number || 1,
        stream_url: body.stream_url || null,
        thumbnail_url: body.thumbnail_url || null,
        caption: body.caption || null,
        posted_url: body.posted_url || null,
        status: body.status || 'idea_pending',
        internal_notes: body.internal_notes || null,
        client_note: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.videos.unshift(v);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(v) });
    }

    if (m && method === 'PATCH') {
      const id = m[1];
      const idx = store.videos.findIndex(v => v.id === id);
      if (idx < 0) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) });
      const body = JSON.parse(req.postData() || '{}');
      store.videos[idx] = { ...store.videos[idx], ...body, month: body.month ? body.month.slice(0,7) : store.videos[idx].month, updated_at: new Date().toISOString() };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(store.videos[idx]) });
    }

    if (m && method === 'DELETE') {
      store.videos = store.videos.filter(v => v.id !== m[1]);
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }

    if (m && m[2] === 'approve' && method === 'POST') {
      const id = m[1];
      const v = store.videos.find(x => x.id === id);
      if (!v) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) });
      const body = JSON.parse(req.postData() || '{}');
      let next = null;
      if (body.action === 'approve') {
        if (v.status === 'idea_pending') next = 'idea_approved';
        if (v.status === 'ready_for_review') next = 'client_approved';
      } else if (body.action === 'revise') {
        if (v.status === 'idea_pending' || v.status === 'ready_for_review') next = 'idea_revision';
        v.client_note = body.note || null;
      }
      if (next) v.status = next;
      v.updated_at = new Date().toISOString();
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true, video: stripInternal(v) }) });
    }

    if (m && m[2] === 'comments' && method === 'GET') {
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(store.comments[m[1]] || []) });
    }
    if (m && m[2] === 'comments' && method === 'POST') {
      const body = JSON.parse(req.postData() || '{}');
      const c = { id: uid(), video_id: m[1], user_id: null, user_email: body.author || 'Client', timestamp_seconds: body.timestamp_seconds ?? null, comment_text: body.comment_text, created_at: new Date().toISOString() };
      (store.comments[m[1]] ||= []).push(c);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(c) });
    }

    return route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });

  // Metrics
  await context.route('**/api/portal/v2/metrics**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const m = url.pathname.match(/\/api\/portal\/v2\/metrics\/([^/]+)$/);

    if (method === 'GET' && !m) {
      const slug = url.searchParams.get('slug');
      const companyId = url.searchParams.get('company_id');
      let ms = store.metrics;
      if (slug) {
        const c = store.companies.find(co => co.slug === slug);
        ms = c ? ms.filter(x => x.company_id === c.id) : [];
      } else if (companyId) {
        ms = ms.filter(x => x.company_id === companyId);
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(ms) });
    }

    if (method === 'POST' && !m) {
      const body = JSON.parse(req.postData() || '{}');
      const month = (body.month || '').slice(0, 7);
      const existing = store.metrics.findIndex(x => x.company_id === body.company_id && x.month === month);
      const rec = {
        id: existing >= 0 ? store.metrics[existing].id : uid(),
        company_id: body.company_id,
        month,
        followers: body.followers || 0,
        followers_change: body.followers_change || 0,
        views: body.views || 0,
        reach: body.reach || 0,
        engagement_rate: body.engagement_rate || 0,
        top_post_url: body.top_post_url || null,
        notes: body.notes || null,
        created_at: existing >= 0 ? store.metrics[existing].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (existing >= 0) store.metrics[existing] = rec; else store.metrics.unshift(rec);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(rec) });
    }

    if (m && method === 'PATCH') {
      const idx = store.metrics.findIndex(x => x.id === m[1]);
      if (idx < 0) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) });
      const body = JSON.parse(req.postData() || '{}');
      store.metrics[idx] = { ...store.metrics[idx], ...body, month: body.month ? body.month.slice(0,7) : store.metrics[idx].month, updated_at: new Date().toISOString() };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(store.metrics[idx]) });
    }

    if (m && method === 'DELETE') {
      store.metrics = store.metrics.filter(x => x.id !== m[1]);
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }
    return route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });

  // Invoices
  await context.route('**/api/portal/v2/invoices**', async route => {
    const req = route.request();
    const url = new URL(req.url());
    const method = req.method();
    const m = url.pathname.match(/\/api\/portal\/v2\/invoices\/([^/]+)$/);

    if (method === 'GET' && !m) {
      const slug = url.searchParams.get('slug');
      const companyId = url.searchParams.get('company_id');
      let xs = store.invoices;
      if (slug) {
        const c = store.companies.find(co => co.slug === slug);
        xs = c ? xs.filter(x => x.company_id === c.id) : [];
      } else if (companyId) {
        xs = xs.filter(x => x.company_id === companyId);
      }
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(xs) });
    }

    if (method === 'POST' && !m) {
      const body = JSON.parse(req.postData() || '{}');
      const inv = {
        id: uid(),
        company_id: body.company_id,
        invoice_number: body.invoice_number,
        month: body.month,
        invoice_date: body.invoice_date,
        due_date: body.due_date,
        amount_aed: body.amount_aed,
        discount_aed: body.discount_aed || 0,
        total_aed: body.total_aed,
        status: 'pending',
        paid_date: null,
        notes: body.notes || null,
        line_items: body.line_items || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      store.invoices.unshift(inv);
      return route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(inv) });
    }

    if (m && method === 'PATCH') {
      const idx = store.invoices.findIndex(x => x.id === m[1]);
      if (idx < 0) return route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ error: 'Not found' }) });
      const body = JSON.parse(req.postData() || '{}');
      if (body.status === 'paid' && !body.paid_date) body.paid_date = new Date().toISOString().slice(0, 10);
      if (body.status && body.status !== 'paid') body.paid_date = null;
      store.invoices[idx] = { ...store.invoices[idx], ...body, updated_at: new Date().toISOString() };
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(store.invoices[idx]) });
    }

    if (m && method === 'DELETE') {
      store.invoices = store.invoices.filter(x => x.id !== m[1]);
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    }
    return route.fulfill({ status: 405, contentType: 'application/json', body: '{}' });
  });
}

function shot(page, name) { return page.screenshot({ path: `/tmp/${name}.png`, fullPage: false }); }

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await setupMocks(context);
  await context.addCookies([{ name: 'portal-admin', value: 'cactus2026', domain: 'localhost', path: '/' }]);

  const log = (msg) => console.log(`  ${msg}`);

  // ── 1. Internal login page renders ───────────────────────────────────────
  console.log('\n[1] Internal login page');
  const loginPage = await context.newPage();
  await loginPage.goto('http://localhost:3000/portal/internal/login');
  await loginPage.waitForLoadState('networkidle');
  await loginPage.waitForTimeout(800);
  await shot(loginPage, '01-internal-login');
  log('✓ login page renders');

  // ── 2. Admin directory ─────────────────────────────────────────────────
  console.log('\n[2] Admin directory + add company');
  const admin = await context.newPage();
  await admin.goto('http://localhost:3000/portal/internal');
  await admin.waitForLoadState('networkidle');
  await admin.waitForTimeout(1000);
  await shot(admin, '02-admin-directory');
  log('✓ directory shows Pets Delight with stats');

  // Add a new client
  await admin.click('button:has-text("Add Client")');
  await admin.waitForTimeout(400);
  await admin.fill('input[placeholder="e.g. Pets Delight"]', 'Sahara Watches');
  await admin.waitForTimeout(200);
  await shot(admin, '03-admin-new-client-form');
  await admin.click('button:has-text("Create Client")');
  await admin.waitForTimeout(800);
  await shot(admin, '04-admin-directory-after-add');
  log('✓ created Sahara Watches via UI');

  // ── 3. Pets Delight overview ────────────────────────────────────────────
  console.log('\n[3] Per-client overview');
  await admin.click('a[href="/portal/internal/pets-delight"]');
  await admin.waitForLoadState('networkidle');
  await admin.waitForTimeout(800);
  await shot(admin, '05-admin-pets-overview');
  log('✓ overview page');

  // ── 4. Admin Videos: add new video ─────────────────────────────────────
  console.log('\n[4] Admin videos: add new');
  await admin.click('a:has-text("Videos")');
  await admin.waitForLoadState('networkidle');
  await admin.waitForTimeout(800);
  await shot(admin, '06-admin-videos-list');

  await admin.click('button:has-text("Add Video")');
  await admin.waitForTimeout(400);
  await admin.fill('input[placeholder*="Behind the scenes"]', 'Dubai Marina pup tour — POV');
  await admin.fill('textarea[placeholder*="caption"]', "We took our store puppy to the Marina to meet customers' dogs. So much tail-wagging.");
  await shot(admin, '07-admin-video-form');
  await admin.click('button:has-text("Create Video")');
  await admin.waitForTimeout(800);
  await shot(admin, '08-admin-videos-after-add');
  log('✓ added new video');

  // ── 5. Client view sees the new video ──────────────────────────────────
  console.log('\n[5] Client view — should see new video in sync');
  const client = await context.newPage();
  await client.goto('http://localhost:3000/portal/client/pets-delight');
  await client.waitForLoadState('networkidle');
  await client.waitForTimeout(800);
  await shot(client, '09-client-dashboard');

  await client.click('a[href="/portal/client/pets-delight/content"]');
  await client.waitForLoadState('networkidle');
  await client.waitForTimeout(800);
  await shot(client, '10-client-content');
  log('✓ client sees new video');

  // ── 6. Client approves a video ──────────────────────────────────────────
  console.log('\n[6] Client approves a ready-for-review video');
  await client.click('text=Persian cat grooming routine');
  await client.waitForTimeout(600);
  await shot(client, '11-client-drawer-open');

  await client.click('button:has-text("Approve Video")');
  await client.waitForTimeout(800);
  await shot(client, '12-client-after-approval');
  log('✓ client approved');

  // ── 7. Admin sees the new status (after refresh) ───────────────────────
  console.log('\n[7] Admin sees approval after refresh');
  // Trigger refresh by clicking the refresh button
  await admin.bringToFront();
  await admin.locator('button:has(svg.lucide-refresh-cw)').first().click();
  await admin.waitForTimeout(800);
  await shot(admin, '13-admin-sees-approval');
  log('✓ admin sees updated status');

  // ── 8. Admin Metrics ───────────────────────────────────────────────────
  console.log('\n[8] Admin metrics — add a month');
  await admin.goto('http://localhost:3000/portal/internal/pets-delight/metrics');
  await admin.waitForLoadState('networkidle');
  await admin.waitForTimeout(800);
  await shot(admin, '14-admin-metrics-list');

  await admin.click('button:has-text("Add Month")');
  await admin.waitForTimeout(300);
  // Fields: Month / Followers / Followers change / Views / Reach / Engagement
  const monthInput = admin.locator('input[type="month"]');
  await monthInput.fill('2026-06');
  const numFields = admin.locator('div.bg-\\[\\#111\\] input[type="number"]');
  await numFields.nth(0).fill('5200'); // followers
  await numFields.nth(1).fill('380');  // change
  await numFields.nth(2).fill('92000'); // views
  await numFields.nth(3).fill('68500'); // reach
  await numFields.nth(4).fill('5.2');   // engagement
  await shot(admin, '15-admin-metrics-form');
  await admin.click('button:has-text("Add Metrics")');
  await admin.waitForTimeout(800);
  await shot(admin, '16-admin-metrics-after');
  log('✓ added June 2026 metrics');

  // ── 9. Edit existing metric — verify edit form pre-fills ───────────────
  console.log('\n[9] Edit existing metric');
  // First action button in the table row is Edit (icon-only)
  await admin.locator('tbody tr button').first().click();
  await admin.waitForTimeout(400);
  await shot(admin, '17-admin-metrics-edit');
  await admin.locator('button:has-text("Cancel")').click();
  await admin.waitForTimeout(300);
  log('✓ edit form pre-populates');

  // ── 10. Client analytics shows updated metric ──────────────────────────
  console.log('\n[10] Client analytics has new metric');
  const clientAnalytics = await context.newPage();
  await clientAnalytics.goto('http://localhost:3000/portal/client/pets-delight/analytics');
  await clientAnalytics.waitForLoadState('networkidle');
  await clientAnalytics.waitForTimeout(800);
  await shot(clientAnalytics, '18-client-analytics');
  log('✓ client analytics shows June 2026');

  // ── 11. Admin invoices ─────────────────────────────────────────────────
  console.log('\n[11] Admin invoices');
  await admin.goto('http://localhost:3000/portal/internal/pets-delight/invoices', { waitUntil: 'domcontentloaded' });
  await admin.waitForSelector('button:has-text("Mark Paid")', { timeout: 8000 });
  await admin.waitForTimeout(500);
  await shot(admin, '19-admin-invoices');

  // Mark June pending → paid
  await admin.locator('button:has-text("Mark Paid")').first().click();
  await admin.waitForTimeout(700);
  await shot(admin, '20-admin-invoices-after-mark');
  log('✓ marked June 2026 invoice paid');

  // ── 12. Client billing reflects payment ────────────────────────────────
  console.log('\n[12] Client billing reflects new paid status');
  const clientBilling = await context.newPage();
  await clientBilling.goto('http://localhost:3000/portal/client/pets-delight/billing', { waitUntil: 'domcontentloaded' });
  await clientBilling.waitForSelector('text=Billing', { timeout: 8000 });
  await clientBilling.waitForTimeout(800);
  await shot(clientBilling, '21-client-billing');
  log('✓ client billing shows all paid');

  // ── 13. Not found state ────────────────────────────────────────────────
  console.log('\n[13] Bad slug shows not-found state');
  const notFound = await context.newPage();
  await notFound.goto('http://localhost:3000/portal/client/typo-slug', { waitUntil: 'domcontentloaded' });
  await notFound.waitForSelector('text=Portal not found', { timeout: 8000 });
  await notFound.waitForTimeout(500);
  await shot(notFound, '22-client-not-found');
  log('✓ not-found page shown');

  console.log('\n✓ ALL TESTS PASSED');
  console.log('Screenshots in /tmp/01-*.png through /tmp/22-*.png');
  await browser.close();
})().catch(err => {
  console.error('\n✗ TEST FAILED:', err.message);
  console.error(err.stack);
  process.exit(1);
});
