# llm-intuition — Module 01: Context & Reasoning — Design

**Date:** 2026-07-22
**Status:** Approved for planning

## Purpose

Module 00 (LLM Fundamentals) gave a first pass at tokens, attention, and the
context window — one concept page each, ~50-65 lines of sourced research
apiece. Module 01 goes back to those same mechanics and goes deep: how
context actually shapes model behavior beyond "the window filled up," how
attention allocates focus unevenly across that window, how the harness
assembles system/user/assistant roles into what the model actually reads,
and what "reasoning" mechanically is. It closes with a capstone interactive
deck, following the same pattern Module A1 (AI Plugins & Marketplaces) used.

Same audience split, same research-first rule, same branch flow as prior
modules — this spec covers what's new: scope, concept list, and the deck.

## Where it sits

Core-track modules use plain numbers (`docs/fundamentals` = Module 00);
auxiliary modules use an `A` prefix (`docs/plugins` = Module A1). Module 01
slots into the core track immediately after Module 00 — no renumbering of
existing modules required.

```
docs/
├── fundamentals/        # Module 00 (existing, untouched)
├── plugins/              # Module A1 (existing, untouched)
├── context-reasoning/     # Module 01 (new)
│   ├── index.html
│   ├── 01-tokenization-deep.html
│   ├── 02-context-window.html
│   ├── 03-attention-curve.html
│   ├── 04-prompt-roles.html
│   ├── 05-reasoning.html
│   └── deck.html
└── index.html            # site landing — gets a Module 01 card
research/context-reasoning/    # research dumps, one per concept, per protocol
notes/context-reasoning/       # deep-dive study notes, one per concept
```

Directory naming mirrors the `research/plugins/`, `notes/plugins/`,
`docs/plugins/` convention Module A1 established, substituting
`context-reasoning` for `plugins`.

## Concept list (5)

Each ships as the established research → note → page triple.

1. **Tokenization, deeper** — BPE mechanics (merge process, not just "it
   splits words"), vocabulary construction and size trade-offs, special and
   chat-format tokens, why tokenization drives cost and explains odd model
   behavior around rare strings. Builds on Module 00 concept 02 without
   duplicating its illustrative-tokenizer figure.
2. **Context & the context window** — broadened past "what happens when
   full": everything in the window every turn (system prompt, history, tool
   results, output reservation), how content *position and composition*
   affect behavior generally, and the mitigation strategies — sliding
   window, summarization, RAG offload — not just eviction at the cap.
3. **Attention & the attention curve** — how attention allocates focus
   unevenly across the window; primacy/recency bias; "lost in the middle";
   why content that's technically in-window can still be functionally
   invisible. Builds on Module 00 concept 04's attention mechanics.
4. **System / user / assistant roles** — how the harness assembles these
   into the raw sequence the model reads, why role affects instruction
   priority and how the model weighs conflicting instructions across roles,
   common failure modes (role confusion, injected content taking on
   unintended authority).
5. **Reasoning, in depth** — what reasoning mechanically is (more tokens
   spent before an answer = more compute spent), chain-of-thought,
   extended-thinking/reasoning-token modes, reasoning vs. retrieval vs.
   pattern-matching, and where reasoning traces mislead (confident wrong
   reasoning, traces that don't match the final answer).

Concept order matches the deck's teaching order: tokenization is the
substrate, context window is what holds tokens, attention is how the model
weighs them, roles are how humans structure them, reasoning is what the
model does with them.

## Deck — "Context & Reasoning"

Same conventions as the Module A1 deck: vendor-neutral, self-contained JS,
every interactive degrades to fully readable static content with JS off,
links `../style.css`, deck-mode keyboard nav, HUD slide counter. ~45-minute
session, mixed audience (Module 00 level assumed, no ML background required).

### Slide list (17)

1. **Title** — "Context & Reasoning — what's actually happening inside the
   window."
2. **Hook + agenda** — the pain: prompts get longer and quality degrades
   unpredictably, and most people can't say why. Promise: leave able to
   reason about a context budget like an engineer, not guess at it.
3. **Tokenization** — the substrate everything else is built on.
   *Interactive:* live tokenizer — type text, watch it split, see the
   token/word-count mismatch update live.
4. **Chat format & special tokens** — the system/user/assistant markers are
   themselves tokens, not metadata. *Interactive:* toggle between "rendered
   chat" and "raw tokens the model actually reads" for the same exchange —
   sets up slide 9.
5. **The context window as budget** — everything counts: system prompt,
   history, tool results, reserved output. *Interactive:* stacked-bar
   simulator — add a turn, paste a doc, watch it fill (adapted from Module
   00 concept 05's figure, extended with more segment types).
6. **What happens when full** — not just eviction. *Interactive:* click
   through truncation vs. sliding window vs. summarization vs. RAG offload,
   each showing what survives and what's lost for the same overflowing
   conversation.
7. **Position matters, not just size** — being in-window isn't being seen.
   *Interactive:* drag a fact to a position in a long context, read its
   live recall probability off a lost-in-the-middle curve.
8. **Attention mechanism, why position matters** — the mechanical cause of
   slide 7. *Interactive:* attention-weight stepper on a sentence (adapted
   from Module 00 concept 04), extended to show weight attenuating with
   distance.
9. **System / user / assistant roles** — who gets to say what.
   *Interactive:* prompt assembler — drag instruction snippets into roles,
   see the assembled raw prompt and each role's relative instruction
   priority.
10. **Roles shape behavior** — same instruction, different role, different
    result. *Interactive:* decision picker — "I want to… (set persistent
    behavior / ask a one-off / show an example)" → reveals which role and
    why, plus the failure mode of using the wrong one.
11. **What reasoning actually is** — not a separate faculty, more compute
    before an answer. *Interactive:* toggle "direct answer" vs. "step-by-
    step trace" on the same prompt, token count and answer quality visibly
    differ.
12. **Extended thinking / reasoning tokens** — a budget like any other.
    *Interactive:* slider — reasoning-token budget vs. answer quality/cost
    tradeoff on a fixed task.
13. **Reasoning failure modes** — traces aren't proof. *Interactive:*
    click-to-reveal gallery — confident wrong reasoning, a trace that
    doesn't match its own final answer.
14. **End-to-end walkthrough** — all five concepts in one flow.
    *Interactive:* step-through of one long conversation: tokenized →
    window fills → attention curve affects what's actually recalled →
    roles structure the ask → a reasoning trace produces the answer.
15. **BKMs** — practical guidance grouped by concept. *Interactive:*
    accordion checklist, one section per concept.
16. **Recap** — one table: concept / mechanism / one BKM each. No new
    interactive — a stable reference slide.
17. **Q&A** — open floor, module diagram as backdrop.

### Interactive elements (13)

| Slide | Element | No-JS fallback |
|-------|---------|----------------|
| 3 | Live tokenizer | Default sentence shown pre-tokenized |
| 4 | Raw-tokens / rendered-chat toggle | Both views rendered stacked |
| 5 | Context budget stacked-bar simulator | Bar shown at one representative fill state |
| 6 | Overflow-strategy comparison | All four strategies rendered side by side |
| 7 | Draggable position → recall curve | Curve shown with 3 fixed example positions marked |
| 8 | Attention-weight stepper | Full attention table for all tokens rendered at once |
| 9 | Prompt assembler (drag roles) | Final assembled prompt shown pre-built |
| 10 | Decision picker | All goal → role pairs listed |
| 11 | Direct vs. step-by-step toggle | Both traces rendered stacked |
| 12 | Reasoning-budget slider | 3 fixed budget levels shown as static rows |
| 13 | Failure-mode reveal gallery | All examples rendered expanded |
| 14 | End-to-end step-through | All steps rendered in sequence |
| 15 | BKM accordion | All sections rendered expanded |

## Content sourcing

Research-first rule applies, same as every prior module: every factual claim
in `notes/context-reasoning/*.md` and the deck must trace to a fetched
source recorded in `research/context-reasoning/NN-*.md` (URL + fetch date +
extracted/verbatim content), with quote audits run both directions
(note/page → dump, and dump → live re-fetch) given the fabricated-quote
issue caught during Module 00.

Dispatch research investigators per concept before drafting notes — same
protocol as Module 00's Research protocol: fetch every reference URL,
extract key claims/quotes into the dump, tag every load-bearing fact in the
note with its source id. Module 00's existing dumps (`research/02-tokens-
and-tokenization.md`, `research/04-attention-and-transformers.md`,
`research/05-context-window.md`) are reusable starting points for concepts
1–3 where they already cover ground (e.g. `research/05-context-window.md`
already has Lost in the Middle [S2] and KV-cache [S5]) — extend them rather
than re-researching facts already sourced there. Concepts 4 (prompt roles)
and 5 (reasoning) need fresh dumps; no existing research covers either.

Deck content is a synthesis of the five concept dumps — no separate deck-
specific research required, matching the Module A1 deck's sourcing
approach.

## Visual identity & conventions

Same "Reactor, Intel blue" system as Modules 00 and A1: `docs/style.css`
shared stylesheet, dark ground, blue grid backdrop, monospace headlines,
sharp corners, no external dependencies beyond YouTube embeds. New concept
pages copy the existing page skeleton/pager pattern; the deck copies
`docs/plugins/deck.html`'s structure and CSS classes.

## Testing

- Each concept page: `open docs/context-reasoning/NN-*.html` — renders,
  figure works, zero console errors, readable with JS disabled.
- Deck: all 17 slides render, keyboard nav and HUD counter work, every
  interactive operates by click/drag/keypress, and every interactive's
  no-JS fallback is checked with JS disabled.
- Site-wide relative-link check (same script pattern as Module 00) across
  the new directory plus updated root `docs/index.html`.
- Research dumps: quote audit both directions before merge (per the
  research-first rule's hard-won lesson from Module 00).

## Out of scope

- Changes to Module 00 or Module A1 concept pages or decks.
- Embeddings, sampling, training, or scaling-law content — already covered
  in Module 00, not revisited here.
- Live-demo checkpoints in the deck (must stand alone, per the Module A1
  convention).
- Real tokenizer/attention fidelity — figures stay illustrative and labeled
  as such, consistent with every prior module.
