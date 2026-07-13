# 05 · Agents & subagents (deep dive)

## A markdown file with a job description

A custom agent — Claude Code calls it a **subagent** — is not a new kind of model or a different piece of software. It's a text file. "Subagents are specialized AI assistants that handle specific types of tasks" [S1], and the mechanism behind that sentence is almost aggressively simple: **YAML frontmatter followed by Markdown body** [S1]. The dump's canonical example:

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

Four frontmatter fields carry the entire configuration surface most subagents need, and two of them are load-bearing enough to be required: `name`, described as "Unique identifier using lowercase letters and hyphens" [S1], and `description`, which is literally "When Claude should delegate to this subagent" [S1] — nothing about the subagent's own behavior, purely a trigger condition read by something else. The body underneath the frontmatter is the subagent's system prompt: "The frontmatter defines the subagent's metadata and configuration. The body becomes the system prompt that guides the subagent's behavior" [S1].

Beyond `name` and `description`, the frontmatter table lists a long tail of optional fields, and a few reward close reading. `tools` lists which tools the subagent may use and, if omitted, "Inherits all tools if omitted" [S1] — an all-or-nothing default that authoring craft (below) argues against relying on. `disallowedTools` does the inverse: "Tools to deny, removed from inherited or specified list" [S1]. `model` picks the model this subagent runs on: "`sonnet`, `opus`, `haiku`, `fable`, a full model ID (for example, `claude-opus-4-8`), or `inherit`. Defaults to `inherit`" [S1]. `permissionMode` controls how much the subagent can do without asking: "`default`, `acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `plan`, or `manual` as an alias for `default`" [S1]. `maxTurns` caps runaway agentic loops: "Maximum number of agentic turns before the subagent stops" [S1]. `skills` preloads full skill bodies rather than just their descriptions — "The full skill content is injected, not only the description" [S1] — which is a meaningfully different loading behavior from how skills normally work in a main session. `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, and `initialPrompt` round out the table, giving a single subagent its own MCP servers, its own lifecycle hooks, cross-session memory, background-vs-foreground execution, a reasoning-effort override, a worktree-isolated filesystem, a display color, and an auto-submitted first prompt, respectively [S1]. None of these are required. A subagent with only `name` and `description` and a one-paragraph body is a complete, legal subagent.

Files live in a small number of discoverable locations, checked in priority order: "Managed settings" (org-wide, highest priority), the `--agents` CLI flag (current session), `.claude/agents/` (current project), `~/.claude/agents/` (all of a user's projects), and a plugin's own `agents/` directory (lowest priority) [S1]. Within a project, discovery walks upward: "Project subagents are discovered by walking up from the current working directory, so every `.claude/agents/` between there and the repository root is scanned" [S1]. Subfolders are allowed for organization, and don't affect how a subagent is addressed: "Claude Code scans `.claude/agents/` and `~/.claude/agents/` recursively, so you can organize definitions into subfolders such as `agents/review/` or `agents/research/`. The subdirectory path doesn't affect how a subagent is identified or invoked, because identity comes only from the `name` frontmatter field" [S1].

VS Code's Copilot has converged on the same shape from a different direction. What it calls **custom agents** were "previously known as custom chat modes. The functionality remains the same, but the terminology has been updated" [S3]. They're also markdown files with YAML frontmatter, just with a different extension and home directory: `.agent.md` files, living in a workspace's `.github/agents` folder (or, for Claude-format agents specifically, `.claude/agents` [S3]) or in a user-level `~/.copilot/agents` [S3]. "Custom agents consist of a set of instructions and tools that are applied when you switch to that agent" [S3] — instructions plus a tool list plus a model choice is exactly the Claude Code shape, arrived at independently.

## Why delegate at all

Three separate benefits fall out of running a subagent instead of just doing the work inline, and they're worth naming separately because they're not the same benefit.

**Fresh context, kept clean.** "Each subagent invocation creates a new instance with fresh context" [S1], and that instance's starting context is deliberately narrow. For a standard (non-fork) subagent it consists of: its own system prompt plus environment details Claude Code appends — explicitly "not the full Claude Code system prompt" [S1]; the task message, meaning "the delegation prompt Claude writes when it hands off the work" [S1]; the memory hierarchy (CLAUDE.md, project rules, `CLAUDE.local.md`, managed policy — though "[t]he built-in Explore and Plan agents skip this" [S1]); a git-status snapshot taken at the start of the parent session [S1]; and the full content of any skills named in its `skills` field [S1]. What's conspicuously absent from that list is the parent conversation's transcript. The orchestrator's own context window never grows by the subagent's exploration — it only grows by whatever the subagent decides to report back. That's the whole value proposition of delegation for context management: expensive, noisy work (reading fifteen files to find one function, running a build twenty times to isolate a flaky test) happens in a context window that gets thrown away, and only the distilled conclusion crosses back into the conversation that matters.

**Restricted tool sets as a design choice, not an afterthought.** The `tools` and `disallowedTools` fields exist because a subagent's default — inheriting everything the parent session can do [S1] — is often the wrong default for the job. A subagent whose entire purpose is reviewing code for quality doesn't need `Write` or `Edit`; giving it only `Read, Glob, Grep`, as the dump's own example does [S1], isn't a convenience, it's a hard guarantee that a review pass cannot silently turn into an edit pass no matter what the model decides mid-task.

**Cheaper models for mechanical work.** Because `model` is a per-subagent field independent of whatever model the parent session runs on [S1], a project can dispatch a scan-and-summarize subagent on a fast, cheap model while reserving the strongest available model for the orchestrator's own architectural judgment calls — matching model cost to task difficulty instead of paying frontier-model prices for grep-shaped work.

## The dispatch/return contract

The defining constraint of subagent work is one sentence: a subagent "works independently and returns results" [S1]. Unpack what that means operationally. The subagent receives its task message once, at the start [S1]. It cannot ask the parent a clarifying question mid-task — there is no back-and-forth channel; `AskUserQuestion` is explicitly one of the tools that "depend on the main conversation's UI or session state and aren't available to subagents, even when listed in the `tools` field" [S1], alongside `EnterPlanMode`, `ExitPlanMode`, `ScheduleWakeup`, and `WaitForMcpServers` [S1]. It works alone with whatever tools its frontmatter allows, and it returns exactly one final message. Nothing about the shape of a subagent invocation supports checking back in with the user partway through and continuing afterward.

That one constraint is generative — it explains why authoring a good dispatch prompt is the actual skill here, not authoring a good subagent file. If a subagent can't ask which file was meant, or whether the tests need updating too, mid-flight, every ambiguity the dispatcher fails to resolve up front either gets guessed at or silently dropped. The subagent file defines a capability; the dispatch prompt defines a specific unit of work, and it has exactly one shot to be complete.

## Authoring craft

The `description` field is not documentation for a human skimming a directory of agent files — it's read by the orchestrating model deciding, in the moment, whether this task matches this subagent. "Claude uses each subagent's description to decide when to delegate tasks" [S1], and automatic delegation works from three inputs together: "the task description in your request, the `description` field in subagent configurations, and current context" [S1]. This is the same description-is-the-API discipline that governs skills (Concept 04) — a vague description simply never gets selected, however good the body behind it is.

The system prompt (the body under the frontmatter) does different work: it sets the subagent's role, its constraints, and — critically for anything downstream that consumes the result programmatically or textually — its output format, since there's exactly one return message and no follow-up turn to fix a malformed one.

Tool allowlists double as safety rails, not just scope-narrowing. Listing `tools` explicitly, or trimming with `disallowedTools`, means a reviewer subagent literally cannot call `Write` even if its own reasoning drifts toward fixing the problem itself — the constraint sits below the model's judgment, not inside a paragraph of instructions hoping the model honors it.

Model choice per agent follows task difficulty: a fast, cheap model for mechanical search-and-report work; a strong model reserved for subagents making architectural or security judgment calls. The `model` field's `inherit` default [S1] means this has to be set deliberately — an unset subagent silently runs whatever model the parent session happens to be using, which may be more (or less) than the task needs.

## Orchestration patterns

The dump distinguishes several dispatch shapes, and Anthropic's own framing gives the underlying reason they differ.

**Orchestrator-workers.** "A central LLM dynamically breaks down tasks, delegates them to worker LLMs, and synthesizes their results" [S2]. "[T]his approach suits situations where subtasks cannot be predetermined" [S2] — the orchestrator decides the breakdown at runtime rather than a human hardcoding the plan in advance.

**Parallel fan-out** for independent work. Claude Code's own description: "For independent investigations, spawn multiple subagents to work simultaneously... Each subagent explores its area independently, then Claude synthesizes the findings" [S1]. Anthropic's research names two flavors of the same idea under Parallelization Variations: **sectioning**, "Breaking a task into independent subtasks run in parallel" [S2], and **voting**, "Running the same task multiple times to get diverse outputs" [S2] — fan-out for coverage versus fan-out for redundancy, respectively.

**Pipeline / sequential chaining** for staged work, where output feeds forward: "For multi-step workflows, ask Claude to use subagents in sequence. Each subagent completes its task and returns results to Claude, which then passes relevant context to the next subagent" [S1].

**Nested subagents**, newer and narrower: "a subagent can spawn its own subagents. Use this when a delegated task itself splits into parallel subtasks, such as a reviewer subagent that dispatches a verifier per finding, so the intermediate output never reaches your main conversation" [S1] — the same context-isolation logic as top-level delegation, applied one layer deeper.

**Foreground vs. background** is an execution-scheduling choice layered on top of any of the above: "subagents run in the background by default. Claude runs a subagent in the foreground when it needs the result before continuing" [S1].

Underneath all of it, Anthropic's broader guidance is a warning against over-orchestrating: "Most successful implementations use simple, composable patterns rather than complex frameworks" [S2], with three recommended principles — "Maintain simplicity in design", "Prioritize transparency via explicit planning steps", and "Carefully craft tool documentation and testing" [S2] — and an explicit preference for "[s]tarting simple and adding complexity only when performance measurably improves" [S2].

## The Copilot side

GitHub's ecosystem has two distinct answers, worth telling apart. VS Code's custom agents (above) are the same-session equivalent of Claude Code subagents — a `.agent.md` file with frontmatter fields `description` (shown as chat placeholder text), `tools`, `model` (single model or a prioritized array), `handoffs`, `user-invocable` (dropdown visibility), and `agents` (lists available subagents, `*` for all) [S3]. Its distinguishing feature is `handoffs`: "Handoffs create sequential workflows between agents" [S3]. "[E]ach handoff specifies: target agent identifier, display label, optional pre-filled prompt, and auto-submit flag" [S3] — a more structured, GUI-oriented version of Claude Code's sequential chaining.

The **Copilot coding agent** is a different tier entirely — not an in-editor subagent but a standalone cloud agent that can "research a repository, plan and make code changes, and create pull requests for you to review" [S4]. It "[c]an operate on schedules or respond to events through automations" [S4] and "[s]upports programmatic control via REST API" [S4], with integration across GitHub itself, IDEs (VS Code, JetBrains, Eclipse, Visual Studio), chat tools (Slack, Teams), project trackers (Jira, Linear, Azure Boards), and "Model Context Protocol (MCP)" [S4]. It also supports model choice: "In supported entrypoints, when starting a task with Copilot cloud agent, you can select the model used" [S4]. Where a VS Code custom agent is a delegation target inside one editor session, the Copilot coding agent is closer to a fire-and-forget teammate that opens its own pull request.

## Failure modes

Three ways subagent delegation goes wrong recur across the dump and follow directly from the dispatch/return contract above.

**Vague dispatch prompts produce wrong work, and there's no recovery turn.** Because the subagent can't ask a follow-up question, an underspecified task message doesn't produce a clarifying question back — it produces a confident, complete answer to the wrong question.

**Giant, do-everything agents underperform focused ones.** A subagent with an unrestricted tool list and a sprawling system prompt trying to cover code review, testing, and documentation at once loses the benefit tool allowlists were supposed to buy — nothing stops it from doing the wrong kind of work, because nothing was disallowed.

**Agents re-deriving context the orchestrator already had.** Because a subagent's context starts narrow by design [S1], a dispatch prompt that omits information the orchestrator already gathered forces the subagent to re-discover it — burning tool calls and tokens reconstructing facts that were sitting right there in the parent conversation the whole time.

## Pro vs. amateur

Amateurs treat the subagent file as the hard part and the dispatch prompt as an afterthought; pros know it's the reverse. The subagent file is reusable infrastructure written once — the dispatch prompt is a fresh work order every time, and it's the dispatch prompt, not the file, that determines whether a given invocation succeeds. Given that a subagent "works independently and returns results" [S1] with no mid-task clarification available, pros write dispatch prompts like work orders: explicit inputs, an explicit deliverable, explicit constraints — everything a competent stranger would need with no chance to ask a follow-up.

Amateurs trust the system prompt to keep a subagent in its lane; pros restrict tools instead. "Read, Glob, Grep" in the dump's own reviewer example [S1] isn't a suggestion the model might drift from mid-task — it's a wall the model cannot get past regardless of what it decides to do, and that distinction between being asked not to and being unable to is the entire value of the `tools` field.

Amateurs assume a dispatched result was seen; pros know it has to be relayed. A subagent's return value lands in the orchestrator's context, not automatically in front of the user — treating dispatching an agent as equivalent to the task being done and the user knowing the outcome drops the last, cheapest step of the whole delegation.

And amateurs delegate reflexively; pros know when not to. A task that leans on context already sitting in the current conversation — earlier decisions, half-formed preferences, the specific back-and-forth that got the task to this point — is cheaper to just do inline than to compress into a self-contained dispatch prompt and re-derive on the other side of a fresh context window.

## References

- Claude Code Docs — [Create custom subagents](https://code.claude.com/docs/en/sub-agents) [S1]
- Anthropic Research — [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) [S2]
- VS Code Docs — [Chat modes in VS Code Copilot](https://code.visualstudio.com/docs/copilot/chat/chat-modes) [S3]
- GitHub Docs — [Copilot coding agent](https://docs.github.com/en/copilot/using-github-copilot/coding-agent) [S4]
