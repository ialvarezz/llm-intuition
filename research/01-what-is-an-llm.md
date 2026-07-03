# Research dump — Concept 01: What is an LLM

## [S1] Intro to Large Language Models
- **URL:** https://www.youtube.com/watch?v=zjkBMFhNj_g
- **Fetched:** 2026-07-02
- **Type:** video
- **Note:** Direct WebFetch of the YouTube watch page returned only footer/nav boilerplate (no transcript). Cross-checked via WebSearch against multiple independent write-ups of this talk (Andrej Karpathy, "Intro to Large Language Models") to confirm title, speaker, and content claims.

### Extracted
- An LLM is described as "completely defined by two files: a parameters file (the weights) and a run file (the code that implements the architecture)" — i.e., the model itself is just a big block of learned numbers plus a small amount of code to run them.
- LLMs are neural networks trained to predict the next word/token in a sequence.
- Two-stage lifecycle: **pretraining** produces a "base model" — a very expensive, infrequent (run "once or twice a year") compression of huge amounts of internet text into network weights, trained purely to predict the next token. A base model is functionally a "document generator": given "It's raining so I should bring an", it continues with tokens like "umbrella" rather than answering a question.
- **Fine-tuning** turns the base model into an "assistant model": human labelers write ideal responses to prompts, and the model is further trained (adjusted) to imitate that conversational behavior, enabling multi-turn dialogue and instruction-following instead of raw text continuation.

## [S2] But what is a GPT? Visual intro to Transformers (Deep Learning Chapter 5)
- **URL:** https://www.youtube.com/watch?v=wjZofJX0v4M
- **Fetched:** 2026-07-02
- **Type:** video
- **Note:** WebFetch of the YouTube watch page again returned only nav/footer text (title fragment "Transformers, the tech behind LLMs | Deep Learning Chapter 5" was visible). Supplemented with the creator's own written companion page at https://www.3blue1brown.com/lessons/gpt, which mirrors the video's content (3Blue1Brown, Grant Sanderson), fetched successfully.

### Extracted
- The model's output for a given input text is "a probability distribution over all chunks of text that might follow."
- Generation process: predict the next-token distribution → randomly sample from it → append the sampled token to the input → repeat, feeding the extended sequence back in. This predict-sample-repeat loop is explicitly named as the mechanism behind visible token-by-token generation in tools like ChatGPT.
- "Parameters are commonly referred to as weights" in deep learning — they interact with the input data through weighted sums, organized as matrices.
- GPT-3 has approximately 175 billion weights, organized into "just under 28,000 different matrices" across eight categories; the embedding matrix alone is 50,257 (vocabulary) × 12,288 (dimensions) ≈ 617.5 million parameters, with a similarly sized unembedding matrix — and these are described as a small fraction of the total.
- Pipeline: tokenize text → convert tokens to embedding vectors → process through alternating attention and feed-forward layers → produce logits → normalize via softmax into the final next-token probability distribution.

## [S3] Anthropic docs glossary
- **URL:** https://docs.anthropic.com/en/docs/resources/glossary
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** URL 301-redirects to `https://platform.claude.com/docs/en/docs/resources/glossary` (Anthropic moved its docs site); fetched the redirect target successfully — same content, same organization.

### Extracted
- **LLM:** "Large language models (LLMs) are AI language models with many parameters that are capable of performing a variety of surprisingly useful tasks. These models are trained on vast amounts of text data and can generate human-like text, answer questions, summarize information, and more."
- **Pretraining:** "Pretraining is the initial process of training language models on a large unlabeled corpus of text. ... autoregressive language models ... are pretrained to predict the next word, given the previous context of text in the document. These pretrained models are not inherently good at answering questions or following instructions, and often require deep skill in prompt engineering to elicit desired behaviors."
- **Fine-tuning:** "Fine-tuning is the process of further training a pretrained language model using additional data. ... Claude is not a bare language model; it has already been fine-tuned to be a helpful assistant."
- **Context window:** "the amount of text a language model can look back on and reference when generating new text... represents a 'working memory' for the model" — distinct from the training corpus.
- **Temperature:** "controls the randomness of a model's predictions during text generation... Users may encounter non-determinism in APIs. Even with temperature set to 0, the results will not be fully deterministic."
- **Tokens:** "the smallest individual units of a language model" — words, subwords, characters, or bytes; for Claude "a token approximately represents 3.5 English characters."
- **HHH / honesty:** "An honest AI will give accurate information, and not hallucinate or confabulate. It will acknowledge its limitations and uncertainties when appropriate" (implies hallucination is a named, known failure mode, not an edge-case bug).

## [S4] Language Models are Few-Shot Learners (GPT-3 paper, Brown et al. 2020)
- **URL:** https://arxiv.org/abs/2005.14165
- **Fetched:** 2026-07-02
- **Type:** paper

### Extracted
- Title: "Language Models are Few-Shot Learners." Authors: Tom B. Brown, Benjamin Mann, Nick Ryder, Melanie Subbiah, Jared Kaplan, et al. (OpenAI). Submitted May 28, 2020.
- Introduces **GPT-3**, with **175 billion parameters** — described in the paper as "10x more than any previous non-sparse language model."
- Central finding: scaling up an autoregressive language model substantially improves task-agnostic, few-shot performance — the model can perform many NLP tasks (translation, question-answering, reasoning) from prompt examples alone, "with no gradient updates or fine-tuning," purely via text prompts (in-context learning).
- The model can also generate text (e.g. news articles) fluent enough that human evaluators have difficulty distinguishing it from human-written text — an early documented case of fluent-but-not-necessarily-correct generation at scale.

## [S5] GPT-2 model card (OpenAI)
- **URL:** https://github.com/openai/gpt-2/blob/master/model_card.md
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** Used as a replacement for `openai.com/index/gpt-2-1-5b-release/`, which returned HTTP 403 Forbidden to automated fetch. Same organization (OpenAI), same underlying facts about GPT-2's size ladder — needed to source the "GPT-2 1.5B" end of the scale comparison called for in the brief.

### Extracted
- GPT-2 was released in four sizes: 124 million, 355 million, 774 million, and 1.5 billion parameters, with "1.5 billion parameters: the fourth and largest GPT-2 version."
