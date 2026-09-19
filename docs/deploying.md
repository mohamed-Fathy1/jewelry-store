# Deploying the storefront

How to release the site and how to change where the domain points. For what the
stack is made of, see [Hosting](./hosting.md).

## Release a change

Push to `main`. The `Deploy storefront` workflow builds the static export,
uploads it to S3, and invalidates the CloudFront cache. A release is live about
a minute after the workflow finishes, and the whole run takes under two minutes.

To release from your machine instead:

```bash
nvm use
./scripts/deploy.sh
```

The build requires Node 20. Node 21 and later fail to prerender
`/activate-account` and `/admin/login`, so `deploy.sh` checks `.nvmrc` first and
tells you rather than failing inside a stack trace.

The script also refuses to build if `NEXT_PUBLIC_API_URL` ends in a slash, and
it fails if the build does not produce the files the CloudFront router expects.
Both guard mistakes that are otherwise invisible until a customer hits them.

## Check a deploy

```bash
./scripts/verify.sh www.atozaccessory.com
```

This asserts every row of the URL mapping in [Hosting](./hosting.md), all three
cache tiers, the content type of the RSC payloads, and that no page carries
`noindex`. Pass no argument to check the CloudFront domain directly instead.

`scripts/cloudfront-function.test.mjs` asserts the router's rewrite rules
without touching the network. CI runs it before it uploads anything.

## Undo a bad release

Fix it forward. Correct the source and push to `main`, or run
`./scripts/deploy.sh` from your machine. The invalidation takes effect in about
a minute.

To serve a previous build, check out that commit and run `./scripts/deploy.sh`.
The S3 bucket holds only the current build, so the repository is the only
history.

There is no rollback to Amplify. The app was deleted on 2026-09-19.

## Change where the domain points

Both names are Route 53 alias A records pointing at the distribution. To move
them, change the alias target. CloudFront's hosted zone id is always
`Z2FDTNDATAQYW2`.

```bash
aws route53 change-resource-record-sets --hosted-zone-id Z09414472OJJPPAHLU475 \
  --change-batch '{"Changes":[
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"atozaccessory.com.","Type":"A",
      "AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"<new>.cloudfront.net","EvaluateTargetHealth":false}}},
    {"Action":"UPSERT","ResourceRecordSet":{"Name":"www.atozaccessory.com.","Type":"A",
      "AliasTarget":{"HostedZoneId":"Z2FDTNDATAQYW2","DNSName":"<new>.cloudfront.net","EvaluateTargetHealth":false}}}
  ]}'
```

A distribution will not accept a domain alias that is live on another
distribution, so detach the names from the old one before attaching them to the
new one. That release is asynchronous and can take a minute to take effect.

## Rebuild the infrastructure

`scripts/infra.sh` reconciles the bucket, the Origin Access Control, the
`atozaccessory-router` function, and the distribution. It is idempotent, so
running it against the existing stack changes nothing.

`scripts/github-oidc.sh` creates the role GitHub Actions assumes. Run it once
and put the ARN it prints in the repository variable `AWS_DEPLOY_ROLE` under
**Settings → Secrets and variables → Actions → Variables**. No AWS access key
is stored in GitHub.
