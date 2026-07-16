---
description: Review the current diff against the team checklist
---

Review the pending changes on this branch.

1. Run `git diff main...HEAD` to get the full diff.
2. Load the review-checklist skill and evaluate the diff against every item.
3. If the diff is large (more than ~400 changed lines), delegate the reading to the `reviewer` agent and summarize its findings.
4. Report findings grouped by checklist item, most severe first. If everything passes, say so plainly.
