#!/bin/bash
set -e

# Flutter refuses to run as root — Vercel builds as root, so spoof USER
export USER=vercel
export HOME=/tmp/flutter-home
mkdir -p "$HOME"

FLUTTER_VERSION="3.24.5"
FLUTTER_DIR="/tmp/flutter"
FLUTTER_URL="https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_${FLUTTER_VERSION}-stable.tar.xz"

echo "==> Downloading Flutter ${FLUTTER_VERSION}..."
curl -fsSL "$FLUTTER_URL" -o /tmp/flutter.tar.xz

echo "==> Extracting Flutter..."
tar xf /tmp/flutter.tar.xz -C /tmp
rm /tmp/flutter.tar.xz

export PATH="$PATH:${FLUTTER_DIR}/bin"

echo "==> Enabling web..."
flutter config --no-analytics --enable-web

echo "==> Installing pub dependencies..."
cd app
flutter pub get

echo "==> Building Flutter web (CanvasKit)..."
flutter build web \
  --release \
  --web-renderer canvaskit \
  --dart-define=SUPABASE_URL="${SUPABASE_URL:-}" \
  --dart-define=API_BASE_URL="${API_BASE_URL:-}"

echo "==> Build output size: $(du -sh build/web | cut -f1)"
echo "==> Done."