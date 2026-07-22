# Research dump — Module 01 Concept 01: Tokenization, deeper

## [S1] Let's build the GPT Tokenizer (video)
- **URL:** https://www.youtube.com/watch?v=zduSFxRajkE
- **Fetched:** 2026-07-02 (copied forward from `research/02-tokens-and-tokenization.md` [S1]; not re-fetched — same source, already researched for Module 00)
- **Type:** video
- **Note:** YouTube watch pages return only boilerplate to fetchers. Corroborated via Karpathy's own `minbpe` repo (the code built live in this video) and a web search summarizing the lecture's public description/transcript excerpts.

### Extracted
- The video is a ~2-hour lecture building a GPT-style tokenizer from scratch, covering: the BPE algorithm, UTF-8/byte encoding, GPT-2's regex pre-chunking step, and hands-on construction of an encoder/decoder.
- Core BPE loop as summarized from the lecture content: "iteratively identify pairs of consecutive characters/tokens that appear the most often, define new tokens based on those, and replace them in the string... Byte-Pair Encoding starts from a base vocabulary and repeatedly merges the most frequent adjacent token pairs to create new tokens... continuing until a target vocabulary size is reached."
- "Tokens initially go from 0 to 255 in the BPE algorithm because we start with UTF-8 encoded bytes, and each byte can hold values from 0 to 255" — real BPE tokenizers start from raw bytes, not characters or words.
- "OpenAI's GPT-2 tokenizer applies a preprocessing chunking step using regex that segments text and runs BPE only within chunks to prevent undesirable merges such as joining words to punctuation."
- Related repos referenced by the lecture: OpenAI's GPT-2 repo, tiktoken, Karpathy's own `minbpe`, Google's SentencePiece.
- (From the companion text source, `minbpe/lecture.md`, also copied forward): on leading whitespace, verbatim: "The token \" is\" (note that these is three characters, including the space in the front, this is important!) is index 318. Be careful with whitespace because it is absolutely present in the string and must be tokenized along with all the other characters, but is usually omitted in visualization for clarity." — i.e. `" is"` and `"is"` are different tokens with different IDs.
- On numbers fragmenting arbitrarily, verbatim: "numbers may be inconsistently decomposed by the tokenizer. For example, the number 127 is a single token of three characters, but the number 677 because two tokens: the token \" 6\" (again, note the space in the front!) and the token \"77\"." (sic — typos in original)
- On spelling, verbatim: "Why can't LLM spell words? **Tokenization**."

## [S2] Hugging Face — Chat templates
- **URL:** https://huggingface.co/docs/transformers/chat_templating
- **Fetched:** 2026-07-22
- **Type:** docs (Hugging Face)

### Extracted
- Core mechanism, verbatim: "The list of `role` and `content` dictionaries that you pass to a chat model get converted to a token sequence, often with control tokens like `<|user|>` or `<|assistant|>` or `<|end_of_message|>`, which allow the model to see the chat structure."
- "There are many possible chat formats, and different models may use different formats or control tokens, even if they were fine-tuned from the same base model!"
- Chat templates exist precisely to hide this: "Chat models come with **chat templates**, which indicate how they expect chats to be formatted." Accessed via the `apply_chat_template` method.
- Concrete example — Mistral-7B-Instruct renders a chat as: `<s>[INST] Hello, how are you? [/INST]I'm doing great. How can I help you today?</s> [INST] I'd like to show off how chat templating works! [/INST]` — using `[INST]`/`[/INST]` control tokens.
- Zephyr-7B (fine-tuned from the *same* Mistral-7B base) instead renders: `<|user|>\nHello, how are you?</s>\n<|assistant|>\nI'm doing great. How can I help you today?</s>\n...` — using `<|user|>`/`<|assistant|>` tokens instead. Same base model, different control-token vocabulary — proof that role markers are a template/vocabulary choice, not a universal constant.
- Why it matters, verbatim: "This is why chat templates are important - with the wrong control tokens, these models would have drastically worse performance."
- `add_generation_prompt=True` appends a token sequence (e.g. `<|im_start|>assistant`) indicating the assistant's turn is starting — without it, the model may "get confused and do something strange, like **continuing** the user's message instead of replying to it."
- A worked example shows the full token sequence for a `system`/`user` exchange rendered as `<|system|>\nYou are a friendly chatbot...\n<|user|>\n...\n<|assistant|>` — i.e. the system role, like user/assistant, becomes its own literal control token(s) in the sequence, not something the model just "knows" contextually.
- Warning in the docs: some tokenizers add special `<bos>`/`<eos>` tokens automatically, and chat templates already include the necessary special tokens — double-adding them ("hurting model performance") is a real, documented failure mode, underscoring that these are literal vocabulary entries with real token-budget weight, not cosmetic formatting.

## [S3] Neural Machine Translation of Rare Words with Subword Units (BPE paper, Sennrich et al. 2015)
- **URL:** https://arxiv.org/abs/1508.07909
- **Fetched:** 2026-07-02 (copied forward from `research/02-tokens-and-tokenization.md` [S4]; not re-fetched, same source already researched for Module 00). Quote re-verified live on 2026-07-22 (see Quote audit below) — full abstract confirmed as exact match.
- **Type:** paper

### Extracted
- Abstract, verbatim in full: "Neural machine translation (NMT) models typically operate with a fixed vocabulary, but translation is an open-vocabulary problem. Previous work addresses the translation of out-of-vocabulary words by backing off to a dictionary. In this paper, we introduce a simpler and more effective approach, making the NMT model capable of open-vocabulary translation by encoding rare and unknown words as sequences of subword units. This is based on the intuition that various word classes are translatable via smaller units than words, for instance names (via character copying or transliteration), compounds (via compositional translation), and cognates and loanwords (via phonological and morphological transformations). We discuss the suitability of different word segmentation techniques, including simple character n-gram models and a segmentation based on the byte pair encoding compression algorithm, and empirically show that subword models improve over a back-off dictionary baseline for the WMT 15 translation tasks English-German and English-Russian by 1.1 and 1.3 BLEU, respectively."
- Core mechanism: subword units let the model operate with a much smaller, fixed vocabulary while still being able to represent arbitrary (open) vocabulary through composition of learned pieces — this is the origin of using BPE merges to build a fixed-size subword vocabulary.
- This is a *learned* segmentation (via the byte pair encoding compression algorithm adapted for word segmentation), not a hand-written rule set — the vocabulary itself is fit to a training corpus.

## [S4] tiktoken (GitHub, OpenAI)
- **URL:** https://github.com/openai/tiktoken
- **Fetched:** 2026-07-22
- **Type:** docs (README)

### Extracted
- "Language models don't see text like you and I, instead they see a sequence of numbers (known as tokens)."
- Four properties of byte pair encoding per the README:
  1. "It's reversible and lossless, so you can convert tokens back into the original text"
  2. "It works on arbitrary text, even text that is not in the tokeniser's training data"
  3. Compression: "It compresses the text: the token sequence is shorter than the bytes corresponding to the original text. On average, in practice, each token corresponds to about 4 bytes."
  4. "It attempts to let the model see common subwords. For instance, 'ing' is a common subword in English, so BPE encodings will often split 'encoding' into tokens like 'encod' and 'ing'" — concrete, quoted illustration of a *learned* merge producing a linguistically sensible split.
- Supported encoding names include `o200k_base` and `cl100k_base`, accessible via `tiktoken.get_encoding()` and model-specific lookup via `tiktoken.encoding_for_model()` — i.e. different OpenAI model families use different named encodings (different learned vocabularies), not one universal tokenizer.
- Performance claim, verbatim: "tiktoken is between 3-6x faster than a comparable open source tokeniser" (measured against `GPT2TokenizerFast`, 1GB of text, GPT-2 tokeniser).
- The README does not state an explicit numeric vocabulary size for either encoding; the ~100k/~200k figures used in the note are the standard names (`cl100k_base` ≈ 100k, `o200k_base` ≈ 200k) as encoded in the encoding names themselves, corroborated by [S1]'s note that vocab sizes in this family run from the 256-byte base up through tens/hundreds of thousands of learned merges.

## Quote audit (2026-07-22, live re-fetch)
Every verbatim-quoted string above was re-fetched as raw/live text and checked as an exact substring (apostrophes/curly-quotes normalized to straight) of the source:
- [S2] Hugging Face chat_templating: re-fetched via raw GitHub markdown (`raw.githubusercontent.com/huggingface/transformers/main/docs/source/en/chat_templating.md`). All quotes ("The list of `role` and `content` dictionaries...", "Chat models come with **chat templates**...", "drastically worse performance") confirmed exact matches.
- [S3] BPE paper abstract: re-fetched arxiv.org/abs/1508.07909 directly. Full abstract confirmed exact match, word for word.
- [S4] tiktoken README: re-fetched via raw GitHub markdown (`raw.githubusercontent.com/openai/tiktoken/main/README.md`). All four bullet quotes plus the performance claim confirmed exact matches.
- [S1]: quotes are carried forward unchanged from the already-audited Module 00 dump (`research/02-tokens-and-tokenization.md`); YouTube pages remain unfetchable directly (boilerplate only), so this source is corroborated via `minbpe` rather than a raw re-fetch of the video page itself, consistent with the prior module's handling.

No fabrications found; no corrections needed for this dump.

## Notes on sourcing decisions
- All four brief URLs were fetchable (directly, or via already-audited prior research for [S1] and [S3]). No substitutions needed.
- [S2] and [S4] are the two genuinely new sources per the task brief and were fetched fresh for this dump.
