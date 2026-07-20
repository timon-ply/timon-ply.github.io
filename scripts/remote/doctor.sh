#!/usr/bin/env sh
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
node_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || true)
test "$node_major" = 22 || { printf 'Node 22 required; found %s\n' "${node_major:-missing}" >&2; exit 1; }
test -f "$repo_root/tools/generate_legal_docs.mjs"
test -f "$repo_root/tests/site-structure.test.mjs"
printf '%s\n' 'Doctor passed: Node 22 and the generator/test contracts are available.'
