# Module A1: Concept 00 — Primer Research Sources

## [S1] Building Effective AI Agents
- **URL:** https://www.anthropic.com/research/building-effective-agents
- **Fetched:** 2026-07-12
- **Type:** post

### Extracted
- **Authors:** Erik S. and Barry Zhang
- **Published:** December 19, 2024
- **Organization:** Anthropic

**Key claims:**
- "the most successful implementations use simple, composable patterns rather than complex frameworks"
- Success requires "measuring performance and iterating on implementations" rather than assuming complexity adds value
- Organizations should "start with simple prompts" and only introduce multi-step systems "when simpler solutions fall short"

**Core definitions:**
- **Agentic Systems:** Broader category encompassing both workflows and agents
- **Workflows:** "Systems where LLMs and tools are orchestrated through predefined code paths"
- **Agents:** "Systems where LLMs dynamically direct their own processes and tool usage"
- **Augmented LLM:** Foundational building block enhanced with retrieval, tools, and memory capabilities

**Core patterns described:**
- Prompt chaining
- Routing
- Parallelization
- Orchestrator-workers
- Evaluator-optimizer
- Autonomous agents

**Three core principles:**
1. Maintain simplicity in agent design
2. Prioritize transparency in planning steps
3. Craft agent-computer interfaces through thorough tool documentation

---

## [S2] Tool use with Claude
- **URL:** https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview
- **Fetched:** 2026-07-12
- **Type:** docs
- **Note:** URL redirects to https://platform.claude.com/docs/en/docs/agents-and-tools/tool-use/overview

### Extracted
**Key definitions:**
- **Tool use:** "Tool use lets Claude call functions that you define or that Anthropic provides. Claude determines when to call a tool based on the user's request and the tool's description. It then returns a structured call that your application executes (client tools) or that Anthropic executes (server tools)."

**Tool execution types:**
- **Client tools:** Run in your application. Claude responds with `stop_reason: "tool_use"` and one or more `tool_use` blocks. Your code executes the operation and sends back a `tool_result`. Includes user-defined tools and Anthropic-defined schemas (bash, text_editor).
- **Server tools:** Run on Anthropic's infrastructure (web_search, web_fetch, code_execution, tool_search). You see results directly without handling execution.

**When Claude uses tools:**
- With the default `tool_choice` of `{"type": "auto"}`, Claude determines on each turn whether to call a tool or respond directly
- "It calls a tool when the request maps to that tool's described capability and the answer isn't already in context. It responds directly for stable knowledge, creative tasks, and conversational turns."

**Tool choice behavior:**
- Prompt instructions affect tool triggering: "Use the tools to investigate before responding." increases tool use; "Always call a tool first before responding." pushes further; "Use your judgment about whether to call a tool or respond directly." keeps triggering behavior conservative
- To require a tool call, set [`tool_choice`](/docs/en/agents-and-tools/tool-use/define-tools#forcing-tool-use) to enforce it

**Pricing:**
- "Tool use requests are priced based on: (1) The total number of input tokens sent to the model (including in the `tools` parameter), (2) The number of output tokens generated, (3) For server-side tools, additional usage-based pricing"
- Client-side tools priced same as any other Claude API request
- Server-side tools may incur additional charges based on specific usage

---

## [S3] [1hr Talk] Intro to Large Language Models
- **URL:** https://www.youtube.com/watch?v=zjkBMFhNj_g
- **Fetched:** 2026-07-12
- **Type:** video
- **Creator:** Andrej Karpathy
- **Upload date:** November 23, 2023

### Extracted
**Description:**
- "A 1 hour general-audience introduction to Large Language Models: the core technical component behind systems like ChatGPT, Claude, and Bard"
- "The talk covers what they are, where they are headed, comparisons and analogies to present-day operating systems, and some of the security-related challenges of this new computing paradigm"
- Talk presented at the AI Security Summit
- Slides available as PDF (42MB)

**Topics covered (inferred from description):**
- What LLMs are
- Where LLMs are headed
- Comparisons and analogies to present-day operating systems
- Security-related challenges of the LLM computing paradigm

---

## [S4] Glossary
- **URL:** https://docs.anthropic.com/en/docs/resources/glossary
- **Fetched:** 2026-07-12
- **Type:** docs
- **Note:** URL redirects to https://platform.claude.com/docs/en/docs/resources/glossary

### Extracted
**Key technical terms:**

- **Context window:** "The amount of text a language model can look back on and reference when generating new text. This is different from the large corpus of data the language model was trained on, and instead represents a 'working memory' for the model. A larger context window allows the model to understand and respond to more complex and lengthy prompts."

- **Fine-tuning:** "The process of further training a pretrained language model using additional data. This causes the model to start representing and mimicking the patterns and characteristics of the fine-tuning dataset."

- **HHH:** Anthropic's goals for beneficial AI: "A **helpful** AI will attempt to perform the task or answer the question posed to the best of its abilities, providing relevant and useful information. An **honest** AI will give accurate information, and not hallucinate or confabulate. It will acknowledge its limitations and uncertainties when appropriate. A **harmless** AI will not be offensive or discriminatory, and when asked to aid in a dangerous or unethical act, the AI should politely refuse and explain why it cannot comply."

- **Latency:** "In the context of generative AI and large language models, refers to the time it takes for the model to respond to a given prompt. It is the delay between submitting a prompt and receiving the generated output."

- **LLM (Large Language Model):** "AI language models with many parameters that are capable of performing a variety of surprisingly useful tasks. These models are trained on vast amounts of text data and can generate human-like text, answer questions, summarize information, and more. Claude is a conversational assistant based on a large language model that has been fine-tuned and trained using RLHF to be more helpful, honest, and harmless."

- **MCP (Model Context Protocol):** "An open protocol that standardizes how applications provide context to LLMs. Like a USB-C port for AI applications, MCP provides a unified way to connect AI models to different data sources and tools. MCP enables AI systems to maintain consistent context across interactions and access external resources in a standardized manner."

- **Pretraining:** "The initial process of training language models on a large unlabeled corpus of text. In Claude's case, autoregressive language models are pretrained to predict the next word, given the previous context of text in the document."

- **RAG (Retrieval Augmented Generation):** "A technique that combines information retrieval with language model generation to improve the accuracy and relevance of the generated text, and to better ground the model's response in evidence. In RAG, a language model is augmented with an external knowledge base or a set of documents that is passed into the context window."

- **RLHF (Reinforcement Learning from Human Feedback):** "A technique used to train a pretrained language model to behave in ways that are consistent with human preferences. Human feedback consists of ranking a set of two or more example texts, and the reinforcement learning process encourages the model to prefer outputs that are similar to the higher-ranked ones."

- **Temperature:** "A parameter that controls the randomness of a model's predictions during text generation. Higher temperatures lead to more creative and diverse outputs. Lower temperatures result in more conservative and deterministic outputs that stick to the most probable phrasing and answers."

- **TTFT (Time to First Token):** "A performance metric that measures the time it takes for a language model to generate the first token of its output after receiving a prompt. It is an important indicator of the model's responsiveness and is particularly relevant for interactive applications."

- **Tokens:** "The smallest individual units of a language model, and can correspond to words, subwords, characters, or even bytes. For Claude, a token approximately represents 3.5 English characters, though the exact number can vary depending on the language used."
