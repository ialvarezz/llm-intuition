# Module 1: LLM Fundamentals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Module 1 of llm-intuition: 8 deep-dive markdown notes (`notes/`) paired with 8 interactive HTML concept pages plus a landing page (`docs/`), styled in the approved "Reactor, Intel blue" system, servable on GitHub Pages with zero build step.

**Architecture:** Plain static site. One shared stylesheet (`docs/style.css`); each HTML page carries its own inline `<script>` for its single interactive figure. Markdown notes are authored first per concept, then distilled into the page. No frameworks, no dependencies, no build tooling.

**Tech Stack:** HTML5, CSS3, vanilla ES6 JS, GitHub Pages (serves `docs/` from `main`).

## Global Constraints

- No external JS/CSS dependencies, no CDN links, no fetch calls at runtime. YouTube `<iframe>` embeds are the only external resource allowed.
- Colors: ground `#0a0c0e`, panel `#0d1013`, border `#263039`, classic blue `#0068B5` (grid/structure), energy blue `#00C7FD` (accents/labels/interactive), body text `#dcdee0`, muted `#969ca3`/`#6b7178`. Token/category demo colors: `#00c7fd`, `#e08a3c`, `#4f9ee0`, `#57b06a`, `#b06ad6`.
- Type: monospace stack `ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace` for headlines/labels/crumbs (labels uppercase, letter-spacing ≥ .14em); system sans `ui-sans-serif,system-ui,"Helvetica Neue",Arial,sans-serif` for body prose. Sharp corners everywhere — `border-radius` is forbidden.
- Every page must be readable with JS disabled (figures show a sensible static initial state).
- All internal links relative (no leading `/`), so pages work under the `/<repo>/` GitHub Pages path.
- Notes are written for a software developer with zero ML background. Every note has a "Pro vs. amateur" section and a "References" section with real URLs.
- Content accuracy: every factual claim in notes/pages must be something you can source to the referenced material. No invented numbers.
- Work happens on branch `basic-concepts`. Commit after every task.
- Interactive figures use precomputed/toy data embedded in the page. The tokenizer demo is illustrative, not real BPE, and must be labeled "illustrative" on the page.

## Verification commands

There is no test framework for a static site. Each task uses:

1. `open docs/<page>.html` — visual check in browser: layout renders, figure works, no console errors (open DevTools console).
2. Link check (run from repo root; passes silently when all internal hrefs resolve):

```bash
python3 - <<'EOF'
import re, pathlib, sys
docs = pathlib.Path("docs")
bad = []
for f in docs.glob("*.html"):
    for href in re.findall(r'href="([^"#]+)"', f.read_text()):
        if href.startswith(("http", "mailto")): continue
        if not (docs / href).exists(): bad.append(f"{f.name} -> {href}")
print("\n".join(bad)); sys.exit(1 if bad else 0)
EOF
```

---

### Task 1: Shared stylesheet + page template

**Files:**
- Create: `docs/style.css`
- Create: `docs/_template.html` (working reference copy; deleted in Task 10)

**Interfaces:**
- Produces: the CSS class vocabulary all pages use: `grid-bg`, `site-header`, `brand`, `crumb`, `hero`, `sub`, `meta`, `panel`, `panel-hd`, `prose`, `refs`, `ref`, `pager`, `figure-note`, `btn`, token classes `tk c1..c5`. Every later task copies `_template.html` (or the then-latest page) as its skeleton.

- [ ] **Step 1: Write `docs/style.css`**

```css
:root{
  --bg:#0a0c0e; --panel:#0d1013; --line:#263039;
  --blue:#00c7fd; --blue-deep:#0068b5;
  --fg:#dcdee0; --muted:#969ca3; --faint:#6b7178;
  --mono:ui-monospace,"SF Mono",SFMono-Regular,Menlo,Consolas,monospace;
  --sans:ui-sans-serif,system-ui,"Helvetica Neue",Arial,sans-serif;
}
*{box-sizing:border-box;}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--sans);}
a{color:var(--blue);}

/* backdrop grid */
.grid-bg{position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:linear-gradient(rgba(0,104,181,.07) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,104,181,.07) 1px,transparent 1px);
  background-size:32px 32px;}
main{position:relative;z-index:1;max-width:960px;margin:0 auto;}

/* header */
.site-header{position:relative;z-index:1;display:flex;align-items:center;gap:24px;
  justify-content:space-between;padding:14px 28px;border-bottom:1px solid var(--line);
  flex-wrap:wrap;}
.brand{font-family:var(--mono);font-size:.85rem;letter-spacing:.14em;color:#eef1f4;
  text-decoration:none;}
.brand b{color:var(--blue);}
.site-header nav{display:flex;gap:22px;font-family:var(--mono);font-size:.7rem;
  letter-spacing:.16em;text-transform:uppercase;flex-wrap:wrap;}
.site-header nav a{color:#848a91;text-decoration:none;}
.site-header nav a.on{color:var(--blue);}

/* hero */
.hero{padding:64px 28px 48px;max-width:820px;}
.crumb{font-family:var(--mono);font-size:.68rem;letter-spacing:.22em;color:var(--blue);
  text-transform:uppercase;}
.crumb::before{content:"▸ ";}
.hero h1{font-family:var(--mono);font-size:clamp(1.8rem,5vw,2.6rem);margin:14px 0 12px;
  font-weight:700;letter-spacing:-.01em;color:#f3f5f7;text-wrap:balance;}
.hero h1 .hl{color:var(--blue);}
.sub{color:var(--muted);line-height:1.65;max-width:58ch;margin:0;}
.meta{display:flex;gap:28px;margin-top:26px;font-family:var(--mono);font-size:.68rem;
  letter-spacing:.14em;color:var(--faint);text-transform:uppercase;flex-wrap:wrap;}
.meta b{color:var(--fg);font-weight:600;}

/* figure panel */
.panel{margin:12px 28px 48px;border:1px solid var(--line);background:var(--panel);
  box-shadow:0 0 24px rgba(0,104,181,.10);}
.panel-hd{display:flex;justify-content:space-between;align-items:center;gap:12px;
  padding:10px 16px;border-bottom:1px solid var(--line);font-family:var(--mono);
  font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:#848a91;flex-wrap:wrap;}
.panel-hd .dot{color:var(--blue);}
.panel-body{padding:22px 16px;overflow-x:auto;}
.panel-ft{padding:10px 16px;border-top:1px solid var(--line);font-family:var(--mono);
  font-size:.72rem;color:var(--faint);letter-spacing:.12em;}
.panel-ft b{color:var(--blue);}
.figure-note{padding:8px 16px;border-top:1px solid var(--line);font-size:.75rem;
  color:var(--faint);}

/* controls inside panels */
.btn{font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;
  background:none;border:1px solid var(--blue-deep);color:var(--blue);padding:8px 16px;
  cursor:pointer;}
.btn:hover{background:rgba(0,199,253,.1);}
.btn:focus-visible{outline:2px solid var(--blue);outline-offset:2px;}
input[type=range]{accent-color:var(--blue-deep);}
textarea,input[type=text]{background:var(--bg);border:1px solid var(--line);color:var(--fg);
  font-family:var(--mono);font-size:.95rem;padding:10px;width:100%;}

/* token demo */
.tk{padding:3px 2px;border-bottom:2px solid;cursor:default;transition:background .12s;
  font-family:var(--mono);}
.tk:hover{background:rgba(0,199,253,.16);}
.tk.c1{border-color:#00c7fd;}.tk.c2{border-color:#e08a3c;}.tk.c3{border-color:#4f9ee0;}
.tk.c4{border-color:#57b06a;}.tk.c5{border-color:#b06ad6;}

/* prose */
.prose{padding:0 28px 40px;max-width:760px;color:#adb3ba;line-height:1.75;}
.prose h2{font-family:var(--mono);color:#eef1f4;font-size:1.05rem;letter-spacing:.06em;
  text-transform:uppercase;margin-top:2.2em;}
.prose h2::before{content:"// ";color:var(--blue);}
.prose strong{color:var(--fg);}
.prose code{font-family:var(--mono);background:var(--panel);border:1px solid var(--line);
  padding:1px 5px;font-size:.9em;}

/* video embed */
.video{margin:12px 28px 48px;border:1px solid var(--line);aspect-ratio:16/9;}
.video iframe{width:100%;height:100%;border:0;display:block;}

/* references */
.refs{margin:0 28px 40px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));
  gap:1px;background:var(--line);border:1px solid var(--line);}
.ref{background:var(--panel);padding:16px;text-decoration:none;display:block;}
.ref:hover{background:#121820;}
.ref .src{font-family:var(--mono);font-size:.62rem;letter-spacing:.2em;color:var(--blue);
  text-transform:uppercase;}
.ref .t{margin-top:6px;font-size:.88rem;color:var(--fg);line-height:1.4;}

/* prev/next pager */
.pager{display:flex;justify-content:space-between;margin:0 28px 64px;gap:1px;
  border:1px solid var(--line);background:var(--line);}
.pager a{flex:1;background:var(--panel);padding:16px;text-decoration:none;
  font-family:var(--mono);font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;
  color:#848a91;}
.pager a:hover{color:var(--blue);}
.pager a.next{text-align:right;}
.pager span.gap{flex:1;background:var(--panel);}

@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important;}}
```

- [ ] **Step 2: Write `docs/_template.html`** — the canonical page skeleton every concept page starts from:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>NN · Concept Title — llm::intuition</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div class="grid-bg"></div>
<header class="site-header">
  <a class="brand" href="index.html"><b>▚</b> LLM<b>::</b>INTUITION</a>
  <nav>
    <a href="index.html">Index</a>
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
    <span class="crumb">Module 01 / Concept NN</span>
    <h1>Concept <span class="hl">Title</span></h1>
    <p class="sub">One-paragraph subtitle.</p>
    <div class="meta"><span>Read <b>X min</b></span><span>Level <b>Fundamentals</b></span><span>Prereq <b>Concept NN-1</b></span></div>
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

For page 01 the pager's prev slot is `<span class="gap"></span>`; for page 08 the next slot is.

- [ ] **Step 3: Verify** — `open docs/_template.html`: dark ground, blue grid backdrop, mono headline, panel with glow, pager. No console errors. (Nav links 404 until later tasks — expected; skip the link checker here.)

- [ ] **Step 4: Commit** — `git add docs/style.css docs/_template.html && git commit -m "feat: Reactor Intel-blue stylesheet and page template"`

---

### Task 2: Concept 01 — What is an LLM (note + page) — PATTERN VALIDATOR

**Files:**
- Create: `notes/01-what-is-an-llm.md`
- Create: `docs/01-what-is-an-llm.html`

**Interfaces:**
- Consumes: `docs/style.css`, `docs/_template.html` skeleton from Task 1.
- Produces: the content-depth and figure-style exemplar every later task imitates. **STOP after this task for user review before proceeding.**

- [ ] **Step 1: Write `notes/01-what-is-an-llm.md`** covering, in this order, in your own thorough prose (target 1,500–2,500 words):
  - **The one-sentence truth:** an LLM is a next-token prediction machine — given a sequence of tokens, it outputs a probability distribution over the next token; everything else (chat, reasoning, coding) is built on repeating that step.
  - **From autocomplete to assistant:** why pure next-token prediction over internet-scale text yields capabilities; the base model vs. assistant model distinction (pointer to note 07).
  - **What "large" means:** parameters as learned weights; rough scale ladder (GPT-2 1.5B → GPT-3 175B → frontier models); parameters ≠ database of facts — weights encode statistical patterns, not retrievable records.
  - **The generation loop:** prompt → tokenize → forward pass → distribution → sample one token → append → repeat until stop token or limit. Emphasize the model is stateless between calls; the growing sequence IS the state.
  - **What an LLM is not:** not a knowledge base with lookups, not deterministic by default, does not "read" — it consumes tokens (pointer to note 02), no persistent memory between conversations (pointer to note 05).
  - **Pro vs. amateur** (each with the why): pros think in tokens and distributions, not words and answers; pros know hallucination is the mechanism working as designed (fluent continuation ≠ truth); pros know the model can't count its own output reliably; pros know "the model learned X" means "X was statistically present in training data".
  - **References** (exact URLs):
    - Karpathy — Intro to Large Language Models: `https://www.youtube.com/watch?v=zjkBMFhNj_g`
    - 3Blue1Brown — But what is a GPT?: `https://www.youtube.com/watch?v=wjZofJX0v4M`
    - Anthropic docs glossary: `https://docs.anthropic.com/en/docs/resources/glossary`
    - GPT-3 paper (Brown et al. 2020): `https://arxiv.org/abs/2005.14165`

- [ ] **Step 2: Write `docs/01-what-is-an-llm.html`** — copy `_template.html`, fill:
  - Title `01 · What is an LLM — llm::intuition`, crumb `Module 01 / Concept 01`, h1 `What is an <span class="hl">LLM</span>`, nav `01` gets `class="on"`.
  - Subtitle: "A large language model does exactly one thing: given a sequence of tokens, it predicts what comes next. Everything you've seen an LLM do is that single operation, repeated."
  - Prose: 4 condensed sections from the note (`// The only operation`, `// The generation loop`, `// What it is not`, `// Pro vs. amateur`).
  - Embed Karpathy video: `<div class="video"><iframe src="https://www.youtube.com/embed/zjkBMFhNj_g" title="Intro to Large Language Models" allowfullscreen loading="lazy"></iframe></div>`
  - Reference cards for all 4 references from the note.
  - Pager: prev = `<span class="gap"></span>`, next = `02-tokens-and-tokenization.html`.
  - **Figure: next-token prediction stepper.** Panel header `● NEXT-TOKEN PREDICTION / INTERACTIVE`. Markup inside `panel-body`:

```html
<div id="gen-text" style="font-family:var(--mono);font-size:1.05rem;line-height:2;min-height:3.5em;">The best way to learn about neural networks is</div>
<div id="gen-dist" style="display:flex;flex-direction:column;gap:6px;margin:18px 0;"></div>
<button class="btn" id="gen-btn">Sample next token ▸</button>
```

  Inline script — precomputed chain of steps; each step shows top-5 candidate bars, clicking samples the bolded pick and advances:

```html
<script>
const steps = [
  {picks:[[" to",42],[" through",21],[" by",14],[" with",9],[" from",5]], take:" to"},
  {picks:[[" build",38],[" read",22],[" start",15],[" write",11],[" study",7]], take:" build"},
  {picks:[[" one",44],[" them",19],[" a",15],[" your",10],[" small",6]], take:" one"},
  {picks:[[" yourself",51],[" from",23],[" step",11],[" at",7],[" of",4]], take:" yourself"},
  {picks:[[".",63],[" first",14],[",",10],[" today",6],[" slowly",3]], take:"."},
];
let i = 0;
const txt = document.getElementById("gen-text"),
      dist = document.getElementById("gen-dist"),
      btn = document.getElementById("gen-btn"),
      ft  = document.getElementById("fig-ft");
function showDist(){
  dist.innerHTML = steps[i].picks.map(([tok,p]) =>
    `<div style="display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.8rem;">
       <span style="width:90px;color:${tok===steps[i].take?'var(--blue)':'var(--faint)'}">"${tok}"</span>
       <span style="height:12px;width:${p*3}px;background:${tok===steps[i].take?'var(--blue)':'#263039'}"></span>
       <span style="color:var(--faint)">${p}%</span></div>`).join("");
  ft.textContent = `STEP ${i+1}/${steps.length} — MODEL OUTPUTS A DISTRIBUTION; ONE TOKEN IS SAMPLED`;
}
btn.addEventListener("click", () => {
  txt.innerHTML += `<span style="color:var(--blue)">${steps[i].take}</span>`;
  i++;
  if (i >= steps.length){ btn.disabled = true; btn.textContent = "Sequence complete"; ft.textContent = "DONE — EVERY TOKEN WAS GENERATED THE SAME WAY"; dist.innerHTML=""; }
  else showDist();
});
showDist();
</script>
```

  - Add `<div class="figure-note">Probabilities are illustrative, not from a real model.</div>` after `panel-ft`.

- [ ] **Step 3: Verify** — `open docs/01-what-is-an-llm.html`: figure steps through all 5 tokens and disables cleanly; video loads; zero console errors; with JS disabled the prompt text still reads.

- [ ] **Step 4: Commit** — `git add notes/01-what-is-an-llm.md docs/01-what-is-an-llm.html && git commit -m "feat: concept 01 — what is an LLM (note + page)"`

- [ ] **Step 5: CHECKPOINT — request user review of note depth + page look before Task 3.**

---

### Task 3: Concept 02 — Tokens & tokenization

**Files:**
- Create: `notes/02-tokens-and-tokenization.md`
- Create: `docs/02-tokens-and-tokenization.html`

**Interfaces:**
- Consumes: skeleton = copy of `docs/01-what-is-an-llm.html` (strip its figure/prose, keep structure); `.tk` classes from `style.css`.

- [ ] **Step 1: Write `notes/02-tokens-and-tokenization.md`** covering: what a token is (subword fragment from a fixed vocabulary); why not characters (sequences too long) and why not words (vocabulary explosion, unknown words); BPE intuition — start from bytes, repeatedly merge the most frequent adjacent pair, vocabulary ~50k–200k; the same text tokenizes differently across model families; special tokens (BOS/EOS, chat-format markers). **Pro vs. amateur:** token counts ≠ word counts (English ≈ 1.3 tokens/word, code and non-Latin scripts cost more — budgeting in "words" silently overflows context); pricing and context limits are in tokens; weird model behavior around rare strings (usernames, long numbers) is often tokenization; " hello" and "hello" are different tokens — leading whitespace matters in prompts; models are bad at character-level tasks (spelling, counting letters) *because* they never see characters. **References:** Karpathy "Let's build the GPT Tokenizer" `https://www.youtube.com/watch?v=zduSFxRajkE`; OpenAI tokenizer playground `https://platform.openai.com/tokenizer`; tiktoken `https://github.com/openai/tiktoken`; BPE paper (Sennrich 2015) `https://arxiv.org/abs/1508.07909`.

- [ ] **Step 2: Write `docs/02-tokens-and-tokenization.html`** — hero as per template (h1 `Tokens &amp; Tokeni<span class="hl">z</span>ation`, subtitle from the spec sample: "A model never sees words…"). Prose sections: `// Why subwords`, `// How BPE carves text`, `// One text, many tokenizations`, `// Pro vs. amateur`. Embed Karpathy tokenizer video (`https://www.youtube.com/embed/zduSFxRajkE`). Reference cards for all 4 references. Pager 01 ↔ 03.
  - **Figure: live illustrative tokenizer.** Panel header `● TOKENIZER / INTERACTIVE`, label `ILLUSTRATIVE · NOT REAL BPE`. Markup:

```html
<textarea id="tok-in" rows="2">The transformer reads subword pieces, not words.</textarea>
<div id="tok-out" style="font-size:1.05rem;line-height:2.2;margin-top:16px;"></div>
```

  Script — split on a toy merge list so common fragments group like real BPE output; count characters and "tokens"; footer shows `SEQUENCE LENGTH: N TOKENS · M CHARS`:

```html
<script>
const COMMON = ["the","ing","tion","er","re","sub","form","and","is","not","word","piece","read"];
function toyTokenize(text){
  const out = [];
  for (const word of text.split(/(\s+)/)){
    if (!word) continue;
    if (/^\s+$/.test(word)) { if (out.length) out[out.length-1].glue = word; continue; }
    let rest = word.toLowerCase(), orig = word, pos = 0;
    while (rest.length){
      const hit = COMMON.find(c => rest.startsWith(c));
      const n = hit ? hit.length : Math.min(rest.length, 4);
      out.push({s: orig.slice(pos, pos + n), glue: ""});
      pos += n; rest = rest.slice(n);
    }
  }
  return out;
}
const inp = document.getElementById("tok-in"), out = document.getElementById("tok-out"),
      ft = document.getElementById("fig-ft");
function render(){
  const toks = toyTokenize(inp.value);
  out.innerHTML = toks.map((t,i) =>
    `<span class="tk c${i%5+1}">${t.glue.replace(/ /g,"&nbsp;")}${t.s}</span>`).join("");
  ft.innerHTML = `SEQUENCE LENGTH: <b>${toks.length} TOKENS</b> · ${inp.value.length} CHARS`;
}
inp.addEventListener("input", render);
render();
</script>
```

  - `figure-note`: "This split is illustrative. Real tokenizers (BPE) learn their merges from data — try the OpenAI tokenizer playground for the real thing."

- [ ] **Step 3: Verify** — `open docs/02-tokens-and-tokenization.html`: typing retokenizes live, count updates, colors cycle. Zero console errors.

- [ ] **Step 4: Commit** — `git add notes/02-tokens-and-tokenization.md docs/02-tokens-and-tokenization.html && git commit -m "feat: concept 02 — tokens and tokenization"`

---

### Task 4: Concept 03 — Embeddings

**Files:**
- Create: `notes/03-embeddings.md`
- Create: `docs/03-embeddings.html`

- [ ] **Step 1: Write `notes/03-embeddings.md`** covering: tokens become vectors — an embedding is a learned list of numbers positioning a token in a high-dimensional space; similarity = proximity (cosine similarity in one intuitive paragraph, no heavy math); the classic king − man + woman ≈ queen arithmetic and its limits; token embeddings (inside the model) vs. sentence/document embeddings (embedding APIs) — same idea, different granularity; why this matters for the roadmap: semantic search and RAG run on embedding proximity (pointer: Module 2). **Pro vs. amateur:** embedding models are separate from chat models and much cheaper; distances are only comparable within the same model — never mix vectors from two models in one index; "semantic" similarity is trained similarity (a model tuned on code ranks things differently than a general one); dimensionality (e.g. 768 vs 3072) trades cost against nuance. **References:** word2vec paper (Mikolov 2013) `https://arxiv.org/abs/1301.3781`; OpenAI embeddings guide `https://platform.openai.com/docs/guides/embeddings`; Google ML crash course — embeddings `https://developers.google.com/machine-learning/crash-course/embeddings`; Anthropic embeddings docs `https://docs.anthropic.com/en/docs/build-with-claude/embeddings`.

- [ ] **Step 2: Write `docs/03-embeddings.html`** — h1 `Embed<span class="hl">dings</span>`; subtitle: "Before a model can compute with a token, the token becomes a vector — a point in a space where distance means similarity. That one idea powers everything from attention to RAG." Prose: `// From symbols to geometry`, `// Distance is meaning`, `// Token vs. document embeddings`, `// Pro vs. amateur`. References per note. Pager 02 ↔ 04.
  - **Figure: 2D word map.** Panel header `● EMBEDDING SPACE / INTERACTIVE`, label `2D PROJECTION · TOY DATA`. An inline SVG scatter (~500×340) of ~18 words in hand-placed clusters — animals (dog, cat, wolf, kitten), royalty (king, queen, prince), tech (laptop, server, keyboard, code), food (pizza, sushi, bread), verbs (run, walk, sprint) — hover a word: it highlights energy blue, its 3 nearest neighbors (precomputed) highlight, dashed lines connect, footer shows `NEAREST TO "KING": QUEEN · PRINCE · THRONE`. Data format in script:

```html
<script>
const WORDS = [
  {w:"dog",x:80,y:70,near:["cat","wolf","kitten"]},
  {w:"cat",x:120,y:95,near:["kitten","dog","wolf"]},
  {w:"kitten",x:105,y:140,near:["cat","dog","wolf"]},
  {w:"wolf",x:45,y:110,near:["dog","cat","kitten"]},
  {w:"king",x:400,y:60,near:["queen","prince","throne"]},
  {w:"queen",x:445,y:85,near:["king","prince","throne"]},
  {w:"prince",x:415,y:120,near:["king","queen","throne"]},
  {w:"throne",x:460,y:140,near:["king","queen","prince"]},
  {w:"laptop",x:90,y:270,near:["keyboard","server","code"]},
  {w:"keyboard",x:140,y:300,near:["laptop","code","server"]},
  {w:"server",x:55,y:305,near:["laptop","code","keyboard"]},
  {w:"code",x:120,y:250,near:["laptop","keyboard","server"]},
  {w:"pizza",x:280,y:280,near:["sushi","bread","cat"]},
  {w:"sushi",x:320,y:300,near:["pizza","bread","cat"]},
  {w:"bread",x:300,y:255,near:["pizza","sushi","cat"]},
  {w:"run",x:300,y:120,near:["sprint","walk","dog"]},
  {w:"sprint",x:330,y:90,near:["run","walk","dog"]},
  {w:"walk",x:270,y:150,near:["run","sprint","dog"]},
];
const svg = document.getElementById("emb-svg"), ft = document.getElementById("fig-ft");
const byName = Object.fromEntries(WORDS.map(d => [d.w, d]));
svg.innerHTML = WORDS.map(d =>
  `<g class="pt" data-w="${d.w}" style="cursor:default">
     <circle cx="${d.x}" cy="${d.y}" r="4" fill="#0068b5"/>
     <text x="${d.x+8}" y="${d.y+4}" fill="#969ca3" font-size="12" font-family="ui-monospace,Menlo,monospace">${d.w}</text>
   </g>`).join("") + `<g id="emb-links"></g>`;
const links = document.getElementById("emb-links");
svg.querySelectorAll(".pt").forEach(g => {
  g.addEventListener("mouseenter", () => {
    const d = byName[g.dataset.w];
    links.innerHTML = d.near.map(n =>
      `<line x1="${d.x}" y1="${d.y}" x2="${byName[n].x}" y2="${byName[n].y}"
        stroke="#00c7fd" stroke-dasharray="4 3" stroke-width="1"/>`).join("");
    svg.querySelectorAll(".pt").forEach(o => {
      const on = o === g || d.near.includes(o.dataset.w);
      o.querySelector("circle").setAttribute("fill", on ? "#00c7fd" : "#0068b5");
      o.querySelector("text").setAttribute("fill", on ? "#00c7fd" : "#969ca3");
    });
    ft.innerHTML = `NEAREST TO "<b>${d.w.toUpperCase()}</b>": ${d.near.map(x=>x.toUpperCase()).join(" · ")}`;
  });
  g.addEventListener("mouseleave", () => {
    links.innerHTML = "";
    svg.querySelectorAll(".pt").forEach(o => {
      o.querySelector("circle").setAttribute("fill", "#0068b5");
      o.querySelector("text").setAttribute("fill", "#969ca3");
    });
    ft.textContent = "HOVER A WORD TO SEE ITS NEIGHBORS";
  });
});
ft.textContent = "HOVER A WORD TO SEE ITS NEIGHBORS";
</script>
```

  Panel body contains `<svg id="emb-svg" viewBox="0 0 520 340" style="width:100%;max-width:560px;display:block"></svg>`. `figure-note`: "Real embeddings have hundreds to thousands of dimensions; this is a hand-made 2D sketch of the idea."

- [ ] **Step 3: Verify** — hover highlights neighbors + dashed lines, footer updates, mouseleave resets. Zero console errors.

- [ ] **Step 4: Commit** — `git add notes/03-embeddings.md docs/03-embeddings.html && git commit -m "feat: concept 03 — embeddings"`

---

### Task 5: Concept 04 — Attention & transformers

**Files:**
- Create: `notes/04-attention-and-transformers.md`
- Create: `docs/04-attention-and-transformers.html`

- [ ] **Step 1: Write `notes/04-attention-and-transformers.md`** covering: the problem — a token's meaning depends on context ("bank" in two sentences); attention as each token asking "which earlier tokens matter to me right now?" and blending their information, weighted; query/key/value in plain analogy (query = what I'm looking for, key = what I advertise, value = what I hand over) — one intuitive pass, no matrix math; multi-head = several attention patterns in parallel (one head tracks syntax, another coreference); the transformer = stacked layers of attention + feed-forward, and causal masking (a token only attends backward); why transformers won: attention over a whole sequence is parallelizable on GPUs, unlike RNNs. **Pro vs. amateur:** attention is quadratic in sequence length — that's why long contexts are expensive and why context limits exist at all; attention weights ≠ explanations (interpretability caveat); "the model attends to X" is per-head, per-layer, not a single number; positional encoding exists because attention itself is order-blind. **References:** Attention Is All You Need `https://arxiv.org/abs/1706.03762`; Jay Alammar — The Illustrated Transformer `https://jalammar.github.io/illustrated-transformer/`; 3Blue1Brown — Attention in transformers `https://www.youtube.com/watch?v=eMlx5fFNoYc`; Anthropic — Transformer Circuits `https://transformer-circuits.pub/2021/framework/index.html`.

- [ ] **Step 2: Write `docs/04-attention-and-transformers.html`** — h1 `Attention &amp; <span class="hl">Transformers</span>`; subtitle: "Every token looks back at every token before it and asks: how much do you matter to what I say next? That question, asked in parallel across the whole sequence, is the transformer." Prose: `// The context problem`, `// Queries, keys, values`, `// Heads and layers`, `// Why transformers won`, `// Pro vs. amateur`. Embed 3Blue1Brown video (`https://www.youtube.com/embed/eMlx5fFNoYc`). References per note. Pager 03 ↔ 05.
  - **Figure: attention heatmap stepper.** Panel header `● CAUSAL ATTENTION / INTERACTIVE`, label `ONE HEAD · TOY WEIGHTS`. Sentence: `The robot picked up the ball because it was light`. A row of token chips; below, for the selected token, horizontal bars showing its attention to each previous token. Step button advances the selected token left→right. Key moment: when `it` is selected, `ball` gets the dominant weight. Data + script:

```html
<div id="att-toks" style="display:flex;gap:6px;flex-wrap:wrap;font-family:var(--mono);font-size:.9rem;"></div>
<div id="att-bars" style="margin-top:18px;display:flex;flex-direction:column;gap:5px;"></div>
<button class="btn" id="att-btn" style="margin-top:16px;">Next token ▸</button>
<script>
const TOKS = ["The","robot","picked","up","the","ball","because","it","was","light"];
const ATT = { // attention of token i over tokens 0..i-1 (percent, illustrative)
  1:[100],2:[10,90],3:[5,25,70],4:[40,10,25,25],5:[15,10,30,15,30],
  6:[5,10,25,5,10,45],7:[3,12,5,2,3,62,13],8:[4,10,6,2,4,20,10,44],
  9:[2,6,4,2,2,38,8,30,8],
};
let cur = 1;
const tEl = document.getElementById("att-toks"), bEl = document.getElementById("att-bars"),
      btn = document.getElementById("att-btn"), ft = document.getElementById("fig-ft");
function draw(){
  tEl.innerHTML = TOKS.map((t,i) =>
    `<span style="padding:4px 8px;border:1px solid ${i===cur?'#00c7fd':'#263039'};
      color:${i===cur?'#00c7fd':i<cur?'#dcdee0':'#4a4f55'}">${t}</span>`).join("");
  bEl.innerHTML = ATT[cur].map((p,i) =>
    `<div style="display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.78rem;">
       <span style="width:80px;color:var(--faint)">${TOKS[i]}</span>
       <span style="height:11px;width:${p*2.6}px;background:${p===Math.max(...ATT[cur])?'#00c7fd':'#0068b5'}"></span>
       <span style="color:var(--faint)">${p}%</span></div>`).join("");
  ft.innerHTML = `TOKEN "<b>${TOKS[cur].toUpperCase()}</b>" ATTENDS BACKWARD — CAUSAL MASK HIDES THE FUTURE`;
}
btn.addEventListener("click", () => { cur = cur === 9 ? 1 : cur + 1; draw(); });
draw();
</script>
```

  `figure-note`: "Weights are hand-made to show the idea. Note what happens when “it” is selected."

- [ ] **Step 3: Verify** — stepping cycles tokens 1→9→1; `it` step shows `ball` dominant; zero console errors.

- [ ] **Step 4: Commit** — `git add notes/04-attention-and-transformers.md docs/04-attention-and-transformers.html && git commit -m "feat: concept 04 — attention and transformers"`

---

### Task 6: Concept 05 — Context window

**Files:**
- Create: `notes/05-context-window.md`
- Create: `docs/05-context-window.html`

- [ ] **Step 1: Write `notes/05-context-window.md`** covering: the context window is the model's entire working world — a hard cap on tokens the attention mechanism can see (system prompt + conversation + documents + its own output, all in one budget); "memory" in chat apps is re-sending history every turn — the model remembers nothing between calls; what happens at the limit (truncation/eviction — old turns silently fall off); KV cache in plain terms: attention re-reads everything each generated token, so past keys/values are cached — why long prompts cost more at first token, why cached prefixes are cheaper (prompt caching); long-context ≠ perfect recall — retrieval quality degrades mid-context ("lost in the middle"). **Pro vs. amateur:** the window includes the *output* — a maxed-out prompt leaves no room to answer; instructions at the start of a very long context get weaker — repeat critical constraints near the end; context is priced per token, so stuffing docs in is the expensive alternative to retrieval (RAG pointer, Module 2); "128k context" marketing ≠ uniform attention quality across 128k. **References:** Anthropic — context windows `https://docs.anthropic.com/en/docs/build-with-claude/context-windows`; Lost in the Middle (Liu et al. 2023) `https://arxiv.org/abs/2307.03172`; Anthropic — prompt caching `https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching`; Anthropic — effective context engineering `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`.

- [ ] **Step 2: Write `docs/05-context-window.html`** — h1 `The Context <span class="hl">Window</span>`; subtitle: "A model has no memory — only a window. Everything it knows about your conversation must fit inside, every single turn, and the window is always closer to full than you think." Prose: `// The window is the world`, `// Memory is re-sending`, `// The KV cache`, `// Lost in the middle`, `// Pro vs. amateur`. References per note. Pager 04 ↔ 06.
  - **Figure: context budget simulator.** Panel header `● CONTEXT BUDGET / INTERACTIVE`, label `TOY BUDGET · 8K TOKENS`. A horizontal stacked bar (full width = 8,000 tokens) with colored segments: system prompt (`#b06ad6`), documents (`#4f9ee0`), conversation history (`#57b06a`), reserved output (`#e08a3c`), free (`#263039`). Buttons: `+ Add a turn` (history +600, simulating a Q&A exchange), `+ Paste a doc` (documents +1500), `Reset`. When free space hits 0, oldest-history tokens are evicted first: history shrinks, footer flashes `EVICTED: OLDEST TURNS FELL OUT OF THE WINDOW` in energy blue. Script:

```html
<div id="ctx-bar" style="display:flex;height:34px;border:1px solid var(--line);overflow:hidden;"></div>
<div id="ctx-legend" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;color:var(--faint);"></div>
<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
  <button class="btn" id="ctx-turn">+ Add a turn</button>
  <button class="btn" id="ctx-doc">+ Paste a doc</button>
  <button class="btn" id="ctx-reset">Reset</button>
</div>
<script>
const CAP = 8000, OUT = 1000;
let seg;
const COLORS = {system:"#b06ad6",docs:"#4f9ee0",history:"#57b06a",output:"#e08a3c",free:"#1a2027"};
const LABELS = {system:"SYSTEM",docs:"DOCUMENTS",history:"HISTORY",output:"RESERVED OUTPUT",free:"FREE"};
const bar = document.getElementById("ctx-bar"), leg = document.getElementById("ctx-legend"),
      ft = document.getElementById("fig-ft");
function reset(){ seg = {system:400, docs:0, history:0, output:OUT}; draw(""); }
function used(){ return seg.system + seg.docs + seg.history + seg.output; }
function add(kind, n){
  seg[kind] += n;
  let msg = "";
  while (used() > CAP && seg.history > 0){
    seg.history = Math.max(0, seg.history - 600);
    msg = "EVICTED: OLDEST TURNS FELL OUT OF THE WINDOW";
  }
  if (used() > CAP){ seg[kind] -= used() - CAP; msg = "WINDOW FULL — REQUEST WOULD BE REJECTED"; }
  draw(msg);
}
function draw(msg){
  const parts = {...seg, free: Math.max(0, CAP - used())};
  bar.innerHTML = Object.entries(parts).filter(([,v]) => v > 0).map(([k,v]) =>
    `<div title="${LABELS[k]}: ${v} tokens" style="width:${v/CAP*100}%;background:${COLORS[k]}"></div>`).join("");
  leg.innerHTML = Object.entries(parts).map(([k,v]) =>
    `<span><span style="display:inline-block;width:9px;height:9px;background:${COLORS[k]};margin-right:6px"></span>${LABELS[k]} ${v}</span>`).join("");
  ft.innerHTML = msg ? `<b>${msg}</b>` : `USED: <b>${used()} / ${CAP} TOKENS</b> — OUTPUT SPACE IS PART OF THE BUDGET`;
}
document.getElementById("ctx-turn").addEventListener("click", () => add("history", 600));
document.getElementById("ctx-doc").addEventListener("click", () => add("docs", 1500));
document.getElementById("ctx-reset").addEventListener("click", reset);
reset();
</script>
```

  `figure-note`: "Toy 8k window. Real windows are larger but fill the same way — and evict the same way."

- [ ] **Step 3: Verify** — adding turns/docs grows segments; overflow evicts history and shows the eviction message; reset works; zero console errors.

- [ ] **Step 4: Commit** — `git add notes/05-context-window.md docs/05-context-window.html && git commit -m "feat: concept 05 — context window"`

---

### Task 7: Concept 06 — Sampling

**Files:**
- Create: `notes/06-sampling.md`
- Create: `docs/06-sampling.html`

- [ ] **Step 1: Write `notes/06-sampling.md`** covering: the model outputs logits → softmax → a probability distribution; sampling picks one token from it; greedy (always argmax) is repetitive and dull; temperature rescales the distribution before sampling — low sharpens toward the top pick, high flattens toward uniform; top-p (nucleus) truncates to the smallest set of tokens whose probabilities sum to p, then samples within; top-k as the simpler cousin; stop sequences and max-tokens end generation. **Pro vs. amateur:** temperature 0 still isn't perfectly deterministic in production (batching/floating-point nondeterminism); temperature and top-p interact — tune one, not both blindly; high temperature raises hallucination odds because tail tokens get real mass; sampling explains why the same prompt gives different answers, and why "regenerate" works; task heuristics: extraction/code → low temperature, brainstorming/creative → higher. **References:** The Curious Case of Neural Text Degeneration (Holtzman 2019, nucleus sampling) `https://arxiv.org/abs/1904.09751`; Hugging Face — How to generate text `https://huggingface.co/blog/how-to-generate`; Anthropic API — temperature `https://docs.anthropic.com/en/api/messages`; OpenAI API reference — sampling params `https://platform.openai.com/docs/api-reference/chat`.

- [ ] **Step 2: Write `docs/06-sampling.html`** — h1 `Sampling: Temperature &amp; <span class="hl">Top-p</span>`; subtitle: "The model doesn't choose the next token — it scores every token, and then a sampler rolls weighted dice. Temperature and top-p are the knobs on those dice." Prose: `// From logits to dice`, `// Temperature`, `// Top-p`, `// Pro vs. amateur`. References per note. Pager 05 ↔ 07.
  - **Figure: distribution reshaper.** Panel header `● SAMPLING KNOBS / INTERACTIVE`, label `NEXT TOKEN AFTER "THE CAPITAL OF FRANCE IS"`. Bar chart (10 candidate tokens with base logits), two sliders: temperature 0.1–2.0 (default 1.0), top-p 0.1–1.0 (default 1.0). Softmax with temperature computed live in JS; bars below the top-p cutoff render dimmed with a `CUT` pattern; a `Sample` button picks a token by the live distribution and highlights it. Script:

```html
<div id="smp-bars" style="display:flex;flex-direction:column;gap:5px;"></div>
<div style="display:grid;grid-template-columns:auto 1fr auto;gap:10px 14px;align-items:center;margin-top:18px;font-family:var(--mono);font-size:.72rem;letter-spacing:.1em;color:var(--faint);max-width:460px;">
  <span>TEMP</span><input type="range" id="smp-t" min="0.1" max="2" step="0.1" value="1"><span id="smp-tv">1.0</span>
  <span>TOP-P</span><input type="range" id="smp-p" min="0.1" max="1" step="0.05" value="1"><span id="smp-pv">1.00</span>
</div>
<button class="btn" id="smp-btn" style="margin-top:16px;">Sample ▸</button>
<script>
const CAND = [["Paris",6.0],["Lyon",3.2],["located",2.8],["the",2.5],["a",2.2],
              ["known",1.9],["beautiful",1.6],["home",1.4],["France",1.1],["Berlin",0.6]];
const bars = document.getElementById("smp-bars"),
      tS = document.getElementById("smp-t"), pS = document.getElementById("smp-p"),
      tV = document.getElementById("smp-tv"), pV = document.getElementById("smp-pv"),
      ft = document.getElementById("fig-ft");
let probs = [], kept = [];
function compute(){
  const T = parseFloat(tS.value), P = parseFloat(pS.value);
  const ex = CAND.map(([,l]) => Math.exp(l / T)), Z = ex.reduce((a,b)=>a+b,0);
  probs = ex.map(e => e / Z);
  const order = probs.map((p,i)=>[p,i]).sort((a,b)=>b[0]-a[0]);
  kept = []; let acc = 0;
  for (const [p,i] of order){ kept.push(i); acc += p; if (acc >= P) break; }
  tV.textContent = T.toFixed(1); pV.textContent = P.toFixed(2);
  draw(-1);
}
function draw(picked){
  bars.innerHTML = CAND.map(([w],i) => {
    const inP = kept.includes(i), pct = (probs[i]*100);
    return `<div style="display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:.78rem;opacity:${inP?1:.35}">
      <span style="width:86px;color:${i===picked?'#00c7fd':'var(--faint)'}">"${w}"</span>
      <span style="height:11px;width:${Math.max(1,pct*3)}px;background:${i===picked?'#00c7fd':inP?'#0068b5':'#263039'}"></span>
      <span style="color:var(--faint)">${pct.toFixed(1)}%${inP?"":" · CUT"}</span></div>`;
  }).join("");
  ft.innerHTML = picked >= 0
    ? `SAMPLED: "<b>${CAND[picked][0]}</b>" — RUN IT AGAIN, IT MAY DIFFER`
    : `DISTRIBUTION OVER ${kept.length} KEPT TOKEN${kept.length>1?"S":""} — LOWER TEMP SHARPENS, LOWER TOP-P TRUNCATES`;
}
document.getElementById("smp-btn").addEventListener("click", () => {
  const mass = kept.reduce((a,i)=>a+probs[i],0);
  let r = Math.random() * mass;
  for (const i of kept){ r -= probs[i]; if (r <= 0){ draw(i); return; } }
  draw(kept[kept.length-1]);
});
tS.addEventListener("input", compute); pS.addEventListener("input", compute);
compute();
</script>
```

  `figure-note`: "Logits are hand-made; the softmax, temperature, and top-p math is real."

- [ ] **Step 3: Verify** — temp slider reshapes bars (0.1 ≈ all "Paris", 2.0 ≈ flat); top-p dims tail with CUT; Sample highlights and varies across clicks at temp 1; zero console errors.

- [ ] **Step 4: Commit** — `git add notes/06-sampling.md docs/06-sampling.html && git commit -m "feat: concept 06 — sampling"`

---

### Task 8: Concept 07 — How models are trained

**Files:**
- Create: `notes/07-how-models-are-trained.md`
- Create: `docs/07-how-models-are-trained.html`

- [ ] **Step 1: Write `notes/07-how-models-are-trained.md`** covering: **pretraining** — predict the next token over trillions of tokens of text; loss goes down, capabilities emerge; result is a *base model* (a wild autocomplete, not an assistant); **supervised fine-tuning (SFT)** — thousands of curated (instruction → good response) pairs teach the format of being helpful; **RLHF** — humans rank candidate responses, a reward model learns the ranking, the model is optimized against it; mention Constitutional AI / RLAIF as Anthropic's variant (AI feedback guided by principles); why each stage exists (pretraining = capability, SFT = format, RLHF = preference alignment); post-training is where "personality" comes from. **Pro vs. amateur:** the knowledge cutoff comes from pretraining data, not deployment date; RLHF is why models refuse, hedge, and over-apologize — trained preferences, not comprehension; fine-tuning ≠ teaching new facts (it shapes behavior; knowledge injection is unreliable — that's what retrieval is for); base models still exist under the assistant veneer — odd prompts can surface autocomplete behavior. **References:** InstructGPT (Ouyang 2022) `https://arxiv.org/abs/2203.02155`; Karpathy — State of GPT `https://www.youtube.com/watch?v=bZQun8Y4L2A`; Constitutional AI (Anthropic 2022) `https://arxiv.org/abs/2212.08073`; The Llama 3 Herd of Models (Meta 2024) `https://arxiv.org/abs/2407.21783`.

- [ ] **Step 2: Write `docs/07-how-models-are-trained.html`** — h1 `How Models Are <span class="hl">Trained</span>`; subtitle: "A frontier model is built in stages: a vast autocomplete engine is grown first, then taught to follow instructions, then tuned toward what people actually prefer. Each stage leaves fingerprints you can see in every response." Prose: `// Pretraining: capability`, `// SFT: format`, `// RLHF: preference`, `// Pro vs. amateur`. Embed Karpathy State of GPT (`https://www.youtube.com/embed/bZQun8Y4L2A`). References per note. Pager 06 ↔ 08.
  - **Figure: pipeline stepper.** Panel header `● TRAINING PIPELINE / INTERACTIVE`, label `PRETRAIN → SFT → RLHF`. Three stage boxes in a row connected by arrows; below, a demo prompt `"Explain what a token is"` with a canned response per stage showing behavioral change: pretrain stage answers with rambling autocomplete ("...is a question often asked in forums. Tokens are also used in arcades..."), SFT stage answers correctly but flat, RLHF stage answers helpfully with structure. `Next stage ▸` button advances; active stage box glows energy blue; footer names the stage's job (`CAPABILITY`, `FORMAT`, `PREFERENCE`). Script:

```html
<div id="pipe-stages" style="display:flex;gap:10px;align-items:stretch;font-family:var(--mono);font-size:.7rem;letter-spacing:.12em;flex-wrap:wrap;"></div>
<div style="margin-top:18px;font-family:var(--mono);font-size:.8rem;color:var(--faint)">PROMPT: "Explain what a token is"</div>
<div id="pipe-out" style="margin-top:10px;padding:14px;border:1px solid var(--line);font-size:.9rem;line-height:1.6;color:var(--fg);min-height:5.5em;"></div>
<button class="btn" id="pipe-btn" style="margin-top:16px;">Next stage ▸</button>
<script>
const STAGES = [
  {name:"PRETRAIN", job:"CAPABILITY — PREDICT THE NEXT TOKEN OVER TRILLIONS OF TOKENS",
   out:"…is a question often asked in forums. Tokens are also used in arcades and subway systems. In the 1980s, token-ring networks were popular. See also: token economy, tokenism…"},
  {name:"SFT", job:"FORMAT — LEARN FROM CURATED INSTRUCTION→RESPONSE PAIRS",
   out:"A token is a unit of text used by language models. Text is split into tokens before processing. A token is roughly 4 characters of English."},
  {name:"RLHF", job:"PREFERENCE — OPTIMIZE AGAINST HUMAN RANKINGS OF RESPONSES",
   out:"A token is the basic unit an LLM actually reads — a subword chunk, not a word. \"tokenization\" might split into token + ization. It matters because context limits and pricing are counted in tokens, not words."},
];
let s = 0;
const st = document.getElementById("pipe-stages"), out = document.getElementById("pipe-out"),
      ft = document.getElementById("fig-ft");
function draw(){
  st.innerHTML = STAGES.map((x,i) =>
    `<div style="padding:12px 18px;border:1px solid ${i===s?'#00c7fd':'#263039'};
      color:${i===s?'#00c7fd':i<s?'#dcdee0':'#4a4f55'}">${x.name}</div>` +
    (i < 2 ? `<div style="align-self:center;color:#4a4f55">→</div>` : "")).join("");
  out.textContent = STAGES[s].out;
  ft.textContent = STAGES[s].job;
}
document.getElementById("pipe-btn").addEventListener("click", () => { s = (s+1) % 3; draw(); });
draw();
</script>
```

  `figure-note`: "Responses are illustrative caricatures of each stage's typical behavior."

- [ ] **Step 3: Verify** — stepping cycles the three stages, response text and footer change; zero console errors.

- [ ] **Step 4: Commit** — `git add notes/07-how-models-are-trained.md docs/07-how-models-are-trained.html && git commit -m "feat: concept 07 — how models are trained"`

---

### Task 9: Concept 08 — Scaling laws & model sizes

**Files:**
- Create: `notes/08-scaling-laws-and-model-sizes.md`
- Create: `docs/08-scaling-laws-and-model-sizes.html`

- [ ] **Step 1: Write `notes/08-scaling-laws-and-model-sizes.md`** covering: scaling laws — loss falls predictably as a power law in parameters, data, and compute (Kaplan 2020); Chinchilla's correction — most models were undertrained, compute-optimal is ~20 tokens per parameter, so smaller-but-longer-trained wins (Hoffmann 2022); emergent-looking capabilities appear as scale grows; why labs bet billions on curves; the size spectrum in practice — small/fast/cheap models vs frontier models, and distillation; inference cost scales with size, which is why model *choice* is an engineering decision. **Pro vs. amateur:** "bigger is better" stopped being the whole story in 2022 — data quality and post-training matter as much; parameter count is a weak proxy across families (a well-trained 8B can beat an old 70B); for production, latency/cost/quality is a three-way trade — route easy tasks to small models; benchmarks saturate and get gamed — trust task-specific evals over leaderboards. **References:** Scaling Laws for Neural Language Models (Kaplan 2020) `https://arxiv.org/abs/2001.08361`; Training Compute-Optimal LLMs / Chinchilla (Hoffmann 2022) `https://arxiv.org/abs/2203.15556`; Emergent Abilities of LLMs (Wei 2022) `https://arxiv.org/abs/2206.07682`; Anthropic — model overview `https://docs.anthropic.com/en/docs/about-claude/models/overview`.

- [ ] **Step 2: Write `docs/08-scaling-laws-and-model-sizes.html`** — h1 `Scaling Laws &amp; Model <span class="hl">Sizes</span>`; subtitle: "Model quality improves on smooth, predictable curves as compute grows — smooth enough that labs bet billions on where the curve goes next. Reading those curves is also how you pick the right model for a job." Prose: `// The curves`, `// Chinchilla's correction`, `// The size spectrum in practice`, `// Pro vs. amateur`. References per note. Pager: prev = 07, next slot = `<span class="gap"></span>`.
  - **Figure: scaling curve.** Panel header `● SCALING CURVE / INTERACTIVE`, label `LOSS VS COMPUTE · ILLUSTRATIVE`. Inline SVG (~560×340) log-log-style chart: smooth descending power-law curve (precomputed polyline), dots along it for model generations — GPT-2 (2019, 1.5B), GPT-3 (2020, 175B), Chinchilla (2022, 70B), GPT-4-class (2023), frontier (2025) — hover a dot: it glows energy blue, a tooltip `<g>` shows name/year/params, footer shows a one-liner per model (e.g. Chinchilla: `SMALLER BUT TRAINED ON 4× THE DATA — BEAT MODELS 2.5× ITS SIZE`). Axis labels `TRAINING COMPUTE →` and `LOSS ↓` in mono. Implementation mirrors the Task 4 hover pattern: `.pt` groups with `mouseenter`/`mouseleave` listeners updating fills and the footer. Dots at hand-placed coordinates along the curve, e.g. `[[60,80,"GPT-2","2019 · 1.5B","OPENAI'S FIRST HEADLINE-MAKER"],[170,140,"GPT-3","2020 · 175B","SCALE ALONE UNLOCKED IN-CONTEXT LEARNING"],[290,185,"Chinchilla","2022 · 70B","SMALLER BUT TRAINED ON 4× THE DATA — BEAT MODELS 2.5× ITS SIZE"],[400,225,"GPT-4 class","2023 · undisclosed","CURVES PREDICTED ITS LOSS BEFORE IT WAS TRAINED"],[500,255,"Frontier","2025 · undisclosed","POST-TRAINING NOW MATTERS AS MUCH AS SCALE"]]`, curve as `<polyline>` through those points with smoothing, footer default `HOVER A MODEL — THE CURVE WAS DRAWN BEFORE THE MODELS WERE`.
  - `figure-note`: "Axes are unlabeled on purpose — the shape is the lesson, not the numbers."

- [ ] **Step 3: Verify** — hover shows tooltip + footer line per model; zero console errors.

- [ ] **Step 4: Commit** — `git add notes/08-scaling-laws-and-model-sizes.md docs/08-scaling-laws-and-model-sizes.html && git commit -m "feat: concept 08 — scaling laws and model sizes"`

---

### Task 10: Landing page + site-wide link check

**Files:**
- Create: `docs/index.html`
- Delete: `docs/_template.html`

- [ ] **Step 1: Write `docs/index.html`** — same head/header (brand links to `index.html`, nav `Index` gets `class="on"`). Hero: crumb `Module 01 / LLM Fundamentals`, h1 `LLM <span class="hl">Intuition</span>`, subtitle: "How large language models actually work — one concept at a time, from tokens to scaling laws. Built for engineers who use LLMs and want to stop guessing." Meta row: `8 concepts · Fundamentals · No prerequisites`.
  - Below the hero, a card grid reusing `.refs`/`.ref` classes (grid of panels): one card per concept, each an `<a class="ref" href="NN-….html">` with `<span class="src">CONCEPT NN</span>` and `<span class="t">Title — one-line hook</span>`. Hooks: 01 "One operation, repeated"; 02 "The model never sees words"; 03 "Distance is meaning"; 04 "Every token interrogates the past"; 05 "No memory, only a window"; 06 "Weighted dice, two knobs"; 07 "Capability, format, preference"; 08 "The curves labs bet billions on".
  - Footer line (mono, faint): `BUILT WHILE LEARNING · SOURCES: ANTHROPIC / OPENAI / GOOGLE / META / KARPATHY / 3BLUE1BROWN`.

- [ ] **Step 2: Delete the template** — `rm docs/_template.html`

- [ ] **Step 3: Run the site-wide link check** (command from *Verification commands*). Expected: no output, exit 0. Fix any broken href before proceeding.

- [ ] **Step 4: Full manual pass** — `open docs/index.html`; click through all 8 cards; on each page exercise the figure and check the console; walk the prev/next chain 01→08 and back.

- [ ] **Step 5: Commit** — `git add -A docs && git commit -m "feat: landing page, remove template"`

---

### Task 11: Publish

**Files:** none (repo operations)

- [ ] **Step 1: Merge to main** — `git checkout main && git merge basic-concepts && git push origin main`

- [ ] **Step 2: Enable GitHub Pages** — `gh api -X POST "repos/{owner}/{repo}/pages" -f "source[branch]=main" -f "source[path]=/docs"` (if it errors because Pages already exists, use `-X PUT` on the same endpoint).

- [ ] **Step 3: Verify** — `gh api "repos/{owner}/{repo}/pages" --jq .html_url`, then open that URL: landing page renders with the blue grid, cards navigate, a spot-check page's figure works over HTTPS.

- [ ] **Step 4: Report the live URL to the user.**
