#!/usr/bin/env bash
set -euo pipefail

echo "Shutting down all simulators..."
xcrun simctl shutdown all || true

echo "Erasing all booted devices..."
for udid in $(xcrun simctl list devices | awk -F '[()]' '/Booted/{print $2}'); do
  xcrun simctl erase "$udid" || true
done

# Optionally erase all available (heavy; uncomment if needed)
# for udid in $(xcrun simctl list devices | awk -F '[()]' '/(Shutdown|Booted)/{print $2}'); do
#   xcrun simctl erase "$udid" || true
# done

echo "Opening default iOS Simulator..."
open -a Simulator

echo "Uninstalling Expo Go (if installed) from booted device..."
sleep 3
xcrun simctl uninstall booted host.exp.Exponent || true

echo "Simulator reset complete."