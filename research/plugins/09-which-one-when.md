# Concept 09: Which Artifact When — Skills, Hooks, Agents, MCP, Prompts

Research document for Module A1, concept 09: choosing the right extension mechanism for Claude Code and agents.

---

## [S1] Extend Claude with skills

- **URL:** https://code.claude.com/docs/en/skills
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**When to create a skill:**
- "Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact."
- "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it."

**Context loading behavior:**
- "Once a skill loads, its content [stays in context across turns](#skill-content-lifecycle), so every line is a recurring token cost."
- "In a regular session, skill descriptions are loaded into context so Claude knows what's available, but full skill content only loads when invoked."

**Control over invocation:**
- "**Task content** gives Claude step-by-step instructions for a specific action, like deployments, commits, or code generation. These are often actions you want to invoke directly with `/skill-name` rather than letting Claude decide when to run them. Add `disable-model-invocation: true` to prevent Claude from triggering it automatically."
- "By default, both you and Claude can invoke any skill. You can type `/skill-name` to invoke it directly, and Claude can load it automatically when relevant to your conversation."
- "**Reference content** adds knowledge Claude applies to your current work. Conventions, patterns, style guides, domain knowledge. This content runs inline so Claude can use it alongside your conversation context."

**Skill vs Hooks distinction:**
- "For other ways to extend Claude Code, see [skills](/en/skills) for giving Claude additional instructions and executable commands, [subagents](/en/sub-agents) for running tasks in isolated contexts, and [plugins](/en/plugins) for packaging extensions to share across projects."

**When to use forked subagent execution:**
- `context: fork` runs in isolation: "The skill content becomes the prompt that drives the subagent. It won't have access to your conversation history."
- "With `context: fork`, you write the task in your skill and pick an agent type to execute it."

---

## [S2] Automate actions with hooks

- **URL:** https://code.claude.com/docs/en/hooks-guide
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Core purpose of hooks:**
- "Hooks are user-defined shell commands that execute at specific points in Claude Code's lifecycle. They provide **deterministic control** over Claude Code's behavior, ensuring certain actions always happen rather than relying on the LLM to choose to run them."
- "Use hooks to enforce project rules, automate repetitive tasks, and integrate Claude Code with your existing tools."

**Hooks vs prompt-based decisions:**
- "For decisions that require judgment rather than deterministic rules, you can also use [prompt-based hooks](#prompt-based-hooks) or [agent-based hooks](#agent-based-hooks) that use a Claude model to evaluate conditions."

**Relationship to other mechanisms:**
- "For other ways to extend Claude Code, see [skills](/en/skills) for giving Claude additional instructions and executable commands, [subagents](/en/sub-agents) for running tasks in isolated contexts, and [plugins](/en/plugins) for packaging extensions to share across projects."

**When hooks fire:**
- Hooks fire "at specific points in Claude Code's lifecycle: format files after edits, block commands before they execute, send notifications when Claude needs input, inject context at session start, and more."

**Comparison: hooks vs skills:**
- Hooks enforce **deterministic rules** automatically at specific lifecycle points.
- Skills provide **instructions and knowledge** that Claude can decide to use (unless `disable-model-invocation: true`).

**Agent-based hooks for complex decisions:**
- "When verification requires inspecting files or running commands, use `type: "agent"` hooks. Unlike prompt hooks, which make a single LLM call, agent hooks spawn a subagent that can read files, search code, and use other tools to verify conditions before returning a decision."
- "Use prompt hooks when the hook input data alone is enough to make a decision. Use agent hooks when you need to verify something against the actual state of the codebase."

---

## [S3] Building effective agents

- **URL:** https://www.anthropic.com/research/building-effective-agents
- **Fetched:** 2026-07-12
- **Type:** research

### Extracted

**Simplicity first principle:**
- "For many applications, however, optimizing single LLM calls with retrieval and in-context examples is usually enough."
- "Success in the LLM space isn't about building the most sophisticated system. It's about building the _right_ system for your needs."
- "you should consider adding complexity _only_ when it demonstrably improves outcomes."

**When to use agents vs workflows:**
- "workflows offer predictability and consistency for well-defined tasks, whereas agents are the better option when flexibility and model-driven decision-making are needed at scale."
- Agents apply to "open-ended problems where it's difficult or impossible to predict the required steps" and situations "where you can't hardcode a fixed path."

**Cost-latency trade-off:**
- "Agentic systems often trade latency and cost for better task performance, and you should consider when this tradeoff makes sense."

**When agents are NOT warranted:**
- "The autonomous nature of agents means higher costs, and the potential for compounding errors."
- Avoid agents when a simple call or workflow is sufficient.

---

## [S4] Effective context engineering for AI agents

- **URL:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Fetched:** 2026-07-12
- **Type:** engineering

### Extracted

**Context as a finite resource:**
- "Context, therefore, must be treated as a finite resource with diminishing marginal returns."
- LLMs experience "context rot"—decreased accuracy as token volume increases—similar to human working memory limitations.

**Primary guidance for effective context:**
- "Find the _smallest_ _possible_ set of high-signal tokens that maximize the likelihood of some desired outcome."
- Remain "thoughtful and keep your context informative, yet tight."

**System prompts:**
- Avoid both overly complex hardcoded logic and vague guidance. Achieve the "Goldilocks zone" with instructions "specific enough to guide behavior effectively, yet flexible enough to provide strong heuristics."

**Tools:**
- Maintain "a minimal viable set of tools" with no functional overlap.
- Poor tool design wastes context through ambiguous decision-making.

**Examples:**
- Use "diverse, canonical examples" rather than exhaustive edge cases.
- "examples are the 'pictures' worth a thousand words."

**Long-horizon strategies for large tasks:**
- Employ: **compaction** (summarizing context windows)
- **structured note-taking** (external memory)
- **sub-agent architectures** (delegated exploration returning condensed summaries)

---

## Decision Matrix (Derived from Sources)

### Single LLM Call
- **Use when:** Task can be solved with retrieval + in-context examples
- **Cost:** Lowest latency and token usage
- **Limitation:** Fixed input/output; no decision branching
- **Sources:** S3 (Anthropic agents research)

### Skill + Manual Invocation (`disable-model-invocation: true`)
- **Use when:** Repetitive procedures you want to control timing on (deploy, commit, send-slack-message)
- **Cost:** Context loaded only on explicit `/skill-name` invocation
- **Benefit:** Claude can't trigger it at the wrong time
- **Source:** S1 (Claude Code skills)

### Skill + Auto-invocation (default)
- **Use when:** Knowledge or patterns Claude should learn and apply automatically
- **Cost:** Description always in context (~1,536 char budget per skill); full content loads only when invoked
- **Benefit:** Claude discovers and uses relevant context autonomously
- **Source:** S1 (Claude Code skills)

### Hook + Deterministic Shell Command
- **Use when:** Action must happen automatically (format after edits, block protected files, notify on input needed)
- **Cost:** Runs at specific lifecycle point; no LLM overhead
- **Benefit:** Enforces rules without relying on model judgment
- **Source:** S2 (Claude Code hooks)

### Hook + Prompt-based Decision
- **Use when:** Simple judgment call based on hook input data alone (e.g., "is this task complete?")
- **Cost:** Single LLM turn (~Haiku) per event
- **Benefit:** Adds judgment to deterministic actions
- **Source:** S2 (Claude Code hooks)

### Hook + Agent-based Decision
- **Use when:** Verification requires inspecting files or running commands
- **Cost:** Full agent (up to 50 turns, 60s timeout) per event
- **Benefit:** Can inspect actual state before deciding
- **Source:** S2 (Claude Code hooks)

### Workflow (Hardcoded Steps)
- **Use when:** Task sequence is predictable and fixed
- **Cost:** Deterministic; no model decision-making overhead
- **Benefit:** Predictability and consistency
- **Source:** S3 (Anthropic agents research)

### Agent (Agentic Loop)
- **Use when:** Open-ended problem; steps can't be predicted in advance
- **Cost:** Higher latency and token usage; potential for compounding errors
- **Benefit:** Flexibility and model-driven decision-making at scale
- **Source:** S3 (Anthropic agents research)

### Subagent with Forked Context
- **Use when:** Isolate task from conversation history (avoid interference or context bloat)
- **Cost:** Fresh context per subagent; no access to prior turns
- **Benefit:** Focused execution without distractions
- **Source:** S1 (Claude Code skills, `context: fork`)

---

## Context Cost Principles (from S4)

1. **Minimize tokens:** "Find the _smallest_ _possible_ set of high-signal tokens"
2. **Avoid overlap:** Maintain "a minimal viable set of tools" with no functional overlap
3. **Use examples wisely:** "diverse, canonical examples" over exhaustive edge cases
4. **Reuse for long tasks:** Deploy compaction, external memory, or sub-agent summaries rather than loading full context into one window

---

## Notes for Concept 09 Implementation

- **MCP** not explicitly addressed in these sources; research Anthropic MCP spec separately.
- **Skills + Hooks** are complementary: skills provide knowledge/procedures; hooks enforce deterministic actions.
- **Subagents** appear as a tool for context isolation, not a primary categorization axis here.
- **Prompt engineering** is mentioned implicitly (system prompts, examples) but not the focus of these sources.
