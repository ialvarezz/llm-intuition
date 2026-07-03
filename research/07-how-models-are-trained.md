# Research dump — 07 How models are trained

## [S1] Training language models to follow instructions with human feedback (InstructGPT)
- **URL:** https://arxiv.org/abs/2203.02155 (abstract) and https://ar5iv.labs.arxiv.org/html/2203.02155 (full text, same paper)
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Ouyang et al., 2022, OpenAI)

### Extracted
Abstract, verbatim: "Making language models bigger does not inherently make them better at following a user's intent. For example, large language models can generate outputs that are untruthful, toxic, or simply not helpful to the user. In other words, these models are not aligned with their users. In this paper, we show an avenue for aligning language models with user intent on a wide range of tasks by fine-tuning with human feedback. Starting with a set of labeler-written prompts and prompts submitted through the OpenAI API, we collect a dataset of labeler demonstrations of the desired model behavior, which we use to fine-tune GPT-3 using supervised learning. We then collect a dataset of rankings of model outputs, which we use to further fine-tune this supervised model using reinforcement learning from human feedback. We call the resulting models InstructGPT. In human evaluations on our prompt distribution, outputs from the 1.3B parameter InstructGPT model are preferred to outputs from the 175B GPT-3, despite having 100x fewer parameters. Moreover, InstructGPT models show improvements in truthfulness and reductions in toxic output generation while having minimal performance regressions on public NLP datasets. Even though InstructGPT still makes simple mistakes, our results show that fine-tuning with human feedback is a promising direction for aligning language models with human intent."

Three-step method, verbatim quotes pulled from full text via ar5iv:
- Step 1 (SFT): "Our labelers provide demonstrations of the desired behavior on the input prompt distribution" — the team then fine-tuned GPT-3 on these labeler-provided examples using supervised learning.
- Step 2 (reward model): "We collect a dataset of comparisons between model outputs, where labelers indicate which output they prefer" — a reward model is trained to predict which outputs human labelers would prefer.
- Step 3 (RL against the reward model): "We use the output of the RM as a scalar reward. We fine-tune the supervised policy to optimize this reward using the PPO algorithm."
- Result: "labelers significantly prefer InstructGPT outputs across model sizes" — a 1.3B InstructGPT model beat the 175B base GPT-3 in human preference.

Notes: This is the paper that establishes the canonical SFT → reward model → RLHF(PPO) pipeline that ChatGPT and other assistant models are built on. "RLHF" as a term for the third step is exactly the mechanism described in Step 3.

---

## [S2] Constitutional AI: Harmlessness from AI Feedback
- **URL:** https://arxiv.org/abs/2212.08073 (abstract) and https://ar5iv.labs.arxiv.org/html/2212.08073 (full text, same paper)
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Bai et al., 2022, Anthropic)

### Extracted
Abstract, verbatim: "As AI systems become more capable, we would like to enlist their help to supervise other AIs. We experiment with methods for training a harmless AI assistant through self-improvement, without any human labels identifying harmful outputs. The only human oversight is provided through a list of rules or principles, and so we refer to the method as 'Constitutional AI'. The process involves both a supervised learning and a reinforcement learning phase. In the supervised phase we sample from an initial model, then generate self-critiques and revisions, and then finetune the original model on revised responses. In the RL phase, we sample from the finetuned model, use a model to evaluate which of the two samples is better, and then train a preference model from this dataset of AI preferences. We then train with RL using the preference model as the reward signal, i.e. we use 'RL from AI Feedback' (RLAIF). As a result we are able to train a harmless but non-evasive AI assistant that engages with harmful queries by explaining its objections to them."

Two-phase description, verbatim quotes from full text:
- Supervised phase: "In the first stage of the process, we first generate responses to harmfulness prompts using a helpful-only AI assistant. These initial responses will typically be quite harmful and toxic. We then ask the model to critique its response according to a principle in the constitution, and then revise the original response in light of the critique."
- RL phase: "This stage mimics RLHF, except that we replace human preferences for harmlessness with 'AI feedback'" and the paper describes this as "RL from AI Feedback" (RLAIF).
- Contrast with RLHF: the method trains "a harmless but non-evasive AI assistant... without any human labels identifying harmful outputs," and the paper states Constitutional AI "improves upon, and partially replaces reinforcement learning from human feedback" by using natural-language principles instead of "tens of thousands of human preference labels" typically required by RLHF.

Notes: This is Anthropic's variant of the RLHF preference-optimization stage — same basic shape (sample outputs, rank them, train a preference/reward model, optimize against it with RL) but the ranking signal comes from an AI model applying written principles ("the constitution") instead of human raters, hence "RLAIF."

---

## [S3] The Llama 3 Herd of Models
- **URL:** https://arxiv.org/abs/2407.21783 (abstract) and https://ar5iv.labs.arxiv.org/html/2407.21783 (full text, same paper)
- **Fetched:** 2026-07-03
- **Type:** arXiv paper (Meta, 2024)

### Extracted
Abstract, verbatim: "Modern artificial intelligence (AI) systems are powered by foundation models. This paper presents a new set of foundation models, called Llama 3. It is a herd of language models that natively support multilinguality, coding, reasoning, and tool usage. Our largest model is a dense Transformer with 405B parameters and a context window of up to 128K tokens. This paper presents an extensive empirical evaluation of Llama 3. We find that Llama 3 delivers comparable quality to leading language models such as GPT-4 on a plethora of tasks. We publicly release Llama 3, including pre-trained and post-trained versions of the 405B parameter language model and our Llama Guard 3 model for input and output safety. The paper also presents the results of experiments in which we integrate image, video, and speech capabilities into Llama 3 via a compositional approach. We observe this approach performs competitively with the state-of-the-art on image, video, and speech recognition tasks. The resulting models are not yet being broadly released as they are still under development."

Post-training pipeline, verbatim quotes from full text:
- "We produce the aligned Llama 3 models by applying several rounds of post-training, or aligning the model with human feedback on top of a pre-trained checkpoint."
- "Each round of post-training involves supervised finetuning (SFT) followed by Direct Preference Optimization (DPO; rafailov2024direct) on examples collected either via human annotations or generated synthetically."
- "the reward model is then used to perform rejection sampling on our human annotation prompts" — described as happening before the SFT stage in each round.

Knowledge cutoff / pretraining data, verbatim quote:
- "We create our dataset for language model pre-training from a variety of data sources containing knowledge until the end of 2023."

Notes: Confirms that pretraining data has a hard cutoff date baked in before any post-training happens — directly supports the "knowledge cutoff comes from pretraining data, not deployment date" claim. Also confirms the general shape (base checkpoint → SFT → preference optimization against a reward model, repeated in rounds) generalizes beyond OpenAI's InstructGPT pipeline; Llama 3 uses DPO instead of PPO but the SFT-then-preference-optimization structure is the same.

---

## [S4] Andrej Karpathy — "State of GPT" (Microsoft Build 2023) — corroborating coverage
- **URL (primary, unusable):** https://www.youtube.com/watch?v=bZQun8Y4L2A — WebFetch on this URL returns only YouTube's footer/boilerplate (nav links, copyright notice in Spanish), no transcript or description content. Confirmed unusable for direct quotation.
- **URL (corroborating written source):** https://www.kaitakami.dev/blog/andrej-karpathy-state-of-gpt
- **Fetched:** 2026-07-03
- **Type:** Blog post summarizing/quoting the talk

### Extracted
Four-stage pipeline as described by this source:
1. Pretraining (base model): "thousands of GPUs over months of training and millions of dollars," data from CommonCrawl, Wikipedia, GitHub. Key line: "One of the most important things Andrej mentions is that base models are not assistants; their main objective is to complete documents."
2. Supervised Fine-Tuning (SFT): "smaller datasets of higher quality, focused on answering questions and performing specific tasks" turn the base model into a more useful assistant.
3. Reward Modeling: the system evaluates quality by comparing "results of the same prompt (completion) are compared and classified based on their quality."
4. RLHF: "the model can choose the best completion based on evaluation." Also: "RLHF models tend to generate results with less variation, whereas base models tend to be more diverse."

Note: this source paraphrases Karpathy rather than transcribing him directly except where it uses quotation marks (reproduced above verbatim from the blog post itself). Treated as "coverage of the talk," not as Karpathy's own words, unless independently corroborated (see S5).

---

## [S5] Andrej Karpathy — "State of GPT" — second corroborating source
- **URL:** https://medium.com/@chassweeting/the-state-of-gpt-by-andrew-kaparthy-fad2f007c1b9
- **Fetched:** 2026-07-03
- **Type:** Medium article summarizing/quoting the talk

### Extracted
Four-stage pipeline, verbatim as rendered in this article:
1. "Pretraining - Building the foundational language model." Article states this stage is "roughly 99% of computational work, utilizing internet-scale datasets across thousands of GPUs over months."
2. "Supervised Fine Tuning (SFT) - Creating an assistant capable of answering questions through supervised learning, requiring only hours or days of training."
3. "Reward Modeling - Establishing evaluation criteria for desired model behaviors."
4. "Reinforcement Learning - Further optimization using feedback signals," with Karpathy quoted directly (per this article) as cautioning: "RLHF is very much research-level. I do not advise you try to do that."

Base model quote, verbatim as rendered in this article: "Base models are not assistants. They just want to complete Internet documents."

Training-volume note: "Meta's Llama (65B parameters trained on 1.4 trillion tokens) outperforms GPT-3 (175B parameters, 300 billion tokens) due to extended training despite having fewer parameters" (per this article's summary of the talk).

Notes: This article and S4 independently agree on the same four-stage structure (pretrain → SFT → reward modeling → RLHF) and the same core claim ("base models are not assistants, they complete documents"), which is the corroboration required since the primary YouTube URL is unfetchable. Both are secondhand coverage, not a primary transcript — so any "Karpathy said X" phrasing in the note/page is written as reported/paraphrased content attributed to the talk via this coverage, not quoted as Karpathy's exact words, EXCEPT the one line both sources independently render in quotation marks with near-identical wording ("base models are not assistants... they [just want to/their main objective is to] complete documents") — used unquoted/paraphrased in the note regardless, per the audit protocol, since it cannot be confirmed against a primary transcript.

---

## Audit notes

- All quotes above were pulled via WebFetch with recorded URLs; the InstructGPT, Constitutional AI, and Llama 3 quotes come from arXiv (abs) / ar5iv (full text) — genuine primary sources, both fetched and recorded here.
- The YouTube video (Karpathy's "State of GPT") could NOT be used for direct quotation — confirmed by direct fetch attempt, which returned only YouTube boilerplate navigation text. Any claims sourced to the talk are corroborated by two independent written summaries (S4, S5) and are treated as paraphrase, not quotation, in the note and page — no quotation marks are used around any "Karpathy said" content in the final deliverables.
- No fact in the note or page is asserted without a source tag; the video is embedded on the page as a media element (per brief) but is not used as a citation source for quoted text.
