# Research: Agents & Subagents — Module A1 Concept 05

Deep research into agent architectures, delegation patterns, and technical specifications from Claude Code, Anthropic, VS Code Copilot, and GitHub Copilot.

---

## [S1] Create custom subagents — Claude Code Docs
- **URL:** https://code.claude.com/docs/en/sub-agents
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

#### Core Definition & Concepts
- "Subagents are specialized AI assistants that handle specific types of tasks."
- "Each subagent runs in its own context window with a custom system prompt, specific tool access, and independent permissions."
- "When Claude encounters a task that matches a subagent's description, it delegates to that subagent, which works independently and returns results."
- "Subagents work within a single session. To run many independent sessions in parallel and monitor them from one place, see [background agents](/en/agent-view). For sessions that communicate with each other, see [agent teams](/en/agent-teams)."

#### Subagent File Format
Subagent files use **YAML frontmatter followed by Markdown body**:
```markdown
---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide
specific, actionable feedback on quality, security, and best practices.
```

#### Supported Frontmatter Fields
| Field             | Required | Description                                                                                                                                                                                                                                                |
| :---------------- | :------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`            | Yes      | Unique identifier using lowercase letters and hyphens. [Hooks](/en/hooks#subagentstart) receive this value as `agent_type`.                                                                                                                             |
| `description`     | Yes      | When Claude should delegate to this subagent                                                                                                                                                                                                             |
| `tools`           | No       | [Tools](#available-tools) the subagent can use. Inherits all tools if omitted. To preload Skills into context, use the `skills` field rather than listing `Skill` here                                                                                   |
| `disallowedTools` | No       | Tools to deny, removed from inherited or specified list                                                                                                                                                                                                  |
| `model`           | No       | [Model](#choose-a-model) to use: `sonnet`, `opus`, `haiku`, `fable`, a full model ID (for example, `claude-opus-4-8`), or `inherit`. Defaults to `inherit`                                                                                               |
| `permissionMode`  | No       | [Permission mode](#permission-modes): `default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, or `manual` as an alias for `default`.                                                                                                  |
| `maxTurns`        | No       | Maximum number of agentic turns before the subagent stops                                                                                                                                                                                                |
| `skills`          | No       | [Skills](/en/skills) to preload into the subagent's context at startup. The full skill content is injected, not only the description.                                                                                                                  |
| `mcpServers`      | No       | [MCP servers](/en/mcp) available to this subagent. Each entry is either a server name referencing an already-configured server (e.g., `"slack"`) or an inline definition with the server name as key and a full MCP server config as value.             |
| `hooks`           | No       | [Lifecycle hooks](#define-hooks-for-subagents) scoped to this subagent.                                                                                                                                                                                  |
| `memory`          | No       | [Persistent memory scope](#enable-persistent-memory): `user`, `project`, or `local`. Enables cross-session learning                                                                                                                                      |
| `background`      | No       | Set to `true` to always run this subagent as a [background task](#run-subagents-in-foreground-or-background), even when Claude needs its result right away. As of v2.1.198 it runs subagents in the background by default                               |
| `effort`          | No       | Effort level when this subagent is active. Overrides the session effort level. Options: `low`, `medium`, `high`, `xhigh`, `max`; available levels depend on the model                                                                                   |
| `isolation`       | No       | Set to `worktree` to run the subagent in a temporary [git worktree](/en/worktrees), giving it an isolated copy of the repository branched by default from your [default branch](/en/worktrees#choose-the-base-branch) rather than the parent session's `HEAD`. |
| `color`           | No       | Display color for the subagent in the task list and transcript. Accepts `red`, `blue`, `green`, `yellow`, `purple`, `orange`, `pink`, or `cyan`                                                                                                          |
| `initialPrompt`   | No       | Auto-submitted as the first user turn when this agent runs as the main session agent (via `--agent` or the `agent` setting). [Commands](/en/commands) and [skills](/en/skills) are processed.                                                          |

#### Scope & Discovery
- **Managed settings**: Organization-wide (Priority 1, highest)
- **`--agents` CLI flag**: Current session (Priority 2)
- **`.claude/agents/`**: Current project (Priority 3)
- **`~/.claude/agents/`**: All user's projects (Priority 4)
- **Plugin's `agents/` directory**: Where plugin is enabled (Priority 5, lowest)

- "Claude Code scans `.claude/agents/` and `~/.claude/agents/` recursively, so you can organize definitions into subfolders such as `agents/review/` or `agents/research/`. The subdirectory path doesn't affect how a subagent is identified or invoked, because identity comes only from the `name` frontmatter field."
- "Project subagents are discovered by walking up from the current working directory, so every `.claude/agents/` between there and the repository root is scanned."

#### Delegation & Context Isolation
- "The frontmatter defines the subagent's metadata and configuration. The body becomes the system prompt that guides the subagent's behavior. Subagents receive only this system prompt plus basic environment details like the working directory, not the full Claude Code system prompt."
- "Each subagent invocation creates a new instance with fresh context."
- **Non-fork subagent initial context contains:**
  - "System prompt: the agent's own prompt plus environment details that Claude Code appends, not the full Claude Code system prompt."
  - "Task message: the delegation prompt Claude writes when it hands off the work."
  - "CLAUDE.md and memory: every level of the [memory hierarchy] the main conversation loads, including `~/.claude/CLAUDE.md`, project rules, `CLAUDE.local.md`, and managed policy files. The built-in Explore and Plan agents skip this."
  - "Git status: a snapshot taken at the start of the parent session."
  - "Preloaded skills: full content of any skill named in the agent's [`skills` field]."

#### Tool Restrictions
- Subagents inherit "the [internal tools](/en/tools-reference) and MCP tools available in the main conversation by default."
- "The following tools depend on the main conversation's UI or session state and aren't available to subagents, even when listed in the `tools` field: `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode`, `ScheduleWakeup`, `WaitForMcpServers`"

#### Built-in Subagents
- **Explore**: "A fast, read-only agent optimized for searching and analyzing codebases." Uses: model inherited (capped at Opus on Claude API), tools: read-only, purpose: file discovery and code search.
- **Plan**: "A research agent used during plan mode to gather context before presenting a plan." Uses: model inherited, tools: read-only, purpose: codebase research for planning.
- **General-purpose**: "A capable agent for complex, multi-step tasks that require both exploration and action." Uses: model inherited, tools: all tools, purpose: complex research, multi-step operations.

#### Orchestration Patterns
- **Automatic delegation**: "Claude automatically delegates tasks based on the task description in your request, the `description` field in subagent configurations, and current context."
- **Sequential chaining**: "For multi-step workflows, ask Claude to use subagents in sequence. Each subagent completes its task and returns results to Claude, which then passes relevant context to the next subagent."
- **Parallel research**: "For independent investigations, spawn multiple subagents to work simultaneously... Each subagent explores its area independently, then Claude synthesizes the findings."
- **Nested subagents**: "As of Claude Code v2.1.172, a subagent can spawn its own subagents. Use this when a delegated task itself splits into parallel subtasks, such as a reviewer subagent that dispatches a verifier per finding, so the intermediate output never reaches your main conversation."
- **Foreground vs. Background**: "As of v2.1.198, subagents run in the background by default. Claude runs a subagent in the foreground when it needs the result before continuing."

#### Hooks
- "Define hooks directly in the subagent's markdown file. These hooks only run while that specific subagent is active and are cleaned up when it finishes."
- **Common hook events for subagents:**
  - `PreToolUse`: Before the subagent uses a tool
  - `PostToolUse`: After the subagent uses a tool
  - `Stop`: When the subagent finishes (converted to `SubagentStop` at runtime)
- **Project-level hook events:**
  - `SubagentStart`: When a subagent begins execution
  - `SubagentStop`: When a subagent completes

#### Invocation Methods
- **Natural language**: "For natural language, there's no special syntax. Name the subagent and Claude typically delegates"
- **@-mention**: "Type `@` and pick the subagent from the typeahead, the same way you @-mention files... Your full message still goes to Claude, which writes the subagent's task prompt based on what you asked. The @-mention controls which subagent Claude invokes, not what prompt it receives."
- **Session-wide**: "Pass [`--agent <name>`](/en/cli-reference) to start a session where the main thread itself takes on that subagent's system prompt, tool restrictions, and model"
- **CLI flag definition**: "The `--agents` flag accepts JSON with the same [frontmatter](#supported-frontmatter-fields) fields as file-based subagents: `description`, `prompt`, `tools`, `disallowedTools`, `model`, `permissionMode`, `mcpServers`, `hooks`, `maxTurns`, `skills`, `initialPrompt`, `memory`, `effort`, `background`, `isolation`, and `color`. Use `prompt` for the system prompt, equivalent to the markdown body in file-based subagents."

#### Persistent Memory
- "The subagent's system prompt includes instructions for reading and writing to the memory directory."
- "The subagent's system prompt also includes the first 200 lines or 25KB of `MEMORY.md` in the memory directory, whichever comes first, with instructions to curate `MEMORY.md` if it exceeds that limit."
- Memory scopes:
  - `user`: `~/.claude/agent-memory/<name-of-agent>/`
  - `project`: `.claude/agent-memory/<name-of-agent>/`
  - `local`: `.claude/agent-memory-local/<name-of-agent>/`

---

## [S2] Building Effective Agents — Anthropic Research
- **URL:** https://www.anthropic.com/research/building-effective-agents
- **Fetched:** 2026-07-12
- **Type:** research

### Extracted

#### Core Architecture Distinction
- **Workflows**: "LLMs and tools orchestrated through predefined code paths"
- **Agents**: "LLMs dynamically direct their own processes and tool usage"

#### Delegation & Orchestration Patterns

**Orchestrator-Workers Pattern:**
- "A central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results."
- "This approach suits situations where subtasks cannot be predetermined."

**Parallelization Variations:**
- **Sectioning**: "Breaking a task into independent subtasks run in parallel"
- **Voting**: "Running the same task multiple times to get diverse outputs"

#### Agent Autonomy
- Agents "plan and operate independently" after receiving initial direction
- "Capacity to pause for human feedback at checkpoints or when encountering blockers"

#### Implementation Philosophy
- "Most successful implementations use simple, composable patterns rather than complex frameworks."
- Three core principles recommended:
  1. "Maintain simplicity in design"
  2. "Prioritize transparency via explicit planning steps"
  3. "Carefully craft tool documentation and testing"

#### Design Guidance
- "Rather than complex frameworks" — emphasizes pragmatism over over-engineering
- "Starting simple and adding complexity only when performance measurably improves"

---

## [S3] Chat modes in VS Code Copilot
- **URL:** https://code.visualstudio.com/docs/copilot/chat/chat-modes
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

#### Custom Agents Overview
- "Custom agents consist of a set of instructions and tools that are applied when you switch to that agent."
- "Custom agents were previously known as custom chat modes. The functionality remains the same, but the terminology has been updated."

#### File Format & Location
- Format: **`.agent.md` Markdown files**
- Workspace location: **`.github/agents` folder** (or `.claude/agents` for Claude-format agents)
- User-level location: **`~/.copilot/agents`**

#### YAML Frontmatter Fields
- **`description`**: Brief summary shown as chat placeholder text
- **`tools`**: Available tool names for the agent
- **`model`**: Specifies which AI model to use (single or prioritized array)
- **`handoffs`**: Guided workflow transitions between agents
- **`user-invocable`**: Controls dropdown visibility (boolean)
- **`agents`**: Lists available subagents (use `*` for all)

#### Handoffs Feature
- "Handoffs create sequential workflows between agents."
- "Each handoff specifies: target agent identifier, display label, optional pre-filled prompt, and auto-submit flag."

---

## [S4] Copilot coding agent — GitHub Docs
- **URL:** https://docs.github.com/en/copilot/using-github-copilot/coding-agent
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

#### Core Capabilities
- "Research a repository, plan and make code changes, and create pull requests for you to review."

#### Execution Modes
- "Can operate on schedules or respond to events through automations"
- "Supports programmatic control via REST API"
- "Compatible with multiple interfaces (IDE, CLI, API, MCP)"

#### Model Selection
- "In supported entrypoints, when starting a task with Copilot cloud agent, you can select the model used"

#### Custom Development
- "Enables specialized agents with tailored expertise for specific development tasks"

#### Integration Points
GitHub Copilot cloud agent integrates across:
- GitHub (web and Mobile app)
- IDEs (VS Code, JetBrains, Eclipse, Visual Studio)
- Communication tools (Slack, Teams)
- Project management (Jira, Linear, Azure Boards)
- Development tools (GitHub CLI, Raycast)
- Protocol support: "Model Context Protocol (MCP)"

#### Scope of Automation
- Can "research a repository, plan and make code changes, and create pull requests for you to review"
- Supports event-driven automation and scheduling

---

## Cross-Source Comparison: Subagent Configuration

| Aspect | Claude Code | VS Code Copilot |
| :--- | :--- | :--- |
| **File format** | `.md` with YAML frontmatter | `.agent.md` with YAML frontmatter |
| **Location** | `.claude/agents/`, `~/.claude/agents/`, or plugin scopes | `.github/agents/`, `~/.copilot/agents/` |
| **Required fields** | `name`, `description` | Not explicitly specified |
| **Model field** | Yes (`sonnet`, `opus`, `haiku`, `fable`, full ID, `inherit`) | Yes (single or array) |
| **Tools field** | Yes, with allowlist/denylist (`tools`/`disallowedTools`) | Yes, basic list |
| **Isolation** | `isolation: worktree` for git worktree | Not mentioned |
| **Memory** | `memory`: `user`/`project`/`local` persistent memory | Not mentioned |
| **Hooks** | `PreToolUse`, `PostToolUse`, `Stop` / `SubagentStart`, `SubagentStop` | Not mentioned |
| **Handoffs** | Not mentioned | `handoffs` for sequential workflows |
| **Parallelization** | Multiple subagents spawn independently; depth limit (5) | Not explicitly detailed |
| **MCP support** | `mcpServers` field for inline or referenced servers | Native support mentioned |
| **Nested agents** | Yes, up to depth 5 | Not mentioned |

---

## Key Technical Insights

### Delegation Decision-Making
- Claude Code: "Claude uses each subagent's description to decide when to delegate tasks."
- Anthropic: Emphasizes "simple, composable patterns rather than complex frameworks"
- Both stress clarity in agent descriptions and tool definitions

### Context Management
- **Isolation model**: Fresh context per invocation (except forks); summary returns to parent
- **Memory retention**: Claude Code supports persistent agent memory; others not mentioned
- **Tool inheritance**: Subagents inherit parent session's tools by default with override options

### Orchestration Maturity
- **Claude Code**: Mature patterns — parallel, sequential, nested, background/foreground, depth limits
- **Anthropic**: Research emphasizes orchestrator-workers pattern, sectioning, voting
- **GitHub Copilot**: Event-driven, schedule-based, REST API, enterprise integration
- **VS Code**: Handoff-based sequential workflows

### Security & Control
- Claude Code: Permission modes (`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`)
- Claude Code: Managed settings for org-wide agent deployment
- Anthropic: Emphasizes explicit tool documentation and testing as security measures

