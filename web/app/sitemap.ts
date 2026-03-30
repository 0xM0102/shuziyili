import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

const staticPaths = [
  "/",
  "/travel",
  "/travel/attractions",
  "/travel/stay",
  "/travel/food",
  "/travel/transport",
  "/travel/guide",
  "/convenience",
  "/convenience/government",
  "/convenience/health",
  "/convenience/shipping",
  "/nomad",
  "/events",
  "/news",
  "/flash",
  "/about",
  "/cookies",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");
  const lastModified = new Date();

  return staticPaths.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path.split("/").length <= 2 ? 0.8 : 0.6,
  }));
}
