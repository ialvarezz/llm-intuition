# Research dump — Concept 05: Context Window

## [S1] Anthropic — Context windows
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/context-windows (301 redirect → working URL: https://platform.claude.com/docs/en/docs/build-with-claude/context-windows)
- **Fetched:** 2026-07-02
- **Type:** docs (Anthropic)

### Extracted
- Definition (verbatim): "The 'context window' refers to all the text a language model can reference when generating a response, including the response itself. This is different from the large corpus of data the language model was trained on, and instead represents a 'working memory' for the model."
- More context isn't automatically better (verbatim): "A larger context window allows the model to handle more complex and lengthy prompts, but more context isn't automatically better. As token count grows, accuracy and recall degrade, a phenomenon known as *context rot*. This makes curating what's in context just as important as how much space is available."
- Output counts against the window too (verbatim): "The context window (up to 1M tokens, depending on the model) holds the conversation history plus the new output Claude generates."
- Everything counts (verbatim): "Everything in the request counts toward the context window: the system prompt, every message in `messages` (including tool results, images, and documents), and your tool definitions. The output Claude generates for the turn, including its extended thinking, counts too."
- Turn accumulation, "previous turns are preserved completely" (verbatim): "As the conversation advances through turns, each user message and assistant response accumulates within the context window, and previous turns are preserved completely."
- Chat apps manage the window differently (verbatim, footnote): "Chat interfaces such as claude.ai can also manage the context window on a rolling 'first in, first out' basis." — this is the load-bearing line for "old turns silently fall off" in chat-app UX, as distinct from the raw API behavior.
- Cached tokens still occupy the window (verbatim): "Cached prompt prefixes still occupy the context window: prompt caching changes what you pay for those tokens, not whether they count."
- Overflow behavior (verbatim): "If the input alone already exceeds the model's context window, the API returns a 400 `invalid_request_error` ('prompt is too long') on every model." And: "On Claude 4.5 models and newer, if input tokens plus `max_tokens` exceeds the context window size, the API accepts the request. If generation then reaches the context window limit, it stops with `stop_reason: 'model_context_window_exceeded'`."

## [S2] Liu et al. — Lost in the Middle: How Language Models Use Long Contexts (2023)
- **URL:** https://arxiv.org/abs/2307.03172
- **Fetched:** 2026-07-02
- **Type:** paper

### Extracted
- Abstract (verbatim, in full): "While recent language models have the ability to take long contexts as input, relatively little is known about how well they use longer context. We analyze the performance of language models on two tasks that require identifying relevant information in their input contexts: multi-document question answering and key-value retrieval. We find that performance can degrade significantly when changing the position of relevant information, indicating that current language models do not robustly make use of information in long input contexts. In particular, we observe that performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle of long contexts, even for explicitly long-context models. Our analysis provides a better understanding of how language models use their input context and provides new evaluation protocols for future long-context language models."
- This is the direct source for "lost in the middle": position-dependent recall — best at the start/end of context, worst in the middle — holding even for models built specifically for long context.

## [S3] Anthropic — Prompt caching
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching (301 redirect → working URL: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching)
- **Fetched:** 2026-07-02
- **Type:** docs (Anthropic)

### Extracted
- What it does (verbatim): "Prompt caching optimizes your API usage by allowing resuming from specific prefixes in your prompts. This significantly reduces processing time and costs for repetitive tasks or prompts with consistent elements."
- How it works, three steps (verbatim): "1. The system checks if a prompt prefix, up to a specified cache breakpoint, is already cached from a recent query. 2. If found, it uses the cached version, reducing processing time and costs. 3. Otherwise, it processes the full prompt and caches the prefix once the response begins."
- Why cache reads are cheaper (verbatim): "Cached prefixes reuse the prior computation from when the prefix was first processed. The model doesn't need to re-process these tokens—it simply retrieves the cached intermediate representations. This elimination of redundant computation is why cache reads cost only 10% of the base input token price."
- Cache read cost figure (verbatim, pricing table row): "Cache read tokens ... 0.1x base price ... Cached content reused from prior computation."
- Cache lifetime (verbatim): "By default, the cache has a 5-minute lifetime and is refreshed at no additional cost each time the cached content is used."
- Use cases (verbatim): "This is especially useful for: Prompts with many examples; Large amounts of context or background information; Repetitive tasks with consistent instructions; Long multi-turn conversations."

## [S4] Anthropic — Effective context engineering for AI agents
- **URL:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Fetched:** 2026-07-02
- **Type:** engineering blog (Anthropic)

### Extracted
- Context as scarce resource (verbatim): "Context is a critical but finite resource for AI agents."
- Degradation with scale, "context rot" (verbatim): "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" — the piece names this "context rot," and states it "affects all models" to varying degrees.
- Architectural root cause — quadratic attention (verbatim): "LLMs are based on the transformer architecture, which enables every token to attend to every other token across the entire context. This results in n² pairwise relationships for n tokens." (Corroborates note 04's quadratic-attention claim from a second, independent Anthropic source — used here only to explain why context is costly, not re-cited as a new quantitative claim.)
- Retrieval over front-loading (verbatim): "Rather than pre-processing all relevant data up front, agents built with the 'just in time' approach maintain lightweight identifiers (file paths, stored queries, web links, etc.) and use these references to dynamically load data into context at runtime using tools." — the load-bearing line for "context is priced per token, so stuffing docs in is the expensive alternative to retrieval."

## Notes on sourcing decisions
- Both Anthropic docs URLs in the brief (context-windows, prompt-caching) 301-redirect from `docs.anthropic.com` to `platform.claude.com`, consistent with the pattern noted from a prior task. Working URLs recorded above; original brief URLs kept as the canonical reference link in the note/page since they still resolve (redirect, not dead).
- No source needed replacement — all four brief URLs were fetchable directly or via their redirect target.
