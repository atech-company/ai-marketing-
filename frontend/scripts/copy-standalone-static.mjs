/**
 * After `next build` with output: 'standalone', Next expects:
 *   .next/static → .next/standalone/.next/static
 *   public → .next/standalone/public
 * Run: node scripts/copy-standalone-static.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const standalone = path.join(root, ".next", "standalone");
const nextStatic = path.join(root, ".next", "static");
const destStatic = path.join(standalone, ".next", "static");
const pub = path.join(root, "public");
const destPub = path.join(standalone, "public");

if (!fs.existsSync(standalone)) {
  console.warn("[copy-standalone-static] .next/standalone missing — skip (build without standalone?)");
  process.exit(0);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, name.name);
    const d = path.join(dest, name.name);
    if (name.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyDir(nextStatic, destStatic);
copyDir(pub, destPub);
console.log("[copy-standalone-static] copied .next/static and public → .next/standalone");
