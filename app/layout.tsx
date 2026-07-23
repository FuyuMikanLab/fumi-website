import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

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
  title: "Fuyumikan Lab 公式サイト",
  description: "Fumi - Fuyumikan Lab 公式サイト",
};


// const Header = () => {
//   return (
//     <div className="flex justify-between items-center p-4 header header__texture">
//       <h1 className="header__title">FuyumikanLab</h1>
//       <div className="flex items-center gap-16">
//         <nav className="flex items-center gap-4">
//           {linkList.map((link) => (
//             <Link className="header__link" key={link.href} href={link.href}>
//               {link.label}
//             </Link>
//           ))}
//         </nav>
//         <nav className="flex items-center gap-4">
//           {toolList.map((link) => (
//             <Link className="header__link" key={link.href} href={link.href}>
//               {link.label}
//             </Link>
//           ))}
//         </nav>
//       </div>
//     </div>
//   );
// };

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
    </html>
  );
}
