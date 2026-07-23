"use client";

import { TransparentVideo } from "@/src/components/common/TransparentVideo";
import { SectionNav, type NavSection } from "@/src/components/home/SectionNav";
import { renderWithBold } from "@/src/utils/renderWithBold";
import "./index.css";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

const SECTIONS: NavSection[] = [
  { id: "section-1", label: "首页" },
  { id: "section-2", label: "新闻" },
  { id: "section-3", label: "成员" },
  { id: "section-4", label: "联系" },
];

/** 设计稿尺寸 1422×800，保持固定比例并随视口缩放 */
const VIDEO_ASPECT = "1422 / 800";

/**
 * 视频经同源 /cdn 代理加载（next.config rewrites → assert.vrfan.icu）。
 * WebGL 读帧要求 CORS；直连 CDN 时 CF 缓存偶发丢掉 ACAO，同源可彻底规避。
 */
const assetUrl = (path: string) =>
  `/cdn${path.startsWith("/") ? path : `/${path}`}`;
const Header = () => {
  const linkList = [
    { label: "Github", href: "https://github.com/FuyuMikanLab" },
    { label: "Bilibili", href: "/" },
  ];
  const toolList = [{ label: "Language", href: "/news" }];

  return (
    <div className="flex justify-between items-center p-4 header header__texture">
      <h1 className="header__title">FuyumikanLab</h1>
      <div className="flex items-center gap-16">
        <nav className="flex items-center gap-4">
          {linkList.map((link) => (
            <Link className="link" key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <nav className="flex items-center gap-4">
          {toolList.map((link) => (
            <Link className="link" key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};
const SectionHomePage = () => {
  return (
    <div className="banner">
      <div className="banner__copy">
        <div className="section__inner">
          <p className="section__eyebrow">Fumi</p>
          <h1 className="section__title banner__title">FuyumikanLab</h1>
          <p className="section__desc">
            <b>FuyumikanLab</b> 是国内<b>较</b>具影响力的原创虚拟艺人企划
          </p>
          <p className="section__desc banner__desc-long">
            <b>虚拟艺人</b>日常通过直播、短视频、演出等方式活跃在 bilibili
            等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像
          </p>
        </div>
      </div>

      <div className="banner__video" style={{ aspectRatio: VIDEO_ASPECT }}>
        <TransparentVideo src={assetUrl("/website/videos/hero-banner.mp4")} />
      </div>
    </div>
  );
};
/**
 * SectionIntro 组件
 * 用于展示网站的新闻和介绍部分
 * 包含标题动画、新闻列表和新闻内容展示
 */
const SectionIntro = () => {
  // 新闻列表数据
  const newsList = [
    {
      title: "FuyumikanLab企划主页正式上线！", // 新闻标题
      date: "2026-07-23 22:12", // 新闻发布日期
      content:
        "透明视频实现方案借鉴了<b>endfield.hypergryph.com</b>；页面结构借鉴了<b>vrp.live</b>。感谢上述网站的大力支持。<br/>Producer在编写成员简介时埋藏了很多小巧思，请务必阅读，万分感谢。<br/>遗憾的是，本次并未同步开放社团新成员招募，有兴趣加入的朋友请关注我们的后续动态。", // 新闻内容
    },
  ];

  return (
    <>
      <div className="w-[80vw]">
        {/* 创建一个带有边框的容器，用于显示标题 */}
        <div className="h-screen w-full absolute top-0 left-0 flex justify-center">
          <div className="text-center intro__title absolute w-full h-full flex flex-col items-center justify-center">
            FuyumikanLab FuyumikanLab FuyumikanLab
            <br />
            <span></span>FuyumikanLab FuyumikanLab FuyumikanLab FuyumikanLab
            <br />
            FuyumikanLab FuyumikanLab FuyumikanLab
          </div>
        </div>
        {/* 新闻面板容器 */}
        <div className="news__panel">
          {/* 新闻介绍部分 */}
          <div className="section__inner news__intro">
            <p className="section__eyebrow">News</p> {/* 新闻分类标签 */}
            <h2 className="section__title">新闻</h2> {/* 新闻板块标题 */}
            <p className="section__desc">
              记录了本站作为国内较具影响力的原创虚拟艺人企划，朝着国内最具影响力的原创虚拟艺人企划的目标，如何进行不断努力的。
            </p>
            {/* 新闻板块描述 */}
          </div>

          {/* 新闻列表 */}
          <ul className="news__list">
            {/* 使用 motion.li 实现新闻列表项的动画效果 */}
            {newsList.map((news, index) => (
              <motion.li
                key={news.title} // 使用新闻标题作为 key
                className="news__item" // 新闻项样式类
                initial={{ opacity: 0, y: 18 }} // 初始状态：透明且向下偏移
                whileInView={{ opacity: 1, y: 0 }} // 进入视图时的状态：完全不透明且位置正常
                viewport={{ once: true, amount: 0.35 }} // 视口设置：只触发一次，当元素进入视口35%时触发
                transition={{
                  // 动画过渡设置
                  duration: 0.45, // 动画持续时间
                  delay: index * 0.08, // 根据索引设置延迟，实现依次出现的效果
                  ease: [0.22, 1, 0.36, 1], // 自定义缓动函数
                }}
              >
                <time className="news__date" dateTime={news.date}>
                  {news.date} {/* 新闻发布日期 */}
                </time>
                <h3 className="news__title">{news.title}</h3> {/* 新闻标题 */}
                <p className="news__body">
                  {renderWithBold(news.content)}
                </p>{" "}
                {/* 新闻内容，使用 renderWithBold 函数处理加粗文本 */}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
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

const SectionMembers = () => {
  const seriesList = [
    {
      name: "本社一期",
      members: [
        {
          name: "郁花Fumika",
          description:
            "FuyumikanLab一期生。为了社团的未来，并没有在全力以赴。<br />怠惰的绝食系恶魔。",
          code: "fumika",
        },
      ],
    },
    {
      name: "虚数电荷",
      members: [
        {
          name: "ふわゆみ",
          description:
            "飘忽不定的电子猫。<br />虚数存在，稀薄时间线的住民。<br />似乎在哪里见过。<br />FuyumikanLab的Producer。",
          code: "fuwayumi",
        },
      ],
    },
    {
      name: "不懂意思公园",
      members: [
        {
          name: "o酱",
          description:
            "不知何时出现的字母二人组之o。<br />中华武术传人，正在大正女仆咖啡馆担任要职。",
          code: "ochain",
        },
        {
          name: "b酱",
          description:
            "不知何时出现的字母二人组之b。<br />听说本名有四个字符（在编码方式为ASCII、UTF8、GB2312的场景下，长度亦为四个字节），更多信息不详。",
          code: "bchain",
        },
      ],
    },
  ];
  const allMembers = seriesList.flatMap((series) => series.members);
  const [activeCharacterCode, setActiveCharacterCode] = useState(
    allMembers[0]?.code ?? "fumika3",
  );
  const [direction, setDirection] = useState(0);

  const getTachiePath = (code: string) =>
    `https://assert.vrfan.icu/website/images/${code}-tachie.webp`;
  const getAvatarPath = (code: string) =>
    `https://assert.vrfan.icu/website/images/${code}-avatar.webp`;

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
                            ? "rgba(253, 131, 182, 0.95)"
                            : "rgba(255, 255, 255, 0.28)",
                          boxShadow: isActive
                            ? "0 0 0 3px rgba(253, 131, 182, 0.35), 0 12px 28px rgba(0, 0, 0, 0.28)"
                            : "0 0 0 0 rgba(253, 131, 182, 0)",
                        }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                        whileHover={{ scale: isActive ? 1.08 : 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Image
                          src={getAvatarPath(member.code)}
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
                src={getTachiePath(activeCharacterCode)}
                alt={activeMember?.name ?? activeCharacterCode}
                width={1000}
                height={1000}
                priority
              />
            </motion.div>
          </AnimatePresence>

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
              <h3 className="members__meta-name">{activeMember?.name}</h3>
              {activeMember?.description ? (
                <p className="members__meta-desc">
                  {renderWithBold(activeMember.description)}
                </p>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 w-full z-50">
        <Header />
      </div>
      <div className="home">
        <SectionNav sections={SECTIONS} />

        <main className="home__main">
          <section id="section-1" className="section section-1 relative">
            <SectionHomePage />
          </section>

          <section id="section-2" className="section section-2 relative">
            <SectionIntro />
          </section>

          <section id="section-3" className="section section-3">
            <SectionMembers />
          </section>

          <section id="section-4" className="section section-4">
            <div className="section__inner">
              <p className="section__eyebrow">Contact</p>
              <h2 className="section__title">前往魔法般的世界</h2>
              <p className="section__desc">招募暂未开启。</p>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
