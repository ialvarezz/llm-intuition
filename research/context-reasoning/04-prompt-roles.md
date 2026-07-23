# Research: System / User / Assistant Roles

Module: Context & Reasoning — Concept 04.

All sources fresh for this task except the Hugging Face chat-templates entry,
which is copied forward (verbatim) from `research/context-reasoning/01-tokenization-deep.md`
[S2] and re-verified live in this dump's own quote audit.

## [S1] Anthropic — Give Claude a role with a system prompt
- **URL:** https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts
- **Fetched:** 2026-07-22
- **Type:** docs (Anthropic)
- **Substitution note:** the brief's URL now redirects into a merged page, "Prompting best practices," which folds the former standalone "Give Claude a role with a system prompt" content into a `### Give Claude a role` subsection under `## General principles`. Same organization, same content, same URL — no fabricated citation, just a docs restructure. Fetched the `.md` mirror (`...system-prompts.md`) to get raw markdown rather than the JS-rendered page (the plain HTML fetch returned an unrendered SPA shell with literal "Loading..." placeholders — not usable as a source).

### Extracted
- Section header, verbatim: "### Give Claude a role"
- Core claim, verbatim: "Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single sentence makes a difference:"
- Structural detail: the API example shows `system` as a distinct top-level request field, separate from the `messages` array which carries `{"role": "user", "content": ...}` entries — i.e. in Anthropic's API, "system" is not one more value of a `role` key alongside `user`/`assistant`, it's its own channel. Example call body (verbatim JSON fragment): `"system": "You are a helpful coding assistant specializing in Python.", "messages": [{"role": "user", "content": "How do I sort a list of dictionaries by key?"}]`.
- This is the load-bearing source for: (a) system-prompt content is meant for stable role/behavior framing, not per-request variable content; (b) the harness-level distinction between "system" as a dedicated channel and "user"/"assistant" as turns in a messages array — reinforcing that role structure is an API/template convention, not something free-floating in the text itself.

### Quote audit (2026-07-22)
- Re-fetched https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/system-prompts.md directly via curl (raw markdown mirror, not the WebFetch summarizer). Both quotes above ("### Give Claude a role" and "Setting a role in the system prompt focuses Claude's behavior and tone for your use case. Even a single sentence makes a difference:") confirmed as exact substrings, byte for byte. CONFIRMED.

## [S2] Greshake et al. — Not what you've signed up for: Compromising Real-World LLM-Integrated Applications with Indirect Prompt Injection (2023)
- **URL:** https://arxiv.org/abs/2302.12173
- **Fetched:** 2026-07-22
- **Type:** paper

### Extracted
- Abstract, verbatim in full: "Large Language Models (LLMs) are increasingly being integrated into various applications. The functionalities of recent LLMs can be flexibly modulated via natural language prompts. This renders them susceptible to targeted adversarial prompting, e.g., Prompt Injection (PI) attacks enable attackers to override original instructions and employed controls. So far, it was assumed that the user is directly prompting the LLM. But, what if it is not the user prompting? We argue that LLM-Integrated Applications blur the line between data and instructions. We reveal new attack vectors, using Indirect Prompt Injection, that enable adversaries to remotely (without a direct interface) exploit LLM-integrated applications by strategically injecting prompts into data likely to be retrieved. We derive a comprehensive taxonomy from a computer security perspective to systematically investigate impacts and vulnerabilities, including data theft, worming, information ecosystem contamination, and other novel security risks. We demonstrate our attacks' practical viability against both real-world systems, such as Bing's GPT-4 powered Chat and code-completion engines, and synthetic applications built on GPT-4. We show how processing retrieved prompts can act as arbitrary code execution, manipulate the application's functionality, and control how and if other APIs are called. Despite the increasing integration and reliance on LLMs, effective mitigations of these emerging threats are currently lacking. By raising awareness of these vulnerabilities and providing key insights into their implications, we aim to promote the safe and responsible deployment of these powerful models and the development of robust defenses that protect users and systems from potential attacks."
- Core mechanism, paraphrased from the abstract: the attack doesn't touch the user turn at all — it plants instructions inside *data* the application later retrieves and feeds to the model (search results, documents, web pages, code). The load-bearing claim: "We argue that LLM-Integrated Applications blur the line between data and instructions." Content that arrives through a tool/retrieval channel isn't automatically treated as inert data by the model — if it reads like an instruction, it can act like one, regardless of which role or channel it entered through.
- This is the direct source for why role position/labeling alone is not a security boundary: the paper's whole premise is that attackers don't need the user-turn interface to inject instruction-like content — they exploit the fact that retrieved/tool content sits in the model's context without the model reliably distinguishing "this is data to summarize" from "this is an instruction to follow."
- Demonstrated against real systems, per the abstract: "Bing's GPT-4 powered Chat and code-completion engines," plus synthetic GPT-4-based applications — i.e. not just a theoretical risk, shown practically viable.

### Quote audit (2026-07-22)
- Re-fetched https://arxiv.org/abs/2302.12173 directly via curl (raw HTML abstract page, not the WebFetch summarizer) and extracted the `<blockquote class="abstract mathjax">` block. The full abstract quoted above is an exact match against the live page (HTML entity `&#39;` normalized to a straight apostrophe; no other differences). CONFIRMED.

## [S3] OpenAI — Text generation guide (roles section)
- **URL:** https://platform.openai.com/docs/guides/text-generation
- **Fetched:** 2026-07-22
- **Type:** docs (OpenAI)
- **Note on brief's alternate URL:** the brief flagged "verify the live URL when fetching" — this URL is live and does contain a dedicated roles subsection (no redirect needed).

### Extracted
- Roles named on the page (verbatim, as a list): "developer", "user", "assistant"
- Priority claim, verbatim: "The OpenAI model spec describes how our models give different levels of priority to messages with different roles."
- Definitions, verbatim: "developer messages are instructions provided by the application developer, prioritized ahead of user messages." and "user messages are instructions provided by an end user, prioritized behind developer messages." and "Messages generated by the model have the assistant role."
- Analogy, verbatim: "You could think about developer and user messages like a function and its arguments in a programming language. developer messages provide the system's rules and business logic, like a function definition. user messages provide inputs and configuration to which the developer message instructions are applied, like arguments to a function."
- Code example shows the literal structure sent to the API (verbatim JSON fragment): `"input": [ { "role": "developer", "content": "Talk like a pirate." }, { "role": "user", "content": "Are semicolons optional in JavaScript?" } ]`
- Load-bearing for this page: OpenAI's current terminology uses "developer" for what is functionally the same stable-instruction-with-priority slot that Anthropic/most chat templates call "system" — same structural role (highest-priority instruction channel, function-definition-like), different label. Worth noting as a naming variation across vendors, not a different mechanism.

### Quote audit (2026-07-22)
- Re-fetched https://platform.openai.com/docs/guides/text-generation directly via curl (raw HTML, not the WebFetch summarizer), stripped tags, and located the roles section verbatim in the page text. All quotes above ("The OpenAI model spec describes...", "developer messages are instructions provided by the application developer, prioritized ahead of user messages.", "user messages are instructions provided by an end user, prioritized behind developer messages.", "Messages generated by the model have the assistant role.", and the function/arguments analogy) confirmed as exact substrings (curly apostrophe in "system's"/"developer's" normalized to straight). CONFIRMED.

## [S4] Hugging Face — Chat templates
- **URL:** https://huggingface.co/docs/transformers/chat_templating
- **Fetched:** 2026-07-22 (original fetch 2026-07-22 for `research/context-reasoning/01-tokenization-deep.md` [S2], the same day; re-verified again independently for this dump)
- **Type:** docs (Hugging Face)
- **Copied forward from:** `research/context-reasoning/01-tokenization-deep.md` [S2], verbatim, then re-audited live for this dump.

### Extracted
- Core mechanism, verbatim: "The list of `role` and `content` dictionaries that you pass to a chat model get converted to a token sequence, often with control tokens like `<|user|>` or `<|assistant|>` or `<|end_of_message|>`, which allow the model to see the chat structure."
- "There are many possible chat formats, and different models may use different formats or control tokens, even if they were fine-tuned from the same base model!"
- Chat templates exist precisely to hide this: "Chat models come with **chat templates**, which indicate how they expect chats to be formatted." Accessed via the `apply_chat_template` method.
- Concrete example — Mistral-7B-Instruct renders a chat as: `<s>[INST] Hello, how are you? [/INST]I'm doing great. How can I help you today?</s> [INST] I'd like to show off how chat templating works! [/INST]` — using `[INST]`/`[/INST]` control tokens.
- Zephyr-7B (fine-tuned from the *same* Mistral-7B base) instead renders: `<|user|>\nHello, how are you?</s>\n<|assistant|>\nI'm doing great. How can I help you today?</s>\n...` — using `<|user|>`/`<|assistant|>` tokens instead. Same base model, different control-token vocabulary — proof that role markers are a template/vocabulary choice, not a universal constant.
- Why it matters, verbatim: "This is why chat templates are important - with the wrong control tokens, these models would have drastically worse performance."
- `add_generation_prompt=True` appends a token sequence (e.g. `<|im_start|>assistant`) indicating the assistant's turn is starting — without it, the model may "get confused and do something strange, like **continuing** the user's message instead of replying to it."
- A worked example shows the full token sequence for a `system`/`user` exchange rendered as `<|system|>\nYou are a friendly chatbot...\n<|user|>\n...\n<|assistant|>` — i.e. the system role, like user/assistant, becomes its own literal control token(s) in the sequence, not something the model just "knows" contextually.
- Load-bearing for this page: this is the direct mechanical source for "roles are literal special tokens the harness inserts via a chat template, not semantic metadata the model interprets abstractly" — and for the "role confusion" failure mode (if untrusted text contains strings that look like a role's control tokens, or if generation-prompt tokens are omitted, the model's turn-taking behavior can misfire).

### Quote audit (2026-07-22, re-verified independently for this dump)
- Re-fetched https://raw.githubusercontent.com/huggingface/transformers/main/docs/source/en/chat_templating.md directly via curl (raw markdown from GitHub, not the WebFetch summarizer). All quotes checked as exact substrings: "The list of `role` and `content` dictionaries that you pass..." (line 24), "Chat models come with **chat templates**..." (line 28), "...drastically worse performance." (line 74), "...get confused and do something strange, like **continuing** the user's message instead of replying to it!" (line 133, note the original has a trailing "!" not carried into the note-page prose quote). All CONFIRMED exact matches, consistent with the prior audit in `01-tokenization-deep.md`.

## [S5] Anthropic — Prompting best practices (prefill section)
- **URL tried first:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prefill-claudes-response
- **Result:** 307 redirect (confirmed via `curl -IL`) to `/docs/en/build-with-claude/prompt-engineering/overview`, a general overview page with no prefill content — the standalone "prefill Claude's response" page has been removed/merged, same restructure pattern already documented for [S1] above.
- **Substitution:** followed the overview page's link to `/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices` (the same merged "Prompting best practices" page cited as [S1] in this dump), which contains a `### Migrating away from prefilled responses` section covering the prefill mechanism and its main use cases. Same organization, same URL already cited in this dump — no fabricated citation.
- **Substitute URL used:** https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
- **Fetched:** 2026-07-23 (raw markdown mirror: `...claude-prompting-best-practices.md`, via curl, not the WebFetch summarizer)
- **Type:** docs (Anthropic)
- **Important framing note:** as of this fetch, the live docs page presents prefill entirely in the past tense, under a "migrating away from" heading — prefilled assistant messages on the last turn are being deprecated/rejected on newer models (see below). The mechanism definition and the format-forcing use case (what the brief asks for) are both still present, just described as something to migrate away from rather than a recommended current technique. The note/deck should reflect this: prefill is documented as a real, well-understood mechanism, but current-generation-model guidance is moving off it.

### Extracted
- Deprecation scope, verbatim: "Starting with Claude 4.6 models and [Claude Mythos Preview](https://anthropic.com/glasswing), prefilled responses (providing a partial assistant message for Claude to continue from) on the last assistant turn are no longer supported. Requests with prefilled assistant messages to these models return a 400 error. Model intelligence and instruction following have advanced such that most use cases of prefill no longer require it. Earlier models continue to support prefills, and adding assistant messages elsewhere in the conversation is not affected."
- Core mechanism (parenthetical within the quote above): prefilling = "providing a partial assistant message for Claude to continue from" — i.e. partial text is placed in the assistant role/turn, and the model's generated output continues directly from it rather than starting fresh.
- Format-forcing use case, verbatim: "Prefills have been used to force specific output formats like JSON/YAML, classification, and similar patterns where the prefill constrains Claude to a particular structure."
- Other documented use cases, verbatim (each is its own accordion heading with a one-line description): "Eliminating preambles" — "Prefills like `Here is the requested summary:\n` were used to skip introductory text."; "Avoiding bad refusals" — "Prefills were used to steer around unnecessary refusals."; "Continuations" — "Prefills were used to continue partial completions, resume interrupted responses, or pick up where a previous generation left off."; "Context hydration and role consistency" — "Prefills were used to periodically ensure refreshed or injected context."
- Migration guidance for the format-forcing use case, verbatim: "The [Structured Outputs](/docs/en/build-with-claude/structured-outputs) feature is designed specifically to constrain Claude's responses to follow a given schema. Try asking the model to conform to your output structure first, as newer models can reliably match complex schemas when told to, especially if implemented with retries."
- Load-bearing for this page: this is the direct source for "prefill puts literal partial text into the assistant role/turn and the model's output continues that exact text" and for "prefill was commonly used to force structured output formats like JSON" — while also documenting, with an explicit dated caveat, that this technique is being retired on current-generation models (Claude 4.6+) in favor of a dedicated Structured Outputs feature.

### Quote audit (2026-07-23)
- Re-fetched https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices.md directly via curl (raw markdown mirror, not the WebFetch summarizer). All quotes above checked as exact substrings: "Starting with Claude 4.6 models..." deprecation paragraph — exact match, line 400. "Prefills have been used to force specific output formats like JSON/YAML..." — exact match, line 405. "Prefills like `Here is the requested summary:\n` were used to skip introductory text." — exact match, line 411. "Prefills were used to steer around unnecessary refusals." — exact match, line 417. "Prefills were used to continue partial completions..." — exact match, line 423. "Prefills were used to periodically ensure refreshed or injected context." — exact match, line 429. "The Structured Outputs feature is designed specifically to constrain Claude's responses to follow a given schema..." — exact match, line 407. All CONFIRMED.
- Also re-confirmed via `curl -IL` that the brief's originally-guessed URL (`.../prefill-claudes-response`) currently 307-redirects to `/docs/en/build-with-claude/prompt-engineering/overview`, which contains no prefill content — verifying the substitution was necessary, not a shortcut taken without checking.

## Quote audit summary (2026-07-22)
Every verbatim-quoted string in this dump was re-fetched as raw/live text (curl direct fetch of raw HTML/markdown, never the WebFetch summarizer) and checked as an exact substring (apostrophes/curly-quotes normalized to straight) of the source:
- [S1] Anthropic prompting-best-practices `.md` mirror: CONFIRMED, both quotes exact.
- [S2] Greshake et al. arXiv abstract: CONFIRMED, full abstract exact (one HTML-entity apostrophe normalized).
- [S3] OpenAI text-generation guide: CONFIRMED, all five quoted fragments exact (one curly apostrophe normalized).
- [S4] Hugging Face chat_templating (raw GitHub markdown): CONFIRMED, all quotes exact, consistent with the original Task 2 audit.
- [S5] Anthropic prompting best practices, prefill section (raw `.md` mirror, fetched 2026-07-23): CONFIRMED, all seven quoted fragments exact; guessed brief URL confirmed dead (307 redirect to a content-free overview page) before substituting.

No fabrications found; no corrections needed for this dump.

## Notes on sourcing decisions
- [S1]'s exact brief URL now redirects into a merged "Prompting best practices" page; the relevant "Give Claude a role" content is still present under that URL, just restructured. Documented as a substitution, not a fabrication — same organization, same URL, same content, different page title/structure.
- [S2] and [S3] fetched fresh, exactly as specified in the brief (OpenAI's `text-generation` guide URL was live and did contain a dedicated roles subsection, so no alternate URL was needed).
- [S4] is the Task 2 HF chat-templates entry, copied forward per the brief's explicit instruction, and independently re-verified live for this dump rather than trusted from the prior audit alone.
- [S5] (this task): the brief's guessed prefill URL (`.../prefill-claudes-response`) 307-redirects to a content-free overview page — confirmed dead via `curl -IL` before substituting. The current same-organization location for prefill content is a `### Migrating away from prefilled responses` section on the same merged "Prompting best practices" page already cited as [S1]. Documented substitution, not a fabrication. Notably, the live page frames prefill as a deprecated technique on Claude 4.6+ models (400 error if used on the last assistant turn) — this is recorded as-is rather than silently smoothed over, since it may be relevant to how the deck frames the technique's currency.
- No dead URLs encountered beyond the [S1] docs-restructure and the [S5] guessed-URL redirect, both documented above with substitutions.

