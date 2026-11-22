# Legal docs agent guide

- Keep generated routes synchronized with their Markdown sources and run the
  site-structure tests. Legal wording still requires human legal review.
- Remote work uses `remote/project.yaml` and the four `scripts/remote/*.sh`
  entry points on a dedicated branch and draft PR.
- Prepare publication, deployment, merge, and domain changes for review, and
  request the user's explicit confirmation before executing them. Do not request
  credentials; the user completes authentication through the service. Finish
  with commands/results, screenshot evidence, limitations, and exactly one
  `TASK_RESULT: PASS|BLOCKED|FAIL`.

Main publishes the live GitHub Pages site. Push ordinary changes to a separate review branch. An update to main, a merge or any live publication requires the owner's approval for that change. Keep all tracked files public-safe. See the [site reference](_AGENT_REFERENCE.md) for canonical inputs, route tests and publication checks.

## Delivery

Verify each coherent change with the smallest check that exercises the affected behavior.
Stage only its paths or hunks, commit it, and push to the intended remote branch after checking
the outgoing commits. Preserve unrelated changes and local-only commits. Use a review branch
when the target is protected or triggers publication. Keep deployment, release, paid CI and
production access under their project-specific approvals.
