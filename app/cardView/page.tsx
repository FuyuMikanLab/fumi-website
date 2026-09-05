import type { Metadata } from "next";
import { InfiniteCardField } from "@/src/components/cardView";
import "./index.css";

export const metadata: Metadata = {
  title: "卡片展廊",
  description: "Fumi 卡片展廊 · 分类抽取与放大查看",
};

export default function CardViewPage() {
  return <InfiniteCardField />;
}
