# Navigation Restructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the static site into Landing (all modules, filterable) → Module landing (all chapters, filterable) → Chapter view, renaming Module 01 to Module 00 — LLM Fundamentals and keeping Module A1 as the auxiliary track.

**Architecture:** Pure static HTML in `docs/` (GitHub Pages). The 8 fundamentals pages move to `docs/fundamentals/`. One shared vanilla-JS file (`docs/site.js`) powers single-active-chip filtering on all three index pages via `data-tags` attributes. Progressive enhancement: filter bars ship with the `hidden` attribute; JS un-hides them, so no-JS visitors see everything.

**Tech Stack:** Hand-written HTML/CSS, vanilla JS, no build step, no dependencies.

## Global Constraints

- Site style: existing `docs/style.css` variables and conventions (mono font, `--blue`, hairline `1px solid var(--line)` borders). New CSS appends to this file.
- Chapter page *content* (figures, prose, pagers) must not change — only head/header/crumb boilerplate.
- Old root URLs for the 8 fundamentals pages break deliberately; no redirect stubs.
- Module labels: `Module 00 — LLM Fundamentals` (core), `Module A1 — AI Plugins & Marketplaces` (auxiliary). Crumb strings: `Module 00 / Concept NN`.
- Platform: macOS/BSD sed — use `sed -i ''`.
- Branch: work happens on `nav-restructure` (already created from `dev`).
- Commit message style: `type(scope): summary` matching repo history, with the Claude co-author trailer.

## Link-Check Command (used by several tasks)

Run from the repo root. This is the site's "test suite" — it verifies every relative `href`/`src` in `docs/` resolves to an existing file.

```bash
python3 - <<'EOF'
import re, pathlib, sys
bad = []
for f in pathlib.Path('docs').rglob('*.html'):
    for m in re.findall(r'(?:href|src)="([^"#]+)"', f.read_text()):
        if m.startswith(('http', 'mailto', 'data:')): continue
        if not (f.parent / m.split('#')[0]).resolve().exists(): bad.append(f"{f}: {m}")
print('\n'.join(bad) or 'LINKS OK')
sys.exit(1 if bad else 0)
EOF
```

Expected when passing: `LINKS OK`, exit 0.

---

### Task 1: Filter infrastructure — CSS additions and site.js

**Files:**
- Modify: `docs/style.css` (append at end, after the `@media (prefers-reduced-motion...)` line)
- Create: `docs/site.js`

**Interfaces:**
- Produces: CSS classes `.filters`, `.chip`, `.chip.on`, `.ref .tags`, `.track-hd`, `.track-section` and the `site.js` behavior contract used by Tasks 2–3: a page has at most one `<div class="filters" hidden>` containing `<button class="chip" data-filter="TAG">` buttons (one with `data-filter="all"` and class `on`); filterable cards are any element with `data-tags="tag1 tag2"`; optional `.track-section` wrappers auto-hide when all their cards are hidden. Cards without `data-tags` (the deck card) are never hidden.

- [ ] **Step 1: Append filter styles to `docs/style.css`**

```css

/* filter chips + card tags */
.filters{display:flex;flex-wrap:wrap;gap:8px;margin:0 28px 24px;}
.chip{font-family:var(--mono);font-size:.62rem;letter-spacing:.16em;
  text-transform:uppercase;background:none;border:1px solid var(--line);
  color:var(--muted);padding:6px 12px;cursor:pointer;}
.chip:hover{border-color:var(--blue-deep);color:var(--blue);}
.chip.on{border-color:var(--blue);color:var(--blue);}
.chip:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
.ref .tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;}
.ref .tags span{font-family:var(--mono);font-size:.58rem;letter-spacing:.14em;
  text-transform:uppercase;color:var(--faint);border:1px solid var(--line);padding:2px 7px;}

/* landing track sections */
.track-hd{margin:0 28px 12px;font-family:var(--mono);font-size:.68rem;
  letter-spacing:.22em;color:var(--faint);text-transform:uppercase;}
.track-hd b{color:var(--blue);}
```

- [ ] **Step 2: Create `docs/site.js`**

```js
// single-active-chip filtering; cards opt in via data-tags. No-JS: bar stays hidden, all cards visible.
const bar = document.querySelector('.filters');
if (bar) {
  bar.hidden = false;
  const cards = Array.from(document.querySelectorAll('[data-tags]'));
  const sections = Array.from(document.querySelectorAll('.track-section'));
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    bar.querySelectorAll('[data-filter]').forEach((b) => b.classList.toggle('on', b === btn));
    const f = btn.dataset.filter;
    cards.forEach((c) => {
      c.style.display = f === 'all' || c.dataset.tags.split(' ').includes(f) ? '' : 'none';
    });
    sections.forEach((s) => {
      s.style.display = cards.some((c) => s.contains(c) && c.style.display !== 'none') ? '' : 'none';
    });
  });
}
```

- [ ] **Step 3: Verify JS parses**

Run: `node --check docs/site.js`
Expected: no output, exit 0.

- [ ] **Step 4: Commit**

```bash
git add docs/style.css docs/site.js
git commit -m "feat(nav): filter chip styles and shared site.js

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Move fundamentals into `docs/fundamentals/`, build its module index, rebuild the landing page

**Files:**
- Move: `docs/01-what-is-an-llm.html` … `docs/08-scaling-laws-and-model-sizes.html` → `docs/fundamentals/`
- Create: `docs/fundamentals/index.html`
- Modify (rewrite): `docs/index.html`

**Interfaces:**
- Consumes: `.filters`/`.chip`/`.tags`/`.track-hd` CSS and `site.js` contract from Task 1.
- Produces: `docs/fundamentals/index.html` (Module 00 landing) and final `docs/index.html` — Task 3's plugins pages link to `../fundamentals/index.html`.

- [ ] **Step 1: Move the 8 chapter pages**

```bash
mkdir -p docs/fundamentals
git mv docs/0[1-8]-*.html docs/fundamentals/
```

- [ ] **Step 2: Fix boilerplate in the moved pages**

Each moved page needs exactly four mechanical changes (stylesheet path, brand link, nav index label, crumb). Sibling nav/pager links are untouched — the files moved together.

```bash
sed -i '' \
  -e 's|href="style.css"|href="../style.css"|' \
  -e 's|class="brand" href="index.html"|class="brand" href="../index.html"|' \
  -e 's|<a href="index.html">Index</a>|<a href="index.html">00 Index</a>|' \
  -e 's|Module 01 /|Module 00 /|' \
  docs/fundamentals/0[1-8]-*.html
```

Verify: `grep -L '\.\./style.css' docs/fundamentals/0[1-8]-*.html` prints nothing, and `grep -rn "Module 01" docs/fundamentals/` prints nothing.

- [ ] **Step 3: Create `docs/fundamentals/index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Module 00 · LLM Fundamentals — llm::intuition</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<div class="grid-bg"></div>
<header class="site-header">
  <a class="brand" href="../index.html"><b>▚</b> LLM<b>::</b>INTUITION</a>
  <nav>
    <a href="index.html" class="on">00 Index</a>
    <a href="01-what-is-an-llm.html">01</a>
    <a href="02-tokens-and-tokenization.html">02</a>
    <a href="03-embeddings.html">03</a>
    <a href="04-attention-and-transformers.html">04</a>
    <a href="05-context-window.html">05</a>
    <a href="06-sampling.html">06</a>
    <a href="07-how-models-are-trained.html">07</a>
    <a href="08-scaling-laws-and-model-sizes.html">08</a>
  </nav>
</header>
<main>
  <div class="hero">
    <span class="crumb">Module 00 / LLM Fundamentals</span>
    <h1>LLM <span class="hl">Fundamentals</span></h1>
    <p class="sub">How large language models actually work — one concept at a time, from tokens to scaling laws. Built for engineers who use LLMs and want to stop guessing.</p>
    <div class="meta"><span>8 concepts</span><span>Core track</span><span>No prerequisites</span></div>
  </div>

  <div class="filters" hidden>
    <button class="chip on" data-filter="all">All</button>
    <button class="chip" data-filter="tokens">Tokens</button>
    <button class="chip" data-filter="embeddings">Embeddings</button>
    <button class="chip" data-filter="attention">Attention</button>
    <button class="chip" data-filter="training">Training</button>
    <button class="chip" data-filter="inference">Inference</button>
    <button class="chip" data-filter="scaling">Scaling</button>
  </div>

  <div class="refs">
    <a class="ref" href="01-what-is-an-llm.html" data-tags="inference training"><span class="src">CONCEPT 01</span><span class="t">What is an LLM — one operation, repeated</span><span class="tags"><span>inference</span><span>training</span></span></a>
    <a class="ref" href="02-tokens-and-tokenization.html" data-tags="tokens"><span class="src">CONCEPT 02</span><span class="t">Tokens &amp; Tokenization — the model never sees words</span><span class="tags"><span>tokens</span></span></a>
    <a class="ref" href="03-embeddings.html" data-tags="embeddings tokens"><span class="src">CONCEPT 03</span><span class="t">Embeddings — distance is meaning</span><span class="tags"><span>embeddings</span><span>tokens</span></span></a>
    <a class="ref" href="04-attention-and-transformers.html" data-tags="attention"><span class="src">CONCEPT 04</span><span class="t">Attention &amp; Transformers — every token interrogates the past</span><span class="tags"><span>attention</span></span></a>
    <a class="ref" href="05-context-window.html" data-tags="tokens inference"><span class="src">CONCEPT 05</span><span class="t">Context Window — no memory, only a window</span><span class="tags"><span>tokens</span><span>inference</span></span></a>
    <a class="ref" href="06-sampling.html" data-tags="inference"><span class="src">CONCEPT 06</span><span class="t">Sampling — weighted dice, two knobs</span><span class="tags"><span>inference</span></span></a>
    <a class="ref" href="07-how-models-are-trained.html" data-tags="training"><span class="src">CONCEPT 07</span><span class="t">How Models Are Trained — capability, format, preference</span><span class="tags"><span>training</span></span></a>
    <a class="ref" href="08-scaling-laws-and-model-sizes.html" data-tags="scaling training"><span class="src">CONCEPT 08</span><span class="t">Scaling Laws &amp; Model Sizes — the curves labs bet billions on</span><span class="tags"><span>scaling</span><span>training</span></span></a>
  </div>

  <div class="panel-ft">BUILT WHILE LEARNING · SOURCES: ANTHROPIC / OPENAI / GOOGLE / META / KARPATHY / 3BLUE1BROWN</div>
</main>
<script src="../site.js"></script>
</body>
</html>
```

- [ ] **Step 4: Rewrite `docs/index.html` as the pure landing page**

Full replacement content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LLM Intuition</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="grid-bg"></div>
<header class="site-header">
  <a class="brand" href="index.html"><b>▚</b> LLM<b>::</b>INTUITION</a>
  <nav>
    <a href="index.html" class="on">Index</a>
    <a href="fundamentals/index.html">Module 00</a>
    <a href="plugins/index.html">Module A1</a>
  </nav>
</header>
<main>
  <div class="hero">
    <span class="crumb">Learning tracks</span>
    <h1>LLM <span class="hl">Intuition</span></h1>
    <p class="sub">How LLMs actually work, and how to build on top of them — module by module, one concept at a time. Built for engineers who use LLMs and want to stop guessing.</p>
    <div class="meta"><span>2 modules</span><span>18 concepts</span><span>1 deck</span></div>
  </div>

  <div class="filters" hidden>
    <button class="chip on" data-filter="all">All</button>
    <button class="chip" data-filter="core">Core</button>
    <button class="chip" data-filter="aux">Auxiliary</button>
    <button class="chip" data-filter="training">Training</button>
    <button class="chip" data-filter="inference">Inference</button>
    <button class="chip" data-filter="plugins">Plugins</button>
    <button class="chip" data-filter="mcp">MCP</button>
    <button class="chip" data-filter="agents">Agents</button>
  </div>

  <div class="track-section">
    <div class="track-hd"><b>▸</b> Core track — the main learning path</div>
    <div class="refs">
      <a class="ref" href="fundamentals/index.html" data-tags="core tokens embeddings attention training inference scaling"><span class="src">MODULE 00 · CORE</span><span class="t">LLM Fundamentals — how models actually work, from tokens to scaling laws · 8 concepts</span><span class="tags"><span>tokens</span><span>attention</span><span>training</span><span>inference</span><span>scaling</span></span></a>
    </div>
  </div>

  <div class="track-section">
    <div class="track-hd"><b>▸</b> Auxiliary track — branches off the core path</div>
    <div class="refs">
      <a class="ref" href="plugins/index.html" data-tags="aux marketplace plugins mcp skills agents hooks copilot"><span class="src">MODULE A1 · AUX</span><span class="t">AI Plugins &amp; Marketplaces — skills, agents, MCP, hooks: use them, build them, ship them · 10 concepts + deck</span><span class="tags"><span>plugins</span><span>mcp</span><span>skills</span><span>agents</span><span>hooks</span></span></a>
    </div>
  </div>

  <div class="panel-ft">BUILT WHILE LEARNING · SOURCES: ANTHROPIC / OPENAI / GOOGLE / META / KARPATHY / 3BLUE1BROWN</div>
</main>
<script src="site.js"></script>
</body>
</html>
```

- [ ] **Step 5: Run the link check** (command in header)

Expected: `LINKS OK` (the primer's `../index.html` cross-link still resolves to the landing page; Task 3 retargets it to fundamentals). If anything prints, a nav/pager link was missed in the sed — fix before committing.

- [ ] **Step 6: Commit**

```bash
git add -A docs/index.html docs/fundamentals
git commit -m "feat(nav): Module 00 fundamentals directory + pure landing page

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Upgrade the plugins module index; fix the primer cross-link

**Files:**
- Modify: `docs/plugins/index.html`
- Modify: `docs/plugins/00-primer.html:69`

**Interfaces:**
- Consumes: `site.js` contract and CSS from Task 1; `../fundamentals/index.html` from Task 2.

- [ ] **Step 1: Add filter bar, tags, and script to `docs/plugins/index.html`**

Insert the filter bar between the closing `</div>` of `.hero` and the opening `<div class="refs">`:

```html
  <div class="filters" hidden>
    <button class="chip on" data-filter="all">All</button>
    <button class="chip" data-filter="marketplace">Marketplace</button>
    <button class="chip" data-filter="plugins">Plugins</button>
    <button class="chip" data-filter="mcp">MCP</button>
    <button class="chip" data-filter="skills">Skills</button>
    <button class="chip" data-filter="agents">Agents</button>
    <button class="chip" data-filter="hooks">Hooks</button>
    <button class="chip" data-filter="copilot">Copilot</button>
  </div>
```

Replace the eleven `.ref` anchors with tagged versions (the deck card gets NO `data-tags` and no `.tags` — it stays visible under every filter):

```html
    <a class="ref" href="00-primer.html" data-tags="plugins mcp skills"><span class="src">CONCEPT 00</span><span class="t">The 15-Minute Primer — four ideas, fifteen minutes</span><span class="tags"><span>plugins</span><span>mcp</span><span>skills</span></span></a>
    <a class="ref" href="01-marketplaces.html" data-tags="marketplace plugins"><span class="src">CONCEPT 01</span><span class="t">Plugin Marketplaces — a catalog, not a store</span><span class="tags"><span>marketplace</span><span>plugins</span></span></a>
    <a class="ref" href="02-plugins.html" data-tags="plugins"><span class="src">CONCEPT 02</span><span class="t">Plugins: The Container — a directory with a manifest</span><span class="tags"><span>plugins</span></span></a>
    <a class="ref" href="03-mcp-servers.html" data-tags="mcp"><span class="src">CONCEPT 03</span><span class="t">MCP Servers — one protocol, every assistant</span><span class="tags"><span>mcp</span></span></a>
    <a class="ref" href="04-skills.html" data-tags="skills"><span class="src">CONCEPT 04</span><span class="t">Skills — the description is the API</span><span class="tags"><span>skills</span></span></a>
    <a class="ref" href="05-agents.html" data-tags="agents"><span class="src">CONCEPT 05</span><span class="t">Agents &amp; Subagents — a job description in markdown</span><span class="tags"><span>agents</span></span></a>
    <a class="ref" href="06-hooks-and-commands.html" data-tags="hooks"><span class="src">CONCEPT 06</span><span class="t">Hooks &amp; Commands — suggestions vs. guarantees</span><span class="tags"><span>hooks</span></span></a>
    <a class="ref" href="07-building-a-plugin.html" data-tags="plugins marketplace"><span class="src">CONCEPT 07</span><span class="t">Building &amp; Publishing a Plugin — empty directory to installed plugin</span><span class="tags"><span>plugins</span><span>marketplace</span></span></a>
    <a class="ref" href="08-claude-copilot-compat.html" data-tags="copilot plugins"><span class="src">CONCEPT 08</span><span class="t">Claude ↔ Copilot Compatibility — what ports, what doesn't</span><span class="tags"><span>copilot</span><span>plugins</span></span></a>
    <a class="ref" href="09-which-one-when.html" data-tags="mcp skills agents hooks"><span class="src">CONCEPT 09</span><span class="t">Which One, When — start from the failure mode</span><span class="tags"><span>mcp</span><span>skills</span><span>agents</span><span>hooks</span></span></a>
    <a class="ref deck" href="deck.html"><span class="src">PRESENTATION</span><span class="t">The 45-minute deck — all ten concepts, live</span></a>
```

Add before `</body>`:

```html
<script src="../site.js"></script>
```

Also update the meta line in the hero to mark the track:

```html
    <div class="meta"><span>10 concepts</span><span>1 deck</span><span>Auxiliary track</span><span>Prereq: none (00 is the primer)</span></div>
```

- [ ] **Step 2: Fix the primer's cross-link to fundamentals**

In `docs/plugins/00-primer.html` line 69, replace:

```html
    <a class="ref" href="../index.html"><span class="src">Module 01</span><span class="t">Module 01 — the full fundamentals</span></a>
```

with:

```html
    <a class="ref" href="../fundamentals/index.html"><span class="src">Module 00</span><span class="t">Module 00 — the full LLM fundamentals</span></a>
```

- [ ] **Step 3: Run the link check** (command in header)

Expected: `LINKS OK`. Also run `grep -rn "Module 01" docs/ --include='*.html'` — expected: no output.

- [ ] **Step 4: Commit**

```bash
git add docs/plugins/index.html docs/plugins/00-primer.html
git commit -m "feat(nav): filterable A1 index, Module 00 cross-link fix

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: End-to-end verification

**Files:** none created — browser + link-check pass only.

- [ ] **Step 1: Full link check** (command in header). Expected: `LINKS OK`.

- [ ] **Step 2: Serve locally and walk the three levels in a browser**

```bash
python3 -m http.server 8888 --directory docs
```

Verify at `http://localhost:8888/`:
1. Landing shows both track sections; filter bar visible (JS ran); clicking `Core` hides the A1 section entirely (card AND its track header); `Aux` hides Module 00; `MCP` shows only A1; `All` restores.
2. Click Module 00 card → `fundamentals/index.html`: crumb reads "Module 00 / LLM Fundamentals", 8 chapter cards with tag chips; `Tokens` filter shows concepts 02, 03, 05 only.
3. Click a chapter → figures render, styles load, brand returns to landing, "00 Index" returns to module index, pager works.
4. Back to landing → Module A1 → `Skills` filter shows concepts 00, 04, 09 plus the deck card (deck is never filtered).
5. Crumbs on chapter pages read `Module 00 / Concept NN`.

- [ ] **Step 3: No-JS pass**

Disable JavaScript (DevTools → Command Menu → "Disable JavaScript"), reload all three index pages. Expected: filter bars invisible (`hidden` attribute), every card visible, all links work.

- [ ] **Step 4: Final grep sweep**

```bash
grep -rn "Module 01" docs/ --include='*.html'   # expected: no output
ls docs/*.html                                   # expected: only docs/index.html
```

No commit needed if all pass (Tasks 1–3 committed their work). If any check fails, fix and amend/commit on `nav-restructure`.
