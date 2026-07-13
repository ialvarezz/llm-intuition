# Navigation Restructure — Design

**Date:** 2026-07-13
**Status:** Approved

## Goal

Turn the site into a clean three-level navigation: Landing page (all modules, filterable) → Module landing page (all chapters, filterable) → Chapter view. Rename Module 01 to Module 00 — LLM Fundamentals. Keep the plugins module as Module A1 — AI Plugins & Marketplaces, an auxiliary track visibly branched off the core path.

## Decisions made

- **URL moves:** fundamentals pages move into a subdirectory; old root URLs break (no redirect stubs).
- **Aux naming:** keep "Module A1 — AI Plugins & Marketplaces"; A = auxiliary track. Directory stays `docs/plugins/`.
- **Filtering:** track filter (Core/Auxiliary) + topic tag chips, vanilla JS show/hide. No text search.

## File structure

```
docs/
  index.html            ← pure landing page: all modules, filterable
  style.css             ← shared (chip/filter styles added)
  site.js               ← ~30 lines vanilla JS filter logic, shared by all index pages
  fundamentals/         ← Module 00 · Core — LLM Fundamentals
    index.html          ← module landing, filterable chapter list
    01-what-is-an-llm.html … 08-scaling-laws-and-model-sizes.html
  plugins/              ← Module A1 · Auxiliary — AI Plugins & Marketplaces
    index.html          ← upgraded to same filterable pattern
    00-primer.html … 09-which-one-when.html, deck.html
```

The 8 fundamentals pages move as-is (filenames unchanged). `notes/` and `research/` stay untouched.

## Landing page (`docs/index.html`)

- Hero stays; crumb becomes site-level (e.g. "Learning tracks"), not "Module 01".
- One card per module: track badge (`CORE` / `AUX`), module label (`MODULE 00`, `MODULE A1`), name, tagline, concept count, tag chips.
- A1 card sits under a visually distinct "Auxiliary track — branches off the core path" section header.
- Filter bar: track toggle (All / Core / Auxiliary) + clickable tag chips. Cards carry `data-track` and `data-tags`.
- **No-JS fallback:** everything visible, filter bar hidden (progressive enhancement, matching the site's static-initial-states convention).

## Module landing pages

`fundamentals/index.html` and `plugins/index.html` get the identical pattern one level down:

- Hero with module crumb ("Module 00 / LLM Fundamentals", "Module A1 / AI Plugins & Marketplaces").
- Chapter cards each with 2–3 topic tags. Fundamentals tags drawn from: tokens, embeddings, attention, training, inference, scaling. A1 tags drawn from: marketplace, plugins, mcp, skills, agents, hooks, copilot.
- Tag-chip filter bar, same `site.js`.
- A1 deck card stays and is always visible (exempt from filtering).

## Chapter views

Content untouched. Mechanical updates only:

- Stylesheet path → `../style.css` (fundamentals pages).
- Header nav: brand → `../index.html`, module index link → `index.html`; sibling chapter links unchanged (files move together).
- Crumbs: "Module 01" → "Module 00".

## Verification

- Link check: every `href` in docs/ resolves to an existing file.
- Browser pass: landing → module → chapter, with and without JS; filters toggle correctly.

## Out of scope

- Redirect stubs for old URLs (deliberately skipped).
- Client-side text search (add when module count makes scanning fail).
- Restructuring `notes/` and `research/` to mirror `docs/`.
