import { DATA_MEMBERS } from "@/src/data";
import type { IFanArtList } from "./artMap";

const CDN_ORIGIN = "https://assert.vrfan.icu";
const TEMPLATE_URL = "/templates/fanart-share.html";
const TEMPLATE_VERSION = "4";

let templateCache: { v: string; html: string } | null = null;

/** 加载 public 下的 HTML 模板（避免 Turbopack 对 raw-loader 的兼容问题） */
export const loadFanArtShareTemplate = async (): Promise<string> => {
  if (templateCache?.v === TEMPLATE_VERSION) return templateCache.html;
  const res = await fetch(`${TEMPLATE_URL}?v=${TEMPLATE_VERSION}`, {
    cache: "no-cache",
  });
  if (!res.ok) {
    throw new Error(`分享卡模板加载失败 (${res.status})`);
  }
  const html = await res.text();
  templateCache = { v: TEMPLATE_VERSION, html };
  return html;
};

/** 资源站 URL → 同源 /cdn，避免 html-to-image 跨域污染 */
export const toSameOriginAsset = (url: string): string => {
  if (!url) return url;
  if (url.startsWith("/cdn/")) return url;
  if (url.startsWith(CDN_ORIGIN)) {
    return `/cdn${url.slice(CDN_ORIGIN.length)}`;
  }
  try {
    const u = new URL(
      url,
      typeof window !== "undefined" ? window.location.href : CDN_ORIGIN,
    );
    if (u.origin === CDN_ORIGIN) {
      return `/cdn${u.pathname}${u.search}`;
    }
  } catch {
    /* ignore */
  }
  return url;
};

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatShareDate = (d: string) => {
  const t = new Date(d);
  if (Number.isNaN(+t)) return d;
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}.${mm}.${dd}`;
};

export type BuildFanArtShareHtmlInput = {
  entry: IFanArtList;
  currentFile: string;
  pageUrl: string;
  vcode?: string;
  brand?: string;
};

export const buildFanArtShareHtml = async ({
  entry,
  currentFile,
  pageUrl,
  vcode,
  brand = "FuyumikanLab",
}: BuildFanArtShareHtmlInput): Promise<string> => {
  const template = await loadFanArtShareTemplate();
  const main = toSameOriginAsset(currentFile);
  const remark = (entry.fanRemark ?? "").trim();
  const thumbsHtml = entry.fileLists
    .map((src) => {
      const same = toSameOriginAsset(src);
      const active = src === currentFile || same === main;
      return `<div class="fas-thumb${active ? " is-active" : ""}"><img src="${escapeHtml(same)}" alt="" crossorigin="anonymous" /></div>`;
    })
    .join("");
  const vname =
    DATA_MEMBERS.seriesList
      .flatMap((series) => series.members)
      .find((member) => member.code === vcode)?.name ?? "";
  if (!vname) {
    throw new Error(`vcode ${vcode ?? "(empty)"} not found`);
  }

  return template
    .replaceAll("{{BRAND}}", escapeHtml(brand))
    .replaceAll("{{V_NAME}}", escapeHtml(vname))
    .replaceAll("{{DATE}}", escapeHtml(formatShareDate(entry.date)))
    .replaceAll("{{FAN_NAME}}", escapeHtml(entry.fanName || entry.artistName))
    .replaceAll("{{ARTIST_NAME}}", escapeHtml(entry.artistName))
    .replaceAll("{{REMARK}}", remark ? `“${escapeHtml(remark)}”` : "")
    .replaceAll("{{REMARK_EMPTY}}", remark ? "false" : "true")
    .replaceAll("{{MAIN_IMAGE}}", escapeHtml(main))
    .replaceAll("{{THUMBS_HTML}}", thumbsHtml)
    .replaceAll("{{PAGE_URL}}", escapeHtml(pageUrl));
};
