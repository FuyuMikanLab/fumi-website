import { getTachiePath, seriesList } from "@/src/data/sectionMember";
import { CardCategoryKey, type CardData } from "./types";
import { newsList } from "@/src/data/sectionNews";
import { artMap } from "@/src/data/fanArt";

/** 演示用卡片池；可后续替换为真实数据源 */
export const CARD_DECK: CardData[] = (() => {
  const res: CardData[] = [];
  let seriesCounter = 0;
  let memberCounter = 0;
  for (const series of seriesList) {
    seriesCounter++;
    for (const member of series.members) {
      memberCounter++;
      res.push({
        id: `card-${member.code}-${seriesCounter}-${memberCounter}`,
        category: CardCategoryKey.member,
        mode: "image",
        imageUrl: getTachiePath(member.code),
        title: member.name,
        meta: series.name,
        description: member.description,
      });
    }
  }
  newsList.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  for (const news of newsList) {
    res.push({
      id: `card-news-${news.title}`,
      category: CardCategoryKey.news,
      mode: "text",
      title: news.title,
      meta: news.date,
      description: news.content,
    });
  }
  for (const [vcode, artItem] of Object.entries(artMap)) {
    if (artItem.imgSeriesList) {
      for (const art of artItem.imgSeriesList) {
        res.push({
          id: `card-fanart-${vcode}-${art.date}`,
          category: CardCategoryKey.fanArt,
          mode: "image",
          imageUrl: art.fileLists[0],
          title: `${art.fanName}`,
          meta: `${art.artistName}${art.artistDesc ? `（${art.artistDesc}）` : ""} · ${art.fanName}${art.fanDesc ? `（${art.fanDesc}）` : ""}`,
          description: `${art.artistName}${art.artistDesc ? `（${art.artistDesc}）` : ""} · ${art.fanName}${art.fanDesc ? `（${art.fanDesc}）` : ""}`,
        });
      }
    }
  }
  return res;
})();

/** 为无限场生成重复铺排用的实例 id */
export function tileDeck(cols: number, rows: number): CardData[] {
  const total = cols * rows;
  return Array.from({ length: total }, (_, i) => {
    const base = CARD_DECK[i % CARD_DECK.length];
    return {
      ...base,
      id: `${base.id}-t${i}`,
    };
  });
}
