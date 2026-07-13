# 08 · Claude ↔ Copilot compatibility

*Tag legend: `[S#]` refers to this concept's own dump (`research/plugins/08-claude-copilot-compat.md`). `[04-S#]`, `[03-S#]`, `[05-S#]`, `[06-S#]` refer to the numbered source blocks in the sibling dumps for concepts 04 (Skills), 03 (MCP Servers), 05 (Agents), and 06 (Hooks & Commands).*

## MCP: fully portable

MCP is the one layer that travels across harnesses with almost no translation. Claude Code connects to hundreds of external tools via the Model Context Protocol, "an open source standard for AI-tool integrations" [S5]; VS Code Copilot reads server definitions from `.vscode/mcp.json` (workspace) or a user profile, with servers "discovered automatically" so their tools become available in chat [S3]. Both formats are a small JSON object keyed by server name:

```json
// Claude Code — .mcp.json (project scope)
{
  "mcpServers": {
    "github": { "command": "npx", "args": ["-y", "@some/mcp-server"] }
  }
}
```

```json
// VS Code Copilot — .vscode/mcp.json
{
  "servers": {
    "github": { "type": "http", "url": "https://api.githubcopilot.com/mcp" }
  }
}
```

Same server binary, same protocol, two small config files with different top-level keys (`mcpServers` [03-S4] vs. `servers` [S3]). There's effectively nothing to port — you write the server once and register it twice.

## Project instructions: AGENTS.md as the cross-tool standard

AGENTS.md is "a simple, open format for guiding coding agents", governed by the Agentic AI Foundation under the Linux Foundation, with over 60,000 open-source projects using it [S1]. Its supporter list names "Anthropic's Claude (via Claude Agent SDK)" alongside "GitHub Copilot's Coding Agent" [S1] — both sides read the same file. GitHub's own docs confirm the file-precedence order on the Copilot side: repository-wide instructions live at `.github/copilot-instructions.md`, path-specific ones at `.github/instructions/` [S2], and agent instructions come from "`AGENTS.md` files (nearest one in directory tree takes precedence), or single `CLAUDE.md` or `GEMINI.md` in repository root" [S2] — meaning a Copilot-side integration will pick up a CLAUDE.md if that's the only file present.

The practical move for a repo that serves both tools: keep one canonical file (AGENTS.md is the vendor-neutral choice, since it's the one built for portability [S1]) and have the other file include it rather than duplicate it — for example, a one-line CLAUDE.md that says "see AGENTS.md." Don't hand-maintain the same coding standards prose in two files; they drift.

## Skills: both sides on the open standard

This is the layer this note corrects from the plan's placeholder. Agent Skills is "an open standard, used by a range of different AI systems" for packaging "instructions, examples and guidelines" as a `SKILL.md` file with YAML frontmatter (`name`, `description` required) [S6][S7]. GitHub Copilot's support is not partial — it's one of the platform's seven primary customization approaches, described as "[t]each repeatable capabilities bundled with scripts and examples that load automatically when matching tasks" and explicitly "documented as a feature" [S4]. Storage locations even overlap by convention: project-level skills can live in `.github/skills`, `.claude/skills`, or `.agents/skills`, and personal-level skills in `~/.copilot/skills` or `~/.agents/skills` [S6]. Support spans "Copilot cloud agent, Copilot code review, the GitHub Copilot CLI, the GitHub Copilot app, and agent mode in Visual Studio Code and JetBrains IDEs" [S6].

On the Claude side, "Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, which works across multiple AI tools" — and Claude Code "extends the standard with additional features like invocation control, subagent execution, and dynamic context injection" [04-S1]. Anthropic published Agent Skills "as an open standard for cross-platform portability" in December 2025, "enabling broader ecosystem integration across Claude.ai, Claude Code, and the Claude Agent SDK" [04-S3]. So both harnesses implement the same spec: a `SKILL.md` with `name`/`description` frontmatter that either side can load, though Claude Code's frontmatter has more control fields (`allowed-tools`, `context: fork`, `disable-model-invocation`, and others) that a Copilot-authored skill won't use [04-S1]. A skill written to the base spec — name, description, Markdown body — moves between the two with no changes; a skill leaning on Claude Code's extended fields needs those stripped or reimplemented for Copilot.

(One caveat about the dump itself: an earlier WebSearch-aggregated line in this concept's research summarized SKILL.md support as "not explicitly documented in fetched sources" for Claude — but that line was drawn from GitHub's own docs describing *GitHub's* implementation of the spec, not a statement about Claude Code, whose own documentation covers SKILL.md in depth [04-S1][04-S5]. That line is not repeated here.)

## Agents: same concept, different files

Claude Code subagents are "specialized AI assistants" defined as YAML frontmatter plus a Markdown system prompt, with `name` and `description` as the only required fields and optional fields for `tools`, `model`, `mcpServers`, `hooks`, and more [05-S1]. Copilot's equivalent — custom agents, "previously known as custom chat modes" — are `.agent.md` files living in `.github/agents` (workspace) or `~/.copilot/agents` (user), with frontmatter fields `description`, `tools`, `model`, `handoffs`, and `user-invocable` [05-S3]. The concept is identical on both sides: a prompt plus a tool allowlist plus a model choice, scoped to a focused role. What differs is the file format and the depth of the surrounding feature set — Claude Code's subagents add persistent cross-session memory, worktree isolation, and per-subagent hooks, none of which appear in the Copilot custom-agent spec [05-S1] (the cross-source comparison in that dump lists "Not mentioned" for isolation, memory, and hooks on the Copilot side [05-S1]). Translating a subagent to a custom agent (or back) is mechanical for the shared fields — copy the prompt body, map `tools`→`tools`, `model`→`model` — and lossy for the Claude-specific extras.

## Hooks and slash commands: the least portable layer

Claude Code's hook system is the deepest of the two: a full lifecycle event catalog — `SessionStart`, `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStart`, and 20-plus others — with five execution types (command, HTTP, MCP tool, prompt, agent) and a structured JSON exit-code contract [06-S1][06-S2]. Copilot does have a hooks feature, but it's documented as one line among VS Code's seven customization approaches: "Run your own commands automatically at key points in the agent's loop, such as formatting after every edit" [S4] — no published event catalog or execution-type breakdown accompanies that description in the fetched docs. So hooks are partially portable at best: the concept of running a command at a point in the agent loop crosses over, but Claude Code's granular event names and execution types have no documented one-to-one match on the Copilot side [S4][06-S1].

Slash commands are closer to portable than hooks. Claude Code's `commands/*.md` files (now merged into the skills system) are prompt templates invoked as `/name` [06-S3]; Copilot's "Prompt Files" serve the same role — "[s]ave a reusable prompt that you invoke as a slash command, such as `/scaffold-component` or `/prep-pr`" — stored as `*.prompt.md` [06-S4]. Same idea, different file extension and location; a straightforward one-for-one rewrite.

## A portability strategy

The pattern across every component above is the same: portability tracks how open the underlying spec is, not which vendor built the harness. MCP (an open protocol [03-S1]) and Agent Skills (an open standard [S6]) are fully or near-fully portable. AGENTS.md is portable by construction — it's a shared file both harnesses read [S1]. Agents are portable in concept but need a file-format translation. Hooks and vendor-specific slash-command extras are the least portable, because nothing standardizes them across vendors yet.

The practical strategy: put as much of an integration's knowledge as possible into the portable layers — one MCP server, one AGENTS.md, skills written to the base Agent Skills spec — and keep the harness-specific layer (hooks, custom-agent frontmatter extras) as a thin wrapper on top. A team that does this can switch primary assistants, or run both side by side, with the wrapper being the only thing that needs rewriting.

## Pro vs. amateur

**Amateurs design for one harness and port later. Pros design for the portable layers first, and treat vendor-specific glue (hooks, extended agent frontmatter) as the last thing they add** — it's also the first thing that breaks when the other team's assistant changes.

**Amateurs copy the same coding standards into both CLAUDE.md and AGENTS.md. Pros pick one canonical file and have the other include it** [S1][S2] — duplicated instructions are duplicated maintenance, and they drift apart the moment one gets edited without the other.

**Amateurs assume "Copilot supports Agent Skills" or "Claude doesn't support X" from a single search result and move on. Pros verify against the current docs before shipping the claim** — this layer shifts quarterly, support tables in this note reflect the fetch date recorded in the research dump, and at least one WebSearch-aggregated claim in this concept's own dump turned out to describe GitHub's docs about Copilot, not a statement about Claude at all.

**Amateurs think cross-tool support means rewriting integrations per vendor. Pros know a team standardizing on MCP + AGENTS.md + base-spec Agent Skills can switch assistants with near-zero rework** — those three layers are where the actual behavior lives; everything vendor-specific sits on top as a wrapper.

## References

- [agents.md](https://agents.md/) — AGENTS.md open format spec [S1]
- GitHub Docs — [Adding repository custom instructions for GitHub Copilot](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot) [S2]
- VS Code Docs — [MCP servers in VS Code](https://code.visualstudio.com/docs/copilot/chat/mcp-servers) [S3]
- VS Code Docs — [Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization) [S4]
- Claude Code Docs — [Connect Claude Code to tools via MCP](https://code.claude.com/docs/en/mcp) [S5]
- GitHub Docs — [About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) [S6]
- GitHub Docs — [Add skills to your cloud agent](https://docs.github.com/en/copilot/how-tos/copilot-on-github/customize-copilot/customize-cloud-agent/add-skills) [S7]
- WebSearch aggregation via [github/awesome-copilot](https://github.com/github/awesome-copilot) [S8]

Cross-cited from sibling dumps: `research/plugins/04-skills.md` [04-S1, 04-S3, 04-S5], `research/plugins/03-mcp-servers.md` [03-S1, 03-S4], `research/plugins/05-agents.md` [05-S1, 05-S3], `research/plugins/06-hooks-and-commands.md` [06-S1, 06-S2, 06-S3, 06-S4].
