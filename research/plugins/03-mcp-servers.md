# MCP Servers Research

Research compilation for Module A1, Concept 03: Model Context Protocol (MCP) servers.

---

## [S1] What is the Model Context Protocol (MCP)?

- **URL:** https://modelcontextprotocol.io/
- **Fetched:** 2026-07-12
- **Type:** docs (homepage)

### Extracted

**Definition and Purpose:**
- "MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems."
- "Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems."

**What MCP Enables:**
AI applications can:
- "Access your Google Calendar and Notion, acting as a more personalized AI assistant"
- "Generate an entire web app using a Figma design" (Claude Code example)
- "Connect to multiple databases across an organization, empowering users to analyze data using chat"
- "Create 3D designs on Blender and print them out using a 3D printer"

**Why MCP Matters:**
- **For Developers**: "MCP reduces development time and complexity when building, or integrating with, an AI application or agent."
- **For AI applications or agents**: "MCP provides access to an ecosystem of data sources, tools and apps which will enhance capabilities and improve the end-user experience."
- **For End-users**: "MCP results in more capable AI applications or agents which can access your data and take actions on your behalf when necessary."

**Ecosystem Support:**
"MCP is an open protocol supported across a wide range of clients and servers. AI assistants like Claude and ChatGPT, development tools like Visual Studio Code, Cursor, MCPJam, and many others all support MCP — making it easy to build once and integrate everywhere."

---

## [S2] MCP Specification — Latest

- **URL:** https://modelcontextprotocol.io/specification/latest
- **Fetched:** 2026-07-12
- **Type:** spec

### Extracted

**Core Definition:**
"Model Context Protocol (MCP) is an open protocol that enables seamless integration between LLM applications and external data sources and tools."

**Architecture Components:**
"The protocol uses JSON-RPC 2.0 messages to establish communication between:
- **Hosts**: LLM applications that initiate connections
- **Clients**: Connectors within the host application
- **Servers**: Services that provide context and capabilities"

**Base Protocol:**
- "JSON-RPC 2.0 message format"
- "Stateful connections"
- "Server and client capability negotiation"

**Server-Offered Features:**
"Servers offer any of the following features to clients:
- **Resources**: Context and data, for the user or the AI model to use
- **Prompts**: Templated messages and workflows for users
- **Tools**: Functions for the AI model to execute"

**Client-Offered Features:**
"Clients may offer the following features to servers:
- **Sampling**: Server-initiated agentic behaviors and recursive LLM interactions
- **Roots**: Server-initiated inquiries into URI or filesystem boundaries to operate in
- **Elicitation**: Server-initiated requests for additional information from users"

**Additional Utilities:**
"Configuration, Progress tracking, Cancellation, Error reporting, Logging"

**Security Principles:**
1. "User Consent and Control — Users must explicitly consent to and understand all data access and operations; Users must retain control over what data is shared and what actions are taken"
2. "Data Privacy — Hosts must obtain explicit user consent before exposing user data to servers; Hosts must not transmit resource data elsewhere without user consent"
3. "Tool Safety — Tools represent arbitrary code execution and must be treated with appropriate caution; Hosts must obtain explicit user consent before invoking any tool"
4. "LLM Sampling Controls — Users must explicitly approve any LLM sampling requests; Users should control whether sampling occurs at all, the actual prompt that will be sent, and what results the server can see"

---

## [S3] Model Context Protocol — Anthropic Announcement

- **URL:** https://www.anthropic.com/news/model-context-protocol
- **Fetched:** 2026-07-12
- **Type:** post

### Extracted

**Problem Statement:**
"MCP enables powerful capabilities through breaking down information silos" — aims to "replace multiple custom integrations with a unified approach to connecting AI systems with data sources."

**Core Capabilities:**
MCP allows AI assistants to:
- "Access data trapped behind legacy systems and information barriers"
- "Maintain consistent context across different tools and datasets"
- "Retrieve relevant information more effectively for contextual understanding"

**Components of the Initiative:**
"The protocol includes three major components: official specifications with software development kits, local server support in Claude Desktop applications, and an open-source repository of ready-made servers for platforms like Google Drive, Slack, and GitHub."

**Anthropic's Strategic Position:**
- "Developed by Anthropic engineers but released as community-driven infrastructure"
- Positioned as **enabler of ecosystem development**: "Encouraging third-party developers and enterprises to build connectors"
- "Committing to sustainable architecture over fragmented integrations"

Framed as "a collaborative, open-source initiative rather than proprietary technology."

---

## [S4] Connect Claude Code to tools via MCP

- **URL:** https://code.claude.com/docs/en/mcp
- **Fetched:** 2026-07-12
- **Type:** docs (reference)

### Extracted

**Core Capability:**
"Claude Code can connect to hundreds of external tools and data sources through the Model Context Protocol (MCP), an open source standard for AI-tool integrations. MCP servers give Claude Code access to your tools, databases, and APIs."

**Use Cases with MCP Servers Connected:**
- "Implement features from issue trackers: 'Add the feature described in JIRA issue ENG-4521 and create a PR on GitHub.'"
- "Analyze monitoring data: 'Check Sentry and Statsig to check the usage of the feature described in ENG-4521.'"
- "Query databases: 'Find emails of 10 random users who used feature ENG-4521, based on our PostgreSQL database.'"
- "Integrate designs: 'Update our standard email template based on the new Figma designs that were posted in Slack'"
- "Automate workflows: 'Create Gmail drafts inviting these 10 users to a feedback session about the new feature.'"
- "React to external events: an MCP server can also act as a channel that pushes messages into your session"

**Installation Methods:**

**Option 1: Remote HTTP Server**
```bash
# Basic syntax
claude mcp add --transport http <name> <url>

# Real example: Connect to Notion
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Example with Bearer token
claude mcp add --transport http secure-api https://api.example.com/mcp \
  --header "Authorization: Bearer your-token"
```

**JSON Configuration for HTTP:**
```json
{
  "type": "streamable-http",
  "url": "https://api.example.com/mcp"
}
```
Note: "The MCP specification uses the name `streamable-http` for this transport, so configurations copied from server documentation work without modification."

**Option 2: Remote SSE Server** (Deprecated)
```bash
# Basic syntax
claude mcp add --transport sse <name> <url>

# Real example: Connect to Asana
claude mcp add --transport sse asana https://mcp.asana.com/sse
```

**Option 3: Local Stdio Server**
```bash
# Basic syntax
claude mcp add [options] <name> -- <command> [args...]

# Real example: Add Airtable server
claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable \
  -- npx -y airtable-mcp-server
```

Important: "For stdio servers, the `--` (double dash) separates Claude's own options, such as `--transport`, `--env`, and `--scope`, from the command and arguments that run the server."

**Environment Variable in Stdio Servers:**
"Claude Code sets `CLAUDE_PROJECT_DIR` in the spawned server's environment to the project root, so your server can resolve project-relative paths without depending on the working directory."

**Option 4: Remote WebSocket Server**
```bash
claude mcp add-json events-server \
  '{"type":"ws","url":"wss://mcp.example.com/socket","headers":{"Authorization":"Bearer YOUR_TOKEN"}}'
```
"WebSocket servers hold a persistent bidirectional connection, which suits remote MCP servers that push events to Claude unprompted. Use HTTP instead when your server only responds to requests."

**MCP Installation Scopes:**

| Scope     | Loads in              | Shared with team       | Stored in              |
|-----------|----------------------|----------------------|------------------------|
| Local     | Current project only | No                  | `~/.claude.json`       |
| Project   | Current project only | Yes, via version control | `.mcp.json` in project root |
| User      | All your projects    | No                  | `~/.claude.json`       |

**Project-Scope Configuration (.mcp.json):**
```json
{
  "mcpServers": {
    "shared-server": {
      "command": "/path/to/server",
      "args": [],
      "env": {}
    }
  }
}
```

**Local-Scope Configuration (~/.claude.json):**
```json
{
  "projects": {
    "/path/to/your/project": {
      "mcpServers": {
        "stripe": {
          "type": "http",
          "url": "https://mcp.stripe.com"
        }
      }
    }
  }
}
```

**Environment Variable Expansion in .mcp.json:**
```json
{
  "mcpServers": {
    "api-server": {
      "type": "http",
      "url": "${API_BASE_URL:-https://api.example.com}/mcp",
      "headers": {
        "Authorization": "Bearer ${API_KEY}"
      }
    }
  }
}
```
Syntax: `${VAR}` or `${VAR:-default}` for environment variable expansion.

**Managing Servers:**
```bash
# List all configured servers
claude mcp list

# Get details for a specific server
claude mcp get github

# Remove a server
claude mcp remove github

# Check server status (within Claude Code)
/mcp
```

**Dynamic Tool Updates:**
"Claude Code supports MCP `list_changed` notifications, allowing MCP servers to dynamically update their available tools, prompts, and resources without requiring you to disconnect and reconnect."

**Automatic Reconnection:**
"If an HTTP or SSE server disconnects mid-session, Claude Code automatically reconnects with exponential backoff: up to five attempts, starting at a one-second delay and doubling each time."

**Authentication — OAuth 2.0:**
Claude Code marks a remote server as needing authentication when "the server responds with `401 Unauthorized` or `403 Forbidden`."

OAuth flow is initiated from `/mcp` command:
```bash
claude mcp login <name>
```

**Plugin-Provided MCP Servers:**

Example `.mcp.json` in plugin root:
```json
{
  "mcpServers": {
    "database-tools": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/db-server",
      "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"],
      "env": {
        "DB_URL": "${DB_URL}"
      }
    }
  }
}
```

Or inline in `plugin.json`:
```json
{
  "name": "my-plugin",
  "mcpServers": {
    "plugin-api": {
      "command": "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
      "args": ["--port", "8080"]
    }
  }
}
```

**Plugin Tool Naming:**
"Tools from a plugin-bundled MCP server include both the plugin name and the server key in their callable name. The full form is `mcp__plugin_<plugin-name>_<server-name>__<tool-name>`"

Example: `mcp__plugin_my-plugin_database-tools__query`

**MCP Output Limits:**
- "Claude Code displays a warning when any MCP tool output exceeds 10,000 tokens"
- "Default maximum is 25,000 tokens"
- Configure with `MAX_MCP_OUTPUT_TOKENS` environment variable

**Tool Output Size Annotation:**
MCP servers can set per-tool limits in `tools/list` response:
```json
{
  "name": "get_schema",
  "description": "Returns the full database schema",
  "_meta": {
    "anthropic/maxResultSizeChars": 200000
  }
}
```

**Per-Server Timeout Configuration:**
"Set a per-server tool execution timeout by adding a `timeout` field in milliseconds to that server's `.mcp.json` entry, for example `"timeout": 600000` for ten minutes."

**MCP Tool Search:**
"Tool search is enabled by default. MCP tools are deferred rather than loaded into context upfront, and Claude uses a search tool to discover relevant ones when a task needs them. Only the tools Claude actually uses enter context."

Control with `ENABLE_TOOL_SEARCH` environment variable:
- (unset): All MCP tools deferred and loaded on demand
- `true`: All MCP tools deferred
- `auto`: Threshold mode (tools load upfront if they fit within 10% of context window)
- `auto:N`: Threshold mode with custom percentage
- `false`: All MCP tools loaded upfront

**Exempt Server from Deferral:**
```json
{
  "mcpServers": {
    "core-tools": {
      "type": "http",
      "url": "https://mcp.example.com/mcp",
      "alwaysLoad": true
    }
  }
}
```

**MCP Resources (@ Mentions):**
"MCP servers can expose resources that you can reference using @ mentions, similar to how you reference files."

Format: `@server:protocol://resource/path`

Example:
```
Can you analyze @github:issue://123 and suggest a fix?
```

**MCP Prompts as Commands:**
"MCP servers can expose prompts that become available as commands in Claude Code."

Available via `/` autocomplete: `/mcp__servername__promptname`

**Use Claude Code as an MCP Server:**
```bash
claude mcp serve
```

Configuration for Claude Desktop:
```json
{
  "mcpServers": {
    "claude-code": {
      "type": "stdio",
      "command": "claude",
      "args": ["mcp", "serve"],
      "env": {}
    }
  }
}
```

---

## [S5] VS Code Copilot — MCP Server Configuration

- **URL:** https://code.visualstudio.com/docs/copilot/chat/mcp-servers
- **Fetched:** 2026-07-12
- **Type:** docs (reference)

### Extracted

**Configuration File Locations:**
- **Workspace**: `.vscode/mcp.json` (shared via source control)
- **User Profile**: Located in your user settings folder (accessible via **MCP: Open User Configuration** command)

**Configuration Schema Structure:**
```json
{
  "servers": {
    "server-name": {
      // server configuration
    }
  }
}
```

**Server Type Examples:**

**Remote HTTP Server:**
```json
{
  "type": "http",
  "url": "https://api.example.com/mcp"
}
```

**Local Command-Based Server:**
```json
{
  "command": "npx",
  "args": ["-y", "@microsoft/mcp-server-playwright"]
}
```

**Key Configuration Fields:**
- `type`: Specifies server communication protocol (e.g., "http", "stdio")
- `command`: Executable command to start the server
- `args`: Command-line arguments as an array
- `sandboxEnabled`: Boolean for sandbox restrictions (macOS/Linux only)
- `url`: Remote server endpoint for HTTP-type servers

**Additional Setup Options:**
- **Dev Containers**: Configure servers via `devcontainer.json` under `customizations.vscode.mcp`
- **Command Line**: Use `code --add-mcp` with JSON configuration
- **Auto-Discovery**: VS Code can detect configurations from other applications like Claude Desktop

**Best Practice:**
"The documentation emphasizes avoiding hardcoded API keys by using input variables or environment files instead."

---

## Summary of Key Configuration Formats

### Claude Code Configuration

**Project-Scoped (.mcp.json):**
```json
{
  "mcpServers": {
    "server-name": {
      "type": "http|sse|ws|stdio",
      "url": "https://...",
      "command": "...",
      "args": [],
      "env": {},
      "headers": {},
      "timeout": 600000,
      "alwaysLoad": false
    }
  }
}
```

**HTTP Server via CLI:**
```bash
claude mcp add --transport http <name> <url>
```

**Stdio Server via CLI:**
```bash
claude mcp add --transport stdio <name> -- <command> [args...]
```

### VS Code Configuration

**Workspace/User (.vscode/mcp.json):**
```json
{
  "servers": {
    "server-name": {
      "type": "http",
      "url": "https://...",
      "command": "...",
      "args": [],
      "sandboxEnabled": false
    }
  }
}
```

### Field Name Conventions

Both platforms use:
- `type`: Protocol type (http, stdio, sse, ws, etc.)
- `url`: Remote endpoint (for HTTP-based servers)
- `command`: Executable path (for local stdio servers)
- `args`: Array of command-line arguments
- `env`: Object of environment variables
- `headers`: Authentication headers (HTTP servers)

Claude Code-specific fields:
- `timeout`: Per-server timeout in milliseconds
- `alwaysLoad`: Boolean to exempt from tool deferral
- `oauth`: OAuth configuration object
- `headersHelper`: Dynamic header generation command
- `scope`: local | project | user

VS Code-specific fields:
- `sandboxEnabled`: Sandbox restriction toggle
