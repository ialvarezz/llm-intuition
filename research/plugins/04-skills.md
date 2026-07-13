# Module A1.04 — Skills: Research Sources

**Compiled:** 2026-07-12

## [S1] Claude Code: Extend Claude with Skills
- **URL:** https://code.claude.com/docs/en/skills
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**SKILL.md Format & Frontmatter Fields**
- "Create a `SKILL.md` file with instructions, and Claude adds it to its toolkit."
- File structure: "a file at `.claude/commands/deploy.md` and a skill at `.claude/skills/deploy/SKILL.md` both create `/deploy` and work the same way"

**Required Frontmatter (minimal)**
- `description`: Recommended, "Claude uses this to decide when to apply the skill"
- `name`: Optional, "Display name shown in skill listings. Defaults to the directory name"

**Extended Frontmatter Fields** (all optional beyond description):
- `name` — Display name; defaults to directory name
- `description` — What the skill does and when to use it; truncated at 1,536 characters in skill listing
- `when_to_use` — Additional context for skill invocation
- `argument-hint` — Hint shown during autocomplete
- `arguments` — Named positional arguments for string substitution
- `disable-model-invocation` — Set to `true` to prevent Claude from automatically loading
- `user-invocable` — Set to `false` to hide from `/` menu
- `allowed-tools` — Tools Claude can use without asking permission
- `disallowed-tools` — Tools removed from available pool while skill is active
- `model` — Model to use when this skill is active
- `effort` — Effort level override
- `context` — Set to `fork` to run in forked subagent context
- `agent` — Which subagent type to use when `context: fork` is set
- `hooks` — Hooks scoped to this skill's lifecycle
- `paths` — Glob patterns that limit when skill is activated
- `shell` — Shell to use for `` !`command` `` blocks (`bash` default or `powershell`)

**Progressive Disclosure Mechanics**
- "Unlike CLAUDE.md content, a skill's body loads only when it's used, so long reference material costs almost nothing until you need it"
- "When you or Claude invoke a skill, the rendered `SKILL.md` content enters the conversation as a single message and stays there for the rest of the session"
- Dynamic context injection via `` !`<command>` `` syntax: "runs shell commands before the skill content is sent to Claude. The command output replaces the placeholder"
- Auto-compaction: "Claude Code carries invoked skills forward within a token budget... [re-attaches] the most recent invocation of each skill after the summary, keeping the first 5,000 tokens of each"

**Supporting Files & Directory Structure**
- "Each skill is a directory with `SKILL.md` as the entrypoint"
- Structure example:
  ```
  my-skill/
  ├── SKILL.md (required)
  ├── template.md (optional)
  ├── examples/
  │   └── sample.md
  └── scripts/
      └── validate.sh
  ```
- "Reference these files from your `SKILL.md` so Claude knows what they contain and when to load them"
- "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files"

**Testing Advice**
- "To know a skill is working, measure two things separately: whether Claude invokes it on the prompts it should, and whether the output matches what you expect when it does"
- "The check for both is a baseline comparison. Collect a few realistic prompts, run each one in a fresh session with the skill available and again with it disabled"
- Via `skill-creator` plugin: "stores prompts, input files, and expected behavior in `evals/evals.json` inside the skill directory... Isolated runs: spawns a subagent per test case... Grading: checks each assertion against the output... Benchmark: aggregates pass rate, time, and tokens"

**Agent Skills Open Standard**
- "Claude Code skills follow the [Agent Skills](https://agentskills.io) open standard, which works across multiple AI tools"
- "Claude Code extends the standard with additional features like invocation control, subagent execution, and dynamic context injection"

**Bundled Skills**
- Included: `/doctor`, `/code-review`, `/batch`, `/debug`, `/loop`, `/claude-api`
- "Unlike most built-in commands, which execute fixed logic directly, bundled skills are prompt-based: they give Claude detailed instructions and let it orchestrate the work using its tools"

**String Substitutions Available**
- `$ARGUMENTS` — All arguments passed when invoking
- `$ARGUMENTS[N]` — Specific argument by 0-based index
- `$N` — Shorthand for `$ARGUMENTS[N]`
- `$name` — Named argument declared in `arguments` frontmatter
- `${CLAUDE_SESSION_ID}` — Current session ID
- `${CLAUDE_EFFORT}` — Current effort level
- `${CLAUDE_SKILL_DIR}` — Directory containing SKILL.md
- `${CLAUDE_PROJECT_DIR}` — Project root directory

---

## [S2] Claude Blog: Skills Announcement
- **URL:** https://claude.com/blog/skills (originally https://www.anthropic.com/news/skills — 308 redirect)
- **Fetched:** 2026-07-12
- **Type:** post

### Extracted

**Core Claims About Skills**
- "Skills to improve how it performs specific tasks. Skills are folders that include instructions, scripts, and resources that Claude can load when needed"
- Described as:
  - **Composable**: "Skills stack together. Claude automatically identifies which skills are needed and coordinates their use"
  - **Portable**: "Skills use the same format everywhere. Build once, use across Claude apps, Claude Code, and API"
  - **Efficient**: "Only loads what's needed, when it's needed"
  - **Powerful**: "Skills can include executable code for tasks where traditional programming is more reliable than token generation"

**Progressive Disclosure in Practice**
- "You'll even see skills in Claude's chain of thought as it works," demonstrating visibility of decision-making

**Adoption Examples (Organizations)**
- **Box**: Transforms stored files into presentations and spreadsheets
- **Canva**: Plans to "customize agents and expand what they can do"
- **Notion**: Works "seamlessly" with Claude
- **Rakuten**: Streamlines "management accounting and finance workflows"

**SKILL.md Format Notes**
- References "SKILL.md file" but does not detail specific frontmatter fields in this announcement
- Mentions "skill-creator" skill helps by generating "the folder structure, formats the SKILL.md file, and bundles the resources you need"

---

## [S3] Anthropic Engineering Blog: Equipping Agents for the Real World with Agent Skills
- **URL:** https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- **Fetched:** 2026-07-12
- **Type:** post

### Extracted

**Core Design Concept**
- "organized folders of instructions, scripts, and resources that agents can discover and load dynamically to perform better at specific tasks"
- Fundamental principle: **progressive disclosure** — "information is structured in hierarchical levels so Claude loads only what's needed"

**SKILL.md Format & Mandatory Frontmatter Fields**
- "essential file structure requires YAML frontmatter with mandatory fields"
- **name**: The skill identifier
- **description**: Contextual guidance
- "This metadata is the **first level** of _progressive disclosure_: it provides just enough information for Claude to know when each skill should be used without loading all of it into context"

**Progressive Disclosure Framework (Three Levels)**
1. **Level 1** (System Prompt): Skill name and description loaded at startup
2. **Level 2** (Core Content): Full SKILL.md loaded when Claude determines relevance
3. **Level 3+** (Supplementary Files): Additional referenced files loaded contextually

**Architecture Rationale**
- "Agents with a filesystem and code execution tools don't need to read the entirety of a skill into their context window when working on a particular task"

**Testing & Development Approaches**
- **Start with evaluation**: "Identify specific gaps in your agents' capabilities by running them on representative tasks"
- **Structure for scale**: "Split unwieldy SKILL.md files into separate referenced documents"
- **Iterate with Claude**: "Ask Claude to capture its successful approaches and common mistakes into reusable context"

**Agent Skills as Open Standard**
- "We've published _Agent Skills_ as an open standard for cross-platform portability" (December 18, 2025)
- Enables "broader ecosystem integration across Claude.ai, Claude Code, and the Claude Agent SDK"

---

## [S4] GitHub: anthropics/skills Repository
- **URL:** https://github.com/anthropics/skills
- **Fetched:** 2026-07-12
- **Type:** spec/examples

### Extracted

**Repository Purpose**
- "a public repository for Agent Skills" that "contains skills that demonstrate what's possible with Claude's skills system"

**What Are Skills (Repo Definition)**
- "Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks. Skills teach Claude how to complete specific tasks in a repeatable way, whether that's creating documents with your company's brand guidelines, analyzing data using your organization's specific workflows, or automating personal tasks"

**SKILL.md Format Example**
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

**Required Frontmatter Fields (Minimal)**
- **`name`** — "A unique identifier for your skill (lowercase, hyphens for spaces)"
- **`description`** — "A complete description of what the skill does and when to use it"

**Repository Organization**
- **`./skills`** — "Skill examples for Creative & Design, Development & Technical, Enterprise & Communication, and Document Skills"
- **`./spec`** — "The Agent Skills specification"
- **`./template`** — "Skill template"

**Skill Categories Included**
- Creative applications (art, music, design)
- Technical tasks (testing web apps, MCP server generation)
- Enterprise workflows (communications, branding)
- Document skills (DOCX, PDF, PPTX, XLSX)

**Disclaimer**
- "**These skills are provided for demonstration and educational purposes only.** While some of these capabilities may be available in Claude, the implementations and behaviors you receive from Claude may differ from what is shown in these skills"

---

## [S5] Anthropic Platform Docs: Agent Skills Overview
- **URL:** https://platform.claude.com/docs/en/docs/agents-and-tools/agent-skills/overview (originally https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview — 301 redirect)
- **Fetched:** 2026-07-12
- **Type:** docs

### Extracted

**Why Use Skills (Benefits)**
- **Specialize Claude**: Tailor capabilities for domain-specific tasks
- **Reduce repetition**: Create once, use automatically
- **Compose capabilities**: Combine Skills to build complex workflows
- "Skills load on-demand and eliminate the need to repeatedly provide the same guidance across multiple conversations"

**Availability Across Surfaces**
- Claude API, Claude Code, claude.ai, Claude Platform on AWS, Microsoft Foundry
- Custom Skills available; Pre-built Agent Skills (PowerPoint, Excel, Word, PDF) available on most platforms

**Skills Architecture**
- "Skills run in a code execution environment where Claude has filesystem access, bash commands, and code execution capabilities"
- "Skills exist as directories on a virtual machine, and Claude interacts with them using the same bash commands you'd use to navigate files on your computer"
- "When a Skill is triggered, Claude uses bash to read SKILL.md from the filesystem, bringing its instructions into the context window"

**Three Types of Skill Content & Loading Levels**

| Level | When Loaded | Token Cost | Content |
|-------|-------------|-----------|---------|
| **Level 1: Metadata** | Always (at startup) | ~100 tokens per Skill | `name` and `description` from YAML frontmatter |
| **Level 2: Instructions** | When Skill is triggered | Under 5k tokens | SKILL.md body with instructions and guidance |
| **Level 3+: Resources** | As needed | Effectively unlimited | Bundled files executed via bash without loading contents into context |

**Progressive Disclosure Architecture**
- "Claude loads information in stages as needed, rather than consuming context upfront"
- "On-demand file access: Claude reads only the files needed for each specific task. A Skill can include dozens of reference files, but if your task only needs the sales schema, Claude loads just that one file"
- "Efficient script execution: When Claude runs `validate_form.py`, the script's code never loads into the context window. Only the script's output consumes tokens"
- "No practical limit on bundled content: Because files don't consume context until accessed, Skills can include comprehensive API documentation, large datasets, extensive examples, or any reference materials you need"

**SKILL.md Structure (Required)**
```yaml
---
name: your-skill-name
description: Brief description of what this Skill does and when to use it
---

# Your Skill Name

## Instructions
[Clear, step-by-step guidance for Claude to follow]

## Examples
[Concrete examples of using this Skill]
```

**Required Frontmatter Fields**
- **`name`**:
  - Maximum 64 characters
  - Must contain only lowercase letters, numbers, and hyphens
  - Cannot contain XML tags
  - Cannot contain reserved words: "anthropic", "claude"
- **`description`**:
  - Must be non-empty
  - Maximum 1024 characters
  - Cannot contain XML tags
  - "should include both what the Skill does and when Claude should use it"

**Control Parameters & Advanced Frontmatter**
- Fields available include `context: fork` for subagent execution, `agent` selection, `allowed-tools`, `disallowed-tools`, `hooks`, `paths` for glob filtering, and runtime `shell` selection

**Available Pre-built Agent Skills**
- PowerPoint (pptx): Create presentations, edit slides, analyze presentation content
- Excel (xlsx): Create spreadsheets, analyze data, generate reports with charts
- Word (docx): Create documents, edit content, format text
- PDF (pdf): Generate formatted PDF documents and reports

**Security Considerations**
- "Use Skills only from trusted sources: those you created yourself or obtained from Anthropic"
- "While this makes them powerful, it also means a malicious Skill can direct Claude to invoke tools or execute code in ways that don't match the Skill's stated purpose"
- Key concerns: external URL fetching, tool misuse, data exposure; "Treat like installing software"

**Limitations & Constraints**
- Custom Skills do not sync across surfaces (claude.ai, API, Claude Code separate)
- Sharing scope differs: claude.ai (individual), API (workspace-wide), Claude Code (personal/project)
- Runtime environment varies: claude.ai (varying network), API (no network, no package install), Claude Code (full network, local install only)

**Open Standard Status**
- Skills are published as an open standard for cross-platform portability
- Available documentation includes best practices guide and skills cookbook

---

## Summary

All five sources converge on core definitions:

1. **SKILL.md** is the mandatory entry point with YAML frontmatter (`name`, `description` required by some platforms, optional in others)
2. **Progressive disclosure** operates at three levels: metadata (always loaded), instructions (loaded on trigger), resources/code (loaded as needed)
3. **Token efficiency** is achieved by deferring file I/O: supplementary files, scripts, and reference materials stay on the filesystem until explicitly accessed
4. **Frontmatter extensibility** includes invocation control (`disable-model-invocation`, `user-invocable`), tool gating (`allowed-tools`, `disallowed-tools`), argument handling, and execution context (`context: fork`, `agent` selection)
5. **Agent Skills** is an open standard (published December 2025) adopted by Anthropic, enabling portability across Claude Code, Claude API, claude.ai, and third-party integrations
6. **Testing** is recommended via baseline comparison (fresh session with/without skill) or the `skill-creator` plugin for automated eval, grading, and benchmarking
7. **Bundled scripts** should be referenced via `${CLAUDE_SKILL_DIR}` and executed for deterministic operations without context loading
