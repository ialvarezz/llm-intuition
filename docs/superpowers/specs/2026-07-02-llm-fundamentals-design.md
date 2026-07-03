# llm-intuition — Module 1: LLM Fundamentals — Design

**Date:** 2026-07-02
**Status:** Approved direction, pending final spec review

## Purpose

A learning project that doubles as a teaching tool. Ignacio (software dev, new to ML) learns LLM internals by writing thorough markdown notes, then distills each concept into an interactive HTML page his team can learn from. Module 1 covers the fundamentals; later modules will cover RAG, agents, skills, MCPs, and marketplaces — each following the same pattern established here.

## Audience split

- **`notes/` (markdown)** — Ignacio's deep study notes. Thorough, honest, written while learning. Not polished for others.
- **`docs/` (HTML)** — Team-facing, served on GitHub Pages. Curated, condensed, interactive. Must stand alone for a colleague with no context.

## Repository structure

```
llm-intuition/
├── research/                         # raw source dumps, one per concept
│   ├── 01-what-is-an-llm.md          # per source: URL, fetch date, extracted content
│   └── … (02–08, same stems as notes/)
├── notes/                            # deep-dive markdown study notes
│   ├── 01-what-is-an-llm.md
│   ├── 02-tokens-and-tokenization.md
│   ├── 03-embeddings.md
│   ├── 04-attention-and-transformers.md
│   ├── 05-context-window.md          # includes KV cache
│   ├── 06-sampling.md                # temperature, top-p, logits
│   ├── 07-how-models-are-trained.md  # pretraining → SFT → RLHF
│   └── 08-scaling-laws-and-model-sizes.md
└── docs/                             # GitHub Pages root (team-facing)
    ├── index.html                    # landing page with concept cards
    ├── 01-what-is-an-llm.html … 08-….html
    └── style.css                     # single shared stylesheet
```

No build step, no frameworks, no dependencies. Vanilla HTML/CSS/JS. GitHub Pages serves `docs/` from `main`. Page JS is inline per page; only CSS is shared.

## Visual identity — "Reactor, Intel blue"

Dark terminal-HUD aesthetic (validated via live sample, artifact `0c18eaf0`):

- **Ground:** near-black `#0a0c0e`, panels `#0d1013`, hairline borders `#263039`
- **Accents:** Intel classic blue `#0068B5` (grid backdrop, structure, glows), Intel energy blue `#00C7FD` (labels, highlights, interactive states)
- **Type:** monospace display (system mono stack) for headlines, crumbs, and panel labels — uppercase with wide letter-spacing; system sans for body prose
- **Motifs:** faint blue grid backdrop, sharp corners (no border-radius), status-labeled panels (`● TOKENIZER / LIVE`), `//` prefixed section headings, `▸` crumbs
- **Token/category colors** in demos stay multi-hue (cyan/orange/blue/green/purple) for legibility

## Per-concept content pattern

Each concept ships as a triple — research first, then note, then page:

**Research dump** (`research/NN-*.md`): every reference URL is actually fetched; for each source the dump records the URL, fetch date, and the extracted key content (quotes, numbers, claims). **Notes and pages may only state facts traceable to this file** — no claims from model memory alone. If a fact can't be sourced, it doesn't ship.

**Markdown note** (`notes/NN-*.md`):
1. Explanation from first principles (assumes software dev, zero ML)
2. Analogies and mental models
3. **Pro vs. amateur** section — the practical details that separate experts (e.g., token counts ≠ word counts; context ≠ memory; temperature 0 ≠ deterministic)
4. Curated references: papers, engineering posts from Anthropic/OpenAI/Google/Meta, videos (Karpathy, 3Blue1Brown)

**HTML page** (`docs/NN-*.html`):
- Header with brand + concept nav, hero (crumb, title, subtitle, meta row: read time / level / prereq)
- Condensed prose sections mirroring the note
- One light interactive figure (vanilla JS, precomputed/toy data, no API calls):

| # | Page | Interactive figure |
|---|------|--------------------|
| 1 | What is an LLM | Click-through next-token prediction animation |
| 2 | Tokens & tokenization | Type text → colored token split with live count |
| 3 | Embeddings | 2D word-vector scatter, hover for neighbors |
| 4 | Attention & transformers | Step-through attention heatmap |
| 5 | Context window | Visual context filling (system/history/output) |
| 6 | Sampling | Temperature & top-p sliders reshaping a probability bar chart |
| 7 | How models are trained | Step-through pipeline: pretraining → SFT → RLHF |
| 8 | Scaling laws | Log-log chart with model-size markers |

- Embedded YouTube videos where a great one exists
- "Go deeper" reference cards (source · title, linked)
- Prev/next navigation

`index.html` is a landing page with a card per concept (number, title, one-liner, status).

## Build order

1. **Concept 01 end-to-end first** — note + page + `style.css`. This validates the full pattern (content depth, visual system, interaction style) before scale-out.
2. User reviews concept 01.
3. Concepts 02–08 sequentially (each note builds on the previous, matching learning order).
4. `index.html` landing page.
5. Merge `basic-concepts` → `main`, enable GitHub Pages on `docs/`.

## Error handling & testing

Static site — the failure modes are rendering and links, not runtime errors:
- Each page: renders correctly, interactions work, zero console errors
- Internal links and prev/next chains valid across all pages
- Demos degrade gracefully with JS disabled (content readable; figure shows static state)
- No external fetches at runtime, so pages work offline once loaded (YouTube embeds excepted)

## Out of scope (Module 1)

- Real BPE tokenizer fidelity (demo tokenizer is illustrative, labeled as such)
- Search, dark/light toggle (site is dark by design), build tooling, analytics
- Modules 2+ (RAG, agents, MCPs) — same pattern, separate specs
