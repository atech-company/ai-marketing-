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
};

export default nextConfig;
