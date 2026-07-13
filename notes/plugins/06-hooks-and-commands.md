# 06 · Hooks & commands

## Suggestions vs. guarantees

Every plugin mechanism covered so far in this module — skills, MCP servers, agent files — works by putting more information in front of the model and letting it decide what to do with that information. Hooks are different. A **hook** is a piece of deterministic code the harness itself runs at a fixed point in the agent loop, with no model judgment involved. You are not asking the model to behave a certain way; you are writing code that runs whether the model wants it to or not.

That distinction is the whole concept. Hooks are configured as `"type": "command"` (shell script), `"type": "http"` (POST to URL endpoint), `"type": "mcp_tool"` (call tool on connected MCP server), `"type": "prompt"` (single-turn LLM evaluation), or `"type": "agent"` (multi-turn verification with tool access) [S1]. Most of the classic uses are the `command` type — plain shell — precisely because the whole point is to remove judgment from the step, not add another layer of it.

## The event catalog

The hook system exposes a large, named catalog of lifecycle points. Per-session events include `SessionStart`, `Setup`, `SessionEnd`; per-turn events include `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `StopFailure`; agentic-loop events include `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`; there are also subagent and task events, file and config events, compaction events, MCP events, and worktree events [S1]. The findings summary counts this at "27 distinct event types covering entire Claude Code lifecycle" [S1].

Each event fires at a specific, documented trigger point — for example `PreToolUse` fires "Before tool call executes (can block)", `PostToolUse` fires "After tool call succeeds", and `Stop` fires when "Claude finishes responding" [S2]. Knowing the trigger point is what tells you whether a hook can still change the outcome: by the time `PostToolUse` fires, the tool has already run.

## Block, allow, inject

Not every event can do the same things. The capability catalog is explicit about which events support which actions [S1]:

- **Inspect** — every event can read JSON input describing what's happening.
- **Block** — a defined subset of events (`PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `ConfigChange`, `PreCompact`, `Elicitation`, `ElicitationResult`, `WorktreeCreate`) can stop the action via exit code 2 or a JSON decision field.
- **Inject context** — `SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Stop`, `SubagentStop` can return `additionalContext` in JSON.
- **Rewrite input** — `PreToolUse` and `PermissionRequest` can return `updatedInput`.
- **Rewrite output** — `PostToolUse` can return `updatedToolOutput`.

The exit-code contract is what makes all of this deterministic rather than advisory. Per the reference: "**Exit 0**: Hook reports no objection; normal flow applies. For `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` output is added to Claude's context" while "**Exit 2**: Action is blocked; stderr shown to Claude as feedback"; any other exit code lets the action proceed but shows an error notice and sends full stderr to the debug log [S1]. On top of the exit code, a hook can print structured JSON to stdout with fields like `hookSpecificOutput.permissionDecision` (`"allow"`, `"deny"`, `"ask"`, `"defer"`) to make a finer-grained decision than a bare exit code allows [S1][S2].

Classic uses fall directly out of this contract: run a formatter after every edit is a `PostToolUse` hook matched to `Edit|Write` [S2]; block writes to protected paths is a `PreToolUse` hook — the guide gives blocking `.env`, `package-lock.json`, and `.git/` as a named example [S2]; the reference's own worked example is a `PreToolUse` hook that inspects `tool_input.command`, greps for `rm -rf`, and returns `permissionDecision: "deny"` with a reason if it matches [S1].

There are real limits worth knowing before you lean on hooks for something they can't do: "Hooks communicate through stdin/stdout/stderr and exit codes only; can't trigger slash commands or tool calls directly", `PostToolUse` hooks "can't undo actions (tool already executed)" because the tool has already run by the time that event fires, and when multiple `PreToolUse` hooks all return `updatedInput`, "last to finish takes effect (non-deterministic)" [S2].

## Slash commands

A slash command is invoked by the user, not the model — you type `/name` and the harness expands it into a prompt. In current Claude Code docs, this mechanism has merged into skills: "Skills create slash commands (invoked as `/skill-name`). Custom commands (`.claude/commands/deploy.md`) and skills (`.claude/skills/deploy/SKILL.md`) both create `/deploy` and work identically" [S3]. The research dump notes the URL for the old `slash-commands` docs "returned skills documentation because custom commands were merged into Claude Code's skills feature" [S3] — so `.claude/commands/*.md` still works, but it's documented today as the legacy form of a skill rather than a separate mechanism, and the skill spec explicitly still covers it: "Skills specification (S3) covers both `.claude/skills/` and legacy `.claude/commands/` formats" [S3].

A skill file supports argument interpolation for the text typed after the command name: `$ARGUMENTS` for all arguments passed, `$ARGUMENTS[N]` / `$N` for a specific positional argument, and `$name` for a named argument declared in the `arguments` frontmatter field [S3].

The mechanism is one file format serving two different invocation modes, and that's the real distinction to hold onto — not "commands vs. skills" as separate systems, but **user pulls vs. model decides**, both routed through the same skill definition. Frontmatter controls which side is active: `disable-model-invocation: true` means "Only you invoke; prevents auto-invocation" — the pure slash-command case — while `user-invocable: false` means "Only Claude invokes; hidden from `/` menu" — the pure auto-triggered case [S3]. Left at defaults, a skill does both: a user can type `/name`, and Claude can also auto-invoke it "if `description` matches conversation" [S3].

## Pro vs. amateur

**Amateurs write "please always run the tests" in the system prompt. Pros write a hook.** A prompted instruction is read by the model and weighed against everything else in context — it's a wish that competes with the rest of the conversation for the model's attention. A `PostToolUse` or `Stop` hook runs unconditionally, every time, no matter what the model was thinking about. The same reference is blunt about how far this reaches: `Stop` hooks fire "on every Claude response, not just task completion" [S2] — which is exactly the property you want from a rule that has to be a law, not a suggestion.

**Amateurs install a plugin's hooks without reading them. Pros audit first.** Hooks execute with the permissions of your own shell — that's what makes them powerful and also what makes an unreviewed one dangerous. The guide's own security section says to "Pre-check hook scripts for command injection," review environment variable access in `allowedEnvVars`, and warns specifically to "Be careful with `PreToolUse` hooks that rewrite input—can silently change user intent" [S2]. A plugin's `hooks/hooks.json` is one of the listed configuration scopes a hook can live in [S1] — code you didn't write, running with your access, on every matching event.

**Amateurs treat every hook as free. Pros keep them fast, because they're synchronous with the loop.** Hook timeouts are generous by default — 10 minutes for `command`, `http`, and `mcp_tool` types — but tighter for the events most likely to run on every turn: 30 seconds for `UserPromptSubmit`, 30 seconds for `prompt`-type hooks, 60 seconds for `agent`-type hooks [S2]. A slow `PreToolUse` hook doesn't run in the background; the agent loop waits on it before the tool call proceeds.

**Amateurs reach for a hook when the rule needs judgment. Pros reach for a hook only when the rule is mechanical.** "Run the formatter" or "reject any Edit touching a protected path" are checks a shell script can decide correctly every time. "Is this refactor a good idea" is not — that needs a skill, where the model reasons about the specific situation, not a hook, where the same shell command runs regardless of context. The `prompt` and `agent` hook types exist precisely for the fuzzy middle ground — cases where "verification requires inspecting files or running commands" but you still want the check enforced automatically rather than left to a prompt [S2] — but even those return a flat `{"ok": true/false}` decision, not a conversation.

## References

- Claude Code Docs — [Hooks reference](https://code.claude.com/docs/en/hooks) [S1]
- Claude Code Docs — [Hooks guide](https://code.claude.com/docs/en/hooks-guide) [S2]
- Claude Code Docs — [Slash commands](https://code.claude.com/docs/en/slash-commands) [S3]
- VS Code Docs — [Copilot customization](https://code.visualstudio.com/docs/copilot/copilot-customization) [S4]
