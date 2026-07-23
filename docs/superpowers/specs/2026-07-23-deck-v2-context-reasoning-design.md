# Context & Reasoning Deck v2 + Presenter Prep — Design

**Date:** 2026-07-23
**Status:** Approved for planning

## Goal

Revise the shipped Module 01 deck (`docs/context-reasoning/deck.html`) with
usability fixes, richer explanations around every interactive, three new
slides, and content drawn from a real Q&A session (`llm-fundamentals-qa.md`,
repo root — input material, not a citable source). Ship alongside it a
presenter prep document for studying before the live session.

Deck grows 17 → 20 slides. All existing conventions hold: self-contained JS,
`../style.css`, deck-mode keyboard nav, HUD counter, sharp corners, no
external dependencies.

## Changes to existing slides

1. **Global keyboard fix.** The keydown handler must ignore events whose
   target is an `INPUT` or `TEXTAREA`, so Space types a space in slide 3's
   textarea instead of advancing the slide. Arrows/PageUp/PageDown behavior
   unchanged elsewhere.

2. **Slide 3 (tokenizer).** Keep the live toy tokenizer. Below it, add a
   fixed-sentence comparison splitting the same text three ways — labeled
   **Claude (Opus)**, **GPT**, **Gemma** — with visibly different token
   boundaries and counts (Gemma styled with SentencePiece-style `▁`
   word-boundary markers). Clearly labeled illustrative (site convention).
   Caption: token counts for the same text differ by model family because
   each vendor ships its own learned vocabulary.

3. **Slide 5 (context budget).** Add a color-swatch legend under the bar
   (System / Documents / History / Reserved output / Free) and a live
   caption showing `USED: N / 8,000 TOKENS`. Caption also carries the two
   sharpest Q&A points: input and output draw from one shared pool ("fill
   199k of a 200k window and there's no room left to answer"), and a
   compact fill-level strip — 0–30% near-optimal · 30–60% middle recall
   softens · 60–85% U-shape pronounced, early instructions drift ·
   85%+ output squeezed, degraded — shown as heuristic zones, not
   thresholds.

4. **Slide 6 (overflow strategies).** Same legend treatment. Each strategy
   button click shows an expanded 2–3 sentence explanation of what that
   strategy actually does mechanically (what survives, what's lost, when
   to use it), replacing the current one-liners. Content condensed from
   the already-sourced concept 02 note.

5. **Slide 7 (recall curve).** Add a fixed caption explaining why the curve
   is U-shaped: attention weights are normalized across all positions, so
   more tokens competing means less weight per token (dilution); training
   favors sequence starts (primacy) and the causal mask favors recency;
   effective window < advertised window. Cite Liu et al. 2023 on-slide.

6. **Slide 8 (attention stepper).** Add a caption defining the percentage:
   each bar is the selected token's normalized attention share paid to a
   previous token — not a correctness probability — and the takeaway: a
   token attended-to weakly is functionally under-used even though it is
   in-window. This is the position mechanism behind slide 7's curve.

7. **Slide 9 (prompt assembler).** Add a live caption that, when both the
   system snippet and the conflicting user snippet are present, states the
   expected behavior: post-training attaches more authority to system-role
   instructions, so models usually follow system over a conflicting user —
   a trained hierarchy, not an architectural guarantee — and position
   compounds it (the system prompt sits at the attention-favored front).
   Neutral state and no-conflict states get shorter captions.

8. **Slide 11 (reasoning toggle).** Add a caption explaining where the
   trace comes from: a transformer spends a fixed amount of compute per
   generated token, so emitting intermediate tokens is the only way to
   spend more compute on a harder problem; the trace is ordinary generated
   text the model conditions on — external scratch memory — which is why
   step-by-step costs more tokens (bridge to slide 12).

9. **Slide 12 (budget slider).** Reframe from hard token budgets to the
   current mechanism: adaptive thinking plus an effort parameter (hard
   `budget_tokens` caps are deprecated on current models). Keep the slider
   (levels become effort-like tiers). Add Q7's warning as a caption: the
   think/don't-think decision is itself a learned next-token prediction
   keyed on surface features, so "looks trivial, is actually hard"
   questions (strawberry) fail fast and confidently.

## New slides (3)

- **After slide 3 — "Two famous failures."** Strawberry letter-counting:
  `str|aw|berry` reaches the model as three opaque IDs, so counting r's is
  a memory lookup, not perception. Arithmetic: token boundaries ignore
  place value (`1234` → `123|4`), so columns can't align. Both have the
  same fix — spell it out / write digits separately — which plants the
  seed for the reasoning section. Interactive: click-to-reveal the token
  split for each failure.

- **After slide 6 (renumbered) — "The quadratic bill."** Every turn
  re-sends the entire transcript, so cumulative input cost grows with the
  square of conversation length (~20-turn chat with 1k tokens/turn ≈ 200k
  cumulative tokens paid on a 20k transcript). Prompt caching as the
  mitigation — exact prefix match only, so stable content belongs at the
  front. No pricing figures (they go stale; the mechanism doesn't).
  Interactive: turn counter stepper showing transcript size vs cumulative
  tokens billed diverging.

- **Before current slide 10 — "Who writes into which role."** System role:
  populated by the app/harness developer — static config or a Skill loaded
  by the harness (cross-link to Module A1). User role: the human, every
  turn — and tool results land here too, which is why untrusted content
  must be delimited as data. Assistant role: the model's own prior output —
  which it imitates (persona drift; prefill as format-forcing — an opening
  `{` effectively guarantees JSON).

## Final slide order (20)

1. Title · 2. Hook · 3. Tokenizer + model comparison · **4. Two famous
failures (new)** · 5. Roles are tokens (was 4) · 6. Context budget (was 5)
· 7. Overflow strategies (was 6) · **8. The quadratic bill (new)** ·
9. Recall curve (was 7) · 10. Attention stepper (was 8) · 11. Prompt
assembler (was 9) · **12. Who writes into which role (new)** · 13. Pick the
role by the job (was 10) · 14. Reasoning toggle (was 11) · 15. Effort
slider (was 12) · 16. Trace isn't proof (was 13) · 17. End-to-end (was 14)
· 18. BKMs (was 15) · 19. Recap (was 16) · 20. Q&A (was 17)

## Sourcing (hard rule)

`llm-fundamentals-qa.md` is working input, not a citable source. Any claim
surviving into the deck that the existing concept dumps don't already cover
must be sourced fresh: fetch, quote-audit (two directions, live re-fetch),
and append to the relevant `research/context-reasoning/NN-*.md` dump. The
Q&A file supplies three candidate URLs (platform.claude.com: pricing docs,
effort docs, mid-conversation system messages). Known claims needing this:
adaptive thinking/effort and `budget_tokens` deprecation (slide 12), prompt
caching prefix mechanics (quadratic-bill slide), tokenizer-failure examples
if stated as fact rather than illustration (famous-failures slide —
strawberry/arithmetic mechanics are coverable from the existing concept 01
dump's Karpathy source, verify before adding new ones). Pricing figures are
excluded from the deck entirely. Vendor names (Claude/Opus, GPT, Gemma) are
a deliberate, user-requested relaxation of the module's vendor-neutral
default, confined to the tokenizer-comparison slide and the role-Skills
cross-link.

## Presenter prep document

`notes/context-reasoning/deck-prep.md` (notes/ = study material, not
team-facing). Structure:

- **Narrative spine** — the causal chain to keep out loud: tokens are the
  substrate → context is a token sequence → position shapes attention →
  billing follows tokens → reasoning spends tokens → roles structure the
  sequence. One paragraph on why the order is what it is.
- **Per-slide sections (all 20)** — for each: the one-sentence point of the
  slide; what to say (a short spoken-word script, not bullet fragments);
  how to drive the interactive (exact click sequence, what to point at,
  the "aha" the interactive is engineered to produce); and the transition
  line into the next slide.
- **Anticipated Q&A** — the eight questions from `llm-fundamentals-qa.md`
  restated as audience questions, each with a 2–4 sentence spoken answer
  and a pointer to which slide/concept page to jump back to. Plus likely
  follow-ups (why can't the tokenizer be fixed, does temperature affect
  reasoning, is prompt injection solvable).
- **Numbers to have memorized** — the handful of load-bearing figures with
  their sources (≈1.3 tokens/word English, 50k–200k vocab, U-curve
  shape, quadratic cost shape) and which figures deliberately do NOT
  appear (prices) and why.
- Facts in the prep doc follow the same sourcing rule as notes: traceable
  to the dumps, `[S#]`-tagged where load-bearing.

## Testing

- Deck: all 20 slides render, keyboard nav works, Space types in the
  textarea without advancing, every interactive operates, legends/captions
  visible, zero console errors, link check passes.
- Prep doc: every slide number in it matches the final deck order; spot
  quote audit on any newly added sourced claims.

## Out of scope

- Concept page changes (deck + prep doc only, except appending new sources
  to existing research dumps).
- Pricing tables or any figure that dates quickly.
- Copilot billing content from Q5 (vendor-specific, dates quickly, not
  needed for the deck's argument).
