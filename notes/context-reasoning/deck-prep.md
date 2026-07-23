# Presenter prep — Module 01: Context & Reasoning

Study guide for `docs/context-reasoning/deck.html` (20 slides). `[NN/S#]` = dump + source id in `research/context-reasoning/NN-*.md`, e.g. `[02/S4]` = dump 02 (context window), source S4.

## The spine

Say this chain out loud before anything else: tokens are the substrate everything else is built on — the model never sees words, only the pieces its vocabulary cuts text into. Context is a token sequence built from that substrate — the window is a budget of those units, and everything entering it (system prompt, history, documents, output) is denominated in tokens. Position inside that sequence shapes attention — a fixed budget across every token, so where a token sits changes its share. Billing follows tokens — every mechanism so far is priced in the same unit, which is why cost grows quadratically as a transcript grows. Reasoning spends tokens — the trace a model writes before answering is more of the same substrate, generated to buy more forward passes on a hard problem. Roles structure the sequence — system/user/assistant are delimiter tokens the harness inserts into that stream, which is why authority between them is a trained tendency, not an architectural wall.

The order matters because each mechanism is only explicable via the one before it. As five independent facts, this is trivia to forget by Friday; as a chain, each slide is the audience predicting the next mechanism themselves.

## Slide-by-slide

### Slide 1 — Context & Reasoning — what's actually happening inside the window

**Point:** Five mechanisms let the audience read a context budget like an engineer, not guess at it.

**Say:** Welcome to Module 01. By the end, you'll look at a long prompt or a blown-up bill and know which of five mechanisms is responsible: tokenization, context window, attention curve, roles, reasoning — each makes sense only after the one before it. Almost every slide has something to click — the point is seeing these mechanisms behave, not reading a definition.

**Drive:** No interaction — gesture at the kickers.

**Bridge:** Let's start with why this matters, before we get mechanical.

### Slide 2 — Prompts get longer, quality gets worse — and nobody can say why

**Point:** "It's a big window, put everything in it" is the wrong instinct this module corrects.

**Say:** Everyone starts with the instinct that the window is huge, so why not paste in everything relevant? That's wrong, and this deck is why. Five mechanisms explain it — tokens flow into a window, the window has an attention curve, roles structure it, reasoning spends more of it. None of it is exotic, it's mechanical — the aha is watching a mechanism misbehave.

**Drive:** No interaction — point at the bullets.

**Bridge:** First mechanism, and the one everything else is built on: tokenization.

### Slide 3 — The model never sees words

**Point:** The model runs on a learned, vendor-specific vocabulary, so one sentence costs a different token count per model family.

**Say:** Type into that box — a token stream, not a word stream. The three rows show one sentence tokenized by three vendors: Claude 7 tokens, GPT 8, Gemma 7, each split differently — each vendor trained its own BPE vocabulary on its own corpus [01/S3][01/S4]. Say "illustrative" out loud — the live splitter is a stand-in, not real BPE; the real lesson is budget in tokens against the model you use, because counts don't transfer across vendors.

**Drive:** Type a sentence, watch the live count update; point at the three vendor rows' differing counts for one sentence. Aha: counts are vocabulary-dependent, not a property of the text.

**Bridge:** That same "the token is the unit" fact explains two failures everyone's seen.

### Slide 4 — Two famous failures, one cause

**Point:** Strawberry-letter-count and shaky arithmetic share one cause: the token is the smallest unit the model can perceive.

**Say:** "How many r's in strawberry" — the model sees roughly three tokens, str-aw-berry, not ten letters; nothing in a token ID encodes "contains two r's," so this is spelling recall, not perception [01/S1]. Spell it letter by letter and each letter becomes its own token — now it can count. Arithmetic breaks the same way: 1234 + 567 may tokenize as "123" "4" "567" — both ones-digits, but in unrelated chunks, so columns can't align [01/S1]. Writing digits out one at a time rebuilds that alignment — the trick step-by-step reasoning uses later.

**Drive:** No interaction — gesture at "str-aw-berry"/"123-4-567," flag it returns on slide 15.

**Bridge:** One more tokenization fact: the "system"/"user" labels you type are themselves just tokens in that stream.

### Slide 5 — Roles are tokens, not metadata

**Point:** Role labels aren't metadata outside the text — they're literal control tokens inserted into the same sequence the model reads.

**Say:** Click "Raw tokens" and watch "System: / User:" turn into control tokens like `<|system|>`. That's what a chat template does — converts role-and-content pairs into one token sequence with control-token boundaries [01/S2]. Different families use different control tokens for the same structure — Mistral's `[INST]` versus a same-base fine-tune's `<|user|>` [01/S2] — proof role markers are a template choice, not an architectural constant. Drop the "assistant's turn starts" token and the model can literally continue the user's message instead of replying [01/S2].

**Drive:** Toggle "Rendered chat"/"Raw tokens," point at the inline control tokens. Aha: no separate role field, just more tokens.

**Bridge:** Tokens are the substrate — now the budget they fill: the context window.

### Slide 6 — Everything counts, every turn

**Point:** System prompt, documents, history, and reserved output draw from one shared pool — fill it with input and there's no room to answer.

**Say:** Everything in a request counts: system prompt, every message including tool results and documents, and the output generated — output is carved from the same budget before you type a word [02/S1]. Add turns and paste a doc and watch free space shrink, then history evict, since the window is fixed size. Previous turns are preserved completely by default, nothing auto-compresses [02/S1] — the bar only grows until something forces eviction.

**Drive:** Click "+ Paste a doc" twice, watch Free shrink; then "+ Add a turn" until History evicts. Aha: input/output share one pool, eviction is silent past the cap.

**Bridge:** When the window overflows, "what happens next" is a design choice, not one universal answer.

### Slide 7 — Full doesn't mean one outcome

**Point:** Truncation, sliding window, summarization, RAG offload are four different design choices, not four names for one fallback.

**Say:** Click through the four strategies. Truncation is the default — oldest turns silently deleted, cheapest, but the conversation loses its beginning [02/S1]. Sliding window is the same shape but chosen on purpose — last N turns, flat cost forever [02/S6]. Summarization keeps a resident running summary — gist survives cheaply, exact wording lossy; it preserves decisions and bugs, discards redundant tool output [02/S4]. RAG offload never brings documents in wholesale, only retrieved snippets, so the doc segment shrinks [02/S4]. It's a menu; picking on purpose beats defaulting into truncation.

**Drive:** Click all four buttons in turn, read each trade-off line. Aha: "overflowed" has four genuinely different outcomes.

**Bridge:** There's a cost dimension too, and it isn't linear — it's quadratic.

### Slide 8 — The quadratic bill

**Point:** The model has no memory between calls, so every turn re-sends the whole transcript — cumulative billed tokens grow with the square of conversation length.

**Say:** Drag the slider — watch transcript size versus cumulative billed tokens. Transcript grows linearly, but the model has no memory, so every turn re-reads the entire transcript from scratch [02/S1]. Cumulative cost is a running sum of a linear sequence — n(n+1)/2, quadratic in turn count — by turn 20, billed input is nearly ten times transcript size. The mitigation is prompt caching: an unchanged prefix re-reads cheaply on an exact prefix match, so stable content belongs at the front — but cached tokens still occupy the window, caching changes what you pay, not whether tokens count [02/S1][02/S3].

**Drive:** Drag the slider toward 50, watch "billed" pull away from "transcript now." Aha: linear growth, quadratic bill.

**Bridge:** We've treated everything in the window as equally "seen." It isn't — that's the attention curve.

### Slide 9 — In the window isn't the same as seen

**Point:** Recall is U-shaped — best at start and end, worst in the middle, even on models built specifically for long context.

**Say:** Click through Start, Early, Middle, Late, End. This is measured: Liu et al. found performance degrades significantly as relevant info moves toward the middle, holding even for long-context-specific models [03/S1]. Mechanically, attention weights normalize across every token — softmax converts scores into weights summing to one, so more competing tokens means a thinner slice [03/S3]. Training adds bias: starts dominate training data (primacy), the causal mask means later tokens condition on earlier ones, never the reverse (recency) [03/S3]. A second, attention-weight-based methodology found the same U-shape [03/S5].

**Drive:** Click each position button, read the recall percentage aloud. Aha: middle scores lower even though every position is "in the window."

**Bridge:** That U-shape isn't magic — watch it happen token by token.

### Slide 10 — Why position mechanically matters

**Point:** Attention is a fixed budget split across earlier tokens — a thin slice makes a token functionally invisible even though it's in the window.

**Say:** Click "Next token" and watch the bars — each is the share paid to one earlier token, summing to 100% across the row: a budget divided, not independent scores [03/S3]. Watch "it": most of its budget goes to "ball" — coreference, same mechanism as "it"/"animal" in the Illustrated Transformer's canonical example [03/S2]. Stretch the sentence to thousands of tokens and that slice thins toward nothing — the same mechanism as the last slide's U-curve.

**Drive:** Click "Next token" repeatedly, pause on "it," read the "ball" percentage. Aha: attention is a percentage split — in-window doesn't mean seen.

**Bridge:** Attention explains why position matters for facts. Now the sequence those tokens sit in — starting with roles.

### Slide 11 — Build the raw sequence

**Point:** System and user instructions are labeled snippets in one flat sequence — conflicts resolve by trained priority, not logic.

**Say:** Click "+ System" then "+ User (conflicting)" and watch the sequence build — roles are delimiter tokens inside one flat stream [01/S2]. Once both are in, the model follows system: post-training gives system more trained authority, and OpenAI's docs describe this as an explicit priority ordering — developer ahead of user, like a function definition versus its arguments [04/S3]. Position compounds it: system sits at the front, a favored seat. Say it out loud: a trained tendency, not a guarantee — pressure it hard enough and it breaks, which is why system role isn't a security boundary.

**Drive:** Click "+ System," then "+ User (conflicting)," point at the sequence and the resolution. Aha: role names alone don't resolve conflicts — trained priority plus position does.

**Bridge:** Let's be precise about who actually writes into each role in a real deployment.

### Slide 12 — Who actually writes into each role?

**Point:** Each role is written by a different party at a different trust level — system by the developer, user by the human plus any tool/retrieved content, assistant by the model's own prior output.

**Say:** System is the operator's channel — the developer, not the chatting human, whether static config or an injected Skill [04/S1]. User is the human's channel and the danger zone: the ask lands here, plus tool results and retrieved pages — untrusted text in the seat the model treats as a person speaking, the mechanism of prompt injection, demonstrated against real systems [04/S2]. Assistant: the model's own prior turns — it conditions on them, why prefill worked: partial text in the assistant role, model continues it, an opening brace forcing JSON. Current model lines can reject a prefilled last turn outright, since instruction-following now covers most prefill use cases [04/S5].

**Drive:** No interaction — gesture at each accordion label.

**Bridge:** Given all that, here's a simple rule for picking a role.

### Slide 13 — Pick the role by the job

**Point:** The role is decided by the job: stable behavior to system, the ask to user, examples to assistant, untrusted content to user/tool, always delimited.

**Say:** A decision tree. Behavior that holds all session — system. Something specific right now — user. An example of the response style you want — assistant, few-shot. Untrusted content — user or tool role, explicitly delimited, never disguised as system or assistant, exactly what indirect prompt injection exploits [04/S2].

**Drive:** No interaction — point at each summary as a checklist.

**Bridge:** Last mechanism: what reasoning actually is under the hood.

### Slide 14 — More tokens, not a different process

**Point:** A reasoning trace is more generated tokens, not a different computation mode — a transformer spends fixed compute per token, so more tokens is the only way to spend more compute on a harder problem.

**Say:** Toggle "Direct answer"/"Step-by-step," read the token counts — about 14 versus 74. A transformer spends fixed compute per generated token regardless of difficulty, so generating intermediate tokens is the only way to spend more compute on a harder problem — each step is another forward pass, readable as input for the next [05/S1]. The trace is ordinary text used as external scratch memory — the same trick as spelling out s-t-r-a-w-b-e-r-r-y, rebuilding structure tokenization destroyed [01/S1]. Chain-of-thought prompting significantly improved arithmetic and symbolic reasoning tasks [05/S1]. That's exactly why it costs more.

**Drive:** Click "Direct answer," read ~14 tokens; click "Step-by-step," read ~74. Aha: extra tokens are where the extra compute goes.

**Bridge:** If reasoning is just more tokens, how much a model reasons is a dial someone controls.

### Slide 15 — Effort is a dial, not a cap

**Point:** Current APIs use adaptive thinking — the model decides when and how much, "effort" shifts the threshold — but that decision is itself a fast, learned judgment that can misfire.

**Say:** Drag through four effort levels — low may skip thinking on simple-looking problems, high almost always thinks deeply, the typical default [05/S4]. Hard caps are the old model; current APIs default to adaptive thinking, effort a behavioral signal shifting the threshold, not a strict budget [05/S4]. The catch: deciding to think is itself a next-token prediction, keyed on surface features correlated with difficulty in training. "How many r's in strawberry" looks trivial — nothing signals it fights the tokenizer — so it gets a fast, confident, wrong answer. Don't let the model's self-assessment route the paths that matter.

**Drive:** Drag through Low/Medium/High/Max, read token count and behavior at each. Call back to slide 4's strawberry example — don't re-explain.

**Bridge:** A trace can exist and still not be trustworthy — last thing before we zoom out.

### Slide 16 — A trace isn't proof

**Point:** A fluent, structured trace isn't evidence it's correct — traces can be wrong, diverge from the stated answer, or be confident fabrication.

**Say:** Three failure modes, none hypothetical. Confident wrong reasoning: structured, step-numbered text where the arithmetic in step two is simply wrong — structure reads as credibility, isn't evidence. Trace-answer mismatch: the steps derive one value, the stated answer differs. Elaborate hallucination: more steps can mean more confident fabrication when the model lacks the fact, not less. Anthropic's faithfulness study found large variation in how much models condition on their stated chain-of-thought, and larger, more capable models produced less faithful reasoning on most tasks studied [05/S3]. Verify conclusions; a trace is not a receipt.

**Drive:** No interaction — open the three accordion entries while narrating.

**Bridge:** That's all five mechanisms individually — watch them fire together.

### Slide 17 — One conversation, all five mechanisms

**Point:** One realistic conversation exercises all five mechanisms in sequence — none skippable.

**Say:** Walk it step by step. Tokenize — prompt and every prior turn become tokens the moment they're sent. Window fills — system, history, a pasted doc, and reserved output draw from one budget (slide 6). Attention curve bites — a fact buried mid-document gets less weight than one at the start or end (slides 9–10). Roles structure the ask — system sets behavior, user carries the question, the harness assembles both (slide 11). Reasoning produces the answer — extra tokens on the hard part (slides 14–15). Every real request goes through all five.

**Drive:** No interaction — walk each step, pointing back at its slide.

**Bridge:** Here's what to actually change about how you work.

### Slide 18 — What to actually do

**Point:** One behavior change per mechanism: budget in tokens, curate the window, don't bury the instruction, assign roles by trust, verify reasoning.

**Say:** Tokenization — budget in tokens; code and non-English cost more per character. Context window — pick an overflow strategy on purpose, not default truncation. Attention curve — don't bury the critical instruction mid-prompt, restate it near the end. Roles — stable behavior to system, the ask to user, untrusted content never reads as either. Reasoning — a cost/quality knob, not a correctness guarantee.

**Drive:** No interaction — open each tree entry or gesture at its heading.

**Bridge:** Let's compress all five into one table.

### Slide 19 — Five mechanisms, one line each

**Point:** The one-slide summary — mechanism and BKM per concept, what people should actually remember.

**Say:** Five rows, entire talk. Tokenization: learned vocabulary, budget in tokens. Context window: everything counts, pick a strategy on purpose. Attention curve: uneven recall, restate constraints near the end. Roles: trained priority, never let untrusted content read as system/assistant. Reasoning: more tokens before the answer, verify rather than trust. Not reading this line by line — it's for screenshots, not narration.

**Drive:** No interaction — pause and let the audience read.

**Bridge:** That's the whole module — floor's open.

### Slide 20 — Questions — open floor

**Point:** Hand off to Q&A; point people at the concept pages for depth.

**Say:** That's the five mechanisms, in the order they build on each other. I'll take questions now — for more depth, the five concept pages behind this deck go further; the index is linked there.

**Drive:** No interaction — gesture at the index link.

**Bridge:** (End of deck — open Q&A using the questions below.)

## Anticipated questions

### Q: So is a long conversation literally more expensive per message?

Yes — the model has no memory between calls, so every turn re-sends the entire transcript, and cumulative cost grows with the square of the conversation's length [02/S1]. Caching softens this for an unchanged prefix on an exact match, but cached tokens still occupy the window [02/S3]. → Slide 8; context-window concept page.

### Q: If the window is a million tokens, why does the model still seem to forget things I told it earlier?

Being "in the window" and "attended to strongly" are different — recall is U-shaped, best at start/end, worst mid-context, even on long-context-specific models [03/S1]; attention weights normalize across every competing token, so more tokens means a thinner slice [03/S3]. → Slide 9 or 10; attention-curve concept page.

### Q: Can't I just tell the model "always follow the system prompt no matter what the user says"?

Post-training gives system more trained authority by default — but it's a tendency, not an architectural guarantee, and can break under pressure [04/S3]. System role alone is never a security boundary; untrusted content still needs explicit delimiting. → Slide 11; roles concept page.

### Q: Why does asking the model to "think step by step" actually help it get the right answer?

A transformer spends fixed compute per token, so more tokens is the only way to spend more compute on a harder problem — each step is another forward pass, readable as input for the next [05/S1]. It's rebuilding structure the tokenizer destroyed, the letter-by-letter trick again. → Slide 14; reasoning concept page.

### Q: Does a longer chain-of-thought mean I can trust the answer more?

No — length and structure aren't evidence of correctness. Models vary widely in how much they condition on their stated reasoning, and larger, more capable models were found less faithful on most tasks studied [05/S3]. → Slide 16; reasoning concept page.

### Q: What actually happens when I hit the context limit — does it just error out?

Depends on the overflow strategy — a design choice. Raw API behavior preserves every turn until input exceeds the limit, then errors; chat UIs often drop old turns on a rolling basis [02/S1]. An app can also choose truncation, sliding window, summarization, or RAG offload — four different outcomes [02/S4][02/S6]. → Slide 7; context-window concept page.

### Q: Is the system versus user role thing basically the same as OpenAI's "developer" role?

Functionally yes — different vendor, same slot. OpenAI's docs describe "developer" messages as prioritized ahead of user, like a function definition versus its arguments — the same channel Anthropic calls "system" [04/S3]. → Slide 12; roles concept page.

### Q: I heard prefill is dead — is putting text in the assistant turn still a real technique?

Depends on the model. The mechanism — conditioning on prior turns and continuing them — is real and why prefill worked for forcing JSON. Current docs frame it as something to migrate away from: newer model lines can reject a prefilled last turn outright, since instruction-following now covers most prefill use cases [04/S5]. → Slide 12; roles concept page.

### Likely follow-ups

**Why can't the tokenizer just be fixed?** Vocabulary size is a real trade-off: small vocabularies make each token informative but produce long sequences; large ones compress more per token — tiktoken notes ~4 bytes/token — but need far more parameters/data to learn well. BPE's value is handling open vocabulary through a small, fixed set of learned pieces [01/S3][01/S4]. Every tokenizer picked a point on that curve deliberately.

**Does temperature affect reasoning?** Out of scope — a sampling-time control, covered in Module 00 concept 06. Point them there and keep moving.

**Is prompt injection solvable, or just mitigated?** Mitigated. Delimiting untrusted content reduces risk, but role trust is a trained tendency, not an architectural floor — attackers don't need the user-turn interface, they plant instructions in retrieved data, the premise of indirect prompt injection, demonstrated against real systems [04/S2]. No architectural guarantee, only defense in depth.

## Numbers to have cold

| Figure | Value | Source | Context |
|---|---|---|---|
| Tokens/English word | ≈1.3 (≈0.75 words/token, ≈4 chars/token) | [01/S5] | Budgeting rule of thumb; other languages/code cost more. |
| Vocabulary size | ~50k–200k learned subword tokens | [01/S1]/[01/S3] | Vendor-specific, learned via BPE, not universal. |
| Position recall shape | U-shape, start/end best, middle worst | [03] Liu / Yu et al. | Behavioral and attention-weight measures agree. |
| Cumulative billed cost | n(n+1)/2 — quadratic in turns | arithmetic, no source needed | Every turn re-sends the full transcript. |
| Attention normalization | Sums to 100% per step | [03] Vaswani | Softmax over query-key scores — a fixed budget divided. |

Prices are deliberately absent — they date in weeks, the mechanisms don't. If asked: check the live pricing page, the mechanism is what transfers.

## Failure modes while presenting

- Toy tokenizer on slide 3 isn't real — say "illustrative" out loud; the vendor rows are the real comparison.
- Don't read captions verbatim — written for readers after the talk, not recitation.
- No JS degrades every interactive slide to stacked static — present with JS on.
- Strawberry appears twice by design (slides 4, 15) — call back, don't re-explain.
- Vendor-name talk confined to slides 3 and 12 — the rest is vendor-neutral.
