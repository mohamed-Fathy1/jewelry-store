#!/usr/bin/env bash
# Build the static export and publish it to S3 behind CloudFront.
#
# Upload order matters. Hashed assets go up first and HTML goes up last, so a
# visitor never receives new HTML that references an asset which has not landed
# yet.
set -euo pipefail

BUCKET="${BUCKET:-atozaccessory-storefront}"
DIST_COMMENT="atozaccessory storefront (static export)"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Baked into the bundle at build time. No trailing slash: the app builds request
# URLs by string concatenation in places, and a trailing slash produces a double
# slash that the backend answers with 401.
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-https://api.atozaccessory.com}"
export NEXT_PUBLIC_META_PIXEL_ID="${NEXT_PUBLIC_META_PIXEL_ID:-1617903932237399}"
export NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://www.atozaccessory.com}"

say() { printf '\n== %s\n' "$*"; }

case "$NEXT_PUBLIC_API_URL" in
  */) echo "refusing to build: NEXT_PUBLIC_API_URL must not end in a slash" >&2; exit 1;;
esac

say "build"
cd "$ROOT"
# Node 21 and later fail to prerender /activate-account and /admin/login with
# "Cannot read properties of undefined (reading 'prototype')". package.json
# pins the range; check it here so the failure names its cause.
WANT=$(cat .nvmrc)
HAVE=$(node -v | sed 's/^v//;s/\..*//')
if [ "$HAVE" != "$WANT" ]; then
  echo "this build needs Node ${WANT}.x, found $(node -v)." >&2
  echo "run: nvm use" >&2
  exit 1
fi
npm run build
[ -d out ] || { echo "build produced no out/ directory" >&2; exit 1; }
for required in index.html 404.html product/__shell__.html account/orders/__shell__.html; do
  [ -f "out/$required" ] || { echo "build is missing out/$required, which the CloudFront router depends on" >&2; exit 1; }
done
echo "   out/ contains every file the routing contract requires"

say "upload hashed assets (immutable)"
# sync, not cp: these names carry a content hash, so an unchanged file is
# genuinely unchanged and skipping it is the point. Never deleted, so a visitor
# mid-session keeps working across a release.
aws s3 sync out/_next/static "s3://${BUCKET}/_next/static" \
  --cache-control "public, max-age=31536000, immutable" \
  --only-show-errors
echo "   done"

# cp, not sync, for everything below. sync compares size and timestamp and skips
# files it considers unchanged, and a skipped file keeps its OLD metadata. That
# silently strips Cache-Control from any file whose bytes did not change, so the
# headers below would drift out of the site one release at a time.
say "upload other assets"
aws s3 cp out "s3://${BUCKET}" --recursive \
  --exclude "*.html" --exclude "*.txt" --exclude "_next/static/*" \
  --cache-control "public, max-age=86400" \
  --only-show-errors
echo "   done"

say "upload RSC payloads"
# Next writes a .txt flight payload beside every .html and the client router
# fetches it on in-app navigation. These live at stable paths but their content
# changes every build, so they get HTML's short lifetime, not the asset one. A
# day-old payload would soft-navigate the visitor into stale markup. Content
# type is left to the CLI: it must stay text/plain or Next rejects the payload
# and falls back to a full page load.
aws s3 cp out "s3://${BUCKET}" --recursive \
  --exclude "*" --include "*.txt" \
  --cache-control "public, max-age=0, must-revalidate" \
  --only-show-errors
echo "   done"

say "upload HTML last"
# Last, so a visitor never receives new HTML that references an asset which has
# not landed yet.
aws s3 cp out "s3://${BUCKET}" --recursive \
  --exclude "*" --include "*.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --only-show-errors
echo "   done"

say "remove files that are no longer in the build"
# Everything above was just uploaded, so every remaining file matches by size
# and this pass only deletes. It cannot clobber the metadata set above.
aws s3 sync out "s3://${BUCKET}" \
  --exclude "_next/static/*" --delete --size-only --only-show-errors
echo "   done"

say "invalidate CloudFront"
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)
if [ "$DIST_ID" = "None" ] || [ -z "$DIST_ID" ]; then
  echo "   no distribution found; run scripts/infra.sh first" >&2; exit 1
fi
INV=$(aws cloudfront create-invalidation --distribution-id "$DIST_ID" --paths "/*" \
  --query 'Invalidation.Id' --output text)
DIST_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)
echo "   $INV"

cat <<SUMMARY

== deployed
   https://${DIST_DOMAIN}
   invalidation ${INV} usually completes within a minute
SUMMARY
