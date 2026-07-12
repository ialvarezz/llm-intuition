# Module A1: AI Plugins, Marketplaces, Agents & Skills — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build aux Module A1 of llm-intuition: 10 deep-dive notes + 10 interactive HTML concept pages under `docs/plugins/`, a module index, a card on the main landing page, and a self-contained ~40-slide HTML presentation (`docs/plugins/deck.html`) for a 45–60 min talk — teaching AI plugin marketplaces, plugins, MCP, skills, agents, hooks, and Claude↔Copilot compatibility.

**Architecture:** Plain static site, zero build step. Pages reuse `docs/style.css` via `../style.css`; each page carries one inline-JS interactive figure. Notes authored first per concept from a fetched research dump, then distilled into the page. Deck is one HTML file with ~30 lines of inline nav JS.

**Tech Stack:** HTML5, CSS3, vanilla ES6 JS, GitHub Pages (serves `docs/` from `main`).

## Global Constraints

- No external JS/CSS dependencies, no CDN links, no runtime fetch. YouTube `<iframe>` embeds are the only external resource allowed.
- Style system identical to Module 1 (`docs/style.css` — do not fork it): ground `#0a0c0e`, panel `#0d1013`, border `#263039`, classic blue `#0068B5`, energy blue `#00C7FD`, body `#dcdee0`, muted `#969ca3`/`#6b7178`; demo colors `#00c7fd #e08a3c #4f9ee0 #57b06a #b06ad6`. Mono headlines/labels (uppercase, letter-spacing ≥ .14em), system sans body. `border-radius` is forbidden.
- Every page readable with JS disabled (figures render a sensible static initial state).
- All internal links relative (pages in `docs/plugins/` reference `../style.css`, `../index.html`, `../01-….html`).
- Notes written for engineers with zero LLM background. Every note has "Pro vs. amateur" and "References" (real URLs).
- **Research-first rule:** Tasks 2–11 start with the Research protocol. Notes/pages state only facts traceable to that concept's `research/plugins/NN-*.md` dump. Plugin ecosystems changed fast through 2025–2026 — anything unverifiable against a fetched source gets cut.
- **Emphasis:** pages 04 (Skills) and 05 (Agents) are the deepest — full authoring detail. MCP (03) is conceptual, one page.
- Work on branch `aux-plugins`. Commit after every task. Merge flow at the end: `aux-plugins` → `dev` → `main`.

## Verification commands

1. `open docs/plugins/<page>.html` — layout renders, figure works, zero console errors.
2. Site-wide link check (now walks subdirectories and resolves `../`):

```bash
python3 - <<'EOF'
import re, pathlib, sys
docs = pathlib.Path("docs")
bad = []
for f in docs.rglob("*.html"):
    for href in re.findall(r'href="([^"#]+)"', f.read_text()):
        if href.startswith(("http", "mailto")): continue
        if not (f.parent / href).resolve().exists(): bad.append(f"{f} -> {href}")
print("\n".join(bad)); sys.exit(1 if bad else 0)
EOF
```

## Research protocol (Tasks 2–11)

Before writing each note, produce `research/plugins/NN-<same-stem-as-note>.md`:

1. **Dispatch a general-purpose subagent on Haiku** (`model: haiku`) with this prompt shape: *"Fetch each of these URLs with WebFetch. For each, append to `research/plugins/NN-<stem>.md` a block: `## [Sn] Title`, `- **URL:**`, `- **Fetched:** YYYY-MM-DD`, `- **Type:** docs|post|video|spec`, then `### Extracted` with the key claims, definitions, field names, config snippets, and numbers — quote exact wording for formats and field names. If a URL 404s, find the current equivalent from the same organization, note the replacement, and fetch that instead. Completeness beats polish."* List the task's URLs verbatim.
2. **Verify the dump yourself** (main session): read it; every source block must have URL + fetch date + extracted claims. Spot-check that config formats/field names look current. If a source failed and wasn't replaced, fetch a replacement yourself before writing.
3. While drafting the note, tag every load-bearing fact `[Sn]`. Untagged fact → source it or cut it.
4. Commit the dump with the note and page: `git add research/plugins/NN-*.md notes/plugins/NN-*.md docs/plugins/NN-*.html`.

---

### Task 1: Module template + nav skeleton

**Files:**
- Create: `docs/plugins/_template.html` (working reference; deleted in Task 12)

**Interfaces:**
- Produces: the skeleton every page in Tasks 2–11 copies. Reuses all CSS classes from `docs/style.css` (`grid-bg`, `site-header`, `hero`, `panel`, `prose`, `refs`, `pager`, `btn`, `tk`, etc.) — no new stylesheet.

- [ ] **Step 1: Write `docs/plugins/_template.html`:**

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
    <a href="index.html">A1 Index</a>
    <a href="00-primer.html">00</a>
    <a href="01-marketplaces.html">01</a>
    <a href="02-plugins.html">02</a>
    <a href="03-mcp-servers.html">03</a>
    <a href="04-skills.html">04</a>
    <a href="05-agents.html">05</a>
    <a href="06-hooks-and-commands.html">06</a>
    <a href="07-building-a-plugin.html">07</a>
    <a href="08-claude-copilot-compat.html">08</a>
    <a href="09-which-one-when.html">09</a>
    <a href="deck.html">Deck</a>
  </nav>
</header>
<main>
  <div class="hero">
    <span class="crumb">Module A1 / Concept NN</span>
    <h1>Concept <span class="hl">Title</span></h1>
    <p class="sub">One-paragraph subtitle.</p>
    <div class="meta"><span>Read <b>X min</b></span><span>Level <b>Fundamentals</b></span><span>Prereq <b>Concept NN-1</b></span></div>
  </div>

  <div class="panel">
    <div class="panel-hd"><span><span class="dot">●</span> FIGURE NAME / INTERACTIVE</span><span>LABEL</span></div>
    <div class="panel-body" id="fig"><!-- figure markup --></div>
    <div class="panel-ft" id="fig-ft">STATUS LINE</div>
    <div class="figure-note">Note.</div>
  </div>

  <div class="prose">
    <h2>Section</h2>
    <p>…</p>
    <h2>Pro vs. amateur</h2>
    <p>…</p>
  </div>

  <div class="refs">
    <a class="ref" href="URL"><span class="src">Docs · Org</span><span class="t">Title</span></a>
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

Page 00's pager prev slot is `<span class="gap"></span>`; page 09's next slot links `deck.html` (`Deck · The presentation →`).

- [ ] **Step 2: Verify** — `open docs/plugins/_template.html`: identical look to Module 1 pages (grid, mono hero, glowing panel). Nav links 404 until later tasks — expected; skip link checker.

- [ ] **Step 3: Commit** — `git add docs/plugins/_template.html && git commit -m "feat(A1): module template and nav skeleton"`

---

### Task 2: Concept 00 — The 15-minute primer — PATTERN VALIDATOR

**Files:**
- Create: `research/plugins/00-primer.md`, `notes/plugins/00-primer.md`, `docs/plugins/00-primer.html`

**Interfaces:**
- Consumes: `_template.html` skeleton.
- Produces: depth/figure exemplar for Tasks 3–11. **STOP after this task for user review.**

- [ ] **Step 1: Research** (protocol above) — URLs:
  - `https://www.anthropic.com/research/building-effective-agents`
  - `https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview`
  - `https://www.youtube.com/watch?v=zjkBMFhNj_g` (Karpathy — Intro to LLMs; reuse of Module 1 source)
  - `https://docs.anthropic.com/en/docs/resources/glossary`

- [ ] **Step 2: Write `notes/plugins/00-primer.md`** (target 1,200–1,800 words — deliberately shorter than the rest) covering: an LLM predicts the next token — chat is that in a loop (link `../01-what-is-an-llm.html` for depth); the context window is the model's entire working memory (link `../05-context-window.html`); **tool use** — the model can't act, so it emits a structured "call this tool with these args" message, the *harness* executes it and feeds the result back; **an agent** = LLM + tools + loop (model decides, harness acts, result returns, repeat until done); the harness (Claude Code, Copilot) is the program around the model — and *plugins extend the harness, not the model*. That framing is the module's thesis. **Pro vs. amateur:** the model never executes anything — every "action" is the harness honoring a request; agent quality is mostly harness + context quality, not raw model IQ; token costs apply to everything a plugin injects. **References:** the four sources above.

- [ ] **Step 3: Write `docs/plugins/00-primer.html`** — copy `_template.html`. Title `00 · The 15-Minute Primer — llm::intuition`; crumb `Module A1 / Concept 00`; h1 `The 15-Minute <span class="hl">Primer</span>`; nav `00` gets `class="on"`; subtitle: "You don't need a PhD to build AI plugins. You need four ideas: tokens, context, tool calls, and the loop. Here they are — everything else in this module builds on them." Prose: `// Next-token prediction, looped`, `// Tools: the model asks, the harness acts`, `// An agent is a loop`, `// Plugins extend the harness`, `// Pro vs. amateur`. Meta prereq: `None`. Reference cards for the 4 sources; deep-dive card links to `../index.html` ("Module 01 — the full fundamentals"). Pager: prev `<span class="gap"></span>`, next `01-marketplaces.html`.
  - **Figure: agent loop stepper.** Header `● THE AGENT LOOP / INTERACTIVE`, label `ONE TASK · FOUR HOPS`. Markup + script:

```html
<div id="loop-boxes" style="display:flex;gap:8px;flex-wrap:wrap;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;"></div>
<div id="loop-msg" style="margin-top:16px;padding:14px;border:1px solid var(--line);font-size:.88rem;line-height:1.6;min-height:4.5em;color:var(--fg);"></div>
<button class="btn" id="loop-btn" style="margin-top:14px;">Step ▸</button>
<script>
const NODES = ["USER","MODEL","TOOL","MODEL","USER"];
const STEPS = [
  {at:0,msg:'USER → MODEL: "What changed in the repo this week?"'},
  {at:1,msg:'MODEL thinks: I can\'t see the repo. It emits a tool call: run_command("git log --since=1.week")'},
  {at:2,msg:'HARNESS executes the command (the model never runs anything itself) and captures the output.'},
  {at:3,msg:'TOOL RESULT → MODEL: the git log text enters the context window like any other tokens.'},
  {at:4,msg:'MODEL → USER: "Three commits this week: …" — plain next-token prediction over prompt + result.'},
];
let i = 0;
const bx = document.getElementById("loop-boxes"), msg = document.getElementById("loop-msg"),
      btn = document.getElementById("loop-btn"), ft = document.getElementById("fig-ft");
function draw(){
  bx.innerHTML = NODES.map((n,j) =>
    `<span style="padding:10px 14px;border:1px solid ${j===STEPS[i].at?'#00c7fd':'#263039'};
      color:${j===STEPS[i].at?'#00c7fd':'#4a4f55'}">${n}</span>` +
    (j<NODES.length-1?`<span style="align-self:center;color:#4a4f55">→</span>`:"")).join("");
  msg.textContent = STEPS[i].msg;
  ft.textContent = `HOP ${i+1}/${STEPS.length} — THE LOOP IS THE AGENT`;
}
btn.addEventListener("click", () => { i = (i+1) % STEPS.length; draw(); });
draw();
</script>
```

  `figure-note`: "Every agent you'll meet in this module — and every plugin — lives somewhere on this loop."

- [ ] **Step 4: Verify** — stepper cycles 5 hops; JS-off shows first state; zero console errors.

- [ ] **Step 5: Commit** — `git add research/plugins/00-primer.md notes/plugins/00-primer.md docs/plugins/00-primer.html && git commit -m "feat(A1): concept 00 — primer"`

- [ ] **Step 6: CHECKPOINT — request user review of note depth + page look before Task 3.**

---

### Task 3: Concept 01 — What is a plugin marketplace

**Files:**
- Create: `research/plugins/01-marketplaces.md`, `notes/plugins/01-marketplaces.md`, `docs/plugins/01-marketplaces.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/plugin-marketplaces`
  - `https://code.claude.com/docs/en/plugins`
  - `https://www.anthropic.com/news/claude-code-plugins`
  - `https://code.visualstudio.com/docs/editor/extension-marketplace`
  - `https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions`

- [ ] **Step 2: Write `notes/plugins/01-marketplaces.md`** covering: why extend an assistant at all (repeated prompting is copy-paste engineering; packaged extensions are versioned, shareable, reviewable); what a marketplace is — a catalog a harness can install from; Claude Code marketplaces are just git repos/URLs with a `.claude-plugin/marketplace.json` listing plugins (name, source, description — exact fields from the dump); adding one (`/plugin marketplace add …`) and installing (`/plugin install name@marketplace`); the Copilot/VS Code side — extension marketplace, and where Copilot extensibility actually lives; trust model — installing a plugin = running someone's instructions and code inside your session; review before install. **Pro vs. amateur:** a marketplace is metadata, not hosting — the plugin source can live anywhere git reaches; pin/review versions like any dependency; private/team marketplaces are the real enterprise use case; the marketplace a plugin ships in says nothing about its quality — read the source. **References:** the five URLs above.

- [ ] **Step 3: Write `docs/plugins/01-marketplaces.html`** — h1 `Plugin <span class="hl">Marketplaces</span>`; subtitle: "A marketplace is just a catalog your AI harness can install from — a JSON file pointing at git repos. Understanding that demystifies the whole ecosystem." Prose: `// Why extend the harness`, `// A catalog, not a store`, `// Install flow`, `// Trust: you are running their code`, `// Pro vs. amateur`. Pager 00 ↔ 02.
  - **Figure: marketplace anatomy.** Header `● MARKETPLACE ANATOMY / INTERACTIVE`, label `HOVER A PART`. Nested boxes rendered as divs: outer `MARKETPLACE (git repo)` containing `.claude-plugin/marketplace.json`, and three `PLUGIN` entries each showing `name · source · description`. Hovering any element highlights it energy blue and writes its role to the footer. Script pattern:

```html
<div id="mk" style="border:1px solid #263039;padding:14px;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;">
  <div class="mk-part" data-d="THE MARKETPLACE: A GIT REPO OR URL THE HARNESS CAN READ" style="color:#848a91;padding:4px;">▚ MARKETPLACE (GIT REPO)</div>
  <div class="mk-part" data-d="THE CATALOG FILE: LISTS EVERY PLUGIN, ITS SOURCE AND DESCRIPTION" style="border:1px solid #263039;margin:8px 0;padding:8px;color:#848a91;">.claude-plugin/marketplace.json</div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;">
    <div class="mk-part" data-d="A PLUGIN ENTRY: NAME + WHERE ITS SOURCE LIVES (ANY GIT REPO)" style="border:1px solid #263039;padding:8px;flex:1;min-width:140px;color:#848a91;">PLUGIN: deploy-helper</div>
    <div class="mk-part" data-d="ENTRIES CAN POINT AT DIFFERENT REPOS — THE MARKETPLACE HOSTS NOTHING" style="border:1px solid #263039;padding:8px;flex:1;min-width:140px;color:#848a91;">PLUGIN: code-reviewer</div>
    <div class="mk-part" data-d="DESCRIPTION IS WHAT USERS (AND MODELS) SEE BEFORE INSTALLING" style="border:1px solid #263039;padding:8px;flex:1;min-width:140px;color:#848a91;">PLUGIN: db-tools</div>
  </div>
</div>
<script>
const ft1 = document.getElementById("fig-ft");
document.querySelectorAll(".mk-part").forEach(el => {
  el.addEventListener("mouseenter", () => { el.style.borderColor = "#00c7fd"; el.style.color = "#00c7fd"; ft1.textContent = el.dataset.d; });
  el.addEventListener("mouseleave", () => { el.style.borderColor = "#263039"; el.style.color = "#848a91"; ft1.textContent = "HOVER A PART TO SEE ITS ROLE"; });
});
ft1.textContent = "HOVER A PART TO SEE ITS ROLE";
</script>
```

  `figure-note`: "Field names simplified; see the marketplace.json reference for the full schema."

- [ ] **Step 4: Verify** — hover highlights + footer updates; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/01-* notes/plugins/01-* docs/plugins/01-*.html && git commit -m "feat(A1): concept 01 — marketplaces"`

---

### Task 4: Concept 02 — Plugins: the container

**Files:**
- Create: `research/plugins/02-plugins.md`, `notes/plugins/02-plugins.md`, `docs/plugins/02-plugins.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/plugins`
  - `https://code.claude.com/docs/en/plugins-reference`
  - `https://www.anthropic.com/news/claude-code-plugins`
  - `https://github.com/anthropics/claude-code`

- [ ] **Step 2: Write `notes/plugins/02-plugins.md`** covering: a plugin is the shipping container — one installable unit bundling any mix of skills, agents, hooks, MCP servers, and commands; the directory layout (`.claude-plugin/plugin.json` manifest + `skills/`, `agents/`, `hooks/`, `commands/`, `.mcp.json` — exact names from the dump); the manifest fields (name, version, description, author); install lifecycle — what the harness loads at session start vs. on demand; enable/disable per project or user scope; versioning and updates. **Pro vs. amateur:** a plugin with one good skill beats a kitchen-sink plugin — installers pay context cost for everything always-loaded; component names get namespaced (`plugin:skill`) — name for discoverability; test locally (local path install) before publishing; treat `plugin.json` like `package.json` — semver and changelogs matter once teammates depend on it. **References:** the four URLs above.

- [ ] **Step 3: Write `docs/plugins/02-plugins.html`** — h1 `Plugins: The <span class="hl">Container</span>`; subtitle: "A plugin is a directory with a manifest. Everything installable — skills, agents, hooks, MCP servers, commands — ships inside one. Learn the layout once and every plugin you open makes sense." Prose: `// One unit, many components`, `// The manifest`, `// Anatomy on disk`, `// Install lifecycle`, `// Pro vs. amateur`. Pager 01 ↔ 03.
  - **Figure: plugin file tree.** Header `● PLUGIN ANATOMY / INTERACTIVE`, label `CLICK A FILE`. A mono `<ul>` tree; clicking a node highlights it and describes it in the footer:

```html
<ul id="tree" style="list-style:none;padding-left:0;font-family:var(--mono);font-size:.82rem;line-height:2;color:#848a91;">
  <li data-d="THE MANIFEST: NAME, VERSION, DESCRIPTION — WHAT THE MARKETPLACE READS" style="cursor:pointer">▸ .claude-plugin/plugin.json</li>
  <li data-d="EACH SUBFOLDER IS ONE SKILL: A SKILL.MD PLUS OPTIONAL SUPPORT FILES" style="cursor:pointer">▸ skills/review-pr/SKILL.md</li>
  <li data-d="EACH FILE IS ONE SUBAGENT: FRONTMATTER (TOOLS, MODEL) + SYSTEM PROMPT" style="cursor:pointer">▸ agents/security-auditor.md</li>
  <li data-d="EVENT HANDLERS: SHELL COMMANDS THE HARNESS RUNS ON EVENTS LIKE PRETOOLUSE" style="cursor:pointer">▸ hooks/hooks.json</li>
  <li data-d="SLASH COMMANDS: USER-INVOKED PROMPT TEMPLATES" style="cursor:pointer">▸ commands/deploy.md</li>
  <li data-d="MCP SERVERS THE PLUGIN STARTS: EXTERNAL TOOLS THE MODEL CAN CALL" style="cursor:pointer">▸ .mcp.json</li>
</ul>
<script>
const ftT = document.getElementById("fig-ft");
document.querySelectorAll("#tree li").forEach(li => li.addEventListener("click", () => {
  document.querySelectorAll("#tree li").forEach(o => o.style.color = "#848a91");
  li.style.color = "#00c7fd"; ftT.textContent = li.dataset.d;
}));
ftT.textContent = "CLICK A FILE TO SEE WHAT IT DOES";
</script>
```

  `figure-note`: "Every directory is optional — a plugin can be a single skill in a manifest."

- [ ] **Step 4: Verify** — clicks highlight + describe; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/02-* notes/plugins/02-* docs/plugins/02-*.html && git commit -m "feat(A1): concept 02 — plugins"`

---

### Task 5: Concept 03 — MCP servers

**Files:**
- Create: `research/plugins/03-mcp-servers.md`, `notes/plugins/03-mcp-servers.md`, `docs/plugins/03-mcp-servers.html`

- [ ] **Step 1: Research** — URLs:
  - `https://modelcontextprotocol.io/`
  - `https://modelcontextprotocol.io/specification/latest`
  - `https://www.anthropic.com/news/model-context-protocol`
  - `https://code.claude.com/docs/en/mcp`
  - `https://code.visualstudio.com/docs/copilot/chat/mcp-servers`

- [ ] **Step 2: Write `notes/plugins/03-mcp-servers.md`** covering: the N×M problem (every assistant × every tool = custom integrations) and MCP as the USB-C answer — one protocol, any client, any server; the three primitives — tools (model-invoked actions), resources (readable data), prompts (user-invoked templates); host/client/server roles; transports: stdio (local process) vs. HTTP (remote); config: where Claude Code and VS Code/Copilot each declare servers (exact config shapes from the dump); why this is the interoperability layer of the whole module — the same server serves both harnesses. Keep it conceptual; building servers is out of scope (one paragraph pointing at SDKs). **Pro vs. amateur:** every connected server's tool descriptions consume context tokens whether used or not — connect what you need; MCP tools are prompt-injection surface (tool results are untrusted input); prefer an existing server over writing one; stdio servers run with your local permissions — read what you install. **References:** the five URLs above.

- [ ] **Step 3: Write `docs/plugins/03-mcp-servers.html`** — h1 `MCP <span class="hl">Servers</span>`; subtitle: "The Model Context Protocol is why one integration works in Claude, Copilot, and everything else — a universal port between models and the outside world." Prose: `// The N×M problem`, `// Tools, resources, prompts`, `// Transports and config`, `// The interoperability layer`, `// Pro vs. amateur`. Pager 02 ↔ 04.
  - **Figure: MCP message flow stepper.** Header `● MCP HANDSHAKE / INTERACTIVE`, label `CLIENT ↔ SERVER · SIMPLIFIED`. Two labeled columns (HARNESS/CLIENT, MCP SERVER); a `Step ▸` button appends message rows alternating direction:

```html
<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:.7rem;letter-spacing:.14em;color:#848a91;"><span>HARNESS / CLIENT</span><span>MCP SERVER</span></div>
<div id="mcp-log" style="margin-top:12px;display:flex;flex-direction:column;gap:6px;min-height:11em;"></div>
<button class="btn" id="mcp-btn" style="margin-top:14px;">Step ▸</button>
<script>
const MSGS = [
  {dir:">", t:"initialize — hello, what can you do?"},
  {dir:"<", t:"capabilities: tools, resources"},
  {dir:">", t:"tools/list"},
  {dir:"<", t:'[{name:"query_db", description:"Run a read-only SQL query…"}]'},
  {dir:">", t:'tools/call query_db {sql:"SELECT count(*) FROM users"}'},
  {dir:"<", t:'result: {rows:[[48210]]} — fed back into the model’s context'},
];
let m = 0;
const log = document.getElementById("mcp-log"), ftM = document.getElementById("fig-ft");
document.getElementById("mcp-btn").addEventListener("click", () => {
  if (m >= MSGS.length){ m = 0; log.innerHTML = ""; }
  const x = MSGS[m];
  log.innerHTML += `<div style="font-family:var(--mono);font-size:.76rem;text-align:${x.dir===">"?"left":"right"};color:${x.dir===">"?"#00c7fd":"#57b06a"}">${x.dir===">"?"→ ":""}${x.t}${x.dir==="<"?" ←":""}</div>`;
  m++;
  ftM.textContent = m===4 ? "TOOL DESCRIPTIONS NOW SIT IN THE MODEL'S CONTEXT — THAT'S THE COST" :
                    m===MSGS.length ? "DONE — SAME PROTOCOL, ANY CLIENT, ANY SERVER" : `MESSAGE ${m}/${MSGS.length}`;
});
ftM.textContent = "STEP THROUGH A SESSION: DISCOVERY, THEN A TOOL CALL";
</script>
```

  `figure-note`: "Simplified JSON-RPC; real messages carry ids, schemas, and error handling."

- [ ] **Step 4: Verify** — six messages step through and reset; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/03-* notes/plugins/03-* docs/plugins/03-*.html && git commit -m "feat(A1): concept 03 — MCP servers"`

---

### Task 6: Concept 04 — Skills (deep dive)

**Files:**
- Create: `research/plugins/04-skills.md`, `notes/plugins/04-skills.md`, `docs/plugins/04-skills.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/skills`
  - `https://www.anthropic.com/news/skills`
  - `https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills`
  - `https://github.com/anthropics/skills`
  - `https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview`

- [ ] **Step 2: Write `notes/plugins/04-skills.md`** — the deepest note (target 2,500–3,500 words) covering: a skill = a folder with `SKILL.md` — instructions the model reads when relevant, not code the harness executes; full frontmatter (`name`, `description`, other fields per dump); **progressive disclosure** — at session start only name+description load (~dozens of tokens); the body loads only when triggered; support files load only when the body points at them — this is why 50 installed skills don't blow the context; **the description is the API**: the model decides to load a skill from its description alone — write it with trigger phrases, symptoms, and "use when…", not marketing copy; body-writing craft: imperative voice, checklists, exact commands, when to split into support files; bundled scripts (skills can carry runnable helpers); testing a skill — fresh session, phrase the task like a real user, verify it triggers (and *doesn't* trigger on near-misses); failure modes: vague description → never triggers; over-broad description → triggers everywhere; giant body → context bloat; instructions that contradict CLAUDE.md → confusion. Skills as an open standard adopted beyond Claude. **Pro vs. amateur:** amateurs write skills like READMEs for humans, pros write them as behavioral specs for a model deciding in one glance; description quality > body quality; a skill is prompt engineering under version control — review it like code; pros test the negative case. **References:** the five URLs above.

- [ ] **Step 3: Write `docs/plugins/04-skills.html`** — h1 `<span class="hl">Skills</span>: Packaged Expertise`; subtitle: "A skill is a markdown file the model reads only when it needs it. The magic is progressive disclosure — and the entire API is one well-written description." Prose: `// A folder with instructions`, `// Progressive disclosure`, `// The description is the API`, `// Writing the body`, `// Testing and failure modes`, `// Pro vs. amateur`. Pager 03 ↔ 05.
  - **Figure: progressive-disclosure simulator.** Header `● CONTEXT COST / INTERACTIVE`, label `TOY BUDGET · 3 SKILLS INSTALLED`. Stacked horizontal bar like Module 1's context figure; buttons: `Session start`, `Trigger "review-pr"`, `Load support file`, `Naive: load everything`:

```html
<div id="sk-bar" style="display:flex;height:34px;border:1px solid var(--line);overflow:hidden;"></div>
<div id="sk-leg" style="display:flex;gap:18px;flex-wrap:wrap;margin-top:12px;font-family:var(--mono);font-size:.68rem;letter-spacing:.1em;color:var(--faint);"></div>
<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">
  <button class="btn" data-mode="start">Session start</button>
  <button class="btn" data-mode="trigger">Trigger "review-pr"</button>
  <button class="btn" data-mode="support">Load support file</button>
  <button class="btn" data-mode="naive">Naive: load everything</button>
</div>
<script>
const CAP2 = 20000;
const MODES = {
  start:  {parts:{"SYSTEM PROMPT":2500,"SKILL METADATA (3 × ~60)":180}, msg:"3 SKILLS COST 180 TOKENS — NAMES AND DESCRIPTIONS ONLY"},
  trigger:{parts:{"SYSTEM PROMPT":2500,"SKILL METADATA (3 × ~60)":180,"REVIEW-PR BODY":1400}, msg:"ONE BODY LOADED, ON DEMAND — THE OTHER TWO STAY FOLDED"},
  support:{parts:{"SYSTEM PROMPT":2500,"SKILL METADATA (3 × ~60)":180,"REVIEW-PR BODY":1400,"CHECKLIST.MD (SUPPORT)":2200}, msg:"THIRD LEVEL: SUPPORT FILES LOAD ONLY WHEN THE BODY POINTS AT THEM"},
  naive:  {parts:{"SYSTEM PROMPT":2500,"ALL 3 BODIES + SUPPORT FILES":11800}, msg:"WITHOUT PROGRESSIVE DISCLOSURE: EVERY SKILL, EVERY SESSION, EVERY TURN"},
};
const COLORS2 = ["#b06ad6","#00c7fd","#57b06a","#e08a3c","#4f9ee0"];
const bar2 = document.getElementById("sk-bar"), leg2 = document.getElementById("sk-leg"), ft2 = document.getElementById("fig-ft");
function show(mode){
  const parts = Object.entries(MODES[mode].parts); let used = 0;
  bar2.innerHTML = parts.map(([k,v],i) => { used += v;
    return `<div title="${k}: ${v}" style="width:${v/CAP2*100}%;background:${COLORS2[i%5]}"></div>`; }).join("")
    + `<div style="flex:1;background:#1a2027"></div>`;
  leg2.innerHTML = parts.map(([k,v],i) =>
    `<span><span style="display:inline-block;width:9px;height:9px;background:${COLORS2[i%5]};margin-right:6px"></span>${k} ${v}</span>`).join("");
  ft2.innerHTML = `<b>${used} / ${CAP2} TOKENS</b> — ${MODES[mode].msg}`;
}
document.querySelectorAll("[data-mode]").forEach(b => b.addEventListener("click", () => show(b.dataset.mode)));
show("start");
</script>
```

  `figure-note`: "Token numbers are illustrative; the three-level loading behavior is real."

- [ ] **Step 4: Verify** — four modes redraw the bar; naive mode visibly dwarfs the others; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/04-* notes/plugins/04-* docs/plugins/04-*.html && git commit -m "feat(A1): concept 04 — skills deep dive"`

---

### Task 7: Concept 05 — Agents & subagents (deep dive)

**Files:**
- Create: `research/plugins/05-agents.md`, `notes/plugins/05-agents.md`, `docs/plugins/05-agents.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/sub-agents`
  - `https://www.anthropic.com/research/building-effective-agents`
  - `https://code.visualstudio.com/docs/copilot/chat/chat-modes`
  - `https://docs.github.com/en/copilot/using-github-copilot/coding-agent`

- [ ] **Step 2: Write `notes/plugins/05-agents.md`** — deep note (target 2,500–3,500 words) covering: a custom agent/subagent = a markdown file with frontmatter (name, description, tools, model) + a system prompt body (exact format from dump); why delegate — fresh context window per task (the orchestrator's context stays clean), restricted tool sets (a reviewer that can't write files), cheaper models for mechanical work; the dispatch/return contract: the subagent sees only its task prompt, works alone, returns one final message — it can't ask questions mid-flight, so the dispatch prompt must be self-contained; authoring craft: description tells the *orchestrator* when to delegate (same "description is the API" rule as skills); system prompt sets role, constraints, output format; tool allowlists as safety rails; model choice per agent (fast/cheap for search, strong for architecture); orchestration patterns from the dump: parallel fan-out for independent work, pipeline for staged work; Copilot's equivalents — custom agents/chat modes (`.chatmode.md` / custom agent files per dump), the Copilot coding agent. Failure modes: vague dispatch prompts → wrong work; giant "do everything" agents → worse than none; agents re-deriving context the orchestrator already had. **Pro vs. amateur:** the dispatch prompt is where quality is won — pros write it like a work order (inputs, deliverable, constraints); pros restrict tools rather than trusting instructions; subagent results must be relayed, not assumed seen; know when *not* to delegate: a task needing conversation context is cheaper inline. **References:** the four URLs above.

- [ ] **Step 3: Write `docs/plugins/05-agents.html`** — h1 `Agents &amp; <span class="hl">Subagents</span>`; subtitle: "An agent file is a job description: a name, a system prompt, a tool list, a model. Delegation buys you fresh context and safety rails — if the work order is written well." Prose: `// A job description in markdown`, `// Why delegate: context and rails`, `// The dispatch contract`, `// Orchestration patterns`, `// The Copilot side`, `// Pro vs. amateur`. Pager 04 ↔ 06.
  - **Figure: delegation stepper.** Header `● DELEGATION / INTERACTIVE`, label `ORCHESTRATOR + 2 SUBAGENTS`. Orchestrator box on top, two subagent boxes below, each with a mini context-bar; `Step ▸` walks: dispatch A (A's context fills with only its task) → dispatch B in parallel → A returns one message → B returns → orchestrator context grows only by two summaries:

```html
<div id="ag-orch" style="border:1px solid #263039;padding:10px 14px;font-family:var(--mono);font-size:.72rem;color:#848a91;">ORCHESTRATOR <span id="ag-octx" style="color:#4a4f55">· CONTEXT: TASK</span></div>
<div style="display:flex;gap:10px;margin-top:14px;">
  <div id="ag-a" style="flex:1;border:1px solid #263039;padding:10px 14px;font-family:var(--mono);font-size:.72rem;color:#4a4f55;">AGENT A: TEST-WRITER<div id="ag-actx" style="margin-top:6px;color:#4a4f55">· IDLE</div></div>
  <div id="ag-b" style="flex:1;border:1px solid #263039;padding:10px 14px;font-family:var(--mono);font-size:.72rem;color:#4a4f55;">AGENT B: DOC-WRITER<div id="ag-bctx" style="margin-top:6px;color:#4a4f55">· IDLE</div></div>
</div>
<button class="btn" id="ag-btn" style="margin-top:16px;">Step ▸</button>
<script>
const S = [
  {o:"· CONTEXT: TASK", a:"· IDLE", b:"· IDLE", hi:[], ft:"THE ORCHESTRATOR HOLDS THE FULL CONVERSATION"},
  {o:"· CONTEXT: TASK", a:"· CONTEXT: DISPATCH PROMPT ONLY", b:"· IDLE", hi:["a"], ft:"AGENT A STARTS FRESH — IT SEES ONLY ITS WORK ORDER"},
  {o:"· CONTEXT: TASK", a:"· WORKING (OWN TOOLS, OWN MODEL)", b:"· CONTEXT: DISPATCH PROMPT ONLY", hi:["a","b"], ft:"INDEPENDENT TASKS RUN IN PARALLEL"},
  {o:"· CONTEXT: TASK + A'S SUMMARY", a:"· DONE — RETURNED ONE MESSAGE", b:"· WORKING", hi:["b"], ft:"ONLY THE FINAL MESSAGE COMES BACK — NOT A'S WHOLE TRANSCRIPT"},
  {o:"· CONTEXT: TASK + 2 SUMMARIES", a:"· DONE", b:"· DONE — RETURNED ONE MESSAGE", hi:[], ft:"THE ORCHESTRATOR PAID 2 SUMMARIES, NOT 2 TRANSCRIPTS"},
];
let si = 0;
const oc = document.getElementById("ag-octx"), ac = document.getElementById("ag-actx"), bc = document.getElementById("ag-bctx"),
      ea = document.getElementById("ag-a"), eb = document.getElementById("ag-b"), ftA = document.getElementById("fig-ft");
function drawA(){
  const s = S[si]; oc.textContent = s.o; ac.textContent = s.a; bc.textContent = s.b;
  ea.style.borderColor = s.hi.includes("a") ? "#00c7fd" : "#263039";
  eb.style.borderColor = s.hi.includes("b") ? "#00c7fd" : "#263039";
  ftA.textContent = `${si+1}/${S.length} — ${s.ft}`;
}
document.getElementById("ag-btn").addEventListener("click", () => { si = (si+1) % S.length; drawA(); });
drawA();
</script>
```

  `figure-note`: "The one-message return contract is the whole design: write dispatch prompts like work orders."

- [ ] **Step 4: Verify** — five states cycle; borders highlight active agents; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/05-* notes/plugins/05-* docs/plugins/05-*.html && git commit -m "feat(A1): concept 05 — agents deep dive"`

---

### Task 8: Concept 06 — Hooks & commands

**Files:**
- Create: `research/plugins/06-hooks-and-commands.md`, `notes/plugins/06-hooks-and-commands.md`, `docs/plugins/06-hooks-and-commands.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/hooks`
  - `https://code.claude.com/docs/en/hooks-guide`
  - `https://code.claude.com/docs/en/slash-commands`
  - `https://code.visualstudio.com/docs/copilot/copilot-customization`

- [ ] **Step 2: Write `notes/plugins/06-hooks-and-commands.md`** covering: hooks = deterministic shell commands the *harness* runs on lifecycle events — no model judgment involved, which is exactly the point (prompts are suggestions; hooks are guarantees); the event catalog from the dump (PreToolUse, PostToolUse, UserPromptSubmit, SessionStart, Stop, etc.) and what each can do — inspect input, block the action, inject context; exit-code/JSON contract for allowing/blocking; classic uses: run the formatter after every edit, block writes to protected paths, lint before commit; slash commands = user-invoked prompt templates in `commands/*.md`, arguments interpolation; commands vs. skills (user pulls vs. model decides). **Pro vs. amateur:** "please always run the tests" in a prompt is a wish — a PostToolUse hook is a law; hooks run with your shell permissions, audit plugin hooks before install; keep hooks fast (they're synchronous with the loop); use a hook when the rule is mechanical, a skill when it needs judgment. **References:** the four URLs above.

- [ ] **Step 3: Write `docs/plugins/06-hooks-and-commands.html`** — h1 `Hooks &amp; <span class="hl">Commands</span>`; subtitle: "Prompting a model to 'always do X' is a suggestion. A hook makes it a guarantee — deterministic code on the agent loop's lifecycle events." Prose: `// Suggestions vs. guarantees`, `// The event catalog`, `// Block, allow, inject`, `// Slash commands`, `// Pro vs. amateur`. Pager 05 ↔ 07.
  - **Figure: hook lifecycle timeline.** Header `● HOOK EVENTS / INTERACTIVE`, label `CLICK AN EVENT`. Horizontal timeline of event chips; clicking one highlights it and shows an example in a detail box:

```html
<div id="hk-line" style="display:flex;gap:6px;flex-wrap:wrap;font-family:var(--mono);font-size:.68rem;letter-spacing:.08em;"></div>
<div id="hk-detail" style="margin-top:16px;padding:14px;border:1px solid var(--line);font-size:.85rem;line-height:1.6;color:var(--fg);min-height:4em;"></div>
<script>
const EV = [
  {n:"SessionStart", d:"Fires once when a session opens. Example: inject the current sprint's ticket list into context.", block:false},
  {n:"UserPromptSubmit", d:"Fires on every user message, before the model sees it. Example: append a reminder of repo conventions.", block:true},
  {n:"PreToolUse", d:"Fires before a tool runs — and can BLOCK it. Example: reject any Edit touching infra/prod/.", block:true},
  {n:"PostToolUse", d:"Fires after a tool succeeds. Example: run the formatter after every file edit. Deterministic — no model judgment.", block:false},
  {n:"Stop", d:"Fires when the agent believes it's done. Example: run the test suite; on failure, tell it to keep working.", block:true},
];
const line = document.getElementById("hk-line"), det = document.getElementById("hk-detail"), ftH = document.getElementById("fig-ft");
line.innerHTML = EV.map((e,i) =>
  `<span data-i="${i}" style="cursor:pointer;padding:8px 12px;border:1px solid #263039;color:#848a91;">${e.n}</span>` +
  (i<EV.length-1?`<span style="align-self:center;color:#4a4f55">→</span>`:"")).join("");
line.querySelectorAll("[data-i]").forEach(ch => ch.addEventListener("click", () => {
  line.querySelectorAll("[data-i]").forEach(o => { o.style.borderColor="#263039"; o.style.color="#848a91"; });
  ch.style.borderColor = "#00c7fd"; ch.style.color = "#00c7fd";
  const e = EV[+ch.dataset.i]; det.textContent = e.d;
  ftH.textContent = e.block ? "THIS EVENT CAN BLOCK THE ACTION" : "THIS EVENT OBSERVES AND REACTS — IT CANNOT BLOCK";
}));
det.textContent = "Click an event to see what a hook can do there.";
ftH.textContent = "FIVE PLACES TO BOLT DETERMINISTIC CODE ONTO THE LOOP";
</script>
```

  `figure-note`: "Event names from Claude Code; other harnesses expose similar lifecycles."

- [ ] **Step 4: Verify** — clicking each of 5 events updates detail + footer; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/06-* notes/plugins/06-* docs/plugins/06-*.html && git commit -m "feat(A1): concept 06 — hooks and commands"`

---

### Task 9: Concept 07 — Building & publishing a plugin

**Files:**
- Create: `research/plugins/07-building-a-plugin.md`, `notes/plugins/07-building-a-plugin.md`, `docs/plugins/07-building-a-plugin.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/plugins`
  - `https://code.claude.com/docs/en/plugins-reference`
  - `https://code.claude.com/docs/en/plugin-marketplaces`
  - `https://www.anthropic.com/engineering/claude-code-best-practices`

- [ ] **Step 2: Write `notes/plugins/07-building-a-plugin.md`** covering a complete worked example — a `pr-buddy` plugin bundling **one skill** (`review-pr`: checklist-driven PR review) and **one agent** (`test-writer`: writes missing tests, tools restricted to read+write+bash): scaffold the directory; write `plugin.json` (full JSON in the note, fields verified against the dump); write the skill's `SKILL.md` (full frontmatter + body in the note, applying page 04's description rules); write the agent file (full frontmatter + system prompt, applying page 05's work-order rules); test locally — install from a local path, fresh session, trigger the skill with a realistic phrase, dispatch the agent, check the negative case; publish — push to a git repo, add a `marketplace.json`, `/plugin marketplace add`, install; iterate with semver bumps. MCP mentioned as also-bundleable via `.mcp.json`, pointer to page 03 — not walked through. **Pro vs. amateur:** version and changelog from day one — teammates' sessions break silently otherwise; test in a *fresh* session (your dev session has contaminated context); write the README for the human installer, the descriptions for the model; start as a local plugin, publish only once it survives a week of real use. **References:** the four URLs above.

- [ ] **Step 3: Write `docs/plugins/07-building-a-plugin.html`** — h1 `Building &amp; <span class="hl">Publishing</span>`; subtitle: "From empty directory to installable plugin: one skill, one agent, a manifest, and a marketplace entry. The whole path, no hand-waving." Prose: `// The worked example: pr-buddy`, `// Scaffold and manifest`, `// The skill and the agent`, `// Test locally, then publish`, `// Pro vs. amateur`. Pager 06 ↔ 08.
  - **Figure: build walkthrough.** Header `● BUILD WALKTHROUGH / INTERACTIVE`, label `PR-BUDDY · 6 STEPS`. A step list on the left, a mono "terminal/file" pane on the right showing each step's artifact; `Next ▸` advances:

```html
<div style="display:flex;gap:14px;flex-wrap:wrap;">
  <ol id="bld-steps" style="flex:1;min-width:180px;list-style:none;padding:0;margin:0;font-family:var(--mono);font-size:.72rem;letter-spacing:.08em;line-height:2.4;color:#4a4f55;"></ol>
  <pre id="bld-pane" style="flex:2;min-width:260px;margin:0;padding:14px;border:1px solid var(--line);font-family:var(--mono);font-size:.74rem;line-height:1.6;color:var(--fg);overflow-x:auto;"></pre>
</div>
<button class="btn" id="bld-btn" style="margin-top:16px;">Next ▸</button>
<script>
const BLD = [
  {n:"1 · SCAFFOLD", p:"pr-buddy/\n├── .claude-plugin/plugin.json\n├── skills/review-pr/SKILL.md\n└── agents/test-writer.md"},
  {n:"2 · MANIFEST", p:'{\n  "name": "pr-buddy",\n  "version": "0.1.0",\n  "description": "PR review checklist + test-writing agent"\n}'},
  {n:"3 · THE SKILL", p:"---\nname: review-pr\ndescription: Use when reviewing a pull request\n  or when asked to check a diff before merge.\n---\n1. Read the full diff first…\n2. Check tests exist for new branches…"},
  {n:"4 · THE AGENT", p:"---\nname: test-writer\ndescription: Writes missing tests for a given file.\ntools: Read, Write, Bash\n---\nYou write focused tests. Deliverable: one\ntest file. Constraints: no new deps…"},
  {n:"5 · TEST LOCALLY", p:"$ claude\n> /plugin install pr-buddy@local\n> “review this PR”\n✓ skill triggered · ✓ agent dispatchable\n✓ negative case: “fix typo” → no trigger"},
  {n:"6 · PUBLISH", p:"$ git push origin main\n# marketplace repo: add entry to\n# .claude-plugin/marketplace.json\n> /plugin marketplace add you/your-marketplace\n> /plugin install pr-buddy@your-marketplace"},
];
let bi = 0;
const ls = document.getElementById("bld-steps"), pane = document.getElementById("bld-pane"), ftB = document.getElementById("fig-ft");
function drawB(){
  ls.innerHTML = BLD.map((s,i) => `<li style="color:${i===bi?'#00c7fd':i<bi?'#dcdee0':'#4a4f55'}">${s.n}</li>`).join("");
  pane.textContent = BLD[bi].p;
  ftB.textContent = `STEP ${bi+1}/6 — SAME PATH FOR EVERY PLUGIN, WHATEVER IT BUNDLES`;
}
document.getElementById("bld-btn").addEventListener("click", () => { bi = (bi+1) % BLD.length; drawB(); });
drawB();
</script>
```

  `figure-note`: "Abbreviated file contents — the note carries the full, copy-pasteable versions."

- [ ] **Step 4: Verify** — six steps cycle, pane updates; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/07-* notes/plugins/07-* docs/plugins/07-*.html && git commit -m "feat(A1): concept 07 — building and publishing"`

---

### Task 10: Concept 08 — Claude ↔ Copilot compatibility

**Files:**
- Create: `research/plugins/08-claude-copilot-compat.md`, `notes/plugins/08-claude-copilot-compat.md`, `docs/plugins/08-claude-copilot-compat.html`

- [ ] **Step 1: Research** — URLs:
  - `https://agents.md/`
  - `https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot`
  - `https://code.visualstudio.com/docs/copilot/chat/mcp-servers`
  - `https://code.visualstudio.com/docs/copilot/copilot-customization`
  - `https://code.claude.com/docs/en/mcp`

- [ ] **Step 2: Write `notes/plugins/08-claude-copilot-compat.md`** covering, per component, what's portable and what isn't (every mapping verified against the dump — this page must not guess): **MCP** — fully portable, one server, both configs (show both config snippets); **project instructions** — AGENTS.md as the cross-tool standard, CLAUDE.md vs. Copilot custom instructions, symlink/include tricks; **skills** — status of Copilot's skill support per the dump (open Agent Skills standard adoption), what to do today; **agents** — Claude subagents vs. Copilot custom agents/chat modes: same concept (prompt + tools + model), different file formats, translation is mechanical; **hooks/commands** — the least portable layer, harness-specific; a strategy section: keep knowledge in portable layers (MCP, AGENTS.md, skills), accept thin vendor-specific wrappers on top. **Pro vs. amateur:** design for the portable layers first, wrap per-vendor last; don't duplicate instructions across CLAUDE.md and AGENTS.md — include one from the other; verify claimed "compatibility" against the current docs, this layer shifts quarterly; a team standardizing on MCP + AGENTS.md can switch assistants with near-zero rework. **References:** the five URLs above.

- [ ] **Step 3: Write `docs/plugins/08-claude-copilot-compat.html`** — h1 `Claude ↔ Copilot <span class="hl">Compatibility</span>`; subtitle: "One integration, two harnesses. What carries over as-is, what needs translating, and what stays vendor-locked — component by component." Prose: `// The portable layers`, `// Instructions: AGENTS.md`, `// Agents: same idea, different files`, `// The vendor-locked layer`, `// A portability strategy`, `// Pro vs. amateur`. Pager 07 ↔ 09.
  - **Figure: compatibility matrix.** Header `● COMPATIBILITY MATRIX / INTERACTIVE`, label `CLICK A CELL`. Table rows = components, columns = Claude Code / Copilot; cells show `●` full, `◐` partial, `○` n/a; click a cell → footer explains:

```html
<table id="cmp" style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:.76rem;">
  <tr style="color:#848a91;letter-spacing:.12em;"><th style="text-align:left;padding:8px;border:1px solid #263039;">COMPONENT</th><th style="padding:8px;border:1px solid #263039;">CLAUDE CODE</th><th style="padding:8px;border:1px solid #263039;">COPILOT</th></tr>
</table>
<script>
const ROWS = [
  ["MCP SERVERS","●","●","Fully portable — same server binary, two small config files.","Native MCP support in VS Code/Copilot; same protocol."],
  ["PROJECT INSTRUCTIONS","●","●","CLAUDE.md, or AGENTS.md which Claude Code also reads.","Custom instructions + AGENTS.md support."],
  ["SKILLS","●","◐","First-class: SKILL.md, progressive disclosure, plugins.","Check current support status — verify against the research dump before finalizing this string."],
  ["AGENTS","●","◐","Subagent .md files: frontmatter + system prompt.","Custom agents/chat modes: same concept, different file format — mechanical translation."],
  ["HOOKS","●","○","Full lifecycle event system.","No equivalent lifecycle hook system — vendor-locked layer."],
  ["SLASH COMMANDS","●","◐","commands/*.md prompt templates.","Prompt files serve the same role, different location/format."],
];
const tbl = document.getElementById("cmp"), ftC = document.getElementById("fig-ft");
ROWS.forEach((r,i) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td style="padding:8px;border:1px solid #263039;color:#dcdee0;">${r[0]}</td>` +
    [1,2].map(c => `<td data-r="${i}" data-c="${c}" style="cursor:pointer;text-align:center;padding:8px;border:1px solid #263039;color:${r[c]==="●"?"#57b06a":r[c]==="◐"?"#e08a3c":"#4a4f55"};font-size:1rem;">${r[c]}</td>`).join("");
  tbl.appendChild(tr);
});
tbl.addEventListener("click", e => {
  const td = e.target.closest("[data-r]"); if (!td) return;
  tbl.querySelectorAll("[data-r]").forEach(o => o.style.background = "");
  td.style.background = "rgba(0,199,253,.12)";
  const r = ROWS[+td.dataset.r];
  ftC.textContent = `${r[0]} · ${td.dataset.c==="1"?"CLAUDE CODE":"COPILOT"}: ${r[+td.dataset.c+2].toUpperCase()}`;
});
ftC.textContent = "● FULL · ◐ PARTIAL / DIFFERENT FORMAT · ○ NO EQUIVALENT — CLICK A CELL";
</script>
```

  **Before shipping, replace the SKILLS/Copilot cell text and symbol with what the research dump actually says** — the matrix must reflect fetched facts, not this plan's guess.
  `figure-note`: "Snapshot as of the fetch date in the research dump — this layer shifts quarterly."

- [ ] **Step 4: Verify** — cell clicks explain in footer; matrix matches the dump; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/08-* notes/plugins/08-* docs/plugins/08-*.html && git commit -m "feat(A1): concept 08 — Claude/Copilot compatibility"`

---

### Task 11: Concept 09 — Which one, when

**Files:**
- Create: `research/plugins/09-which-one-when.md`, `notes/plugins/09-which-one-when.md`, `docs/plugins/09-which-one-when.html`

- [ ] **Step 1: Research** — URLs:
  - `https://code.claude.com/docs/en/skills`
  - `https://code.claude.com/docs/en/hooks-guide`
  - `https://www.anthropic.com/research/building-effective-agents`
  - `https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`

- [ ] **Step 2: Write `notes/plugins/09-which-one-when.md`** covering the decision framework: start from the failure mode, not the technology — *"the model doesn't know how we do X"* → skill; *"the model can't reach system X"* → MCP server; *"this sub-task pollutes/overflows the main context or needs different tools"* → agent; *"this rule must hold every time, no exceptions"* → hook; *"I keep typing the same request"* → command; *"it's a one-off"* → just prompt. Then the costs column: skill ≈ markdown, cheapest to write/maintain; MCP = running software, deps, auth, updates; agent = latency + tokens per dispatch; hook = shell scripts on the hot path; combinations (a plugin usually bundles several); maintenance reality — descriptions drift, docs-linked instructions rot, someone must own each artifact. **Pro vs. amateur:** amateurs pick the shiniest tool (an MCP server where a 30-line skill would do); pros pick the cheapest artifact that fixes the failure mode; escalate only on evidence (prompt → command → skill → agent/MCP); measure context cost of what you install; delete plugins that stopped earning their tokens. **References:** the four URLs above.

- [ ] **Step 3: Write `docs/plugins/09-which-one-when.html`** — h1 `Which One, <span class="hl">When</span>`; subtitle: "Skill, MCP server, agent, hook, command, or just a prompt? Start from the failure mode you're fixing — the right artifact falls out." Prose: `// Start from the failure mode`, `// The cost column`, `// Escalate on evidence`, `// Pro vs. amateur`. Pager: prev 08, next `deck.html` (`Deck · The presentation →`).
  - **Figure: decision-tree walker.** Header `● DECISION WALKER / INTERACTIVE`, label `ANSWER THE QUESTIONS`. Question box + answer buttons; walks to a recommendation; `Start over` resets:

```html
<div id="dw-q" style="padding:14px;border:1px solid var(--line);font-size:.95rem;line-height:1.6;color:var(--fg);min-height:3.5em;"></div>
<div id="dw-btns" style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;"></div>
<script>
const TREE = {
  start:{q:"What's failing?",a:[["Model lacks our know-how","knw"],["Model can't reach a system","mcp"],["A rule keeps getting skipped","hook"],["Main context gets polluted","agent"]]},
  knw:{q:"Is it needed on most tasks, or only for specific ones?",a:[["Most tasks","res_inst"],["Specific tasks","res_skill"]]},
  mcp:{q:"Does an existing MCP server cover it?",a:[["Yes","res_use"],["No","res_mcp"]]},
  hook:{q:"Is the rule mechanical (no judgment needed)?",a:[["Yes","res_hook"],["Needs judgment","res_skill"]]},
  agent:{q:"Does the sub-task need the conversation's context?",a:[["No — self-contained","res_agent"],["Yes","res_inline"]]},
  res_inst:{r:"PROJECT INSTRUCTIONS (CLAUDE.md / AGENTS.md) — always-loaded, keep it short."},
  res_skill:{r:"A SKILL — markdown, loads on demand, cheapest artifact that adds judgment."},
  res_use:{r:"USE THE EXISTING MCP SERVER — never build what you can install."},
  res_mcp:{r:"BUILD AN MCP SERVER — it's running software: budget for deps, auth, upkeep."},
  res_hook:{r:"A HOOK — deterministic, can block. Prompts suggest; hooks guarantee."},
  res_agent:{r:"A SUBAGENT — fresh context, restricted tools, one-message return."},
  res_inline:{r:"STAY INLINE — a dispatch that needs the whole conversation is cheaper done in place."},
};
const qEl = document.getElementById("dw-q"), bEl = document.getElementById("dw-btns"), ftD = document.getElementById("fig-ft");
function go(k){
  const n = TREE[k];
  if (n.r){ qEl.innerHTML = `<b style="color:#00c7fd">${n.r}</b>`;
    bEl.innerHTML = `<button class="btn" data-k="start">Start over</button>`;
    ftD.textContent = "RECOMMENDATION — ESCALATE ONLY ON EVIDENCE";
  } else { qEl.textContent = n.q;
    bEl.innerHTML = n.a.map(([t,k2]) => `<button class="btn" data-k="${k2}">${t}</button>`).join("");
    ftD.textContent = "START FROM THE FAILURE MODE, NOT THE TECHNOLOGY";
  }
  bEl.querySelectorAll("[data-k]").forEach(b => b.addEventListener("click", () => go(b.dataset.k)));
}
go("start");
</script>
```

  `figure-note`: "A heuristic, not a law — real plugins usually combine two or three artifacts."

- [ ] **Step 4: Verify** — every path reaches a recommendation and resets; zero console errors.
- [ ] **Step 5: Commit** — `git add research/plugins/09-* notes/plugins/09-* docs/plugins/09-*.html && git commit -m "feat(A1): concept 09 — which one when"`

---

### Task 12: Module index + main landing card + link check

**Files:**
- Create: `docs/plugins/index.html`
- Modify: `docs/index.html` (add Module A1 section)
- Delete: `docs/plugins/_template.html`

- [ ] **Step 1: Write `docs/plugins/index.html`** — same header (nav `A1 Index` gets `class="on"`). Hero: crumb `Module A1 / AI Plugins & Marketplaces`, h1 `AI <span class="hl">Plugins</span>`, subtitle: "Marketplaces, plugins, MCP, skills, agents, and hooks — what each one is, when to reach for it, and how to build and ship your own for Claude and Copilot." Meta: `10 concepts · 1 deck · Prereq: none (00 is the primer)`. Card grid (`.refs`/`.ref`), one card per page with hooks: 00 "Four ideas, fifteen minutes"; 01 "A catalog, not a store"; 02 "A directory with a manifest"; 03 "One protocol, every assistant"; 04 "The description is the API"; 05 "A job description in markdown"; 06 "Suggestions vs. guarantees"; 07 "Empty directory to installed plugin"; 08 "What ports, what doesn't"; 09 "Start from the failure mode". Plus a highlighted card for `deck.html`: `<span class="src">PRESENTATION</span><span class="t">The 45-minute deck — all ten concepts, live</span>`. Footer (mono, faint): `BUILT WHILE LEARNING · SOURCES: ANTHROPIC / GITHUB / MICROSOFT / MODELCONTEXTPROTOCOL.IO`.

- [ ] **Step 2: Add Module A1 to `docs/index.html`** — after the Module 01 card grid, add a section heading in the established style and a second `.refs` grid with one wide card: `<a class="ref" href="plugins/index.html"><span class="src">MODULE A1 · AUX</span><span class="t">AI Plugins & Marketplaces — skills, agents, MCP, hooks: use them, build them, ship them</span></a>`. Match the existing landing page's structure exactly (inspect it first; reuse its section markup).

- [ ] **Step 3: Delete template** — `rm docs/plugins/_template.html`

- [ ] **Step 4: Run the site-wide link check** (Verification commands). Expected: silent, exit 0. Fix any broken href.

- [ ] **Step 5: Manual pass** — `open docs/index.html`: A1 card present and navigates; from `docs/plugins/index.html` click all 10 cards + deck link; walk pager 00→09; exercise each figure with the console open.

- [ ] **Step 6: Commit** — `git add -A docs && git commit -m "feat(A1): module index and landing page card"`

---

### Task 13: The presentation — `docs/plugins/deck.html`

**Files:**
- Create: `docs/plugins/deck.html`

**Interfaces:**
- Consumes: all ten notes (slide content is distilled from them — no new claims; anything on a slide must trace to a research dump).

- [ ] **Step 1: Write the deck skeleton** — one file, `../style.css` plus an inline `<style>` block:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Deck · AI Plugins — llm::intuition</title>
<link rel="stylesheet" href="../style.css">
<style>
.slide{min-height:100vh;display:flex;flex-direction:column;justify-content:center;
  padding:48px min(8vw,96px);border-bottom:1px solid var(--line);position:relative;z-index:1;}
.slide h2{font-family:var(--mono);font-size:clamp(1.4rem,4vw,2.2rem);color:#f3f5f7;margin:0 0 18px;}
.slide h2 .hl{color:var(--blue);}
.slide ul{color:#adb3ba;line-height:1.9;font-size:1.05rem;max-width:62ch;}
.slide .kicker{font-family:var(--mono);font-size:.68rem;letter-spacing:.22em;color:var(--blue);text-transform:uppercase;}
.slide pre{background:var(--panel);border:1px solid var(--line);padding:16px;font-size:.85rem;overflow-x:auto;max-width:70ch;}
body.deck-mode .slide{display:none;}
body.deck-mode .slide.on{display:flex;}
#hud{position:fixed;bottom:14px;right:20px;z-index:2;font-family:var(--mono);
  font-size:.68rem;letter-spacing:.14em;color:var(--faint);}
</style>
</head>
<body>
<div class="grid-bg"></div>
<!-- ~40 <section class="slide"> blocks -->
<div id="hud"></div>
<script>
const slides = [...document.querySelectorAll(".slide")];
const hud = document.getElementById("hud");
let cur = Math.max(0, slides.findIndex(s => location.hash === "#"+s.id));
document.body.classList.add("deck-mode");
function show(n){
  cur = Math.min(slides.length-1, Math.max(0, n));
  slides.forEach((s,i) => s.classList.toggle("on", i===cur));
  hud.textContent = `${cur+1} / ${slides.length} · ←→`;
  if (slides[cur].id) history.replaceState(null,"","#"+slides[cur].id);
}
addEventListener("keydown", e => {
  if (e.key==="ArrowRight"||e.key===" "||e.key==="PageDown") show(cur+1);
  if (e.key==="ArrowLeft"||e.key==="PageUp") show(cur-1);
});
addEventListener("click", e => { if (!e.target.closest("a")) show(cur+1); });
show(cur);
</script>
</body>
</html>
```

With JS disabled, `deck-mode` is never added and all slides render as a scrollable document.

- [ ] **Step 2: Write the ~40 slides** — each `<section class="slide" id="s-NN">` with a `.kicker` (section name), an `h2`, and bullets/pre blocks distilled from the notes. Structure and per-slide content:
  - **Opening (3):** 1 title (`AI <span class="hl">Plugins</span> — from zero to shipping`, presenter/date line); 2 "why extend your assistant" (prompting is copy-paste engineering; packaged = versioned, shareable, reviewable); 3 agenda (the 9 deck sections).
  - **Primer (5):** 4 next-token prediction, looped; 5 the context window is the working memory; 6 tool use — the model asks, the harness acts; 7 the agent loop (reproduce page 00's five hops as a static diagram); 8 "plugins extend the harness, not the model" — the thesis slide.
  - **Marketplaces & plugins (6):** 9 what a marketplace is (catalog, not a store); 10 marketplace.json anatomy (pre block); 11 install flow (`/plugin marketplace add` → `/plugin install`); 12 plugin = the container (file-tree pre block from page 02); 13 the manifest; 14 trust — you are running their code.
  - **MCP (4):** 15 the N×M problem; 16 tools/resources/prompts; 17 the handshake (condensed message flow from page 03); 18 one server, both harnesses (both config snippets side by side).
  - **Skills (8):** 19 what a skill is (SKILL.md pre block); 20 progressive disclosure — three loading levels; 21 the token math (numbers from page 04's figure); 22 "the description is the API"; 23 good vs. bad description (side-by-side pre blocks); 24 writing the body (craft checklist); 25 testing — fresh session, negative case; 26 failure modes table.
  - **Agents (7):** 27 the agent file (frontmatter pre block); 28 why delegate — fresh context + tool rails; 29 the dispatch contract (one message back); 30 the work-order rule (good vs. bad dispatch prompt); 31 orchestration patterns (fan-out, pipeline); 32 model-per-agent economics; 33 when NOT to delegate.
  - **Hooks & commands (3):** 34 suggestions vs. guarantees; 35 the event catalog (timeline from page 06 as static graphic); 36 slash commands in one slide.
  - **Build & ship (5):** 37 pr-buddy scaffold; 38 the skill + the agent (abbreviated files); 39 test locally (fresh session, negative case); 40 publish (marketplace entry, install command); 41 install it in Copilot too (page 08's portable-layers summary).
  - **Close (3):** 42 the decision matrix (page 09's failure-mode table); 43 "escalate only on evidence" (prompt → command → skill → agent/MCP); 44 links — module URL, both docs sites, QR-free plain URLs.

  Slide count may land 40–46; that's fine for 45–60 min. Every factual claim on a slide must already exist in a note (and therefore trace to a dump).

- [ ] **Step 3: Verify** — `open docs/plugins/deck.html`: arrow keys + click advance; HUD counts; deep-link `#s-20` opens on that slide; disable JS → full scrollable document; zero console errors.

- [ ] **Step 4: Run the link check** (Verification commands) — deck links resolve.

- [ ] **Step 5: Commit** — `git add docs/plugins/deck.html && git commit -m "feat(A1): presentation deck"`

---

### Task 14: Publish

**Files:** none (repo operations)

- [ ] **Step 1: Full manual pass on the branch** — walk `docs/index.html` → A1 → all pages → deck one last time.

- [ ] **Step 2: Merge per project flow** — `git checkout dev && git merge aux-plugins && git checkout main && git merge dev && git push origin main dev` (create `dev` from `main` first if it doesn't exist: `git checkout -b dev main`).

- [ ] **Step 3: Verify live** — GitHub Pages already serves `docs/` from `main`. `curl -s -o /dev/null -w "%{http_code}" https://ialvarezz.github.io/llm-intuition/plugins/` → expect `200` (allow a minute for Pages to rebuild). Open the live URL; spot-check one figure and the deck over HTTPS.

- [ ] **Step 4: Report the live URLs (module index + deck) to the user.**
