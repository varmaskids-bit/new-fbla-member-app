#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

echo "Starting Expo (tunnel, clear cache)..."
npx expo start --clear --tunnel
# Tip: when Dev Tools open, press 'i' to launch iOS Simulator.