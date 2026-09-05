"use client";

import { motion } from "framer-motion";
import { Button } from "@/src/components/ui";
import type { CardData } from "./types";
import { CATEGORY_COLOR } from "./types";
import { renderWithBold } from "@/src/utils/renderWithBold";

const MotionButton = motion.create(Button);

type DrawStackProps = {
  cards: CardData[];
  activeId: string;
  onPick: (id: string) => void;
};

export function DrawStack({ cards, activeId, onPick }: DrawStackProps) {
  return (
    <div className="card-draw__stack" aria-label="同类卡片抽取列表">
      {cards.map((card, index) => {
        const active = card.id === activeId;
        return (
          <MotionButton
            key={card.id}
            type="button"
            variant="underline"
            selected={active}
            underlineColor={CATEGORY_COLOR[card.category]}
            className={`card-draw__chip${active ? " is-active" : ""}`}
            onClick={() => onPick(card.id)}
            style={{ zIndex: active ? 40 : 10 + index }}
            initial={{ opacity: 0, x: -12 }}
            animate={{
              opacity: 1,
              x: active ? 10 : 0,
            }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
            whileHover={{ x: 8 }}
            aria-current={active ? "true" : undefined}
          >
            <span
              className="card-draw__chip-dot"
              style={{ background: CATEGORY_COLOR[card.category] }}
              aria-hidden
            />
            <span className="card-draw__chip-body">
              <span className="card-draw__chip-title">{card.title}</span>
              <span className="card-draw__chip-meta" title={card.meta}>
                {renderWithBold(card.meta)}
              </span>
            </span>
            {/* <span className="card-draw__chip-mode">
              {card.mode === "text" ? "文" : "图"}
            </span> */}
          </MotionButton>
        );
      })}
    </div>
  );
}
