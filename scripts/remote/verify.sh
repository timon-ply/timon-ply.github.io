#!/usr/bin/env sh
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$repo_root"
node tools/generate_legal_docs.mjs
if [ -n "$(git status --porcelain --untracked-files=all)" ]; then
  printf '%s\n' 'Generated legal documents are not committed or are stale.' >&2
  git status --short >&2
  git diff --exit-code >&2 || true
  exit 1
fi
node --test tests/site-structure.test.mjs
