"use client";

import { useEffect, useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { Button } from "@/src/components/ui";
import { renderWithBold } from "@/src/utils/renderWithBold";
import { CardComp } from "./CardComp";
import { CARD_DECK } from "./data";
import { DrawStack } from "./DrawStack";
import type { CardData } from "./types";
import {
  CARD_CATEGORIES,
  CardCategoryKey,
  CATEGORY_COLOR,
  CATEGORY_LABEL,
} from "./types";

type CardDetailOverlayProps = {
  card: CardData;
  onClose: () => void;
  onSelect: (next: CardData) => void;
};

export function CardDetailOverlay({
  card,
  onClose,
  onSelect,
}: CardDetailOverlayProps) {
  const reduceMotion = useReducedMotion();
  const tiltXTarget = useMotionValue(0);
  const tiltYTarget = useMotionValue(0);
  const tiltX = useSpring(tiltXTarget, { stiffness: 180, damping: 22 });
  const tiltY = useSpring(tiltYTarget, { stiffness: 180, damping: 22 });
  const sameCategory = useMemo(
    () => CARD_DECK.filter((c) => c.category === card.category),
    [card.category],
  );
  const memberBio =
    card.category === CardCategoryKey.member && card.description
      ? card.description
      : null;

  useEffect(() => {
    tiltXTarget.set(0);
    tiltYTarget.set(0);
  }, [card.id, tiltXTarget, tiltYTarget]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const idx = sameCategory.findIndex((c) => c.id === card.id);
        if (idx < 0) return;
        const delta = e.key === "ArrowDown" ? 1 : -1;
        const next =
          sameCategory[
            (idx + delta + sameCategory.length) % sameCategory.length
          ];
        onSelect(next);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [card.id, onClose, onSelect, sameCategory]);

  useEffect(() => {
    const { overflow, touchAction, paddingRight } = document.body.style;
    const scrollbarGap =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.touchAction = touchAction;
      document.body.style.paddingRight = paddingRight;
    };
  }, []);

  return (
    <motion.div
      className="card-draw"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        type="button"
        className="card-draw__backdrop"
        aria-label="关闭放大查看"
        onClick={onClose}
      />

      <div className="card-draw__layout">
        <aside className="card-draw__side">
          <div className="card-draw__side-head">
            <span
              className="card-draw__side-badge"
              style={{ background: CATEGORY_COLOR[card.category] }}
            />
            <div>
              <p className="card-draw__side-label">
                {CATEGORY_LABEL[card.category]}
              </p>
              <p className="card-draw__side-count">
                {/* {sameCategory.length} */}
                {CARD_CATEGORIES.find((c) => c.name === card.category)?.desc ?? ""}
              </p>
            </div>
          </div>
          <DrawStack
            cards={sameCategory}
            activeId={card.id}
            onPick={(id) => {
              const next = sameCategory.find((c) => c.id === id);
              if (next) onSelect(next);
            }}
          />
          {/* <p className="card-draw__hint">点击左侧卡片抽取 · ↑↓ 切换</p> */}
        </aside>

        <div className="card-draw__stage">
          <div className="card-draw__focus">
            <AnimatePresence mode="wait">
              <motion.div
                key={card.id}
                className="card-draw__hero-wrap"
                initial={{
                  opacity: 0,
                  scale: 0.96,
                  x: 28,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  x: -18,
                }}
                transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="card-draw__hero-tilt"
                  style={{ rotateX: tiltX, rotateY: tiltY }}
                  onPointerMove={(event) => {
                    if (reduceMotion || event.pointerType === "touch") return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const pointerX = (event.clientX - rect.left) / rect.width;
                    const pointerY = (event.clientY - rect.top) / rect.height;

                    tiltXTarget.set((0.5 - pointerY) * 11);
                    tiltYTarget.set((pointerX - 0.5) * 13);
                    event.currentTarget.style.setProperty(
                      "--pointer-x",
                      `${pointerX * 100}%`,
                    );
                    event.currentTarget.style.setProperty(
                      "--pointer-y",
                      `${pointerY * 100}%`,
                    );
                  }}
                  onPointerLeave={(event) => {
                    tiltXTarget.set(0);
                    tiltYTarget.set(0);
                    event.currentTarget.style.setProperty("--pointer-x", "50%");
                    event.currentTarget.style.setProperty("--pointer-y", "50%");
                  }}
                >
                  <CardComp
                    data={card}
                    size="hero"
                    selected
                    interactive={false}
                    className="card-draw__hero"
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {memberBio ? (
              <AnimatePresence mode="wait">
                <motion.aside
                  key={`${card.id}-bio`}
                  className="card-draw__bio"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.06,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <p className="card-draw__bio-kicker">
                    {renderWithBold(card.meta)}
                  </p>
                  <h2 className="card-draw__bio-title">{card.title}</h2>
                  <p className="card-draw__bio-desc">
                    {renderWithBold(memberBio)}
                  </p>
                </motion.aside>
              </AnimatePresence>
            ) : null}
          </div>

          <div className="card-draw__actions">
            <Button
              type="button"
              variant="underline"
              underlineColor="var(--cv-acid)"
              onClick={onClose}
            >
              ESC
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
