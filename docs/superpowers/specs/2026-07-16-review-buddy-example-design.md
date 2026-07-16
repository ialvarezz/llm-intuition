# review-buddy example plugin + marketplace — design

**Date:** 2026-07-16
**Status:** Approved

## Goal

Put the deck's dummy marketplace and plugin (`team-marketplace` / `review-buddy`, slides 3–4 of `docs/plugins/deck.html`) into the repo as real files, so the presenter can open the actual folder tree and file contents during the talk. The plugin must be a minimal **valid, loadable** Claude Code–format plugin containing all five components the deck describes (command, skill, agent, hook, MCP config). Claude-format is also the Copilot-relevant choice per the module's compat story (concept 08), and Copilot CLI's Claude-compatible plugin support can be verified separately under the project's research-first rule.

## Decisions made

- **Format:** Claude Code plugin format, matching the deck's slide-4 tree — not a Copilot-native `.github/` layout.
- **Scope:** both artifacts — the `marketplace.json` catalog (slide 3) and the `review-buddy` plugin (slide 4), so the slide-19 "publishing is a PR" story is a real one-line diff.
- **Location:** `examples/team-marketplace/` at repo root, with the plugin nested at `plugins/review-buddy/`.
- **Fidelity:** loadable demo. Every component works when loaded with `claude --plugin-dir`; nothing is placeholder-invalid.
- **MCP approach:** lean on an existing public server — GitHub's official remote MCP server over HTTP (`https://api.githubcopilot.com/mcp`, the same endpoint `notes/plugins/08-claude-copilot-compat.md` cites) — rather than bundling server code or pointing at a fictional URL. Matches the deck's "fetch diff, post comment" line; no code to maintain.
- **Correctness over slide-fidelity:** the manifest lives at `.claude-plugin/plugin.json` (the documented requirement, per `notes/plugins/07-building-a-plugin.md`), not root-level `plugin.json` as slide 4 simplifies. Slide 4 is updated in the same change to show the correct path.

## Layout

```
examples/team-marketplace/
├── .claude-plugin/
│   └── marketplace.json          # slide-3 shape: name "team-marketplace",
│                                 # owner Platform Team, one plugin entry:
│                                 # review-buddy, source "./plugins/review-buddy",
│                                 # version 1.2.0
└── plugins/
    └── review-buddy/
        ├── .claude-plugin/
        │   └── plugin.json       # name, description, version 1.2.0 (matches catalog)
        ├── commands/
        │   └── review.md         # /review prompt template: review current diff
        │                         # against the team checklist (a few lines)
        ├── skills/
        │   └── review-checklist/
        │       └── SKILL.md      # name/description frontmatter + 5-point
        │                         # team review checklist body
        ├── agents/
        │   └── reviewer.md       # frontmatter (name, description, read-only tools)
        │                         # + short system prompt for reading big diffs
        ├── hooks/
        │   └── hooks.json        # PreToolUse on git commit → scripts/lint-check.sh
        ├── scripts/
        │   └── lint-check.sh     # harmless lint stand-in: echo "lint ok", exit 0
        └── .mcp.json             # one entry: GitHub remote MCP server (HTTP)
```

## Component contents (spirit, not verbatim)

- **marketplace.json** — mirrors the slide-3 JSON but with a working relative `source` path so `/plugin marketplace add` on the directory actually resolves the plugin.
- **plugin.json** — `name: "review-buddy"`, `description`, `version: "1.2.0"`, `author: { name: "Platform Team" }`.
- **commands/review.md** — short prompt template; demonstrates "entry points a human types."
- **skills/review-checklist/SKILL.md** — base Agent Skills spec only (`name`, `description` frontmatter + Markdown body); no Claude-specific extended fields, keeping it portable per concept 08.
- **agents/reviewer.md** — minimal frontmatter plus a focused system prompt; read-only tool list.
- **hooks/hooks.json** — one PreToolUse hook matching `git commit` Bash calls, running the bundled script via `${CLAUDE_PLUGIN_ROOT}`.
- **scripts/lint-check.sh** — executable, echoes and exits 0; a stand-in the audience can read in two seconds.
- **.mcp.json** — one `mcpServers` entry for GitHub's official remote MCP server (HTTP transport).

## Deck change

Slide 4's tree gains the `.claude-plugin/` level for `plugin.json` (and its note stays "the only required file"). No other slides change.

## Error handling

Static config files — the failure mode is invalid syntax or wrong paths. Mitigated by the verification step below; no runtime error handling to design.

## Verification

`claude --plugin-dir examples/team-marketplace/plugins/review-buddy` loads without errors; `/review-buddy:review` appears; agent listed in `/context`; hook fires on a `git commit` tool call. No automated tests — the example is documentation-shaped, and the loadability check is the test.

## Out of scope

- A Copilot-native mirror of the plugin (`.github/skills`, `.agent.md`, prompt files) — deferred; concept 08 covers the mapping in prose.
- Bundled MCP server code.
- Any new deck slides.
