import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // If a parent folder has another lockfile, pin this app as the workspace root for Turbopack.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
