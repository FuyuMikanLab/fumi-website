import { DATA_MEMBERS } from "@/src/data";
import { toSameOriginAsset } from "@/src/utils/cdn";
import { formatDate } from "@/src/utils/formatDate";
import type { IFanArtList } from "./artMap";

export { toSameOriginAsset } from "@/src/utils/cdn";

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

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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
    .replaceAll("{{DATE}}", escapeHtml(formatDate(entry.date)))
    .replaceAll("{{FAN_NAME}}", escapeHtml(entry.fanName || entry.artistName))
    .replaceAll("{{ARTIST_NAME}}", escapeHtml(entry.artistName))
    .replaceAll("{{ARTIST_DESC}}", escapeHtml(entry.artistDesc ?? ""))
    .replaceAll("{{REMARK}}", remark ? `“${escapeHtml(remark)}”` : "")
    .replaceAll("{{REMARK_EMPTY}}", remark ? "false" : "true")
    .replaceAll("{{MAIN_IMAGE}}", escapeHtml(main))
    .replaceAll("{{THUMBS_HTML}}", thumbsHtml)
    .replaceAll("{{PAGE_URL}}", escapeHtml(pageUrl));
};
