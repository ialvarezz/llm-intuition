# 01 · What is an LLM

## The one-sentence truth

An LLM is a next-token prediction machine. Given a sequence of tokens, it outputs a probability distribution over what token comes next [S2]. That's the entire operation. Chat, code generation, reasoning, summarization — everything you've watched an LLM do is that single step, called over and over, with the growing output fed back in as new input [S2].

It's worth sitting with how narrow that is. There is no separate "answer this question" mode and "write code" mode inside the model. There's one function: text-so-far in, distribution-over-next-token out. Every capability you associate with these systems is an emergent consequence of doing that one thing extremely well, at extreme scale, over extremely varied text.

## From autocomplete to assistant

If next-token prediction is really "just autocomplete," why does it feel like talking to something that understands you? Two things are doing the work: scale, and a second training stage.

Scale first. A model pretrained to predict the next token over a large enough slice of the internet has to implicitly learn grammar, facts, reasoning patterns, code syntax, and dialogue structure, because all of that is present in the statistical structure of the text it's trying to predict. Predicting the next word of a Python function correctly requires something that behaves like understanding Python. Predicting the next line of a physics proof requires something that behaves like following the proof. None of this is programmed in — it falls out of the prediction objective when the training data is broad and the network is large enough to absorb the patterns [S1].

But a model trained this way — called a **base model** — is still just a text continuer. It completes your prompt the way a plausible document would continue, not the way an assistant would respond: as Anthropic's glossary puts it, "these pretrained models are not inherently good at answering questions or following instructions, and often require deep skill in prompt engineering to elicit desired behaviors" [S3]. Ask a base model a question and it may well continue with more questions in the same style, because that's a statistically common pattern after a question in real documents.

Getting from that to something that behaves like an assistant is a second stage: **fine-tuning**. Human labelers write example ideal responses to prompts, and the base model is further trained to imitate that conversational, instruction-following behavior [S1]. Anthropic's docs put it plainly: "Claude is not a bare language model; it has already been fine-tuned to be a helpful assistant" [S3]. Pretraining is expensive and infrequent — run "once or twice a year" for a given model family [S1] — while fine-tuning is comparatively cheap and is what actually turns a raw predictor into a product. (Note 07 covers this training pipeline in more depth.)

## What "large" means

The "large" in "large language model" refers to the parameter count — the number of learned weights in the network [S3][S4]. Parameters are the numbers the model adjusts during training; at inference time they're fixed, and they're what turns an input sequence into an output distribution via a long chain of weighted sums and matrix multiplications [S2].

A rough scale ladder makes the growth concrete:

- **GPT-2** (2019): released in four sizes, topping out at **1.5 billion parameters** [S5].
- **GPT-3** (2020): **175 billion parameters** — about 10x more than any previous non-sparse language model at the time [S4]. To make that concrete: GPT-3's parameters are packed into roughly 28,000 matrices; just the embedding matrix, which maps each of its ~50,257 vocabulary tokens to a 12,288-dimensional vector, is about 617.5 million parameters on its own — and that's a small slice of the total [S2].
- **Frontier models today** are larger still, though labs have mostly stopped publishing exact counts.

The tempting misreading is to treat parameters as a database — as if "175 billion parameters" meant 175 billion facts stored somewhere, retrievable on demand. That's not what they are. Parameters encode statistical patterns learned across the entire training corpus, distributed across matrices that get combined at inference time. A single fact about the world is not sitting at a single addressable location; it's smeared across weights that also contribute to countless other outputs. This is why models "know" some things solidly, half-know others, and confidently state wrong things when the statistical pattern points the wrong way — there's no lookup step to fail loudly.

## The generation loop

The mechanism that produces everything an LLM outputs is a loop, and it's the same loop regardless of what you're asking for:

1. **Prompt** — your input text.
2. **Tokenize** — split into tokens (note 02 covers this step in detail).
3. **Forward pass** — the tokens are converted to embeddings and pushed through the network's layers [S2].
4. **Distribution** — the final layer produces a probability distribution over every possible next token [S2].
5. **Sample** — one token is drawn from that distribution (the sampling strategy affects the character of the output — note 06).
6. **Append** — the sampled token is added to the sequence.
7. **Repeat** — the extended sequence goes back through the loop, until a stop token is generated or a length limit is hit.

3Blue1Brown describes this exact predict-sample-repeat cycle and notes it's literally what produces the token-by-token appearance of ChatGPT typing out an answer in real time [S2].

The detail that trips people up: the model itself is stateless between calls. It doesn't remember the previous token it generated in some internal buffer; each forward pass takes the entire sequence so far as input from scratch. The growing sequence of tokens *is* the state — there is no other memory. This is also why context windows exist and matter (note 05): the "working memory" of the model is bounded by how much of that sequence it can look back over, and that's a hard architectural limit, not a setting you can nudge.

## What an LLM is not

A few things fall out directly from "it's a next-token predictor," but are easy to misattribute:

- **Not a knowledge base with lookups.** There's no query engine inside the model matching your question to a stored record. Every output is a generated continuation, shaped by statistical patterns absorbed during training — not retrieved from an index [S3][S4]. It can be right, wrong, or something in between, and it has no internal signal that flags which.
- **Not deterministic by default.** Even at the API's most conservative setting, "even with temperature set to 0, the results will not be fully deterministic and identical inputs may produce different outputs across API calls" [S3]. Sampling is inherent to the generation loop, not an optional add-on.
- **Doesn't "read" text the way you do.** It consumes tokens — the model never sees "words" or "characters" as such, only the token IDs your text gets mapped to (note 02).
- **No persistent memory between conversations.** Nothing it generates in one conversation is written back into its weights. A new conversation starts with an empty sequence; anything from a prior session is gone unless it's re-supplied as text in the new prompt (note 05).

## Pro vs. amateur

**Amateurs think in words and answers. Pros think in tokens and distributions.** Once you know the model's actual output is a probability distribution over the next token, and that "the answer" is one particular sample from a chain of those distributions, you stop being surprised when re-running the same prompt gives a different result, and you start reasoning about outputs as things you can nudge (via sampling settings, prompt phrasing, or context) rather than as fixed facts the model "decided."

**Amateurs treat hallucination as a bug. Pros know it's the mechanism working exactly as designed.** The model was never trained to be correct — it was trained to produce a fluent, statistically likely continuation of the input [S2][S1]. When the likely continuation happens to be true, that looks like knowledge. When it doesn't, that looks like hallucination. Both come out of the identical process; only the label we apply afterward differs. Anthropic's own glossary treats this as a known, named failure mode rather than an anomaly, defining an "honest" model as one that specifically tries "not [to] hallucinate or confabulate" [S3] — implying the untrained default is that it will.

**Amateurs assume the model can introspect its own output. Pros know it can't count reliably.** Because the model only ever sees tokens, not the underlying words or characters, and generates one token forward at a time without any built-in counting mechanism, asking it "how many words was that" or "how many r's are in strawberry" is asking it to do something structurally awkward for the architecture — it has to statistically approximate an answer to a question about its own output rather than actually tally anything (note 02 explains why the token/character mismatch causes this).

**Amateurs say "the model learned X." Pros translate that as "X was statistically present in the training data."** "Learned" implies understanding or verification; what actually happened is that the training process adjusted weights so that patterns present in the training corpus became more likely outputs [S1][S3]. If the training data was wrong, sparse, or biased on some topic, the model's behavior on that topic will reflect that, not some independent judgment the model formed.

## References

- Andrej Karpathy — [Intro to Large Language Models](https://www.youtube.com/watch?v=zjkBMFhNj_g) [S1]
- 3Blue1Brown — [But what is a GPT? Visual intro to Transformers](https://www.youtube.com/watch?v=wjZofJX0v4M) [S2]
- Anthropic — [Docs glossary](https://docs.anthropic.com/en/docs/resources/glossary) [S3]
- Brown et al. — [Language Models are Few-Shot Learners (GPT-3 paper)](https://arxiv.org/abs/2005.14165) [S4]
- OpenAI — [GPT-2 model card](https://github.com/openai/gpt-2/blob/master/model_card.md) [S5]
