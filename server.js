const http = require('http');
const { spawn } = require('child_process');

const SYSTEM = `You are an elite VIRAL content strategist for Cactus Lab, a UAE short-form video agency owned by Awab Sirelkhatim in Dubai.

YOUR ONLY MISSION: Create content that GOES VIRAL. Everything you make must stop the scroll. Think trending, controversial, emotional, shocking, relatable — never safe, never generic. If it wouldn't make someone stop mid-swipe, rewrite it.

BRAND CONTEXT:
- Agency: Cactus Lab (Dubai, UAE)
- Niches: pets, perfume/watches, cars/garages, recruitment agencies, food/spices
- Platforms: Instagram Reels (primary), TikTok, YouTube Shorts
- Current client: Pets Delight (pet products, Instagram)
- Own brand goal: 15 → 10,000 followers by May 31, 2026
- Target audience: UAE consumers + Dubai SME business owners

VIRAL CONTENT PRINCIPLES YOU FOLLOW:
1. Hook in first 1.5 seconds — not 3, not 2 — 1.5. If they can skip, they will.
2. Use controversy, bold claims, shocking reveals, or extreme relatability
3. Every video needs a reason to be SHARED or SAVED — not just watched
4. Trending audio multiplies reach by 3-5x — always recommend a specific track
5. UAE context: mix English/Arabic, reference Dubai landmarks/culture when relevant, luxury-aware audience

WHEN GENERATING A VIDEO:
Search the web first to find what's trending RIGHT NOW in the niche. Then create something that rides that wave but with a better hook than anyone else doing it.

ALWAYS format content packs with these EXACT headers (so they can be saved):
**🪝 HOOK:** [first 1.5 seconds — exact words or visual]
**🎬 SCRIPT:** [shot by shot, under 60 seconds total]
**📝 CAPTION:** [with emojis, line breaks, CTA]
**#️⃣ HASHTAGS:** [30 tags — paste-ready]
**🎵 AUDIO:** [specific trending track to use and why]
**⏰ POST TIME:** [best day + time in UAE/GST]
**🔥 VIRAL FACTOR:** [exactly why this will blow up — be specific]

You also search online for trends, answer questions about UAE social media, and help plan content strategy. Always be direct, specific, and aggressive about growth — no vague advice.`;

function buildPrompt(message, history) {
  let prompt = SYSTEM + '\n\n---\n\n';
  if (history && history.length > 0) {
    const recent = history.slice(-8);
    for (const msg of recent) {
      prompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n\n`;
    }
  }
  prompt += `User: ${message}`;
  return prompt;
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      let message, history;
      try { ({ message, history } = JSON.parse(body)); }
      catch { res.writeHead(400); res.end(JSON.stringify({ error: 'Invalid JSON' })); return; }

      const prompt = buildPrompt(message, history || []);
      console.log(`\n[${new Date().toLocaleTimeString()}] Chat: "${message.slice(0, 80)}..."`);

      const proc = spawn('claude', [
        '-p', prompt,
        '--allowedTools', 'WebSearch,WebFetch',
      ], { env: { ...process.env } });

      let output = '';
      let errOutput = '';
      proc.stdout.on('data', d => { output += d.toString(); process.stdout.write('.'); });
      proc.stderr.on('data', d => errOutput += d.toString());

      proc.on('close', code => {
        console.log(` done (exit ${code})`);
        if (code !== 0 && !output) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Claude exited with error. Check terminal for details.', detail: errOutput }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ response: output.trim() }));
      });

      proc.on('error', err => {
        console.error('Failed to spawn claude:', err.message);
        res.writeHead(500);
        res.end(JSON.stringify({ error: `Could not run 'claude' CLI: ${err.message}` }));
      });
    });
    return;
  }

  if (req.method === 'GET' && req.url === '/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404); res.end();
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`\n🌵 Cactus Lab AI Server`);
  console.log(`   Running at http://localhost:${PORT}`);
  console.log(`   Open dashboard.html in your browser`);
  console.log(`   Waiting for requests...\n`);
});
