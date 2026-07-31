#!/usr/bin/env sh
set -eu
repo_root=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
artifact_dir="$repo_root/.remote-artifacts"; port=${PORT:-4173}
mkdir -p "$artifact_dir"; cd "$repo_root"; node tools/generate_legal_docs.mjs
chrome=${CHROME_BIN:-}
for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
  [ -z "$chrome" ] || break
  if command -v "$candidate" >/dev/null 2>&1; then chrome=$candidate; break; fi
done
if [ -z "$chrome" ]; then
  printf '%s\n' 'Site generated; Chrome unavailable. Use private Codespaces forwarding.' | tee "$artifact_dir/preview-limitations.txt"; exit 0
fi
python3 -m http.server "$port" --bind 127.0.0.1 --directory "$repo_root" >"$artifact_dir/preview-server.log" 2>&1 &
server_pid=$!; trap 'kill "$server_pid" 2>/dev/null || true' EXIT INT TERM
i=0
until curl -fsS "http://127.0.0.1:$port/" >/dev/null 2>&1; do i=$((i+1)); [ "$i" -lt 30 ] || exit 1; sleep 1; done
"$chrome" --headless --no-sandbox --disable-dev-shm-usage --hide-scrollbars --window-size=390,844 --screenshot="$artifact_dir/legal-site-phone.png" "http://127.0.0.1:$port/"
"$chrome" --headless --no-sandbox --disable-dev-shm-usage --hide-scrollbars --window-size=960,1200 --screenshot="$artifact_dir/legal-site-medium.png" "http://127.0.0.1:$port/"
