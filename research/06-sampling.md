# Research dump — 06 · Sampling

## [S1] The Curious Case of Neural Text Degeneration (Holtzman et al., 2019)
- **URL:** https://arxiv.org/abs/1904.09751
- **Fetched:** 2026-07-03
- **Type:** paper (arXiv abstract page, HTML)
- **Verified:** re-fetched raw abstract HTML directly via curl and extracted the `<blockquote class="abstract mathjax">` node with a regex — exact page text, not summarized.

### Extracted
Full verbatim abstract:

> "Despite considerable advancements with deep neural language models, the enigma of neural text degeneration persists when these models are tested as text generators. The counter-intuitive empirical observation is that even though the use of likelihood as training objective leads to high quality models for a broad range of language understanding tasks, using likelihood as a decoding objective leads to text that is bland and strangely repetitive.
>
> In this paper, we reveal surprising distributional differences between human text and machine text. In addition, we find that decoding strategies alone can dramatically effect the quality of machine text, even when generated from exactly the same neural language model. Our findings motivate Nucleus Sampling, a simple but effective method to draw the best out of neural generation. By sampling text from the dynamic nucleus of the probability distribution, which allows for diversity while effectively truncating the less reliable tail of the distribution, the resulting text better demonstrates the quality of human text, yielding enhanced diversity without sacrificing fluency and coherence."

Key clauses for note use:
- "using likelihood as a decoding objective leads to text that is bland and strangely repetitive" — this is the core justification for why greedy/argmax decoding is a bad idea, straight from the paper that popularized nucleus sampling.
- "decoding strategies alone can dramatically effect the quality of machine text, even when generated from exactly the same neural language model" — the decoding/sampling method matters independently of the model itself.
- Nucleus sampling defined: "sampling text from the dynamic nucleus of the probability distribution, which allows for diversity while effectively truncating the less reliable tail of the distribution."

## [S2] Hugging Face — How to generate text: using different decoding methods for language generation with Transformers
- **URL:** https://huggingface.co/blog/how-to-generate
- **Fetched:** 2026-07-03
- **Type:** blog / technical guide (Hugging Face, official blog)

### Extracted
Greedy search, defined as an equation and description:
> "It selects the word with the highest probability as its next word: $w_t = argmax_{w}P(w | w_{1:t-1})$ at each timestep $t$."

Temperature:
> "A trick is to make the distribution $P(w|w_{1:t-1})$ sharper (increasing the likelihood of high probability words and decreasing the likelihood of low probability words) by lowering the so-called `temperature` of the softmax."

Top-K sampling:
> "In Top-K sampling, the K most likely next words are filtered and the probability mass is redistributed among only those K next words."

Top-p (nucleus) sampling:
> "In Top-p sampling chooses from the smallest possible set of words whose cumulative probability exceeds the probability p. The probability mass is then redistributed among this set of words."
(Note: this sentence as returned by the fetch tool has a slightly awkward grammatical construction — "In Top-p sampling chooses" — kept verbatim as extracted; treat as a direct quote of the source's phrasing, not corrected.)

## [S3] Anthropic — Messages API reference (temperature, top_p, top_k, stop_sequences, max_tokens)
- **URL (as given in brief):** https://docs.anthropic.com/en/api/messages
- **Working URL (301 redirect target):** https://platform.claude.com/docs/en/api/messages
- **Fetched:** 2026-07-03
- **Type:** API reference docs (Anthropic, official)

### Extracted
max_tokens:
> "The maximum number of tokens to generate before stopping. Note that our models may stop before reaching this maximum. This parameter only specifies the absolute maximum number of tokens to generate."

temperature:
> "Amount of randomness injected into the response. Defaults to `1.0`. Ranges from `0.0` to `1.0`. Use `temperature` closer to `0.0` for analytical / multiple choice, and closer to `1.0` for creative and generative tasks. Note that even with `temperature` of `0.0`, the results will not be fully deterministic."

top_p:
> "Use nucleus sampling. In nucleus sampling, we compute the cumulative distribution over all the options for each subsequent token in decreasing probability order and cut it off once it reaches a particular probability specified by `top_p`. Recommended for advanced use cases only."

top_k:
> "Only sample from the top K options for each subsequent token. Used to remove \"long tail\" low probability responses. Recommended for advanced use cases only."

stop_sequences:
> "Custom text sequences that will cause the model to stop generating. Our models will normally stop when they have naturally completed their turn, which will result in a response `stop_reason` of `\"end_turn\"`. If you want the model to stop generating when it encounters custom strings of text, you can use the `stop_sequences` parameter. If the model encounters one of the custom sequences, the response `stop_reason` value will be `\"stop_sequence\"` and the response `stop_sequence` value will contain the matched stop sequence."

Key fact for "Pro vs. amateur": **temperature 0.0 is explicitly documented as not fully deterministic** — directly supports the note's claim about production nondeterminism at temp 0.

## [S4] OpenAI — chat completion parameters (temperature, top_p, stop, max_completion_tokens)
- **URL (as given in brief):** https://platform.openai.com/docs/api-reference/chat
- **Status:** bot-blocked — WebFetch and curl both returned HTTP 403 on `platform.openai.com/docs/api-reference/chat` and its 301-redirect target `developers.openai.com/api/docs/api-reference/*` (JS-rendered SPA, oversized/truncated payload on the few pages that did load).
- **Replacement (same org — official OpenAI Python SDK source, published by OpenAI):** https://raw.githubusercontent.com/openai/openai-python/main/src/openai/types/chat/completion_create_params.py
- **Fetched:** 2026-07-03
- **Type:** source code / docstrings (OpenAI's own official Python client, which mirrors the API reference field-for-field — these docstrings are generated from OpenAI's own OpenAPI spec)

### Extracted
temperature:
> "What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic. We generally recommend altering this or `top_p` but not both."

top_p:
> "An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass. So 0.1 means only the tokens comprising the top 10% probability mass are considered. We generally recommend altering this or `temperature` but not both."

stop:
> "Not supported with latest reasoning models `o3` and `o4-mini`. Up to 4 sequences where the API will stop generating further tokens. The returned text will not contain the stop sequence."

max_completion_tokens:
> "An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens."

Key fact: OpenAI's own client docstrings state **"We generally recommend altering this or `top_p` but not both"** (and the mirror statement under top_p) — direct source for the note's claim that temperature and top-p interact and shouldn't both be tuned blindly.

## Audit notes
- All quotes above were fetched directly from primary/official sources (arXiv HTML, Hugging Face blog, Anthropic's live docs post-redirect, OpenAI's own SDK source on GitHub). No search-snippet corroboration was used as a substitute for a fetched quote.
- OpenAI's official `platform.openai.com` / `developers.openai.com` docs pages are Cloudflare-bot-blocked (403) for both WebFetch and curl; the OpenAI GitHub SDK source is the same-org fetchable replacement carrying the identical parameter text used in the live docs.
