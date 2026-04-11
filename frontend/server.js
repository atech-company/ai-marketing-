/**
 * Hostinger / Node.js production entry.
 * Serves the Next.js production build and respects process.env.PORT.
 *
 * Rebuild: rm -rf .next && npm ci && npm run build
 * If using .next/standalone only: run `npm run postbuild` (Linux/mac) or copy .next/static per Next docs.
 */
const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = process.env.HOSTNAME || "0.0.0.0";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    createServer((req, res) => {
      const url = req.url || "";
      // Do not let intermediaries cache HTML/RSC while old deployments had different chunk names.
      if (!url.startsWith("/_next/static/") && !url.startsWith("/_next/image")) {
        res.setHeader("Cache-Control", "private, no-cache, no-store, must-revalidate");
        res.setHeader("CDN-Cache-Control", "no-store");
      }
      handle(req, res).catch((err) => {
        console.error("[next] request handler error", err);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end("Internal Server Error");
        }
      });
    }).listen(port, hostname, () => {
      console.log(`[next] server ready — http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV || "undefined"})`);
    });
  })
  .catch((err) => {
    console.error("[next] failed to prepare() — check .next exists (run npm run build)", err);
    process.exit(1);
  });
