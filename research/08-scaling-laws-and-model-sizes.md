# Research dump — 08 Scaling laws & model sizes

## [S1] Scaling Laws for Neural Language Models (Kaplan et al., 2020)
- **URL:** https://arxiv.org/abs/2001.08361
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Kaplan et al., 2020, OpenAI)

### Extracted
Abstract, verbatim: "We study empirical scaling laws for language model performance on the cross-entropy loss. The loss scales as a power-law with model size, dataset size, and the amount of compute used for training, with some trends spanning more than seven orders of magnitude. Other architectural details such as network width or depth have minimal effects within a wide range. Simple equations govern the dependence of overfitting on model/dataset size and the dependence of training speed on model size. These relationships allow us to determine the optimal allocation of a fixed compute budget. Larger models are significantly more sample-efficient, such that optimally compute-efficient training involves training very large models on a relatively modest amount of data and stopping significantly before convergence."

Notes: This is the paper that establishes that loss is a smooth, predictable power-law function of model size, dataset size, and compute — not a noisy or unpredictable relationship. It's also the paper whose compute-allocation recommendation ("very large models on a relatively modest amount of data") Chinchilla (S2) later revises.

---

## [S2] Training Compute-Optimal Large Language Models / "Chinchilla" (Hoffmann et al., 2022)
- **URL:** https://arxiv.org/abs/2203.15556
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Hoffmann et al., 2022, DeepMind)

### Extracted
Abstract, verbatim: "We investigate the optimal model size and number of tokens for training a transformer language model under a given compute budget. We find that current large language models are significantly undertrained, a consequence of the recent focus on scaling language models whilst keeping the amount of training data constant. By training over 400 language models ranging from 70 million to over 16 billion parameters on 5 to 500 billion tokens, we find that for compute-optimal training, the model size and the number of training tokens should be scaled equally: for every doubling of model size the number of training tokens should also be doubled. We test this hypothesis by training a predicted compute-optimal model, Chinchilla, that uses the same compute budget as Gopher but with 70B parameters and 4× more more data. Chinchilla uniformly and significantly outperforms Gopher (280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B) on a large range of downstream evaluation tasks. This also means that Chinchilla uses substantially less compute for fine-tuning and inference, greatly facilitating downstream usage. As a highlight, Chinchilla reaches a state-of-the-art average accuracy of 67.5% on the MMLU benchmark, greater than a 7% improvement over Gopher."

Note on the "4× more more data" phrase: confirmed via two independent WebFetch passes on the arXiv abstract page (both returned the identical duplicated "more more"), so it is reproduced above exactly as the source renders it — most likely a LaTeX-to-text rendering artifact on arXiv's abstract page (source markup is probably `4$\times$ more data`), not a claim that data was quadrupled twice. Downstream text in the note/page paraphrases this as "four times as much data" rather than repeating the odd double-"more", since the intended meaning (4×) is unambiguous from context and from "for every doubling of model size the number of training tokens should also be doubled" earlier in the same abstract.

Key facts extracted for downstream use:
- Compute-optimal scaling rule: "for every doubling of model size the number of training tokens should also be doubled" — i.e. model size and training tokens should scale together, not model size alone.
- Chinchilla: 70B parameters, same compute budget as Gopher (280B params), trained on 4× the data Gopher used.
- Chinchilla "uniformly and significantly outperforms Gopher (280B), GPT-3 (175B), Jurassic-1 (178B), and Megatron-Turing NLG (530B)" — i.e. a 70B model beat a 175B model (GPT-3) and a 280B model (Gopher, 4× its size) and a 530B model (Megatron-Turing NLG, ~7.6× its size).
- "current large language models are significantly undertrained" — the paper's central corrective claim: pre-Chinchilla models emphasized parameter count while holding training data roughly constant, which this paper argues is compute-suboptimal.

Arithmetic check for the figure's one-liner ("beat models 2.5× its size"): Gopher at 280B is exactly 4× Chinchilla's 70B (280/70 = 4), not 2.5×. GPT-3 at 175B is exactly 2.5× Chinchilla's 70B (175/70 = 2.5), and the abstract explicitly states Chinchilla outperforms GPT-3 (175B). So "beat models 2.5× its size" is directly supported by the GPT-3 comparison specifically (175B / 70B = 2.5), and "trained on 4× the data" is directly supported by the "4× more [more] data" vs. Gopher line. Both halves of the figure's one-liner trace to this abstract, using two different named comparisons within it (Gopher for the 4× data figure, GPT-3 for the 2.5× size figure).

---

## [S3] Emergent Abilities of Large Language Models (Wei et al., 2022)
- **URL:** https://arxiv.org/abs/2206.07682
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Wei et al., 2022, Google Research / Stanford / DeepMind / UNC Chapel Hill)

### Extracted
Abstract, verbatim: "Scaling up language models has been shown to predictably improve performance and sample efficiency on a wide range of downstream tasks. This paper instead discusses an unpredictable phenomenon that we refer to as emergent abilities of large language models. We consider an ability to be emergent if it is not present in smaller models but is present in larger models. Thus, emergent abilities cannot be predicted simply by extrapolating the performance of smaller models. The existence of such emergence implies that additional scaling could further expand the range of capabilities of language models."

Notes: This is the source for "emergent-looking capabilities appear as scale grows" — the paper's own framing is careful: emergent abilities are defined relative to *task performance*, and are explicitly contrasted with the *smooth, predictable* scaling of loss described in S1/S2. The abstract itself flags this as "unpredictable," which is worth preserving in the note (i.e. don't conflate "loss falls predictably" with "every downstream capability appears predictably" — the paper's whole point is that capability jumps on discrete tasks are the part that doesn't extrapolate cleanly from smaller models, even while loss itself follows the smooth curve).

---

## [S4] Anthropic — Models overview ("Choosing a model" / model comparison table)
- **URL (as given in brief):** https://docs.anthropic.com/en/docs/about-claude/models/overview — 301-redirects to:
- **URL (working, fetched):** https://platform.claude.com/docs/en/docs/about-claude/models/overview
- **Fetched:** 2026-07-03
- **Type:** Anthropic product docs (models overview page)

### Extracted
Page framing, verbatim: "Claude is a family of state-of-the-art large language models developed by Anthropic. This guide introduces the available models and compares their performance."

Choosing-a-model guidance, verbatim: "If you're unsure which model to use, start with **Claude Opus 4.8** for complex agentic coding and enterprise work. For workloads that need the highest available capability, use [Claude Fable 5]."

Model comparison table (current lineup at fetch time), extracted fields relevant to the size/cost/speed trade-off:
- Claude Fable 5 — description: "Next-generation intelligence for long-running agents"; pricing "$10 / input MTok, $50 / output MTok"; comparative latency "Slower".
- Claude Opus 4.8 — description: "For complex agentic coding and enterprise work"; pricing "$5 / input MTok, $25 / output MTok"; comparative latency "Moderate".
- Claude Sonnet 5 — description: "The best combination of speed and intelligence"; pricing "$3 / input MTok, $15 / output MTok"; comparative latency "Fast".
- Claude Haiku 4.5 — description: "The fastest model with near-frontier intelligence"; pricing "$1 / input MTok, $5 / output MTok"; comparative latency "Fastest".

Notes: This page directly supports the note's claim that model *choice* is a deliberate engineering decision balancing cost, latency, and capability — Anthropic ships multiple model sizes side by side (Haiku smallest/cheapest/fastest through Opus/Fable largest/priciest/slowest) rather than one model, and prices scale with model size/capability (Haiku 4.5 at $1/$5 per MTok vs. Fable 5 at $10/$50 per MTok — a 10x spread). Used to support the "inference cost scales with size, which is why model choice is an engineering decision" and "route easy tasks to small models" claims in the note, without quoting specific numeric figures that could look wrong to a reader whose model lineup has moved on (the note describes the pattern — a range of sizes, priced and latency-tiered accordingly — rather than pinning exact current prices/names to avoid staleness, since this page is expected to change as Anthropic ships new models).

---

## Audit notes

**Direction A (note/page → dump):** every quoted string used in `notes/08-scaling-laws-and-model-sizes.md` and `docs/08-scaling-laws-and-model-sizes.html` was checked against this dump before being used; nothing quoted downstream that isn't verbatim above.

**Direction B (dump → live):** all four dump quotes were re-fetched independently (Kaplan abstract, Chinchilla abstract fetched twice — once directly, once via a scoped re-fetch that returned the identical "4× more more data" string — Wei abstract, Anthropic models-overview page fetched via the redirected URL) and confirmed as exact substrings of the live pages at fetch time. Result: 4/4 sources fetched and confirmed; 0 quotes downgraded to paraphrase except the Chinchilla "4× more more data" oddity, which is reproduced verbatim in this dump but paraphrased ("four times as much data") wherever it's used downstream, since the doubled word is very likely a rendering artifact rather than the source's intended text and quoting it verbatim in the note/page would misrepresent the paper's claim.

**Figure one-liner verification (brief's suggested Chinchilla line: "SMALLER BUT TRAINED ON 4× THE DATA — BEAT MODELS 2.5× ITS SIZE"):** supportable directly from S2 — 4× data is the Gopher comparison ("4× more data" vs. Gopher), 2.5× size is the GPT-3 comparison (175B / 70B = 2.5, and the abstract states Chinchilla outperforms GPT-3). Used as specified, no softening needed.

Other figure one-liners (GPT-2, GPT-3, GPT-4-class, Frontier) are framed as illustrative/interpretive commentary tied to the panel's `ILLUSTRATIVE` label rather than as sourced numeric claims — the dot coordinates and curve shape are hand-placed per the brief, not derived from a real loss-vs-compute dataset, and the page's figure-note says as much ("Axes are unlabeled on purpose — the shape is the lesson, not the numbers"). The GPT-3 one-liner ("scale alone unlocked in-context learning") and GPT-4-class/Frontier lines are general, uncontroversial characterizations rather than specific quantitative claims, so they don't require a numeric source the way the Chinchilla line does.
