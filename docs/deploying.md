# Deploying the storefront

How to release the site, move the domain onto it, and undo that move. For what
the stack is made of, see [Hosting](./hosting.md).

## Release a change

Push to `main`. The `Deploy storefront` workflow builds the export, uploads it,
and invalidates the CloudFront cache. A release is live about a minute after the
workflow finishes.

To release from your machine instead:

```bash
./scripts/deploy.sh
```

The script refuses to build if `NEXT_PUBLIC_API_URL` ends in a slash, and it
fails if the build does not produce the files the router expects. Both checks
guard mistakes that are invisible until a customer hits them.

## Set up deploys from GitHub

Run this once. It creates the GitHub OIDC provider and a role scoped to this
repository's `main` branch, so no AWS access key is stored in GitHub.

```bash
./scripts/github-oidc.sh
```

Copy the role ARN it prints into the repository variable `AWS_DEPLOY_ROLE` under
**Settings → Secrets and variables → Actions → Variables**.

## Freeze Amplify before you merge this to main

Do this first, before the static-export branch reaches `main`.

Amplify's `main` branch still has auto-build on, so merging would make Amplify
rebuild the app. The app no longer produces a server build, so that rebuild
would replace the last working Amplify deployment with a broken one and take
the rollback path with it. Turn auto-build off and Amplify keeps serving its
last good deployment from 2026-07-22, which is what `scripts/rollback.sh`
restores.

```bash
aws amplify update-branch --region eu-north-1 \
  --app-id d3v4bqctfwhddx --branch-name main --no-enable-auto-build
```

To undo it, run the same command with `--enable-auto-build`.

## Move the domain onto CloudFront

Read this section before you start it. The site goes down partway through.

CloudFront refuses to register a domain alias that is live on another
distribution, and Amplify's distribution holds both `atozaccessory.com` and
`www.atozaccessory.com`. Amplify has to release the names before CloudFront
accepts them, and the site is unreachable from that release until the new
distribution finishes deploying. That window is usually 5 to 15 minutes. Run it
during the overnight traffic low.

1. Confirm the new distribution already serves the site:

    ```bash
    curl -sI https://d16rudrv92zfo9.cloudfront.net/ | head -1
    ```

    If that is not `HTTP/2 200`, run `./scripts/deploy.sh` and try again.

2. Release the names from Amplify and attach them to CloudFront:

    ```bash
    ./scripts/cutover.sh
    ```

    The script stops and prints the two DNS records to apply. It changes no DNS
    itself. To have it update Route 53 as well, run `./scripts/cutover.sh
    --with-dns`.

3. Apply the DNS records it printed. Use alias A records rather than a CNAME:
   they work at the apex, and Route 53 does not bill their queries.

4. Confirm the site is back:

    ```bash
    curl -sI https://www.atozaccessory.com/ | head -1
    curl -sI https://atozaccessory.com/ | head -2
    ```

    The second command must show a 302 to `https://www.atozaccessory.com/`.

Nothing else in the hosted zone changes. The `api`, email, and
certificate-validation records stay as they are.

## Undo the move

If the content is wrong, fix it forward. Correct the source, run
`./scripts/deploy.sh`, and the invalidation takes effect in about a minute. That
is faster than any rollback.

If the domain move itself failed, run:

```bash
./scripts/rollback.sh
```

It detaches the aliases from CloudFront and re-associates the domain with
Amplify. Amplify then re-issues its managed certificate. The validation CNAME
from the original association is still in the hosted zone, so this usually takes
minutes, but it is slower than the cutover was. Watch it with the command the
script prints, then point DNS back at the Amplify distribution it reports.

## Retire Amplify

Do this only after the site has run on CloudFront long enough to trust, and only
once you no longer want the rollback path. Deleting the Amplify app removes the
rollback.

```bash
aws amplify delete-app --region eu-north-1 --app-id d3v4bqctfwhddx
```
