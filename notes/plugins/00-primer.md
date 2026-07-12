# 00 · The 15-minute primer

## The loop you already know

An LLM predicts the next token — that's the entire operation Module 1 covers in depth (`../01-what-is-an-llm.html`). Chat is that same operation run in a loop: your message becomes tokens, the model predicts a continuation, the continuation gets shown to you, and your next message extends the sequence and starts the cycle again. Nothing about "having a conversation" requires new machinery — it's next-token prediction with a growing transcript as input.

That growing transcript has a hard boundary. The **context window** is "the amount of text a language model can look back on and reference when generating new text" — Anthropic's glossary is explicit that this is not the training corpus but a "working memory" for the model, and that a larger context window lets it handle more complex, lengthier prompts [S4]. Everything the model knows about the current conversation — your messages, its own prior replies, any files or tool output that got pasted in — has to fit inside that window, because the window *is* the model's only state (Module 1 covers this at length in `../05-context-window.html`). This matters for the rest of this module: every plugin, tool, or piece of injected context has to compete for space inside that same window.

## Tools: the model asks, the harness acts

A raw LLM can't do anything except emit tokens. It can't run a shell command, read a file, or call an API — it has no hands. **Tool use** is the mechanism that gets around this without changing what the model fundamentally is: "Tool use lets Claude call functions that you define or that Anthropic provides. Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application executes (client tools) or that Anthropic executes (server tools)" [S2].

Read that carefully and the division of labor is exact. The model's job stops at "returns a structured call" — a piece of text saying, in effect, "call this tool with these arguments." For client tools, the surrounding application is the one that actually executes the operation and sends the result back as a `tool_result` [S2]. The model doesn't reach out and touch a filesystem or a network socket; it predicts tokens that *describe* an action, and something else — the program running around the model — is what performs it.

The model also isn't compelled to call a tool on every turn. With the default tool-choice setting, "Claude determines on each turn whether to call a tool or respond directly," calling a tool "when the request maps to that tool's described capability and the answer isn't already in context," and responding directly "for stable knowledge, creative tasks, and conversational turns" [S2]. That decision is itself just another next-token prediction — the model is predicting whether "the next thing to output" looks like a tool call or a plain answer, based on the prompt and the tool descriptions it was given.

## An agent is a loop

Chain that decision together and you get an agent. Anthropic's engineering write-up on agent design draws a specific line between two related things: **workflows**, "systems where LLMs and tools are orchestrated through predefined code paths," and **agents**, "systems where LLMs dynamically direct their own processes and tool usage" [S1]. In a workflow, a human decided the sequence of steps in advance. In an agent, the model itself decides what to do next at each step, including whether to call a tool, which one, and what to do with the result — the control flow lives in the model's outputs, not in code written ahead of time.

Concretely, that's a loop: the model decides, the surrounding program acts, the result comes back into the context window as more tokens, and the cycle repeats until the model decides it's done. Nothing new happened mechanically — it's the same next-token-prediction loop as ordinary chat, just extended so that some of the "input" arriving each turn is tool output instead of a human typing. The same source describes the building block underneath all of this as an "augmented LLM" — a model equipped with retrieval, tools, and memory as capabilities it can reach for [S1]. Whether that reaching happens along a path a human coded (a workflow) or a path the model chooses turn by turn (an agent) is the entire distinction.

One protocol worth knowing by name here: **MCP (Model Context Protocol)** is "an open protocol that standardizes how applications provide context to LLMs," described as "a USB-C port for AI applications" that gives a uniform way to connect a model to different data sources and tools rather than wiring each one up bespoke [S4]. It's one answer to "how do I hand this model a new tool" — Module A1's later concepts go deeper on it.

## Plugins extend the harness

Put the pieces together and a naming problem falls out. The model is fixed — its weights don't change between one tool call and the next, or between one plugin and another. What varies, from one agentic coding tool to the next, is the program wrapped around the model: the thing that reads the model's structured tool-call output, decides which functions are actually available, executes them, formats the result, and feeds it back into the context window. Call that surrounding program the **harness** — Claude Code, GitHub Copilot, and similar tools are all harnesses in this sense.

This is the module's central framing: a plugin is not a modification to the model. It's a modification to the harness — a new tool the harness knows how to expose, a new piece of context the harness injects, a new command the harness recognizes. Nothing about installing a plugin changes what "predict the next token" means to the underlying model; it changes what capabilities and information the harness makes available *before* that prediction happens, and what the harness is willing to do with a structured call once the model emits one. Every concept in the rest of this module — marketplaces, plugins, MCP servers, skills, hooks, commands — is a variation on that same idea: something added to the harness, not to the model.

## Pro vs. amateur

**Amateurs say "the agent did X." Pros know the model never executes anything.** Every action you see an agent take — a file edited, a command run, a search performed — is the harness honoring a structured request the model emitted [S2]. The model's contribution stops at producing the right tokens to describe the action; execution, error handling, and getting the result back into context are all harness responsibilities.

**Amateurs judge agents by "how smart is the model." Pros judge them by harness and context quality.** The same underlying model can look brilliant or useless depending on what tools it's been given, how well those tools are described, and what's already sitting in its context window — the agent-design write-up names crafting the tool interface itself, through "thorough tool documentation," as a core design principle, not an afterthought [S1]. A weaker model with well-scoped tools and clean context frequently outperforms a stronger model buried in noise.

**Amateurs treat plugins as free. Pros know every injected token has a price.** Tool descriptions, retrieved context, and injected instructions all sit inside the same bounded context window [S4], and tool-use requests are priced in part on "the total number of input tokens sent to the model (including in the tools parameter)" [S2]. A plugin that quietly stuffs a large tool schema or a wall of instructions into every turn is spending context-window space and money on every single request, whether or not the model ends up using it.

## References

- Anthropic (Erik Schluntz, Barry Zhang) — [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) [S1]
- Anthropic — [Tool use with Claude](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview) [S2]
- Andrej Karpathy — [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) [S3]
- Anthropic — [Docs glossary](https://docs.anthropic.com/en/docs/resources/glossary) [S4]
