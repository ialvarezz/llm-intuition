---
name: review-checklist
description: The team's five-point PR review checklist. Use when reviewing a diff, a pull request, or pending changes.
---

# Team review checklist

Evaluate the change against each point. Cite file and line for every finding.

1. **Correctness** — does the change do what its description claims? Trace one real input through the changed path.
2. **Tests** — is new behavior covered by a test that fails without the change?
3. **Naming** — do new names follow the conventions already used in the surrounding code?
4. **Error handling** — are failures at trust boundaries (user input, network, filesystem) handled rather than swallowed?
5. **Scope** — does the diff contain only what the change needs? Flag drive-by edits.

Report format: one line per finding — `file:line — checklist item — what and why`.
