import { notFound } from "next/navigation";
import { DATA_MEMBERS } from "@/src/data";
import FanArtComp from "@/src/components/member/FanArtComp";
export default async function LinkPage({
  params,
}: Readonly<{
  params: Promise<{ vcode: string }>;
}>) {
  const { vcode } = await params;
  if (!DATA_MEMBERS.vCodeList.includes(vcode)) {
    notFound();
  }

  return <FanArtComp vcode={vcode} />;
}
