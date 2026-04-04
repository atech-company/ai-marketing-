import path from "path";
import { fileURLToPath } from "url";

/** @type {import('next').NextConfig} */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  reactStrictMode: true,

  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
