import { createTravelSubpage } from "@/lib/travel-subpages";

const subpage = createTravelSubpage("food");

export const metadata = subpage.metadata;
export default subpage.Page;
