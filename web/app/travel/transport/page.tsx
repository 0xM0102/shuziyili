import { createTravelSubpage } from "@/lib/travel-subpages";

const subpage = createTravelSubpage("transport");

export const metadata = subpage.metadata;
export default subpage.Page;
