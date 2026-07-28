import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const distributionDirectory = resolve(directory, 'dist');
const port = Number(process.env.PORT);
const apiBaseUrl = process.env.PUBLIC_API_BASE_URL?.trim();

if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error('PORT must be a valid port number.');
}

if (apiBaseUrl === undefined || apiBaseUrl.length === 0) {
  throw new Error('PUBLIC_API_BASE_URL is required.');
}

const apiOrigin = new URL(apiBaseUrl).origin;
const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
]);

function safePath(pathname) {
  const requested = resolve(distributionDirectory, `.${pathname}`);
  const repositoryRelative = relative(distributionDirectory, requested);
  if (repositoryRelative.startsWith('..') || isAbsolute(repositoryRelative)) {
    return undefined;
  }
  return requested;
}

const server = createServer(async (request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader(
    'Content-Security-Policy',
    `default-src 'self'; connect-src 'self' ${apiOrigin}; img-src 'self'; script-src 'self'; style-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'`,
  );

  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  if (pathname === '/config.js') {
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    response.end(
      `window.__SALINARAL_CONFIG__ = ${JSON.stringify({ PUBLIC_API_BASE_URL: apiBaseUrl })};`,
    );
    return;
  }

  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = safePath(requestedPath);
  if (filePath === undefined) {
    response.statusCode = 404;
    response.end('Not found');
    return;
  }

  try {
    const contents = await readFile(filePath);
    response.setHeader(
      'Content-Type',
      contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
    );
    response.end(contents);
  } catch {
    const indexContents = await readFile(resolve(distributionDirectory, 'index.html'));
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(indexContents);
  }
});

server.listen(port, '0.0.0.0');
