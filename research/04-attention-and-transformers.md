# Research dump — Concept 04: Attention & Transformers

## [S1] Attention Is All You Need
- **URL:** https://arxiv.org/abs/1706.03762
- **Fetched:** 2026-07-02
- **Type:** paper
- **Author/Org:** Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, Polosukhin (Google), 2017
- **Note:** the abstract page alone doesn't carry the architectural detail; full text pulled from the HTML rendering at https://arxiv.org/html/1706.03762v7 (same paper, same arXiv id).

### Extracted
- Abstract (verbatim): "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks in an encoder-decoder configuration. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely."
- Performance: the model "achieves 28.4 BLEU on the WMT 2014 English-to-German translation task" and a "new single-model state-of-the-art BLEU score of 41.8 after training for 3.5 days on eight GPUs."
- Parallelization claim (verbatim): models are "superior in quality while being more parallelizable and requiring significantly less time to train."
- Why RNNs don't parallelize (verbatim): "Aligning the positions to steps in computation time, they generate a sequence of hidden states h_t, as a function of the previous hidden state h_{t-1} and the input for position t. This inherently sequential nature precludes parallelization within training examples."
- Self-attention definition (verbatim): "Self-attention, sometimes called intra-attention is an attention mechanism relating different positions of a single sequence in order to compute a representation of the sequence."
- Multi-head motivation (verbatim): "Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this."
- Positional encoding purpose (verbatim): "Since our model contains no recurrence and no convolution, in order for the model to make use of the order of the sequence, we must inject some information about the relative or absolute position of the tokens in the sequence."
- Quadratic cost (Table 1 + surrounding text, verbatim): "Self-Attention: O(n² · d)" and "a self-attention layer connects all positions with a constant number of sequentially executed operations, whereas a recurrent layer requires O(n) sequential operations." — n is sequence length, d is representation dimension. This is the load-bearing source for "attention cost grows quadratically with sequence length."

## [S2] Jay Alammar — The Illustrated Transformer
- **URL:** https://jalammar.github.io/illustrated-transformer/
- **Fetched:** 2026-07-02
- **Type:** blog / illustrated explainer

### Extracted
- The canonical coreference example sentence (verbatim): "The animal didn't cross the street because it was too tired."
- What self-attention does with it (verbatim): "When the model is processing the word 'it', self-attention allows it to associate 'it' with 'animal'."
- Query/Key/Value are computed vectors, not inherent properties (verbatim): "The first step in calculating self-attention is to create three vectors from each of the encoder's input vectors (in this case, the embedding of each word). So for each word, we create a Query vector, a Key vector, and a Value vector. These vectors are created by multiplying the embedding by three matrices that we trained during the training process." Also (verbatim, on the abstraction point): "What are the 'query', 'key', and 'value' vectors? They're abstractions that are useful for calculating and thinking about attention."
- Multi-head, two stated benefits (verbatim): "It expands the model's ability to focus on different positions...It gives the attention layer multiple 'representation subspaces'."
- Positional encoding, why it's needed (verbatim): "To address this, the transformer adds a vector to each input embedding...helps it determine the position of each word." (addressing the model's lack of inherent word-order signal.)
- Feed-forward sub-layer (verbatim): "Each one is broken down into two sub-layers...The outputs of the self-attention layer are fed to a feed-forward neural network."
- Stacking (verbatim): "The encoding component is a stack of encoders (the paper stacks six of them on top of each other – there's nothing magical about the number six, one can definitely experiment with other arrangements). The decoding component is a stack of decoders of the same number."

## [S3] 3Blue1Brown — Attention in transformers, visually explained (written lesson)
- **URL:** https://www.3blue1brown.com/lessons/attention
- **Fetched:** 2026-07-02
- **Type:** written lesson (companion to the YouTube video referenced in the note/page, `https://www.youtube.com/watch?v=eMlx5fFNoYc`, embed `https://www.youtube.com/embed/eMlx5fFNoYc`)
- **Note on corroboration:** the YouTube watch page itself returns boilerplate on fetch; this is the creator's own written version of the same lesson, same author, same argument, directly fetchable and quotable.

### Extracted
- Purpose of the attention block (verbatim): "The aim of a transformer is to progressively adjust these embeddings so that they don't merely encode data of an individual word, but rather a much richer contextual meaning."
- The worked example sentence (verbatim): "Imagine that our input includes the phrase: A fluffy blue creature roamed the verdant forest. Suppose that the only type of update that we care about, for now, is having the adjectives in the phrase adjust the initial embeddings of their corresponding nouns."
- Query, plain-language framing (verbatim): "For the first step in this attention block, we can imagine each noun in the sentence asking the question: 'Hey, are there any adjectives sitting in front of me?' These questions...are somehow encoded as yet another vector that we call the query."
- Key, plain-language framing (verbatim): "Conceptually, we want to think of these keys as potential answers to the queries...we might imagine that the key matrix maps the adjectives like fluffy and blue to vectors that are closely aligned with the query produced by the word creature."
- Value vector role (verbatim): "The value vector is something that would be added to the embedding of the second word...to move it to a different part of the dimensional embedding space."
- Long-range information transfer (verbatim): "This transfer of information from the embedding of one token to that of another can occur over potentially large distances and can involve information that's much richer than just a single word."
- Causal masking (verbatim): "The masking process is done to prevent later tokens from influencing earlier ones."
- Dot product as relevance score (verbatim): "A larger dot product corresponds to stronger alignment."

## [S4] Anthropic — Transformer Circuits: A Mathematical Framework for Transformer Circuits
- **URL:** https://transformer-circuits.pub/2021/framework/index.html
- **Fetched:** 2026-07-02
- **Type:** research article (Anthropic)

### Extracted
- Attention heads act independently and additively (verbatim): "Attention heads are independent operations, each outputting a result which is added into the residual stream."
- Two sub-computations per head (verbatim): "Attention heads can be understood as having two largely independent computations: a QK ('query-key') circuit which computes the attention pattern, and an OV ('output-value') circuit."
- Interpretability caveat — attention weights alone aren't the whole explanation (verbatim): "Attention-only models can be written as a sum of interpretable end-to-end functions mapping tokens to changes in logits...linear if one freezes the attention patterns." (I.e., a clean, human-readable account of "what a head is doing" only holds if you treat the attention pattern as fixed and separately account for it — the weights are not themselves a self-contained explanation of model behavior.)
- Multiple heads per layer, operating in parallel (verbatim): "Each attention layer consists of multiple heads, which operate in parallel."
- Transformer block composition (verbatim): "Each residual block consists of an attention layer, followed by an MLP layer. Both...read their input from the residual stream...and write their result...by adding a linear projection back in."
- Scale note (verbatim): modern transformers like GPT-3 have "96 layers and alternates attention blocks with MLP blocks."

## Notes on sourcing decisions
- The video reference in the brief is a YouTube watch page (`https://www.youtube.com/watch?v=eMlx5fFNoYc`); per protocol this was corroborated via [S3], the creator's own written lesson on the same site that hosted the concept-01 GPT lesson, rather than quoting the unfetchable watch page.
- All four brief-specified references were fetched successfully; no replacement sources were needed for 403s. [S1]'s abstract-only landing page was supplemented with the same paper's HTML full-text mirror (still arXiv, same paper) to reach the architectural claims (self-attention definition, multi-head motivation, positional encoding, quadratic complexity) that the abstract page doesn't contain.
