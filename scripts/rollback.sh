#!/usr/bin/env bash
# Return atozaccessory.com to Amplify after a failed cutover.
#
# Read this before you need it. Rolling back is slower than cutting over,
# because Amplify has to re-issue and re-validate its managed certificate. The
# validation CNAME from the original association is still in the hosted zone,
# so this is usually minutes rather than an hour, but it is not instant.
#
# If the problem is with the site's CONTENT rather than the DNS swap, fixing
# forward is faster: correct the source, run scripts/deploy.sh, and the
# invalidation takes effect in about a minute.
set -euo pipefail

APP_ID="d3v4bqctfwhddx"
APP_REGION="eu-north-1"
DOMAIN="atozaccessory.com"
DIST_COMMENT="atozaccessory storefront (static export)"

say() { printf '\n== %s\n' "$*"; }

DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)

say "detach aliases from the CloudFront distribution"
TMP=$(mktemp -d)
aws cloudfront get-distribution-config --id "$DIST_ID" > "$TMP/cur.json"
ETAG=$(python3 -c "import json;print(json.load(open('$TMP/cur.json'))['ETag'])")
python3 - "$TMP/cur.json" "$TMP/new.json" <<'PY'
import json, sys
cfg = json.load(open(sys.argv[1]))["DistributionConfig"]
cfg["Aliases"] = {"Quantity": 0, "Items": []}
cfg["ViewerCertificate"] = {"CloudFrontDefaultCertificate": True,
                            "MinimumProtocolVersion": "TLSv1",
                            "CertificateSource": "cloudfront"}
json.dump(cfg, open(sys.argv[2], "w"))
PY
aws cloudfront update-distribution --id "$DIST_ID" --if-match "$ETAG" \
  --distribution-config "file://$TMP/new.json" >/dev/null
rm -rf "$TMP"
echo "   detached; the names are free again"

say "re-associate the domain with Amplify"
aws amplify create-domain-association --region "$APP_REGION" \
  --app-id "$APP_ID" --domain-name "$DOMAIN" \
  --sub-domain-settings 'prefix=,branchName=main' 'prefix=www,branchName=main' \
  --query 'domainAssociation.domainStatus' --output text

cat <<NEXT

== next
   Watch the association until it reports AVAILABLE:
     aws amplify get-domain-association --region ${APP_REGION} \\
       --app-id ${APP_ID} --domain-name ${DOMAIN} \\
       --query 'domainAssociation.{status:domainStatus,dns:subDomains[].dnsRecord}'

   Then point DNS back at the Amplify distribution it reports, and confirm:
     curl -sI https://www.${DOMAIN}/ | head -1
NEXT
