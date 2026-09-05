"use client";

import type { CardCategory } from "./types";
import { CARD_CATEGORIES, CATEGORY_COLOR } from "./types";
import { Button } from "@/src/components/ui";
import { useRouter } from "next/navigation";

type CardViewHeaderProps = {
  filter: CardCategory | "ALL";
  onFilterChange: (filter: CardCategory | "ALL") => void;
  onContactClick?: () => void;
};

export function CardViewHeader({
  filter,
  onFilterChange,
  onContactClick,
}: CardViewHeaderProps) {
  const router = useRouter();

  return (
    <header className="card-view__header">
      <div className="card-view__filters" role="tablist" aria-label="分类筛选">
        <Button
          type="button"
          variant="underline"
          selected={filter === "ALL"}
          underlineColor={CATEGORY_COLOR.ALL}
          className={`card-view__filter${filter === "ALL" ? " is-active" : ""}`}
          style={{ ["--filter-cat" as string]: CATEGORY_COLOR.ALL }}
          onClick={() => onFilterChange("ALL")}
          role="tab"
          aria-selected={filter === "ALL"}
        >
          <span className="card-view__filter-dot" />
          全部
        </Button>
        {CARD_CATEGORIES.map((cat) => (
          <Button
            key={cat.name}
            type="button"
            variant="underline"
            selected={filter === cat.name}
            underlineColor={CATEGORY_COLOR[cat.name]}
            className={`card-view__filter${filter === cat.name ? " is-active" : ""}`}
            style={{ ["--filter-cat" as string]: CATEGORY_COLOR[cat.name] }}
            onClick={() => onFilterChange(cat.name)}
            role="tab"
            aria-selected={filter === cat.name}
          >
            <span
              className="card-view__filter-dot"
              style={{ background: CATEGORY_COLOR[cat.name] }}
            />
            {cat.label}
          </Button>
        ))}
      </div>
      <div>
        <p className="card-view__eyebrow">
          国内<b>较</b>具影响力的原创虚拟艺人企划
        </p>
        <h1 className="card-view__brand">FuyuMikanLab</h1>
        <div className="card-view__desc">
          <b>虚拟艺人</b>日常通过直播、短视频、演出等方式活跃在 bilibili
          等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像
        </div>
        <div className="card-view__footer">
          <Button
            type="button"
            variant="underline"
            onClick={() => router.push("/home")}
          >
            <span>△ 旧版主页</span>
          </Button>
          <Button type="button" variant="underline" onClick={onContactClick}>
            <span>△ 联系我们</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
