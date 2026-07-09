import { redirect, notFound } from "next/navigation";
import { buildTravelSpotHref, getTravelSpot, listTravelSpotSlugs } from "@/lib/travel-spots";

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** 兼容旧 URL `/travel/:slug` → `/travel/attractions/:slug`。 */
export function generateStaticParams() {
  return listTravelSpotSlugs().map((slug) => ({ slug }));
}

export default async function LegacyTravelSpotRedirect({ params }: PageProps) {
  const { slug } = await params;
  const spot = getTravelSpot(slug);
  if (!spot) notFound();

  redirect(buildTravelSpotHref(spot.slug));
}
