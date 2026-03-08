#!/bin/bash
# Run this script to download the Dagular font files into public/fonts/
# Dagular is a commercial/custom font — place your licensed .woff2 files here.

FONT_DIR="public/fonts"
mkdir -p "$FONT_DIR"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Dagular Font Setup Instructions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Dagular is a commercial font. To use it:"
echo ""
echo "  1. Purchase / download from:"
echo "     https://www.fontshare.com/fonts/dagular"
echo "     or wherever you have a license."
echo ""
echo "  2. Place the .woff2 / .woff files in:"
echo "     public/fonts/"
echo ""
echo "  Required filenames:"
echo "     Dagular-Regular.woff2"
echo "     Dagular-Regular.woff"
echo "     Dagular-Medium.woff2"
echo "     Dagular-Medium.woff"
echo "     Dagular-SemiBold.woff2"
echo "     Dagular-SemiBold.woff"
echo "     Dagular-Bold.woff2"
echo "     Dagular-Bold.woff"
echo ""
echo "  3. The app will automatically use them (configured in index.html)."
echo ""
echo "  Fallback: 'Inter' is used until Dagular fonts are placed in public/fonts/"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Try Fontshare CDN (Dagular via Fontshare API)
# Fontshare provides a CSS import — update index.html with:
# <link href="https://api.fontshare.com/v2/css?f[]=dagular@400,500,600,700&display=swap" rel="stylesheet">

echo "Attempting CDN fetch via Fontshare..."
if command -v curl &> /dev/null; then
  curl -s -o /dev/null -w "%{http_code}" "https://api.fontshare.com/v2/css?f[]=dagular@400&display=swap" | grep -q "200" && \
    echo "✓ Fontshare CDN is reachable! You can use the CDN link instead of local files." || \
    echo "✗ CDN not reachable. Please use local font files."
fi
