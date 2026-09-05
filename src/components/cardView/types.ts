import type { CSSProperties, ReactNode } from "react";

export enum CardCategoryKey {
  member = "member",
  news = "news",
  fanArt = "fanArt",
  other = "other",
}

export type CardCategory = CardCategoryKey;
export type CardMode = "text" | "image";

export type CardData = {
  id: string;
  category: CardCategory;
  mode: CardMode;
  title: string;
  body?: string;
  imageUrl?: string;
  /** 右下角信息 */
  meta: string;
  tag?: string;
  /** 展开描述 */
  description?: string;
};

export type CardCompProps = {
  data: CardData;
  style?: CSSProperties;
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  selected?: boolean;
  interactive?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  children?: ReactNode;
};

/** 筛选色标：中性灰 / 酸黄 / 电青 / 信号粉 / 警示橙 */
export const CATEGORY_COLOR: Record<CardCategory | "ALL", string> = {
  ALL: "#8B939C",
  [CardCategoryKey.member]: "#D7FF3F",
  [CardCategoryKey.news]: "#35E7FF",
  [CardCategoryKey.fanArt]: "#FF4D9D",
  [CardCategoryKey.other]: "#FF9A3D",
};

export const CATEGORY_LABEL: Record<CardCategory, string> = {
  [CardCategoryKey.member]: "成员",
  [CardCategoryKey.news]: "资讯",
  [CardCategoryKey.fanArt]: "同人",
  [CardCategoryKey.other]: "其他",
};

export type T_CARD_CATEGORIES = {
  name: CardCategory;
  label: string;
  desc?: string;
};

export const CARD_CATEGORIES: T_CARD_CATEGORIES[] = [
  {
    name: CardCategoryKey.member,
    label: "成员",
    desc: "FuyumikanLab旗下所有厂牌的成员一览。",
  },
  {
    name: CardCategoryKey.news,
    label: "资讯",
    desc: "记录了本站作为国内较具影响力的原创虚拟艺人企划，朝着国内最具影响力的原创虚拟艺人企划的目标，如何进行不断努力的。",
  },
  { name: CardCategoryKey.fanArt, label: "同人", desc: "所有人的爱" },
  { name: CardCategoryKey.other, label: "其他" },
];
