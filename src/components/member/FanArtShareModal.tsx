"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toPng } from "html-to-image";
import {
  buildFanArtShareHtml,
  type BuildFanArtShareHtmlInput,
} from "./buildFanArtShareHtml";

type FanArtShareModalProps = {
  open: boolean;
  onClose: () => void;
  share: BuildFanArtShareHtmlInput | null;
};

const CARD_W = 540;

export const FanArtShareModal = ({
  open,
  onClose,
  share,
}: FanArtShareModalProps) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!open || !share) {
      setPngUrl(null);
      setStatus("idle");
      setErrorMsg("");
      return;
    }

    let cancelled = false;
    const cleanupHost = () => {
      const host = mountRef.current;
      if (host) host.innerHTML = "";
    };

    const run = async () => {
      setStatus("loading");
      setPngUrl(null);
      setErrorMsg("");

      const host = mountRef.current;
      if (!host) {
        setStatus("error");
        setErrorMsg("预览容器未就绪");
        return;
      }

      try {
        host.innerHTML = await buildFanArtShareHtml(share);
        const card = host.querySelector("#share-card") as HTMLElement | null;
        if (!card) {
          cleanupHost();
          setStatus("error");
          setErrorMsg("分享卡模板解析失败");
          return;
        }

        // 等图片解码，减少空白导出
        const imgs = Array.from(card.querySelectorAll("img"));
        await Promise.all(
          imgs.map(
            (img) =>
              new Promise<void>((resolve) => {
                if (img.complete && img.naturalWidth > 0) {
                  resolve();
                  return;
                }
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }),
          ),
        );

        if (cancelled) {
          cleanupHost();
          return;
        }

        const dataUrl = await toPng(card, {
          width: CARD_W,
          pixelRatio: 2,
          cacheBust: true,
          style: {
            transform: "none",
            margin: "0",
            height: "auto",
          },
        });
        cleanupHost();
        if (cancelled) return;
        setPngUrl(dataUrl);
        setStatus("ready");
      } catch (e) {
        cleanupHost();
        if (cancelled) return;
        console.error(e);
        setStatus("error");
        setErrorMsg(
          e instanceof Error ? e.message : "生成失败，请稍后重试",
        );
      }
    };

    // 下一帧再写 DOM，确保隐藏容器已挂载
    const t = window.setTimeout(run, 32);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
      cleanupHost();
    };
  }, [open, share]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* 离屏渲染：固定宽度，高度随内容，供 html-to-image 采样 */}
      <div
        aria-hidden
        ref={mountRef}
        style={{
          position: "fixed",
          left: -10000,
          top: 0,
          width: CARD_W,
          pointerEvents: "none",
          opacity: 0,
          zIndex: -1,
        }}
      />

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-80 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="关闭"
              className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"
              onClick={onClose}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="分享图片预览"
              className="relative z-10 flex max-h-[min(92svh,1100px)] w-full max-w-[min(92vw,420px)] flex-col items-center gap-3"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            >
              <div className="relative max-h-[min(78svh,960px)] w-full overflow-y-auto overflow-x-hidden rounded-2xl bg-[#f3efe6] shadow-2xl ring-1 ring-white/20">
                {status === "loading" || status === "idle" ? (
                  <div className="grid min-h-[420px] place-items-center text-sm text-foreground/60">
                    <div className="flex flex-col items-center gap-3">
                      <span
                        className="block size-8 animate-spin rounded-full border-2 border-[color-mix(in_srgb,var(--accent)_28%,transparent)] border-t-(--accent)"
                        aria-hidden
                      />
                      <span>正在生成分享图…</span>
                    </div>
                  </div>
                ) : null}

                {status === "error" ? (
                  <div className="grid min-h-[280px] place-items-center px-6 text-center text-sm text-foreground/70">
                    <p>{errorMsg || "生成失败"}</p>
                  </div>
                ) : null}

                {status === "ready" && pngUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={pngUrl}
                    alt="Fan Art 分享图"
                    className="block h-auto w-full select-none"
                    draggable={false}
                  />
                ) : null}
              </div>

              <p className="text-center text-sm text-white/90 drop-shadow">
                右键或长按图片保存
              </p>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-foreground shadow-lg ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
              >
                关闭
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
};

export default FanArtShareModal;
