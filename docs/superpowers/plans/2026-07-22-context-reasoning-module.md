# Module 01: Context & Reasoning — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Module 01 of llm-intuition: 5 deep-dive concept pages (tokenization, context window, attention curve, prompt roles, reasoning) each with a research dump + study note + interactive HTML page, plus a 17-slide interactive capstone deck — following the exact pattern Module 00 and Module A1 established.

**Architecture:** Plain static site, same conventions as the rest of the repo. One shared stylesheet (`docs/style.css`, already exists, not modified structurally). Each concept page carries its own inline `<script>` for its single interactive figure. The deck is one HTML file with a shared `<style>`/`<script>` skeleton (copied from `docs/plugins/deck.html`) plus 17 `<section class="slide">` blocks. No frameworks, no build tooling, no new dependencies.

**Tech Stack:** HTML5, CSS3, vanilla ES6 JS, GitHub Pages (serves `docs/` from `main`).

## Global Constraints

- No external JS/CSS dependencies, no CDN links, no fetch calls at runtime. YouTube `<iframe>` embeds are the only external resource allowed.
- Reuse `docs/style.css` as-is — no new global classes needed; concept pages use the existing `.hero/.panel/.prose/.refs/.pager/.tk/.btn` vocabulary, the deck reuses `.slide/.steps/.pick/.tree` conventions from `docs/plugins/deck.html`.
- Sharp corners everywhere — no `border-radius`. Dark ground `#0a0c0e`, panel `#0d1013`, border `#263039`, blues `#0068B5`/`#00C7FD`, mono headlines/labels, sans body prose (see `docs/style.css` `:root` for exact values — do not redefine).
- Every page/slide must be readable with JS disabled (figures/interactives show a sensible static initial state; `<details>`-based interactives are readable open or closed).
- All internal links relative, no leading `/`.
- Notes are written for a software developer with zero ML background, in your own thorough prose (target 1,500–2,500 words), each with a "Pro vs. amateur" section and a "References" section with real URLs.
- **Research-first rule:** every concept task starts with the Research protocol below. Notes and pages may only state facts traceable to that concept's `research/context-reasoning/NN-*.md` dump. Quote audits run **both directions** — note/page → dump, and dump → live re-fetch (WebFetch's summarizer has fabricated "verbatim" quotes before; this was only caught by live re-fetching in Module 00).
- Work happens on branch `context-reasoning-module`, branched from `main`. Commit after every task. Branch flow at publish time: feature branch → `dev` → `main`, then push (do not merge straight to `main`).
- Interactive figures use precomputed/toy data embedded in the page. Anything illustrative (not a real BPE run, not real attention weights) is labeled as such on the page/slide.
- Deck slides with custom controls (buttons, inputs, textareas, SVG) must be excluded from the deck's click-to-advance handler — see Task 7's script for the exact selector.

## Research protocol (applies to every concept task)

Before writing the note, create/extend `research/context-reasoning/NN-<same-stem-as-note>.md`:

1. Fetch **every** reference URL listed in the task (WebFetch; for videos, fetch the video page for title/author/date and note the key claims relied on). If a fetch fails, find a same-organization/author replacement and update the task's reference list.
2. For each source, append a block:

```markdown
## [S1] Title of source
- **URL:** https://…
- **Fetched:** YYYY-MM-DD
- **Type:** paper | docs | video | post

### Extracted
- Key claim / number / definition — quote directly (verbatim) where the wording matters.
```

3. Tasks 3 and 4 (context window, attention curve) start from the **existing** `research/05-context-window.md` and `research/04-attention-and-transformers.md` dumps — copy the relevant `[S]` blocks forward into the new `research/context-reasoning/NN-*.md` file rather than re-fetching facts already sourced there, then add new sources for the new ground each task covers.
4. While drafting the note, tag every load-bearing fact with its source id (`[S1]`) inline. A fact with no tag either gets a source added or gets cut.
5. **Quote audit before commit:** for every verbatim-quoted string in the dump, re-fetch the live URL as raw text and confirm the quote is an exact substring (normalize curly/straight quotes). Fix or remove any quote that doesn't match.
6. Commit the dump together with the note and page: `git add research/context-reasoning/NN-*.md notes/context-reasoning/NN-*.md docs/context-reasoning/NN-*.html`.

## Verification commands

No test framework for a static site. Each task uses:

1. `open docs/context-reasoning/<page>.html` (or `docs/context-reasoning/deck.html`) — visual check: layout renders, figure/interactive works, DevTools console shows zero errors.
2. Link check (run from repo root; passes silently, exit 0, when all internal hrefs resolve):

```bash
python3 - <<'EOF'
import re, pathlib, sys
docs = pathlib.Path("docs")
bad = []
for f in list(docs.glob("*.html")) + list(docs.glob("*/*.html")):
    for href in re.findall(r'href="([^"#]+)"', f.read_text()):
        if href.startswith(("http", "mailto")): continue
        target = (f.parent / href).resolve()
        if not target.exists(): bad.append(f"{f} -> {href}")
print("\n".join(bad)); sys.exit(1 if bad else 0)
EOF
```

---

### Task 0: Branch setup

**Files:** none (repo operation)

- [ ] **Step 1:** `git checkout main && git pull && git checkout -b context-reasoning-module`
- [ ] **Step 2: Verify** — `git status` shows clean tree on new branch, `git log -1` matches `main`'s tip.

---

### Task 1: Directories + concept-page template

**Files:**
- Create: `docs/context-reasoning/_template.html` (working reference copy; deleted in Task 13)
- Create: `research/context-reasoning/.gitkeep`, `notes/context-reasoning/.gitkeep` (removed once first real file lands in each dir — git doesn't track empty dirs, so skip this if you create Task 2's files in the same commit; only add `.gitkeep` if Task 2 isn't starting immediately)

**Interfaces:**
- Produces: the skeleton every concept page copies. Full 5-page + deck nav baked in from the start (all names are already fixed by the design spec).

- [ ] **Step 1: Write `docs/context-reasoning/_template.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NN · Concept Title — llm::intuition</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<div class="grid-bg"></div>
<header class="site-header">
  <a class="brand" href="../index.html"><b>▚</b> LLM<b>::</b>INTUITION</a>
  <nav>
    <a href="index.html">01 Index</a>
    <a href="01-tokenization-deep.html">01</a>
    <a href="02-context-window.html">02</a>
    <a href="03-attention-curve.html">03</a>
    <a href="04-prompt-roles.html">04</a>
    <a href="05-reasoning.html">05</a>
    <a href="deck.html">Deck</a>
  </nav>
</header>
<main>
  <div class="hero">
    <span class="crumb">Module 01 / Concept NN</span>
    <h1>Concept <span class="hl">Title</span></h1>
    <p class="sub">One-paragraph subtitle.</p>
    <div class="meta"><span>Read <b>X min</b></span><span>Level <b>Intermediate</b></span><span>Prereq <b>Module 00</b></span></div>
  </div>

  <div class="panel">
    <div class="panel-hd"><span><span class="dot">●</span> FIGURE NAME / INTERACTIVE</span><span>LABEL</span></div>
    <div class="panel-body" id="fig"><!-- figure markup --></div>
    <div class="panel-ft" id="fig-ft">STATUS LINE</div>
  </div>

  <div class="prose">
    <h2>Section</h2>
    <p>…</p>
    <h2>Pro vs. amateur</h2>
    <p>…</p>
  </div>

  <div class="refs">
    <a class="ref" href="URL"><span class="src">Paper · Org</span><span class="t">Title</span></a>
  </div>

  <nav class="pager">
    <a class="prev" href="PREV.html">← NN-1 · Prev Title</a>
    <a class="next" href="NEXT.html">NN+1 · Next Title →</a>
  </nav>
</main>
<script>
/* figure JS */
</script>
</body>
</html>
```

For page 01, pager prev slot is `<span class="gap"></span>`; for page 05, pager next slot is `<a class="next" href="deck.html">Deck · Context & Reasoning →</a>`.

- [ ] **Step 2: Verify** — `open docs/context-reasoning/_template.html`: dark ground, blue grid, mono headline, panel with glow, pager render. Nav links 404 until later tasks — expected.
- [ ] **Step 3: Commit** — `git add docs/context-reasoning/_template.html && git commit -m "feat: module 01 page template"`

---

### Task 2: Concept 01 — Tokenization, deeper (research + note + page) — PATTERN VALIDATOR

**Files:**
- Create: `research/context-reasoning/01-tokenization-deep.md` (per Research protocol)
- Create: `notes/context-reasoning/01-tokenization-deep.md`
- Create: `docs/context-reasoning/01-tokenization-deep.html`

**Interfaces:**
- Consumes: `docs/context-reasoning/_template.html` skeleton, `.tk` classes from `docs/style.css`.
- Produces: the content-depth and figure-style exemplar the other 4 concept tasks imitate. **STOP after this task for user review.**

- [ ] **Step 1: Research** — fetch and dump:
  - Karpathy — "Let's build the GPT Tokenizer": `https://www.youtube.com/watch?v=zduSFxRajkE` (already partially covered by `research/02-tokens-and-tokenization.md` — copy its `[S]` block forward)
  - Hugging Face — Chat templates: `https://huggingface.co/docs/transformers/chat_templating` (new — covers how role tokens get inserted)
  - BPE paper (Sennrich 2015): `https://arxiv.org/abs/1508.07909` (copy forward from `research/02-*.md`)
  - tiktoken repo (vocab size / merge count context): `https://github.com/openai/tiktoken`

- [ ] **Step 2: Write `notes/context-reasoning/01-tokenization-deep.md`** covering, in your own thorough prose (1,500–2,500 words), tagged with `[S1]`-style source ids:
  - One-line recap linking Module 00 concept 02, then go deeper.
  - **BPE mechanics, step by step:** start from a byte/character alphabet; count adjacent-pair frequency across the training corpus; merge the single most frequent pair into a new symbol; repeat until the vocabulary hits its target size (~50k–200k). This is a *learned* vocabulary, not a fixed rule set.
  - **Vocabulary size trade-offs:** bigger vocab → fewer tokens per text (cheaper sequences) but a bigger embedding/output matrix (more parameters, more compute per step); smaller vocab → longer sequences, smaller matrices. No free lunch.
  - **Special / chat-format tokens:** BOS/EOS and role markers (e.g. a literal `<|system|>`-style token) are real vocabulary entries the harness inserts around content when it builds the chat prompt — invisible in a rendered chat UI, real in the token sequence and the token budget. This is the seam into concept 04.
  - **Why tokenization drives cost:** pricing and context limits are counted in tokens, not words or characters; English ≈ 1.3 tokens/word but code, CJK scripts, and rare strings cost more per character.
  - **Odd model behavior explained by tokenization:** unpredictable splits on rare strings (long numbers, unusual usernames); `" hello"` and `"hello"` are different tokens — leading whitespace matters; the model can't reliably spell or count letters because it never sees characters directly, only subword chunks.
  - **Pro vs. amateur:** pros budget in tokens, not words; pros know tokenizers differ across model families — the same text is not the same token count everywhere; pros know chat-template special tokens are a real, invisible cost.
  - **References:** the 4 sources above.

- [ ] **Step 3: Write `docs/context-reasoning/01-tokenization-deep.html`** — copy `_template.html`, fill:
  - Title `01 · Tokenization, Deeper — llm::intuition`, crumb `Module 01 / Concept 01`, h1 `Tokeni<span class="hl">z</span>ation, Deeper`, nav `01` gets `class="on"`.
  - Subtitle: "Module 00 showed that a model never sees words. Here's the mechanism that decides what it sees instead — and why chat roles, cost, and weird failures all trace back to it."
  - Prose sections: `// BPE, step by step`, `// Vocabulary size is a trade-off`, `// Special tokens are real tokens`, `// Pro vs. amateur`.
  - Embed Karpathy tokenizer video: `<div class="video"><iframe src="https://www.youtube.com/embed/zduSFxRajkE" title="Let's build the GPT Tokenizer" allowfullscreen loading="lazy"></iframe></div>`
  - Reference cards for all 4 sources.
  - Pager: prev = `<span class="gap"></span>`, next = `02-context-window.html`.
  - **Figure: BPE merge stepper.** Panel header `● BPE MERGES / INTERACTIVE`, label `ILLUSTRATIVE · TOY MERGE TABLE`. Shows a word progressively merging from characters into final subwords, one merge per click — contrasts with Module 00's static split-on-input tokenizer by showing the *process*, not just the result. Markup:

```html
<div id="bpe-word" style="font-family:var(--mono);font-size:1.3rem;letter-spacing:.08em;min-height:2em;"></div>
<button class="btn" id="bpe-btn" style="margin-top:16px;">Next merge ▸</button>
```

  Script:

```html
<script>
const START = ["t","o","k","e","n","i","z","a","t","i","o","n"];
const MERGES = [
  [[0,1],"to"], [[2,3],"ke"], [[4,5],"ni"], // indices into the *current* array each step
];
// Precomputed final states per step (illustrative, not a real learned merge table)
const STATES = [
  ["t","o","k","e","n","i","z","a","t","i","o","n"],
  ["to","k","e","n","i","z","a","t","i","o","n"],
  ["to","ke","n","i","z","a","t","i","o","n"],
  ["to","ke","ni","z","a","t","i","o","n"],
  ["token","iz","a","t","i","o","n"],
  ["token","iza","t","i","o","n"],
  ["token","iza","tion"],
  ["token","ization"],
];
let i = 0;
const word = document.getElementById("bpe-word"), btn = document.getElementById("bpe-btn"),
      ft = document.getElementById("fig-ft");
function draw(){
  word.innerHTML = STATES[i].map((s,k) => `<span class="tk c${k%5+1}">${s}</span>`).join("");
  ft.textContent = i === STATES.length-1
    ? `DONE — ${STATES[i].length} FINAL TOKENS FROM ${STATES[0].length} CHARACTERS`
    : `MERGE STEP ${i}/${STATES.length-1} — ${STATES[i].length} SYMBOLS SO FAR`;
  btn.disabled = i === STATES.length-1;
  if (btn.disabled) btn.textContent = "All merges applied";
}
btn.addEventListener("click", () => { i = Math.min(STATES.length-1, i+1); draw(); });
draw();
</script>
```

  - `figure-note`: "This merge table is hand-made to show the shape of BPE. A real tokenizer learns thousands of merges from a training corpus."

- [ ] **Step 4: Verify** — `open docs/context-reasoning/01-tokenization-deep.html`: clicking steps through all 7 merges to `token` + `ization`, then disables; video loads; zero console errors; readable with JS disabled (shows the first state statically).
- [ ] **Step 5: Commit** — `git add research/context-reasoning/01-tokenization-deep.md notes/context-reasoning/01-tokenization-deep.md docs/context-reasoning/01-tokenization-deep.html && git commit -m "feat: module 01 concept 01 — tokenization, deeper"`
- [ ] **Step 6: CHECKPOINT — request user review of note depth + page look before Task 3.**

---

### Task 3: Concept 02 — Context & the context window

**Files:**
- Create: `research/context-reasoning/02-context-window.md` (per Research protocol; copy forward from `research/05-context-window.md`)
- Create: `notes/context-reasoning/02-context-window.md`
- Create: `docs/context-reasoning/02-context-window.html`

- [ ] **Step 1: Research** — copy forward `[S1]`–`[S5]` from `research/05-context-window.md` (Anthropic context windows, Liu et al. Lost in the Middle, Anthropic prompt caching, Anthropic effective context engineering, HF KV cache). Add new sources on overflow strategies:
  - Anthropic — Effective context engineering for AI agents (already have it as `[S4]`; re-read for the "compaction"/summarization guidance it gives beyond what Module 00's dump extracted — extend the extracted bullets, don't just copy).
  - A sliding-window / summarization-memory source, e.g. LangChain's conversation summary memory docs: `https://python.langchain.com/docs/how_to/chatbots_memory/` (fetch and extract the summarization-vs-truncation trade-off in vendor-neutral terms).

- [ ] **Step 2: Write `notes/context-reasoning/02-context-window.md`** (1,500–2,500 words) covering:
  - Recap Module 00 concept 05, then go beyond "what happens when full."
  - **Everything in the window, every turn:** system prompt, every message, tool results, tool definitions, the model's own output including extended thinking — restate the "everything counts" fact from `[S1]` with the exact figures.
  - **Composition matters before the cap is ever hit:** order (early instructions can get diluted by later volume — bridges to concept 03), redundancy (repeated/contradictory context wastes budget and creates competing "truths"), relevance mix (irrelevant stuffed content competes for attention against relevant content even when there's room to spare).
  - **What happens when full — four strategies, not just eviction:**
    1. *Truncation/eviction* — oldest-first drop, simplest, silently lossy (the chat-app FIFO behavior from `[S1]`).
    2. *Sliding window* — keep only the last N turns; bounded cost, forgets everything older by design.
    3. *Summarization/compaction* — compress old turns into a running summary; preserves gist, loses detail and exact wording.
    4. *RAG/offload* — never load it up front; keep lightweight references (paths, IDs, queries) and retrieve just-in-time (the `[S4]` "just in time" pattern).
  - A short trade-off table: strategy / what survives / what's lost / when to use it.
  - **Pro vs. amateur:** pros treat context as a budget to curate, not a bucket to fill; pros pick an eviction strategy deliberately instead of accepting a framework default; pros know redundant context isn't free even when it fits; context stuffing is the expensive alternative to retrieval.
  - References: sources above.

- [ ] **Step 3: Write `docs/context-reasoning/02-context-window.html`** — h1 `Context &amp; the Context <span class="hl">Window</span>`; subtitle: "The window isn't just a size limit — what's in it, in what order, shapes every answer long before it's ever full." Prose: `// Everything counts, every turn`, `// Composition before capacity`, `// Four ways to handle overflow`, `// Pro vs. amateur`. References per note. Pager 01 ↔ 03.
  - **Figure: overflow-strategy comparison.** Panel header `● OVERFLOW STRATEGY / INTERACTIVE`, label `TOY 8K WINDOW`. A stacked bar identical in spirit to Module 00 concept 05's budget bar, plus 4 strategy buttons; clicking a strategy re-renders the bar to show that strategy's outcome on the same overflowing toy conversation, with a one-line consequence readout.

```html
<div id="cw-bar" style="display:flex;height:34px;border:1px solid var(--line);overflow:hidden;"></div>
<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
  <button class="btn" data-s="truncate">Truncate</button>
  <button class="btn" data-s="sliding">Sliding window</button>
  <button class="btn" data-s="summarize">Summarize</button>
  <button class="btn" data-s="rag">RAG offload</button>
</div>
<script>
const COLORS = {system:"#b06ad6",docs:"#4f9ee0",history:"#57b06a",summary:"#e08a3c",output:"#e08a3c",free:"#1a2027"};
const LABELS = {system:"SYSTEM",docs:"DOCUMENTS",history:"HISTORY (KEPT)",summary:"SUMMARY",output:"RESERVED OUTPUT",free:"FREE"};
const CAP = 8000;
// Same starting overflow state for every strategy: system 400, docs 4000, history 4600, output 1000 (over cap by 2000)
const OUTCOMES = {
  truncate:   {system:400, docs:4000, history:2600, output:1000, msg:"Oldest turns silently dropped — no record they existed."},
  sliding:    {system:400, docs:4000, history:2600, output:1000, msg:"Only the last N turns kept by design — same shape as truncate, but intentional and bounded."},
  summarize:  {system:400, docs:4000, summary:600, history:2000, output:1000, msg:"Old turns compressed to a summary — gist survives, exact wording doesn't."},
  rag:        {system:400, docs:800, history:4600, output:1000, msg:"Docs never fully loaded — only retrieved snippets enter the window."},
};
const bar = document.getElementById("cw-bar"), ft = document.getElementById("fig-ft");
function draw(kind){
  const seg = OUTCOMES[kind];
  const used = Object.entries(seg).filter(([k])=>k!=="msg").reduce((a,[,v])=>a+v,0);
  const parts = {...seg, free: Math.max(0, CAP-used)};
  bar.innerHTML = Object.entries(parts).filter(([k,v]) => k!=="msg" && v>0).map(([k,v]) =>
    `<div title="${LABELS[k]}: ${v}" style="width:${v/CAP*100}%;background:${COLORS[k]}"></div>`).join("");
  ft.innerHTML = `<b>${kind.toUpperCase()}</b> — ${seg.msg}`;
}
document.querySelectorAll("[data-s]").forEach(b =>
  b.addEventListener("click", () => draw(b.dataset.s)));
draw("truncate");
</script>
```

  - `figure-note`: "Same overflowing 8k conversation, four different responses to it. Segment sizes are illustrative."

- [ ] **Step 4: Verify** — each button re-renders the bar and footer distinctly; zero console errors; readable with JS disabled (truncate state shown statically).
- [ ] **Step 5: Commit** — `git add research/context-reasoning/02-context-window.md notes/context-reasoning/02-context-window.md docs/context-reasoning/02-context-window.html && git commit -m "feat: module 01 concept 02 — context and the context window"`

---

### Task 4: Concept 03 — Attention & the attention curve

**Files:**
- Create: `research/context-reasoning/03-attention-curve.md` (per Research protocol; copy forward from `research/04-attention-and-transformers.md` and `research/05-context-window.md`)
- Create: `notes/context-reasoning/03-attention-curve.md`
- Create: `docs/context-reasoning/03-attention-curve.html`

- [ ] **Step 1: Research** — copy forward the attention-mechanics `[S]` blocks from `research/04-attention-and-transformers.md` and the Lost in the Middle `[S2]` block from `research/05-context-window.md`. Add:
  - A follow-up/replication source if one exists and is fetchable, e.g. "Found in the Middle" (2024) or a similar positional-bias paper — search for one; if none fetches cleanly, note in the dump that Liu et al. 2023 remains the sole primary source and proceed (don't fabricate a citation).
  - Anthropic or another primary source on why long-context ≠ uniform quality (reuse `research/05-context-window.md` `[S4]` "context rot" material if not already fully extracted).

- [ ] **Step 2: Write `notes/context-reasoning/03-attention-curve.md`** (1,500–2,500 words) covering:
  - Recap Module 00 concept 04's attention mechanics, then focus on the *curve*: recall is not uniform across position.
  - **Lost in the middle:** the Liu et al. 2023 finding — performance highest when relevant information is at the start or end of context, degrades significantly in the middle, holding even for models built for long context.
  - **Why this happens (architectural + training reasons):** primacy from strong early conditioning (the start of the sequence shapes everything downstream); recency from proximity in the causal mask (nearby tokens dominate local attention patterns); middle content gets diluted because attention mass is spread across many competing tokens at that distance.
  - **This compounds with concept 02:** a bigger window being *technically* available doesn't mean content placed anywhere in it gets equal weight — composition (concept 02) and position (concept 03) are two separate levers on the same problem.
  - **Practical implications:** don't bury the critical instruction in the middle of a long document dump; repeat critical constraints near the end of a long prompt; order retrieved chunks by importance, not by original document order.
  - **Pro vs. amateur:** pros know "128k context" marketing ≠ uniform attention quality across 128k; pros restate critical constraints rather than stating them once and trusting the model to hold onto them; pros order retrieved/injected content deliberately.
  - References: sources above.

- [ ] **Step 3: Write `docs/context-reasoning/03-attention-curve.html`** — h1 `Attention &amp; the Attention <span class="hl">Curve</span>`; subtitle: "Being inside the context window isn't the same as being seen. Where something sits changes how much the model actually uses it." Prose: `// Recap: attention is a weighting, not a lookup`, `// Lost in the middle`, `// Why position matters mechanically`, `// Pro vs. amateur`. References per note. Pager 02 ↔ 04.
  - **Figure: recall curve.** Panel header `● RECALL CURVE / INTERACTIVE`, label `ILLUSTRATIVE · BASED ON LIU ET AL. 2023`. An SVG U-shaped curve (position 0–100% on x, recall % on y) with 5 clickable position markers (Start / Early / Middle / Late / End); clicking one highlights that point on the curve and updates a readout.

```html
<svg id="rc-svg" viewBox="0 0 520 220" style="width:100%;max-width:560px;display:block"></svg>
<div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
  <button class="btn" data-p="0">Start</button>
  <button class="btn" data-p="1">Early</button>
  <button class="btn" data-p="2">Middle</button>
  <button class="btn" data-p="3">Late</button>
  <button class="btn" data-p="4">End</button>
</div>
<script>
// Illustrative U-curve: 5 marker points (x in svg coords, recall %)
const POINTS = [[40,95,"START"],[150,72,"EARLY"],[260,48,"MIDDLE"],[370,74,"LATE"],[480,96,"END"]];
const CURVE = "M40,55 C120,140 200,175 260,182 C320,175 400,140 480,54"; // hand-drawn U, y flipped (svg y grows down)
const svg = document.getElementById("rc-svg"), ft = document.getElementById("fig-ft");
function render(sel){
  svg.innerHTML = `<path d="${CURVE}" fill="none" stroke="#0068b5" stroke-width="2"/>` +
    POINTS.map(([x,r,name],i) => {
      const y = 220 - r*1.6; // recall% -> y position, roughly tracking the curve
      const on = i === sel;
      return `<circle cx="${x}" cy="${y}" r="${on?7:4}" fill="${on?'#00c7fd':'#0068b5'}"/>`;
    }).join("");
  ft.innerHTML = sel == null ? "CLICK A POSITION TO READ ITS RECALL RATE" :
    `POSITION "<b>${POINTS[sel][2]}</b>" — ~${POINTS[sel][1]}% RECALL IN THE LIU ET AL. 2023 EVAL`;
}
document.querySelectorAll("[data-p]").forEach(b =>
  b.addEventListener("click", () => render(+b.dataset.p)));
render(null);
</script>
```

  - `figure-note`: "Curve shape and recall percentages are illustrative, drawn to match the qualitative U-shape Liu et al. (2023) reported — not raw numbers from the paper."

- [ ] **Step 4: Verify** — each button highlights the correct point and updates the readout; zero console errors; readable with JS disabled (curve renders, buttons just don't respond — acceptable since the curve shape itself is the static content).
- [ ] **Step 5: Commit** — `git add research/context-reasoning/03-attention-curve.md notes/context-reasoning/03-attention-curve.md docs/context-reasoning/03-attention-curve.html && git commit -m "feat: module 01 concept 03 — attention and the attention curve"`

---

### Task 5: Concept 04 — System / user / assistant roles

**Files:**
- Create: `research/context-reasoning/04-prompt-roles.md` (per Research protocol — fresh, no prior dump covers this)
- Create: `notes/context-reasoning/04-prompt-roles.md`
- Create: `docs/context-reasoning/04-prompt-roles.html`

- [ ] **Step 1: Research** — fetch and dump:
  - Anthropic — Give Claude a role with a system prompt: `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts`
  - OpenAI — Chat Completions guide, roles section: `https://platform.openai.com/docs/guides/text-generation` (or the current roles-specific page — verify the live URL when fetching)
  - Greshake et al. — "Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection" (2023): `https://arxiv.org/abs/2302.12173`
  - Hugging Face — Chat templates (reuse the fetch from Task 2 if the same URL, otherwise re-cite): `https://huggingface.co/docs/transformers/chat_templating`

- [ ] **Step 2: Write `notes/context-reasoning/04-prompt-roles.md`** (1,500–2,500 words) covering:
  - **What roles structurally are:** system/user/assistant (and tool) are labels the harness wraps around content using the model's chat template — literal special tokens (link concept 01), not semantic metadata the model "understands" abstractly.
  - **How the model actually weighs roles:** a trained tendency from instruction-tuning/RLHF, not hard-wired logic — models are trained to treat system-role content as higher-priority instruction and user-role as the task/query. This is a *prior*, not a guarantee.
  - **Priority and conflict:** well-trained models tend to favor system instructions over conflicting user requests, but adversarial or clever user content can still override a weakly-specified system prompt — cite the indirect prompt injection research for why role position alone isn't a security boundary.
  - **Common failure modes:** role confusion (pasting untrusted text that itself looks like a system or assistant turn); putting per-request variable content in the system prompt when it belongs in user turns (wastes the "stable behavior" slot and the prompt-cache prefix); tool-result content carrying unintended instruction-like authority if not explicitly delimited as data (the indirect-injection mechanism from Greshake et al.).
  - **Pro vs. amateur:** pros put stable behavior in system, variable asks in user; pros explicitly delimit/label untrusted content (tool results, retrieved documents) rather than trusting position alone to keep it "just data"; pros treat role as a strong prior, never a security boundary.
  - References: sources above.

- [ ] **Step 3: Write `docs/context-reasoning/04-prompt-roles.html`** — h1 `System / User / Assistant <span class="hl">Roles</span>`; subtitle: "Roles aren't metadata the model understands — they're tokens it was trained to weigh differently. That training is a strong habit, not a rule." Prose: `// Roles are tokens, not categories`, `// A trained priority, not hard logic`, `// Where it breaks: injection`, `// Pro vs. amateur`. References per note. Pager 03 ↔ 05.
  - **Figure: prompt assembler.** Panel header `● PROMPT ASSEMBLER / INTERACTIVE`, label `CLICK TO BUILD`. Three lanes (System / User / Assistant); buttons add a fixed snippet to a lane; a live-rendered raw sequence view shows the assembled prompt with role markers; footer flags when system and user snippets conflict.

```html
<div style="display:flex;gap:8px;flex-wrap:wrap;">
  <button class="btn" data-lane="system" data-text="Always answer in bullet points.">+ System: style rule</button>
  <button class="btn" data-lane="user" data-text="Write this as one flowing paragraph.">+ User: contradicting ask</button>
  <button class="btn" data-lane="user" data-text="Summarize the attached report.">+ User: task</button>
  <button class="btn" data-lane="assistant" data-text="Sure, here's a bullet summary:">+ Assistant: prior turn</button>
  <button class="btn" id="pr-reset">Reset</button>
</div>
<pre id="pr-out" style="margin-top:16px;background:var(--panel);border:1px solid var(--line);padding:14px;font-size:.82rem;overflow-x:auto;white-space:pre-wrap;"></pre>
<script>
const COLOR = {system:"#b06ad6", user:"#00c7fd", assistant:"#57b06a"};
let seq = [];
const out = document.getElementById("pr-out"), ft = document.getElementById("fig-ft");
function render(){
  out.innerHTML = seq.map(s =>
    `<span style="color:${COLOR[s.lane]}">[${s.lane}]</span> ${s.text}\n`).join("");
  const hasConflict = seq.some(s=>s.lane==="system") &&
    seq.some(s=>s.lane==="user" && s.text.includes("contradicting"));
  ft.textContent = seq.length === 0 ? "ADD SNIPPETS TO BUILD THE RAW SEQUENCE"
    : hasConflict ? "SYSTEM AND USER CONFLICT — MODELS TYPICALLY LEAN SYSTEM, BUT IT'S A TENDENCY, NOT A GUARANTEE"
    : `${seq.length} SNIPPET${seq.length>1?"S":""} — THIS IS THE ORDER THE MODEL ACTUALLY READS`;
}
document.querySelectorAll("[data-lane]").forEach(b =>
  b.addEventListener("click", () => { seq.push({lane:b.dataset.lane, text:b.dataset.text}); render(); }));
document.getElementById("pr-reset").addEventListener("click", () => { seq = []; render(); });
render();
</script>
```

  - `figure-note`: "Snippets are fixed examples; the assembled view mirrors what the harness actually sends, role markers included."

- [ ] **Step 4: Verify** — each add-button appends to the raw view in click order with the right color; conflict message appears only when both a system snippet and the labeled contradicting user snippet are present; reset clears; zero console errors; readable with JS disabled (empty state text shown).
- [ ] **Step 5: Commit** — `git add research/context-reasoning/04-prompt-roles.md notes/context-reasoning/04-prompt-roles.md docs/context-reasoning/04-prompt-roles.html && git commit -m "feat: module 01 concept 04 — system, user, and assistant roles"`

---

### Task 6: Concept 05 — Reasoning, in depth

**Files:**
- Create: `research/context-reasoning/05-reasoning.md` (per Research protocol — fresh)
- Create: `notes/context-reasoning/05-reasoning.md`
- Create: `docs/context-reasoning/05-reasoning.html`

- [ ] **Step 1: Research** — fetch and dump:
  - Wei et al. — "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models" (2022): `https://arxiv.org/abs/2201.11903`
  - Anthropic — Extended thinking: `https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking`
  - Anthropic — "Measuring Faithfulness in Chain-of-Thought Reasoning" (2023): `https://www.anthropic.com/research/measuring-faithfulness-in-chain-of-thought-reasoning` (verify live URL when fetching; this is the source for "a trace can look right and still not be the model's actual reasoning path")
  - Anthropic — reasoning models / thinking budget guidance if a distinct docs page exists beyond extended-thinking (check during fetch; otherwise the extended-thinking page above covers budget trade-offs)

- [ ] **Step 2: Write `notes/context-reasoning/05-reasoning.md`** (1,500–2,500 words) covering:
  - **The mechanical claim:** reasoning is spending more generated tokens before committing to an answer, not a separate cognitive faculty bolted onto the model. An autoregressive model only "thinks" by writing — an intermediate token gives it computation it wouldn't otherwise get.
  - **Chain-of-thought:** the Wei et al. 2022 finding that prompting a model to produce intermediate reasoning steps improves performance on multi-step problems, effectively trading tokens (latency, cost) for accuracy.
  - **Extended thinking / reasoning-token modes:** a dedicated reasoning budget, sometimes summarized rather than shown in full, billed as tokens like any other; more budget helps up to a point and can plateau or hurt on simple tasks ("overthinking").
  - **Reasoning vs. retrieval vs. pattern-matching:** a reasoning trace can be a post-hoc rationalization rather than the model's actual computation path — cite the faithfulness research. A trace "looking right" is not proof the answer is right.
  - **Failure modes:** confident wrong reasoning (fluent, structured, still wrong); traces that don't match the model's own final answer; reasoning as an elaborate way to still hallucinate when the model lacks the underlying fact.
  - **Pro vs. amateur:** pros treat reasoning tokens as a cost/quality knob, not a free upgrade; pros verify conclusions independently of how confident or detailed the trace reads; pros know "think step by step" prompting helps most on models not already tuned for internal reasoning, and matters less on ones that are.
  - References: sources above.

- [ ] **Step 3: Write `docs/context-reasoning/05-reasoning.html`** — h1 `Reasoning, in <span class="hl">Depth</span>`; subtitle: "Reasoning isn't a separate faculty a model switches on. It's more tokens spent before the answer — and more tokens is a knob, not a guarantee." Prose: `// More tokens, not a different process`, `// Chain-of-thought and extended thinking`, `// A trace isn't proof`, `// Pro vs. amateur`. References per note. Pager 04 ↔ deck (`<a class="next" href="deck.html">Deck · Context &amp; Reasoning →</a>`).
  - **Figure: reasoning trace stepper.** Panel header `● REASONING TRACE / INTERACTIVE`, label `SAME PROMPT · TWO PATHS`. A toggle between "Direct answer" and "Step-by-step" for the same toy math-word-problem prompt; step-by-step reveals its steps one click at a time; footer shows a running token count for whichever path is active.

```html
<div style="display:flex;gap:8px;">
  <button class="btn" id="rt-direct">Direct answer</button>
  <button class="btn" id="rt-steps">Step-by-step</button>
</div>
<div id="rt-out" style="margin-top:16px;padding:14px;border:1px solid var(--line);font-size:.9rem;line-height:1.7;min-height:6em;"></div>
<button class="btn" id="rt-next" style="margin-top:12px;display:none;">Next step ▸</button>
<script>
const PROMPT = "A train leaves at 60mph, another leaves 30 minutes later at 90mph on the same route. When does the second train catch up?";
const DIRECT = {tokens: 14, text: "The second train catches up after 1.5 hours from when it departs."};
const STEPS = [
  "Let t = hours after the second train departs.",
  "First train's head start distance: 60 × 0.5 = 30 miles.",
  "First train's position: 30 + 60t. Second train's position: 90t.",
  "Set equal: 90t = 30 + 60t → 30t = 30 → t = 1.",
  "The second train catches up 1 hour after it departs (1.5h after the first train left).",
];
let mode = null, step = 0;
const out = document.getElementById("rt-out"), ft = document.getElementById("fig-ft"),
      next = document.getElementById("rt-next");
function drawDirect(){
  out.innerHTML = `<div style="color:var(--faint);font-size:.8rem;margin-bottom:8px;">PROMPT: "${PROMPT}"</div>${DIRECT.text}`;
  ft.innerHTML = `<b>${DIRECT.tokens} TOKENS</b> — NO INTERMEDIATE COMPUTATION SHOWN OR SPENT`;
  next.style.display = "none";
}
function drawSteps(){
  const shown = STEPS.slice(0, step+1);
  const tokCount = 14 + shown.length * 12; // illustrative running count
  out.innerHTML = `<div style="color:var(--faint);font-size:.8rem;margin-bottom:8px;">PROMPT: "${PROMPT}"</div>` +
    shown.map((s,i) => `<div>${i+1}. ${s}</div>`).join("");
  ft.innerHTML = step < STEPS.length-1
    ? `~${tokCount} TOKENS SO FAR — EACH STEP IS COMPUTE THE DIRECT PATH NEVER SPENT`
    : `~${tokCount} TOKENS TOTAL — ${Math.round(tokCount/DIRECT.tokens)}× THE DIRECT ANSWER'S COST`;
  next.style.display = step < STEPS.length-1 ? "inline-block" : "none";
}
document.getElementById("rt-direct").addEventListener("click", () => { mode="direct"; drawDirect(); });
document.getElementById("rt-steps").addEventListener("click", () => { mode="steps"; step=0; drawSteps(); });
next.addEventListener("click", () => { step = Math.min(STEPS.length-1, step+1); drawSteps(); });
drawDirect();
</script>
```

  - `figure-note`: "Token counts are illustrative estimates, not measured from a real model run."

- [ ] **Step 4: Verify** — direct/step-by-step toggle switches views; step-by-step reveals one step per click and disables at the end; token counts update; zero console errors; readable with JS disabled (direct-answer state shown statically).
- [ ] **Step 5: Commit** — `git add research/context-reasoning/05-reasoning.md notes/context-reasoning/05-reasoning.md docs/context-reasoning/05-reasoning.html && git commit -m "feat: module 01 concept 05 — reasoning, in depth"`
- [ ] **Step 6: CHECKPOINT — request user review of all 5 concept pages before starting the deck.**

---

### Task 7: Deck skeleton + slides 1–2

**Files:**
- Create: `docs/context-reasoning/deck.html`

**Interfaces:**
- Produces: the shared `<style>`/`<script>` skeleton every later deck task appends slides into. Establishes the click-to-advance exclusion selector every interactive slide depends on.

- [ ] **Step 1: Write `docs/context-reasoning/deck.html`** — copy `docs/plugins/deck.html`'s `<head>`, `<style>` block, and `#exit`/`#hud` markup verbatim, with these changes:
  - `<title>Deck · Context & Reasoning — llm::intuition</title>`
  - `<a id="exit" href="index.html">✕ EXIT · MODULE 01 INDEX</a>`
  - Add these deck-scoped styles to the existing `<style>` block (new classes the later slide tasks use — nothing here is a new global class, all scoped to the deck page):

```css
.ctxbar{display:flex;height:34px;border:1px solid var(--line);overflow:hidden;max-width:70ch;}
.toggle2{display:flex;gap:8px;}
.slide pre.raw{white-space:pre-wrap;font-size:.8rem;}
.slide svg{max-width:100%;}
.slide input[type=range]{max-width:320px;}
```

  - Body: `<div class="grid-bg"></div>` then `<a id="exit">…</a>`, then the 17 `<section class="slide" id="s-N">` blocks (this task writes only `s-1` and `s-2`; later tasks append `s-3`…`s-17` before the closing `<div id="hud">`), then `<div id="hud"></div>` and the script.
  - **Slide 1 — Title:**

```html
<section class="slide" id="s-1">
  <span class="kicker">Module 01 · Context & reasoning</span>
  <h2>Context &amp; <span class="hl">Reasoning</span> — what's actually happening inside the window</h2>
  <ul>
    <li>Tokenization · the context window · the attention curve · roles · reasoning</li>
    <li>By the end: read a context budget like an engineer, not guess at it</li>
  </ul>
</section>
```

  - **Slide 2 — Hook + agenda:**

```html
<section class="slide" id="s-2">
  <span class="kicker">Why this matters</span>
  <h2>Prompts get longer, quality gets worse — and nobody can say why</h2>
  <ul>
    <li>"It's a 200k window, just put everything in it" is the most common wrong instinct</li>
    <li>Five mechanisms explain the whole story: tokens → window → attention → roles → reasoning</li>
    <li>Each section in this deck has something to click — the point is to see it, not just hear it</li>
  </ul>
</section>
```

  - **Script** — copy `docs/plugins/deck.html`'s script verbatim except the click-handler exclusion selector, which must be extended to skip custom controls so they don't also advance the slide:

```html
<div id="hud"></div>
<script>
const slides = [...document.querySelectorAll(".slide")];
const hud = document.getElementById("hud");
let cur = Math.max(0, slides.findIndex(s => location.hash === "#"+s.id));
document.body.classList.add("deck-mode");
document.querySelectorAll(".slide details").forEach(d => d.removeAttribute("open"));
function show(n){
  cur = Math.min(slides.length-1, Math.max(0, n));
  slides.forEach((s,i) => s.classList.toggle("on", i===cur));
  hud.textContent = `${cur+1} / ${slides.length} · ←→`;
  if (slides[cur].id) history.replaceState(null,"","#"+slides[cur].id);
}
function fwd(){
  const next = slides[cur].querySelector(".step:not(.on)");
  if (next){ next.classList.add("on"); return; }
  show(cur+1);
}
function back(){
  const shown = slides[cur].querySelectorAll(".step.on");
  if (shown.length){ shown[shown.length-1].classList.remove("on"); return; }
  show(cur-1);
}
addEventListener("keydown", e => {
  if (e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){ e.preventDefault(); fwd(); }
  if (e.key==="ArrowLeft"||e.key==="PageUp") back();
});
addEventListener("click", e => {
  if (!e.target.closest("a, details, #hud, button, input, textarea, svg")) fwd();
});
show(cur);
</script>
```

  Note the added `button, input, textarea, svg` to the exclusion list — every custom-JS slide from Task 8 onward relies on this so clicking a widget control doesn't also flip the slide.

- [ ] **Step 2: Verify** — `open docs/context-reasoning/deck.html`: slide 1 shows, right-arrow advances to slide 2, left-arrow returns, HUD reads `1 / 2 · ←→` then `2 / 2 · ←→`. Zero console errors.
- [ ] **Step 3: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck skeleton + slides 1-2"`

---

### Task 8: Deck slides 3–4 (tokenizer, chat-format toggle)

**Files:**
- Modify: `docs/context-reasoning/deck.html` (insert `s-3`, `s-4` before `s-5`'s eventual position — i.e. before `<div id="hud">`)

- [ ] **Step 1: Insert slide 3 — live tokenizer** (condensed version of Module 00 concept 02's toy tokenizer, adapted from `docs/fundamentals/02-tokens-and-tokenization.html`):

```html
<section class="slide" id="s-3">
  <span class="kicker">1 · Tokenization</span>
  <h2>The model never sees <span class="hl">words</span></h2>
  <textarea id="dk-tok-in" rows="2" style="width:100%;max-width:64ch;">Tokenization is the substrate everything else is built on.</textarea>
  <div id="dk-tok-out" style="font-size:1.05rem;line-height:2.2;margin-top:14px;"></div>
  <script>
  (function(){
    const COMMON = ["the","ing","tion","er","re","sub","form","and","is","not","word","piece","token","stra","te"];
    function toy(text){
      const out = [];
      for (const word of text.split(/(\s+)/)){
        if (!word) continue;
        if (/^\s+$/.test(word)) { if (out.length) out[out.length-1].glue = word; continue; }
        let rest = word.toLowerCase(), orig = word, pos = 0;
        while (rest.length){
          const hit = COMMON.find(c => rest.startsWith(c));
          const n = hit ? hit.length : Math.min(rest.length, 4);
          out.push({s: orig.slice(pos, pos+n), glue:""});
          pos += n; rest = rest.slice(n);
        }
      }
      return out;
    }
    const inp = document.getElementById("dk-tok-in"), out = document.getElementById("dk-tok-out");
    function render(){
      const toks = toy(inp.value);
      out.innerHTML = toks.map((t,i) => `<span class="tk c${i%5+1}">${t.glue.replace(/ /g,"&nbsp;")}${t.s}</span>`).join("")
        + `<div style="font-family:var(--mono);font-size:.68rem;color:var(--faint);margin-top:10px;letter-spacing:.1em;">${toks.length} TOKENS · ${inp.value.length} CHARS</div>`;
    }
    inp.addEventListener("input", render);
    render();
  })();
  </script>
</section>
```

  - **Step 2: Insert slide 4 — chat-format toggle:**

```html
<section class="slide" id="s-4">
  <span class="kicker">1 · Tokenization</span>
  <h2>Roles are <span class="hl">tokens</span>, not metadata</h2>
  <div class="toggle2">
    <button class="btn" id="dk-cf-rendered">Rendered chat</button>
    <button class="btn" id="dk-cf-raw">Raw tokens</button>
  </div>
  <pre class="raw" id="dk-cf-out" style="margin-top:14px;background:var(--panel);border:1px solid var(--line);padding:14px;max-width:70ch;"></pre>
  <script>
  (function(){
    const RENDERED = `System: Answer concisely.\nUser: What's the capital of France?\nAssistant: Paris.`;
    const RAW = `<|system|>Answer concisely.<|end|>\n<|user|>What's the capital of France?<|end|>\n<|assistant|>Paris.<|end|>`;
    const out = document.getElementById("dk-cf-out");
    document.getElementById("dk-cf-rendered").addEventListener("click", () => out.textContent = RENDERED);
    document.getElementById("dk-cf-raw").addEventListener("click", () => out.textContent = RAW);
    out.textContent = RENDERED;
  })();
  </script>
</section>
```

- [ ] **Step 3: Verify** — `open docs/context-reasoning/deck.html#s-3`: typing retokenizes live. `#s-4`: toggle swaps between rendered and raw views. Clicking inside the textarea/buttons does NOT advance the slide (confirms Task 7's exclusion selector works). Zero console errors.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck slides 3-4"`

---

### Task 9: Deck slides 5–6 (context budget simulator, overflow strategy comparison)

**Files:**
- Modify: `docs/context-reasoning/deck.html`

- [ ] **Step 1: Insert slide 5 — context budget simulator** (condensed from Module 00 concept 05's figure):

```html
<section class="slide" id="s-5">
  <span class="kicker">2 · Context window</span>
  <h2>Everything counts, every <span class="hl">turn</span></h2>
  <div class="ctxbar" id="dk-cb-bar"></div>
  <div style="display:flex;gap:10px;margin-top:14px;">
    <button class="btn" id="dk-cb-turn">+ Add a turn</button>
    <button class="btn" id="dk-cb-doc">+ Paste a doc</button>
    <button class="btn" id="dk-cb-reset">Reset</button>
  </div>
  <script>
  (function(){
    const CAP=8000, OUT=1000;
    const COLORS={system:"#b06ad6",docs:"#4f9ee0",history:"#57b06a",output:"#e08a3c",free:"#1a2027"};
    let seg;
    const bar=document.getElementById("dk-cb-bar"), ft=document.getElementById("fig-ft")||null;
    function used(){ return seg.system+seg.docs+seg.history+seg.output; }
    function reset(){ seg={system:400,docs:0,history:0,output:OUT}; draw(); }
    function add(kind,n){
      seg[kind]+=n;
      while (used()>CAP && seg.history>0) seg.history=Math.max(0,seg.history-600);
      if (used()>CAP) seg[kind]-=used()-CAP;
      draw();
    }
    function draw(){
      const parts={...seg, free:Math.max(0,CAP-used())};
      bar.innerHTML=Object.entries(parts).filter(([,v])=>v>0).map(([k,v])=>
        `<div title="${k}: ${v}" style="width:${v/CAP*100}%;background:${COLORS[k]}"></div>`).join("");
    }
    document.getElementById("dk-cb-turn").addEventListener("click",()=>add("history",600));
    document.getElementById("dk-cb-doc").addEventListener("click",()=>add("docs",1500));
    document.getElementById("dk-cb-reset").addEventListener("click",reset);
    reset();
  })();
  </script>
</section>
```

  - **Step 2: Insert slide 6 — overflow strategy comparison** (condensed from concept 02's page figure, adapted for deck):

```html
<section class="slide" id="s-6">
  <span class="kicker">2 · Context window</span>
  <h2>Full doesn't mean one <span class="hl">outcome</span></h2>
  <div class="ctxbar" id="dk-ov-bar"></div>
  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
    <button class="btn" data-s="truncate">Truncate</button>
    <button class="btn" data-s="sliding">Sliding window</button>
    <button class="btn" data-s="summarize">Summarize</button>
    <button class="btn" data-s="rag">RAG offload</button>
  </div>
  <div id="dk-ov-msg" style="margin-top:10px;color:var(--muted);font-size:.85rem;max-width:64ch;"></div>
  <script>
  (function(){
    const CAP=8000;
    const COLORS={system:"#b06ad6",docs:"#4f9ee0",history:"#57b06a",summary:"#e08a3c",output:"#e08a3c",free:"#1a2027"};
    const OUTCOMES={
      truncate:{system:400,docs:4000,history:2600,output:1000,msg:"Oldest turns silently dropped."},
      sliding:{system:400,docs:4000,history:2600,output:1000,msg:"Only the last N turns kept — bounded, by design."},
      summarize:{system:400,docs:4000,summary:600,history:2000,output:1000,msg:"Old turns compressed — gist survives, wording doesn't."},
      rag:{system:400,docs:800,history:4600,output:1000,msg:"Docs never fully loaded — only retrieved snippets enter."},
    };
    const bar=document.getElementById("dk-ov-bar"), msg=document.getElementById("dk-ov-msg");
    function draw(kind){
      const seg=OUTCOMES[kind];
      const used=Object.entries(seg).filter(([k])=>k!=="msg").reduce((a,[,v])=>a+v,0);
      const parts={...seg, free:Math.max(0,CAP-used)};
      bar.innerHTML=Object.entries(parts).filter(([k,v])=>k!=="msg"&&v>0).map(([k,v])=>
        `<div title="${k}: ${v}" style="width:${v/CAP*100}%;background:${COLORS[k]}"></div>`).join("");
      msg.textContent=seg.msg;
    }
    document.querySelectorAll("[data-s]").forEach(b=>b.addEventListener("click",()=>draw(b.dataset.s)));
    draw("truncate");
  })();
  </script>
</section>
```

- [ ] **Step 3: Verify** — slide 5 buttons grow the bar and evict history on overflow; slide 6 buttons swap composition + message; zero console errors; clicking controls doesn't advance the slide.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck slides 5-6"`

---

### Task 10: Deck slides 7–8 (recall curve, attention stepper)

**Files:**
- Modify: `docs/context-reasoning/deck.html`

- [ ] **Step 1: Insert slide 7 — recall curve** (condensed from concept 03's figure):

```html
<section class="slide" id="s-7">
  <span class="kicker">3 · Attention curve</span>
  <h2>In the window isn't the same as <span class="hl">seen</span></h2>
  <svg id="dk-rc-svg" viewBox="0 0 520 200" style="max-width:520px;"></svg>
  <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
    <button class="btn" data-p="0">Start</button>
    <button class="btn" data-p="1">Early</button>
    <button class="btn" data-p="2">Middle</button>
    <button class="btn" data-p="3">Late</button>
    <button class="btn" data-p="4">End</button>
  </div>
  <div id="dk-rc-msg" style="margin-top:10px;color:var(--muted);font-size:.85rem;"></div>
  <script>
  (function(){
    const POINTS=[[40,95,"START"],[150,72,"EARLY"],[260,48,"MIDDLE"],[370,74,"LATE"],[480,96,"END"]];
    const CURVE="M40,55 C120,140 200,175 260,182 C320,175 400,140 480,54";
    const svg=document.getElementById("dk-rc-svg"), msg=document.getElementById("dk-rc-msg");
    function render(sel){
      svg.innerHTML=`<path d="${CURVE}" fill="none" stroke="#0068b5" stroke-width="2"/>`+
        POINTS.map(([x,r],i)=>{const y=200-r*1.5; const on=i===sel;
          return `<circle cx="${x}" cy="${y}" r="${on?7:4}" fill="${on?'#00c7fd':'#0068b5'}"/>`;}).join("");
      msg.textContent = sel==null ? "Click a position to read its recall rate." :
        `Position "${POINTS[sel][2]}" — ~${POINTS[sel][1]}% recall (Liu et al. 2023, illustrative curve).`;
    }
    document.querySelectorAll("[data-p]").forEach(b=>b.addEventListener("click",()=>render(+b.dataset.p)));
    render(null);
  })();
  </script>
</section>
```

  - **Step 2: Insert slide 8 — attention stepper** (condensed from Module 00 concept 04's figure):

```html
<section class="slide" id="s-8">
  <span class="kicker">3 · Attention curve</span>
  <h2>Why position <span class="hl">mechanically</span> matters</h2>
  <div id="dk-att-toks" style="display:flex;gap:6px;flex-wrap:wrap;font-family:var(--mono);font-size:.85rem;"></div>
  <div id="dk-att-bars" style="margin-top:14px;display:flex;flex-direction:column;gap:5px;"></div>
  <button class="btn" id="dk-att-btn" style="margin-top:14px;">Next token ▸</button>
  <script>
  (function(){
    const TOKS=["The","robot","picked","up","the","ball","because","it","was","light"];
    const ATT={1:[100],2:[10,90],3:[5,25,70],4:[40,10,25,25],5:[15,10,30,15,30],
      6:[5,10,25,5,10,45],7:[3,12,5,2,3,62,13],8:[4,10,6,2,4,20,10,44],9:[2,6,4,2,2,38,8,30,8]};
    let cur=1;
    const t=document.getElementById("dk-att-toks"), b=document.getElementById("dk-att-bars"),
          btn=document.getElementById("dk-att-btn");
    function draw(){
      t.innerHTML=TOKS.map((tok,i)=>`<span style="padding:3px 7px;border:1px solid ${i===cur?'#00c7fd':'#263039'};
        color:${i===cur?'#00c7fd':i<cur?'#dcdee0':'#4a4f55'}">${tok}</span>`).join("");
      b.innerHTML=ATT[cur].map((p,i)=>`<div style="display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.75rem;">
        <span style="width:70px;color:var(--faint)">${TOKS[i]}</span>
        <span style="height:10px;width:${p*2}px;background:${p===Math.max(...ATT[cur])?'#00c7fd':'#0068b5'}"></span>
        <span style="color:var(--faint)">${p}%</span></div>`).join("");
    }
    btn.addEventListener("click",()=>{cur=cur===9?1:cur+1; draw();});
    draw();
  })();
  </script>
</section>
```

- [ ] **Step 3: Verify** — slide 7 buttons highlight the right curve point; slide 8 button cycles tokens 1→9→1 and "it" (token 8) shows "ball" (index 5) dominant. Zero console errors.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck slides 7-8"`

---

### Task 11: Deck slides 9–10 (prompt assembler, decision picker)

**Files:**
- Modify: `docs/context-reasoning/deck.html`

- [ ] **Step 1: Insert slide 9 — prompt assembler** (condensed from concept 04's figure):

```html
<section class="slide" id="s-9">
  <span class="kicker">4 · Roles</span>
  <h2>Build the raw <span class="hl">sequence</span></h2>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn" data-lane="system" data-text="Always answer in bullet points.">+ System</button>
    <button class="btn" data-lane="user" data-text="Write this as one flowing paragraph.">+ User (conflicting)</button>
    <button class="btn" data-lane="user" data-text="Summarize the attached report.">+ User (task)</button>
    <button class="btn" id="dk-pa-reset">Reset</button>
  </div>
  <pre class="raw" id="dk-pa-out" style="margin-top:14px;background:var(--panel);border:1px solid var(--line);padding:14px;max-width:70ch;"></pre>
  <script>
  (function(){
    const COLOR={system:"#b06ad6",user:"#00c7fd"};
    let seq=[];
    const out=document.getElementById("dk-pa-out");
    function render(){
      out.innerHTML = seq.length===0 ? "Add snippets to build the raw sequence."
        : seq.map(s=>`<span style="color:${COLOR[s.lane]}">[${s.lane}]</span> ${s.text}`).join("\n");
    }
    document.querySelectorAll("[data-lane]").forEach(b=>
      b.addEventListener("click",()=>{seq.push({lane:b.dataset.lane,text:b.dataset.text}); render();}));
    document.getElementById("dk-pa-reset").addEventListener("click",()=>{seq=[]; render();});
    render();
  })();
  </script>
</section>
```

  - **Step 2: Insert slide 10 — decision picker** (native `.pick`/`<details>` pattern, zero custom JS, identical mechanism to Module A1 deck slide 14):

```html
<section class="slide" id="s-10">
  <span class="kicker">4 · Roles</span>
  <h2>Pick the role by the <span class="hl">job</span></h2>
  <div class="pick">
    <details><summary>I want behavior that holds for the whole session…</summary>
      <div class="ans"><b>System.</b> Stable instructions, style rules, persona — set once, applies every turn.</div></details>
    <details><summary>I want to ask something specific right now…</summary>
      <div class="ans"><b>User.</b> The actual task or question — changes every turn.</div></details>
    <details><summary>I want to show an example of the response style I want…</summary>
      <div class="ans"><b>Assistant (few-shot).</b> A prior turn the model treats as its own past output — shapes tone by example.</div></details>
    <details><summary>I'm passing in untrusted content (a doc, a tool result)…</summary>
      <div class="ans"><b>User or tool role, explicitly delimited.</b> Never let it read as system or assistant — that's how indirect prompt injection works.</div></details>
  </div>
</section>
```

- [ ] **Step 3: Verify** — slide 9's buttons append to the raw view in order; slide 10's `<details>` open/close independently and are excluded from click-to-advance (already true — `details` is in the exclusion selector from Task 7). Zero console errors.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck slides 9-10"`

---

### Task 12: Deck slides 11–13 (reasoning toggle, budget slider, failure gallery)

**Files:**
- Modify: `docs/context-reasoning/deck.html`

- [ ] **Step 1: Insert slide 11 — direct vs. step-by-step toggle** (condensed from concept 05's figure):

```html
<section class="slide" id="s-11">
  <span class="kicker">5 · Reasoning</span>
  <h2>More tokens, not a different <span class="hl">process</span></h2>
  <div class="toggle2">
    <button class="btn" id="dk-rt-direct">Direct answer</button>
    <button class="btn" id="dk-rt-steps">Step-by-step</button>
  </div>
  <div id="dk-rt-out" style="margin-top:14px;padding:12px;border:1px solid var(--line);font-size:.88rem;line-height:1.6;min-height:5em;max-width:64ch;"></div>
  <script>
  (function(){
    const DIRECT="The second train catches up after 1.5 hours from when it departs. (~14 tokens)";
    const STEPS=["Head start: 60 × 0.5 = 30 miles.","Set 90t = 30 + 60t → t = 1.",
      "Catches up 1h after departing (1.5h after the first train left). (~74 tokens)"];
    const out=document.getElementById("dk-rt-out");
    document.getElementById("dk-rt-direct").addEventListener("click",()=>out.textContent=DIRECT);
    document.getElementById("dk-rt-steps").addEventListener("click",()=>
      out.innerHTML=STEPS.map((s,i)=>`<div>${i+1}. ${s}</div>`).join(""));
    out.textContent=DIRECT;
  })();
  </script>
</section>
```

  - **Step 2: Insert slide 12 — reasoning-budget slider** (adapted from Module 00 concept 06's slider pattern):

```html
<section class="slide" id="s-12">
  <span class="kicker">5 · Reasoning</span>
  <h2>A budget, not a free <span class="hl">upgrade</span></h2>
  <input type="range" id="dk-rb-slider" min="0" max="3" step="1" value="1">
  <div id="dk-rb-out" style="margin-top:12px;max-width:64ch;font-size:.9rem;line-height:1.6;"></div>
  <script>
  (function(){
    const LEVELS=[
      {name:"None", tok:14, q:"Correct on simple tasks, brittle on multi-step ones."},
      {name:"Low", tok:74, q:"Solves the multi-step problem, minimal exploration."},
      {name:"Medium", tok:180, q:"Checks its own arithmetic once — catches some errors."},
      {name:"High", tok:420, q:"Re-derives from three angles — diminishing returns, same answer."},
    ];
    const slider=document.getElementById("dk-rb-slider"), out=document.getElementById("dk-rb-out");
    function render(){
      const l=LEVELS[+slider.value];
      out.innerHTML=`<b>${l.name} reasoning budget</b> — ~${l.tok} tokens<br>${l.q}`;
    }
    slider.addEventListener("input",render);
    render();
  })();
  </script>
</section>
```

  - **Step 3: Insert slide 13 — failure-mode gallery** (native `.pick`/`<details>` pattern, zero custom JS):

```html
<section class="slide" id="s-13">
  <span class="kicker">5 · Reasoning</span>
  <h2>A trace isn't <span class="hl">proof</span></h2>
  <div class="pick">
    <details><summary>Confident wrong reasoning</summary>
      <div class="ans">Fluent, structured, step-numbered — and the arithmetic in step 2 is wrong. Structure reads as credibility; it isn't.</div></details>
    <details><summary>Trace doesn't match the final answer</summary>
      <div class="ans">The steps derive one value, the stated final answer is a different one — the trace and the output can diverge.</div></details>
    <details><summary>Reasoning as elaborate hallucination</summary>
      <div class="ans">More steps can mean more confident fabrication when the model lacks the underlying fact, not less.</div></details>
  </div>
</section>
```

- [ ] **Step 4: Verify** — slide 11 toggle swaps content; slide 12 slider updates budget/quality text across all 4 positions; slide 13 details expand independently. Zero console errors.
- [ ] **Step 5: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat: module 01 deck slides 11-13"`

---

### Task 13: Deck slides 14–17 + landing page + full verification

**Files:**
- Modify: `docs/context-reasoning/deck.html`
- Create: `docs/context-reasoning/index.html`
- Modify: `docs/index.html` (add Module 01 card)
- Delete: `docs/context-reasoning/_template.html`

- [ ] **Step 1: Insert slide 14 — end-to-end walkthrough** (native `.steps` reveal pattern — the shared `fwd()`/`back()` handler from Task 7 already drives this, zero extra JS):

```html
<section class="slide" id="s-14">
  <span class="kicker">Putting it together</span>
  <h2>One conversation, all five <span class="hl">mechanisms</span></h2>
  <div class="steps">
    <div class="step"><b>1 · Tokenize:</b> the prompt and every prior turn become tokens the moment they're sent — nothing is "words" past this point.</div>
    <div class="step"><b>2 · Window fills:</b> system prompt, history, a pasted doc, and reserved output all draw from the same budget.</div>
    <div class="step"><b>3 · Attention curve bites:</b> a fact buried mid-document gets less effective weight than one at the start or end — even though it's technically in-window.</div>
    <div class="step"><b>4 · Roles structure the ask:</b> the system prompt sets the stable behavior, the user turn carries the actual question, and the harness assembles both into one sequence.</div>
    <div class="step"><b>5 · Reasoning produces the answer:</b> the model spends extra tokens working through the multi-step part before committing to a final response.</div>
  </div>
</section>
```

  - **Step 2: Insert slide 15 — BKM accordion** (native `<details>`, zero custom JS):

```html
<section class="slide" id="s-15">
  <span class="kicker">BKMs</span>
  <h2>What to actually <span class="hl">do</span></h2>
  <div class="tree">
    <details><summary>Tokenization</summary>
      <div class="note">Budget in tokens, not words. Expect code and non-English text to cost more per character.</div></details>
    <details><summary>Context window</summary>
      <div class="note">Curate what's in the window — pick an overflow strategy on purpose, don't just let the default truncate.</div></details>
    <details><summary>Attention curve</summary>
      <div class="note">Don't bury the critical instruction in the middle of a long prompt. Restate it near the end.</div></details>
    <details><summary>Roles</summary>
      <div class="note">Stable behavior → system. The actual ask → user. Never let untrusted content read as either.</div></details>
    <details><summary>Reasoning</summary>
      <div class="note">More reasoning tokens is a cost/quality knob — verify conclusions, don't trust a confident trace.</div></details>
  </div>
</section>
```

  - **Step 3: Insert slide 16 — recap table:**

```html
<section class="slide" id="s-16">
  <span class="kicker">Recap</span>
  <h2>Five mechanisms, one line each</h2>
  <table>
    <tr><th>Concept</th><th>Mechanism</th><th>One BKM</th></tr>
    <tr><td>Tokenization</td><td>Learned subword vocabulary (BPE)</td><td>Budget in tokens, not words</td></tr>
    <tr><td>Context window</td><td>Everything counts, every turn</td><td>Pick an overflow strategy on purpose</td></tr>
    <tr><td>Attention curve</td><td>Uneven recall by position</td><td>Restate critical constraints near the end</td></tr>
    <tr><td>Roles</td><td>Trained priority, not hard logic</td><td>Never let untrusted content read as system/assistant</td></tr>
    <tr><td>Reasoning</td><td>More tokens before the answer</td><td>Verify conclusions, don't trust the trace</td></tr>
  </table>
</section>
```

  - **Step 4: Insert slide 17 — Q&A:**

```html
<section class="slide" id="s-17">
  <span class="kicker">Q&amp;A</span>
  <h2>Questions — open floor</h2>
  <ul>
    <li>Deeper reading: the five concept pages at <a href="index.html">context-reasoning/index.html</a></li>
    <li>tokens → context window → attention curve → roles → reasoning</li>
  </ul>
</section>
```

  - **Step 5: Write `docs/context-reasoning/index.html`** — same head/header pattern as `docs/fundamentals/index.html`, nav `01 Index` gets `class="on"`, plus a `Deck` nav link. Hero: crumb `Module 01 / Context & Reasoning`, h1 `Context &amp; <span class="hl">Reasoning</span>`, subtitle: "How context actually shapes what a model does — tokens, the window, attention, roles, and reasoning, each taken past the surface Module 00 gave them." Meta row: `5 concepts · 1 deck · Prereq: Module 00`. Card grid (`.refs`/`.ref`) with 5 entries + 1 deck entry:

```html
<div class="refs">
  <a class="ref" href="01-tokenization-deep.html"><span class="src">CONCEPT 01</span><span class="t">Tokenization, Deeper — BPE mechanics and special tokens</span></a>
  <a class="ref" href="02-context-window.html"><span class="src">CONCEPT 02</span><span class="t">Context &amp; the Context Window — composition before capacity</span></a>
  <a class="ref" href="03-attention-curve.html"><span class="src">CONCEPT 03</span><span class="t">Attention &amp; the Attention Curve — in-window isn't seen</span></a>
  <a class="ref" href="04-prompt-roles.html"><span class="src">CONCEPT 04</span><span class="t">System / User / Assistant Roles — a trained priority, not a rule</span></a>
  <a class="ref" href="05-reasoning.html"><span class="src">CONCEPT 05</span><span class="t">Reasoning, in Depth — more tokens, not a different process</span></a>
  <a class="ref" href="deck.html"><span class="src">DECK</span><span class="t">Context &amp; Reasoning — 17-slide interactive session</span></a>
</div>
```

  - **Step 6: Update `docs/index.html`** — add a Module 01 nav link (`<a href="context-reasoning/index.html">Module 01</a>`, placed between `Module 00` and `Module A1`) and a new `.ref` card in the "Core track" section:

```html
<a class="ref" href="context-reasoning/index.html" data-tags="core tokens attention"><span class="src">MODULE 01 · CORE</span><span class="t">Context &amp; Reasoning — tokens, the context window, attention, roles, and reasoning, in depth · 5 concepts + deck</span><span class="tags"><span>tokens</span><span>attention</span></span></a>
```

  Update the hero `<div class="meta">` counts (`3 modules`, concept count +5, deck count +1) to match.

  - **Step 7: Delete the template** — `rm docs/context-reasoning/_template.html`

  - **Step 8: Run the site-wide link check** (command from *Verification commands*). Expected: no output, exit 0. Fix any broken href before proceeding.

  - **Step 9: Full manual pass** — `open docs/index.html`: Module 01 card present and links work. `open docs/context-reasoning/index.html`: all 5 cards + deck link work. `open docs/context-reasoning/deck.html`: all 17 slides render via arrow-key navigation, HUD reads `N / 17`, every interactive from Tasks 8–13 operates, zero console errors across the pass. Disable JS and re-open the deck: every slide's static fallback is readable (buttons visible but inert is acceptable; `<details>`-based slides remain fully readable open or closed).

  - **Step 10: Commit** — `git add -A docs/context-reasoning docs/index.html && git commit -m "feat: module 01 deck slides 14-17, landing pages, remove template"`

---

### Task 14: Publish

**Files:** none (repo operations)

- [ ] **Step 1: Merge to dev** — `git checkout dev && git pull && git merge context-reasoning-module && git push origin dev`
- [ ] **Step 2: Merge dev to main** — `git checkout main && git pull && git merge dev && git push origin main`
- [ ] **Step 3: Trigger the Pages build** — `gh api -X POST repos/ialvarezz/llm-intuition/pages/builds` (GitHub Pages does not auto-build on push in this repo).
- [ ] **Step 4: Verify** — `gh api "repos/ialvarezz/llm-intuition/pages" --jq .html_url`, then open `<that URL>context-reasoning/index.html` and `<that URL>context-reasoning/deck.html`: both render over HTTPS, cards/slides navigate, a spot-checked interactive works live.
- [ ] **Step 5: Report the live URLs to the user.**
