import type { MetadataRoute } from "next";
import { fetchConveniencePayload } from "@/lib/convenience-api";
import { buildConvenienceCategoryHref } from "@/lib/convenience-data";
import { siteConfig } from "@/lib/site";

const baseStaticPaths = [
  "/",
  "/travel",
  "/travel/sayram-lake",
  "/travel/attractions",
  "/travel/stay",
  "/travel/food",
  "/travel/transport",
  "/travel/guide",
  "/convenience",
  "/nomad",
  "/events",
  "/news",
  "/weather",
  "/flash",
  "/about",
  "/contact",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const lastModified = new Date();
  const data = await fetchConveniencePayload();
  const conveniencePaths = data.categories.map((item) => buildConvenienceCategoryHref(item.slug));
  const paths = [...baseStaticPaths, ...conveniencePaths];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
