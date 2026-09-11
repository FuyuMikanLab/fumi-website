import type { MetadataRoute } from "next";
import { DATA_MEMBERS } from "@/src/data";

const SITE_URL = "https://fuyumikanlab.vrfan.icu";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/home`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/cardView`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const memberRoutes: MetadataRoute.Sitemap = DATA_MEMBERS.vCodeList.map(
    (vcode) => ({
      url: `${SITE_URL}/${vcode}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...memberRoutes];
}
