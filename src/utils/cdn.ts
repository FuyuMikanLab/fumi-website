/** CDN 源站；图片等可直连，WebGL 视频建议走同源 /cdn 代理。 */
export const CDN_ORIGIN = "https://assert.vrfan.icu";

/** 同源 /cdn 代理路径（next.config rewrites → assert.vrfan.icu）。 */
export const assetUrl = (path: string) =>
  `/cdn${path.startsWith("/") ? path : `/${path}`}`;

/** 直连 CDN 完整 URL（适合 next/image 等已配置 remotePatterns 的场景）。 */
export const cdnUrl = (path: string) =>
  `${CDN_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;

/** 资源站 URL → 同源 /cdn，避免 html-to-image 跨域污染。 */
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
