import { createTravelSubpage } from "@/lib/travel-subpages";

const subpage = createTravelSubpage("stay");

export const metadata = subpage.metadata;
export default subpage.Page;
