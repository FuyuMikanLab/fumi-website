export interface IFanArtList {
  artistName: string; //画师名称
  artistDesc?: string | null; // 画师简介
  fanName: string; // 粉丝简介
  fanDesc?: string | null; // 粉丝简介
  fanRemark?: string | null; // 粉丝留言
  fileLists: string[];
  date: string; // 投稿日期（ISO 格式，如 2026-07-30），用于按时间排序
}
interface IArtMap {
  [key: string]: {
    imgSeriesList: IFanArtList[];
  };
}
const artMap: IArtMap = {
  fumika: {
    imgSeriesList: [
      {
        artistName: "まろさん",
        artistDesc: null,
        fanName: "anonymous",
        fanDesc: null,
        fileLists: [
          "https://assert.vrfan.icu/website/fanart/fumika/3931651-1.PNG",
          "https://assert.vrfan.icu/website/fanart/fumika/3931651-2.PNG",
        ],
        fanRemark: null,
        date: "2026-07-28",
      },
    ],
  },
};

export default artMap;
