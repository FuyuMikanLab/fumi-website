#!/usr/bin/env node
/**
 * 按站点实际用字子集化 ChillRoundGothic，输出 woff2。
 * CI 用法：FONT_SOURCE_URL=https://... pnpm subset:font
 */
const fs = require("fs");
const path = require("path");
const subsetFont = require("subset-font");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "fonts/source/ChillRoundGothic_Normal.ttf");
const OUTPUT = path.join(ROOT, "public/fonts/ChillRoundGothic_Normal.woff2");
const CHARLIST = path.join(ROOT, "fonts/glyphs.txt");

const SCAN_DIRS = ["app", "src"];
const SCAN_SUFFIXES = new Set([".tsx", ".ts", ".jsx", ".js", ".css", ".md"]);

const BASE_CHARS =
  "abcdefghijklmnopqrstuvwxyz" +
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
  "0123456789" +
  " .,;:!?\"'`~@#$%^&*()-_=+[]{}<>|/\\" +
  "，。！？；：、…—·「」『』（）【】《》" +
  "\u201c\u201d\u2018\u2019" +
  "\n\t ";

function walkFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, files);
    } else if (SCAN_SUFFIXES.has(path.extname(entry.name))) {
      files.push(full);
    }
  }
  return files;
}

function collectChars() {
  const chars = new Set(BASE_CHARS);
  for (const dirname of SCAN_DIRS) {
    for (const file of walkFiles(path.join(ROOT, dirname))) {
      const text = fs.readFileSync(file, "utf8");
      for (const c of text) chars.add(c);
    }
  }
  return [...chars]
    .filter((c) => {
      const code = c.codePointAt(0);
      return (code >= 0x20 && code !== 0x7f) || c === "\t" || c === " ";
    })
    .sort()
    .join("");
}

async function resolveSourceBuffer() {
  if (fs.existsSync(SOURCE)) {
    return fs.readFileSync(SOURCE);
  }

  const url =
    process.env.FONT_SOURCE_URL ||
    "https://assert.vrfan.icu/website/fonts/ChillRoundGothic_Normal.ttf";

  console.log(`从 URL 下载源字体: ${url}`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`下载失败: ${res.status} ${res.statusText}`);
    process.exit(1);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(SOURCE), { recursive: true });
  fs.writeFileSync(SOURCE, buf);
  return buf;
}

async function main() {
  const text = collectChars();
  fs.mkdirSync(path.dirname(CHARLIST), { recursive: true });
  fs.writeFileSync(CHARLIST, text, "utf8");

  const sourceBuffer = await resolveSourceBuffer();
  console.log(`用字数: ${[...text].length}`);

  const subsetBuffer = await subsetFont(sourceBuffer, text, {
    targetFormat: "woff2",
  });

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, subsetBuffer);

  const sizeKb = subsetBuffer.length / 1024;
  const srcMb = sourceBuffer.length / (1024 * 1024);
  console.log(
    `完成: ${path.relative(ROOT, OUTPUT)} (${sizeKb.toFixed(1)} KB)`,
  );
  console.log(
    `源字体: ${srcMb.toFixed(1)} MB → 子集约 ${(sizeKb / 1024).toFixed(2)} MB`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
