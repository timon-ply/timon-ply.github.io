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
