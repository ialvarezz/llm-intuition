# 04 · Skills — packaged expertise

## A folder, not a program

A skill is a directory on disk with one required file: `SKILL.md`. The repository that Anthropic publishes as the reference implementation defines it plainly — "Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. Skills teach Claude how to complete specific tasks in a repeatable way, whether that's creating documents with your company's brand guidelines, analyzing data using your organization's specific workflows, or automating personal tasks" [S4]. The Claude Code docs put the same idea more tersely: "Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit" [S1].

That word "instructions" is the whole distinction to hold onto. A skill is not code the harness executes on your behalf — it's prose the *model* reads. Compare it to an MCP server or a hook (Concepts 03 and 06 in this module): an MCP server exposes callable functions with typed schemas that the harness invokes and returns results from; a skill exposes a piece of text that becomes part of the model's own context. The platform docs describe the mechanics precisely: "Skills exist as directories on a virtual machine, and Claude interacts with them using the same bash commands you'd use to navigate files on your computer" — and "When a Skill is triggered, Claude uses bash to read SKILL.md from the filesystem, bringing its instructions into the context window" [S5]. Claude doesn't call a skill the way it calls a tool — it reads it, and once read, the words in that file are subject to the same interpretation, and the same possibility of being ignored or misapplied, as anything else in the prompt.

The minimum viable `SKILL.md` is short. The public skills repository's template shows the shape:

```yaml
---
name: my-skill-name
description: A clear description of what this skill does and when to use it
---

# My Skill Name

[Add your instructions here that Claude will follow when this skill is active]

## Examples
- Example usage 1
- Example usage 2

## Guidelines
- Guideline 1
- Guideline 2
```

That's a complete, legal skill [S4]. Everything else — bundled scripts, reference documents, elaborate section structure — is optional scaffolding layered on top of two YAML fields and a body.

## The full frontmatter

Different platforms enforce different subsets of required fields, but the union of what's documented gives a sense of how much control a skill author actually has. The GitHub template treats both fields as required: `name` — "A unique identifier for your skill (lowercase, hyphens for spaces)" — and `description` — "A complete description of what the skill does and when to use it" [S4]. The platform docs for Claude's code-execution environment are stricter still and specify hard limits: `name` must be "Maximum 64 characters", "Must contain only lowercase letters, numbers, and hyphens", and cannot use the reserved words "anthropic" or "claude"; `description` "Must be non-empty", has a "Maximum 1024 characters" cap, and "should include both what the Skill does and when Claude should use it" [S5].

Claude Code's own docs treat `description` as merely recommended and `name` as optional — "Display name shown in skill listings. Defaults to the directory name" — with `description` doing the real work: "Claude uses this to decide when to apply the skill", and it gets "truncated at 1,536 characters in skill listing" [S1]. Beyond those two, Claude Code documents a long tail of extended fields, all optional: `when_to_use` (additional context for invocation), `argument-hint` (autocomplete hint), `arguments` (named positional arguments for substitution), `disable-model-invocation` (blocks the model from auto-loading it), `user-invocable` (hides it from the `/` menu), `allowed-tools` and `disallowed-tools` (gate which tools are available while the skill is active), `model` and `effort` (override the active model or reasoning effort), `context: fork` plus `agent` (run the skill in a forked subagent, choosing which subagent type), `hooks` (lifecycle hooks scoped to the skill), `paths` (glob patterns limiting when it activates), and `shell` (bash or powershell for inline command blocks) [S1]. Claude Code also supports string substitutions inside a skill body — `$ARGUMENTS`, `$ARGUMENTS[N]`, `$N`, `$name`, and environment-style variables like `${CLAUDE_SESSION_ID}`, `${CLAUDE_EFFORT}`, `${CLAUDE_SKILL_DIR}`, and `${CLAUDE_PROJECT_DIR}` [S1] — which is how a skill body can reference its own bundled files or the current project root without hardcoding a path.

Not every platform needs this much control. The Anthropic engineering write-up on agent skills frames only two fields as mandatory across the design: "essential file structure requires YAML frontmatter with mandatory fields", naming **name** as "The skill identifier" and **description** as "Contextual guidance" [S3]. Everything past those two is an extension a given surface chooses to support — Claude Code's `context: fork` and `allowed-tools` don't exist in the minimal open-standard template [S1] [S4]. The two-field core is what's portable; the rest is what a specific harness bolts on.

## Progressive disclosure: three levels

Progressive disclosure is the mechanism that makes it possible to have dozens of skills installed without any of them costing meaningful context until they're actually needed. The engineering write-up states the design principle directly: "information is structured in hierarchical levels so Claude loads only what's needed" [S3], and frames the frontmatter itself as the first rung of that ladder — "This metadata is the **first level** of _progressive disclosure_: it provides just enough information for Claude to know when each skill should be used without loading all of it into context" [S3]. The same source lays out the full three-level model:

1. **Level 1** (System Prompt): Skill name and description loaded at startup
2. **Level 2** (Core Content): Full SKILL.md loaded when Claude determines relevance
3. **Level 3+** (Supplementary Files): Additional referenced files loaded contextually [S3]

The platform docs give this the same three-tier shape with concrete costs attached in a table:

| Level | When Loaded | Token Cost | Content |
|-------|-------------|-----------|---------|
| Level 1: Metadata | Always (at startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| Level 2: Instructions | When Skill is triggered | Under 5k tokens | SKILL.md body with instructions and guidance |
| Level 3+: Resources | As needed | Effectively unlimited | Bundled files executed via bash without loading contents into context |

[S5]

Read those numbers plainly: name and description together cost on the order of a hundred tokens, the body is capped in practice below five thousand, and everything past that — reference documents, datasets, bundled scripts — is *effectively unlimited* because it never enters the context window as text at all; it's accessed by the filesystem, not read as tokens. That third figure is why the same docs can say a skill "can include dozens of reference files, but if your task only needs the sales schema, Claude loads just that one file" [S5], and why "Skills can include comprehensive API documentation, large datasets, extensive examples, or any reference materials you need" without a context penalty for the material that never gets touched [S5].

Claude Code's own description of the mechanism matches this shape from a different angle, framed against CLAUDE.md rather than a numbered table: "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it" [S1]. CLAUDE.md is always in context, every turn, for the whole session — a skill body is not; it's dormant until triggered. Once triggered, though, it isn't cheap to walk back: "When you or Claude invoke a skill, the rendered `SKILL.md` content enters the conversation as a single message and stays there for the rest of the session" [S1]. Loading a skill is a one-way door for that session — which is exactly why the description has to earn that load correctly rather than optimistically.

This same mechanism explains why a codebase can carry fifty installed skills without degrading every ordinary conversation: at session start, only fifty pairs of name-plus-description sit in the system prompt — a few thousand tokens total at ~100 tokens each — while the bodies stay unread until one is specifically relevant. That's the difference between paying for what you might use and paying for what you actually use.

The engineering write-up also frames the underlying rationale for why this works at all, tied to the fact that Claude is operating with a filesystem, not just a chat buffer: "Agents with a filesystem and code execution tools don't need to read the entirety of a skill into their context window when working on a particular task" [S3]. Progressive disclosure isn't a clever compression trick bolted onto skills after the fact — it follows directly from treating the model as an agent with file access rather than a pure text-in-text-out function.

## The description is the API

Here is the fact that governs everything else about writing a good skill: the model decides whether to load a skill's body from the description alone, before it has read a single line of the body. If the description doesn't communicate the trigger conditions precisely, no amount of quality inside the body matters, because the body never gets read. The description *is* the interface a model reasons against — not documentation for a human skimming a folder listing.

This is why the sourced guidance keeps circling back to the same demand: the description needs "both what the Skill does and when Claude should use it" [S5], not just what it does. "A clear description of what this skill does and when to use it" is the exact phrasing the reference template uses for the placeholder value [S4] — "and when to use it" is doing real work in that sentence, not filler. A description that only names the domain — a line like *handles PDF generation* — tells the model *what* the skill is about but gives it no signal for *when*, mid-conversation, this particular request should trigger it. A description written as a trigger condition — the kind of phrase a real user's request would actually resemble — gives the model something it can pattern-match against on the fly.

Treat the description the way you'd treat a function signature you're writing for a caller who can only see the signature, never the implementation, before deciding whether to call it. It has a hard length ceiling on top of that pressure to be precise — 1,024 characters on the strict platform, truncated at 1,536 in the Claude Code skill listing [S1] [S5] — so it has to compress "what" and "when" into a couple of sentences with no room for throat-clearing. Marketing language (a line like *powerful toolkit for all your document needs*) burns that budget on words that carry no discriminating signal; symptom language and concrete trigger phrases (a line like *use when the user asks to fill out, sign, or extract fields from a PDF*) spend the same budget on words the model can actually match against a real request.

## Writing the body

Once a skill is triggered, its full body enters context as a single message for the rest of the session [S1] — so the body is the one artifact in this pipeline that gets to be detailed, provided it earns the tokens it spends. The reference structure keeps a clear shape: a heading naming the skill, an `## Instructions` section giving "Clear, step-by-step guidance for Claude to follow", and an `## Examples` section of "Concrete examples of using this Skill" [S5]. The public repo's minimal template mirrors it with `## Examples` and `## Guidelines` sections beneath the free-form instructions [S4].

Two constraints on body length recur across the sourced material, from different angles. Claude Code's docs give a hard-ish ceiling: "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files" [S1]. The engineering write-up frames the same advice as a scaling practice rather than a line count — "Split unwieldy SKILL.md files into separate referenced documents" [S3]. Both point at the same failure to avoid — a body so long it either gets truncated somewhere downstream or simply burns the "Under 5k tokens" budget the platform docs assign to Level 2 [S5] on material that's only relevant to a rare edge case. That's exactly what Level 3 exists for: move the rarely-needed detail into a separate file and have the body *reference* it, so it only gets pulled into context on the sessions that actually need it — "Reference these files from your `SKILL.md` so Claude knows what they contain and when to load them" [S1].

## Bundled scripts

Skills aren't limited to prose. A skill directory can carry runnable helpers — the structure example in Claude Code's docs shows a `scripts/` subdirectory sitting alongside the SKILL.md and reference files [S1], and the announcement post is explicit that skills are powerful: "Skills can include executable code for tasks where traditional programming is more reliable than token generation" [S2]. Some operations genuinely are better handled by a deterministic script than by asking a model to reproduce the same transformation in tokens each time — validating a form field, parsing a fixed file format, running a lint check.

The cost story for a bundled script matches the cost story for reference files: it doesn't get read into context unless something reads its text. The platform docs make this explicit: "Efficient script execution: When Claude runs `validate_form.py`, the script's code never loads into the context window. Only the script's output consumes tokens" [S5]. A skill can bundle a thousand-line script and it costs nothing extra in context until it runs, and even then only its output is billed against the window.

## Testing and failure modes

A skill is a piece of prompt engineering, and prompt engineering has exactly the failure modes you'd expect from natural-language instructions that a model has to interpret correctly under pressure, on the first read, with no second chance to clarify.

**Vague description → never triggers.** If the description doesn't name concrete trigger conditions, the model has no signal to match a real request against, and the skill sits installed but silent.

**Over-broad description → triggers everywhere.** The opposite failure: a description written so generally that it matches nearly any request, firing on tasks it was never meant for and crowding out more specific skills or plain reasoning.

**Giant body → context bloat.** A body that ignores the size guidance — "Keep `SKILL.md` under 500 lines" [S1] — pushes past the "Under 5k tokens" Level 2 budget [S5], and because the rendered content "stays there for the rest of the session" once loaded [S1], that bloat isn't a one-turn cost; it persists for every subsequent turn in the conversation.

**Instructions that contradict CLAUDE.md → confusion.** A skill body is one more voice added to a context window that may already contain project-level instructions from CLAUDE.md; if the two disagree on tone, format, or process, the model is left resolving a contradiction mid-task rather than following clear direction.

The testing guidance in the sourced material treats a skill the way you'd treat a piece of software with a spec, not a document you proofread once and ship. Claude Code's docs are explicit that success has two independent axes, not one: "measure two things separately: whether Claude invokes it on the prompts it should, and whether the output matches what you expect when it does" [S1]. A skill can pass one axis and fail the other — it might trigger reliably but produce the wrong output once loaded, or produce excellent output on the rare occasion it actually fires. The recommended check for both is comparative: "Collect a few realistic prompts, run each one in a fresh session with the skill available and again with it disabled" [S1] — a fresh session matters because a session that's already discussed the skill isn't testing whether the description alone would have triggered it. The engineering write-up frames the starting point for this the same way you'd frame any eval-driven work — start with evaluation: "Identify specific gaps in your agents' capabilities by running them on representative tasks" [S3], and closes the loop by having Claude itself contribute — iterate with Claude: "Ask Claude to capture its successful approaches and common mistakes into reusable context" [S3].

Testing the negative case is the part amateurs skip. A description broad enough to over-trigger will pass every positive test thrown at it while silently hijacking unrelated requests, so the disciplined version of the baseline-comparison method runs near-miss prompts too — requests that sound adjacent to the skill's domain but shouldn't invoke it — checked against the same fresh-session, with-and-without comparison [S1]. A skill-creator plugin referenced in the docs formalizes this into something closer to a real test suite: it "stores prompts, input files, and expected behavior in `evals/evals.json` inside the skill directory... Isolated runs: spawns a subagent per test case... Grading: checks each assertion against the output... Benchmark: aggregates pass rate, time, and tokens" [S1] — the same shape as a CI suite, just scoped to a skill.

## Skills as an open standard

Skills aren't a Claude-only file format. Claude Code's docs state it directly: Claude Code skills "follow the [Agent Skills](https://agentskills.io) open standard, which works across multiple AI tools", with Claude Code layering its own extensions "like invocation control, subagent execution, and dynamic context injection" on top of that shared base [S1]. The engineering blog dates the publication: "We've published _Agent Skills_ as an open standard for cross-platform portability" on December 18, 2025, enabling "broader ecosystem integration across Claude.ai, Claude Code, and the Claude Agent SDK" [S3]. The platform docs describe the same fact from the availability side: skills work across "Claude API, Claude Code, claude.ai, Claude Platform on AWS, Microsoft Foundry" [S5], with "Custom Skills available; Pre-built Agent Skills (PowerPoint, Excel, Word, PDF) available on most platforms" [S5].

That surface list is also where the standard's limits show up. Skills built for one surface don't automatically travel to another: "Custom Skills do not sync across surfaces (claude.ai, API, Claude Code separate)"; sharing scope differs by surface — "claude.ai (individual), API (workspace-wide), Claude Code (personal/project)"; and the runtime environment itself varies — "claude.ai (varying network), API (no network, no package install), Claude Code (full network, local install only)" [S5]. A skill that shells out to fetch a URL will behave differently, or not at all, depending on which surface loads it.

The blog announcement frames early adoption in concrete organizational terms: **Box** "Transforms stored files into presentations and spreadsheets"; **Canva** plans to "customize agents and expand what they can do"; **Notion** works "seamlessly" with Claude; and **Rakuten** streamlines "management accounting and finance workflows" [S2] — all the same SKILL.md-plus-progressive-disclosure architecture described throughout this note, adopted by third parties without re-implementing it.

Trust boundaries matter precisely because a skill isn't inert documentation once loaded. The platform docs are direct: "Use Skills only from trusted sources: those you created yourself or obtained from Anthropic", because "a malicious Skill can direct Claude to invoke tools or execute code in ways that don't match the Skill's stated purpose" [S5]. The concerns named are the predictable ones for anything that becomes part of a model's context and can trigger tool use — "external URL fetching, tool misuse, data exposure" — summarized in one line: "Treat like installing software" [S5].

## Pro vs. amateur

**Amateurs write skills like READMEs for a human skimming a repo. Pros write them as behavioral specs for a model deciding in one glance.** A README can ramble and rely on a human's ability to skip to the relevant section. A skill's description gets exactly one shot to convince a model, in a fraction of a second of inference, whether this is the moment to load a body it hasn't seen yet — capped at a low character count [S1] [S5] and read cold, with no chance to ask a clarifying question first.

**Amateurs polish the body and leave the description generic. Pros know description quality dominates body quality.** A brilliant, carefully-tested body that never triggers delivers zero value — the model never reads it. Because "Claude uses this to decide when to apply the skill" [S1] and the description "should include both what the Skill does and when Claude should use it" [S5], tightening trigger phrases in the description pays off every future session; polishing prose in a body that's rarely loaded pays off on none of them.

**Amateurs write a skill once and forget it. Pros treat it as prompt engineering under version control, reviewed like code.** A skill is a text file that changes agent behavior the same way a code change does, and it lives in the same repository, subject to the same diff review, rollback, and blame history as anything else in the codebase — nothing about it is exempt from the review discipline applied to actual code, because its failure modes (mis-triggering, contradicting other instructions, silently bloating context) are just as real as a software bug.

**Amateurs test only that the skill fires on the prompts it's meant for. Pros test the negative case too.** Confirming a skill triggers correctly on its intended prompts proves nothing about whether it also fires on prompts it shouldn't. The disciplined version of the fresh-session, with-and-without comparison [S1] deliberately includes near-miss prompts designed to catch an over-broad description before a real user does — because a skill that over-triggers isn't a dormant risk, it's actively hijacking unrelated conversations right now.

## References

- Claude Code Docs — [Extend Claude with Skills](https://code.claude.com/docs/en/skills) [S1]
- Claude Blog — [Skills](https://claude.com/blog/skills) [S2]
- Anthropic Engineering — [Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) [S3]
- GitHub — [anthropics/skills](https://github.com/anthropics/skills) [S4]
- Anthropic Platform Docs — [Agent Skills overview](https://platform.claude.com/docs/en/docs/agents-and-tools/agent-skills/overview) [S5]
