# Plugin Marketplace Deck v2 — Design

**Date:** 2026-07-15
**Status:** Approved for planning

## Goal

Replace `docs/plugins/deck.html` with a from-scratch, 17-slide presentation on
plugin marketplaces for a mixed audience (hardware engineers plus others, basic
AI/software knowledge). ~45-minute session plus open Q&A.

## Constraints and decisions

- **Vendor-neutral.** No product names. Say "AI assistant" and "harness".
  File layouts shown as the common plugin format, unbranded.
- **Running example.** One fictional plugin, `review-buddy` (code review),
  dissected throughout. It exercises all five components: a `/review` command,
  a review-checklist skill, an MCP server to the repo host, a pre-commit lint
  hook, and a `reviewer` agent.
- **Replace in place.** New deck overwrites `docs/plugins/deck.html`. The ten
  companion concept pages (`00-primer.html` … `09-which-one-when.html`) stay
  untouched.
- **Same deck conventions.** Links `../style.css`, grid background, slide
  sections with deck-mode keyboard nav, HUD counter.
- **Interactivity: self-contained JS only.** No dependencies. Every
  interactive element degrades to fully readable static content with JS off
  (repo no-JS convention).

## Slide list (17)

1. **Title** — "Plugin Marketplaces — anatomy of an ecosystem."
2. **Hook + agenda** — the pain: everyone re-pastes the same prompts; nothing
   is shared or versioned. Promise: by the end you can read any plugin like a
   datasheet. Agenda strip.
3. **What is a marketplace** — a catalog of pointers, not a store: metadata
   JSON listing plugins that live in git repos/URLs. Diagram:
   marketplace → plugins → your machine.
4. **What is a plugin & its types** — a versioned folder of instructions +
   integrations. Interactive **exploded folder tree** of `review-buddy/`:
   clicking each entry (`agents/`, `skills/`, `.mcp.json`, `hooks/`,
   `commands/`) highlights it and shows a one-liner. Types: single-purpose vs
   toolkit vs pure-config.
5. **Consuming from a marketplace** — keypress-advanced **step-through**:
   add marketplace → browse → install → files land locally → harness loads
   them at session start → updates tracked by version. Emphasize: install =
   copying text files; nothing runs yet.
6. **Mental model: harness vs model** — the model (fixed weights, predicts
   text) vs the harness (the app around it: executes tools, injects context).
   Plugins extend the harness, never the model.
7. **Commands** — the entry point. `/review` typed by a human expands to a
   prompt template. Example: the actual `review.md` command file, ~10 lines.
8. **Skills** — packaged expertise loaded on demand. The team's review
   checklist as `SKILL.md`; pulled in only when reviewing. Contrast vs
   commands: model-invoked vs human-invoked.
9. **MCP servers** — the hands. A protocol for giving the assistant tools
   (fetch the diff, post a review comment). Diagram: assistant ↔ MCP server ↔
   external system. The only component that is running code, not text.
10. **Hooks** — the reflexes. Deterministic triggers on events (before
    commit → run lint), no model judgment. Contrast: everything else advises
    the model; hooks constrain it.
11. **Agents** — the delegates. A sub-assistant with its own instructions and
    tool access, spawned for a bounded job. Ends with a **step-through** of
    `review-buddy` in action: `/review` → command expands → agent spawns →
    MCP fetches diff → skill guides checklist → hook gates the fix commit.
    All five components in one animated flow.
12. **When to use what** — interactive **decision picker**: "I want to…
    (run a repeatable task / teach it my team's way / connect a system /
    enforce a rule / delegate a job)" → click reveals the component and why.
13. **Why review-buddy is built this way** — taxonomy applied backwards: for
    each part, why that component and what would break otherwise (checklist as
    a command bloats every prompt; lint as a skill might be skipped).
14. **BKMs I: building** — start with a command, add components only when
    needed; keep skills short; version everything; one plugin = one job.
15. **BKMs II: consuming & trust** — read before you install (plugins are
    text files — audit them); MCP servers run code, treat like any dependency;
    pin versions; context is a budget — every installed plugin competes for it.
16. **Recap** — one table: component / what it is / who triggers it /
    review-buddy example.
17. **Q&A** — open floor, marketplace/plugin diagram as backdrop.

## Interactive elements (4)

| Slide | Element | No-JS fallback |
|-------|---------|----------------|
| 4 | Exploded folder tree, click-to-highlight | Tree fully rendered with all one-liners visible |
| 5 | Consumption flow step-through (keypress) | All steps rendered in sequence |
| 11 | review-buddy end-to-end step-through | All steps rendered in sequence |
| 12 | Decision picker (click a goal, reveal component) | All goal→component pairs listed |

## Content sourcing

Draw factual claims from the existing `research/plugins/*.md` notes
(research-first rule). No new research required; the deck reorganizes and
condenses what those notes already establish, stripped of vendor naming.

## Out of scope

- Changes to the ten concept pages or `docs/plugins/index.html`.
- Live-demo checkpoints (deck must stand alone).
- Copilot/compatibility content.

## Testing

- Open deck in browser: all 17 slides render; keyboard nav and HUD work.
- Each interactive element operates by click/keypress.
- Load with JS disabled: all content readable, nothing hidden.
