# 07 · Building & publishing a plugin

## The worked example: pr-buddy

Everything else in this module has described plugin *parts* — a marketplace entry, a manifest field, a skill's frontmatter, an agent's tool list, a hook event. This note builds one complete, small plugin end to end: **pr-buddy**, bundling one skill (`review-pr`, a checklist-driven PR review) and one agent (`test-writer`, which writes missing tests). Every file below is copy-pasteable and every structural fact in it — field names, directory names, command syntax — is sourced against the plugin docs.

## Scaffold and manifest

A plugin's manifest is required at `.claude-plugin/plugin.json`, and everything else — skills, commands, agents, hooks — has to sit at the plugin's root, not inside `.claude-plugin/`: "Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level" [S2]. pr-buddy's scaffold:

```
pr-buddy/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── review-pr/
│       └── SKILL.md
└── agents/
    └── test-writer.md
```

Skills live under `skills/`, with each skill in its own `<name>/SKILL.md` directory [S2]; agent files live flat under `agents/` [S2].

The manifest only strictly requires `name` — "Unique identifier (kebab-case, no spaces)" [S2] — but a real plugin adds `description`, shown "in the plugin manager when browsing or installing plugins" [S1], and `version`. Full `plugin.json`:

```json
{
  "name": "pr-buddy",
  "description": "PR review checklist + a test-writing agent",
  "version": "0.1.0",
  "author": {
    "name": "Your Name"
  }
}
```

`name` also sets the skill namespace: skills are prefixed with the plugin name, so a skill called `hello` in a plugin named `my-first-plugin` is invoked as `/my-first-plugin:hello` [S1] — pr-buddy's `review-pr` skill is namespaced the same way. `version` is optional, but leaving it out has a real consequence covered below under versioning: "If omitted and your plugin is distributed via git, the commit SHA is used and every commit counts as a new version" [S1].

## The skill and the agent

### `skills/review-pr/SKILL.md`

Concept 04 established that the model decides whether to load a skill's body from its `description` field alone, so the description has to state both what the skill does and when to use it, not just its domain. Applying that here, `review-pr`'s description names a concrete trigger phrase rather than a generic label like *does PR review*:

```markdown
---
name: review-pr
description: Use when reviewing a pull request or when asked to check
  a diff before merge.
---

# Review PR

## Instructions
1. Read the full diff first, before commenting on any single line.
2. Check that tests exist for new branches introduced in the diff.
3. Flag anything touching auth, payments, or migrations for extra scrutiny.
4. Summarize findings as a checklist, not a wall of prose.

## Examples
- "review this PR"
- "can you check this diff before I merge"
```

### `agents/test-writer.md`

Concept 05 established that a subagent's `description` is read by the *orchestrating* model deciding whether to delegate, while the body is the subagent's own system prompt — and that tool allowlists are a hard wall, not a suggestion the model might drift from. `test-writer`'s frontmatter restricts `tools` to exactly what the job needs — read the target file, write the test file, run it — nothing more:

```markdown
---
name: test-writer
description: Writes missing tests for a given file.
tools: Read, Write, Bash
---

You write focused tests for the file you're given. Deliverable: one
test file covering the untested branches. Constraints: no new
dependencies, match the existing test framework already in the repo,
and do not modify the file under test.
```

The `tools` field lists which tools the subagent may use; anything not listed simply isn't available to it, regardless of what the body's instructions say [S2] — restricting it to `Read, Write, Bash` means `test-writer` cannot touch source files outside the one it was dispatched to cover.

MCP servers can be bundled into a plugin too — a `.mcp.json` at the plugin root, or an inline `mcpServers` field in `plugin.json` [S2] — but pr-buddy doesn't need one; see Concept 03 for how MCP fits into a plugin.

## Test locally, then publish

### Local testing

Before pr-buddy touches a marketplace, it's tested from a local path. The `--plugin-dir` flag loads a plugin directory directly:

```bash
claude --plugin-dir ./pr-buddy
```

Skills invoke with the namespaced form, `/pr-buddy:review-pr` [S1], though the walkthrough below matches the trigger phrase from the description directly. `/reload-plugins` picks up edits to the plugin's files "without restarting" the session [S1] — the loop while iterating on `SKILL.md` or the agent file is edit, then `/reload-plugins`, not a fresh `claude` invocation each time.

A local test pass for pr-buddy covers three things in one fresh session:

```
$ claude --plugin-dir ./pr-buddy
> "review this PR"
✓ skill triggered
> dispatch test-writer on the file with the new branch
✓ agent dispatchable, writes one test file
> "fix this typo"
✓ negative case: no trigger
```

The negative case matters as much as the positive ones — a skill whose description is broad enough to fire on *fix this typo* is a skill that's going to hijack unrelated conversations the moment it ships, not a hypothetical risk.

`claude plugin validate` checks `plugin.json` and component syntax before anything gets pushed [S1] [S2].

### Publish

Publishing has two moving parts: the plugin's own git repo, and a separate marketplace repo that points at it.

```bash
git push origin main
```

pr-buddy's source is now a normal git remote. A marketplace is a repo containing `.claude-plugin/marketplace.json`, whose required fields are `name` (the public-facing identifier users type, e.g. `/plugin install my-tool@your-marketplace` [S3]), `owner`, and `plugins` — an array of plugin entries [S3]. Each entry needs at minimum `name` and `source` [S3]; a relative-path source for a plugin living inside the marketplace repo itself just needs the path:

```json
{
  "name": "your-marketplace",
  "owner": { "name": "Your Name" },
  "plugins": [
    {
      "name": "pr-buddy",
      "source": "./plugins/pr-buddy",
      "description": "PR review checklist + test-writing agent",
      "version": "0.1.0"
    }
  ]
}
```

If pr-buddy instead lives in its own separate git repo rather than inside the marketplace repo, the source is a `github` object instead of a relative path: `{"source": "github", "repo": "owner/plugin-repo", "ref": "v2.0.0"}` [S3].

With the marketplace published, installing pr-buddy is two commands:

```
> /plugin marketplace add you/your-marketplace
> /plugin install pr-buddy@your-marketplace
```

`/plugin marketplace add` accepts a GitHub shorthand, a git URL, or a local path [S3].

### Versioning and iteration

Once published, updates are gated by version, not by commits. "Claude Code resolves a plugin's version from the first of these that is set:

1. The `version` field in the plugin's `plugin.json`
2. The `version` field in the plugin's marketplace entry in `marketplace.json`
3. The git commit SHA of the plugin's source, for `github`, `url`, `git-subdir`, and relative-path sources" [S3]

Because pr-buddy's `plugin.json` sets `"version": "0.1.0"` explicitly, "users only receive updates when you bump this field. If omitted and your plugin is distributed via git, the commit SHA is used and every commit counts as a new version" [S1]. Pushing a fix to `test-writer`'s prompt without bumping the version does nothing for anyone who already installed `0.1.0` — "If you set `version` in `plugin.json`, you must bump it every time you want users to receive changes. Pushing new commits alone is not enough" [S1].

The bump itself follows semantic versioning: "bump MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes" [S1]. Tightening `review-pr`'s description or fixing a typo in `test-writer`'s body is a PATCH (`0.1.0` → `0.1.1`); adding a second skill is a MINOR bump; changing `test-writer`'s tool list in a way that breaks existing invocations is a MAJOR bump.

## Pro vs. amateur

**Amateurs skip `version` until it's a published plugin. Pros set it from day one.** Once other people install pr-buddy, an unversioned plugin means the commit SHA is doing the versioning for them, silently, on every push — a teammate's session can pick up a half-finished commit mid-edit and break without warning. Pinning `version` and bumping it deliberately means updates only land when the author decides they're ready.

**Amateurs test in the session where they wrote the plugin. Pros test in a fresh one.** The dev session already discussed `review-pr` at length by the time the plugin is written, so of course the model recognizes *review this PR* — that conversation has contaminated context the skill's description alone won't have for a real user. The three-check local test above — trigger, dispatch, negative case — only means something run from a clean `claude --plugin-dir ./pr-buddy` session that never saw the plugin's own design discussion.

**Amateurs write one document for both audiences. Pros split it.** A skill's `description` and an agent's `description` are read by the model deciding whether to trigger or delegate — that text has to compress into trigger phrases, not prose. A README, by contrast, is read by the human deciding whether to install pr-buddy at all — install instructions, what it does, why it's useful. Writing one blob that tries to serve both jobs at once under-serves whichever reader shows up second.

**Amateurs publish to a marketplace immediately. Pros run it locally first.** pr-buddy stays a `--plugin-dir` install, used in real PR reviews for a while, before it earns a marketplace entry and a public `/plugin install` command. A week of real use surfaces the over-broad trigger phrases and missing edge cases that a same-day publish never catches.

## References

- Claude Code Docs — [Create plugins](https://code.claude.com/docs/en/plugins) [S1]
- Claude Code Docs — [Plugins reference](https://code.claude.com/docs/en/plugins-reference) [S2]
- Claude Code Docs — [Create and distribute a plugin marketplace](https://code.claude.com/docs/en/plugin-marketplaces) [S3]
- Claude Code Docs — [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices) [S4]
