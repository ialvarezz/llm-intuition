# Research dump — Concept 03: Embeddings

## [S1] Efficient Estimation of Word Representations in Vector Space (word2vec paper)
- **URL:** https://arxiv.org/abs/1301.3781
- **Fetched:** 2026-07-02
- **Type:** paper
- **Author/Org:** Mikolov, Chen, Corrado, Dean (Google), 2013

### Extracted
- Abstract (verbatim): "We propose two novel model architectures for computing continuous vector representations of words from very large data sets. The quality of these representations is measured in a word similarity task, and the results are compared to the previously best performing techniques based on different types of neural networks. We observe large improvements in accuracy at much lower computational cost, i.e. it takes less than a day to learn high quality word vectors from a 1.6 billion words data set. Furthermore, we show that these vectors provide state-of-the-art performance on our test set for measuring syntactic and semantic word similarities."
- The abstract itself does **not** contain the "king − man + woman ≈ queen" example — checked directly. That specific analogy example is documented as coming from the companion paper, Mikolov, Yih & Zweig, "Linguistic Regularities in Continuous Space Word Representations" (NAACL 2013), per web search (Marek Rei's summary: "The idea of Mikolov et al. (2013) was that the vector offset of vectors should reflect their relation (man − woman ≈ king − queen)").
- Core claim usable without over-attributing an unverified quote: word2vec produces "continuous vector representations of words" whose quality is measured by how well they capture "syntactic and semantic word similarities" — i.e., words that behave alike land near each other in the vector space. This is the load-bearing fact for "embedding = learned vector positioning a token by similarity."

## [S2] OpenAI — Embeddings guide
- **URL (brief's URL, redirects):** https://platform.openai.com/docs/guides/embeddings → 301 → https://developers.openai.com/api/docs/guides/embeddings
- **Fetched:** 2026-07-02
- **Type:** docs
- **Note:** Recording both URLs; the redirect target is the current working page.

### Extracted
- Definition: an embedding is "a vector (list) of floating point numbers" that measures text relatedness.
- Distance/similarity: "small distances suggest high relatedness and large distances suggest low relatedness." Cosine similarity is the recommended comparison metric — "computationally efficient for normalized embeddings and produces identical rankings to Euclidean distance."
- Uses: search with relevance ranking, clustering, recommendations, anomaly detection, measuring dataset diversity, classification by semantic similarity.
- Dimensionality: `text-embedding-3-small` defaults to 1536 dimensions; `text-embedding-3-large` defaults to 3072. Both support a `dimensions` API parameter to shrink the vector "without sacrificing concept representation" (i.e., a cost/nuance trade-off is a documented, adjustable knob, not just a fixed model property).
- Pricing: billed per input token; `text-embedding-3-small` is far cheaper per page than `-large` (roughly 62,500 pages/$ vs 9,615 pages/$) — supports "embedding models are much cheaper than chat models" framing at a relative level (small vs. large embedding model), though this fetch did not surface a direct chat-vs-embedding price comparison line.
- Embeddings are described as a distinct, specialized model class, separate from chat/generation models — "transformational tools that convert text into numerical representations for downstream applications."

## [S3] Google — Machine Learning Crash Course: Embeddings
- **URL:** https://developers.google.com/machine-learning/crash-course/embeddings
- **Fetched:** 2026-07-02
- **Type:** docs

### Extracted
- Definition (verbatim-adjacent): embeddings are "lower-dimensional representations of sparse data" that solve problems inherent to one-hot encoding.
- Problem with one-hot vectors: with e.g. 5,000 possible items, "large input vectors mean a huge number of weights for a neural network," which costs more data, compute, memory, and complicates on-device deployment.
- Semantic gap in one-hot encoding: "one-hot encoding vectors lack meaningful relationships, failing to capture semantic similarities between items, like the example of hot dogs and shawarmas being more similar than hot dogs and salads."
- Embeddings fix this by being "dense vector representations that capture semantic relationships and reduce the dimensionality of data, improving efficiency and performance in machine learning models."
- Page references word2vec as an example of embeddings in practice but this fetch did not surface an explicit cosine-similarity formula from the page.

## [S4] Anthropic — Embeddings docs
- **URL (brief's URL, redirects):** https://docs.anthropic.com/en/docs/build-with-claude/embeddings → 301 → https://platform.claude.com/docs/en/docs/build-with-claude/embeddings
- **Fetched:** 2026-07-02
- **Type:** docs
- **Known risk confirmed:** the brief's URL is a dead/redirected path. Current working URL is `https://platform.claude.com/docs/en/docs/build-with-claude/embeddings`. Using the redirect target as the reference link in the note/page.

### Extracted
- Opening line (verbatim): "Text embeddings are numerical representations of text that enable measuring semantic similarity."
- "Anthropic does not offer its own embedding model." It recommends Voyage AI as a third-party provider, explicitly saying "you should assess a variety of embeddings vendors to find the best fit for your specific use case" — direct support for "embedding models are separate from chat models," even more strongly than OpenAI's page, since Anthropic (a chat-model vendor) ships zero embedding models of its own.
- Selection factors it lists: "Dataset size & domain specificity," "Inference performance," "Customization" — i.e., picking an embedding model is its own decision, independent of which chat model you use.
- Dimensionality example: Voyage's `voyage-4` models offer "1024 (default), 256, 512, 2048" embedding dimensions — reinforcing that dimension count is a tunable trade-off, not fixed.
- Domain-specific models: `voyage-code-3` "Optimized for **code** retrieval," `voyage-law-2` for legal, `voyage-finance-2` for finance — direct support for "a model tuned on code ranks things differently than a general one."
- On similarity: "Voyage AI embeddings are normalized to length 1, which means that: Cosine similarity is equivalent to dot-product similarity... Cosine similarity and Euclidean distance will result in the identical rankings."
- Retrieval/RAG relevance: worked example embeds a corpus of documents plus a query, then "conduct[s] a nearest neighbor search to find the most relevant document based on the distance in the embedding space" — directly supports "semantic search and RAG run on embedding proximity."
- Note on comparing across models: nothing on this page explicitly says "never mix vectors from two models," but the fact that different Voyage models produce different dimension counts (256 vs. 1024 vs. 3072 elsewhere) makes clear vectors from different models/configs are structurally incompatible for direct distance comparison — this is a reasonable inference from the dimension-mismatch fact, not a verbatim claim, so the note should phrase it as a structural consequence rather than a quoted rule.

## [S5] Piotr Migdał — "king − man + woman is queen; but why?"
- **URL:** https://p.migdal.pl/blog/2017/01/king-man-woman-queen-why/
- **Fetched:** 2026-07-02
- **Type:** post
- **Why added:** the word2vec abstract (S1) doesn't itself contain the king/queen example, so this source supports the analogy's limits/caveats with a fetchable, quotable source, and is written by an ML practitioner explaining the mechanism in plain terms.

### Extracted
- Refers to "the famous `king - man + woman = queen`" as a widely-known word2vec-era result (companion paper, not the original word2vec paper itself, per S1's finding).
- Caveat, verbatim: "all results are a function of the data we used to feed our algorithm, not objective truth; so it is easy to get stereotypes like `doctor - man + woman = nurse`."
- Also notes, verbatim: "linear space of meaning is a disputed concept" — i.e., the analogy is a useful intuition pump, not a guaranteed or fully principled property of embedding spaces.

## Redirect log (for report)
- OpenAI embeddings guide: `https://platform.openai.com/docs/guides/embeddings` → 301 → `https://developers.openai.com/api/docs/guides/embeddings` (used as reference link).
- Anthropic embeddings docs: `https://docs.anthropic.com/en/docs/build-with-claude/embeddings` → 301 → `https://platform.claude.com/docs/en/docs/build-with-claude/embeddings` (used as reference link; confirms the brief's "known risk").
