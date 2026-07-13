# 03 · MCP servers

## The N×M problem

Every AI assistant that wants to reach an external tool used to need its own bespoke integration — one adapter for Claude talking to GitHub, a different adapter for Copilot talking to GitHub, another for Claude talking to Slack, another for Copilot talking to Slack. Wire up *N* assistants against *M* tools by hand and you're maintaining N×M brittle, one-off connectors, each with its own auth quirks and message format. Anthropic's own framing of the problem it built MCP to solve is explicit about the target: the goal is to "replace multiple custom integrations with a unified approach to connecting AI systems with data sources" [S3]. Rather than every assistant re-solving how to talk to a given tool, one protocol sits in the middle.

The analogy the spec's own homepage reaches for is deliberate: "Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems" [S1]. A USB-C port doesn't care whether the device on the other end is a phone, a monitor, or a hard drive — it cares that both sides speak USB-C. MCP makes the same trade: build one server against the protocol, and it works with any client that also speaks the protocol, rather than shipping a Claude-shaped adapter and a Copilot-shaped adapter and calling it done. The ecosystem breadth backs this up directly — "AI assistants like Claude and ChatGPT, development tools like Visual Studio Code, Cursor, MCPJam, and many others all support MCP — making it easy to build once and integrate everywhere" [S1].

Concretely, what MCP unlocks for an assistant is described plainly on the same page: AI applications can "[a]ccess your Google Calendar and Notion, acting as a more personalized AI assistant," "[g]enerate an entire web app using a Figma design," "[c]onnect to multiple databases across an organization, empowering users to analyze data using chat," or "[c]reate 3D designs on Blender and print them out using a 3D printer" [S1]. None of those are new model capabilities — they're new *connections*, made possible because the tool on the other end and the assistant on this end already agree on how to talk to each other.

## Three primitives: tools, resources, prompts

Underneath the protocol is a small, fixed vocabulary. The specification defines what a server is allowed to offer a client, and it's exactly three things: "Servers offer any of the following features to clients: **Resources**: Context and data, for the user or the AI model to use. **Prompts**: Templated messages and workflows for users. **Tools**: Functions for the AI model to execute" [S2].

That three-way split maps to three different *initiators*. A **tool** is model-invoked — the model decides, mid-conversation, that calling `query_db` or `create_issue` will help it answer, and emits a structured call the same way it would for any other tool use. A **resource** is data the server exposes for reading — a file, a database row, a ticket — that either the user or the model can pull in as context without it being an "action" in the tool-call sense; Claude Code surfaces these to users directly as `@` mentions, in the form `@server:protocol://resource/path` [S4]. A **prompt** is user-invoked: a templated message or workflow the *person* chooses to run, not something the model reaches for on its own — Claude Code exposes these as slash commands, autocompleting as `/mcp__servername__promptname` [S4]. Keeping the three separate matters because it keeps the control split honest: tools are what the model can decide to do, prompts are what the user decides to run, and resources are just data sitting there for either to use.

The protocol isn't only server-to-client, either. Clients can offer capabilities back to servers — "**Sampling**: Server-initiated agentic behaviors and recursive LLM interactions," "**Roots**: Server-initiated inquiries into URI or filesystem boundaries to operate in," and "**Elicitation**: Server-initiated requests for additional information from users" [S2] — plus a set of shared utilities: "Configuration, Progress tracking, Cancellation, Error reporting, Logging" [S2]. Sampling in particular is worth flagging: it means a server can ask the client's model to do a piece of reasoning on the server's behalf, inverting the usual model-calls-tool direction. This module treats tools, resources, and prompts as the load-bearing three; sampling, roots, and elicitation are advanced corners most server authors won't touch.

## Host, client, server

MCP names three roles, and the spec is precise about which piece does what: "The protocol uses JSON-RPC 2.0 messages to establish communication between: **Hosts**: LLM applications that initiate connections. **Clients**: Connectors within the host application. **Servers**: Services that provide context and capabilities" [S2]. The **host** is the application you're sitting in front of — Claude Code, Claude Desktop, VS Code. Inside the host, a **client** is the connector object that manages one specific connection to one specific server; a host with three servers configured is running three clients. The **server** is the separate process or remote endpoint that actually knows how to talk to GitHub, or Postgres, or whatever it wraps.

Everything rides on "JSON-RPC 2.0 message format," over "[s]tateful connections," with "[s]erver and client capability negotiation" happening up front [S2] — a client and server exchange, on connect, exactly what each side supports before any tool gets called. That negotiation is why a server can add new tools mid-session and have the client notice: Claude Code "supports MCP `list_changed` notifications, allowing MCP servers to dynamically update their available tools, prompts, and resources without requiring you to disconnect and reconnect" [S4].

## Transports: stdio vs. HTTP

A server has to actually be reachable, and MCP supports two shapes of that — local and remote — that map to two different deployment stories.

**stdio** is a local process. The host spawns the server as a child process and talks to it over standard input/output — no network involved. Claude Code's CLI syntax for this is `claude mcp add [options] <name> -- <command> [args...]`, for example wiring up a local Airtable server with `claude mcp add --env AIRTABLE_API_KEY=YOUR_KEY --transport stdio airtable -- npx -y airtable-mcp-server` [S4]. Because it's a spawned local process, the host can hand it local context for free — Claude Code "sets `CLAUDE_PROJECT_DIR` in the spawned server's environment to the project root, so your server can resolve project-relative paths without depending on the working directory" [S4]. stdio is the natural fit for anything that needs local filesystem access or runs as a thin CLI wrapper.

**HTTP** is a remote server, reached over the network the same way any web API would be. Claude Code's syntax is `claude mcp add --transport http <name> <url>`, for example `claude mcp add --transport http notion https://mcp.notion.com/mcp`, and headers (bearer tokens, etc.) attach the same way: `claude mcp add --transport http secure-api https://api.example.com/mcp --header "Authorization: Bearer your-token"` [S4]. The spec's own name for this transport is `streamable-http`, and Claude Code notes that "configurations copied from server documentation work without modification" because it uses that exact name [S4]. An older SSE-based remote transport still works but is deprecated in favor of streamable HTTP [S4]. For servers that need to push events at the client unprompted rather than just answer requests, Claude Code also supports a WebSocket transport, reasoning that "WebSocket servers hold a persistent bidirectional connection, which suits remote MCP servers that push events to Claude unprompted. Use HTTP instead when your server only responds to requests" [S4].

Remote servers also authenticate over standard mechanisms — Claude Code treats a "401 Unauthorized" or "403 Forbidden" response as a signal that a server needs OAuth, prompting a `claude mcp login <name>` flow [S4].

## Where each harness declares servers

The two platforms this module cares about both configure MCP servers as JSON, but the shape differs in ways worth knowing cold.

**Claude Code** keys servers under `mcpServers` and reads them from one of three scopes, most notably a project-level `.mcp.json` at the repo root that's meant to be checked into version control and shared with a team:

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

A remote entry in the same file looks like:

```json
{
  "type": "streamable-http",
  "url": "https://api.example.com/mcp"
}
```

There are also user-level and local (per-project-but-personal, stored in `~/.claude.json`) scopes [S4]. Values can pull from the environment with `${VAR}` or `${VAR:-default}` expansion, which keeps secrets out of the checked-in file [S4]. Claude Code also adds fields no other client needs: `timeout` (a per-server tool-execution timeout in milliseconds) [S4], and `alwaysLoad` — a flag that exempts a server's tools from Claude Code's deferred-loading behavior, discussed below [S4].

**VS Code / GitHub Copilot** keys servers under `servers` instead — the same idea, a different top-level key — read from `.vscode/mcp.json` for a workspace (shared via source control) or from a user-profile config for personal use [S5]:

```json
{
  "servers": {
    "server-name": {
      // server configuration
    }
  }
}
```

A remote HTTP entry looks like `{"type": "http", "url": "https://api.example.com/mcp"}`, and a local command-based entry looks like `{"command": "npx", "args": ["-y", "@microsoft/mcp-server-playwright"]}` [S5]. VS Code adds its own platform-specific field, `sandboxEnabled`, a boolean that restricts a local server's sandbox on macOS and Linux [S5]. It also offers a `code --add-mcp` CLI shortcut for adding a server from JSON, and can auto-discover configurations already set up in other applications like Claude Desktop [S5].

The mechanical difference — `mcpServers` versus `servers` as the wrapping key — is the one detail most likely to bite someone copying a config from one platform's docs into the other's file.

## Why this is the interoperability layer

Everything else in this module — plugins, skills, agents, hooks — is scoped to one harness's own extension model. MCP is the one piece explicitly designed not to be: a server written once, against the protocol, is the same process or endpoint whether the client connecting to it is Claude Code, Claude Desktop, or VS Code's Copilot Chat. That's the direct payoff of "build once and integrate everywhere" [S1] — a team that stands up an internal Postgres MCP server isn't choosing a Claude-specific integration or a Copilot-specific one; there's one server, and each harness's own config file (`.mcp.json` versus `.vscode/mcp.json`) is just pointing at it. Anthropic frames its own role in exactly these terms, describing MCP as "[d]eveloped by Anthropic engineers but released as community-driven infrastructure" and "a collaborative, open-source initiative rather than proprietary technology," with the explicit initiative including "official specifications with software development kits" alongside the protocol itself [S3]. That SDK layer is where actually building a server lives — this module stays conceptual and treats writing an MCP server as a task for those SDKs, out of scope here beyond knowing they exist.

## Pro vs. amateur

**Amateurs connect every server that looks useful. Pros connect what the task needs.** A connected server's tools aren't free just because the model didn't call them. Claude Code needed to build an entire deferral system to control this cost — "Tool search is enabled by default. MCP tools are deferred rather than loaded into context upfront, and Claude uses a search tool to discover relevant ones when a task needs them. Only the tools Claude actually uses enter context" [S4]. That system exists precisely because, by default, every declared tool description competes for context-window space regardless of whether it's used — the deferral is an optimization layered on top of a real cost, not proof the cost went away.

**Amateurs treat tool results like any other text. Pros treat them as untrusted input.** The specification is blunt about this: "Tool Safety — Tools represent arbitrary code execution and must be treated with appropriate caution; Hosts must obtain explicit user consent before invoking any tool" [S2]. A tool result is data that came from outside the conversation, and nothing stops it from containing instructions phrased to look like the user's. What a connected server returns should be read the way you'd read output from a URL you didn't type yourself.

**Amateurs write a server before checking if one exists. Pros search first.** Part of the original MCP initiative was explicitly "an open-source repository of ready-made servers for platforms like Google Drive, Slack, and GitHub" [S3], and the ecosystem list already spans "Claude and ChatGPT, development tools like Visual Studio Code, Cursor, MCPJam, and many others" [S1] — a working server for a mainstream tool is more often a `claude mcp add` away than a build task.

**Amateurs treat a local stdio server as a black box. Pros know it's just a process running with their own permissions.** A stdio server is a command the host spawns directly on your machine — Claude Code even hands it your project root via `CLAUDE_PROJECT_DIR` so it can resolve paths [S4]. It doesn't run in some separate sandboxed account; it runs as you. Read what a stdio server does before installing it, the same way you'd think twice before running an unfamiliar shell script.

## References

- Model Context Protocol — [Home](https://modelcontextprotocol.io/) [S1]
- Model Context Protocol — [Specification (latest)](https://modelcontextprotocol.io/specification/latest) [S2]
- Anthropic — [Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol) [S3]
- Claude Code Docs — [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp) [S4]
- VS Code Docs — [Use MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) [S5]
