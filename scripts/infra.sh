#!/usr/bin/env bash
# Provision the static-hosting stack: private S3 bucket, Origin Access Control,
# URI-rewrite CloudFront Function, and the distribution that ties them together.
#
# Idempotent. Re-running reconciles whatever already exists and prints the same
# summary, so it is safe to run after a partial failure.
#
# Creating a distribution does NOT attach the atozaccessory.com aliases, because
# a distribution will not accept an alias that is live on another one. The
# existing distribution already holds both names; re-running this script finds
# it by its comment and leaves those names alone. Attaching them to a NEW
# distribution means detaching them from the old one first. See
# docs/deploying.md, "Change where the domain points".
set -euo pipefail

BUCKET="${BUCKET:-atozaccessory-storefront}"
REGION="${REGION:-us-east-1}"
FUNCTION_NAME="${FUNCTION_NAME:-atozaccessory-router}"
DIST_COMMENT="atozaccessory storefront (static export)"
CALLER_REF="atozaccessory-storefront-v1"
# Managed-CachingOptimized. Honours the origin's Cache-Control, which the
# deploy script sets per file type.
CACHE_POLICY_ID="658327ea-f89d-4fab-a63d-7e88639e58f6"

say() { printf '\n== %s\n' "$*"; }

say "account"
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
echo "   $ACCOUNT"

say "S3 bucket: $BUCKET"
if aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null; then
  echo "   exists"
else
  aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" >/dev/null
  echo "   created"
fi
aws s3api put-public-access-block --bucket "$BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "   public access blocked (CloudFront reaches it through OAC)"

say "Origin Access Control"
OAC_ID=$(aws cloudfront list-origin-access-controls \
  --query "OriginAccessControlList.Items[?Name=='${BUCKET}-oac'].Id | [0]" --output text)
if [ "$OAC_ID" = "None" ] || [ -z "$OAC_ID" ]; then
  OAC_ID=$(aws cloudfront create-origin-access-control \
    --origin-access-control-config \
      "Name=${BUCKET}-oac,Description=OAC for ${BUCKET},SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3" \
    --query 'OriginAccessControl.Id' --output text)
  echo "   created $OAC_ID"
else
  echo "   exists $OAC_ID"
fi

say "CloudFront Function: $FUNCTION_NAME"
HERE="$(cd "$(dirname "$0")" && pwd)"
FN_SRC="$HERE/cloudfront-function.js"
node --check "$FN_SRC"
node "$HERE/cloudfront-function.test.mjs" >/dev/null && echo "   contract tests pass"
if aws cloudfront describe-function --name "$FUNCTION_NAME" >/dev/null 2>&1; then
  ETAG=$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query ETag --output text)
  aws cloudfront update-function --name "$FUNCTION_NAME" --if-match "$ETAG" \
    --function-config "Comment=storefront URI rewrites,Runtime=cloudfront-js-2.0" \
    --function-code "fileb://$FN_SRC" >/dev/null
  echo "   updated"
else
  aws cloudfront create-function --name "$FUNCTION_NAME" \
    --function-config "Comment=storefront URI rewrites,Runtime=cloudfront-js-2.0" \
    --function-code "fileb://$FN_SRC" >/dev/null
  echo "   created"
fi
ETAG=$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query ETag --output text)
aws cloudfront publish-function --name "$FUNCTION_NAME" --if-match "$ETAG" >/dev/null
FN_ARN=$(aws cloudfront describe-function --name "$FUNCTION_NAME" --query 'FunctionSummary.FunctionMetadata.FunctionARN' --output text)
echo "   published $FN_ARN"

say "CloudFront distribution"
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)
if [ "$DIST_ID" = "None" ] || [ -z "$DIST_ID" ]; then
  CONFIG=$(mktemp)
  cat > "$CONFIG" <<JSON
{
  "CallerReference": "${CALLER_REF}",
  "Comment": "${DIST_COMMENT}",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "PriceClass": "PriceClass_All",
  "HttpVersion": "http2and3",
  "IsIPV6Enabled": true,
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "s3-${BUCKET}",
      "DomainName": "${BUCKET}.s3.${REGION}.amazonaws.com",
      "OriginAccessControlId": "${OAC_ID}",
      "S3OriginConfig": { "OriginAccessIdentity": "" },
      "ConnectionAttempts": 3,
      "ConnectionTimeout": 10
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "s3-${BUCKET}",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true,
    "CachePolicyId": "${CACHE_POLICY_ID}",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": { "Quantity": 2, "Items": ["GET", "HEAD"] }
    },
    "FunctionAssociations": {
      "Quantity": 1,
      "Items": [{ "EventType": "viewer-request", "FunctionARN": "${FN_ARN}" }]
    }
  },
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      { "ErrorCode": 404, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 10 },
      { "ErrorCode": 403, "ResponsePagePath": "/404.html", "ResponseCode": "404", "ErrorCachingMinTTL": 10 }
    ]
  }
}
JSON
  DIST_ID=$(aws cloudfront create-distribution --distribution-config "file://$CONFIG" \
    --query 'Distribution.Id' --output text)
  rm -f "$CONFIG"
  echo "   created $DIST_ID"
else
  echo "   exists $DIST_ID"
fi
DIST_DOMAIN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.DomainName' --output text)
DIST_ARN=$(aws cloudfront get-distribution --id "$DIST_ID" --query 'Distribution.ARN' --output text)

say "bucket policy (allow only this distribution)"
POLICY=$(mktemp)
cat > "$POLICY" <<JSON
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "AllowCloudFrontServicePrincipalReadOnly",
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::${BUCKET}/*",
    "Condition": { "StringEquals": { "AWS:SourceArn": "${DIST_ARN}" } }
  }]
}
JSON
aws s3api put-bucket-policy --bucket "$BUCKET" --policy "file://$POLICY"
rm -f "$POLICY"
echo "   applied"

cat <<SUMMARY

== ready
   bucket        s3://${BUCKET}
   distribution  ${DIST_ID}
   test URL      https://${DIST_DOMAIN}
   aliases       $(aws cloudfront get-distribution --id "$DIST_ID" --query 'join(`, `, Distribution.DistributionConfig.Aliases.Items)' --output text 2>/dev/null || echo none)

   next: scripts/deploy.sh
SUMMARY
