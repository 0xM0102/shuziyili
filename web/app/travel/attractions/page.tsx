import { createTravelSubpage } from "@/lib/travel-subpages";

const subpage = createTravelSubpage("attractions");

export const metadata = subpage.metadata;
export default subpage.Page;
