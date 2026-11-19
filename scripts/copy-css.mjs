import fs from "fs";
import path from "path";

/** Copy Next CSS bundle to a stable public URL — mobile blockers often skip /_next/static/css. */
const cssDir = path.join(process.cwd(), ".next", "static", "css");
const outDir = path.join(process.cwd(), "public", "assets");
const outFile = path.join(outDir, "site.css");

if (!fs.existsSync(cssDir)) {
  console.warn("[copy-css] no .next/static/css — skip");
  process.exit(0);
}

const files = fs.readdirSync(cssDir).filter((f) => f.endsWith(".css"));
if (!files.length) {
  console.warn("[copy-css] no css files — skip");
  process.exit(0);
}

files.sort((a, b) => fs.statSync(path.join(cssDir, b)).size - fs.statSync(path.join(cssDir, a)).size);
const src = path.join(cssDir, files[0]);
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(src, outFile);
console.log(`[copy-css] ${files[0]} -> /assets/site.css`);
