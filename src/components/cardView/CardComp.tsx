"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";
import { CATEGORY_COLOR, CATEGORY_LABEL, type CardCompProps } from "./types";
import "./CardComp.css";
import { renderWithBold } from "@/src/utils/renderWithBold";

const SIZE_CLASS = {
  sm: "card-comp--sm",
  md: "card-comp--md",
  lg: "card-comp--lg",
  hero: "card-comp--hero",
} as const;

export function CardComp({
  data,
  style,
  className = "",
  size = "md",
  selected = false,
  interactive = true,
  dimmed = false,
  onClick,
  children,
}: CardCompProps) {
  const catColor = CATEGORY_COLOR[data.category];
  const mergedStyle: CSSProperties = {
    ["--card-cat" as string]: catColor,
    ...style,
  };

  const classes = [
    "card-comp",
    SIZE_CLASS[size],
    data.mode === "text" ? "card-comp--text" : "card-comp--image",
    interactive ? "card-comp--interactive" : "",
    selected ? "card-comp--selected" : "",
    dimmed ? "card-comp--dimmed" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <motion.article
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={classes}
      style={mergedStyle}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      whileHover={interactive && !selected ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.985 } : undefined}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      aria-label={`${CATEGORY_LABEL[data.category]} · ${data.title}`}
      aria-pressed={selected || undefined}
    >
      <span className="card-comp__frame" aria-hidden />
      {selected ? (
        <>
          <span className="card-comp__shine" aria-hidden />
          <span className="card-comp__ring" aria-hidden />
        </>
      ) : null}

      <div className="card-comp__media" aria-hidden={data.mode === "text"}>
        {data.mode === "image" && data.imageUrl ? (
          <>
            {/* 单卡展示时以模糊铺底承接 contain 图片，避免留白生硬。 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="card-comp__media-backdrop"
              src={data.imageUrl}
              alt=""
              loading="lazy"
              draggable={false}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="card-comp__media-image"
              src={data.imageUrl}
              alt=""
              loading="lazy"
              draggable={false}
            />
          </>
        ) : (
          <div className="card-comp__media-fallback" />
        )}
      </div>

      <div className="card-comp__category">
        <span className="card-comp__category-dot" aria-hidden />
        {CATEGORY_LABEL[data.category]}
      </div>

      {data.tag ? <span className="card-comp__tag">{data.tag}</span> : null}

      <div className="card-comp__center">
        <p className="card-comp__description card-comp__body">
          {data.category === "news"
            ? renderWithBold(data.description ?? "")
            : null}
        </p>
      </div>
      <div className="card-comp__center">
        <h3 className="card-comp__title">{data.title}</h3>
        {data.mode === "text" && data.body ? (
          <p className="card-comp__body">{data.body}</p>
        ) : null}
      </div>

      <div className="card-comp__meta" title={data.meta}>
        {renderWithBold(data.meta)}
      </div>
    </motion.article>
  );
}
