import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const src = readFileSync(join(here, 'cloudfront-function.js'), 'utf8');
const handler = new Function(src + '; return handler;')();

const req = (uri, host = 'www.atozaccessory.com') =>
  handler({ request: { uri, headers: { host: { value: host } } } });

// [description, input uri, host, expected uri OR {status, location}]
const cases = [
  ['root',                  '/',                                    'www.atozaccessory.com', '/index.html'],
  ['shop',                  '/shop',                                'www.atozaccessory.com', '/shop.html'],
  ['about',                 '/about',                               'www.atozaccessory.com', '/about.html'],
  ['cart',                  '/cart',                                'www.atozaccessory.com', '/cart.html'],
  ['nested admin page',     '/admin/orders',                        'www.atozaccessory.com', '/admin/orders.html'],
  ['orders list page',      '/account/orders',                      'www.atozaccessory.com', '/account/orders.html'],
  ['product by id',         '/product/6a7b855ebc29540b7ad47d61',    'www.atozaccessory.com', '/product/__shell__.html'],
  ['product RSC payload',   '/product/6a7b855ebc29540b7ad47d61.txt','www.atozaccessory.com', '/product/__shell__.txt'],
  ['order detail by id',    '/account/orders/6a7b855ebc29540b7ad4', 'www.atozaccessory.com', '/account/orders/__shell__.html'],
  ['shell is idempotent',   '/product/__shell__.html',              'www.atozaccessory.com', '/product/__shell__.html'],
  ['next static asset',     '/_next/static/abc/main.js',            'www.atozaccessory.com', '/_next/static/abc/main.js'],
  ['image passthrough',     '/images/logo.jpg',                     'www.atozaccessory.com', '/images/logo.jpg'],
  ['hero passthrough',      '/hero/hero-desktop.jpg',               'www.atozaccessory.com', '/hero/hero-desktop.jpg'],
  ['favicon',               '/favicon.ico',                         'www.atozaccessory.com', '/favicon.ico'],
  ['trailing slash dir',    '/shop/',                               'www.atozaccessory.com', '/shop/index.html'],
  ['apex redirects to www', '/shop',                                'atozaccessory.com',     { status: 302, location: 'https://www.atozaccessory.com/shop' }],
  ['apex root redirects',   '/',                                    'atozaccessory.com',     { status: 302, location: 'https://www.atozaccessory.com/' }],
];

let pass = 0, fail = 0;
for (const [name, uri, host, expected] of cases) {
  const out = req(uri, host);
  let actual, ok;
  if (typeof expected === 'string') {
    actual = out.uri;
    ok = actual === expected;
  } else {
    actual = { status: out.statusCode, location: out.headers?.location?.value };
    ok = actual.status === expected.status && actual.location === expected.location;
  }
  if (ok) { pass++; console.log(`  ok   ${name.padEnd(22)} ${uri}  ->  ${JSON.stringify(actual)}`); }
  else { fail++; console.log(`  FAIL ${name.padEnd(22)} ${uri}\n       expected ${JSON.stringify(expected)}\n       actual   ${JSON.stringify(actual)}`); }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
