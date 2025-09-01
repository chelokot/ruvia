#!/usr/bin/env bash
set -euo pipefail

# Usage (with Docker):
#   docker build -t ruvia-android -f Dockerfile.android .
#   docker run --rm -it -v "$PWD":/workspace ruvia-android bash scripts/build-android-aab.sh

export ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT:-/opt/android-sdk}

echo "[1/4] Installing JS deps (root)"
npm ci

echo "[2/4] Prebuilding (ensures Android native synced)"
if ! grep -q 'expo-build-properties' app.json; then
  echo "WARN: expo-build-properties plugin not found; continuing"
fi

echo "[3/4] Building Android AAB (:app:bundleRelease)"
pushd android >/dev/null
./gradlew --no-daemon :app:bundleRelease
popd >/dev/null

echo "[4/4] Artifact ready: android/app/build/outputs/bundle/release/app-release.aab"

