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
- How it works (verbatim): "The system checks if a prompt prefix, up to a specified cache breakpoint, is already cached from a recent query. If found, it uses the cached version, reducing processing time and costs. Otherwise, it processes the full prompt and caches the prefix once the response begins."
- Cache read pricing (verbatim): "Cache read tokens are 0.1 times the base input tokens price" — and for writes, "5-minute cache write tokens are 1.25 times the base input tokens price".
- Cache lifetime (verbatim): "By default, the cache has a 5-minute lifetime. The cache is refreshed for no additional cost each time the cached content is used."
- Use cases (verbatim, list flattened): "This is especially useful for: Prompts with many examples Large amounts of context or background information Repetitive tasks with consistent instructions Long multi-turn conversations"
- **Correction (2026-07-02, raw re-fetch):** an earlier version of this dump attributed a mechanistic sentence ("Cached prefixes reuse the prior computation...intermediate representations...why cache reads cost only 10%...") to this page as verbatim. A raw HTML re-fetch shows no such sentences on the live page — that text was a fetch-summarizer fabrication. This page carries only the pricing facts and prefix-matching flow above; the mechanism (*why* caching skips recomputation) is now sourced from [S5].

## [S4] Anthropic — Effective context engineering for AI agents
- **URL:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Fetched:** 2026-07-02
- **Type:** engineering blog (Anthropic)

### Extracted
- Context as scarce resource (verbatim): "Context is a critical but finite resource for AI agents."
- Degradation with scale, "context rot" (verbatim): "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" — the piece names this "context rot". On universality (verbatim): "While some models exhibit more gentle degradation than others, this characteristic emerges across all models." **Correction (2026-07-02, raw re-fetch):** an earlier version of this dump quoted "affects all models" as verbatim; the live page's actual sentence is the one above — the shorter phrase was a paraphrase wrongly presented as a quote.
- Architectural root cause — quadratic attention (verbatim): "LLMs are based on the transformer architecture, which enables every token to attend to every other token across the entire context. This results in n² pairwise relationships for n tokens." (Corroborates note 04's quadratic-attention claim from a second, independent Anthropic source — used here only to explain why context is costly, not re-cited as a new quantitative claim.)
- Retrieval over front-loading (verbatim): "Rather than pre-processing all relevant data up front, agents built with the 'just in time' approach maintain lightweight identifiers (file paths, stored queries, web links, etc.) and use these references to dynamically load data into context at runtime using tools." — the load-bearing line for "context is priced per token, so stuffing docs in is the expensive alternative to retrieval."

## [S5] Hugging Face — Transformers documentation: Cache strategies (KV cache)
- **URL:** https://huggingface.co/docs/transformers/kv_cache
- **Fetched:** 2026-07-02
- **Type:** docs (Hugging Face)
- **Why added:** the brief's KV-cache mechanism claim ("attention re-reads everything each generated token, so past keys/values are cached") needed a source that actually explains the mechanism; neither Anthropic docs page does. Added after the fabricated-quote correction in [S3].

### Extracted
- The whole mechanism in five sentences (verbatim): "The key-value (KV) vectors are used to calculate attention scores. For autoregressive models, KV scores are calculated every time because the model predicts one token at a time. Each prediction depends on the previous tokens, which means the model performs the same computations each time. A KV cache stores these calculations so they can be reused without recomputing them. Efficient caching is crucial for optimizing model performance because it reduces computation time and improves response rates."

## Notes on sourcing decisions
- Both Anthropic docs URLs in the brief (context-windows, prompt-caching) 301-redirect from `docs.anthropic.com` to `platform.claude.com`, consistent with the pattern noted from a prior task. Working URLs recorded above; original brief URLs kept as the canonical reference link in the note/page since they still resolve (redirect, not dead).
- No source needed replacement — all four brief URLs were fetchable directly or via their redirect target.
- **Post-review re-verification (2026-07-02):** all four brief sources re-fetched as raw HTML (bypassing the fetch summarizer) and every quote in this dump checked as an exact substring of the live page text (apostrophes/curly-quotes normalized to straight). Two fabrications found and corrected (see [S3] and [S4] correction notes); [S5] added to cover the KV-cache mechanism.
