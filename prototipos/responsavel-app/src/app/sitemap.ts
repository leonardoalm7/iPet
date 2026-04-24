import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/data/destination-slugs";

const BASE_URL = "https://ipetpass.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = getAllSlugs();

  const destinationPages: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${BASE_URL}/regras/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE_URL}/regras`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...destinationPages,
  ];
}
