# Research dump — 02 Tokens & tokenization

## [S1] Let's build the GPT Tokenizer (video)
- **URL:** https://www.youtube.com/watch?v=zduSFxRajkE
- **Fetched:** 2026-07-02
- **Type:** video
- **Note:** YouTube watch pages return only boilerplate to fetchers. Corroborated below via Karpathy's own `minbpe` repo (the code built live in this video) and a web search summarizing the lecture's public description/transcript excerpts.

### Extracted
- The video is a ~2-hour lecture building a GPT-style tokenizer from scratch, covering: the BPE algorithm, UTF-8/byte encoding, GPT-2's regex pre-chunking step, and hands-on construction of an encoder/decoder.
- Core BPE loop as summarized from the lecture content: "iteratively identify pairs of consecutive characters/tokens that appear the most often, define new tokens based on those, and replace them in the string... Byte-Pair Encoding starts from a base vocabulary and repeatedly merges the most frequent adjacent token pairs to create new tokens... continuing until a target vocabulary size is reached."
- "Tokens initially go from 0 to 255 in the BPE algorithm because we start with UTF-8 encoded bytes, and each byte can hold values from 0 to 255" — i.e. real BPE tokenizers start from raw bytes, not characters or words.
- "OpenAI's GPT-2 tokenizer applies a preprocessing chunking step using regex that segments text and runs BPE only within chunks to prevent undesirable merges such as joining words to punctuation."
- Related repos referenced by the lecture: OpenAI's GPT-2 repo, tiktoken, Karpathy's own `minbpe`, Google's SentencePiece.

## [S2] OpenAI tokenizer playground
- **URL:** https://platform.openai.com/tokenizer
- **Fetched:** 2026-07-02 (attempted; returned HTTP 403 to the fetch tool — same class of block as an authenticated/bot-gated interactive app)
- **Type:** docs (interactive tool)
- **Note:** Could not fetch the live page directly. It is not dead (it's a real, actively linked OpenAI tool), just inaccessible to the fetcher, so per protocol it is kept as the reference URL and its underlying claims (tokens vs. words, live tokenization) are corroborated via [S8], OpenAI's developer docs Key concepts page, which was fetched directly.

### Extracted (corroboration via [S8], fetched directly)
- The playground is the "tokenizer tool" OpenAI's own docs point users to "to test specific strings and observe how text converts into tokens" [see S8].
- The token/word rule of thumb it illustrates, per [S8]: "1 token is approximately 4 characters or 0.75 words for English text."

## [S3] tiktoken (GitHub)
- **URL:** https://github.com/openai/tiktoken
- **Fetched:** 2026-07-02
- **Type:** docs (README)

### Extracted
- "tiktoken is a fast BPE tokeniser for use with OpenAI's models."
- Byte pair encoding properties per the README: reversible and lossless; works on arbitrary text; compresses text (each token averages ~4 bytes); helps models recognize common subwords like "ing" for better generalization.
- Supported encoding names include `o200k_base`, `cl100k_base`, and model-specific encodings via `encoding_for_model()` (e.g. "gpt-4o") — i.e. different model families use different encodings/vocabularies.
- Performance claim: "tiktoken is between 3-6x faster than a comparable open source tokeniser" (measured against `GPT2TokenizerFast`, 1GB of text, GPT-2 tokeniser).
- Installable via `pip install tiktoken`; implementation is Python + Rust.

## [S4] Neural Machine Translation of Rare Words with Subword Units (BPE paper, Sennrich et al. 2015)
- **URL:** https://arxiv.org/abs/1508.07909
- **Fetched:** 2026-07-02
- **Type:** paper

### Extracted
- Abstract, verbatim opening: "Neural machine translation (NMT) models typically operate with a fixed vocabulary, but translation is an open-vocabulary problem."
- The paper's method encodes rare and unknown words as sequences of subword units rather than relying on whole-word dictionary lookups/backoffs — motivated by the intuition that different word classes (names, compounds, cognates/loanwords) can be translated via smaller sub-word units.
- It evaluates a "byte pair encoding compression algorithm" adapted for word segmentation, alongside character n-gram alternatives.
- Reported result: subword segmentation improved performance on WMT 15 English→German and English→Russian by 1.1 and 1.3 BLEU points respectively versus a dictionary-lookup baseline.
- Core mechanism: subword units let the model operate with a much smaller, fixed vocabulary while still being able to represent arbitrary (open) vocabulary through composition of learned pieces — this is the origin of using BPE merges to build a fixed-size subword vocabulary.

## [S5] minbpe (GitHub, Karpathy)
- **URL:** https://github.com/karpathy/minbpe
- **Fetched:** 2026-07-02
- **Type:** docs (README)
- **Note:** Extra source, added to corroborate [S1] with a creator-owned, fetchable written source (the code built live in the "Let's build the GPT Tokenizer" video).

### Extracted
- "Minimal, clean code for the (byte-level) Byte Pair Encoding (BPE) algorithm commonly used in LLM tokenization."
- The algorithm "runs on UTF-8 encoded strings" and is used by modern language models including GPT, Llama, and Mistral.
- BPE "was popularized for LLMs by the GPT-2 paper."
- Repo demonstrates tokenizers with adjustable vocabulary sizes, examples ranging from 4,096 up to 100K tokens; the first 256 tokens represent individual raw bytes, followed by learned merge tokens up to the target vocabulary size.
- Four implementations included: a base tokenizer class, a basic tokenizer, a regex-based tokenizer (mirroring GPT-2's pre-chunking), and a GPT-4-reproducing tokenizer.

## [S6] Anthropic docs — Glossary, "Tokens" entry
- **URL:** https://platform.claude.com/docs/en/about-claude/glossary
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** Extra source (docs.claude.com redirected here). Used to corroborate the "not words, not characters" framing and the whitespace/leading-space token behavior context from a second vendor.

### Extracted
- "Tokens are the smallest individual units of a language model, and can correspond to words, subwords, characters, or even bytes (in the case of Unicode)."
- "For Claude, a token approximately represents 3.5 English characters, though the exact number can vary depending on the language used."
- "Tokens are typically hidden when interacting with language models at the 'text' level but become relevant when examining the exact inputs and outputs of a language model."
- "Larger tokens enable data efficiency during inference and pretraining (and are utilized when possible), while smaller tokens allow a model to handle uncommon or never-before-seen words. The choice of tokenization method can impact the model's performance, vocabulary size, and ability to handle out-of-vocabulary words."

## [S7] Anthropic docs — Token counting
- **URL:** https://platform.claude.com/docs/en/build-with-claude/token-counting
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** Extra source. Used to corroborate "tokens govern pricing/context limits" and "the same text tokenizes differently across model families/tokenizers" with a concrete, quoted example.

### Extracted
- "Token counting lets you determine the number of tokens in a message before you send it to Claude... you can: Proactively manage rate limits and costs, Make smart model routing decisions, Optimize prompts to a specific length."
- "Claude Opus 4.7 and later Opus models, Claude Fable 5, Claude Mythos 5... use a newer tokenizer. The same input text produces approximately 30% more tokens than on earlier models." — direct, quoted evidence that identical text tokenizes to different counts depending on which model/tokenizer processes it.
- "Recount prompts against the model you plan to use rather than reusing counts measured against earlier models" — reinforces that token counts are not a fixed, model-independent property of a string.
- Token counting endpoint example: `{"input_tokens": 14}` for the short message "Hello, Claude" with system prompt "You are a scientist" — a concrete illustration that a handful of words produces a distinct, non-word-equal token count.

## [S8] OpenAI developer docs — Key concepts
- **URL:** https://developers.openai.com/api/docs/concepts
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** Extra source, fetched directly. Replaces an earlier snippet-only corroboration of the OpenAI Help Center article; this page states the tokens/words rule of thumb in OpenAI's own developer documentation.

### Extracted
- "Tokens represent commonly occurring sequences of characters."
- Rule of thumb, verbatim: "1 token is approximately 4 characters or 0.75 words for English text." — equivalently, roughly 1.3 tokens per word of English.
- The docs point users to OpenAI's tokenizer tool "to test specific strings and observe how text converts into tokens."
- Context limits are denominated in tokens: "the prompt and the generated output combined must be no more than the model's maximum context length."

## [S9] minbpe lecture.md (Karpathy — text version of the "Let's build the GPT Tokenizer" lecture)
- **URL:** https://github.com/karpathy/minbpe/blob/master/lecture.md (fetched raw: https://raw.githubusercontent.com/karpathy/minbpe/master/lecture.md)
- **Fetched:** 2026-07-02
- **Type:** docs (lecture transcript in text form, creator-owned)
- **Note:** Extra source. This is the written form of [S1]'s lecture, in Karpathy's own repo — used to source whitespace and spelling claims with direct quotes.

### Extracted
- On leading whitespace being part of the token, verbatim: "The token \" is\" (note that these is three characters, including the space in the front, this is important!) is index 318. Be careful with whitespace because it is absolutely present in the string and must be tokenized along with all the other characters, but is usually omitted in visualization for clarity." — i.e. " is" (with leading space) and "is" are different tokens with different IDs; the same applies to " at" (379), " the" (262), etc.
- On numbers fragmenting arbitrarily, verbatim: "numbers may be inconsistently decomposed by the tokenizer. For example, the number 127 is a single token of three characters, but the number 677 because two tokens: the token \" 6\" (again, note the space in the front!) and the token \"77\"." (sic — typos are in the original)
- On spelling, verbatim: "Why can't LLM spell words? **Tokenization**."
- "tokens are the fundamental \"atoms\" at the input to the LLM. And tokenization is the process for taking raw strings in Python and converting them to a list of tokens, and vice versa."
- On BPE vocabularies: schemes "work not on a character level, but on character chunk level. And the way these chunk vocabularies are constructed is by using algorithms such as the **Byte Pair Encoding** (BPE) algorithm."
