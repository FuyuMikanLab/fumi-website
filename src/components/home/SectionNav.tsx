"use client";

import { useEffect, useRef, useState } from "react";

export type NavSection = {
  id: string;
  label: string;
};

type SectionNavProps = {
  sections: NavSection[];
};

function getNearestSectionIndex(sections: NavSection[]) {
  const mid = window.innerHeight * 0.5;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  sections.forEach((section, index) => {
    const el = document.getElementById(section.id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - mid);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function SectionNav({ sections }: SectionNavProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [indicator, setIndicator] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [horizontal, setHorizontal] = useState(false);

  const scrollLockRef = useRef(false);
  const lockTargetRef = useRef<number | null>(null);
  const lockIdRef = useRef(0);
  const unlockTimerRef = useRef<number | null>(null);

  const clearUnlockTimer = () => {
    if (unlockTimerRef.current !== null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
  };

  const unlockScroll = () => {
    scrollLockRef.current = false;
    lockTargetRef.current = null;
    lockIdRef.current += 1;
    clearUnlockTimer();
  };

  const lockScroll = (targetIndex: number) => {
    const lockId = lockIdRef.current + 1;
    lockIdRef.current = lockId;
    scrollLockRef.current = true;
    lockTargetRef.current = targetIndex;
    clearUnlockTimer();

    const finish = () => {
      if (lockIdRef.current !== lockId) return;
      if (lockTargetRef.current !== null) {
        setActiveIndex(lockTargetRef.current);
      }
      unlockScroll();
    };

    window.addEventListener("scrollend", finish, { once: true });
    unlockTimerRef.current = window.setTimeout(finish, 1000);
  };

  const updateIndicator = (index: number) => {
    const button = buttonRefs.current[index];
    const list = listRef.current;
    if (!button || !list) return;

    const listRect = list.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    setIndicator({
      x: buttonRect.left - listRect.left,
      y: buttonRect.top - listRect.top,
      w: buttonRect.width,
      h: buttonRect.height,
    });
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => {
      setHorizontal(mq.matches);
      updateIndicator(activeIndex);
    };
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, [activeIndex]);

  useEffect(() => {
    updateIndicator(activeIndex);
  }, [activeIndex, horizontal]);

  useEffect(() => {
    let settleTimer: number | null = null;

    const syncActiveFromScroll = () => {
      if (scrollLockRef.current) return;
      setActiveIndex(getNearestSectionIndex(sections));
    };

    const onScroll = () => {
      if (scrollLockRef.current) return;
      // 滚动过程中不更新；停稳后再算，避免 4→1→2→1 抖动
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(syncActiveFromScroll, 60);
    };

    const onScrollEnd = () => {
      if (scrollLockRef.current) return;
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      syncActiveFromScroll();
    };

    // 用户滚轮/触控打断程序化滚动时释放锁，交回自然滚动探测
    const onUserInterrupt = () => {
      if (!scrollLockRef.current) return;
      unlockScroll();
      syncActiveFromScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("wheel", onUserInterrupt, { passive: true });
    window.addEventListener("touchstart", onUserInterrupt, { passive: true });

    syncActiveFromScroll();

    return () => {
      if (settleTimer !== null) window.clearTimeout(settleTimer);
      clearUnlockTimer();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("wheel", onUserInterrupt);
      window.removeEventListener("touchstart", onUserInterrupt);
    };
  }, [sections]);

  const scrollToSection = (index: number) => {
    const section = document.getElementById(sections[index]?.id);
    if (!section) return;

    setActiveIndex(index);
    lockScroll(index);
    section.scrollIntoView({ behavior: "smooth" });
  };

  const indicatorStyle = horizontal
    ? {
        width: indicator.w || undefined,
        height: indicator.h || undefined,
        transform: `translateX(${indicator.x}px)`,
      }
    : {
        width: undefined,
        height: indicator.h || undefined,
        transform: `translateY(${indicator.y}px)`,
      };

  return (
    <nav className="section-nav" aria-label="页面分区导航">
      <div
        ref={listRef}
        className={`section-nav__list${horizontal ? " is-horizontal" : ""}`}
      >
        <div
          className="section-nav__indicator"
          style={indicatorStyle}
          aria-hidden
        />

        {sections.map((section, index) => (
          <button
            key={section.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            className={`section-button${activeIndex === index ? " is-active" : ""}`}
            onClick={() => scrollToSection(index)}
            aria-current={activeIndex === index ? "true" : undefined}
          >
            <span className="section-button__dot" />
            <span className="section-button__label">{section.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
