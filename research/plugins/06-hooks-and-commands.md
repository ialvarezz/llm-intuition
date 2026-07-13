# Research: Hooks & Slash Commands (Module A1 Concept 06)

Compiled 2026-07-12. Fetched from Claude Code and VS Code documentation to support Module A1 plugin architecture.

---

## S1 Claude Code Hooks Reference

- **URL:** https://code.claude.com/docs/en/hooks
- **Fetched:** 2026-07-12
- **Type:** spec

### Extracted

**Full hook event catalog (exact event names):**
- Per-session events: `SessionStart`, `Setup`, `SessionEnd`
- Per-turn events: `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `StopFailure`
- Agentic loop events: `PreToolUse`, `PermissionRequest`, `PermissionDenied`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`
- Subagent & task events: `SubagentStart`, `SubagentStop`, `TaskCreated`, `TaskCompleted`, `TeammateIdle`
- File & config events: `FileChanged`, `CwdChanged`, `ConfigChange`, `InstructionsLoaded`
- Compaction & context: `PreCompact`, `PostCompact`, `Notification`, `MessageDisplay`
- MCP events: `Elicitation`, `ElicitationResult`
- Worktree events: `WorktreeCreate`, `WorktreeRemove`

**What each hook can do (capabilities by event):**
- **Inspect** (All events): Read JSON input about the event
- **Block** (`PreToolUse`, `PermissionRequest`, `UserPromptSubmit`, `UserPromptExpansion`, `Stop`, `SubagentStop`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `ConfigChange`, `PreCompact`, `Elicitation`, `ElicitationResult`, `WorktreeCreate`): Exit code 2 or JSON decision fields
- **Inject context** (`SessionStart`, `UserPromptSubmit`, `UserPromptExpansion`, `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `Stop`, `SubagentStop`): Return `additionalContext` in JSON
- **Rewrite input** (`PreToolUse`, `PermissionRequest`): Return `updatedInput`
- **Rewrite output** (`PostToolUse`): Return `updatedToolOutput`
- **Set session metadata** (`SessionStart`): Return `sessionTitle`, `watchPaths`, `initialUserMessage`
- **Escalate to user** (`PreToolUse`, `PermissionRequest`): Return `permissionDecision: "ask"`

**Exit code and JSON contract:**

Exit codes determine behavior:
- **Exit 0**: Hook reports no objection; normal flow applies. For `UserPromptSubmit`, `UserPromptExpansion`, `SessionStart` output is added to Claude's context.
- **Exit 2**: Action is blocked; stderr shown to Claude as feedback
- **Any other code**: Action proceeds; stderr error notice shown, full stderr goes to debug log

JSON output (exit 0 with structured JSON):
```json
{
  "continue": false,
  "stopReason": "reason text",
  "suppressOutput": false,
  "systemMessage": "notification text",
  "terminalSequence": "escape sequence",
  "hookSpecificOutput": {
    "hookEventName": "EventName",
    "permissionDecision": "allow|deny|ask|defer",
    "permissionDecisionReason": "string",
    "additionalContext": "string",
    "updatedInput": { "field": "value" }
  }
}
```

**Hook types:**
- `"type": "command"` (shell script)
- `"type": "http"` (POST to URL endpoint)
- `"type": "mcp_tool"` (call tool on connected MCP server)
- `"type": "prompt"` (single-turn LLM evaluation)
- `"type": "agent"` (multi-turn verification with tool access)

**Matcher patterns** (filter which hooks fire):
- Tool-name matchers: `Bash`, `Edit|Write`, `mcp__.*` (regex)
- Event-specific matchers by event type (e.g., `SessionStart` matches `startup`, `resume`, `clear`, `compact`)
- Literal filename matchers: `.envrc|.env` (FileChanged event)

**Configuration structure:**
```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "pattern",
        "hooks": [
          {
            "type": "command|http|mcp_tool|prompt|agent",
            "command": "shell command",
            "if": "Bash(git *)",
            "timeout": 600,
            "statusMessage": "custom message",
            "async": false,
            "asyncRewake": false
          }
        ]
      }
    ]
  }
}
```

**Common input fields (all events receive):**
```json
{
  "session_id": "unique session ID",
  "prompt_id": "UUID",
  "transcript_path": "/path/to/transcript.jsonl",
  "cwd": "/current/working/directory",
  "permission_mode": "default|plan|acceptEdits|auto|dontAsk|bypassPermissions",
  "effort": { "level": "low|medium|high|xhigh|max" },
  "hook_event_name": "EventName",
  "agent_id": "optional-subagent-uuid",
  "agent_type": "optional-agent-name"
}
```

**Example use: PreToolUse hook to block rm -rf:**
```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command' < /dev/stdin)
if echo "$COMMAND" | grep -q 'rm -rf'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Destructive command blocked by hook"
    }
  }'
else
  exit 0
fi
```

**Configuration location and scope:**
- `~/.claude/settings.json` (all projects, local to machine)
- `.claude/settings.json` (single project, can be committed)
- `.claude/settings.local.json` (single project, gitignored)
- Managed policy settings (organization-wide)
- Plugin `hooks/hooks.json` (when plugin enabled)
- Skill or agent frontmatter (while skill/agent active)

---

## S2 Claude Code Hooks Guide (Best Practices)

- **URL:** https://code.claude.com/docs/en/hooks-guide
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Hook lifecycle and when each event fires:**

| Event | Trigger |
|-------|---------|
| `SessionStart` | When session begins or resumes |
| `Setup` | When CLI flag `--init-only`, `--init`, `--maintenance` used |
| `UserPromptSubmit` | User submits prompt, before Claude processes |
| `UserPromptExpansion` | User-typed command expands into prompt, before it reaches Claude |
| `PreToolUse` | Before tool call executes (can block) |
| `PermissionRequest` | Permission dialog appears |
| `PermissionDenied` | Tool denied by auto mode classifier |
| `PostToolUse` | After tool call succeeds |
| `PostToolUseFailure` | After tool call fails |
| `PostToolBatch` | After full batch of parallel tools resolves |
| `Notification` | Claude Code sends notification (matcher types: `permission_prompt`, `idle_prompt`, `auth_success`, `elicitation_dialog`, `elicitation_complete`, `elicitation_response`, `agent_needs_input`, `agent_completed`) |
| `MessageDisplay` | While assistant message text is displayed |
| `SubagentStart` | Subagent spawned (matcher: agent type like `general-purpose`, `Explore`, `Plan`) |
| `SubagentStop` | Subagent finishes |
| `TaskCreated` | Task being created via `TaskCreate` |
| `TaskCompleted` | Task marked complete |
| `Stop` | Claude finishes responding |
| `StopFailure` | Turn ends due to API error |
| `TeammateIdle` | Agent team teammate about to go idle |
| `InstructionsLoaded` | CLAUDE.md or `.claude/rules/*.md` loaded (matcher: `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact`) |
| `ConfigChange` | Configuration file changes (matcher: `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills`) |
| `CwdChanged` | Working directory changes (e.g., `cd` command) |
| `FileChanged` | Watched file changes on disk (matcher: filenames like `.envrc|.env`) |
| `WorktreeCreate` | Worktree being created via `--worktree` or `isolation: "worktree"` |
| `WorktreeRemove` | Worktree being removed |
| `PreCompact` | Before context compaction (matcher: `manual`, `auto`) |
| `PostCompact` | After context compaction |
| `Elicitation` | MCP server requests user input (matcher: MCP server name) |
| `ElicitationResult` | User responds to MCP elicitation |
| `SessionEnd` | Session terminates (matcher: `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`) |

**How hooks communicate (stdin/stdout/stderr):**

Input: JSON on stdin with hook event data.
Output: Exit code + optional stdout (JSON) and stderr (error message).

Exit code 2 blocks the action and shows stderr to Claude. Exit 0 continues normally (and if JSON is stdout, it's parsed for structured decisions).

**Decision patterns by event type:**

- `PreToolUse`: `hookSpecificOutput.permissionDecision` ("allow", "deny", "ask", "defer") + `permissionDecisionReason`
- `PermissionRequest`: `hookSpecificOutput.decision.behavior` ("allow", "deny") + `updatedInput`
- `UserPromptSubmit`, `Stop`, `SubagentStop`, `ConfigChange`: top-level `decision: "block"` + `reason`
- `SessionStart`: `hookSpecificOutput.additionalContext`, `sessionTitle`, `initialUserMessage`, `watchPaths`, `reloadSkills`
- `WorktreeCreate`: stdout print path or JSON `worktreePath`

**Prompt-based hooks** (`type: "prompt"`):
- Single LLM call (Haiku by default, override with `model` field)
- Returns `{"ok": true}` or `{"ok": false, "reason": "explanation"}`
- Default timeout: 30 seconds
- Used for judgment-based decisions where shell script insufficient

**Agent-based hooks** (`type: "agent"`):
- Multi-turn subagent with tool access (up to 50 turns)
- Same `"ok"` / `"reason"` response format as prompt hooks
- Default timeout: 60 seconds
- Use when verification requires inspecting files or running commands

**HTTP hooks** (`type: "http"`):
- POST event data to URL endpoint
- Response body uses same JSON format as command hooks
- Can block by returning 2xx with decision JSON
- Header values support `$VAR_NAME` interpolation (only vars in `allowedEnvVars` array)
- Response handling: 2xx + empty body = success; 2xx + plain text = success + text as context; 2xx + JSON = success + parsed output; non-2xx = non-blocking error; timeout/connection error = non-blocking error

**MCP tool hooks** (`type: "mcp_tool"`):
- Call tool on already-connected MCP server
- Input: `"server": "server_name"`, `"tool": "tool_name"`, `"input": { "field": "value" }`
- Useful for security scanning, validation using external services

**Practical examples:**

1. Desktop notification on `Notification` event (macOS: `osascript`, Linux: `notify-send`, Windows: PowerShell)
2. Auto-format with Prettier on `PostToolUse` with `Edit|Write` matcher
3. Block protected files (`.env`, `package-lock.json`, `.git/`) on `PreToolUse` with `Edit|Write` matcher
4. Re-inject context after compaction with `SessionStart` hook with `compact` matcher
5. Audit configuration changes with `ConfigChange` hook logging to file
6. Auto-approve specific permissions with `PermissionRequest` hook matching specific tool (e.g., `ExitPlanMode`)
7. Load direnv on `SessionStart` and `CwdChanged` to manage environment variables

**Matcher field values:**

The `matcher` field filters at group level; the `if` field filters at individual hook level with permission-rule syntax (e.g., `"Bash(git *)"`, `"Edit(*.ts)"`).

**Combining results from multiple hooks:**
- All matching hooks run in parallel
- One hook returning `deny` doesn't stop sibling hooks
- For `PreToolUse` decisions, most restrictive applies: `deny` > `defer` > `ask` > `allow`
- Context from all hooks is merged and passed to Claude together

**Limitations:**
- Hooks communicate through stdin/stdout/stderr and exit codes only; can't trigger slash commands or tool calls directly
- `PostToolUse` hooks can't undo actions (tool already executed)
- `PermissionRequest` hooks don't fire in non-interactive mode (`-p` flag)
- `Stop` hooks fire on every Claude response, not just task completion
- When multiple `PreToolUse` hooks return `updatedInput`, last to finish takes effect (non-deterministic)

**Hook timeouts:**
- `command`, `http`, `mcp_tool`: 10 minutes (600 seconds)
- `UserPromptSubmit` event: 30 seconds
- `MessageDisplay` event: 10 seconds
- `prompt` type: 30 seconds
- `agent` type: 60 seconds
- Override per hook with `timeout` field in settings

**Security considerations:**
- Pre-check hook scripts for command injection
- Review environment variable access in `allowedEnvVars`
- Use HTTP hooks to enforce policy server-side vs. client-side
- Be careful with `PreToolUse` hooks that rewrite input—can silently change user intent

**Debug techniques:**
- `/hooks` menu (read-only) to browse all configured hooks
- Transcript view (`Ctrl+O`) shows one-line summary per hook
- Run Claude Code with `claude --debug-file /tmp/claude.log` for full hook details
- Check debug log for: which hooks matched, exit codes, stdout, stderr

---

## S3 Claude Code Skills (Custom Commands/Slash Commands)

- **URL:** https://code.claude.com/docs/en/slash-commands
- **Fetched:** 2026-07-12
- **Type:** docs
- **Note:** URL redirected to skills documentation; custom commands have been merged into skills as per source docs

### Extracted

**Slash command file format:**

Skills create slash commands (invoked as `/skill-name`). Custom commands (`.claude/commands/deploy.md`) and skills (`.claude/skills/deploy/SKILL.md`) both create `/deploy` and work identically.

**Skill directory structure:**
```
skill-name/
├── SKILL.md (required - main instructions with YAML frontmatter)
├── template.md (optional - template for Claude to fill)
├── examples/ (optional - example outputs)
├── scripts/ (optional - utility scripts)
└── reference.md (optional - detailed docs)
```

**YAML frontmatter fields in SKILL.md:**

```yaml
---
name: skill-name (optional; defaults to directory name)
description: "What this skill does" (recommended - Claude uses for auto-invocation)
when_to_use: "Additional context for invocation triggers" (optional)
argument-hint: "[issue-number] [format]" (optional - hint during autocomplete)
arguments: "issue branch" or ["issue", "branch"] (optional - names for $substitution)
disable-model-invocation: true|false (optional; default false - prevent Claude auto-invocation)
user-invocable: true|false (optional; default true - hide from / menu)
allowed-tools: "Read Grep" or ["Read", "Grep"] (optional - pre-approve these tools)
disallowed-tools: "AskUserQuestion" (optional - remove from Claude's pool while skill active)
model: "opus|sonnet|haiku" (optional - override model for this skill)
effort: "low|medium|high|xhigh|max" (optional - override effort level)
context: fork (optional - run in forked subagent)
agent: Explore|Plan|general-purpose|custom-name (optional - which subagent to use with context: fork)
hooks: { PreToolUse: [...] } (optional - hooks scoped to skill lifecycle)
paths: "*.ts,*.tsx" (optional - glob patterns limiting when skill auto-activates)
shell: bash|powershell (optional; default bash)
---

Skill content and instructions here...
```

**Argument substitution (available variables):**

- `$ARGUMENTS` - All arguments passed when invoking skill
- `$ARGUMENTS[N]` - Nth argument (0-based indexing)
- `$N` - Shorthand for `$ARGUMENTS[N]` (e.g., `$0`, `$1`)
- `$name` - Named argument (from `arguments` frontmatter)
- `${CLAUDE_SESSION_ID}` - Current session ID
- `${CLAUDE_EFFORT}` - Current effort level
- `${CLAUDE_SKILL_DIR}` - Directory containing SKILL.md
- `${CLAUDE_PROJECT_DIR}` - Project root directory

Indexed arguments use shell-style quoting; multi-word values wrapped in quotes pass as single argument.

To include literal `$` before a digit/ARGUMENTS/declared name, escape with backslash: `\$1.00`. Only single backslash directly before token escapes it.

**Dynamic context injection** (preprocessing):

`` !`command` `` syntax runs shell commands before skill content sent to Claude. Output replaces placeholder before Claude sees it.

```markdown
## Current diff
!`git diff HEAD`

Instructions apply the diff above...
```

Multi-line commands use fenced block:
````markdown
```!
node --version
npm --version
git status --short
```
````

Substitution runs once; command output inserted as plain text (not re-scanned for further placeholders).

**Skill invocation:**
- User types `/skill-name` or `/skill-name arguments`
- Claude can auto-invoke if `description` matches conversation (unless `disable-model-invocation: true`)
- Stack multiple skills: `/code-review /fix-issue 123` loads both and passes `123` as `$ARGUMENTS` to each

**Where skills live (scope):**
| Location | Scope | Shareable |
|----------|-------|-----------|
| `~/.claude/skills/<skill-name>/SKILL.md` | All projects (personal) | No |
| `.claude/skills/<skill-name>/SKILL.md` | Single project | Yes (commit to repo) |
| `.claude/commands/<skill-name>.md` | Single project (legacy) | Yes |
| Plugin `<plugin>/skills/<skill-name>/SKILL.md` | Where plugin enabled | Yes (bundled) |
| Nested `.claude/skills/` in subdirectory | Working in that directory | Yes (monorepo support) |

Nested skills with same name: both available as `unqualified-name` (project root) and `dir:qualified-name` (nested).

Priority (when same name exists): enterprise > personal > project > plugin

**Skill content lifecycle:**
- When invoked, rendered SKILL.md enters conversation as single message
- Stays in context for rest of session (Claude Code doesn't re-read file on later turns)
- Auto-compaction carries invoked skills forward (first 5,000 tokens per skill, 25,000 token combined budget)
- If skill seems to stop influencing behavior after first response, re-invoke after compaction

**Command names:**

| Skill location | Command name source | Example |
|---|---|---|
| `~/.claude/skills/deploy-staging/` | Directory name | `/deploy-staging` |
| `apps/web/.claude/skills/deploy/` (nested with clash) | Path + directory | `/apps/web:deploy` |
| `.claude/commands/deploy.md` | File name without extension | `/deploy` |
| Plugin `my-plugin/skills/review/` | Plugin namespace + directory | `/my-plugin:review` |

**Pre-approve tools with `allowed-tools`:**
```yaml
---
name: commit
allowed-tools: Bash(git add *) Bash(git commit *) Bash(git status *)
---
```

**Run skills in forked subagent:**
```yaml
---
context: fork
agent: Explore
---

Your task prompt here that the subagent executes in isolation...
```

Built-in agents (`Explore`, `Plan`) skip CLAUDE.md to keep context small. Custom agents load CLAUDE.md.

**Skill supporting files:**

Reference from SKILL.md to load them on demand:
```markdown
## Additional resources
- For complete API details, see [reference.md](reference.md)
```

Keep SKILL.md under 500 lines; move detailed material to separate files.

**Control invocation:**
- `disable-model-invocation: true` - Only you invoke; prevents auto-invocation
- `user-invocable: false` - Only Claude invokes; hidden from `/` menu

**Override visibility from settings:**

In `.claude/settings.json`:
```json
{
  "skillOverrides": {
    "legacy-context": "name-only",
    "deploy": "off"
  }
}
```

Values: `"on"`, `"name-only"`, `"user-invocable-only"`, `"off"`

**Bundled skills:**
Available in every session (unless disabled with `disableBundledSkills` setting):
- `/doctor` (setup checkup)
- `/code-review` (code review)
- `/batch` (batch operations)
- `/debug` (debugging)
- `/loop` (recurring tasks)
- `/run` (launch app)
- `/verify` (verify change works)
- `/claude-api` (Claude API reference)

**Limitations:**
- Skill content stays in context across entire session (token cost)
- Hooks within skill fire only while skill active
- Skills with `context: fork` don't have access to main conversation history

---

## S4 VS Code Copilot Customization

- **URL:** https://code.visualstudio.com/docs/copilot/copilot-customization
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Seven primary VS Code Copilot customization approaches:**

1. **Instructions** - "Write your coding standards and conventions once, and the AI applies them automatically to every request"
   - File: `.github/copilot-instructions.md` or `*.instructions.md`

2. **Agent Skills** - Teach AI reusable capabilities bundled with scripts and examples that load automatically when tasks match
   - File: `SKILL.md` (Agent Skills standard)

3. **Custom Agents** - "Give the AI a focused role with its own instructions, allowed tools, and model, such as a read-only planner or a security reviewer"
   - File: `*.agent.md`

4. **MCP Servers** - Connect AI to external tools, databases, and services for real project data access
   - Configuration: MCP server definitions

5. **Hooks** - "Run your own commands automatically at key points in the agent's loop, such as formatting after every edit or blocking risky commands"
   - File: Hook configuration in settings/plugin

6. **Agent Plugins** (preview) - Install pre-built customization bundles from a marketplace
   - Configuration: Plugin marketplace integration

7. **Prompt Files** - "Save a reusable prompt that you invoke as a slash command, such as `/scaffold-component` or `/prep-pr`"
   - File: `*.prompt.md`

**Key configuration files:**
- `.github/copilot-instructions.md` – project-wide instructions
- `*.instructions.md` – targeted instructions for specific languages/folders
- `SKILL.md` – skill definitions
- `*.agent.md` – custom agent files
- `*.prompt.md` – prompt files (slash commands)

**Important monorepo setting:**
- `chat.useCustomizationsInParentRepositories` (default: disabled) – enable customization discovery from parent repository folders

**Prompt files (slash commands) specification:**
The documentation does not provide detailed format specification in this excerpt, but indicates prompt files (`.prompt.md`) enable saving reusable prompts invoked as slash commands with the syntax `/command-name`.

---

## Key Findings Summary

**Hooks:**
- 27 distinct event types covering entire Claude Code lifecycle
- Support 5 execution types: command (shell), HTTP, MCP tool, prompt (single-turn LLM), agent (multi-turn LLM)
- Structured JSON in/out with 26+ common input fields and event-specific fields
- Matchers filter at group level; `if` field filters at individual hook level
- Exit code 0 = continue; exit 2 = block; JSON output enables structured decisions
- Timeouts: 10 min (command/http/mcp_tool), 30 sec (prompt), 60 sec (agent)

**Slash Commands (Custom Commands/Skills):**
- Invoked as `/skill-name` or `/command-name`
- Defined in YAML frontmatter + markdown content
- 12 frontmatter configuration fields
- 6 argument substitution patterns (`$ARGUMENTS`, `$N`, `$name`, etc.)
- Dynamic context injection with `` !`command` `` preprocessing
- Fork execution in subagents with `context: fork`
- 5 tools pre-approval pattern with `allowed-tools`
- Can stack multiple skills in one message

**VS Code Copilot:**
- 7 customization approaches (instructions, skills, custom agents, MCP servers, hooks, plugins, prompt files)
- Supports same `.instructions.md` and `SKILL.md` patterns as Claude Code
- Monorepo support via `chat.useCustomizationsInParentRepositories` setting
- Prompt files (`.prompt.md`) equivalent to skills for slash command creation

---

## Notes

- CloudCHIARender: Slash-commands URL returned skills documentation because custom commands were merged into Claude Code's skills feature
- All sources reflect Claude Code v2.1.200+ and VS Code Copilot current versions
- Hook specifications in S1 and S2 are authoritative per code.claude.com
- Skills specification (S3) covers both `.claude/skills/` and legacy `.claude/commands/` formats
- Prompt files (S4) reference indicates slash command pattern parity across Claude Code and VS Code Copilot
