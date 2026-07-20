#!/usr/bin/env sh
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
cd "$repo_root"
node tools/generate_legal_docs.mjs
node --test tests/site-structure.test.mjs
