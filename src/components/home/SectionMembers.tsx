"use client";

import { DATA_MEMBERS } from "@/src/data";
import type { ISeriesList } from "@/src/data/sectionMember";
import { renderWithBold } from "@/src/utils/renderWithBold";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const TACHIE_EASE = [0.22, 1, 0.36, 1] as const;

const tachieVariants = {
  enter: (dir: number) => ({
    opacity: 0,
    x: dir * 48,
    scale: 0.94,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -36,
    scale: 1.04,
    filter: "blur(8px)",
  }),
};

export function SectionMembers() {
  const seriesList: ISeriesList[] = DATA_MEMBERS.seriesList ?? [];
  const allMembers = seriesList.flatMap((series) => series.members);
  const [activeCharacterCode, setActiveCharacterCode] = useState(
    allMembers[0]?.code,
  );
  const [direction, setDirection] = useState(0);

  const activeMember =
    allMembers.find((m) => m.code === activeCharacterCode) ?? allMembers[0];

  const switchCharacter = (code: string) => {
    if (code === activeCharacterCode) return;
    const prev = allMembers.findIndex((m) => m.code === activeCharacterCode);
    const next = allMembers.findIndex((m) => m.code === code);
    setDirection(next >= prev ? 1 : -1);
    setActiveCharacterCode(code);
  };

  return (
    <div className="members">
      <div className="section__inner members__intro">
        <p className="section__eyebrow">Members</p>
        <h2 className="section__title">受瞩目的成员</h2>
        <p className="section__desc">FuyumikanLab旗下所有厂牌的成员一览。</p>
      </div>

      <div className="members__stage">
        <aside className="members__picker">
          {seriesList.map((series) => (
            <div className="members__series" key={series.name}>
              <h3 className="members__series-title">{series.name}</h3>
              <div className="members__list">
                {series.members.map((member) => {
                  const isActive = activeCharacterCode === member.code;
                  return (
                    <button
                      type="button"
                      className={`members__item${isActive ? " is-active" : ""}`}
                      key={member.code}
                      aria-pressed={isActive}
                      onClick={() => switchCharacter(member.code)}
                    >
                      <motion.span
                        className="members__avatar"
                        animate={{
                          scale: isActive ? 1.08 : 1,
                          borderColor: isActive
                            ? "color-mix(in srgb, var(--accent) 95%, transparent)"
                            : "rgba(255, 255, 255, 0.28)",
                          boxShadow: isActive
                            ? "0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent), 0 12px 28px rgba(0, 0, 0, 0.28)"
                            : "0 0 0 0 color-mix(in srgb, var(--accent) 0%, transparent)",
                        }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        whileHover={{ scale: isActive ? 1.08 : 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Image
                          src={DATA_MEMBERS.getAvatarPath(member.code)}
                          alt={member.name}
                          width={400}
                          height={400}
                        />
                      </motion.span>
                      <span className="members__name">{member.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        <div className="members__showcase">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeCharacterCode}
              className="members__meta"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: TACHIE_EASE }}
            >
              <p className="members__meta-label">Now Viewing</p>
              <Link href={`/${activeCharacterCode}`} className="link">
                <h3 className="members__meta-name">{activeMember?.name}</h3>
              </Link>
              {activeMember?.description ? (
                <p className="members__meta-desc">
                  {renderWithBold(activeMember.description)}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="sync" initial={false} custom={direction}>
            <motion.div
              key={activeCharacterCode}
              className="members__tachie"
              custom={direction}
              variants={tachieVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: TACHIE_EASE }}
            >
              <Image
                className="members__tachie-img"
                src={DATA_MEMBERS.getTachiePath(activeCharacterCode)}
                alt={activeMember?.name ?? activeCharacterCode}
                width={1000}
                height={1000}
                priority
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
