#!/usr/bin/env sh
set -eu
node_major=$(node -p "process.versions.node.split('.')[0]" 2>/dev/null || true)
test "$node_major" = 22 || { printf 'Node 22 required; found %s\n' "${node_major:-missing}" >&2; exit 1; }
node --version
