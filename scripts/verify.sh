#!/usr/bin/env bash
# Check the deployed site against the routing contract in docs/hosting.md.
#
# Pass a host to test somewhere other than the CloudFront domain:
#   ./scripts/verify.sh www.atozaccessory.com
set -uo pipefail

DIST_COMMENT="atozaccessory storefront (static export)"
if [ $# -ge 1 ]; then
  HOST="$1"
else
  DIST_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)
  HOST=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)
fi
BASE="https://${HOST}"
echo "verifying ${BASE}"
echo

pass=0; fail=0
# check <path> <expected status> <string the body must contain, or - to skip>
check() {
  local path="$1" want_status="$2" want_body="${3:--}"
  local out status body
  out=$(curl -s -w '\n%{http_code}' "${BASE}${path}" 2>/dev/null)
  status="${out##*$'\n'}"
  body="${out%$'\n'*}"
  if [ "$status" != "$want_status" ]; then
    printf '  FAIL %-42s status %s, wanted %s\n' "$path" "$status" "$want_status"; fail=$((fail+1)); return
  fi
  if [ "$want_body" != "-" ] && ! printf '%s' "$body" | grep -qF "$want_body"; then
    printf '  FAIL %-42s status ok but body lacks %s\n' "$path" "$want_body"; fail=$((fail+1)); return
  fi
  printf '  ok   %-42s %s\n' "$path" "$status"; pass=$((pass+1))
}

# check_header <path> <header substring>
check_header() {
  local path="$1" want="$2" hdrs
  hdrs=$(curl -sI "${BASE}${path}" 2>/dev/null | tr -d '\r')
  if printf '%s' "$hdrs" | grep -qi -- "$want"; then
    printf '  ok   %-42s %s\n' "$path" "$want"; pass=$((pass+1))
  else
    printf '  FAIL %-42s missing %s\n' "$path" "$want"; fail=$((fail+1))
  fi
}

echo "pages"
check /                                          200
check /shop                                      200
check /cart                                      200
check /about                                     200
check /account/orders                            200

echo
echo "dynamic routes resolve to their shell"
check /product/6a7b855ebc29540b7ad47d61          200
check /product/6a7b855ebc29540b7ad47d61.txt      200
check /account/orders/6a7b855ebc29540b7ad47d61   200

echo
echo "missing paths return the 404 page"
check /this-page-does-not-exist                  404

echo
echo "cache headers"
check_header /                                   "cache-control: public, max-age=0, must-revalidate"
check_header /images/logo.jpg                    "cache-control: public, max-age=86400"

echo
echo "${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
