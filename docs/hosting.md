# Hosting

Reference for how the storefront is served. For the commands that deploy it,
see [Deploying the storefront](./deploying.md).

## The stack

The site is a Next.js static export. `npm run build` writes plain HTML, CSS,
JavaScript, and images to `out/`. No server runs.

| Piece | Value |
|---|---|
| S3 bucket | `atozaccessory-storefront` in `us-east-1` |
| Bucket access | Private. All public access is blocked. |
| CloudFront distribution | `E3FTPOUVNUIBTA` |
| Origin access | Origin Access Control `atozaccessory-storefront-oac` |
| Viewer request function | `atozaccessory-router`, runtime `cloudfront-js-2.0` |
| Cache policy | Managed-CachingOptimized, which honours the origin's `Cache-Control` |
| Certificate | `arn:aws:acm:us-east-1:545009868913:certificate/3047d628-1d51-4fa8-8851-a74846e0abf4`, covering `atozaccessory.com` and `*.atozaccessory.com` |

The bucket policy grants `s3:GetObject` to the CloudFront service principal and
only when the request carries this distribution's ARN. Nothing else can read the
bucket.

## How a URL becomes an S3 object

S3 serves this bucket as a plain origin, not as a website endpoint, so it
resolves no index documents. The `atozaccessory-router` function rewrites every
request URI to an exact object key before CloudFront looks in the bucket.

| Request | Object key | Rule |
|---|---|---|
| `/` | `index.html` | A URI that ends in a slash gets `index.html`. |
| `/shop` | `shop.html` | A URI with no file extension gets `.html`. |
| `/admin/orders` | `admin/orders.html` | Same rule, at any depth. |
| `/account/orders` | `account/orders.html` | Same rule. This is the list page. |
| `/product/<id>` | `product/__shell__.html` | Prefix rewrite. |
| `/product/<id>.txt` | `product/__shell__.txt` | Prefix rewrite of the RSC payload. |
| `/account/orders/<id>` | `account/orders/__shell__.html` | Prefix rewrite. |
| `/_next/static/<hash>/app.js` | unchanged | A URI with an extension passes through. |
| `/images/logo.jpg` | unchanged | A URI with an extension passes through. |
| anything missing | `404.html`, returned with status 404 | CloudFront custom error response. |

A request for `atozaccessory.com` returns a 302 to the same path on
`www.atozaccessory.com`. That matches the redirect Amplify served, so the
canonical host does not change.

## Why dynamic routes use a shell

`output: "export"` requires `generateStaticParams` on every dynamic segment, and
the catalog changes whenever the admin adds a product. Enumerating ids at build
time would mean rebuilding the site on every catalog edit.

Instead each dynamic route exports exactly one page under the id `__shell__`,
and the router function serves that file for every real id. The client component
reads the real id from `window.location.pathname`. Product and order ids are
24-character hexadecimal ObjectIds, so `__shell__` can never collide with one.

`scripts/cloudfront-function.test.mjs` asserts every row of the table above.
The deploy workflow runs it before it uploads anything.

## Cache headers

`scripts/deploy.sh` sets `Cache-Control` per file type at upload time.

| Path | `Cache-Control` |
|---|---|
| `_next/static/**` | `public, max-age=31536000, immutable` |
| `**/*.html` | `public, max-age=0, s-maxage=300, must-revalidate` |
| everything else | `public, max-age=86400` |

HTML carries two lifetimes on purpose. `max-age=0` keeps the browser
revalidating, so a returning visitor always sees the current page. `s-maxage=300`
lets the CloudFront edge hold it for five minutes; browsers ignore that
directive and CloudFront honours it. Without the second one, a few requests in
every handful pay a 440 ms revalidation round trip to S3 rather than a 35 ms
edge hit. Each deploy invalidates `/*`, so a release is still visible straight
away.

Hashed assets under `_next/static` are never deleted on deploy. A visitor who
loaded a page just before a release keeps working, and the leftover files cost
fractions of a cent.

## What this replaced

The site ran on AWS Amplify Hosting, app `jewelry-store` (`d3v4bqctfwhddx`) in
`eu-north-1`, on the `WEB_COMPUTE` platform. Amplify ran the Next.js server in
Lambda. Two server-side features depended on it and neither worked in
production: `generateMetadata` on the product page and the server-side hero
fetch on the homepage both built request URLs by concatenating a
`NEXT_PUBLIC_API_URL` that ended in a slash, producing a double slash that the
backend rejected with 401. Per-product share cards come from the backend at
`/products/share/:id`, which is what `ShareButton` links to, so the export gives
up nothing that worked.
