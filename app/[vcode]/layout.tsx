import { notFound } from "next/navigation";
import { DATA_MEMBERS } from "@/src/data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member Page",
  description: "Member Page",
  openGraph: {
    title: "Member Page",
    description: "Member Page",
    url: "https://fuyumikanlab.com",
    siteName: "Fuyumikan Lab",
    images: ["https://fuyumikanlab.com/og-image.png"],
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ vcode: string }>;
}>) {
  const { vcode } = await params;
  if (!DATA_MEMBERS.vCodeList.includes(vcode)) {
    notFound();
  }
  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}
