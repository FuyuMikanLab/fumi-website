import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const harlowSolid = localFont({
  src: "../public/fonts/Harlow Solid Regular.ttf",
  variable: "--font-harlow-solid",
  display: "swap",
});

const chillRoundGothic = localFont({
  src: "../public/fonts/ChillRoundGothic_Normal.woff2",
  variable: "--font-chill-round-gothic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Fuyumikan Lab 公式サイト",
    default: "Fuyumikan Lab 公式サイト",
  },
  description:
    "Fumi - Fuyumikan Lab 公式サイト | 虚拟艺人团体FuyumikanLab官方网站。FuyumikanLab是国内较具影响力的原创虚拟艺人企划。虚拟艺人日常通过直播、短视频、演出等方式活跃在 bilibili 等平台，凭借多元化的表演方式提供丰富多彩的娱乐内容，是陪伴粉丝们一起成长的新时代偶像。",
  authors: [{ name: "FuyumikanLab管理委员会" }],
  metadataBase: new URL("https://fuyumikanlab.vrfan.icu"),
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
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${harlowSolid.variable} ${chillRoundGothic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* <div className="fixed top-0 left-0 w-full z-50">
          <Header />
        </div> */}
        {children}
      </body>
      <Analytics />
    </html>
  );
}
