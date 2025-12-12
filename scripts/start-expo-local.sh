#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

echo "Starting Expo (localhost, clear cache)..."
npx expo start --clear --localhost
# Tip: when Dev Tools open, press 'i' to launch iOS Simulator.