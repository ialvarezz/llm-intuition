# Module A1, Concept 01: Plugin Marketplaces Research

## Overview
This document collects research on plugin marketplaces across Claude Code, VS Code, and GitHub Copilot ecosystems. Sources focus on technical specifications, configuration formats, distribution mechanisms, and marketplace design patterns.

---

## [S1] Claude Code: Create and Distribute a Plugin Marketplace
- **URL:** https://code.claude.com/docs/en/plugin-marketplaces
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Core Definition:**
A "plugin marketplace is a catalog that lets you distribute plugins to others. Marketplaces provide centralized discovery, version tracking, automatic updates, and support for multiple source types, including git repositories and local paths."

**Marketplace Creation Steps:**
1. "Create plugins: build one or more plugins with skills, agents, hooks, MCP servers, or LSP servers"
2. "Create the marketplace file: define a `marketplace.json` that lists your plugins and where to find them"
3. "Host the marketplace: push to GitHub, GitLab, or another git host"
4. "Share with users: users add your marketplace with `/plugin marketplace add` and install individual plugins"

**Required Marketplace Fields:**
- `name` (string, kebab-case): "Marketplace identifier... This is public-facing: users see it when installing plugins"
- `owner` (object): "Marketplace maintainer information"
  - `name` (string, required): "Name of the maintainer or team"
  - `email` (string, optional): "Contact email for the maintainer"
- `plugins` (array): "List of available plugins"

**Plugin Entry Required Fields:**
- `name` (string, kebab-case): "Plugin identifier"
- `source` (string|object): "Where to fetch the plugin from"

**Plugin Sources Supported:**
| Source Type | Fields | Notes |
|---|---|---|
| Relative path | string (e.g. `"./my-plugin"`) | Local directory within marketplace repo. Must start with `./` |
| `github` | `repo`, `ref?`, `sha?` | GitHub repository source |
| `url` | `url`, `ref?`, `sha?` | Git URL source |
| `git-subdir` | `url`, `path`, `ref?`, `sha?` | Subdirectory within git repo |
| `npm` | `package`, `version?`, `registry?` | Installed via `npm install` |

**GitHub Source Example:**
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

**Installation Commands:**
- Add marketplace: `/plugin marketplace add <source>`
- Install plugin: `/plugin install <plugin-name>@<marketplace-name>`
- Update marketplace: `/plugin marketplace update`
- List marketplaces (CLI): `claude plugin marketplace list [--json]`
- Add marketplace (CLI): `claude plugin marketplace add <source> [--scope <scope>] [--sparse <paths...>]`

**Plugin Entry Optional Fields:**
- `displayName` (string): "Human-readable name shown in UI surfaces. Falls back to `name` when omitted"
- `description` (string): "Brief plugin description"
- `version` (string): "If set, users only receive updates when it changes. Omit to fall back to the git commit SHA"
- `author` (object): "Plugin author information (`name` required, `email` optional)"
- `homepage` (string): "Plugin homepage or documentation URL"
- `repository` (string): "Source code repository URL"
- `license` (string): "SPDX license identifier"
- `category` (string): "Plugin category for organization"
- `tags` (array): "Tags for searchability"
- `strict` (boolean): "Controls whether `plugin.json` is the authority for component definitions (default: true)"

**Version Resolution Order:**
1. `version` in the plugin's `plugin.json`
2. `version` in the plugin's marketplace entry
3. The git commit SHA of the plugin's source

**Reserved Marketplace Names:**
`claude-code-marketplace`, `claude-code-plugins`, `claude-plugins-official`, `claude-plugins-community`, `claude-community`, `anthropic-marketplace`, `anthropic-plugins`, `agent-skills`, `anthropic-agent-skills`, `knowledge-work-plugins`, `life-sciences`, `claude-for-legal`, `claude-for-financial-services`, `financial-services-plugins`, `first-party-plugins`, `healthcare`

**Private Repository Authentication:**
Environment variables for auto-updates (background):
- GitHub: `GITHUB_TOKEN` or `GH_TOKEN` (Personal access token or GitHub App token)
- GitLab: `GITLAB_TOKEN` or `GL_TOKEN` (Personal access token or project token)
- Bitbucket: `BITBUCKET_TOKEN` (App password or repository access token)

**Plugin Caching:**
"When users install a plugin, Claude Code copies the plugin directory to a cache location at `~/.claude/plugins/cache`."

**Plugin Renaming:**
Use top-level `renames` field to map former plugin names to current names or `null` if removed. Format: `"former-name": "new-name"` or `"former-name": null`. Requires Claude Code v2.1.193+.

**Strict Mode:**
- `true` (default): "`plugin.json` is the authority. The marketplace entry can supplement it with additional components, and both sources are merged."
- `false`: "The marketplace entry is the entire definition."

**Managed Marketplace Restrictions:**
Setting `strictKnownMarketplaces` in managed settings restricts which marketplaces users can add:
- Undefined (default): No restrictions
- Empty array `[]`: Complete lockdown
- List of sources: Users can only add marketplaces that match the allowlist exactly

**Container Pre-population:**
Set `CLAUDE_CODE_PLUGIN_SEED_DIR` environment variable to pre-populate plugins for containers. Directory structure mirrors `~/.claude/plugins`:
```
$CLAUDE_CODE_PLUGIN_SEED_DIR/
  known_marketplaces.json
  marketplaces/<name>/...
  cache/<marketplace>/<plugin>/<version>/...
```

---

## [S2] Claude Code: Create Plugins
- **URL:** https://code.claude.com/docs/en/plugins
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Plugins vs Standalone Configuration:**
| Approach | Skill Names | Best For |
|---|---|---|
| **Standalone** (`.claude/` directory) | `/hello` | Personal workflows, project-specific customizations, quick experiments |
| **Plugins** | `/plugin-name:hello` | Sharing with teammates, distributing to community, versioned releases, reusable across projects |

**Plugin Manifest (`plugin.json`) Required Fields:**
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

**Plugin Manifest Field Definitions:**
- `name`: "Unique identifier and skill namespace. Skills are prefixed with this"
- `description`: "Shown in the plugin manager when browsing or installing plugins"
- `version`: "Optional. If set, users only receive updates when you bump this field. If omitted and your plugin is distributed via git, the commit SHA is used and every commit counts as a new version"
- `author`: "Optional. Helpful for attribution"

**Skill Frontmatter Example:**
```yaml
---
description: Greet the user with a friendly message
disable-model-invocation: true
---
```

**Testing Commands:**
- Test with plugin directory: `claude --plugin-dir ./my-plugin`
- Test with `.zip` archive: `claude --plugin-dir ./my-plugin.zip` (requires v2.1.128+)
- Test with URL: `claude --plugin-url https://example.com/my-plugin.zip`
- Load multiple plugins: `claude --plugin-dir ./plugin-one --plugin-dir ./plugin-two`
- Reload plugins during session: `/reload-plugins`

**Plugin Directory Structure:**
```
plugin-root/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── <name>/
│       └── SKILL.md
├── commands/
│   └── *.md files
├── agents/
│   └── *.md files
├── hooks/
│   └── hooks.json
├── .mcp.json
├── .lsp.json
├── monitors/
│   └── monitors.json
├── bin/
│   └── executables
└── settings.json
```

**LSP Server Configuration Example:**
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

**Background Monitor Configuration Example:**
```json
[
  {
    "name": "error-log",
    "command": "tail -F ./logs/error.log",
    "description": "Application error log"
  }
]
```

**Default Settings for Plugins (`settings.json`):**
```json
{
  "agent": "security-reviewer"
}
```

**Hooks Configuration Example:**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "jq -r '.tool_input.file_path' | xargs npm run lint:fix" }]
      }
    ]
  }
}
```

**Variable Expansion:**
"Use `${CLAUDE_PLUGIN_ROOT}` variable in hooks and MCP server configs to reference files within the plugin's installation directory."

**Community Marketplace Submission:**
Two official marketplaces:
- `claude-plugins-official`: "A curated set of plugins maintained by Anthropic"
- `claude-community`: "The public community marketplace where third-party submissions land after review"

Submission forms:
- claude.ai: https://claude.ai/admin-settings/directory/submissions/plugins/new (requires Team/Enterprise org)
- Console: https://platform.claude.com/plugins/submit

Validation command: `claude plugin validate`

---

## [S3] Claude Code Plugins (Blog Post)
- **URL:** https://claude.com/blog/claude-code-plugins (redirected from https://www.anthropic.com/news/claude-code-plugins)
- **Fetched:** 2026-07-12
- **Type:** post
- **Note:** Original URL (https://www.anthropic.com/news/claude-code-plugins) returned 308 Permanent Redirect to https://claude.com/blog/claude-code-plugins

### Extracted

**Plugin Definition:**
Plugins are "a lightweight way to package and share any combination of slash commands, subagents, MCP servers, and hooks for Claude Code customization."

**Plugin Components:**
- "Slash commands": "Custom shortcuts for frequently-used operations"
- "Subagents": "Purpose-built agents for specialized development tasks"
- "MCP servers": "Connect to tools and data sources through the Model Context Protocol"
- "Hooks": "Customize Claude Code's behavior at key points in its workflow"

**Installation and Management:**
"Users install plugins via the `/plugin` command, currently in public beta. They 'toggle on and off as needed' to manage system prompt complexity."

**Marketplace Requirements:**
"Plugin marketplaces require 'a git repository, GitHub repository, or URL with a properly formatted `.claude-plugin/marketplace.json` file.' Users add them with: `/plugin marketplace add user-or-org/repo-name`"

**Use Cases:**
- "Enforcing standards across teams"
- "Supporting users through framework guidance"
- "Sharing workflows like debugging and deployment setups"
- "Connecting tools via MCP servers"
- "Bundling customizations for specific frameworks"

**Launch Date:**
October 9, 2025

---

## [S4] VS Code Extension Marketplace
- **URL:** https://code.visualstudio.com/docs/editor/extension-marketplace
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Extension Definition:**
"VS Code extensions let you add languages, debuggers, and tools to your installation to support your development workflow."

**Installation Locations:**
- **Windows**: `%USERPROFILE%\.vscode\extensions`
- **macOS**: `~/.vscode/extensions`
- **Linux**: `~/.vscode/extensions`

**Opening Extensions View:**
- Keyboard: `⇧⌘X` (macOS) or `Ctrl+Shift+X` (Windows/Linux)
- Command Palette: `⇧⌘P` (macOS) or `Shift+Cmd+P` (Windows/Linux)

**Command-Line Management:**
```bash
code --list-extensions
code --install-extension <publisher.extension>
code --uninstall-extension <extension-id>
code --extensions-dir <dir>
```

**Extension Identification Format:**
"Extensions use the format: `publisher.extension` (e.g., `wayou.vscode-todo-highlight`)"

**Trust Requirement:**
"As of version 1.97, 'when you first install an extension from a third-party publisher, VS Code shows a dialog prompting you to confirm that you trust the extension publisher.'"

**Recommended Extensions Configuration:**
"For single-folder workspaces, create an `extensions.json` file in `.vscode/` folder:"
```json
{
  "recommendations": ["publisher.extension"]
}
```

**Common View Filters:**
`@installed`, `@recommended`, `@deprecated`, `@enabled`, `@disabled`, `@updates`, `@popular`

**Auto-Update Settings:**
- `extensions.autoUpdate`: Controls automatic updates
- `extensions.autoUpdateDelay`: Default delay: `2` hours

---

## [S5] GitHub Copilot: Building Copilot Extensions
- **URL:** https://docs.github.com/en/copilot/building-copilot-extensions/about-building-copilot-extensions
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**MCP Definition:**
"MCP is 'an open standard that defines how applications share context with large language models (LLMs).'"

**Primary Capability:**
"MCP enables users to 'extend the capabilities of GitHub Copilot by integrating it with other systems.'"

**Supported Platforms:**
MCP "works across all major Copilot surfaces—whether you're working in an IDE, using GitHub Copilot CLI, working in the GitHub Copilot app, or delegating tasks to an agent on GitHub.com."

**IDE Support:**
- **Local servers**: Visual Studio Code, JetBrains IDEs, Xcode supported
- **Remote servers**: VS Code, Visual Studio, JetBrains IDEs, Xcode, Eclipse, Cursor, Windsurf use "OAuth or PAT"

**GitHub MCP Server Functions:**
"The server enables users to:
- 'Automate and streamline code-related tasks'
- 'Enable cloud-based workflows that work from any device, without local setup'
- Access GitHub tools including Copilot cloud agent and code scanning"

**Toolset Customization:**
"Enabling only the toolsets you need improves your AI assistant's performance and security."

**Policy Governance:**
"The MCP policy applies only to 'Copilot Business or Copilot Enterprise subscription' holders; Copilot Free, Pro, Pro+, and Max are excluded."

**Default Configuration:**
"The GitHub MCP server and Playwright MCP server are 'configured by default' on GitHub.com."

---

## Cross-Ecosystem Patterns

### Marketplace Architecture Common Elements
- **Centralized catalog format** (marketplace.json, extensions.json, marketplace.json)
- **Version pinning** (exact versions, git SHAs, semantic ranges)
- **Multiple source types** (git, GitHub, npm, local paths, URLs)
- **Trust boundaries** (private repos, authentication tokens, permission scopes)
- **Namespace isolation** (prefixed skills/extensions to prevent collisions)

### Distribution Mechanisms
- **Git-based** (GitHub, GitLab, Bitbucket): most common across Claude Code and GitHub
- **Package registries** (npm): supported by Claude Code
- **Direct URLs**: supported by VS Code and Claude Code for marketplace.json files
- **Local paths**: all ecosystems support development/testing with local directories

### Configuration Scopes
- **User scope**: applies to individual user across all projects
- **Project scope**: applies to team via `.claude/settings.json` or `.vscode/settings.json`
- **Local scope**: applies to single session or checkout

### Plugin/Extension Lifecycle
1. Discovery (marketplace browsing)
2. Trust establishment (explicit approval required in VS Code v1.97+)
3. Installation (download to cache or extensions directory)
4. Version management (auto-update or manual)
5. Enablement (toggle on/off)
6. Uninstallation (with cache cleanup)

