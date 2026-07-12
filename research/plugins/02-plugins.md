# Module A1 Concept 02: Plugins (The Container)

Research compilation for Claude Code plugins architecture, sourced 2026-07-12.

---

## [S1] Claude Code Plugins Documentation

- **URL:** https://code.claude.com/docs/en/plugins
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Core Definition:**
- "Plugins let you extend Claude Code with custom functionality that can be shared across projects and teams."
- Plugins support: skills, agents, hooks, and MCP servers.

**Standalone vs Plugins:**
- **Standalone** (`.claude/` directory): Skills use short names like `/hello`. Best for personal workflows and project-specific customizations.
- **Plugins** (self-contained directories with `.claude-plugin/plugin.json` manifest): Skills use namespaced names like `/plugin-name:hello`. Best for sharing with teams, distribution, versioned releases, and reuse across projects.

**Plugin Manifest Structure** (`.claude-plugin/plugin.json`):
- Required fields: `name`
- Metadata fields: `description`, `version`, `author`
- Optional fields: `homepage`, `repository`, `license`
- Field purposes:
  - `name`: Unique identifier and skill namespace
  - `description`: Shown in the plugin manager
  - `version`: Pins users to that version; if omitted, git commit SHA is used as version
  - `author`: Attribution information

**Plugin Directory Structure:**
- `.claude-plugin/`: Contains `plugin.json` manifest (optional if components use default locations)
- `skills/`: Skills as `<name>/SKILL.md` directories
- `commands/`: Skills as flat Markdown files (use `skills/` for new plugins)
- `agents/`: Custom agent definitions
- `hooks/`: Event handlers in `hooks.json`
- `.mcp.json`: MCP server configurations
- `.lsp.json`: LSP server configurations for code intelligence
- `monitors/`: Background monitor configurations in `monitors.json`
- `bin/`: Executables added to Bash tool's `PATH` while plugin is enabled
- `settings.json`: Default settings applied when plugin is enabled

**Critical Mistake:**
- "Don't put `commands/`, `agents/`, `skills/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level."

**Plugin Testing:**
- Use `claude --plugin-dir ./my-plugin` flag to load plugins during development
- Run `/reload-plugins` to pick up updates without restarting
- Test components: try skills with `/plugin-name:skill-name`, check agents in `/context`, verify hooks work

**Multiple Plugins Loading:**
- Use flag multiple times: `claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two`
- Can load plugin from `.zip` archive with `--plugin-dir` (requires Claude Code v2.1.128+)
- Use `--plugin-url` for plugins hosted at URLs

**Community Distribution:**
- Two public marketplaces:
  - `claude-plugins-official`: curated plugins maintained by Anthropic
  - `claude-community`: public community marketplace
- Submit for review via claude.ai form or Console form
- Run `claude plugin validate` before submission
- Approved plugins pinned to specific commit SHA in `anthropics/claude-plugins-community`

**Skill Naming Convention:**
- Plugin skills always use namespace prefix: `/my-plugin:skill-name`
- Namespacing prevents conflicts when multiple plugins have skills with same name
- Update `name` field in `plugin.json` to change namespace prefix

---

## [S2] Plugins Reference Documentation

- **URL:** https://code.claude.com/docs/en/plugins-reference
- **Fetched:** 2026-07-12
- **Type:** docs (technical reference)

### Extracted

**Plugin Definition (Technical):**
- "A **plugin** is a self-contained directory of components that extends Claude Code with custom functionality. Plugin components include skills, agents, hooks, MCP servers, LSP servers, and monitors."

**Skills Component:**
- **Location:** `skills/` or `commands/` directory in plugin root, or single `SKILL.md` at plugin root
- **File format:** Skills are directories with `SKILL.md`; commands are simple markdown files
- **Structure example:**
  ```
  skills/
  ├── pdf-processor/
  │   ├── SKILL.md
  │   ├── reference.md (optional)
  │   └── scripts/ (optional)
  └── code-reviewer/
      └── SKILL.md
  ```
- **Behavior:** Skills and commands are automatically discovered when plugin is installed; Claude can invoke them automatically based on task context

**Agents Component:**
- **Location:** `agents/` directory in plugin root
- **File format:** Markdown files describing agent capabilities
- **Frontmatter fields supported:** `name`, `description`, `model`, `effort`, `maxTurns`, `tools`, `disallowedTools`, `skills`, `memory`, `background`, `isolation`
- **Valid `isolation` value:** `"worktree"` only
- **Security restrictions:** `hooks`, `mcpServers`, and `permissionMode` are not supported for plugin-shipped agents
- **Integration:** Agents appear in @-mention typeahead under scoped name (e.g., `my-plugin:code-reviewer`); Claude can invoke automatically or manually

**Hooks Component:**
- **Location:** `hooks/hooks.json` in plugin root, or inline in plugin.json
- **Format:** JSON configuration with event matchers and actions
- **Hook types:** `command`, `http`, `mcp_tool`, `prompt`, `agent`
- **Example:**
  ```json
  {
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Write|Edit",
          "hooks": [
            {
              "type": "command",
              "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/format-code.sh"
            }
          ]
        }
      ]
    }
  }
  ```
- **Lifecycle events:** SessionStart, Setup, UserPromptSubmit, UserPromptExpansion, PreToolUse, PermissionRequest, PermissionDenied, PostToolUse, PostToolUseFailure, PostToolBatch, Notification, MessageDisplay, SubagentStart, SubagentStop, TaskCreated, TaskCompleted, Stop, StopFailure, TeammateIdle, InstructionsLoaded, ConfigChange, CwdChanged, FileChanged, WorktreeCreate, WorktreeRemove, PreCompact, PostCompact, Elicitation, ElicitationResult, SessionEnd

**MCP Servers Component:**
- **Location:** `.mcp.json` in plugin root, or inline in plugin.json
- **Format:** Standard MCP server configuration
- **Example:**
  ```json
  {
    "mcpServers": {
      "plugin-database": {
        "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
        "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
        "env": {
          "DB_PATH": "${CLAUDE_PLUGIN_ROOT}/data"
        }
      }
    }
  }
  ```
- **Behavior:** Plugin MCP servers start automatically when plugin is enabled; appear as standard MCP tools

**LSP Servers Component:**
- **Location:** `.lsp.json` in plugin root, or inline in plugin.json
- **Provides:** Instant diagnostics, code navigation, language awareness
- **Required fields:** `command` (LSP binary to execute), `extensionToLanguage` (maps file extensions to language identifiers)
- **Optional fields:** `args`, `transport` (stdio or socket), `env`, `initializationOptions`, `settings`, `workspaceFolder`, `startupTimeout`, `shutdownTimeout`, `restartOnCrash`, `maxRestarts`, `diagnostics`
- **Example:**
  ```json
  {
    "go": {
      "command": "gopls",
      "args": ["serve"],
      "extensionToLanguage": {
        ".go": "go"
      }
    }
  }
  ```
- **Official LSP plugins:** `pyright-lsp` (Python), `typescript-lsp` (TypeScript), `rust-analyzer-lsp` (Rust)

**Monitors Component:**
- **Location:** `monitors/monitors.json` in plugin root, or inline in plugin.json
- **Format:** JSON array of monitor entries
- **Required fields:** `name` (identifier unique within plugin), `command` (shell command run as background process), `description` (shown in task panel)
- **Optional fields:** `when` (controls start timing: `"always"` default, or `"on-skill-invoke:<skill-name>"`)
- **Variable substitution:** `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_PROJECT_DIR}`, `${user_config.*}`, environment variables
- **Example:**
  ```json
  [
    {
      "name": "deploy-status",
      "command": "\"${CLAUDE_PLUGIN_ROOT}\"/scripts/poll-deploy.sh",
      "description": "Deployment status changes"
    }
  ]
  ```

**Themes Component (Experimental):**
- **Location:** `themes/` directory
- **Format:** JSON files with `base` preset and sparse `overrides` map
- **Example:**
  ```json
  {
    "name": "Dracula",
    "base": "dark",
    "overrides": {
      "claude": "#bd93f9",
      "error": "#ff5555",
      "success": "#50fa7b"
    }
  }
  ```

**Plugin Installation Scopes:**
| Scope | Settings file | Use case |
| --- | --- | --- |
| `user` | `~/.claude/settings.json` | Personal plugins across all projects (default) |
| `project` | `.claude/settings.json` | Team plugins shared via version control |
| `local` | `.claude/settings.local.json` | Project-specific plugins, gitignored |
| `managed` | [Managed settings] | Managed plugins (read-only, update only) |

**Skills-Directory Plugins:**
- "Any folder under a skills directory that contains a `.claude-plugin/plugin.json` manifest is loaded as a plugin named `<name>@skills-dir` on the next session"
- Loaded automatically with no marketplace/install step
- Scaffold with `claude plugin init my-tool`
- Project-scope plugins from `<cwd>/.claude/skills/` load only after workspace trust dialog

**Plugin Manifest Schema (Complete):**
```json
{
  "name": "plugin-name",
  "displayName": "Plugin Name",
  "version": "1.2.0",
  "description": "Brief plugin description",
  "author": {
    "name": "Author Name",
    "email": "author@example.com",
    "url": "https://github.com/author"
  },
  "homepage": "https://docs.example.com/plugin",
  "repository": "https://github.com/author/plugin",
  "license": "MIT",
  "keywords": ["keyword1", "keyword2"],
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/special.md"],
  "agents": ["./custom/agents/reviewer.md"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "experimental": {
    "themes": "./themes/",
    "monitors": "./monitors.json"
  },
  "dependencies": [
    "helper-lib",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

**Required Fields:**
- Only `name` is required if manifest is present

**Metadata Fields:**
- `$schema`: JSON Schema URL for editor autocomplete
- `displayName`: Human-readable name (requires v2.1.143+)
- `version`: Semantic version; if omitted, uses git commit SHA
- `description`: Brief explanation
- `author`: Author information object
- `homepage`: Documentation URL
- `repository`: Source code URL
- `license`: License identifier (e.g., "MIT", "Apache-2.0")
- `keywords`: Discovery tags array
- `defaultEnabled`: Boolean (v2.1.154+) - whether plugin starts enabled; defaults to `true`

**Component Path Fields:**
- `skills`: Custom skill directories (string or array, adds to default)
- `commands`: Custom flat `.md` files (replaces default)
- `agents`: Custom agent files (replaces default)
- `hooks`: Hook config paths or inline config
- `mcpServers`: MCP config paths or inline config
- `outputStyles`: Custom output style files/directories (replaces default)
- `lspServers`: LSP server configs
- `experimental.themes`: Color theme files/directories
- `experimental.monitors`: Background monitor configurations
- `userConfig`: User-configurable values prompted at enable time
- `channels`: Channel declarations for message injection
- `dependencies`: Other plugins required, optionally with semver constraints

**Path Behavior Rules:**
- **Replaces default:** `commands`, `agents`, `outputStyles`, `experimental.themes`, `experimental.monitors`
- **Adds to default:** `skills` (always scans default `skills/`)
- **Own merge rules:** `hooks`, `mcpServers`, `lspServers`

**User Configuration:**
- Declared in `userConfig` field
- Prompts user when plugin is enabled
- Supports types: `string`, `number`, `boolean`, `directory`, `file`
- Fields: `type`, `title`, `description`, `sensitive`, `required`, `default`, `multiple`, `min`/`max`
- Stored as `${user_config.KEY}` substitution in configs
- Sensitive values stored in keychain; non-sensitive in `settings.json`

**Channels:**
- Declared in `channels` field
- Let plugin declare message channels that inject content into conversation
- Bind to MCP servers provided by plugin
- Each channel has `server` field (required, must match `mcpServers` key) and optional `userConfig`

**Environment Variables:**
- `${CLAUDE_PLUGIN_ROOT}`: Absolute path to plugin installation directory
- `${CLAUDE_PLUGIN_DATA}`: Persistent directory for plugin state surviving updates
- `${CLAUDE_PROJECT_DIR}`: Project root directory

**Plugin Caching:**
- Marketplace plugins copied to user's local plugin cache: `~/.claude/plugins/cache`
- Each version is separate directory
- Previous version marked as orphaned and removed after 7 days
- Glob and Grep tools skip orphaned version directories

**Path Traversal Limitations:**
- Installed plugins cannot reference files outside their directory
- Paths traversing outside plugin root (like `../shared-utils`) don't work after installation
- Share files within marketplace using symbolic links

**Plugin Directory Structure (Standard Layout):**
```
enterprise-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   ├── code-reviewer/
│   │   └── SKILL.md
│   └── pdf-processor/
│       ├── SKILL.md
│       └── scripts/
├── commands/
├── agents/
├── output-styles/
├── themes/
├── monitors/
├── hooks/
├── bin/
├── settings.json
├── .mcp.json
├── .lsp.json
├── scripts/
└── LICENSE
```

---

## [S3] Claude Code Plugins Announcement (Redirected)

- **Original URL:** https://www.anthropic.com/news/claude-code-plugins
- **Redirected to:** https://claude.com/blog/claude-code-plugins (308 Permanent Redirect)
- **Fetched:** 2026-07-12
- **Type:** blog post / announcement

### Extracted

**Feature Status:**
- "Claude Code now supports plugins—custom collections of slash commands, agents, MCP servers, and hooks installable with a single command. The feature is in public beta as of October 9, 2025."

**What Plugins Enable:**
- **Slash commands:** "Create custom shortcuts for frequently-used operations"
- **Subagents:** Purpose-built agents for specialized development tasks
- **MCP servers:** Connections to tools and data sources via Model Context Protocol
- **Hooks:** Customizations of Claude Code's behavior at key workflow points

**Key Capabilities:**
- Users can "install them with the `/plugin` command"
- Function across terminal and VS Code
- System supports toggling plugins on/off to reduce system prompt context when features aren't needed

**Primary Use Cases:**
- Enforcing coding standards across teams
- Supporting open source developers and package users
- Sharing productivity workflows (debugging, deployment, testing)
- Connecting internal tools via MCP servers
- Bundling framework-specific customizations

**Plugin Marketplaces:**
- Developers can create curated plugin collections using git repositories or URLs
- Collections use `.claude-plugin/marketplace.json` files
- Enable community-driven discovery and organizational distribution of approved plugins

---

## [S4] Claude Code Repository Documentation

- **URL:** https://github.com/anthropics/claude-code
- **Fetched:** 2026-07-12
- **Type:** repository + docs

### Extracted

**Repository Overview:**
- **Official Repository:** `anthropics/claude-code`
- **Stars:** 138k
- **Forks:** 22.2k
- **Primary Languages:** Python (79.7%), Shell (13.7%), TypeScript (5.0%)
- **Official Docs:** https://code.claude.com/docs/en/overview

**Repository Tool:**
- Claude Code described as: "an agentic coding tool that lives in your terminal, understands your codebase, and helps you code faster by executing routine tasks, explaining complex code, and handling git workflows through natural language commands"

**Repository Structure:**
- `.claude-plugin/`: Plugin configuration
- `.claude/commands/`: Custom commands
- `.devcontainer/`: Development container setup
- `.github/`: GitHub workflows
- `.vscode/`: VS Code configuration
- `examples/`: Example files
- `plugins/`: Plugin extensions directory with custom commands and agents
- `scripts/`: Utility scripts

**Data Collection & Privacy:**
- **Usage data collected:** Code acceptance/rejections, conversation data, feedback
- **Retention:** Limited retention periods for sensitive information
- **Access:** Restricted access to user session data
- **Policy:** Data not used for model training
- **Policies referenced:** Commercial Terms of Service and Privacy Policy at anthropic.com/legal/

**Support & Community:**
- **Bug Reports:** Use `/bug` command or file GitHub issues
- **Community:** Join Claude Developers Discord
- **Setup Help:** See setup documentation at code.claude.com/docs/en/setup

---

## Summary Statistics

- **Total sources fetched:** 4 (1 redirect)
- **Successful fetches:** 4/4
- **Replacements/redirects:** 1 (https://www.anthropic.com/news/claude-code-plugins → https://claude.com/blog/claude-code-plugins)
- **Source types:** 2 documentation pages, 1 blog announcement, 1 repository documentation

## Key Takeaways for Concept 02

1. **Plugin Architecture:** Self-contained directories with `.claude-plugin/plugin.json` manifest containing skills, agents, hooks, MCP/LSP servers, monitors, and themes
2. **Namespace Convention:** All plugin components use scoped names (e.g., `/plugin-name:skill-name`) to prevent conflicts
3. **Distribution Model:** Plugins installable via `/plugin` command from marketplaces or local directories using `--plugin-dir`
4. **Component System:** Plugins support 8+ distinct component types (skills, agents, hooks, MCP, LSP, monitors, themes, channels) each with specific schema and behavior
5. **Scope System:** Plugins can be installed at user, project, local, or managed scope with corresponding settings files
6. **Development Pattern:** Start with `.claude/` for iteration, convert to plugin for sharing; test with `--plugin-dir` and reload with `/reload-plugins`
