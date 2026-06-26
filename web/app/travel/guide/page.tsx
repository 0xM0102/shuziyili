import { createTravelSubpage } from "@/lib/travel-subpages";

const subpage = createTravelSubpage("guide");

export const metadata = subpage.metadata;
export default subpage.Page;
