#!/usr/bin/env bash
set -euo pipefail

echo "Stopping Metro/Expo on 8081, 19000, 19001..."
for p in 8081 19000 19001; do
  PIDS=$(lsof -i :$p -sTCP:LISTEN -t || true)
  if [[ -n "${PIDS}" ]]; then
    kill -9 $PIDS || true
  fi
done

echo "Clearing Metro caches..."
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all || true
fi
rm -rf "$TMPDIR/metro-*" "$TMPDIR/haste-map-*"

echo "Done."