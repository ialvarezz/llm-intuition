# Module 01 Deck v2 + Presenter Prep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revise the shipped Module 01 deck (`docs/context-reasoning/deck.html`) from 17 to 20 slides — usability fixes, legends/captions on every interactive, three new slides — and write a presenter prep study document at `notes/context-reasoning/deck-prep.md`.

**Architecture:** All deck changes are edits to the single existing `deck.html` (established convention: one file, inline per-slide IIFE scripts, shared keyboard/click handler at the bottom). New sourced claims are appended to the existing `research/context-reasoning/NN-*.md` dumps — no new research files. The prep doc is a study note in `notes/` following the repo's notes conventions.

**Tech Stack:** HTML5, CSS3, vanilla ES6 JS, GitHub Pages.

## Global Constraints

- No external JS/CSS dependencies, no CDN links, no fetch calls at runtime.
- Sharp corners — no `border-radius`. Reuse `docs/style.css` and deck-local classes as-is; the only style-block additions are the `.leg`/`.cap` classes defined in Task 2.
- All internal links relative, no leading `/`.
- **Research-first rule:** `llm-fundamentals-qa.md` (repo root) is working input, NOT a citable source. Every factual claim added to the deck or prep doc that the existing `research/context-reasoning/NN-*.md` dumps don't already cover must be freshly fetched, quote-audited both directions (live raw re-fetch, exact-substring check, curly quotes normalized), and appended to the relevant dump. No pricing figures anywhere.
- Vendor names (Claude/Opus, GPT, Gemma) are permitted ONLY on the slide-3 tokenizer comparison and the Module A1 Skills cross-link on new slide 12 — a deliberate, user-approved relaxation; everywhere else stays vendor-neutral.
- Illustrative content (toy tokenizer splits, toy token counts, toy attention weights) must be labeled illustrative on-slide.
- The deck's click-to-advance exclusion selector (`a, details, #hud, button, input, textarea, svg`) must keep working for all new interactive elements.
- Work happens on branch `deck-v2`, branched from `main`. Commit after every task. Publish flow: `deck-v2` → `dev` → `main`, then manual Pages build trigger (`gh api -X POST repos/ialvarezz/llm-intuition/pages/builds` — this repo never auto-builds).

## Verification commands

1. `open docs/context-reasoning/deck.html` — visual check; with no browser, verify structurally (tag balance, `node --check` on each extracted `<script>`).
2. Slide-count check (run from repo root; expect `20` and `1`):

```bash
grep -c '<section class="slide"' docs/context-reasoning/deck.html
grep -c 'id="hud"' docs/context-reasoning/deck.html
```

3. Site-wide link check (expect silence, exit 0):

```bash
python3 - <<'EOF'
import re, pathlib, sys
docs = pathlib.Path("docs")
bad = []
for f in list(docs.glob("*.html")) + list(docs.glob("*/*.html")):
    for href in re.findall(r'href="([^"#]+)"', f.read_text()):
        if href.startswith(("http", "mailto")): continue
        if not (f.parent / href).resolve().exists(): bad.append(f"{f} -> {href}")
print("\n".join(bad)); sys.exit(1 if bad else 0)
EOF
```

4. JS validity for the whole deck:

```bash
python3 - <<'EOF'
import re
html = open("docs/context-reasoning/deck.html").read()
for i, s in enumerate(re.findall(r"<script>(.*?)</script>", html, re.S)):
    open(f"/tmp/ds{i}.js", "w").write(s)
print(len(re.findall(r"<script>", html)))
EOF
for f in /tmp/ds*.js; do node --check "$f" || echo "FAIL $f"; done
```

---

### Task 0: Branch setup

**Files:** none (repo operation)

- [ ] **Step 1:** `git checkout main && git pull && git checkout -b deck-v2`
- [ ] **Step 2: Verify** — `git status` clean, `git log -1` matches `main` tip.

---

### Task 1: Research — new sources for effort, prefill, and softmax normalization

**Files:**
- Modify: `research/context-reasoning/05-reasoning.md` (append one source)
- Modify: `research/context-reasoning/04-prompt-roles.md` (append one source)
- Modify: `research/context-reasoning/03-attention-curve.md` (append one source ONLY if the check in Step 3 finds a gap)

**Interfaces:**
- Produces: source ids the deck captions and prep doc cite — `[S4]` (effort/adaptive thinking) in the 05 dump, `[S5]` (prefill) in the 04 dump, and (conditionally) a softmax-normalization quote in the 03 dump. Later tasks state claims ONLY covered by these plus the existing dumps.

- [ ] **Step 1: Fetch and dump the effort/adaptive-thinking source.** URL from the Q&A file: `https://platform.claude.com/docs/en/build-with-claude/effort`. Fetch it; extract verbatim (a) what the effort parameter does, (b) available effort levels and the default, (c) that hard `budget_tokens` caps are deprecated/rejected on current models (if this page doesn't state the deprecation, check the extended-thinking docs page already cited as `[S2]` in `research/context-reasoning/05-reasoning.md` — its live version may now carry it; if neither page states it, the deprecation claim is CUT from slide 15's caption, not stated unsourced). Append as the next `[S#]` block in `research/context-reasoning/05-reasoning.md` with URL + fetch date + verbatim quotes, following the file's existing block format.
- [ ] **Step 2: Fetch and dump the prefill source.** Anthropic's prompt-engineering page on prefilling the assistant response — try `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prefill-claudes-response`; if 404, locate the current URL on the same docs site (same-organization substitution rule, document the substitution). Extract verbatim: prefilling puts partial text in the assistant role and the model continues it; the format-forcing use case (e.g. forcing JSON). Append as the next `[S#]` block in `research/context-reasoning/04-prompt-roles.md`.
- [ ] **Step 3: Verify softmax-normalization coverage.** `grep -i "softmax\|normaliz" research/context-reasoning/03-attention-curve.md`. Slide 9's caption (Task 6) claims attention weights are normalized across positions, so more competing tokens = less weight per token. If the dump already contains a quote supporting normalization (e.g. Vaswani et al.'s softmax attention definition), note that and stop. If not, fetch `https://arxiv.org/abs/1706.03762` (Attention Is All You Need — already a cited reference in that dump), extract the verbatim softmax/normalization sentence from the attention definition, and append it to the existing Vaswani `[S#]` block with a dated note.
- [ ] **Step 4: Quote audit.** For every quote added in Steps 1–3: re-fetch the live URL as raw text, confirm exact substring (normalize curly/straight quotes), and record the audit result in each dump's quote-audit section, following the format already in those files.
- [ ] **Step 5: Verify caching coverage (no new fetch expected).** `grep -i "prefix\|cache" research/context-reasoning/02-context-window.md` — confirm the dump's copied-forward prompt-caching source covers: caching resumes from a prompt prefix, and cached prefixes still occupy the window. The quadratic-bill slide's arithmetic is illustrative math and needs no source; only the caching-mechanism sentence must trace. If (unexpectedly) absent, copy the `[S3]` block forward from `research/05-context-window.md`.
- [ ] **Step 6: Commit** — `git add research/context-reasoning/ && git commit -m "research: effort, prefill, and normalization sources for deck v2"`

---

### Task 2: Keyboard fix, shared caption/legend CSS, slide renumbering

**Files:**
- Modify: `docs/context-reasoning/deck.html`

**Interfaces:**
- Produces: `.leg` and `.cap` CSS classes every later task uses; final slide ids `s-1`…`s-20` with gaps at `s-4`, `s-8`, `s-12` for the new slides (Tasks 4, 5, 7 fill them).

- [ ] **Step 1: Fix the Space-in-textarea bug.** In the deck's bottom `<script>`, replace the keydown listener:

```js
addEventListener("keydown", e => {
  if (e.target.matches("input, textarea")) return;
  if (e.key==="ArrowRight"||e.key===" "||e.key==="PageDown"){ e.preventDefault(); fwd(); }
  if (e.key==="ArrowLeft"||e.key==="PageUp") back();
});
```

- [ ] **Step 2: Add shared classes** to the `<style>` block, after the `.slide input[type=range]` rule:

```css
.leg{display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-family:var(--mono);
  font-size:.66rem;letter-spacing:.1em;color:var(--faint);text-transform:uppercase;}
.leg i{display:inline-block;width:9px;height:9px;margin-right:6px;vertical-align:baseline;}
.cap{margin-top:12px;color:var(--muted);font-size:.85rem;max-width:64ch;line-height:1.65;}
.cap b{color:var(--fg);}
```

- [ ] **Step 3: Renumber slide ids** to their final positions, leaving gaps at 4, 8, 12. Apply these exact replacements IN THIS ORDER (descending old number, so no id ever collides):

| Replace | With |
|---|---|
| `id="s-17"` | `id="s-20"` |
| `id="s-16"` | `id="s-19"` |
| `id="s-15"` | `id="s-18"` |
| `id="s-14"` | `id="s-17"` |
| `id="s-13"` | `id="s-16"` |
| `id="s-12"` | `id="s-15"` |
| `id="s-11"` | `id="s-14"` |
| `id="s-10"` | `id="s-13"` |
| `id="s-9"` | `id="s-11"` |
| `id="s-8"` | `id="s-10"` |
| `id="s-7"` | `id="s-9"` |
| `id="s-6"` | `id="s-7"` |
| `id="s-5"` | `id="s-6"` |
| `id="s-4"` | `id="s-5"` |

(`s-1`…`s-3` unchanged. Ids only affect deep-linking; nav is document-order.)

- [ ] **Step 4: Verify** — `grep -o 'id="s-[0-9]*"' docs/context-reasoning/deck.html` lists s-1,2,3,5,6,7,9,10,11,13,14,15,16,17,18,19,20 in document order, no duplicates. `node --check` the bottom script. Manually confirm: with the deck open, typing space in the slide-3 textarea inserts a space and does not change the HUD counter.
- [ ] **Step 5: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "fix(deck): space types in textarea; add caption/legend classes; renumber for v2"`

---

### Task 3: Slide 3 — multi-model tokenizer comparison

**Files:**
- Modify: `docs/context-reasoning/deck.html` (inside `<section class="slide" id="s-3">`, after the existing `#dk-tok-out` div and before the section's `<script>`)

- [ ] **Step 1: Insert the comparison markup** (static HTML, no new JS):

```html
  <div style="margin-top:22px;font-family:var(--mono);font-size:.66rem;letter-spacing:.14em;color:var(--faint);">SAME SENTENCE, THREE VOCABULARIES · ILLUSTRATIVE</div>
  <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px;max-width:64ch;">
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);width:110px;">CLAUDE (OPUS)</span>
      <span style="font-size:.95rem;"><span class="tk c1">Token</span><span class="tk c2">ization</span><span class="tk c3">&nbsp;differs</span><span class="tk c4">&nbsp;across</span><span class="tk c5">&nbsp;model</span><span class="tk c1">&nbsp;families</span><span class="tk c2">.</span></span>
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);">7 TOKENS</span>
    </div>
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);width:110px;">GPT</span>
      <span style="font-size:.95rem;"><span class="tk c1">Token</span><span class="tk c2">ization</span><span class="tk c3">&nbsp;differs</span><span class="tk c4">&nbsp;across</span><span class="tk c5">&nbsp;model</span><span class="tk c1">&nbsp;fam</span><span class="tk c2">ilies</span><span class="tk c3">.</span></span>
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);">8 TOKENS</span>
    </div>
    <div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;">
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);width:110px;">GEMMA</span>
      <span style="font-size:.95rem;"><span class="tk c1">▁Tokenization</span><span class="tk c2">▁differs</span><span class="tk c3">▁across</span><span class="tk c4">▁model</span><span class="tk c5">▁familie</span><span class="tk c1">s</span><span class="tk c2">.</span></span>
      <span style="font-family:var(--mono);font-size:.72rem;color:var(--faint);">7 TOKENS</span>
    </div>
  </div>
  <div class="cap">Each vendor ships its own learned vocabulary, so the <b>same text costs a different number of tokens per model family</b> — Gemma's SentencePiece marks word boundaries with ▁, GPT and Claude use different BPE merge tables. Splits shown are illustrative; the lesson (counts differ, budget against the model you actually use) is real.</div>
```

- [ ] **Step 2: Verify** — tag balance intact; the three rows render distinct splits and counts (7/8/7); toy tokenizer above still works.
- [ ] **Step 3: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): slide 3 multi-model tokenizer comparison"`

---

### Task 4: New slide 4 — Two famous failures

**Files:**
- Modify: `docs/context-reasoning/deck.html` (insert new `<section class="slide" id="s-4">` immediately after `</section>` of `s-3`, before `s-5`)

- [ ] **Step 1: Insert the slide** (zero new JS — `.pick`/`<details>` pattern):

```html
<section class="slide" id="s-4">
  <span class="kicker">1 · Tokenization</span>
  <h2>Two famous <span class="hl">failures</span>, one cause</h2>
  <div class="pick">
    <details><summary>"How many r's in strawberry?"</summary>
      <div class="ans">The model never sees ten letters. It sees roughly
        <span class="tk c1">str</span><span class="tk c2">aw</span><span class="tk c3">berry</span> — three opaque IDs.
        Nothing in an ID encodes "contains two r's," so counting is a <b>memory recall about spelling</b>, not perception.
        Ask it to write <code>s-t-r-a-w-b-e-r-r-y</code> first and each letter becomes its own visible token — suddenly it can count.</div></details>
    <details><summary>Why is arithmetic shaky?</summary>
      <div class="ans">Token boundaries ignore place value: <span class="tk c1">123</span><span class="tk c2">4</span> + <span class="tk c3">567</span> —
        the 4 and the 7 are both "ones" digits but sit in unrelated chunks, so <b>columns can't align</b>.
        Writing the digits out one at a time rebuilds the alignment in context — which is exactly what step-by-step reasoning does.</div></details>
  </div>
  <div class="cap">Same root cause: <b>the token is the smallest unit the model can perceive</b>. Everything inside one is invisible unless it was separately memorized. Both fixes work by re-spelling the problem into smaller tokens — remember this slide when we get to reasoning.</div>
</section>
```

- [ ] **Step 2: Verify** — 18 `<section class="slide"` now; document order s-1,2,3,4,5,…; `<details>` open/close without advancing the slide.
- [ ] **Step 3: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): new slide 4 — strawberry and arithmetic failures"`

---

### Task 5: Slides 6 & 7 — legends and captions; new slide 8 — the quadratic bill

**Files:**
- Modify: `docs/context-reasoning/deck.html` (sections `s-6`, `s-7`; insert new `s-8` after `s-7`)

- [ ] **Step 1: Slide 6 (context budget).** After the `#dk-cb-bar` div, insert legend + caption containers:

```html
  <div class="leg">
    <span><i style="background:#b06ad6"></i>System</span>
    <span><i style="background:#4f9ee0"></i>Documents</span>
    <span><i style="background:#57b06a"></i>History</span>
    <span><i style="background:#e08a3c"></i>Reserved output</span>
    <span><i style="background:#1a2027;border:1px solid var(--line)"></i>Free</span>
  </div>
```

and after the buttons row:

```html
  <div class="cap" id="dk-cb-cap"></div>
  <div style="margin-top:10px;font-family:var(--mono);font-size:.66rem;letter-spacing:.08em;color:var(--faint);max-width:64ch;">
    FILL ZONES (HEURISTIC): 0–30% NEAR-OPTIMAL · 30–60% MIDDLE RECALL SOFTENS · 60–85% U-SHAPE BITES, EARLY INSTRUCTIONS DRIFT · 85%+ OUTPUT SQUEEZED
  </div>
```

Then in the slide's script, add `const cap=document.getElementById("dk-cb-cap");` beside the `bar` lookup, and append to the end of `draw()`:

```js
      cap.innerHTML=`USED: <b>${used().toLocaleString()} / ${CAP.toLocaleString()} tokens</b> — input and output draw from <b>one shared pool</b>: fill the window and there is no room left to answer. Output space is reserved before you type a word.`;
```

- [ ] **Step 2: Slide 7 (overflow strategies).** Insert the same `.leg` block (plus one extra swatch `<span><i style="background:#e08a3c"></i>Summary</span>` after History) after `#dk-ov-bar`. Replace the four `msg` strings in `OUTCOMES` with fuller explanations:

```js
      truncate:{system:400,docs:4000,history:2600,output:1000,msg:"Truncation: when the window overflows, the oldest turns are silently deleted — no marker, no summary, they simply stop existing. Cheapest and the usual default, but the conversation loses its own beginning, which is why long chats forget how they started."},
      sliding:{system:400,docs:4000,history:2600,output:1000,msg:"Sliding window: keep only the last N turns, by design. Same shape as truncation but chosen and bounded — cost stays flat forever. Right when only recent turns matter (support chat); wrong when an early fact must survive (a requirement from turn 2)."},
      summarize:{system:400,docs:4000,summary:600,history:2000,output:1000,msg:"Summarization: old turns are compressed into a running summary (orange) that stays in the window. The gist survives at a fraction of the tokens — but exact wording, code, and numbers are lossy-compressed, and the summary itself now competes for attention."},
      rag:{system:400,docs:800,history:4600,output:1000,msg:"RAG offload: documents never enter the window wholesale. They live outside; only retrieved snippets relevant to the current question are pulled in per turn. The doc segment shrinks from 4,000 to 800 tokens — the rest of the knowledge is a lookup away instead of resident."},
```

Also change the `msg` element's class so it uses the caption style: `<div id="dk-ov-msg" class="cap"></div>` (replace its current inline style).

- [ ] **Step 3: Insert new slide 8 (quadratic bill)** after `</section>` of `s-7`:

```html
<section class="slide" id="s-8">
  <span class="kicker">2 · Context window</span>
  <h2>The <span class="hl">quadratic</span> bill</h2>
  <div style="display:flex;gap:24px;align-items:baseline;flex-wrap:wrap;font-family:var(--mono);">
    <div><div style="font-size:.66rem;letter-spacing:.14em;color:var(--faint);">TURN</div><div id="dk-qb-turn" style="font-size:1.6rem;color:#f3f5f7;">1</div></div>
    <div><div style="font-size:.66rem;letter-spacing:.14em;color:var(--faint);">TRANSCRIPT NOW</div><div id="dk-qb-size" style="font-size:1.6rem;color:#0068b5;">1,000</div></div>
    <div><div style="font-size:.66rem;letter-spacing:.14em;color:var(--faint);">TOKENS BILLED SO FAR</div><div id="dk-qb-cum" style="font-size:1.6rem;color:#00c7fd;">1,000</div></div>
  </div>
  <input type="range" id="dk-qb-slider" min="1" max="50" step="1" value="1" style="margin-top:18px;">
  <div class="cap" id="dk-qb-cap"></div>
  <script>
  (function(){
    const slider=document.getElementById("dk-qb-slider"),
          elT=document.getElementById("dk-qb-turn"), elS=document.getElementById("dk-qb-size"),
          elC=document.getElementById("dk-qb-cum"), cap=document.getElementById("dk-qb-cap");
    function render(){
      const n=+slider.value, size=n*1000, cum=1000*n*(n+1)/2;
      elT.textContent=n; elS.textContent=size.toLocaleString(); elC.textContent=cum.toLocaleString();
      cap.innerHTML=`Every turn re-sends the <b>entire transcript</b> — the model has no memory, so turn ${n} re-reads all ${size.toLocaleString()} tokens to answer. Cumulative input grows with the <b>square</b> of conversation length${n>=20?" — a "+size.toLocaleString()+"-token chat has already billed "+cum.toLocaleString()+" tokens":""}. The mitigation is <b>prompt caching</b>: an unchanged prefix (system prompt, early turns) is stored and re-read at a fraction of the cost — but only on an <b>exact prefix match</b>, so stable content belongs at the front. Cached tokens still occupy the window.`;
    }
    slider.addEventListener("input",render);
    render();
  })();
  </script>
</section>
```

(Toy numbers: 1,000 tokens/turn, labeled by the caption's framing as arithmetic, not measurements. No prices anywhere.)

- [ ] **Step 4: Verify** — 19 sections; slide 6 caption updates live as turns/docs are added; slide 7 shows a multi-sentence explanation per strategy; slide 8 slider drives all three numbers and the caption (`node --check` its script); at turn 20 transcript reads 20,000 and cumulative 210,000.
- [ ] **Step 5: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): budget legend+caption, overflow explanations, quadratic-bill slide"`

---

### Task 6: Slides 9 & 10 — attention captions

**Files:**
- Modify: `docs/context-reasoning/deck.html` (sections `s-9`, `s-10`)

- [ ] **Step 1: Slide 9 (recall curve).** Change `#dk-rc-msg` to `class="cap"` (drop its inline style). After it, insert a fixed caption:

```html
  <div class="cap">Why the U-shape: attention weights are <b>normalized across every token in the window</b> — more tokens competing means less weight available per token, so signal spreads thin. Training adds the bias: sequence starts dominate training data (primacy) and the causal mask keeps recent tokens close (recency). The middle gets neither. Measured by Liu et al. 2023 across models built specifically for long context — the <b>effective</b> window is smaller than the advertised one.</div>
```

- [ ] **Step 2: Slide 10 (attention stepper).** After the `#dk-att-btn` button, insert:

```html
  <div class="cap">Each bar is the highlighted token's <b>attention share</b> paid to one earlier token — the percentages sum to 100% across the row, because attention is a fixed budget being divided, not a set of independent scores. A token that gets a thin slice is <b>functionally invisible</b> on this step even though it sits in the window. Watch "it": most of its budget goes to "ball" — that's coreference happening — but stretch the sentence to thousands of tokens and that slice thins toward nothing. This per-token budget-splitting is the mechanism behind the U-curve on the previous slide.</div>
```

- [ ] **Step 3: Verify** — both captions render below their interactives; interactives still work; the slide-9 live message (click a position) still updates independently of the fixed caption.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): attention slides explain normalization and what the percentages mean"`

---

### Task 7: Slide 11 conflict caption; new slide 12 — who writes into which role

**Files:**
- Modify: `docs/context-reasoning/deck.html` (section `s-11`; insert new `s-12` after it)

- [ ] **Step 1: Slide 11 (prompt assembler).** After the `#dk-pa-out` pre, insert `<div class="cap" id="dk-pa-cap"></div>`. Replace the slide's script with:

```js
  (function(){
    const COLOR={system:"#b06ad6",user:"#00c7fd"};
    let seq=[];
    const out=document.getElementById("dk-pa-out"), cap=document.getElementById("dk-pa-cap");
    function render(){
      out.innerHTML = seq.length===0 ? "Add snippets to build the raw sequence."
        : seq.map(s=>`<span style="color:${COLOR[s.lane]}">[${s.lane}]</span> ${s.text}`).join("\n");
      const hasSys=seq.some(s=>s.lane==="system");
      const hasConflict=hasSys && seq.some(s=>s.lane==="user"&&s.text.startsWith("Write this as one flowing paragraph"));
      cap.innerHTML = seq.length===0 ? "This is the flat token sequence the model actually reads — roles are just delimiter tokens inside it."
        : hasConflict ? "<b>System and user now conflict.</b> Expected behavior: the model follows the system instruction (bullets, not a paragraph) — post-training deliberately attached <b>more authority to the system role</b>, and position compounds it: system sits at the front, one of the two seats attention favors. But it's a <b>trained tendency, not an architectural guarantee</b> — pressure it hard enough and it can break, which is why system role is not a security boundary."
        : "No conflict yet — each instruction has its own lane. Add the conflicting user ask to see how the hierarchy resolves it.";
    }
    document.querySelectorAll("[data-lane]").forEach(b=>
      b.addEventListener("click",()=>{seq.push({lane:b.dataset.lane,text:b.dataset.text}); render();}));
    document.getElementById("dk-pa-reset").addEventListener("click",()=>{seq=[]; render();});
    render();
  })();
```

- [ ] **Step 2: Insert new slide 12** after `</section>` of `s-11` (zero JS, `.pick` pattern):

```html
<section class="slide" id="s-12">
  <span class="kicker">4 · Roles</span>
  <h2>Who actually <span class="hl">writes</span> into each role?</h2>
  <div class="pick">
    <details><summary>System — the operator's channel</summary>
      <div class="ans">Written by the <b>application or harness developer</b>, not the person chatting. Populated two ways: static configuration, or content the harness loads on demand — a <b>Skill</b> that injects the team's instructions when relevant is literally writing into the system role. (How Skills work: <a href="../plugins/index.html">Module A1</a>.)</div></details>
    <details><summary>User — the human's channel, and the danger zone</summary>
      <div class="ans">The person's actual ask, every turn — but <b>tool results, retrieved pages, and file contents usually land here too</b>. That puts untrusted text in the seat the model treats as a person speaking, which is the entire mechanism of prompt injection. Delimit it and label it as data.</div></details>
    <details><summary>Assistant — the model imitates itself</summary>
      <div class="ans">The model's own prior turns. It doesn't just remember them — it <b>conditions on them as examples</b>: consistency and persona drift are the model pattern-matching its earlier style. That's also why <b>prefill</b> works: put a partial answer in the assistant role and the model continues it — an opening <code>{</code> effectively forces JSON.</div></details>
  </div>
  <div class="cap">Roles are a <b>privilege system</b>: operator constraints → system, task content → user, and anything from outside the trust boundary gets marked as data no matter which envelope carried it in.</div>
</section>
```

- [ ] **Step 3: Verify** — 20 sections now, ids s-1…s-20 all present in order; slide-11 caption shows the hierarchy text only when system + the conflicting user snippet are both present; the `../plugins/index.html` link resolves (link checker); `node --check` on the modified script.
- [ ] **Step 4: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): conflict behavior caption; new who-writes-roles slide"`

---

### Task 8: Slides 14 & 15 — reasoning trace caption; effort reframe

**Files:**
- Modify: `docs/context-reasoning/deck.html` (sections `s-14`, `s-15`)

- [ ] **Step 1: Slide 14 (reasoning toggle).** After `#dk-rt-out`, insert:

```html
  <div class="cap">Where does the trace come from? A transformer spends a <b>fixed amount of compute per generated token</b> — one forward pass, same depth, whether the question is trivial or hard. Generating intermediate tokens is therefore the <b>only way the model can spend more compute on a harder problem</b>: each step is another pass, and every step it writes becomes readable input for the next. The trace is ordinary generated text used as <b>external scratch memory</b> — the same trick as spelling out s-t-r-a-w-b-e-r-r-y, rebuilding structure the tokenizer destroyed. That's also exactly why it costs more tokens.</div>
```

- [ ] **Step 2: Slide 15 (budget → effort).** Replace the h2 line with `<h2>Effort is a <span class="hl">dial</span>, not a cap</h2>`. Replace the script's `LEVELS` with:

```js
    const LEVELS=[
      {name:"Low effort", tok:14, q:"May skip thinking entirely on simpler problems; scopes work to exactly what was asked."},
      {name:"Medium effort", tok:74, q:"Thinks when the problem seems to warrant it, briefly."},
      {name:"High effort", tok:180, q:"Almost always thinks deeply — the typical default."},
      {name:"Max effort", tok:420, q:"No constraint on token spend — worth it only where evals show headroom."},
    ];
```

After the `#dk-rb-out` div, insert:

```html
  <div class="cap">Hard token caps are the old model — current APIs use <b>adaptive thinking</b>: the model decides when and how much to think, and effort shifts that threshold. The catch: <b>the decision to think is itself a next-token prediction</b>, keyed on surface features that correlated with difficulty in training. "How many r's in strawberry" is seven words and looks trivial — nothing on its surface signals that it fights the tokenizer — so it gets a fast, confident, wrong answer. Don't let the model's self-assessment be the router on paths that matter.</div>
```

Keep the `~N tokens` figures as illustrative (they already read as toy numbers alongside the toggle slide's counts).

- [ ] **Step 3: Consistency check against Task 1's dump.** Every claim in these two captions must be covered by `research/context-reasoning/05-reasoning.md` (existing S1–S3 + the new effort source): fixed-compute-per-token and more-tokens-more-compute (existing CoT/extended-thinking sources), adaptive thinking + effort levels (new source), deprecation claim ONLY if Task 1 sourced it — if Task 1 cut it, the caption's first sentence becomes "Effort shifts how much the model thinks — current APIs use <b>adaptive thinking</b>: …" with no old-model comparison.
- [ ] **Step 4: Verify** — toggle and slider still work; captions render; `node --check` on the modified script.
- [ ] **Step 5: Commit** — `git add docs/context-reasoning/deck.html && git commit -m "feat(deck): reasoning trace mechanism caption; effort-dial reframe"`

---

### Task 9: Presenter prep document

**Files:**
- Create: `notes/context-reasoning/deck-prep.md`

**Interfaces:**
- Consumes: the final 20-slide deck (Tasks 2–8 complete) and all five `research/context-reasoning/NN-*.md` dumps. Every load-bearing fact carries an `[S#]` tag naming its dump file and source id (format: `[02/S4]` = dump 02, source S4), since this doc spans all five dumps.

- [ ] **Step 1: Write `notes/context-reasoning/deck-prep.md`** with exactly these sections:

1. **`## The spine`** — one paragraph stating the causal chain to keep out loud: tokens are the substrate → context is a token sequence → position shapes attention → billing follows tokens → reasoning spends tokens → roles structure the sequence. One more paragraph on why the order matters (each mechanism is only explicable in terms of the previous one; the deck fails if presented as eight independent facts).
2. **`## Slide-by-slide`** — twenty `### Slide N — Title` subsections matching the final deck order exactly. Each contains, as labeled bold lead-ins:
   - **Point:** the one sentence this slide exists to land.
   - **Say:** 3–6 sentences of spoken-word script (full prose, first person, as it would actually be said — not bullet fragments).
   - **Drive:** for interactive slides, the exact interaction sequence (which button, in what order, what to point at on screen) and the specific "aha" the interaction is engineered to produce (e.g. slide 6: click + Paste a doc twice, watch Free vanish and the caption's shared-pool line, THEN add turns until history evicts). For static slides: "no interaction" plus what to gesture at.
   - **Bridge:** the transition sentence into the next slide.
3. **`## Anticipated questions`** — eight `### Q:` subsections restating the Q&A-file questions as an audience member would ask them mid-talk (e.g. "So is a long conversation literally more expensive per message?"), each with: a 2–4 sentence spoken answer; which slide to jump back to; which concept page to point them at afterward. Then a `### Likely follow-ups` subsection with three more: why can't the tokenizer just be fixed (vocab-size trade-off, [01/S3]-[01/S4] material); does temperature affect reasoning (out of this module's scope — point to Module 00 concept 06 and keep moving); is prompt injection solvable (delimiting is mitigation not solution, trained hierarchy has no architectural floor, [04/S2]).
4. **`## Numbers to have cold`** — a table: figure / value / source tag / one-line context, for: ≈1.3 tokens per word English ([01/S5]); 50k–200k typical vocabulary ([01/S1]/[01/S3]); U-shape with middle-of-context worst ([03] Liu et al./Yu et al.); quadratic cumulative cost shape (arithmetic, no source needed — n(n+1)/2); attention normalized to 100% per step ([03] Vaswani). Followed by one short paragraph: prices are deliberately absent from the deck (they date in weeks; the mechanisms don't) — if asked for prices, answer "check the live pricing page, the mechanism is what transfers."
5. **`## Failure modes while presenting`** — five one-liners: don't let the toy tokenizer be mistaken for a real one (say "illustrative" out loud on slide 3); don't read captions verbatim (they exist for after the talk); if the deck is viewed without JS everything degrades to stacked static slides — present from a browser with JS on; the strawberry example appears twice by design (slides 4 and 15) — call back, don't re-explain; keep vendor talk confined to the two slides that have it.

Target length 2,500–4,000 words. Every mechanism claim in Say/answers must be traceable to a dump (spot-tag the load-bearing ones; narrative glue needs no tags).

- [ ] **Step 2: Verify** — slide numbers/titles in the doc match the final deck exactly (`grep '<h2>' docs/context-reasoning/deck.html` against the doc's subsection titles); every `[NN/S#]` tag names a source id that exists in that dump file; `wc -w` in range.
- [ ] **Step 3: Commit** — `git add notes/context-reasoning/deck-prep.md && git commit -m "docs: presenter prep study guide for module 01 deck"`

---

### Task 10: Full verification + publish

**Files:** none (verification + repo operations)

- [ ] **Step 1: Full structural pass** — run all four Verification commands from the header. Expect: 20 sections / 1 hud; link check silent; all scripts `node --check` clean.
- [ ] **Step 2: Manual deck pass** — `open docs/context-reasoning/deck.html`: arrow through all 20 slides (HUD reads `N / 20`); Space in the slide-3 textarea types a space; every interactive from Tasks 3–8 operates; legends and captions visible on slides 6, 7, 8, 9, 10, 11; conflict caption fires on slide 11 only with both snippets present; zero console errors.
- [ ] **Step 3: Merge and publish** — `git checkout dev && git pull && git merge deck-v2 && git push origin dev && git checkout main && git pull && git merge dev && git push origin main && git branch -d deck-v2`
- [ ] **Step 4: Trigger Pages build** — `gh api -X POST repos/ialvarezz/llm-intuition/pages/builds` (never auto-builds), then poll `https://ialvarezz.github.io/llm-intuition/context-reasoning/deck.html` until 200 and spot-check one interactive over HTTPS.
- [ ] **Step 5: Report the live URL.**
