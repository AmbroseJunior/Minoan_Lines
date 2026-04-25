#!/bin/bash
set -eo pipefail

# ── Environment ────────────────────────────────────────────────────────────────
# Vercel runs as root; Flutter refuses root. Spoof a safe user identity.
export USER=vercel
export HOME=/tmp/flutter-home
mkdir -p "$HOME"

# Disable all Flutter telemetry/analytics that can stall in CI
export FLUTTER_ROOT=/tmp/flutter
export PUB_CACHE=/tmp/pub-cache
mkdir -p "$PUB_CACHE"

# ── Flutter SDK ────────────────────────────────────────────────────────────────
FLUTTER_VERSION="3.24.5"
FLUTTER_DIR="/tmp/flutter"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz"

echo "==> [1/5] Downloading Flutter ${FLUTTER_VERSION}..."
curl -fsSL --retry 3 --retry-delay 5 "$FLUTTER_URL" -o /tmp/flutter.tar.xz

echo "==> [2/5] Extracting Flutter..."
tar xf /tmp/flutter.tar.xz -C /tmp
rm /tmp/flutter.tar.xz

export PATH="$PATH:${FLUTTER_DIR}/bin"
flutter --version

echo "==> [3/5] Configuring Flutter for web..."
flutter config --no-analytics --enable-web
flutter precache --web --no-android --no-ios --no-macos --no-linux --no-windows --no-fuchsia

echo "==> [4/5] Installing pub dependencies..."
cd app
flutter pub get

echo "==> [5/5] Building Flutter web (HTML renderer)..."
flutter build web \
  --release \
  --web-renderer html \
  --dart-define=SUPABASE_URL="${SUPABASE_URL:-}" \
  --dart-define=SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}" \
  --dart-define=API_BASE_URL="${API_BASE_URL:-}"

echo "==> Build output size: $(du -sh build/web | cut -f1)"
echo "==> Done."