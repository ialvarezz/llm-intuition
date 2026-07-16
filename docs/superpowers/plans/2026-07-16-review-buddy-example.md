# review-buddy Example Plugin + Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the deck's dummy `team-marketplace` catalog and `review-buddy` plugin as real, loadable files under `examples/`, and fix deck slide 4 to show the correct manifest path.

**Architecture:** Static config/markdown files only — no application code. A marketplace catalog (`.claude-plugin/marketplace.json`) points via relative path at one plugin (`plugins/review-buddy/`), which contains the five components the deck describes: command, skill, agent, hook (+ its script), and `.mcp.json`. One HTML edit to `docs/plugins/deck.html`.

**Tech Stack:** Claude Code plugin format (JSON + Markdown), bash, HTML.

**Spec:** `docs/superpowers/specs/2026-07-16-review-buddy-example-design.md`

## Global Constraints

- Everything lives under `examples/team-marketplace/`; the plugin at `examples/team-marketplace/plugins/review-buddy/`.
- Plugin version is `1.2.0` in BOTH the catalog entry and the plugin manifest (matches deck slide 3).
- The skill uses ONLY base Agent Skills spec frontmatter (`name`, `description`) — no Claude-specific extended fields.
- MCP entry uses GitHub's official remote server `https://api.githubcopilot.com/mcp` over HTTP — no fictional URLs, no bundled server code.
- Manifests live at `.claude-plugin/` (marketplace.json for the catalog, plugin.json for the plugin); all other plugin dirs at plugin root.
- Work on branch `review-buddy-example` (already created, based on main).
- Validate every JSON file with `python3 -m json.tool` before committing.

---

### Task 1: Marketplace catalog + plugin manifest

**Files:**
- Create: `examples/team-marketplace/.claude-plugin/marketplace.json`
- Create: `examples/team-marketplace/plugins/review-buddy/.claude-plugin/plugin.json`

**Interfaces:**
- Produces: plugin root dir `examples/team-marketplace/plugins/review-buddy/` that Tasks 2–3 populate; plugin name `review-buddy` (namespace for `/review-buddy:review`).

- [ ] **Step 1: Write the marketplace catalog**

Create `examples/team-marketplace/.claude-plugin/marketplace.json`:

```json
{
  "name": "team-marketplace",
  "owner": { "name": "Platform Team" },
  "plugins": [
    {
      "name": "review-buddy",
      "source": "./plugins/review-buddy",
      "version": "1.2.0",
      "description": "PR review checklist, a reviewer agent, and lint-before-commit"
    }
  ]
}
```

Note: `source` is a relative path (must start with `./`) — a local directory within the marketplace repo, per the documented source types.

- [ ] **Step 2: Write the plugin manifest**

Create `examples/team-marketplace/plugins/review-buddy/.claude-plugin/plugin.json`:

```json
{
  "name": "review-buddy",
  "description": "PR review checklist, a reviewer agent, and lint-before-commit",
  "version": "1.2.0",
  "author": { "name": "Platform Team" }
}
```

- [ ] **Step 3: Validate both JSON files**

Run:
```bash
python3 -m json.tool examples/team-marketplace/.claude-plugin/marketplace.json > /dev/null && \
python3 -m json.tool examples/team-marketplace/plugins/review-buddy/.claude-plugin/plugin.json > /dev/null && \
echo VALID
```
Expected: `VALID`

- [ ] **Step 4: Commit**

```bash
git add examples/
git commit -m "feat(examples): team-marketplace catalog + review-buddy manifest"
```

---

### Task 2: Command, skill, and agent

**Files:**
- Create: `examples/team-marketplace/plugins/review-buddy/commands/review.md`
- Create: `examples/team-marketplace/plugins/review-buddy/skills/review-checklist/SKILL.md`
- Create: `examples/team-marketplace/plugins/review-buddy/agents/reviewer.md`

**Interfaces:**
- Consumes: plugin root from Task 1.
- Produces: `/review-buddy:review` command; `review-checklist` skill; `reviewer` agent (referenced by name in the command body).

- [ ] **Step 1: Write the command**

Create `examples/team-marketplace/plugins/review-buddy/commands/review.md`:

```markdown
---
description: Review the current diff against the team checklist
---

Review the pending changes on this branch.

1. Run `git diff main...HEAD` to get the full diff.
2. Load the review-checklist skill and evaluate the diff against every item.
3. If the diff is large (more than ~400 changed lines), delegate the reading to the `reviewer` agent and summarize its findings.
4. Report findings grouped by checklist item, most severe first. If everything passes, say so plainly.
```

- [ ] **Step 2: Write the skill**

Create `examples/team-marketplace/plugins/review-buddy/skills/review-checklist/SKILL.md`:

```markdown
---
name: review-checklist
description: The team's five-point PR review checklist. Use when reviewing a diff, a pull request, or pending changes.
---

# Team review checklist

Evaluate the change against each point. Cite file and line for every finding.

1. **Correctness** — does the change do what its description claims? Trace one real input through the changed path.
2. **Tests** — is new behavior covered by a test that fails without the change?
3. **Naming** — do new names follow the conventions already used in the surrounding code?
4. **Error handling** — are failures at trust boundaries (user input, network, filesystem) handled rather than swallowed?
5. **Scope** — does the diff contain only what the change needs? Flag drive-by edits.

Report format: one line per finding — `file:line — checklist item — what and why`.
```

- [ ] **Step 3: Write the agent**

Create `examples/team-marketplace/plugins/review-buddy/agents/reviewer.md`:

```markdown
---
name: reviewer
description: Reads large diffs and reports checklist findings. Use when a diff is too big to review inline.
tools: Read, Grep, Glob, Bash
---

You are a code reviewer. You receive a branch or diff reference.

1. Get the diff (`git diff main...HEAD` unless told otherwise).
2. Read every changed file — the full file, not just the hunks — for context.
3. Evaluate against the team's five-point checklist: correctness, tests, naming, error handling, scope.
4. Return findings as `file:line — checklist item — what and why`, most severe first. Never propose fixes; report only.
```

- [ ] **Step 4: Verify frontmatter parses**

Run:
```bash
grep -c '^---$' examples/team-marketplace/plugins/review-buddy/commands/review.md \
  examples/team-marketplace/plugins/review-buddy/skills/review-checklist/SKILL.md \
  examples/team-marketplace/plugins/review-buddy/agents/reviewer.md
```
Expected: each file reports `2` (opening and closing frontmatter fences).

- [ ] **Step 5: Commit**

```bash
git add examples/
git commit -m "feat(examples): review-buddy command, skill, and agent"
```

---

### Task 3: Hook, script, and MCP config

**Files:**
- Create: `examples/team-marketplace/plugins/review-buddy/hooks/hooks.json`
- Create: `examples/team-marketplace/plugins/review-buddy/scripts/lint-check.sh`
- Create: `examples/team-marketplace/plugins/review-buddy/.mcp.json`

**Interfaces:**
- Consumes: plugin root from Task 1.
- Produces: PreToolUse hook that runs `scripts/lint-check.sh` before any `git commit` Bash call; one MCP server entry named `github`.

- [ ] **Step 1: Write the lint stand-in script**

Create `examples/team-marketplace/plugins/review-buddy/scripts/lint-check.sh`:

```bash
#!/bin/sh
# ponytail: stand-in for the team's real lint command — swap in `npm run lint` etc.
echo "review-buddy: lint check passed"
exit 0
```

Make it executable:
```bash
chmod +x examples/team-marketplace/plugins/review-buddy/scripts/lint-check.sh
```

- [ ] **Step 2: Write the hook config**

Create `examples/team-marketplace/plugins/review-buddy/hooks/hooks.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/lint-check.sh",
            "if": "Bash(git commit*)",
            "statusMessage": "Running lint before commit"
          }
        ]
      }
    ]
  }
}
```

- [ ] **Step 3: Write the MCP config**

Create `examples/team-marketplace/plugins/review-buddy/.mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    }
  }
}
```

- [ ] **Step 4: Validate JSON and script**

Run:
```bash
python3 -m json.tool examples/team-marketplace/plugins/review-buddy/hooks/hooks.json > /dev/null && \
python3 -m json.tool examples/team-marketplace/plugins/review-buddy/.mcp.json > /dev/null && \
sh examples/team-marketplace/plugins/review-buddy/scripts/lint-check.sh && \
test -x examples/team-marketplace/plugins/review-buddy/scripts/lint-check.sh && echo VALID
```
Expected: `review-buddy: lint check passed` then `VALID`.

- [ ] **Step 5: Commit**

```bash
git add examples/
git commit -m "feat(examples): review-buddy hook, lint script, and MCP config"
```

---

### Task 4: Fix deck slide 4 manifest path

**Files:**
- Modify: `docs/plugins/deck.html:93-94` (slide `#s-4` tree)

**Interfaces:**
- Consumes: nothing from other tasks (independent edit).
- Produces: slide 4 tree showing `.claude-plugin/plugin.json` instead of root `plugin.json`.

- [ ] **Step 1: Edit the tree entry**

In `docs/plugins/deck.html`, replace:

```html
    <details open><summary>├ plugin.json</summary>
      <div class="note">The nameplate: name, version, description. The only required file.</div></details>
```

with:

```html
    <details open><summary>├ .claude-plugin/plugin.json</summary>
      <div class="note">The nameplate: name, version, description. The only required file.</div></details>
```

- [ ] **Step 2: Visual check**

Open `docs/plugins/deck.html` in a browser (or serve `docs/`), advance to slide 4, confirm the tree reads `.claude-plugin/plugin.json` and the row doesn't wrap or overflow.

- [ ] **Step 3: Commit**

```bash
git add docs/plugins/deck.html
git commit -m "fix(deck): slide 4 shows manifest at .claude-plugin/plugin.json"
```

---

### Task 5: End-to-end load verification

**Files:**
- None created; verification only.

**Interfaces:**
- Consumes: the complete plugin from Tasks 1–3.

- [ ] **Step 1: Load the plugin directly**

Run:
```bash
claude --plugin-dir examples/team-marketplace/plugins/review-buddy -p "List the commands, skills, and agents available from the review-buddy plugin, then stop." 2>&1 | tail -20
```
Expected: no plugin-load errors; output mentions the `review-buddy:review` command (or equivalent), the `review-checklist` skill, and the `reviewer` agent. If the harness reports a schema problem in any file, fix that file and re-run before proceeding.

- [ ] **Step 2: Verify the hook fires**

Run an interactive check:
```bash
claude --plugin-dir examples/team-marketplace/plugins/review-buddy -p "Run exactly this shell command: git commit --dry-run --allow-empty -m test" 2>&1 | grep -i "lint"
```
Expected: `review-buddy: lint check passed` (the PreToolUse hook echoed before the Bash call). If hooks require session trust/permissions in `-p` mode and nothing prints, fall back to a manual interactive session and confirm the status message "Running lint before commit" appears.

- [ ] **Step 3: Verify the marketplace catalog resolves**

Run:
```bash
claude plugin marketplace add ./examples/team-marketplace 2>&1 | tail -3
```
Expected: marketplace `team-marketplace` added without error, listing `review-buddy`. Then clean up so the demo machine state isn't polluted:
```bash
claude plugin marketplace remove team-marketplace 2>&1 | tail -2
```

- [ ] **Step 4: Commit any fixes made during verification**

```bash
git status --short
```
If files changed: commit them with `git commit -m "fix(examples): adjustments from load verification"`. If clean, done.
