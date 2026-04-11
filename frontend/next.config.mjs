import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,

  // Used by `next dev` only when you run dev with Turbopack. Production uses `next build --webpack` for stable chunk output on static hosts.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
