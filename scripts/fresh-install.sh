#!/usr/bin/env bash
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
cd "$HERE"

bash ./scripts/clean-caches.sh

echo "Removing node_modules and CocoaPods artifacts..."
rm -rf node_modules ios/Pods ios/Podfile.lock
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "Reinstalling dependencies..."
npm cache clean --force
npm install

echo "Installing iOS pods..."
npx pod-install

echo "Fresh install complete."