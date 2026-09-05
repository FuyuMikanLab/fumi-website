import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Fuyumikan Lab 公式サイト",
    default: "Fuyumikan Lab 公式サイト",
  },
  description:
    "Fumi - Fuyumikan Lab 公式サイト | 虚拟艺人团体FuyumikanLab官方网站。FuyumikanLab是国内较具影响力的原创虚拟艺人企划。虚拟艺人日常通过直播、短视频、演出等方式活跃在 bilibili 等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像。",
  authors: [{ name: "FuyumikanLab管理委员会" }],
  metadataBase: new URL("https://fuyumikanlab.vrfan.icu"),
  icons: {
    icon: [{ url: "/favicon.webp", type: "image/webp" }],
    apple: [{ url: "/favicon.webp", type: "image/webp" }],
  },
  alternates: {
    canonical: "/",
    languages: {
      "zh-CN": "/zh-CN",
    },
  },
  openGraph: {
    siteName: "Fuyumikan Lab 公式サイト ｜ 虚拟艺人团体FuyumikanLab官方网站",
    type: "website",
    locale: "zh-CN",
    title: "Fuyumikan Lab 公式サイト ｜ 虚拟艺人团体FuyumikanLab官方网站",
    description:
      "Fumi - Fuyumikan Lab 公式サイト | 虚拟艺人团体FuyumikanLab官方网站。FuyumikanLab是国内较具影响力的原创虚拟艺人企划。虚拟艺人日常通过直播、短视频、演出等方式活跃在 bilibili 等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像。",
    url: "https://fuyumikanlab.vrfan.icu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
