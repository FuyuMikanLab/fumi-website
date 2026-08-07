"use client";

import { renderWithBold } from "@/src/utils/renderWithBold";
import { motion } from "framer-motion";

export function SectionIntro() {
  const newsList = [
    {
      title: "FuyumikanLab企划主页正式上线！",
      date: "2026-07-23 22:12",
      content:
        "项目名借鉴了<b>maa.plus</b>；透明视频实现方案借鉴了<b>endfield.hypergryph.com</b>；页面结构借鉴了<b>vrp.live</b>。感谢上述网站的大力支持。<br/>Producer在编写成员简介时埋藏了很多小巧思，请务必阅读，万分感谢。<br/>遗憾的是，本次并未同步开放社团新成员招募，有兴趣加入的朋友请关注我们的后续动态。",
    },
  ];

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
