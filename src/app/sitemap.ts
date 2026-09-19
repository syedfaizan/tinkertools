import type { MetadataRoute } from "next";
import { TOOLS, TOOL_ROUTE } from "@/tools/registry";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const toolRoutes: MetadataRoute.Sitemap = TOOLS.map(
    (tool): MetadataRoute.Sitemap[number] => ({
      url: `${SITE_URL}${TOOL_ROUTE(tool.slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...toolRoutes];
}