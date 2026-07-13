# Building & Publishing a Plugin

Research compilation for Module A1, Concept 07: building and publishing a Claude Code plugin.

---

## [S1] Create plugins (Getting started guide)
- **URL:** https://code.claude.com/docs/en/plugins
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

#### Plugin scaffold layout

Directory structure for a complete plugin:
```
my-first-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── hello/
│       └── SKILL.md
└── [other components]
```

The manifest file is required at `.claude-plugin/plugin.json`. All skill directories must be at plugin root level (not inside `.claude-plugin/`). Example minimum skill:
```
mkdir -p my-first-plugin/.claude-plugin
mkdir -p my-first-plugin/skills/hello
```

#### plugin.json fields (basic)

| Field | Purpose |
| --- | --- |
| `name` | "Unique identifier and skill namespace. Skills are prefixed with this (e.g., `/my-first-plugin:hello`)" |
| `description` | "Shown in the plugin manager when browsing or installing plugins" |
| `version` | "Optional. If set, users only receive updates when you bump this field. If omitted and your plugin is distributed via git, the commit SHA is used and every commit counts as a new version" |
| `author` | "Optional. Helpful for attribution" |

Example manifest:
```json
{
  "name": "my-first-plugin",
  "description": "A greeting plugin to learn the basics",
  "version": "1.0.0",
  "author": {
    "name": "Your Name"
  }
}
```

#### Local-path install/testing workflow

Test plugins with the `--plugin-dir` flag:
```bash
claude --plugin-dir ./my-first-plugin
```

Once running, invoke skills with namespaced names:
```shell
/my-first-plugin:hello
```

Run `/reload-plugins` to pick up changes without restarting.

For multiple plugins during development:
```bash
claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two
```

To test archived plugins:
```bash
claude --plugin-dir ./my-plugin.zip
```

#### /plugin commands (exact syntax)

- `/plugin` — browse and manage plugins via UI
- `/reload-plugins` — reload all plugins without restarting
- `claude plugin init <name>` — scaffold a new plugin at `~/.claude/skills/<name>/`
- `claude plugin validate` — check plugin.json and component syntax
- `claude plugin list` — list installed plugins
- `/plugin marketplace add` — add a plugin marketplace
- `/plugin install <plugin>` — install from marketplace
- `/plugin uninstall <plugin>` — remove installed plugin
- `/plugin enable` / `/plugin disable` — control plugin state

#### Versioning guidance

Three strategies for versioning:

1. **Explicit version field**: Set `"version": "2.1.0"` in `plugin.json` — "users only receive updates when you bump this field. If omitted and your plugin is distributed via git, the commit SHA is used and every commit counts as a new version"
   - Use when plugin has stable release cycles
   - Must bump version string on every release

2. **Commit-SHA version**: Omit `version` from both `plugin.json` and marketplace entry
   - "Users get updates on every new commit to the plugin's git source"
   - Best for internal/team plugins under active development

3. **Follow semantic versioning**: "bump MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes"

**Warning**: "If you set `version` in `plugin.json`, you must bump it every time you want users to receive changes. Pushing new commits alone is not enough"

---

## [S2] Plugins reference (Technical specifications)
- **URL:** https://code.claude.com/docs/en/plugins-reference
- **Fetched:** 2026-07-12
- **Type:** docs (technical reference)

### Extracted

#### Complete plugin.json schema

Required fields:
- `name` — "Unique identifier (kebab-case, no spaces)"

Metadata fields:
| Field | Type | Description |
| --- | --- | --- |
| `$schema` | string | "JSON Schema URL for editor autocomplete and validation" |
| `displayName` | string | "Human-readable name shown in UI surfaces. Falls back to `name` when omitted. Unlike `name`, may contain spaces and any casing" |
| `version` | string | "Optional. Semantic version. Setting this pins the plugin to that version string, so users only receive updates when you bump it" |
| `description` | string | "Brief explanation of plugin purpose" |
| `author` | object | "Author information (`name` required, `email` optional)" |
| `homepage` | string | "Documentation URL" |
| `repository` | string | "Source code URL" |
| `license` | string | "License identifier" |
| `keywords` | array | "Discovery tags" |
| `defaultEnabled` | boolean | "Whether the plugin starts in an enabled state when the user has not set one. Defaults to `true`" |

Component path fields (paths must be relative and start with `./`):
| Field | Type | Description |
| --- | --- | --- |
| `skills` | string\|array | "Custom skill directories containing `<name>/SKILL.md`. Adds to the default `skills/` scan" |
| `commands` | string\|array | "Custom flat `.md` skill files or directories (replaces default `commands/`)" |
| `agents` | string\|array | "Custom agent files (replaces default `agents/`)" |
| `hooks` | string\|array\|object | "Hook config paths or inline config" |
| `mcpServers` | string\|array\|object | "MCP config paths or inline config" |
| `lspServers` | string\|array\|object | "LSP configurations for code intelligence" |
| `experimental.themes` | string\|array | "Color theme files/directories" |
| `experimental.monitors` | string\|array | "Background Monitor configurations" |
| `dependencies` | array | "Other plugins this plugin requires, optionally with semver version constraints" |

#### Plugin structure & directory locations

"Common mistake: Don't put `commands/`, `agents/`, `skills/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level"

File locations reference:
| Component | Location | Purpose |
| --- | --- | --- |
| Manifest | `.claude-plugin/plugin.json` | "Plugin metadata and configuration (optional)" |
| Skills | `skills/` | "Skills with `<name>/SKILL.md` structure" |
| Commands | `commands/` | "Skills as flat Markdown files" |
| Agents | `agents/` | "Subagent Markdown files" |
| Hooks | `hooks/hooks.json` | "Hook configuration" |
| MCP servers | `.mcp.json` | "MCP server definitions" |
| LSP servers | `.lsp.json` | "Language server configurations" |
| Monitors | `monitors/monitors.json` | "Background monitor configurations" |
| Executables | `bin/` | "Executables added to the Bash tool's `PATH`" |
| Settings | `settings.json` | "Default configuration (only `agent` and `subagentStatusLine` keys supported)" |

#### Skills-directory plugins

Auto-loading plugins from `~/.claude/skills/<name>/` with `.claude-plugin/plugin.json` manifest:
- Load as `<name>@skills-dir` on next session
- No marketplace or install step
- Scaffold with: `claude plugin init my-tool`

#### Hooks configuration

Hook events (case-sensitive):
`SessionStart`, `Setup`, `UserPromptSubmit`, `UserPromptExpansion`, `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Notification`, `MessageDisplay`, `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `Stop`, `StopFailure`, `TeammateIdle`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `PreCompact`, `PostCompact`, `Elicitation`, `ElicitationResult`, `SessionEnd`

Hook types:
- `command` — "execute shell commands or scripts"
- `http` — "send the event JSON as a POST request to a URL"
- `mcp_tool` — "call a tool on a configured MCP server"
- `prompt` — "evaluate a prompt with an LLM"
- `agent` — "run an agentic verifier with tools for complex verification tasks"

#### Environment variables in plugin.json

Three variables for referencing paths in hooks, monitor commands, MCP/LSP configs:

1. `${CLAUDE_PLUGIN_ROOT}` — "the absolute path to your plugin's installation directory. Use this to reference scripts, binaries, and config files bundled with the plugin"
2. `${CLAUDE_PLUGIN_DATA}` — "a persistent directory for plugin state that survives updates"
3. `${CLAUDE_PROJECT_DIR}` — "the project root. This is the same directory hooks receive in their `CLAUDE_PROJECT_DIR` variable"

#### CLI commands

```bash
claude plugin init <name> [options]
```
- Scaffold a new plugin at `~/.claude/skills/<name>/`
- Options: `--description`, `--author`, `--with <components...>`, `-f`

```bash
claude plugin install <plugin> [options]
```
- Install from available marketplaces
- Options: `-s, --scope <scope>` (user|project|local)

```bash
claude plugin uninstall <plugin> [options]
```
- Remove installed plugin
- Options: `-s, --scope <scope>`, `--keep-data`, `--prune`

```bash
claude plugin list [options]
```
- List installed plugins
- Options: `--json`, `--available`

```bash
claude plugin validate <path>
```
- Check plugin.json and component syntax

---

## [S3] Create and distribute a plugin marketplace
- **URL:** https://code.claude.com/docs/en/plugin-marketplaces
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

#### marketplace.json entry format

Required marketplace fields:
| Field | Type | Description |
| --- | --- | --- |
| `name` | string | "Marketplace identifier (kebab-case, no spaces). This is public-facing: users see it when installing plugins (for example, `/plugin install my-tool@your-marketplace`)" |
| `owner` | object | "Marketplace maintainer information" |
| `plugins` | array | "List of available plugins" |

Owner object:
```json
{
  "name": "DevTools Team",
  "email": "devtools@example.com"
}
```

Plugin entry fields:
| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `name` | string | Yes | "Plugin identifier (kebab-case, no spaces)" |
| `source` | string\|object | Yes | "Where to fetch the plugin from" |
| `description` | string | No | "Brief plugin description" |
| `version` | string | No | "Plugin version. If set, the plugin is pinned to this string and users only receive updates when it changes" |
| `author` | object | No | "Plugin author information" |
| `homepage` | string | No | "Plugin homepage or documentation URL" |
| `repository` | string | No | "Source code repository URL" |
| `license` | string | No | "SPDX license identifier" |
| `keywords` | array | No | "Tags for plugin discovery" |
| `category` | string | No | "Plugin category for organization" |
| `tags` | array | No | "Tags for searchability" |
| `strict` | boolean | No | "Controls whether `plugin.json` is the authority for component definitions (default: true)" |
| `defaultEnabled` | boolean | No | "Whether the plugin is enabled after install (default: true)" |

#### Plugin sources

| Source | Type | Fields | Notes |
| --- | --- | --- | --- |
| Relative path | `string` | none | "Local directory within the marketplace repo. Must start with `./`" |
| `github` | object | `repo`, `ref?`, `sha?` | GitHub repository |
| `url` | object | `url`, `ref?`, `sha?` | "Git URL source" |
| `git-subdir` | object | `url`, `path`, `ref?`, `sha?` | "Subdirectory within a git repo. Clones sparsely" |
| `npm` | object | `package`, `version?`, `registry?` | "Installed via `npm install`" |

Example relative path source:
```json
{
  "name": "my-plugin",
  "source": "./plugins/my-plugin"
}
```

Example GitHub source:
```json
{
  "name": "github-plugin",
  "source": {
    "source": "github",
    "repo": "owner/plugin-repo",
    "ref": "v2.0.0",
    "sha": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0"
  }
}
```

#### marketplace.json CLI commands

```bash
claude plugin marketplace add <source> [options]
```
- Add marketplace from GitHub, git URL, remote URL, or local path
- Options: `--scope <scope>`, `--sparse <paths...>`

Examples:
```bash
claude plugin marketplace add acme-corp/claude-plugins
claude plugin marketplace add acme-corp/claude-plugins@v2.0
claude plugin marketplace add https://gitlab.example.com/team/plugins.git
claude plugin marketplace add ./my-marketplace
```

```bash
claude plugin marketplace list [options]
```
- List all configured marketplaces
- Options: `--json`

```bash
claude plugin marketplace remove <name> [options]
```
- Remove a configured marketplace
- Options: `--scope <scope>`

```bash
claude plugin marketplace update [name]
```
- Refresh marketplaces from their sources

#### Version resolution in marketplace

"Claude Code resolves a plugin's version from the first of these that is set:
1. The `version` field in the plugin's `plugin.json`
2. The `version` field in the plugin's marketplace entry in `marketplace.json`
3. The git commit SHA of the plugin's source, for `github`, `url`, `git-subdir`, and relative-path sources"

**For explicit versions**: "Setting `version` pins the plugin. If `plugin.json` declares `"version": "1.0.0"`, pushing new commits without changing that string does nothing for existing users"

#### Strict mode in marketplace entries

| Value | Behavior |
| --- | --- |
| `true` (default) | "`plugin.json` is the authority. The marketplace entry can supplement it with additional components, and both sources are merged" |
| `false` | "The marketplace entry is the entire definition. If the plugin also has a `plugin.json` that declares components, that's a conflict and the plugin fails to load" |

---

## [S4] Best practices for Claude Code (Redirected from Anthropic)
- **URL:** https://code.claude.com/docs/en/best-practices
- **Fetched:** 2026-07-12
- **Type:** docs
- **Note:** Redirected from https://www.anthropic.com/engineering/claude-code-best-practices (308)

### Extracted

#### Plugin versioning guidance

"Claude Code uses the plugin's version as the cache key that determines whether an update is available. When you run `/plugin update` or auto-update fires, Claude Code computes the current version and skips the update if it matches what's already installed"

**Two approaches to versioning**:

| Approach | How | Update behavior | Best for |
| --- | --- | --- | --- |
| Explicit version | Set `"version": "2.1.0"` in `plugin.json` | "Users get updates only when you bump this field. Pushing new commits without bumping it has no effect" | "Published plugins with stable release cycles" |
| Commit-SHA version | Omit `version` from both `plugin.json` and marketplace entry | "Users get updates on every new commit to the plugin's git source" | "Internal or team plugins under active development" |

**Best practice for semantic versioning**: "bump MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes. Document changes in a `CHANGELOG.md`"

#### Plugin installation scopes

| Scope | Settings file | Use case |
| --- | --- | --- |
| `user` | `~/.claude/settings.json` | "Personal plugins available across all projects (default)" |
| `project` | `.claude/settings.json` | "Team plugins shared via version control" |
| `local` | `.claude/settings.local.json` | "Project-specific plugins, gitignored" |
| `managed` | Managed settings | "Managed plugins (read-only, update only)" |

Installation command syntax:
```bash
claude plugin install <plugin> --scope project
```

#### Plugin development workflow

Key steps for plugin development:
1. Scaffold plugin: `claude plugin init my-tool`
2. Add components (skills, agents, hooks, MCP)
3. Test locally: `claude --plugin-dir ./my-plugin`
4. Use `/reload-plugins` to test changes
5. Validate: `claude plugin validate ./my-plugin`
6. Share via marketplace: create `.claude-plugin/marketplace.json`

#### Plugin component configuration

Skills directory structure:
```
skills/
├── pdf-processor/
│   ├── SKILL.md
│   ├── reference.md (optional)
│   └── scripts/ (optional)
└── code-reviewer/
    └── SKILL.md
```

SKILL.md frontmatter required fields:
```yaml
---
description: What this skill does
---
```

Optional fields:
- `name` — "control the skill's invocation name"
- `disable-model-invocation: true` — "for workflows with side effects that you want to trigger manually"

#### MCP server configuration in plugins

"Plugins can bundle Model Context Protocol (MCP) servers to connect Claude Code with external tools and services"

Configuration location: `.mcp.json` at plugin root or inline in `plugin.json`

Example:
```json
{
  "mcpServers": {
    "plugin-database": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_PATH": "${CLAUDE_PLUGIN_DATA}/data"
      }
    }
  }
}
```

"Plugin MCP servers start automatically when the plugin is enabled"

#### Debugging plugins

Use `claude --debug` to see plugin loading details:
- Which plugins are being loaded
- Any errors in plugin manifests
- Skill, agent, and hook registration
- MCP server initialization

Common issues:

| Issue | Cause | Solution |
| --- | --- | --- |
| Plugin not loading | Invalid `plugin.json` | Run `claude plugin validate` |
| Skills not appearing | Wrong directory structure | "Ensure `skills/` or `commands/` is at the plugin root, not inside `.claude-plugin/`" |
| Hooks not firing | Script not executable | Run `chmod +x script.sh` |
| MCP server fails | Missing `${CLAUDE_PLUGIN_ROOT}` | Use variable for all plugin paths |
| Path errors | Absolute paths used | "All paths must be relative and start with `./`" |

---

## Key Takeaways

**Essential fields**: `name`, `description` are the minimum; version is optional but recommended for published plugins.

**Directory structure**: Only `.claude-plugin/plugin.json` goes in `.claude-plugin/`. Skills, commands, agents, hooks, etc. go at the plugin root.

**Testing workflow**: Use `--plugin-dir` for local development, `/reload-plugins` to update without restart, `claude plugin validate` to check syntax.

**Marketplace distribution**: Create `.claude-plugin/marketplace.json` with plugin entries, pin sources (github, url, npm, relative paths), and set explicit versions or rely on git commit SHAs.

**Versioning strategy**: Use explicit version for stable releases (bump every release), or omit version to auto-update on every commit for internal plugins.
