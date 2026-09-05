"use client";

import type { CSSProperties, RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { motion } from "framer-motion";
import { CardComp } from "./CardComp";
import { CARD_DECK } from "./data";
import { FIELD_H, FIELD_W, getCardCellStyle } from "./layout";
import type { CardCategory, CardData } from "./types";

type CardFieldProps = {
  fieldRef: RefObject<HTMLDivElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  filter: CardCategory | "ALL";
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => void;
  onCardPressStart: (
    card: CardData,
    e: React.PointerEvent<HTMLElement>,
  ) => void;
  onCardPressEnd: (
    card: CardData,
    e: React.PointerEvent<HTMLElement>,
  ) => boolean;
  onOpenCard: (card: CardData) => void;
};

export function CardField({
  fieldRef,
  x,
  y,
  filter,
  onPointerMove,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onCardPressStart,
  onCardPressEnd,
  onOpenCard,
}: CardFieldProps) {
  return (
    <div
      ref={fieldRef}
      className="card-view__field"
      style={
        {
          "--tile-w": `${FIELD_W}px`,
          "--tile-h": `${FIELD_H}px`,
        } as CSSProperties
      }
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <div className="card-view__stage">
        <motion.div className="card-view__plane" style={{ x, y }}>
          <div
            className="card-view__tile"
            style={{ width: FIELD_W, height: FIELD_H }}
          >
            {CARD_DECK.map((card, index) => {
              const outOfFilter =
                filter !== "ALL" && card.category !== filter;
              return (
                <div
                  key={card.id}
                  className="card-view__cell"
                  style={getCardCellStyle(index)}
                  onPointerDown={(e) => {
                    if (outOfFilter) return;
                    e.stopPropagation();
                    onCardPressStart(card, e);
                  }}
                  onPointerUp={(e) => {
                    if (outOfFilter) return;
                    if (!onCardPressEnd(card, e)) return;
                    onOpenCard(card);
                  }}
                >
                  <CardComp
                    data={card}
                    size="lg"
                    style={{ width: "100%", height: "100%" }}
                    dimmed={outOfFilter}
                    interactive={!outOfFilter}
                    onClick={() => {
                      if (outOfFilter) return;
                      onOpenCard(card);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
