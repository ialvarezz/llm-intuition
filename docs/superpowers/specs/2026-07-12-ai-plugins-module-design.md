# Module A1: AI Plugins, Marketplaces, Agents & Skills — Design

**Date:** 2026-07-12
**Status:** Approved design, pending implementation plan

## Goal

An auxiliary module of llm-intuition teaching engineers with little-to-no LLM background everything needed to understand, use, and build AI plugins: marketplaces, plugins, MCP servers, skills, agents/subagents, hooks, and slash commands — for both Claude (Claude Code) and GitHub Copilot. Deliverables are 10 concept pages (plus module index) in the site's established style, and a self-contained HTML slide deck for a 45–60 minute presentation.

## Audience & emphasis

- Engineers with basic or no LLM knowledge; page 00 is a condensed primer, with Module 1 linked for depth.
- **Center of gravity: skills and agents development.** Those two pages (04, 05) are the deepest — full authoring detail (file formats, frontmatter, description-writing as the real API, testing, failure modes). MCP (03) is one solid conceptual page: it matters as the interoperability layer, not as the thing the audience builds daily.

## Architecture

Same as Module 1: plain static site, no build step, no external JS/CSS dependencies, Reactor Intel-blue style system (`docs/style.css` reused). Each page has one interactive figure with inline vanilla JS, readable with JS disabled.

- Module lives in `docs/plugins/` with its own `index.html` and nav; pages reference the shared stylesheet via `../style.css`.
- Main landing page (`docs/index.html`) gets a Module A1 section/card linking in.
- Deck is a single `docs/plugins/deck.html`: each slide a `<section>`, ~30 lines of inline JS for arrow-key/click/touch navigation and a slide counter; degrades to a scrollable document with JS disabled. No reveal.js.

## Page inventory (`docs/plugins/`)

| # | Page | Core content | Figure |
|---|------|-------------|--------|
| 00 | The 15-minute primer | Tokens, context, tool-use loop, what an agent is; links to Module 1 | Agent loop stepper (prompt → tool call → result → answer) |
| 01 | What is a plugin marketplace | Why extend an assistant; marketplace concept; Claude Code marketplaces (`marketplace.json`); VS Code/Copilot marketplace; trust & install flow | Marketplace anatomy diagram (hover component → role) |
| 02 | Plugins: the container | `plugin.json`, directory layout, what a plugin bundles, versioning, install lifecycle | Expandable plugin file-tree |
| 03 | MCP servers | Tools/resources/prompts; transports (stdio/HTTP); why both Claude and Copilot speak it | Client↔server message flow stepper |
| 04 | Skills (deep) | SKILL.md format, frontmatter, progressive disclosure, description-writing, testing, failure modes; Agent Skills open standard; Copilot support | Progressive-disclosure simulator (context cost of skill vs. always-loaded) |
| 05 | Agents & subagents (deep) | Custom agents/subagents: own prompt, tools, model; delegation patterns; authoring detail; Copilot custom agents/chat modes | Delegation diagram (orchestrator dispatches, result returns) |
| 06 | Hooks & commands | Event hooks (pre/post tool use, session start…); deterministic control vs. prompting; slash commands | Hook lifecycle timeline (pick event → see what fires) |
| 07 | Building & publishing a plugin | End-to-end worked example bundling **a skill and an agent**: scaffold → author → test locally → publish to a marketplace → install. MCP mentioned as bundleable, not walked through | Build checklist walkthrough |
| 08 | Claude ↔ Copilot compatibility | What maps to what (MCP config, skills support, AGENTS.md, agents); portable vs. vendor-specific; one artifact serving both | Interactive compatibility matrix |
| 09 | Which one, when | Decision guide: skill vs. MCP vs. agent vs. hook vs. plain prompt; cost/maintenance trade-offs | Decision-tree walker |

Every page keeps Module 1 conventions: pager chain 00→09, "Pro vs. amateur" section, reference cards with real URLs.

## Presentation (`docs/plugins/deck.html`, ~40 slides, 45–60 min)

1. Opening (3) — why extend your AI assistant; agenda.
2. Primer (5) — agent loop, tool use, context.
3. Marketplaces & plugins (6) — marketplace concept, plugin anatomy, install flow.
4. MCP (4) — the universal protocol, conceptually.
5. **Skills deep dive (8)** — format, progressive disclosure, writing descriptions, example.
6. **Agents deep dive (7)** — subagents, delegation, when to reach for one, example.
7. Hooks & commands (3) — quick tour.
8. Build & ship (5) — the page-07 worked example, publish, install in Claude + Copilot.
9. Decision guide + close (3) — the "which one, when" matrix; links to module pages.

Speaker cues live in the concept pages/notes, not the deck.

## Research protocol

Module 1's research-first rule applies, tightened for a fast-moving domain:

- Dumps in `research/plugins/NN-<stem>.md`; every load-bearing fact tagged `[Sn]`; nothing from model memory alone — plugin ecosystems changed rapidly through 2025–2026, so unverified claims get cut.
- Source pool: Anthropic docs (Claude Code plugins, skills, subagents, hooks, marketplaces), MCP spec (modelcontextprotocol.io), Agent Skills standard, GitHub/Copilot docs (extensions, custom agents, MCP & skills support, AGENTS.md), vendor engineering blogs, talks/videos. Exact URLs pinned per-task in the implementation plan.
- **Scraping via subagents:** per-page research is independent; dispatch parallel Explore/general-purpose agents on Haiku to fetch each page's source set and write the dump. The main session verifies dumps and authors all notes/pages itself.

## Execution

- Branch `aux-plugins`; commit per task; merge via dev → main per project flow.
- Verification per page: browser open, console check, link checker extended to walk `docs/plugins/`. Deck: keyboard-walk all slides + JS-disabled scroll check.
- **Deliverables:** 10 research dumps, 10 notes, 12 HTML files (10 pages + module index + deck), 1 edit to `docs/index.html`.
