"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useReducedMotion } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import {
  clamp,
  FIELD_H,
  getHomePanX,
  getLeftTextGutter,
  getPanBoundsX,
  PAN_MAX_SPEED_X,
  PAN_MAX_SPEED_Y,
  PAN_SMOOTH_TIME_X,
  PAN_SMOOTH_TIME_Y,
} from "./layout";
import type { CardData } from "./types";

const INITIAL_VIEW_W = 1280;
const AXIS_DEADZONE = 0.12;

function smootherstep(t: number) {
  const x = clamp(t, 0, 1);
  return x * x * x * (x * (x * 6 - 15) + 10);
}

/** 左右行程：两端收着、中间更顺，仍保留一点线性跟手 */
function easePanX(t: number) {
  const s = smootherstep(t);
  const x = clamp(t, 0, 1);
  return s * 0.62 + x * 0.38;
}

/** 上下像摇杆：中间有死区，越靠边越灵敏 */
function analogAxis(n: number, deadzone = AXIS_DEADZONE) {
  const sign = Math.sign(n);
  const mag = Math.abs(n);
  if (mag <= deadzone) return 0;
  return sign * smootherstep((mag - deadzone) / (1 - deadzone));
}

/** Unity SmoothDamp：加速再减速，无过冲 */
function smoothDamp(
  current: number,
  target: number,
  velocity: { v: number },
  smoothTime: number,
  maxSpeed: number,
  dt: number,
) {
  const omega = 2 / Math.max(0.0001, smoothTime);
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  let change = current - target;
  const maxChange = maxSpeed * Math.max(0.0001, smoothTime);
  change = clamp(change, -maxChange, maxChange);
  const temp = (velocity.v + omega * change) * dt;
  velocity.v = (velocity.v - omega * temp) * exp;
  let output = target + (change + temp) * exp;
  if (target - current > 0 === output > target) {
    output = target;
    velocity.v = 0;
  }
  return output;
}

/** 弹层 / 失焦时暂停平移 RAF，避免后台空转。 */
export function useCardFieldPan(paused: boolean) {
  const reduceMotion = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(getHomePanX(INITIAL_VIEW_W));
  const y = useMotionValue(0);

  const viewRef = useRef({ w: INITIAL_VIEW_W, h: 800, left: 0, top: 0 });
  const pointer = useRef({ x: 0, y: 0, active: false });
  const targetXRef = useRef(getHomePanX(INITIAL_VIEW_W));
  const targetYRef = useRef(0);
  const velX = useRef({ v: 0 });
  const velY = useRef({ v: 0 });
  const holding = useRef(false);
  const pausedRef = useRef(paused);
  const reduceMotionRef = useRef(Boolean(reduceMotion));
  const pressCard = useRef<CardData | null>(null);
  const didInitPan = useRef(false);

  const getMaxPanY = () => {
    const h = viewRef.current.h;
    // 再多滚一点，让底部边缘卡片离开视口裁切区
    return Math.max(0, (FIELD_H - h) / 2 + h * 0.14);
  };

  const haltPan = () => {
    holding.current = true;
    targetXRef.current = x.get();
    targetYRef.current = y.get();
    velX.current.v = 0;
    velY.current.v = 0;
  };

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) return;
    const apply = () => {
      const rect = el.getBoundingClientRect();
      viewRef.current = {
        w: rect.width,
        h: rect.height,
        left: rect.left,
        top: rect.top,
      };
      const { minX, maxX, homeX } = getPanBoundsX(rect.width);
      const maxY = getMaxPanY();
      if (!didInitPan.current) {
        didInitPan.current = true;
        const initialX = clamp(homeX, minX, maxX);
        targetXRef.current = initialX;
        x.set(initialX);
        velX.current.v = 0;
        velY.current.v = 0;
      } else {
        const nextX = clamp(x.get(), minX, maxX);
        const nextY = clamp(y.get(), -maxY, maxY);
        if (nextX !== x.get()) velX.current.v = 0;
        if (nextY !== y.get()) velY.current.v = 0;
        targetXRef.current = clamp(targetXRef.current, minX, maxX);
        targetYRef.current = clamp(targetYRef.current, -maxY, maxY);
        x.set(nextX);
        y.set(nextY);
        return;
      }
      targetYRef.current = clamp(targetYRef.current, -maxY, maxY);
      y.set(clamp(y.get(), -maxY, maxY));
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [x, y]);

  // 弹层打开时立刻钉住当前偏移；关闭后允许继续跟指针
  useEffect(() => {
    pausedRef.current = paused;
    reduceMotionRef.current = Boolean(reduceMotion);
    if (paused) {
      holding.current = true;
      targetXRef.current = x.get();
      targetYRef.current = y.get();
      velX.current.v = 0;
      velY.current.v = 0;
      return;
    }
    holding.current = false;
  }, [paused, reduceMotion, x, y]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let running = false;

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      running = false;
    };

    const shouldRun = () =>
      !pausedRef.current && document.visibilityState === "visible";

    const tick = (now: number) => {
      if (!shouldRun()) {
        stop();
        return;
      }

      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!holding.current && pointer.current.active) {
        const { w, h } = viewRef.current;
        const { minX, maxX, homeX } = getPanBoundsX(w);
        const maxY = getMaxPanY();
        const gutter = getLeftTextGutter(w);
        const usable = Math.max(1, w - gutter);
        const tx = easePanX((pointer.current.x - gutter) / usable);
        const ny = analogAxis(
          h > 0 ? (pointer.current.y / h - 0.5) * 2 : 0,
        );
        targetXRef.current = clamp(homeX + tx * (minX - homeX), minX, maxX);
        targetYRef.current = clamp(-ny * maxY, -maxY, maxY);
      }

      if (!holding.current) {
        if (reduceMotionRef.current) {
          velX.current.v = 0;
          velY.current.v = 0;
          x.set(targetXRef.current);
          y.set(targetYRef.current);
        } else {
          x.set(
            smoothDamp(
              x.get(),
              targetXRef.current,
              velX.current,
              PAN_SMOOTH_TIME_X,
              PAN_MAX_SPEED_X,
              dt,
            ),
          );
          y.set(
            smoothDamp(
              y.get(),
              targetYRef.current,
              velY.current,
              PAN_SMOOTH_TIME_Y,
              PAN_MAX_SPEED_Y,
              dt,
            ),
          );
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running || !shouldRun()) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        holding.current = true;
        targetXRef.current = x.get();
        targetYRef.current = y.get();
        velX.current.v = 0;
        velY.current.v = 0;
        stop();
        return;
      }
      holding.current = false;
      start();
    };

    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [paused, x, y]);

  const onPointerMove = (e: ReactPointerEvent) => {
    if (pausedRef.current) return;
    pointer.current = {
      x: e.clientX - viewRef.current.left,
      y: e.clientY - viewRef.current.top,
      active: true,
    };
  };

  const onPointerDown = () => {
    if (pausedRef.current) return;
    haltPan();
    pressCard.current = null;
  };

  const onPointerUp = () => {
    if (pausedRef.current) return;
    holding.current = false;
    pressCard.current = null;
  };

  const onPointerLeave = (e: ReactPointerEvent) => {
    const next = e.relatedTarget;
    if (next instanceof Node && e.currentTarget.contains(next)) return;
    pointer.current.active = false;
    if (!pausedRef.current) {
      holding.current = false;
      const { homeX, minX, maxX } = getPanBoundsX(viewRef.current.w);
      targetXRef.current = clamp(homeX, minX, maxX);
    }
    pressCard.current = null;
  };

  const beginCardPress = (
    card: CardData,
    e?: ReactPointerEvent<HTMLElement>,
  ) => {
    if (pausedRef.current) return;
    haltPan();
    pressCard.current = card;
    e?.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const endCardPress = (
    card: CardData,
    e?: ReactPointerEvent<HTMLElement>,
  ) => {
    if (e?.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const start = pressCard.current;
    if (!pausedRef.current) holding.current = false;
    pressCard.current = null;
    return start?.id === card.id;
  };

  return {
    fieldRef,
    x,
    y,
    beginCardPress,
    endCardPress,
    onPointerMove,
    onPointerDown,
    onPointerUp,
    onPointerLeave,
  };
}
