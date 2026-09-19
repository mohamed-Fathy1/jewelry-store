#!/usr/bin/env bash
# Move atozaccessory.com from Amplify to the new CloudFront distribution.
#
# There is unavoidable downtime here. CloudFront refuses to register a domain
# alias that is live on another distribution, and Amplify's distribution holds
# both atozaccessory.com and www.atozaccessory.com. So Amplify has to release
# them before CloudFront will accept them, and the site is unreachable from the
# release until the new distribution finishes deploying. Budget 5 to 15 minutes
# and run it during the overnight traffic low.
#
# DNS is left to the operator by default. Pass --with-dns to have this script
# update Route 53 as well.
set -euo pipefail

APP_ID="d3v4bqctfwhddx"
APP_REGION="eu-north-1"
DOMAIN="atozaccessory.com"
ZONE_ID="Z09414472OJJPPAHLU475"
CERT_ARN="arn:aws:acm:us-east-1:545009868913:certificate/3047d628-1d51-4fa8-8851-a74846e0abf4"
DIST_COMMENT="atozaccessory storefront (static export)"
CLOUDFRONT_ZONE_ID="Z2FDTNDATAQYW2"   # fixed, same for every CloudFront distribution

WITH_DNS=0
[ "${1:-}" = "--with-dns" ] && WITH_DNS=1

say() { printf '\n== %s\n' "$*"; }

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)
[ "$DIST_ID" != "None" ] || { echo "distribution not found; run scripts/infra.sh" >&2; exit 1; }
DIST_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)

say "pre-flight: the new distribution must already serve the site"
CODE=$(curl -s -o /dev/null -w '%{http_code}' "https://${DIST_DOMAIN}/")
[ "$CODE" = "200" ] || { echo "https://${DIST_DOMAIN}/ returned $CODE, not 200. Deploy before cutting over." >&2; exit 1; }
echo "   https://${DIST_DOMAIN}/ returns 200"

say "release the domain from Amplify"
aws amplify delete-domain-association --region "$APP_REGION" \
  --app-id "$APP_ID" --domain-name "$DOMAIN" >/dev/null
echo "   released; the live site is DOWN from this moment"

say "attach aliases to the new distribution"
TMP=$(mktemp -d)
aws cloudfront get-distribution-config --id "$DIST_ID" > "$TMP/cur.json"
ETAG=$(python3 -c "import json;print(json.load(open('$TMP/cur.json'))['ETag'])")
python3 - "$TMP/cur.json" "$TMP/new.json" "$CERT_ARN" "$DOMAIN" <<'PY'
import json, sys
cur, out, cert, domain = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
cfg = json.load(open(cur))["DistributionConfig"]
cfg["Aliases"] = {"Quantity": 2, "Items": [domain, "www." + domain]}
cfg["ViewerCertificate"] = {
    "ACMCertificateArn": cert,
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021",
    "CertificateSource": "acm",
}
json.dump(cfg, open(out, "w"))
PY
# Amplify releases the names asynchronously, so CloudFront can still report
# CNAMEAlreadyExists for a minute after the delete returns. Retry rather than
# leave the site down on a race.
for attempt in $(seq 1 20); do
  if aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" \
       --distribution-config "file://$TMP/new.json" >/dev/null 2>"$TMP/err"; then
    echo "   aliases attached on attempt ${attempt}"
    break
  fi
  if ! grep -q 'CNAMEAlreadyExists' "$TMP/err"; then
    cat "$TMP/err" >&2; rm -rf "$TMP"; exit 1
  fi
  [ "$attempt" = "20" ] && { echo "   still held after 20 attempts" >&2; cat "$TMP/err" >&2; rm -rf "$TMP"; exit 1; }
  echo "   names not released yet, retrying in 15s (${attempt}/20)"
  sleep 15
  ETAG=$(aws cloudfront get-distribution-config --id "$DIST_ID" --query ETag --output text)
done
rm -rf "$TMP"

say "waiting for the distribution to deploy"
aws cloudfront wait distribution-deployed --id "$DIST_ID"
echo "   deployed"

if [ "$WITH_DNS" = "1" ]; then
  say "updating Route 53"
  CHANGE=$(mktemp)
  cat > "$CHANGE" <<JSON
{"Changes":[
 {"Action":"UPSERT","ResourceRecordSet":{"Name":"${DOMAIN}.","Type":"A",
   "AliasTarget":{"HostedZoneId":"${CLOUDFRONT_ZONE_ID}","DNSName":"${DIST_DOMAIN}","EvaluateTargetHealth":false}}},
 {"Action":"UPSERT","ResourceRecordSet":{"Name":"www.${DOMAIN}.","Type":"A",
   "AliasTarget":{"HostedZoneId":"${CLOUDFRONT_ZONE_ID}","DNSName":"${DIST_DOMAIN}","EvaluateTargetHealth":false}}}
]}
JSON
  aws route53 change-resource-record-sets --hosted-zone-id "$ZONE_ID" \
    --change-batch "file://$CHANGE" --query 'ChangeInfo.Id' --output text
  rm -f "$CHANGE"
  echo "   records updated"
else
  cat <<DNS

== DNS is yours to apply
   Point both names at the new distribution. Alias A records are preferred
   over CNAME: they work at the apex and Route 53 does not bill their queries.

   ${DOMAIN}        A  ALIAS -> ${DIST_DOMAIN}  (hosted zone ${CLOUDFRONT_ZONE_ID})
   www.${DOMAIN}    A  ALIAS -> ${DIST_DOMAIN}  (hosted zone ${CLOUDFRONT_ZONE_ID})

   The existing www record is a CNAME with a 500 second TTL, so replace it
   rather than editing it. Nothing else in the zone changes; the api, email
   and certificate-validation records stay exactly as they are.
DNS
fi

say "done"
echo "   verify: curl -sI https://www.${DOMAIN}/ | head -1"
echo "   rollback: scripts/rollback.sh"
