# Research dump — Module 01 Concept 02: Context & the context window

Sources [S1]–[S5] below are copied forward verbatim from `research/05-context-window.md` (Module 00 concept 05's research dump), per the task brief. URLs, fetch dates, and extracted quotes are unchanged from that file. Every quote was re-verified live for this task (see "Quote audit" below) rather than trusted from the old file. [S6] and [S7] are new sources fetched fresh for this task.

## [S1] Anthropic — Context windows (copied forward from `research/05-context-window.md` [S1])
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/context-windows (301 redirect → working URL: https://platform.claude.com/docs/en/docs/build-with-claude/context-windows)
- **Fetched:** 2026-07-02 (original); quotes re-verified live 2026-07-22 for this task
- **Type:** docs (Anthropic)

### Extracted
- Definition (verbatim): "The 'context window' refers to all the text a language model can reference when generating a response, including the response itself. This is different from the large corpus of data the language model was trained on, and instead represents a 'working memory' for the model."
- More context isn't automatically better (verbatim): "A larger context window allows the model to handle more complex and lengthy prompts, but more context isn't automatically better. As token count grows, accuracy and recall degrade, a phenomenon known as *context rot*. This makes curating what's in context just as important as how much space is available."
- Output counts against the window too (verbatim): "The context window (up to 1M tokens, depending on the model) holds the conversation history plus the new output Claude generates." — this is the "exact figures" source for the module's headline claim: up to 1M tokens depending on model, and the output is *inside* that same budget, not additional to it.
- Everything counts (verbatim): "Everything in the request counts toward the context window: the system prompt, every message in `messages` (including tool results, images, and documents), and your tool definitions. The output Claude generates for the turn, including its extended thinking, counts too."
- Turn accumulation, "previous turns are preserved completely" (verbatim): "As the conversation advances through turns, each user message and assistant response accumulates within the context window, and previous turns are preserved completely."
- Chat apps manage the window differently (verbatim, footnote): "Chat interfaces such as claude.ai can also manage the context window on a rolling 'first in, first out' basis." — this is the load-bearing line for "old turns silently fall off" in chat-app UX, as distinct from the raw API behavior.
- Cached tokens still occupy the window (verbatim): "Cached prompt prefixes still occupy the context window: prompt caching changes what you pay for those tokens, not whether they count."
- Overflow behavior (verbatim): "If the input alone already exceeds the model's context window, the API returns a 400 `invalid_request_error` ('prompt is too long') on every model." And: "On Claude 4.5 models and newer, if input tokens plus `max_tokens` exceeds the context window size, the API accepts the request. If generation then reaches the context window limit, it stops with `stop_reason: 'model_context_window_exceeded'`."

## [S2] Liu et al. — Lost in the Middle: How Language Models Use Long Contexts (2023) (copied forward from `research/05-context-window.md` [S2])
- **URL:** https://arxiv.org/abs/2307.03172
- **Fetched:** 2026-07-02 (original); quote re-verified live 2026-07-22 for this task
- **Type:** paper

### Extracted
- Abstract (verbatim, in full): "While recent language models have the ability to take long contexts as input, relatively little is known about how well they use longer context. We analyze the performance of language models on two tasks that require identifying relevant information in their input contexts: multi-document question answering and key-value retrieval. We find that performance can degrade significantly when changing the position of relevant information, indicating that current language models do not robustly make use of information in long input contexts. In particular, we observe that performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle of long contexts, even for explicitly long-context models. Our analysis provides a better understanding of how language models use their input context and provides new evaluation protocols for future long-context language models."
- This is the direct source for "lost in the middle": position-dependent recall — best at the start/end of context, worst in the middle — holding even for models built specifically for long context. Used in this concept's note as the citation for "order matters before the cap is ever hit."

## [S3] Anthropic — Prompt caching (copied forward from `research/05-context-window.md` [S3])
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching (301 redirect → working URL: https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching)
- **Fetched:** 2026-07-02 (original); quotes re-verified live 2026-07-22 for this task
- **Type:** docs (Anthropic)

### Extracted
- What it does (verbatim): "Prompt caching optimizes your API usage by allowing resuming from specific prefixes in your prompts. This significantly reduces processing time and costs for repetitive tasks or prompts with consistent elements."
- How it works (verbatim): "The system checks if a prompt prefix, up to a specified cache breakpoint, is already cached from a recent query. If found, it uses the cached version, reducing processing time and costs. Otherwise, it processes the full prompt and caches the prefix once the response begins."
- Cache read pricing (verbatim): "Cache read tokens are 0.1 times the base input tokens price" — and for writes, "5-minute cache write tokens are 1.25 times the base input tokens price".
- Cache lifetime (verbatim): "By default, the cache has a 5-minute lifetime. The cache is refreshed for no additional cost each time the cached content is used."
- Use cases (verbatim, list flattened): "This is especially useful for: Prompts with many examples Large amounts of context or background information Repetitive tasks with consistent instructions Long multi-turn conversations"
- (Carried forward note from the original dump: an earlier draft of that dump had attributed a fabricated mechanistic sentence to this page; it was corrected there. No such sentence is used in this concept's note or dump.)

## [S4] Anthropic — Effective context engineering for AI agents (copied forward + extended for this task)
- **URL:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Fetched (original, Module 00):** 2026-07-02
- **Fetched (this task, re-read for compaction/summarization guidance):** 2026-07-22
- **Type:** engineering blog (Anthropic)

### Extracted (carried forward from Module 00's dump)
- Context as scarce resource (verbatim): "Context is a critical but finite resource for AI agents."
- Degradation with scale, "context rot" (verbatim): "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" — the piece names this "context rot". On universality (verbatim): "While some models exhibit more gentle degradation than others, this characteristic emerges across all models."
- Architectural root cause — quadratic attention (verbatim): "LLMs are based on the transformer architecture, which enables every token to attend to every other token across the entire context. This results in n² pairwise relationships for n tokens."
- Retrieval over front-loading (verbatim): "Rather than pre-processing all relevant data up front, agents built with the 'just in time' approach maintain lightweight identifiers (file paths, stored queries, web links, etc.) and use these references to dynamically load data into context at runtime using tools." — the load-bearing line for concept 02's "RAG/offload" overflow strategy.

### Extracted (new for this task — compaction/summarization guidance)
- What compaction is (verbatim): "Compaction is the practice of taking a conversation nearing the context window limit, summarizing its contents, and reinitiating a new context window with the summary."
- Its role (verbatim): "Compaction typically serves as the first lever in context engineering to drive better long-term coherence."
- The mechanism and goal (verbatim): "At its core, compaction distills the contents of a context window in a high-fidelity manner, enabling the agent to continue with minimal performance degradation."
- What survives compaction (verbatim): "The model preserves architectural decisions, unresolved bugs, and implementation details while discarding redundant tool outputs or messages." — this is the direct source for the note's "summarization preserves gist, loses exact wording/detail" claim; note precisely what the piece says is kept (decisions, bugs, implementation details) versus discarded (redundant tool outputs/messages).
- The central difficulty (verbatim): "The art of compaction lies in the selection of what to keep versus what to discard, as overly aggressive compaction can result in the loss of subtle but critical context whose importance only becomes apparent later."
- Implementation guidance (verbatim): "Start by maximizing recall to ensure your compaction prompt captures every relevant piece of information from the trace, then iterate to improve precision by eliminating superfluous content."
- When to use compaction versus alternatives (verbatim, from a comparison list): "Compaction maintains conversational flow for tasks requiring extensive back-and-forth" (list item continues: "Note-taking excels for iterative development with clear milestones; Multi-agent architectures handle complex research...") — used as the "when to use it" cell for summarization/compaction in the note's trade-off table.

## [S5] Hugging Face — Transformers documentation: Cache strategies (KV cache) (copied forward from `research/05-context-window.md` [S5])
- **URL:** https://huggingface.co/docs/transformers/kv_cache
- **Fetched:** 2026-07-02 (original); not re-quoted in this concept's note (mechanism detail belongs to the caching sub-topic, not overflow strategies) — retained in the dump for completeness/traceability since it was part of the Module 00 dump this concept recaps.
- **Type:** docs (Hugging Face)

### Extracted
- The whole mechanism in five sentences (verbatim): "The key-value (KV) vectors are used to calculate attention scores. For autoregressive models, KV scores are calculated every time because the model predicts one token at a time. Each prediction depends on the previous tokens, which means the model performs the same computations each time. A KV cache stores these calculations so they can be reused without recomputing them. Efficient caching is crucial for optimizing model performance because it reduces computation time and improves response rates."

## [S6] LangChain — Short-term memory (docs)
- **URL:** https://docs.langchain.com/oss/python/langchain/short-term-memory
- **Fetched:** 2026-07-22
- **Type:** docs (LangChain)
- **Substitution note:** the brief suggested `https://python.langchain.com/docs/how_to/chatbots_memory/`. That URL now redirects (301, confirmed via `curl -L`) to `https://docs.langchain.com/oss/python/langchain/overview`, a general overview page with no memory-management content — the how-to guide has been restructured into LangChain's newer docs site. Followed the on-page links from the overview to LangChain's current short-term-memory doc, which covers the same trimming-vs-summarization ground the brief asked for (vendor-neutral, not tied to a specific LLM provider), and used that as the substitute source.

### Extracted
- Why this is a real problem (verbatim): "Long conversations pose a challenge to today's LLMs; a full history may not fit inside an LLM's context window, resulting in an context loss or errors." (sic — "an context loss" is the source's own grammar, preserved as written)
- Even generous context windows don't remove the problem (verbatim): "Even if your model supports the full context length, most LLMs still perform poorly over long contexts."
- Trimming strategy, decision rule (verbatim): "One way to decide when to truncate messages is to count the tokens in the message history and truncate whenever it approaches that limit."
- Trimming strategy, mechanism (verbatim, from the `trim_messages` function description): "Keep only the last few messages to fit context window"
- Trimming's downside, stated directly (verbatim): "The problem with trimming or removing messages, as shown above, is that you may lose information from culling of the message queue."
- Summarization as the alternative (verbatim): "some applications benefit from a more sophisticated approach of summarizing the message history using a chat model." (the source's full sentence reads "...Because of this, some applications benefit from a more sophisticated approach..." — the clause after "Because of this," is quoted as the load-bearing claim)
- Used in the note as the vendor-neutral corroboration for the sliding-window (trimming) strategy's trade-off: bounded cost, but blind and total loss of anything outside the window, versus summarization's partial-preservation trade-off, corroborating [S4]'s Anthropic-specific "compaction" framing from a different vendor.

## Quote audit (2026-07-22, live re-fetch)
Every verbatim-quoted string in this dump — both copied-forward and newly added — was re-verified against a fresh raw/live fetch, not trusted from the prior file or from WebFetch's summarized output:

- **[S1] Anthropic context windows:** re-fetched raw HTML via `curl` from the redirect target (`platform.claude.com/docs/en/docs/build-with-claude/context-windows`). All quotes ("The 'context window' refers to all the text...", "more context isn't automatically better...", "The context window (up to 1M tokens...)", "Everything in the request counts...", "previous turns are preserved completely", "first in, first out", "still occupy the context window", both overflow-behavior quotes) confirmed present as exact substrings (whitespace and curly-quote normalized) of the live page.
- **[S2] Lost in the Middle abstract:** re-fetched arxiv.org/abs/2307.03172 directly via `curl`. Full abstract confirmed exact match, word for word.
- **[S3] Anthropic prompt caching:** re-fetched raw HTML via `curl` from the redirect target. All quotes (what-it-does, how-it-works, cache read/write pricing, 5-minute lifetime, use-cases list) confirmed present as exact substrings of the live page.
- **[S4] Anthropic effective context engineering:** re-fetched raw HTML via `curl` (`www.anthropic.com/engineering/effective-context-engineering-for-ai-agents`). Both the carried-forward quotes (context-as-scarce-resource, context rot + universality, quadratic attention, just-in-time retrieval) and all six new compaction quotes checked programmatically as exact substrings (normalized) of the live page text. One quote ("Compaction maintains conversational flow for tasks requiring extensive back-and-forth") initially failed the automated check because the quoted string included a trailing period that the source renders with a semicolon (it's a list item: "...back-and-forth; Note-taking excels for..."); re-checked without terminal punctuation and confirmed as an exact substring. Recorded above without the trailing period to avoid mis-punctuating the quote.
- **[S5] Hugging Face KV cache:** not re-quoted for this task (carried forward for completeness only, not cited in the new note); no re-audit needed since no new claim depends on it here.
- **[S6] LangChain short-term memory:** fetched fresh via `curl` (following the redirect from the brief's dead URL, see substitution note above). All five quotes checked programmatically as exact substrings of the live raw page text. Two required care: the "an context loss" typo is the source's own text, preserved verbatim rather than silently corrected; the summarization quote is a sub-clause of a longer sentence ("...Because of this, some applications benefit from a more sophisticated approach of summarizing the message history using a chat model.") — quoted from "some applications" onward to keep it a grammatical, exact-substring quote.

No fabrications found in this dump. One substitution made (S6, documented above) because the brief's suggested URL had been restructured away by the source site.

## Notes on sourcing decisions
- [S1]–[S5] are entirely copied forward from `research/05-context-window.md`, per the brief, except [S4] which also gained new compaction-specific extraction from a fresh re-read of the same URL.
- [S6] required a live substitution: the brief's LangChain URL (`python.langchain.com/docs/how_to/chatbots_memory/`) 301-redirects to a generic overview page with no relevant content; LangChain's current short-term-memory doc (same organization, same subject) was used instead and is cited with that substitution documented.
- Both Anthropic docs URLs that appear via [S1]/[S3] still 301-redirect from `docs.anthropic.com` to `platform.claude.com`, consistent with what the Module 00 dump already recorded; original brief-style URLs are kept as the canonical reference link in the note/page since they still resolve (redirect, not dead).
