"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "framer-motion";
import artMap, { type IFanArtList } from "./artMap";
import FanArtShareModal from "./FanArtShareModal";

const CARD_SIZE = "size-[clamp(56px,9vw,88px)]";
const FAN_PIVOT = 100; // 轮盘圆心距卡片底部的距离(px)
const MAX_SPREAD_DEG = 30; // 轮盘单侧最大张开角度
const MAX_STEP_DEG = 20; // 相邻卡片的最大间隔角度
const FAN_RESERVED = 120; // 舞台底部为轮盘预留的高度(px)
const DRAG_DEG_PER_PX = 0.25; // 拖拽灵敏度(度/px)
const WHEEL_DEG_PER_PX = 0.08; // 滚轮灵敏度(度/px)

const formatDate = (d: string) => {
  const t = new Date(d);
  if (Number.isNaN(+t)) return d;
  const mm = String(t.getMonth() + 1).padStart(2, "0");
  const dd = String(t.getDate()).padStart(2, "0");
  return `${t.getFullYear()}.${mm}.${dd}`;
};

/** accent 色圆环 spinner；size 为外径 px */
const LoadingSpinner = ({ size = 28 }: { size?: number }) => (
  <motion.span
    aria-hidden
    className="block rounded-full"
    style={{
      width: size,
      height: size,
      border: `${Math.max(2, Math.round(size / 12))}px solid color-mix(in srgb, var(--accent) 28%, transparent)`,
      borderTopColor: "var(--accent)",
    }}
    animate={{ rotate: 360 }}
    transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
  />
);

/** 已成功加载过的远程图，避免缩略图重挂载时再闪 loading */
const loadedSrcCache = new Set<string>();

/** 单张图：骨架 + accent spinner，加载完后淡入 */
const LoadableImage = ({
  src,
  alt,
  sizes,
  className,
  priority,
  spinnerSize = 28,
  skeleton,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  spinnerSize?: number;
  /** 是否显示脉冲骨架底（大图用） */
  skeleton?: boolean;
}) => {
  const [loaded, setLoaded] = useState(() => loadedSrcCache.has(src));

  useEffect(() => {
    setLoaded(loadedSrcCache.has(src));
  }, [src]);

  return (
    <>
      <AnimatePresence>
        {!loaded && (
          <motion.div
            key="loading"
            className="absolute inset-0 z-0 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {skeleton ? (
              <motion.div
                aria-hidden
                className="absolute inset-0 m-auto rounded-2xl bg-foreground/10"
                style={{ width: "min(42%, 28rem)", height: "55%" }}
                animate={{ opacity: [0.35, 0.7, 0.35] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : (
              <motion.div
                aria-hidden
                className="absolute inset-0 bg-foreground/10"
                animate={{ opacity: [0.45, 0.75, 0.45] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
            <span className="relative z-10">
              <LoadingSpinner size={spinnerSize} />
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          className={className}
          priority={priority}
          // Fan Art 原图常 2MB+，Vercel /_next/image 拉取压缩易 502，改为浏览器直连 CDN
          unoptimized
          onLoad={() => {
            loadedSrcCache.add(src);
            setLoaded(true);
          }}
        />
      </motion.div>
    </>
  );
};

/** 主舞台大图 */
const MainStageImage = ({ src, alt }: { src: string; alt: string }) => (
  <LoadableImage
    src={src}
    alt={alt}
    sizes="(max-width: 1024px) 100vw, 1024px"
    className="object-contain drop-shadow-2xl"
    priority
    skeleton
    spinnerSize={36}
  />
);

// 卡片缩略图：系列内每张图都以小格拼贴显示（最多 4 格）
const CardThumb = ({ files, alt }: { files: string[]; alt: string }) => {
  const thumbs = files.slice(0, 4);
  if (thumbs.length === 0) {
    return <div className="absolute inset-0 bg-foreground/10" />;
  }
  if (thumbs.length === 1) {
    return (
      <LoadableImage
        src={thumbs[0]}
        alt={alt}
        sizes="96px"
        className="object-cover"
        spinnerSize={18}
      />
    );
  }
  const gridClass =
    thumbs.length === 2 ? "grid-cols-2 grid-rows-1" : "grid-cols-2 grid-rows-2";
  return (
    <div className={`absolute inset-0 grid gap-px bg-white ${gridClass}`}>
      {thumbs.map((f, idx) => (
        <div
          key={`${f}-${idx}`}
          className={`relative overflow-hidden ${
            thumbs.length === 3 && idx === 0 ? "row-span-2" : ""
          }`}
        >
          <LoadableImage
            src={f}
            alt={`${alt} ${idx + 1}`}
            sizes="48px"
            className="object-cover"
            spinnerSize={14}
          />
        </div>
      ))}
    </div>
  );
};

// 轮盘上的单张卡片：角度、层级、缩放跟随轮盘；选中时 accent 边框高亮
// 始终用 button，避免 isActive 切换导致 DOM 类型变化、缩略图重挂载闪白
const FanCard = ({
  entry,
  baseAngle,
  rotation,
  isActive,
  onSelect,
}: {
  entry: IFanArtList;
  baseAngle: number;
  rotation: MotionValue<number>;
  isActive: boolean;
  onSelect: () => void;
}) => {
  const rotate = useTransform(rotation, (r) => baseAngle + r);
  // 越靠近轮盘中心，层级越高、略微放大
  const zIndex = useTransform(
    rotation,
    (r) => 100 - Math.round(Math.abs(baseAngle + r) * 2),
  );
  const scale = useTransform(rotation, (r) => {
    const t = Math.min(Math.abs(baseAngle + r) / 30, 1);
    return 1.15 - t * 0.25;
  });

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={isActive ? undefined : { y: -14 }}
      transition={{ type: "spring", stiffness: 240, damping: 30 }}
      style={{
        x: "-50%",
        rotate,
        zIndex,
        scale,
        transformOrigin: `50% calc(100% + ${FAN_PIVOT}px)`,
        boxShadow: isActive
          ? "0 0 0 3px var(--accent), 0 0 0 6px color-mix(in srgb, var(--accent) 28%, transparent), 0 10px 24px rgb(0 0 0 / 0.22)"
          : "0 0 0 1px rgb(0 0 0 / 0.1), 0 4px 10px rgb(0 0 0 / 0.1)",
      }}
      className={`relative block ${CARD_SIZE} overflow-hidden rounded-xl bg-white [&_img]:pointer-events-none`}
      aria-current={isActive ? "true" : undefined}
      aria-label={`查看 ${entry.artistName} 的作品`}
    >
      <CardThumb files={entry.fileLists} alt={entry.artistName} />
      {/* 选中态：内缘 accent 高光，强化“胶囊选中”感 */}
      {isActive ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            boxShadow:
              "inset 0 0 0 2px color-mix(in srgb, var(--accent) 70%, white)",
          }}
        />
      ) : null}
    </motion.button>
  );
};

const FanArtComp = ({ vcode }: { vcode: string }) => {
  // 时间最近的排在最前面
  const entries = useMemo<IFanArtList[]>(() => {
    const list = artMap[vcode]?.imgSeriesList ?? [];
    return [...list].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [vcode]);

  const [selected, setSelected] = useState(0);
  const [fileIndex, setFileIndex] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);

  const current = entries[selected];
  const files = current?.fileLists ?? [];
  const currentFile = files[Math.min(fileIndex, files.length - 1)];

  const n = entries.length;
  const step =
    n > 1 ? Math.min(MAX_STEP_DEG, (MAX_SPREAD_DEG * 2) / (n - 1)) : 0;
  const limit = ((n - 1) / 2) * step; // 轮盘可旋转的边界
  const centerRotation = (i: number) => -((i - (n - 1) / 2) * step);

  // 轮盘偏转角：初始位置让最新的一张居中
  const rotation = useMotionValue(centerRotation(0));
  const dragGuard = useRef(false);
  const panDistance = useRef(0);
  const guardTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileWheelLocked = useRef(false);
  const fileWheelIdle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filesLenRef = useRef(files.length);
  const selectedRef = useRef(selected);
  const syncFromRotation = useRef(false); // 拖/滚驱动的选中，勿再 snap 回去打架

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    filesLenRef.current = files.length;
  }, [files.length]);

  const clampRotation = (v: number, slack = 0) =>
    Math.min(limit + slack, Math.max(-limit - slack, v));

  const indexFromRotation = (r: number) => {
    if (step <= 0 || n < 2) return 0;
    return Math.min(n - 1, Math.max(0, Math.round((n - 1) / 2 - r / step)));
  };

  /** 拖拽/滚轮：谁到中心就即时选中 */
  const selectCentered = (r: number) => {
    const i = indexFromRotation(r);
    if (i === selectedRef.current) return;
    syncFromRotation.current = true;
    selectedRef.current = i;
    setSelected(i);
    setFileIndex(0);
  };

  const snapTo = (target: number) => {
    animate(rotation, clampRotation(target), {
      type: "spring",
      stiffness: 260,
      damping: 30,
    });
  };
  const snapNearest = () => {
    const target = step > 0 ? Math.round(rotation.get() / step) * step : 0;
    selectCentered(target);
    snapTo(target);
  };

  const selectSeries = (i: number) => {
    if (dragGuard.current) return; // 拖拽结束的瞬间不触发点击
    setSelected(i);
    setFileIndex(0);
  };

  // 选中项变化时，转动轮盘让它居中（拖/滚引起的选中除外）
  useEffect(() => {
    if (n < 2) return;
    if (syncFromRotation.current) {
      syncFromRotation.current = false;
      return;
    }
    snapTo(centerRotation(selected));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, n, step]);

  useEffect(
    () => () => {
      if (guardTimer.current) clearTimeout(guardTimer.current);
      if (wheelTimer.current) clearTimeout(wheelTimer.current);
      if (fileWheelIdle.current) clearTimeout(fileWheelIdle.current);
    },
    [],
  );

  // 大图滚轮：一次手势切一张；非 passive 拦住浏览器默认滚动，避免阈值未到时整页橡胶抖动
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (filesLenRef.current < 2) return;
      e.preventDefault();
      e.stopPropagation();

      const delta =
        Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 6) return; // 忽略触控板微抖

      if (fileWheelLocked.current) return;
      fileWheelLocked.current = true;

      const dir = delta > 0 ? 1 : -1;
      const len = filesLenRef.current;
      setFileIndex((v) => (v + dir + len) % len);

      if (fileWheelIdle.current) clearTimeout(fileWheelIdle.current);
      fileWheelIdle.current = setTimeout(() => {
        fileWheelLocked.current = false;
      }, 280);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ← / → 切换系列
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (entries.length < 2) return;
      if (e.key === "ArrowRight") {
        setSelected((s) => (s + 1) % entries.length);
        setFileIndex(0);
      }
      if (e.key === "ArrowLeft") {
        setSelected((s) => (s - 1 + entries.length) % entries.length);
        setFileIndex(0);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entries.length]);

  if (!current) {
    return (
      <div className="grid h-full place-items-center text-foreground/50">
        <p>Fan Art 筹备中，敬请期待。</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* 模糊填充背景：用当前图片 cover 铺满，补足 contain 留白的区域 */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentFile}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Image
            src={currentFile}
            alt=""
            fill
            sizes="100vw"
            className="scale-110 object-cover blur-2xl brightness-[0.92]"
            priority
            unoptimized
          />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 z-1 bg-background/30" />

      {/* 主舞台：contain 展示当前图片；滚轮在此区域切图 */}
      <div
        ref={stageRef}
        className="absolute inset-0 z-10 px-4 pt-2"
        style={{ paddingBottom: FAN_RESERVED }}
      >
        <div className="relative mx-auto h-full max-w-5xl">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={currentFile}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <MainStageImage src={currentFile} alt={current.artistName} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 当前作品信息 */}
      <motion.aside
        key={`info-${selected}`}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="absolute left-4 top-3 z-20 max-w-[min(320px,70vw)] rounded-2xl bg-white/55 px-5 py-4 shadow-lg ring-1 ring-black/5 backdrop-blur-md"
      >
        <p className="text-xs tracking-wide text-foreground/55">
          {formatDate(current.date)}
        </p>
        <h2 className="mt-0.5 text-lg font-bold leading-snug">
          {current.fanName}
        </h2>
        {current.fanDesc ? (
          <p className="mt-1 text-sm text-foreground/70">{current.fanDesc}</p>
        ) : null}
        <div className="mt-2 border-t border-foreground/10 pt-2 text-sm text-foreground/75">
          <p>
            <span className="text-foreground/50">画师 </span>
            {current.artistName}
          </p>
          {current.fanDesc ? (
            <p className="text-foreground/60">{current.fanDesc}</p>
          ) : null}
          {current.fanRemark ? (
            <p className="mt-1 italic text-foreground/70">
              &ldquo;{current.fanRemark}&rdquo;
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="mt-3 w-full rounded-xl bg-(--accent) px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:brightness-105 active:scale-[0.98]"
        >
          生成分享图片
        </button>
      </motion.aside>

      <FanArtShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        share={
          shareOpen && currentFile
            ? {
                entry: current,
                currentFile,
                pageUrl: `${window.location.origin}/${vcode}`,
                vcode: vcode,
              }
            : null
        }
      />

      {/* 系列内多图切换：左侧竖向居中，外轮廓参考 section-nav__list */}
      {files.length > 1 && (
        <div
          key={selected}
          className="absolute left-4 z-20"
          style={{ top: "50%", transform: "translateY(-50%)" }}
        >
          <div
            className="relative flex flex-col items-center"
            style={{
              gap: 6,
              width: 37,
              padding: "0.7rem",
              borderRadius: 9999,
              background: "var(--nav-surface)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {files.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setFileIndex(i)}
                aria-label={`第 ${i + 1} 张`}
                className="relative z-10 flex items-center justify-center"
                style={{ width: 16, height: 16 }}
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-colors ${
                    i === fileIndex
                      ? "bg-transparent"
                      : "bg-foreground/25 hover:bg-foreground/50"
                  }`}
                />
              </button>
            ))}
            {/* 滑动指示块：高度与按钮槽位一致，不超出胶囊 padding */}
            <motion.span
              initial={false}
              animate={{ y: fileIndex * 22 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="pointer-events-none absolute z-0 block rounded-full"
              style={{
                top: "0.35rem",
                left: "0.35rem",
                right: "0.35rem",
                height: 16,
                backgroundColor: "var(--accent)",
              }}
            />
          </div>
        </div>
      )}

      {/* 底部轮盘：hover 上浮放大暗示可滚动；拖拽/滚轮切换 series */}
      <motion.div
        className="absolute inset-x-0 bottom-5 z-30 h-28 cursor-grab touch-none select-none active:cursor-grabbing"
        style={{ transformOrigin: "50% 100%" }}
        whileHover={{ y: -32, scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        onPanStart={() => {
          rotation.stop();
          panDistance.current = 0;
        }}
        onPan={(_e, info) => {
          if (n < 2) return;
          panDistance.current += Math.abs(info.delta.x);
          if (panDistance.current > 8) dragGuard.current = true;
          const next = clampRotation(
            rotation.get() + info.delta.x * DRAG_DEG_PER_PX,
            step,
          );
          rotation.set(next);
          selectCentered(next);
        }}
        onPanEnd={() => {
          if (n < 2) return;
          snapNearest();
          if (guardTimer.current) clearTimeout(guardTimer.current);
          guardTimer.current = setTimeout(() => {
            dragGuard.current = false;
          }, 80);
        }}
        onWheel={(e) => {
          if (n < 2) return;
          e.stopPropagation(); // 轮盘区域的滚动只转动轮盘，不触发图片切换
          rotation.stop();
          const d =
            Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          const next = clampRotation(rotation.get() + d * WHEEL_DEG_PER_PX);
          rotation.set(next);
          selectCentered(next);
          if (wheelTimer.current) clearTimeout(wheelTimer.current);
          wheelTimer.current = setTimeout(snapNearest, 140);
        }}
      >
        {entries.map((entry, i) => (
          <div
            key={`${entry.date}-${entry.artistName}-${i}`}
            className="absolute bottom-0 left-1/2"
          >
            <FanCard
              entry={entry}
              baseAngle={(i - (n - 1) / 2) * step}
              rotation={rotation}
              isActive={i === selected}
              onSelect={() => selectSeries(i)}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export default FanArtComp;
