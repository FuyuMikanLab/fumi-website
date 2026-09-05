"use client";

import { newsList } from "@/src/data/sectionNews";
import { renderWithBold } from "@/src/utils/renderWithBold";
import { motion } from "framer-motion";

export function SectionIntro() {
  return (
    <>
      <div className="w-[80vw]">
        <div className="h-screen w-full absolute top-0 left-0 flex justify-center">
          <div className="text-center intro__title absolute w-full h-full flex flex-col items-center justify-center">
            FuyumikanLab FuyumikanLab FuyumikanLab
            <br />
            <span></span>FuyumikanLab FuyumikanLab FuyumikanLab FuyumikanLab
            <br />
            FuyumikanLab FuyumikanLab FuyumikanLab
          </div>
        </div>
        <div className="news__panel">
          <div className="section__inner news__intro">
            <p className="section__eyebrow">News</p>
            <h2 className="section__title">新闻</h2>
            <p className="section__desc">
              记录了本站作为国内较具影响力的原创虚拟艺人企划，朝着国内最具影响力的原创虚拟艺人企划的目标，如何进行不断努力的。
            </p>
          </div>

          <ul className="news__list">
            {newsList.map((news, index) => (
              <motion.li
                key={news.title}
                className="news__item"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <time className="news__date" dateTime={news.date}>
                  {news.date}
                </time>
                <h3 className="news__title">{news.title}</h3>
                <p className="news__body">{renderWithBold(news.content)}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
