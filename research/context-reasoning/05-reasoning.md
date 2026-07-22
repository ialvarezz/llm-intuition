# Research: Reasoning, in Depth

Module: Context & Reasoning — Concept 05 (final concept page of the module).

All sources fresh for this task.

## [S1] Wei et al. — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022)
- **URL:** https://arxiv.org/abs/2201.11903
- **Fetched:** 2026-07-22
- **Type:** paper

### Extracted
- Abstract, verbatim in full: "We explore how generating a chain of thought -- a series of intermediate reasoning steps -- significantly improves the ability of large language models to perform complex reasoning. In particular, we show how such reasoning abilities emerge naturally in sufficiently large language models via a simple method called chain of thought prompting, where a few chain of thought demonstrations are provided as exemplars in prompting. Experiments on three large language models show that chain of thought prompting improves performance on a range of arithmetic, commonsense, and symbolic reasoning tasks. The empirical gains can be striking. For instance, prompting a 540B-parameter language model with just eight chain of thought exemplars achieves state of the art accuracy on the GSM8K benchmark of math word problems, surpassing even finetuned GPT-3 with a verifier."
- Core mechanism: chain-of-thought prompting = a few worked-example demonstrations in the prompt, each showing intermediate reasoning steps before the final answer, given as exemplars (few-shot), not a special mode of the model.
- Key numeric claim, direction confirmed from the abstract: prompting a 540B-parameter model with **eight** chain-of-thought exemplars achieves state-of-the-art accuracy on GSM8K (grade-school math word problems), **surpassing even fine-tuned GPT-3 with a verifier**. This is a claim about few-shot prompting beating a fine-tuned-plus-verifier baseline — not the reverse.
- Metadata (citation_date field): 2022/01/28 (original submission); "citation_online_date": 2023/01/10. Authors: Jason Wei, Xuezhi Wang, Dale Schuurmans, Maarten Bosma, Brian Ichter, Fei Xia, Ed Chi, Quoc Le, Denny Zhou.
- Load-bearing for this page: this is the direct source for the "trading tokens for accuracy" claim — chain-of-thought prompting spends more tokens (the intermediate steps) in exchange for improved performance on multi-step reasoning tasks, demonstrated on arithmetic, commonsense, and symbolic reasoning benchmarks.

### Quote audit (2026-07-22)
- Fetched https://arxiv.org/abs/2201.11903 directly via curl (raw HTML abstract page, not the WebFetch summarizer) and extracted the `<blockquote class="abstract mathjax">` block plus the `citation_abstract` meta tag (both present, identical text). The full abstract quoted above is an exact match against the live page (double-hyphen "--" as literal em-dash rendering, no other differences). CONFIRMED.

## [S2] Anthropic — Extended thinking
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- **Fetched:** 2026-07-22 (raw markdown mirror: `https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking.md`, via curl, not the WebFetch summarizer)
- **Type:** docs (Anthropic)
- **Note on brief's "distinct budget-guidance page" question:** the extended-thinking page itself contains a full dedicated "Best practices and considerations for extended thinking" section, including a "Working with thinking budgets" subsection, which covers the budget/quality/latency trade-off the brief asks about. There is also a separate `/docs/en/build-with-claude/adaptive-thinking` page (linked from this one) covering a newer "adaptive" mode where the model itself decides how much to think, with an `effort` parameter — a distinct mechanism/page beyond manual `budget_tokens`, but the core budget-tradeoff claims used in the note are all sourced from this page directly, so no separate fetch was required for the note's claims.

### Extracted
- Mechanism, verbatim: "When extended thinking is turned on, Claude creates `thinking` content blocks where it outputs its internal reasoning. Claude incorporates insights from this reasoning before crafting a final response." The API response contains `thinking` content blocks followed by `text` content blocks — thinking is literally more generated tokens, structurally separated from the final-answer tokens but still tokens the model writes.
- Budget mechanism, verbatim: "The `budget_tokens` parameter sets the maximum number of tokens Claude can use for its internal reasoning process. This limit applies to full thinking tokens, not to the summarized output. Larger budgets can improve response quality by enabling more thorough analysis for complex problems, although Claude may not use the entire budget allocated, especially at ranges above 32k."
- Diminishing returns / plateau claim, verbatim (from "Best practices and considerations for extended thinking" → "Working with thinking budgets"): "The minimum budget is 1,024 tokens. Start at the minimum and increase the thinking budget incrementally to find the optimal range for your use case. Higher token counts enable more comprehensive reasoning but with diminishing returns depending on the task. Increasing the budget can improve response quality at the tradeoff of increased latency." Also: "Note that the thinking budget is a target rather than a strict limit. Actual token usage may vary based on the task." This is the direct source for "more budget helps up to a point, with diminishing returns" — it does not use the word "overthinking," so the note's use of that word is the note's own framing, not a quoted claim.
- Task-selection guidance, verbatim (from "Usage guidelines"): "Use extended thinking for particularly complex tasks that benefit from step-by-step reasoning, like math, coding, and analysis." — implies simple tasks are not the intended use case, supporting the "not a free upgrade on every task" framing, though the page does not explicitly claim reasoning "hurts" on simple tasks.
- Summarized thinking, verbatim: "With extended thinking enabled, the Messages API for Claude 4 models returns a summary of Claude's full thinking process. Summarized thinking provides the full intelligence benefits of extended thinking, while preventing misuse." And: "You're charged for the full thinking tokens generated by the original request, not the summary tokens." And: "The billed output token count will **not** match the count of tokens you see in the response." This is the direct source for "sometimes summarized rather than shown in full, billed as tokens like any other" — thinking tokens are counted as billed output tokens regardless of whether the full trace, a summary, or nothing at all (`display: "omitted"`) is shown to the caller.
- Pricing section, verbatim: billed output tokens include "Tokens used during thinking (output tokens)" alongside "Standard text output tokens" — i.e. thinking tokens and answer tokens are billed the same way, as output tokens, not a separate free channel.
- Load-bearing for this page: extended thinking is a dedicated, budget-capped reasoning phase that produces real generated tokens (billed as output tokens), which the API may show in full, show summarized, or omit from the visible response — but the underlying token cost is the same either way. More budget tends to help on complex tasks but shows diminishing returns, and the model may not use the full budget it's given.

### Quote audit (2026-07-22)
- Re-fetched https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking.md directly via curl (raw markdown mirror, not the WebFetch summarizer/rendered page). All quotes above checked as exact substrings:
  - "When extended thinking is turned on, Claude creates `thinking` content blocks..." — exact match, line 34.
  - "The `budget_tokens` parameter sets the maximum number of tokens..." — exact match, line 295.
  - "The minimum budget is 1,024 tokens. Start at the minimum..." — exact match, line 3593 area ("Working with thinking budgets" bullet).
  - "Note that the thinking budget is a target rather than a strict limit..." — exact match, same bullet.
  - "Use extended thinking for particularly complex tasks..." — exact match, "Usage guidelines" bullet.
  - "With extended thinking enabled, the Messages API for Claude 4 models returns a summary..." — exact match, "Summarized thinking" section.
  - "You're charged for the full thinking tokens generated by the original request, not the summary tokens." — exact match, bullet list under "Summarized thinking."
  - "The billed output token count will **not** match the count of tokens you see in the response." — exact match (markdown bold markers preserved as in source).
  All CONFIRMED. Note: the live page currently documents several forward-looking/placeholder model names (e.g. "Claude Sonnet 5," "Claude Mythos Preview," "Claude Opus 4.8") that do not correspond to any model publicly known as of this fetch — these are Anthropic's docs content as rendered at fetch time and are not relied on for any claim in the note; the note deliberately avoids citing specific model names from this page and sticks to the mechanism/budget/billing claims, which are stable across model versions on the page.

Checked during this fetch, per the brief's instruction to look for a distinct reasoning-budget-guidance page beyond extended-thinking: the extended-thinking page links to a separate page, `/docs/en/build-with-claude/adaptive-thinking`, describing a newer "adaptive thinking" mode (model decides its own thinking depth, controlled via an `effort` parameter rather than a manual `budget_tokens`). This is a distinct page, but the extended-thinking page's own "Working with thinking budgets" and pricing sections already fully cover the budget/quality/latency/billing trade-offs the note needs, so the adaptive-thinking page was not separately fetched — nothing in the note cites it, and no claim depends on it.

## [S3] Anthropic — Measuring Faithfulness in Chain-of-Thought Reasoning (2023)
- **URL:** https://www.anthropic.com/research/measuring-faithfulness-in-chain-of-thought-reasoning
- **Fetched:** 2026-07-22
- **Type:** research post (Anthropic)
- **Live-URL check:** confirmed live via curl, HTTP 200, no redirect needed. Brief's URL is exact and current.

### Extracted
- Publish date on page: "Jul 18, 2023" (matches the brief's "(2023)" attribution).
- Abstract, verbatim in full (curly quotes/apostrophes normalized to straight for the dump, noted in the quote audit below): "Large language models (LLMs) perform better when they produce step-by-step, "Chain-ofThought" (CoT) reasoning before answering a question, but it is unclear if the stated reasoning is a faithful explanation of the model's actual reasoning (i.e., its process for answering the question). We investigate hypotheses for how CoT reasoning may be unfaithful, by examining how the model predictions change when we intervene on the CoT (e.g., by adding mistakes or paraphrasing it). Models show large variation across tasks in how strongly they condition on the CoT when predicting their answer, sometimes relying heavily on the CoT and other times primarily ignoring it. CoT's performance boost does not seem to come from CoT's added test-time compute alone or from information encoded via the particular phrasing of the CoT. As models become larger and more capable, they produce less faithful reasoning on most tasks we study. Overall, our results suggest that CoT can be faithful if the circumstances such as the model size and task are carefully chosen."
- Core claim, direction-checked: this is the direct source for "a reasoning trace is not proof of the model's actual computation path" — the paper's central finding is that stated CoT reasoning is not reliably a faithful account of the process the model actually used to reach its answer, tested by perturbing the CoT (inserting mistakes, paraphrasing) and observing whether the final answer changes accordingly.
- Specific, numerically-flavored claim to state carefully in the correct direction: **larger, more capable models produce LESS faithful reasoning on most tasks studied** — i.e. faithfulness does not simply improve with scale/capability; the paper reports the opposite trend on most tasks. This is the inverse of "bigger/better models reason more faithfully," so care is needed not to invert it in the note.
- Secondary claim: CoT's performance boost is not fully explained by "added test-time compute alone" (i.e., not simply "more tokens = better" as a mechanical certainty) nor by information encoded in the specific phrasing of the CoT — meaning the benefit of chain-of-thought is not purely reducible to token count, even though token count/compute is the mechanism this page's own note leans on for other claims. Load-bearing nuance: sourced explicitly to avoid overclaiming "more thinking tokens always causes better answers, full stop."
- Load-bearing for this page: this is the primary citation for the note's "reasoning vs. retrieval vs. pattern-matching" section and the claim that a trace "looking right" isn't proof it's right — a structured, plausible-looking CoT trace can diverge from the model's actual dependency on that reasoning when answering.

### Quote audit (2026-07-22)
- Re-fetched https://www.anthropic.com/research/measuring-faithfulness-in-chain-of-thought-reasoning directly via curl (raw HTML page, not the WebFetch summarizer), stripped `<script>`/`<style>` blocks and tags with a Python script, decoded HTML entities (`&#x27;`/`&#39;` → straight apostrophe, `&quot;` → straight double-quote, `&amp;` → `&`), and collapsed whitespace. The full abstract quoted above was located verbatim in the resulting text (source uses curly quotes `"`/`"` and curly apostrophes `'`, normalized to straight equivalents for the dump — content and word order otherwise identical, including the run-together "Chain-ofThought" spelling in the original, preserved as-is). CONFIRMED.

## Quote audit summary (2026-07-22)
Every verbatim-quoted string in this dump was re-fetched as raw/live text (curl direct fetch of raw HTML or raw markdown mirror, never the WebFetch summarizer) and checked as an exact substring (curly quotes/apostrophes normalized to straight) of the source:
- [S1] Wei et al. arXiv abstract: CONFIRMED, full abstract exact.
- [S2] Anthropic extended-thinking docs (raw `.md` mirror): CONFIRMED, all eight quoted fragments exact.
- [S3] Anthropic faithfulness research post: CONFIRMED, full abstract exact (curly quotes/apostrophes normalized).

No fabrications found; no corrections needed for this dump.

## Notes on sourcing decisions
- All three brief URLs were live and fetched exactly as given — no dead links, no substitutions.
- [S2]'s extended-thinking docs page currently displays several forward-looking/placeholder model names not publicly known as of this fetch; the note avoids citing any specific model name from this page and relies only on the stable mechanism/budget/billing claims.
- Checked for a distinct reasoning-budget-guidance page beyond extended-thinking per the brief's instruction: found `/docs/en/build-with-claude/adaptive-thinking`, a real but separate page about a newer "adaptive thinking" mode. Not fetched or cited, since the extended-thinking page's own budget/pricing sections fully cover what the note needs (see [S2] note above).
- No numeric claim in this dump needed correction; the one claim requiring careful directionality — "larger, more capable models produce **less** faithful reasoning on most tasks" ([S3]) — was checked against the abstract's exact wording before use, precisely because a same-shaped claim in this plan was previously caught inverted in an earlier task's research dump.
