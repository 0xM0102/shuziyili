import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TravelSpotPageContent } from "@/components/travel/travel-spot-page-content";
import { getTravelSpot, listTravelSpotSlugs } from "@/lib/travel-spots";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return listTravelSpotSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const spot = getTravelSpot(slug);
  if (!spot) {
    return { title: "景区" };
  }

  return {
    title: spot.title,
    description: spot.summary,
    alternates: { canonical: `/travel/${spot.slug}` },
    openGraph: {
      title: `${spot.title} · 旅游`,
      description: spot.summary,
      url: `/travel/${spot.slug}`,
    },
  };
}

export default async function TravelSpotPage({ params }: PageProps) {
  const { slug } = await params;
  const spot = getTravelSpot(slug);
  if (!spot) notFound();

  return <TravelSpotPageContent spot={spot} />;
}
