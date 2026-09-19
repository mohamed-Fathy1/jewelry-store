#!/usr/bin/env bash
# Let GitHub Actions deploy without a long-lived access key.
#
# Creates the GitHub OIDC provider and a role that only this repository's main
# branch can assume, holding only the permissions scripts/deploy.sh needs.
# Idempotent.
set -euo pipefail

REPO="${REPO:-mohamed-Fathy1/jewelry-store}"
BRANCH="${BRANCH:-main}"
ROLE_NAME="${ROLE_NAME:-github-actions-storefront-deploy}"
BUCKET="${BUCKET:-atozaccessory-storefront}"
DIST_COMMENT="atozaccessory storefront (static export)"

say() { printf '\n== %s\n' "$*"; }

ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='${DIST_COMMENT}'].Id | [0]" --output text)
[ "$DIST_ID" != "None" ] || { echo "distribution not found; run scripts/infra.sh" >&2; exit 1; }
PROVIDER_ARN="arn:aws:iam::${ACCOUNT}:oidc-provider/token.actions.githubusercontent.com"

say "GitHub OIDC provider"
if aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$PROVIDER_ARN" >/dev/null 2>&1; then
  echo "   exists"
else
  aws iam create-open-id-connect-provider \
    --url https://token.actions.githubusercontent.com \
    --client-id-list sts.amazonaws.com \
    --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 \
                      1c58a3a8518e8759bf075b76b750d4f2df264fcd >/dev/null
  echo "   created"
fi

say "role $ROLE_NAME"
TRUST=$(mktemp)
cat > "$TRUST" <<JSON
{"Version":"2012-10-17","Statement":[{
  "Effect":"Allow",
  "Principal":{"Federated":"${PROVIDER_ARN}"},
  "Action":"sts:AssumeRoleWithWebIdentity",
  "Condition":{
    "StringEquals":{"token.actions.githubusercontent.com:aud":"sts.amazonaws.com"},
    "StringLike":{"token.actions.githubusercontent.com:sub":"repo:${REPO}:ref:refs/heads/${BRANCH}"}
  }}]}
JSON
if aws iam get-role --role-name "$ROLE_NAME" >/dev/null 2>&1; then
  aws iam update-assume-role-policy --role-name "$ROLE_NAME" --policy-document "file://$TRUST"
  echo "   trust policy updated"
else
  aws iam create-role --role-name "$ROLE_NAME" \
    --description "Deploys the storefront static export to S3 and CloudFront" \
    --assume-role-policy-document "file://$TRUST" >/dev/null
  echo "   created"
fi
rm -f "$TRUST"

say "permissions"
PERMS=$(mktemp)
cat > "$PERMS" <<JSON
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":["s3:ListBucket"],"Resource":"arn:aws:s3:::${BUCKET}"},
 {"Effect":"Allow","Action":["s3:PutObject","s3:GetObject","s3:DeleteObject"],"Resource":"arn:aws:s3:::${BUCKET}/*"},
 {"Effect":"Allow","Action":["cloudfront:ListDistributions"],"Resource":"*"},
 {"Effect":"Allow","Action":["cloudfront:GetDistribution","cloudfront:CreateInvalidation"],
  "Resource":"arn:aws:cloudfront::${ACCOUNT}:distribution/${DIST_ID}"}
]}
JSON
aws iam put-role-policy --role-name "$ROLE_NAME" --policy-name storefront-deploy \
  --policy-document "file://$PERMS"
rm -f "$PERMS"
echo "   attached"

cat <<SUMMARY

== ready
   Add this as the repository variable AWS_DEPLOY_ROLE in
   https://github.com/${REPO}/settings/variables/actions

   arn:aws:iam::${ACCOUNT}:role/${ROLE_NAME}

   Only ${REPO} on branch ${BRANCH} can assume it, and it can only write to
   s3://${BUCKET} and invalidate distribution ${DIST_ID}. No access key is
   stored in GitHub.
SUMMARY
