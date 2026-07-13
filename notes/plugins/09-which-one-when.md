# 09 · Which artifact, when

## Start from the failure mode, not the technology

Every artifact in this module fixes exactly one kind of failure, and the failure names the fix — not the other way around. Reading the failure correctly is the whole skill; picking the artifact is the easy part once the failure is named.

**"The model doesn't know how we do X"** is a knowledge gap — the model would do the right thing if it knew the procedure, but it doesn't. A skill is built for this: create one "when you keep pasting the same instructions, checklist, or multi-step procedure into chat, or when a section of CLAUDE.md has grown into a procedure rather than a fact" [S1]. Concept 04 covers the mechanics of writing one.

**"The model can't reach system X"** is a capability gap, not a knowledge gap — no amount of instruction fixes a model that simply has no path to the filesystem, an API, or a database; that gap is what tool use exists to close, as concept 00's primer covers. MCP servers are the standardized way to expose a system this way to any compliant harness, covered in concept 03.

**"This sub-task pollutes/overflows the main context or needs different tools"** is a context-management problem: the sub-task itself might be doable, but doing it inline would burn the conversation's context budget on details nobody needs afterward. A subagent isolates it — Claude Code's `context: fork` mode is explicit that "The skill content becomes the prompt that drives the subagent. It won't have access to your conversation history." [S1] — and long-horizon guidance names **sub-agent architectures** (delegated exploration returning condensed summaries) as one of the standard strategies for keeping a large task's context tight [S4]. Concept 05 covers agent design and the dispatch contract.

**"This rule must hold every time, no exceptions"** is a reliability problem that a skill or instruction can't solve, because the model can still choose to skip a skill or misjudge a prompt. Hooks close that gap: they "are user-defined shell commands that execute at specific points in Claude Code's lifecycle. They provide **deterministic control** over Claude Code's behavior, ensuring certain actions always happen rather than relying on the LLM to choose to run them" [S2]. Concept 06 covers the event catalog and block/allow/inject mechanics.

**"I keep typing the same request"** is a repetition problem where the model already knows what to do — nothing needs teaching, just less typing. That's a slash command: a fixed, user-invoked shortcut, also covered in concept 06.

**"It's a one-off"** doesn't earn an artifact at all. A single non-recurring task is cheapest solved with a plain prompt — building anything durable for a task that won't happen again is pure overhead.

## The cost column

Every artifact above sits at a different point on a cost curve, and the curve is the reason the escalation order matters:

- **A skill is markdown.** It costs almost nothing to write, and "a skill's body loads only when it's used, so long reference material costs almost nothing until you need it" [S1] — the description sits in context always, but the expensive part loads on demand. This is the cheapest artifact that adds judgment.
- **An MCP server is running software.** It's a live dependency: something to install, authenticate, version, and keep patched. Concept 03 covers this cost in full; it's real infrastructure, not a text file.
- **An agent (subagent dispatch) costs latency and tokens per call.** Building effective agents is blunt about the trade: "Agentic systems often trade latency and cost for better task performance, and you should consider when this tradeoff makes sense" [S3], and "the autonomous nature of agents means higher costs, and the potential for compounding errors" [S3]. Every dispatch is a fresh context assembled and a fresh response generated — not free, and not instant.
- **A hook is a shell script on the hot path.** It runs at "specific points in Claude Code's lifecycle" on every matching event [S2] — cheap per-invocation if the script is small, but it's now part of the critical path for every matching action, and a broken hook can block work outright rather than just giving a wrong answer.

None of these costs is prohibitive on its own. The point of laying them in a column is comparative: a skill's few hundred tokens of description is a different category of commitment from an MCP server's running process, credentials, and upgrade schedule.

## Combinations, not a single pick

A plugin usually isn't one artifact — it's a bundle. A real plugin might ship a skill that teaches the procedure, a hook that guarantees a linter runs before every commit regardless of whether the model remembers, and a command that gives a human a fast way to trigger the whole thing by hand. The decision framework above answers "which artifact for which failure," not "which single artifact for this plugin" — most plugins answer several of the six questions at once, one artifact per failure mode they're covering.

## Maintenance reality

Every artifact installed is something somebody now owns, and the ownership cost doesn't show up until later:

- **Descriptions drift.** A skill's or MCP tool's description is what tells the model when to reach for it — Anthropic's context-engineering guidance is explicit that context is "a finite resource with diminishing marginal returns" and that the goal is "the _smallest_ _possible_ set of high-signal tokens that maximize the likelihood of some desired outcome" [S4]. A stale description doesn't just waste tokens, it actively misleads the model about when to invoke the thing.
- **Docs-linked instructions rot.** Anything that references an external doc, API version, or file path can silently go stale the moment the referenced thing moves, with no error to signal it — the artifact keeps loading, it just stops being true.
- **Someone must own each artifact.** Every hook, skill, or MCP server is a piece of infrastructure with the same lifecycle as code: it needs a person who notices when it breaks, updates it when the underlying system changes, and decides when it should be retired.

## Pro vs. amateur

**Amateurs pick the shiniest tool.** They reach for an MCP server where a 30-line skill would do — running software, with its dependencies, auth, and upkeep, to solve a problem that markdown and a description would have solved for a fraction of the cost.

**Pros pick the cheapest artifact that fixes the failure mode**, and escalate only on evidence: prompt → command → skill → agent/MCP. Each step up that ladder is only justified once the cheaper step has been tried and demonstrably fails to fix the actual failure — "you should consider adding complexity _only_ when it demonstrably improves outcomes" [S3].

**Pros measure the context cost of what they install.** Every tool description, injected instruction, and retrieved snippet sits inside the same bounded context window and gets billed as input tokens on every turn, whether the model uses it or not — the discipline is keeping that budget "informative, yet tight" [S4], not accumulating artifacts because each one seemed useful in isolation.

**Pros delete plugins that stopped earning their tokens.** An artifact that made sense when it was installed can stop paying for itself — the underlying failure mode goes away, the workflow changes, or a cheaper fix supersedes it — and the artifact keeps costing context and maintenance attention regardless. Removing it is not a loss; the same context-engineering principle that justifies adding an artifact (smallest high-signal token set) justifies cutting the ones that no longer earn their place.

## References

- Claude Docs — [Extend Claude with skills](https://code.claude.com/docs/en/skills) [S1]
- Claude Docs — [Automate actions with hooks](https://code.claude.com/docs/en/hooks-guide) [S2]
- Anthropic (Erik Schluntz, Barry Zhang) — [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) [S3]
- Anthropic — [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) [S4]
