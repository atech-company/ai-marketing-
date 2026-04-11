import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,

  /** Minimal server trace for Hostinger / Docker-style Node deploys (optional; see server.js + postbuild). */
  output: "standalone",

  // `next dev` can use Turbopack. Use `next build --webpack` in CI/Windows; plain `next build` may pick Turbopack and fail without native SWC.
  turbopack: {
    root: path.join(__dirname),
  },

  /**
   * Avoid stale HTML at CDN/browser pointing at old chunk hashes (404 on /_next/static/chunks/*.css).
   * More-specific routes first: long cache only for immutable build assets.
   */
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/_next/image",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/favicon.ico",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
      },
      {
        source: "/:path*",
        headers: [
          { key: "Cache-Control", value: "private, no-cache, no-store, must-revalidate" },
          // Hint for Cloudflare / some CDNs to not cache HTML at edge while leaving static rules above
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
