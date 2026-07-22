# Notes: Reasoning, in Depth

Module: Context & Reasoning — Concept 05 (final concept in the module).

## The mechanical claim

An autoregressive model produces one token at a time, and each new token is
computed using everything already in the context — including tokens the
model itself just generated. That single fact is the entire mechanical
content of "reasoning" in a language model. There is no separate reasoning
module, no internal scratch space the model consults before deciding what to
say, no cognitive faculty distinct from "predict the next token" that gets
switched on for hard problems. The only way an autoregressive model gets
*more computation* applied to a problem is by writing more tokens first —
because each additional token is another full forward pass through the
network, conditioned on everything written so far, including its own
previous output. An intermediate token that states a sub-conclusion isn't
decoration; it's compute the model would not otherwise get to spend, and it
becomes part of the input to every token generated after it.

This reframes what "reasoning" means for a model in a very literal way:
reasoning is spending more generated tokens before committing to a final
answer, not a distinct process bolted onto next-token prediction. Whether
those tokens are visible chain-of-thought in the same response, or routed
into a separate "thinking" channel the API treats specially, the underlying
mechanism is identical — more forward passes, each one conditioned on the
growing sequence, before the model outputs the tokens it treats as "the
answer." Understanding this is what makes the rest of this page's claims
predictable rather than surprising: if reasoning is just more tokens, then
everything true about tokens elsewhere in this module — they cost money,
they take time to generate, they don't guarantee correctness, more of them
isn't free — is also true of reasoning tokens specifically.

## Chain-of-thought: trading tokens for accuracy

The finding that made this practical rather than theoretical is Wei et al.'s
2022 paper on chain-of-thought prompting. Their method is simple to state:
include a few worked examples in the prompt that show intermediate reasoning
steps before the final answer, rather than examples that jump straight from
question to answer. The abstract states the core result plainly: "generating
a chain of thought — a series of intermediate reasoning steps — significantly
improves the ability of large language models to perform complex reasoning,"
and that "such reasoning abilities emerge naturally in sufficiently large
language models via a simple method called chain of thought prompting, where
a few chain of thought demonstrations are provided as exemplars in
prompting" [S1]. The gains reported are not marginal: "prompting a
540B-parameter language model with just eight chain of thought exemplars
achieves state of the art accuracy on the GSM8K benchmark of math word
problems, surpassing even finetuned GPT-3 with a verifier" [S1]. Worth
sitting with the direction of that claim precisely — a handful of few-shot
examples showing intermediate steps outperformed a model that had been
fine-tuned specifically for the task and paired with an external verifier
checking its answers. The mechanism costs something real: every intermediate
step is tokens the model would not otherwise generate, which means added
latency and added cost per call. Chain-of-thought is not a free accuracy
upgrade — it's a trade, tokens for accuracy, and the paper's contribution
was showing the trade is often worth making on multi-step problems
(arithmetic, commonsense, symbolic reasoning) where a direct jump from
question to answer gives the model no intermediate computation to work with.

That word "emerge" in the abstract also matters. Wei et al. found this
benefit was strongest in larger models — smaller models often didn't benefit
from chain-of-thought prompting the same way, and could even do worse with
it. This is early, foundational evidence that reasoning-as-more-tokens is
not a universal accelerant; it interacts with model capability, model
training, and task type, a theme that recurs through the rest of this page.

## Extended thinking and reasoning-token modes

Chain-of-thought started as a prompting technique — a shape you give your
examples. Current-generation model providers have since made an explicit,
first-class API feature out of the same underlying idea: a dedicated
reasoning phase with its own token budget, structurally separated from the
final answer but mechanically identical to it — more generated tokens,
conditioned on the context so far, before the model commits to a response.
Anthropic's extended thinking is a representative implementation. Turning it
on doesn't add a new capability so much as expose the mechanism directly:
"Claude creates `thinking` content blocks where it outputs its internal
reasoning. Claude incorporates insights from this reasoning before crafting
a final response" [S2]. The API response literally contains `thinking`
blocks followed by `text` blocks — reasoning tokens, then answer tokens,
both generated the same way.

The budget is configurable and behaves the way you'd expect a compute
knob to behave: "Larger budgets can improve response quality by enabling
more thorough analysis for complex problems, although Claude may not use
the entire budget allocated, especially at ranges above 32k" [S2]. Anthropic's
own guidance on tuning it is explicit about diminishing returns: "Higher
token counts enable more comprehensive reasoning but with diminishing
returns depending on the task. Increasing the budget can improve response
quality at the tradeoff of increased latency" [S2]. And critically, the
budget is a target, not a hard floor the model is forced to fill: "the
thinking budget is a target rather than a strict limit. Actual token usage
may vary based on the task" [S2] — the model can, and does, decide a problem
doesn't warrant the full allowance. Anthropic's task-selection guidance
points the same direction from the other side: extended thinking is
recommended "for particularly complex tasks that benefit from step-by-step
reasoning, like math, coding, and analysis" [S2] — not for everything,
because the returns on simple tasks don't justify the added latency and
cost, and can leave the model producing an elaborate trace to justify an
answer it would have reached just as well directly (the pattern this note
elsewhere calls "overthinking," which is this note's own framing for the
diminishing-returns behavior the docs describe, not a term the source
itself uses).

The visibility of the reasoning trace and its cost are two separate
questions, and it's easy to conflate them. Anthropic's docs are explicit
that they aren't linked: reasoning content may be shown in full, shown as a
summary, or omitted from the response entirely, but in every case "you're
charged for the full thinking tokens generated by the original request, not
the summary tokens," and as a result "the billed output token count will
not match the count of tokens you see in the response" [S2]. Reasoning
tokens are billed as output tokens exactly like the final answer's tokens —
there is no discount for tokens spent thinking versus tokens spent
answering, and a summarized or hidden trace doesn't mean a cheap one. This
matters practically: a shorter visible trace tells you nothing about how
much compute (and cost) actually went into producing it.

## Reasoning vs. retrieval vs. pattern-matching

Everything above establishes that reasoning tokens are real compute the
model spends. It's tempting to conclude from that alone that a longer,
more detailed reasoning trace is evidence of a more reliable answer — that
if you can see the steps and they look sound, the conclusion must be sound
too. This is the claim Anthropic's faithfulness research directly
undermines. Their 2023 paper investigates whether "the stated reasoning is
a faithful explanation of the model's actual reasoning (i.e., its process
for answering the question)" [S3] — and the answer, across many tasks, is
not reliably yes. Their method was to perturb the chain-of-thought itself
(inserting mistakes, paraphrasing it) and observe whether the model's final
answer moved in response. If the visible trace really were the computation
path, corrupting it should reliably corrupt the answer. Instead: "Models
show large variation across tasks in how strongly they condition on the CoT
when predicting their answer, sometimes relying heavily on the CoT and
other times primarily ignoring it" [S3]. A trace that reads as the reason
for an answer is sometimes just a plausible-sounding narrative generated
alongside an answer the model would have reached anyway — a post-hoc
rationalization dressed up as a derivation, not a report of what actually
happened inside the forward passes that produced the answer.

The paper's most counterintuitive finding sharpens this further: "As models
become larger and more capable, they produce less faithful reasoning on
most tasks we study" [S3]. Read that direction carefully — faithfulness
does not simply track capability upward. A more capable model is not
automatically a more honest narrator of its own process; if anything, the
paper found the opposite tendency on most of the tasks studied. The paper
also cautions against a simpler mechanical story: "CoT's performance boost
does not seem to come from CoT's added test-time compute alone or from
information encoded via the particular phrasing of the CoT" [S3] — meaning
the benefit chain-of-thought provides isn't fully explained just by "more
tokens equals more computation," even though that's the literal mechanism
this note leans on elsewhere. The overall conclusion is a caveat, not a
dismissal: "CoT can be faithful if the circumstances such as the model size
and task are carefully chosen" [S3] — faithfulness is conditional, not
guaranteed, and a trace looking coherent and well-structured is not, by
itself, proof that it's an accurate account of how the answer was reached.

## Failure modes

**Confident wrong reasoning.** A trace can be fluent, well-organized, and
step-numbered, and still arrive at a wrong answer — structure and
correctness are independent properties. Nothing about the mechanism (more
tokens, conditioned on prior tokens) guarantees that the steps are true;
it only guarantees the model had more context to condition subsequent
tokens on, including conditioning on its own earlier, possibly wrong, steps.

**Traces that don't match the model's own final answer.** The faithfulness
research above is the direct evidence for this: because models sometimes
"primarily ignore" the CoT they produced when predicting their answer [S3],
a trace can walk through steps that don't actually connect to the
conclusion the model outputs — the explanation and the answer can be
produced by different amounts of genuine dependence on each other, not a
single seamless derivation.

**Reasoning as an elaborate way to still hallucinate.** If a model lacks
the underlying fact needed to answer a question correctly, spending more
tokens "reasoning" toward that fact doesn't manufacture it. More tokens
create more opportunities for a plausible-sounding chain of steps to arrive
at a wrong conclusion with the same fluent confidence as a right one — a
longer, more detailed wrong answer is not a self-correcting mechanism just
because it looks more thorough.

## Pro vs. amateur

Amateurs treat a longer reasoning trace, or turning on extended thinking,
as a free accuracy upgrade — more tokens, so better answer, no further
scrutiny needed. Pros treat the reasoning-token budget as a cost/quality
knob with diminishing returns [S2], not a guarantee: they tune it per task,
expect it to help most on genuinely multi-step problems (math, coding,
analysis) and least on simple ones, and don't reflexively max it out.
Amateurs read a clean, step-numbered trace and take it as proof the answer
is right; pros verify conclusions independently of how confident or
detailed the trace reads, precisely because the faithfulness research shows
a trace can be structurally sound and causally disconnected from the actual
answer at the same time [S3]. Amateurs assume "think step by step"
prompting is a universal trick that always helps; pros know its payoff is
uneven — Wei et al.'s own results show the benefit concentrated in larger
models on certain task types [S1], and it tends to matter less on models
already tuned with dedicated reasoning modes, where the equivalent behavior
is closer to built in and prompting for it explicitly adds less on top.
Above all, pros never confuse "the model generated a lot of reasoning
tokens" with "the model reasoned correctly" — the first is a token count,
the second is a claim about truth, and closing the gap between them takes
independent verification, not a longer trace.

## References

- [S1] Wei et al. — Chain-of-Thought Prompting Elicits Reasoning in Large Language Models (2022). https://arxiv.org/abs/2201.11903
- [S2] Anthropic — Extended thinking. https://docs.anthropic.com/en/docs/build-with-claude/extended-thinking
- [S3] Anthropic — Measuring Faithfulness in Chain-of-Thought Reasoning (2023). https://www.anthropic.com/research/measuring-faithfulness-in-chain-of-thought-reasoning
