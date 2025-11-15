const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.fnt': 'application/xml; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const sendError = (res, statusCode, message) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(message);
};

const resolveFilePath = (urlPath) => {
  const sanitized = decodeURIComponent(urlPath.split('?')[0]);
  if (sanitized === '/' || sanitized === '') {
    return null;
  }
  const candidate = path.join(ROOT_DIR, sanitized);
  if (!candidate.startsWith(ROOT_DIR)) {
    return null;
  }
  return candidate;
};

const serveDirectoryListing = (res) => {
  const examplesDir = path.join(ROOT_DIR, 'example');
  let links = [];
  try {
    const entries = fs.readdirSync(examplesDir, { withFileTypes: true });
    links = entries
      .filter((entry) => entry.isDirectory())
      .flatMap((dir) => {
        const exampleHtml = path.join(examplesDir, dir.name, 'example.html');
        if (fs.existsSync(exampleHtml)) {
          return [{
            label: `${dir.name} example`,
            href: `/example/${dir.name}/example.html`
          }];
        }
        const nested = fs.readdirSync(path.join(examplesDir, dir.name), { withFileTypes: true })
          .filter((child) => child.isDirectory())
          .map((child) => {
            const nestedExample = path.join(examplesDir, dir.name, child.name, 'example.html');
            if (fs.existsSync(nestedExample)) {
              return {
                label: `${dir.name}/${child.name}`,
                href: `/example/${dir.name}/${child.name}/example.html`
              };
            }
            return null;
          })
          .filter(Boolean);
        return nested;
      });
  } catch (err) {
    links = [];
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>PixiDom Examples</title>
<style>
  body { font-family: sans-serif; margin: 2rem; }
  ul { list-style: none; padding: 0; }
  li { margin-bottom: 0.5rem; }
  a { color: #007acc; text-decoration: none; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<h1>PixiDom Examples</h1>
<p>Select an example page:</p>
<ul>
${links.map((link) => `<li><a href="${link.href}">${link.label}</a></li>`).join('\n')}
</ul>
</body>
</html>`);
};

const server = http.createServer((req, res) => {
  if (!req.url) {
    sendError(res, 400, 'Bad request');
    return;
  }

  if (req.url === '/' || req.url === '') {
    serveDirectoryListing(res);
    return;
  }

  const filePath = resolveFilePath(req.url);
  if (!filePath) {
    sendError(res, 403, 'Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      sendError(res, 404, 'Not found');
      return;
    }

    let target = filePath;
    if (stats.isDirectory()) {
      target = path.join(filePath, 'index.html');
    }

    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        sendError(res, 404, 'Not found');
        return;
      }
      const ext = path.extname(target).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.statusCode = 200;
      res.setHeader('Content-Type', contentType);
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log(`Serving PixiDom examples at http://127.0.0.1:${PORT}`);
});
