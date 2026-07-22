# Research: Attention & the Attention Curve

Module: Context & Reasoning — Concept 03.

Sources copied forward from `research/04-attention-and-transformers.md` and
`research/05-context-window.md` (verbatim, with re-verified quote audits),
plus any new replication source found for positional bias in long-context
recall.

## [S1] Liu et al. — Lost in the Middle: How Language Models Use Long Contexts (2023)
- **URL:** https://arxiv.org/abs/2307.03172
- **Fetched:** 2026-07-02 (original fetch, `research/05-context-window.md` [S2])
- **Type:** paper
- **Copied forward from:** `research/05-context-window.md` [S2], verbatim.

### Extracted
- Abstract (verbatim, in full): "While recent language models have the ability to take long contexts as input, relatively little is known about how well they use longer context. We analyze the performance of language models on two tasks that require identifying relevant information in their input contexts: multi-document question answering and key-value retrieval. We find that performance can degrade significantly when changing the position of relevant information, indicating that current language models do not robustly make use of information in long input contexts. In particular, we observe that performance is often highest when relevant information occurs at the beginning or end of the input context, and significantly degrades when models must access relevant information in the middle of long contexts, even for explicitly long-context models. Our analysis provides a better understanding of how language models use their input context and provides new evaluation protocols for future long-context language models."
- This is the direct source for "lost in the middle": position-dependent recall — best at the start/end of context, worst in the middle — holding even for models built specifically for long context. This is the primary, load-bearing source for the entire "attention curve" concept in this page.

### Quote audit (2026-07-21)
- Re-fetched https://arxiv.org/abs/2307.03172 as raw text. The abstract quoted above is an exact substring of the live page (checked word-for-word, no paraphrase drift, curly/straight quotes normalized). CONFIRMED.

## [S2] Jay Alammar — The Illustrated Transformer
- **URL:** https://jalammar.github.io/illustrated-transformer/
- **Fetched:** 2026-07-02 (original fetch, `research/04-attention-and-transformers.md` [S2])
- **Type:** blog / illustrated explainer
- **Copied forward from:** `research/04-attention-and-transformers.md` [S2], verbatim (subset relevant to this page's recap).

### Extracted
- The canonical coreference example sentence (verbatim, no trailing period in source — see audit note): "The animal didn't cross the street because it was too tired"
- What self-attention does with it (verbatim): "When the model is processing the word 'it', self-attention allows it to associate 'it' with 'animal'."
- Query/Key/Value are computed vectors, not inherent properties (verbatim): "The first step in calculating self-attention is to create three vectors from each of the encoder's input vectors (in this case, the embedding of each word). So for each word, we create a Query vector, a Key vector, and a Value vector. These vectors are created by multiplying the embedding by three matrices that we trained during the training process."

### Quote audit (2026-07-21)
- Re-fetched https://jalammar.github.io/illustrated-transformer/ directly via curl (raw HTML, not the fetch-summarizer) and grepped for each quote as an exact substring after stripping tags/normalizing whitespace and curly quotes.
- **Correction:** the example-sentence quote copied forward from `research/04-attention-and-transformers.md` had a trailing period ("...too tired.") that is NOT present in the live page — the source renders it as `The animal didn't cross the street because it was too tired` (no period, inside typographic quote marks, followed by a new sentence "What does..."). Fixed above to drop the trailing period.
- The "When the model is processing..." quote confirmed as an exact substring (including its internal curly-quoted "it"/"animal"). CONFIRMED after correction.

## [S3] Attention Is All You Need (Vaswani et al., 2017)
- **URL:** https://arxiv.org/abs/1706.03762
- **Fetched:** 2026-07-02 (original fetch, `research/04-attention-and-transformers.md` [S1]; full text pulled from https://arxiv.org/html/1706.03762v7)
- **Type:** paper
- **Copied forward from:** `research/04-attention-and-transformers.md` [S1], verbatim (subset relevant to this page: why attention is a weighting operation, not a lookup, and why cost scales with sequence length/position count).

### Extracted
- Self-attention definition (verbatim): "Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence."
- Quadratic cost (verbatim): "Self-Attention: O(n² · d)" and "a self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations." — n is sequence length. Relevant here as the mechanical reason attention mass gets spread thin as the number of competing tokens grows.
- Causal masking (verbatim, newly extracted for this page — not in the original 04 dump): "We also modify the self-attention sub-layer in the decoder stack to prevent positions from attending to subsequent positions. This masking, combined with fact that the output embeddings are offset by one position, ensures that the predictions for position i can depend only on the known outputs at positions less than i." This is the load-bearing source for this page's "primacy" argument: causal masking means every later token's prediction is conditioned on all earlier tokens, but never the reverse — early tokens structurally cannot be conditioned on anything that comes after them.

### Quote audit (2026-07-21)
- Re-fetched https://arxiv.org/html/1706.03762v7 as raw text. All three quotes confirmed as exact substrings of the live page. CONFIRMED.
- Note: an earlier draft of this dump attempted to attribute a causal-masking quote to 3Blue1Brown's written lesson (https://www.3blue1brown.com/lessons/attention), copying forward from `research/04-attention-and-transformers.md` [S3]'s line "The masking process is done to prevent later tokens from influencing earlier ones." A raw re-fetch of the live page (following its redirect) found this text only inside an interactive fill-in-the-blank quiz widget ("The masking process is done to prevent ___ tokens from influencing ___ tokens," with the correct answers as selectable options), not as static prose. Presenting quiz-widget text with blanks filled in as a verbatim quote would misrepresent the source, so 3Blue1Brown was NOT used as a source in this dump, and the causal-masking claim is instead sourced directly from Vaswani et al.'s own verbatim text above, which states the same fact unambiguously as static prose.

## [S4] Anthropic — Effective context engineering for AI agents
- **URL:** https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- **Fetched:** 2026-07-02 (original fetch, `research/05-context-window.md` [S4])
- **Type:** engineering blog (Anthropic)
- **Copied forward from:** `research/05-context-window.md` [S4], verbatim (subset relevant to this page: long-context ≠ uniform quality).

### Extracted
- Degradation with scale, "context rot" (verbatim): "as the number of tokens in the context window increases, the model's ability to accurately recall information from that context decreases" — the piece names this "context rot". On universality (verbatim): "While some models exhibit more gentle degradation than others, this characteristic emerges across all models."
- Architectural root cause — quadratic attention (verbatim): "LLMs are based on the transformer architecture, which enables every token to attend to every other token across the entire context. This results in n² pairwise relationships for n tokens."

### Quote audit (2026-07-21)
- Re-fetched https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents as raw text. Both quotes confirmed as exact substrings of the live page. CONFIRMED. (Note: `research/05-context-window.md`'s dump already documents that an earlier draft of this same quote was caught as a fabrication and corrected on 2026-07-02 — the text above is the corrected, re-verified version, and this independent re-check on 2026-07-21 confirms it again.)

## [S5] Yu et al. — Found in the Middle: Calibrating Positional Attention Bias Improves Long Context Utilization (2024)
- **URL:** https://arxiv.org/abs/2406.16008
- **Fetched:** 2026-07-21
- **Type:** paper (ACL Findings 2024; MIT / Google Cloud AI)
- **Why added:** the brief calls for one replication/follow-up source on positional bias, if it fetches cleanly. This one does — it directly explains the *mechanism* behind Liu et al.'s [S1] "lost in the middle" behavioral finding, in terms of a measurable U-shaped attention bias. Search was bounded to one WebSearch query plus this one fetch, per the brief's instruction to keep it bounded.

### Extracted
- Abstract (verbatim, in full): "Large language models (LLMs), even when specifically trained to process long input contexts, struggle to capture relevant information located in the middle of their input. This phenomenon has been known as the lost-in-the-middle problem. In this work, we make three contributions. First, we set out to understand the factors that cause this phenomenon. In doing so, we establish a connection between lost-in-the-middle to LLMs' intrinsic attention bias: LLMs exhibit a U-shaped attention bias where the tokens at the beginning and at the end of its input receive higher attention, regardless of their relevance. Second, we mitigate this positional bias through a calibration mechanism, found-in-the-middle, that allows the model to attend to contexts faithfully according to their relevance, even though when they are in the middle. Third, we show found-in-the-middle not only achieves better performance in locating relevant information within a long context, but also eventually leads to improved retrieval-augmented generation (RAG) performance across various tasks, outperforming existing methods by up to 15 percentage points."
- This is the direct mechanistic corroboration of the U-shape: the paper measures a "U-shaped attention bias" in the model's actual attention weights (beginning/end tokens receive higher attention "regardless of their relevance"), independent of Liu et al.'s behavioral (task-accuracy) measurement. Two independent methodologies — one behavioral, one attention-weight-based — arriving at the same U-shape is the basis for treating the curve as a real, replicated phenomenon rather than an artifact of one eval design.

### Quote audit (2026-07-21)
- Re-fetched https://arxiv.org/abs/2406.16008 directly via curl (raw HTML, not the fetch-summarizer) and confirmed the abstract quoted above is an exact substring of the live page text (tags stripped, whitespace collapsed, HTML entity `&#39;` normalized to `'`). CONFIRMED.

## Notes on sourcing decisions
- All copied-forward quotes from `research/04-attention-and-transformers.md` and `research/05-context-window.md` were independently re-fetched (via raw `curl`, not the WebFetch summarizer, to avoid the fabrication risk documented in this repo's history) and re-verified against the live pages on 2026-07-21. One discrepancy was found and fixed: the 3Blue1Brown/Illustrated-Transformer example sentence had a trailing period in the old dump that does not exist on the live page — corrected in [S2] above.
- New replication source search: one WebSearch for `"Found in the Middle" 2024 paper long context positional bias LLM`, one fetch of the top clean-fetching hit. [S5] (arXiv 2406.16008, ACL Findings 2024) fetched cleanly and is a genuine primary source — added. No further searching was done, per the brief's instruction to keep this bounded.
- Liu et al. 2023 [S1] remains the primary behavioral source for the "lost in the middle" recall curve; [S5] is corroborating/mechanistic, not a replacement.

