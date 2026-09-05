"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  ExternalLinkModal,
  useExternalLinkConfirm,
} from "@/src/components/ui";
import { AcidCursor } from "./AcidCursor";
import { CardDetailOverlay } from "./CardDetailOverlay";
import { CardField } from "./CardField";
import { CardViewHeader } from "./CardViewHeader";
import type { CardCategory, CardData } from "./types";
import { useCardFieldPan } from "./useCardFieldPan";
import "./cardView.css";

const CONTACT_URL = "https://github.com/FuyuMikanLab";

export function InfiniteCardField() {
  const [selected, setSelected] = useState<CardData | null>(null);
  const [filter, setFilter] = useState<CardCategory | "ALL">("ALL");
  const external = useExternalLinkConfirm();

  // 详情 / 站外确认弹层打开时停掉卡片场平移 RAF
  const fieldPaused = selected !== null || external.open;
  const pan = useCardFieldPan(fieldPaused);

  const openCard = (card: CardData) => {
    setSelected(card);
  };

  return (
    <div className="card-view">
      <AcidCursor />
      <CardViewHeader
        filter={filter}
        onFilterChange={setFilter}
        onContactClick={() => external.request(CONTACT_URL)}
      />

      <CardField
        fieldRef={pan.fieldRef}
        x={pan.x}
        y={pan.y}
        filter={filter}
        onPointerMove={pan.onPointerMove}
        onPointerDown={pan.onPointerDown}
        onPointerUp={pan.onPointerUp}
        onPointerLeave={pan.onPointerLeave}
        onCardPressStart={pan.beginCardPress}
        onCardPressEnd={pan.endCardPress}
        onOpenCard={openCard}
      />

      <AnimatePresence>
        {selected ? (
          <CardDetailOverlay
            card={selected}
            onClose={() => setSelected(null)}
            onSelect={setSelected}
          />
        ) : null}
      </AnimatePresence>

      <ExternalLinkModal
        open={external.open}
        href={external.href}
        onClose={external.close}
      />
    </div>
  );
}
