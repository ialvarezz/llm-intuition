# 02 · Plugins: the container

## One unit, many components

Concept 01 covered the marketplace — the catalog that points at a plugin's source. This concept opens the thing being pointed at. A plugin is "a self-contained directory of components that extends Claude Code with custom functionality" [S2]. That's a deliberately loose definition, and the looseness is the point: a plugin isn't one kind of thing, it's a container that can hold any mix of "skills, agents, hooks, MCP servers, LSP servers, and monitors" [S2]. The official announcement lists the same idea from the installer's side — plugins are "custom collections of slash commands, agents, MCP servers, and hooks installable with a single command" [S3]. Whatever you'd otherwise have to paste into every session by hand — a tool connection, a specialized subagent, a behavior hook, a shortcut command — goes in the container once, and the container installs as a unit.

The alternative to a plugin is the standalone `.claude/` directory: components living loose in a project or user config, referenced by short names like `/hello` [S1]. That works for personal, project-specific customization. A plugin is the same components, but self-contained and shareable — packaged for "distribution, versioned releases, and reuse across projects" [S1], with one consequence that follows directly from packaging: components inside a plugin get namespaced (`/my-plugin:hello` instead of `/hello`) so two plugins can each ship a skill called `deploy` without colliding [S1].

## Anatomy on disk

A plugin's directory layout mirrors its component list. From the standard layout:

```
enterprise-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
├── commands/
├── agents/
├── hooks/
├── bin/
├── settings.json
├── .mcp.json
├── .lsp.json
├── scripts/
└── LICENSE
```
[S2]

Each folder maps to one component type, and the mapping is direct enough to read off the names: `skills/` holds skills as `<name>/SKILL.md` directories; `commands/` holds skills as flat markdown files (the docs note `skills/` is preferred "for new plugins") [S1]; `agents/` holds custom agent definitions as markdown files; `hooks/` holds event handlers, specifically `hooks/hooks.json`; `.mcp.json` at plugin root holds MCP server configuration [S1]. The reference doc adds two more: `.lsp.json` for LSP server configs, and `monitors/monitors.json` for background monitor definitions [S2]. `bin/` gets added to the Bash tool's `PATH` while the plugin is enabled, and `settings.json` supplies default settings applied when the plugin is enabled [S2].

The one hard rule about this layout: "Don't put `commands/`, `agents/`, `skills/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level" [S1]. The manifest folder is reserved for the manifest; everything else sits as a sibling to it, not a child.

None of the folders are mandatory beyond the manifest itself being optional too — the reference doc treats every directory in the standard layout as present because a given plugin uses that component, not because the layout demands it. A plugin that ships one skill and nothing else is still a complete plugin.

## The manifest

`.claude-plugin/plugin.json` is what a marketplace reads to know what a plugin is before installing it — Concept 01's catalog file points at plugins, and the manifest is what those pointers resolve to. Only one field is required: `name` — a unique identifier that also becomes the namespace prefix components use (`name: "my-plugin"` → `/my-plugin:hello`) [S1]. Everything else is metadata: `description` (shown in the plugin manager), `version`, and `author` [S1]. The full schema documented in the reference adds more optional fields — `displayName`, `homepage`, `repository`, `license`, `keywords`, `defaultEnabled` — plus the same component-path fields that mirror the directory layout (`skills`, `commands`, `agents`, `hooks`, `mcpServers`, `lspServers`) for pointing at nonstandard locations [S2].

`version` deserves a callout because of what happens when it's absent: "`version`: Pins users to that version; if omitted, git commit SHA is used as version" [S1]. Skip versioning and every commit becomes, silently, a new version — there's no stable release for an installer to pin against.

The component-path fields in the manifest (`skills`, `commands`, `agents`, `outputStyles`, `experimental.themes`, `experimental.monitors`) don't all behave the same way when they're set. Most — `commands`, `agents`, `outputStyles`, and the experimental fields — replace the default directory scan entirely if declared; `skills` is the exception and always adds to the default `skills/` scan rather than replacing it, while `hooks`, `mcpServers`, and `lspServers` have their own merge rules on top of that [S2]. That distinction matters the first time a custom `agents` path silently makes the plugin stop reading `agents/` at the default location — it isn't a bug, it's the documented replace behavior.

## Install lifecycle

What loads at session start versus on demand splits along the same component lines. MCP servers a plugin declares "start automatically when plugin is enabled" [S2] — they're a running process, not a lazy reference, so enabling the plugin is what spins them up. Skills and commands work differently: they're "automatically discovered when plugin is installed" and the model "can invoke them automatically based on task context" [S2] — discovery happens at load, but the skill body itself is only pulled into context when invoked, the same lazy pattern skills use standalone. Hooks register their event matchers at load and then fire on the matching lifecycle event — `hooks/hooks.json` lists which events (`PreToolUse`, `PostToolUse`, `SessionStart`, and dozens more) trigger which commands [S2].

For local development, the harness supports loading a plugin directly from a path rather than through a marketplace: `claude --plugin-dir ./my-plugin`, with `/reload-plugins` to pick up changes without restarting the session [S1]. Multiple plugins can load side by side by repeating the flag: `claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two` [S1]. Testing a plugin this way means exercising each component directly — trying skills with `/plugin-name:skill-name`, checking agents show up in `/context`, verifying hooks fire [S1].

## Enable, disable, scope

Installed plugins can be toggled without uninstalling them, and where that toggle lives depends on scope. The reference doc lists four: `user` scope writes to `~/.claude/settings.json` and is personal, applying across all projects, and is the default; `project` scope writes to `.claude/settings.json`, checked into version control so a team shares the same plugin set; `local` scope writes to `.claude/settings.local.json`, project-specific and gitignored; `managed` scope is read-only, update-only, for centrally administered plugins [S2]. The system supports "toggling plugins on/off to reduce system prompt context when features aren't needed" [S3] — every enabled plugin's tool descriptions and skill metadata sit in the context window on every turn, the same budget concept 00 raised for tools generally, so disabling a plugin you're not using in a given session is a direct context-cost saving, not just tidiness.

## Versioning and updates

Marketplace-installed plugins are copied into a local cache at `~/.claude/plugins/cache`, with each version living in its own directory; the previous version is marked orphaned and removed after seven days once a new one is installed [S2]. That cache mechanism is why the `version` field in the manifest matters in practice, not just in principle — it's the label the cache and the marketplace catalog both key off of. Skip it, and updates track a moving commit SHA instead of a deliberate release.

## Pro vs. amateur

**Amateurs build a kitchen-sink plugin. Pros ship one good skill.** Every enabled plugin's tool descriptions and skill metadata occupy the context window on every turn [S3] — a plugin bundling ten mediocre skills costs an installer that budget for all ten, always, whether or not any get used. A single well-scoped skill that solves one problem well is a smaller, more valuable ask of someone else's context window than a bundle of half-finished ones.

**Amateurs pick generic component names. Pros name for discoverability inside the namespace.** Every plugin component is automatically namespaced as `plugin-name:component-name` [S1], so a skill literally cannot collide with another plugin's skill of the same short name — but a badly chosen `name` field in `plugin.json` still makes every component under it awkward to reference and hard to find in a crowded plugin list. The namespace is free collision protection; a clear plugin name is what makes that protection legible to a human choosing what to install.

**Amateurs publish straight to a marketplace. Pros test locally first.** `claude --plugin-dir ./my-plugin` loads a plugin from a local path with no marketplace step at all, and `/reload-plugins` picks up edits without a session restart [S1] — there's no reason to push a broken manifest or a hook that fires on the wrong event to a shared catalog when the exact same load path is available locally first.

**Amateurs treat `plugin.json` as a formality. Pros treat it like `package.json`.** Omit the `version` field and the harness falls back to using the git commit SHA as the version [S1] — every commit becomes a distinct, un-communicated release. Once teammates or marketplace users depend on a plugin, that's the same failure mode as an unversioned npm package: nobody can pin against a stable release, and there's no changelog explaining what changed between installs. `plugin.json`'s `version`, `description`, and `author` fields exist for exactly the reason `package.json`'s do — they're what a person decides to trust and install *from*, before reading a line of the plugin's code.

## References

- Claude Code Docs — [Plugins](https://code.claude.com/docs/en/plugins) [S1]
- Claude Code Docs — [Plugins reference](https://code.claude.com/docs/en/plugins-reference) [S2]
- Claude — [Claude Code Plugins](https://claude.com/blog/claude-code-plugins) [S3]
- GitHub — [anthropics/claude-code](https://github.com/anthropics/claude-code) [S4]
