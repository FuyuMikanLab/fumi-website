"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE_SELECTOR = "button, a, [role='button'], .card-comp";

export function AcidCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = cursorRef.current?.closest<HTMLElement>(".card-view");
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    if (!root || !cursor || !finePointer.matches) return;

    let loadingImage: HTMLImageElement | null = null;

    const clearLoading = () => {
      loadingImage?.removeEventListener("load", clearLoading);
      loadingImage?.removeEventListener("error", clearLoading);
      cursor.classList.remove("is-loading");
      loadingImage = null;
    };

    const setLoadingImage = (image: HTMLImageElement | null) => {
      if (loadingImage === image) return;
      loadingImage?.removeEventListener("load", clearLoading);
      loadingImage?.removeEventListener("error", clearLoading);
      loadingImage = image;

      const loading = Boolean(image && !image.complete);
      cursor.classList.toggle("is-loading", loading);
      if (loading && image) {
        image.addEventListener("load", clearLoading, { once: true });
        image.addEventListener("error", clearLoading, { once: true });
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      cursor.style.setProperty("--cursor-x", `${event.clientX}px`);
      cursor.style.setProperty("--cursor-y", `${event.clientY}px`);
      cursor.classList.add("is-visible");

      const target = event.target instanceof Element ? event.target : null;
      const interactive = target?.closest(INTERACTIVE_SELECTOR);
      cursor.classList.toggle("is-interactive", Boolean(interactive));

      const card = target?.closest(".card-comp");
      const image =
        card?.querySelector<HTMLImageElement>(".card-comp__media-image") ?? null;
      setLoadingImage(image);

      const color = card
        ? getComputedStyle(card).getPropertyValue("--card-cat").trim()
        : "";
      cursor.style.setProperty(
        "--cursor-color",
        color || "var(--cv-acid)",
      );
    };

    const onPointerDown = () => cursor.classList.add("is-pressed");
    const onPointerUp = () => cursor.classList.remove("is-pressed");
    const onPointerLeave = () => {
      cursor.classList.remove("is-visible", "is-pressed", "is-interactive");
      setLoadingImage(null);
    };

    root.addEventListener("pointermove", onPointerMove);
    root.addEventListener("pointerdown", onPointerDown);
    root.addEventListener("pointerup", onPointerUp);
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerdown", onPointerDown);
      root.removeEventListener("pointerup", onPointerUp);
      root.removeEventListener("pointerleave", onPointerLeave);
      loadingImage?.removeEventListener("load", clearLoading);
      loadingImage?.removeEventListener("error", clearLoading);
    };
  }, []);

  return (
    <div ref={cursorRef} className="acid-cursor" aria-hidden>
      <span className="acid-cursor__star" />
      <span className="acid-cursor__orbit">
        <span className="acid-cursor__dot" />
        <span className="acid-cursor__dot" />
        <span className="acid-cursor__dot" />
      </span>
    </div>
  );
}
