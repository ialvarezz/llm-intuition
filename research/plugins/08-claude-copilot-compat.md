# Claude ↔ Copilot Compatibility Research

Fetched: 2026-07-12

## [S1] AGENTS.md Standard Overview
- **URL:** https://agents.md/
- **Fetched:** 2026-07-12
- **Type:** spec

### Extracted

**AGENTS.md Standard Support:**
- AGENTS.md is "a simple, open format for guiding coding agents"
- Governed by the Agentic AI Foundation under the Linux Foundation
- Over 60,000 open-source projects currently use AGENTS.md

**Major Supporters:**
- OpenAI's Codex
- Google's Jules and Gemini CLI
- GitHub Copilot's Coding Agent
- Anthropic's Claude (via Claude Agent SDK)
- Cognition's Devin and Windsurf
- Open-source tools: Aider, goose
- Commercial: Cursor, Factory, Amp, RooCode, Kilo Code
- IDEs: VS Code, Zed, JetBrains Junie

**Configuration:**
- Aider: Configure via `.aider.conf.yml` with `read: AGENTS.md`
- Gemini CLI: Configure in `.gemini/settings.json` with context fileName specification

**Format:**
- Uses standard Markdown with no required fields
- Common sections: project overview, build/test commands, code style guidelines, testing instructions, security considerations, PR guidelines
- For monorepos, nested AGENTS.md files in subdirectories take precedence over parent files

---

## [S2] GitHub Copilot Custom Instructions File Locations
- **URL:** https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**File Locations:**
- Repository-wide: `.github/copilot-instructions.md` — "Apply to all requests made in the context of a repository"
- Path-specific: `.github/instructions/` — Named as `NAME.instructions.md` files, "Apply to requests made in the context of files that match a specified path"
- Agent instructions: `AGENTS.md` files (nearest one in directory tree takes precedence), or single `CLAUDE.md` or `GEMINI.md` in repository root

**Path-specific Frontmatter:**
```
---
applyTo: "**/*.ts,**/*.tsx"
excludeAgent: "code-review"
---
```

**Format:** Markdown with natural language instructions. Whitespace between instructions is ignored.

**MCP Support:** No MCP-related support documented for custom instruction files.

---

## [S3] VS Code Copilot MCP Server Configuration
- **URL:** https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**MCP Configuration Format:**
- Located in `.vscode/mcp.json` (workspace) or user profile configuration
- Example structure:
```json
{
  "servers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp"
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@microsoft/mcp-server-playwright"]
    }
  }
}
```

**Configuration Details:**
- "Avoid hardcoding sensitive information like API keys. Use input variables or environment files instead."
- Sandbox configuration (macOS/Linux): Set `"sandboxEnabled": true` with allowed paths/domains
- Dev Containers: Configured via `devcontainer.json` under `customizations.vscode.mcp` section
- MCP servers are discovered automatically and their tools become available in chat

**Agent Skills Support:**
- Not explicitly detailed in MCP servers documentation
- MCP servers provide: resources (read-only context), prompts (preconfigured templates), and MCP Apps (interactive UI components)

---

## [S4] VS Code Copilot Customization Options
- **URL:** https://code.visualstudio.com/docs/copilot/copilot-customization
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Seven Primary Customization Approaches:**
1. **Instructions:** "Write your coding standards and conventions once, and the AI applies them automatically to every request."
2. **Agent Skills:** "Teach repeatable capabilities bundled with scripts and examples that load automatically when matching tasks."
3. **Custom Agents:** Create focused AI roles with dedicated instructions, tool access, and models
4. **MCP Servers:** Connect AI to external tools, databases, and services
5. **Hooks:** "Run your own commands automatically at key points in the agent's loop, such as formatting after every edit."
6. **Agent Plugins:** Install pre-built customization bundles from a marketplace
7. **Prompt Files:** Save reusable prompts invoked as slash commands

**Agent Skills Support:** Available and explicitly documented as a feature

---

## [S5] Claude Code MCP Configuration
- **URL:** https://code.claude.com/docs/en/mcp
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**MCP Server Integration:**
- Claude Code connects to hundreds of external tools via Model Context Protocol (MCP), "an open source standard for AI-tool integrations"
- MCP servers give Claude Code access to tools, databases, and APIs
- Users connect servers when "copying data into chat from another tool, like an issue tracker or a monitoring dashboard"

**Use Cases:**
- "Implement features from issue trackers"
- "Analyze monitoring data"
- "Query databases"
- "Integrate designs"
- "Automate workflows"
- MCP servers can act as "a channel that pushes messages into your session, so Claude reacts to Telegram messages, Discord chats, or webhook events while you're away"

**Note:** Full documentation available at https://code.claude.com/docs/llms.txt for complete reference material.

---

## [S6] GitHub Agent Skills Specification (SKILL.md Format)
- **URL:** https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Agent Skills Support:**
- "Agent skills work across: Copilot cloud agent, Copilot code review, the GitHub Copilot CLI, the GitHub Copilot app, and agent mode in Visual Studio Code and JetBrains IDEs"
- "The Agent Skills specification is an open standard, used by a range of different AI systems"

**Storage Locations:**
- Project-level: `.github/skills`, `.claude/skills`, or `.agents/skills` directories
- Personal-level: `~/.copilot/skills` or `~/.agents/skills` for cross-project use

---

## [S7] GitHub Agent Skills: SKILL.md Format and Requirements
- **URL:** https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**SKILL.md File Format:**
- Uses Markdown with YAML frontmatter
- **Required fields:**
  - **name:** "A unique identifier for the skill. This must be lowercase, using hyphens for spaces."
  - **description:** "A description of what the skill does, and when Copilot should use it."
  - **license** (optional): Describes applicable licensing

**File Structure:**
- Markdown body should contain "instructions, examples and guidelines for Copilot to follow"
- Skills may include supplementary resources like scripts or additional Markdown files within the skill's directory
- Each skill requires its own "lowercase, hyphen-separated subdirectory containing the SKILL.md file"

**Optional Pre-approval:**
- `allowed-tools` field in frontmatter pre-approves tools (like `shell` or `bash`) without requiring confirmation
- Documentation warns this removes security prompts and should only be used for thoroughly reviewed, trusted skills

**Support:** Copilot cloud agent, code review, CLI, GitHub Copilot app, and Visual Studio Code agent mode

---

## [S8] Anthropic/Claude Agent Skills Support (WebSearch Result)
- **URL:** https://github.com/github/awesome-copilot (search aggregation)
- **Fetched:** 2026-07-12
- **Type:** WebSearch aggregation

### Extracted

**Claude Agent Skills (SKILL.md) Format:**
- SKILL.md files are Markdown files with YAML frontmatter
- Required: name (unique identifier), description (when Copilot should use it)
- File includes Markdown body with instructions, examples, and guidelines

**Current Support Status (2026):**
- "Agent skills work with Copilot cloud agent, Copilot code review, the GitHub Copilot CLI, the GitHub Copilot app, and agent mode in Visual Studio Code and JetBrains IDEs"
- Visual Studio: "To create a skill from the skills panel, you must have Visual Studio 2026 Insiders version 18.6 or later"

**Skill Management:**
- "You can use the gh skill command in GitHub CLI to discover, install, update, and publish agent skills from GitHub repositories"
- Requires GitHub CLI version 2.90.0 or later

**Best Practices:**
- "Keep the main SKILL.md under 500 lines and move detailed reference material to separate files in the references/ directory"

---

## Compatibility Summary

### AGENTS.md Support
- **Claude (via SDK):** ✓ Supported
- **GitHub Copilot:** ✓ Supported
- **VS Code:** ✓ Supported (via Copilot)

### SKILL.md Support
- **Claude:** Not explicitly documented in fetched sources
- **GitHub Copilot:** ✓ Fully supported (Copilot cloud agent, CLI, app, VS Code agent mode, JetBrains IDEs, Code Review)
- **VS Code:** ✓ Supported via Copilot integration

### MCP Configuration
- **Claude Code:** Config via MCP servers, standard specification, integrates directly
- **GitHub Copilot (VS Code):** Config via `.vscode/mcp.json`, server auto-discovery
- **VS Code Copilot:** Seven customization approaches including MCP servers, Agent Skills, Hooks, Custom Agents

### Custom Instructions File Locations
- **Claude:** CLAUDE.md (root) or `.claude/` directory (inferred from GitHub docs)
- **GitHub Copilot:** `.github/copilot-instructions.md`, `.github/instructions/`, `AGENTS.md`
- **Gemini:** GEMINI.md (root) or `.gemini/settings.json`
