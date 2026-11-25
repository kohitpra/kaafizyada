import { commerce } from "@/lib/commerce";
import { AutoHero } from "@/components/scenes/AutoHero";
import { EntryGate } from "@/components/scenes/gate/EntryGate";
import { PopTicker } from "@/components/sections/PopTicker";
import { EveryCorner } from "@/components/sections/EveryCorner";
import { OnTheRamp } from "@/components/sections/OnTheRamp";
import { ShopGrid } from "@/components/sections/ShopGrid";
import { HiiWeAre } from "@/components/sections/HiiWeAre";
import { Faq } from "@/components/sections/Faq";
import { JoinTheGang } from "@/components/sections/JoinTheGang";

// Section order follows the client's brief (references/client/section-sequence.png).
export default async function Home() {
  const [newest, all] = await Promise.all([
    commerce.getProducts({ collection: "new-arrivals", sort: "newest" }),
    commerce.getProducts({ sort: "newest" }),
  ]);

  return (
    <>
      <EntryGate />
      <AutoHero />
      <PopTicker />
      <EveryCorner />
      <OnTheRamp products={newest} />
      <ShopGrid products={all} />
      <HiiWeAre />
      <Faq />
      <JoinTheGang />
    </>
  );
}
