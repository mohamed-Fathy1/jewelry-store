function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Keep www canonical, matching the redirect Amplify served. 302 rather than
  // 301 so a bad cutover can be undone without waiting out browser caches.
  var host = request.headers.host && request.headers.host.value;
  if (host === 'atozaccessory.com') {
    return {
      statusCode: 302,
      statusDescription: 'Found',
      headers: {
        location: { value: 'https://www.atozaccessory.com' + uri },
        'cache-control': { value: 'max-age=0' }
      }
    };
  }

  // The catalog is live, so product and order ids cannot be enumerated at build
  // time. Each dynamic route exports one shell page under the __shell__ id and
  // every real id is served that file; the client reads the id back out of
  // location.pathname. The .txt sibling is Next's RSC payload for the same
  // route, and it has to be rewritten too or soft navigation falls back to a
  // full page load.
  var shells = [
    { prefix: '/product/', shell: '/product/__shell__' },
    { prefix: '/account/orders/', shell: '/account/orders/__shell__' }
  ];
  for (var i = 0; i < shells.length; i++) {
    var s = shells[i];
    if (uri.indexOf(s.prefix) === 0 && uri.length > s.prefix.length) {
      var isRsc = uri.slice(-4) === '.txt';
      request.uri = isRsc ? s.shell + '.txt' : s.shell + '.html';
      return request;
    }
  }

  if (uri.slice(-1) === '/') {
    request.uri = uri + 'index.html';
    return request;
  }

  // S3 is a plain origin here, not a website endpoint, so it resolves no index
  // documents. An extensionless path is a page and lives at <path>.html.
  var last = uri.substring(uri.lastIndexOf('/') + 1);
  if (last.indexOf('.') === -1) {
    request.uri = uri + '.html';
  }

  return request;
}
