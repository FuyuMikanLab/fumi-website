"use client";

import { Header } from "@/src/components/home/Header";
import { SectionHomePage } from "@/src/components/home/SectionHomePage";
import { SectionIntro } from "@/src/components/home/SectionIntro";
import { SectionMembers } from "@/src/components/home/SectionMembers";
import { SectionNav, type NavSection } from "@/src/components/home/SectionNav";
import "./index.css";

const SECTIONS: NavSection[] = [
  { id: "section-1", label: "首页" },
  { id: "section-2", label: "新闻" },
  { id: "section-3", label: "成员" },
  { id: "section-4", label: "联系" },
];

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
