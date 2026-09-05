import { cdnUrl } from "@/src/utils/cdn";
export interface ISeriesList {
  name: string;
  members: {
    name: string;
    description: string;
    code: string;
  }[];
}

export const seriesList: ISeriesList[] = [
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

export const getVCodeList = (seriesList: ISeriesList[]) => {
  return seriesList.map((series) =>
    series.members.map((member) => member.code),
  );
};

export const vCodeList: string[] = getVCodeList(seriesList).flat();

export const getTachiePath = (code: string) =>
  cdnUrl(`/website/images/${code}-tachie.webp`);
export const getAvatarPath = (code: string) =>
  cdnUrl(`/website/images/${code}-avatar.webp`);
