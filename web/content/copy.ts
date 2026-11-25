// All editable marketing copy lives here. Change words without touching components.

export const brand = {
  name: "KAAFIZYADA",
  line: "Desi with a little extra.",
};

export const announcements = [
  "Free shipping across India over ₹1,999",
  "New drop: The Desi Baddie Edit is live",
  "Easy 7-day exchanges. No drama.",
];

export const nav = [
  { label: "Shop", href: "/shop" },
  { label: "New", href: "/collections/new-arrivals" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Story", href: "/story" },
];

export const hero = {
  sceneOne: "Life was never meant to be this colourless.",
  sceneOneHint: { pointer: "Move your cursor to paint. Scroll to walk in.", touch: "Drag to paint. Scroll to walk in." },
  sceneTwoA: "And then came KAAFIZYADA.",
  sceneTwoB: "A little more colour. A lot more character.",
  cta: "Step inside",
  skip: "Skip the walk, go shopping",
};

export const gate = {
  label: "Entrance to the KAAFIZYADA gully",
  loading: "Opening the gully…",
  title: "Knock knock.",
  hintPointer: "Hover the doors. Click to step inside.",
  hintTouch: "Tap the doors to step inside.",
  cta: "Step inside",
  skip: "Skip",
};

export const ticker = [
  "Desi with a little extra",
  "Not made to blend in",
  "Too much? Never.",
  "Your street. Your rules.",
  "Made in India, worn everywhere",
  "Chai first, outfit second",
];

export const corners = {
  title: "Every corner has a look",
  intro: "Walk the gully. Every stop sells a different mood. Hover to bring it to life, click to step in.",
  stops: [
    {
      id: "chai",
      sign: "Chai Tapri",
      hint: "garam garam drops →",
      label: "New Arrivals",
      href: "/collections/new-arrivals",
      image: "/assets/home/corner-chai.webp",
      shape: "tall",
      alt: "Two women in a paisley set and a cherry corset laughing over cutting chai while the chai-wala pours from a height",
    },
    {
      id: "masterji",
      sign: "Masterji",
      hint: "sab kuch yahin silta hai →",
      label: "Shop Everything",
      href: "/shop",
      image: "/assets/home/corner-masterji.webp",
      shape: "wide",
      alt: "An old tailor pinning the hem of olive palazzos in a shop stacked with colourful fabric while a friend in a striped co-ord laughs",
    },
    {
      id: "auto",
      sign: "Auto Stand",
      hint: "poster girl energy →",
      label: "The Desi Baddie Edit",
      href: "/collections/desi-baddie",
      image: "/assets/home/corner-auto.webp",
      shape: "tall",
      alt: "A woman in a cherry halter, bandhani dupatta and olive cargos posing against a yellow auto rickshaw",
    },
    {
      id: "platform",
      sign: "Platform No. 1",
      hint: "next stop: comfort →",
      label: "The Commute Edit",
      href: "/collections/commute-edit",
      image: "/assets/home/corner-platform.webp",
      shape: "wide",
      alt: "Three women in a kurta, a saree with sneakers and a striped co-ord walking along a busy local train platform",
    },
    {
      id: "bangles",
      sign: "Bangle Cart",
      hint: "thoda aur? always →",
      label: "Accessories",
      href: "/collections/accessories",
      image: "/assets/home/corner-bangles.webp",
      shape: "tall",
      alt: "A woman trying a stack of glass bangles at a corner cart full of bangles and brass jhumkas",
    },
  ],
};

export const ramp = {
  title: "On the ramp",
  note: "swipe karo →",
  intro: "The newest looks, walking straight off the gully.",
};

export const shopGrid = {
  title: "Abhi ka maal",
  note: "abhi, matlab abhi",
  intro: "Pick a size, add to bag. No detours.",
  cta: "See everything",
};

export const about = {
  title: "Hii, we're KAAFIZYADA",
  panels: [
    { line: "Born in the gully, raised on cutting chai and local-train gossip.", image: "/assets/home/story-1.webp", alt: "A young designer sketching outfits on a Mumbai rooftop at sunrise, block-printed kurtas drying on the line behind her" },
    { line: "We make clothes for girls who were told it's a bit much. It is. That's the point.", image: "/assets/home/story-3.webp", alt: "Five women in bold desi street looks dancing under fairy lights on a Mumbai rooftop at night" },
    { line: "Made in India by hands that know their craft. Worn anywhere you want to be noticed.", image: "/assets/home/story-2.webp", alt: "An artisan pressing a carved wooden block onto cotton in a Jaipur printing workshop while a young woman holds up the printed fabric" },
  ],
};

export const faq = {
  title: "Kuch poochna hai?",
  items: [
    {
      q: "How long does delivery take?",
      a: "Metro cities usually get their order in 3–5 working days, the rest of India in 5–8. You get a tracking link on WhatsApp and email the moment it ships.",
    },
    {
      q: "Can I exchange or return?",
      a: "Yes. Exchange or return anything unworn with tags within 7 days of delivery. We arrange the pickup, you just pack it.",
    },
    {
      q: "How do I find my size?",
      a: "Every product page has a size guide in centimetres and inches, plus a fit note (true to size, size up, size down). Still unsure? Message us and a real person will help.",
    },
    {
      q: "Do you offer cash on delivery?",
      a: "Yes, COD is available on orders up to ₹5,000 across most pin codes. UPI, cards and netbanking work everywhere.",
    },
    {
      q: "How do I care for block-print and bandhani?",
      a: "Cold hand wash, mild detergent, dry in the shade. The first wash may release a little colour; that's natural dye saying hello.",
    },
  ],
};

export const join = {
  title: "Join the gang",
  intro: "First dibs on drops and restocks. No spam, only gossip.",
  placeholder: "your@email.com",
  cta: "I'm in",
  success: "You're in the gang. Watch your inbox.",
};

export const footer = {
  signoff: "KAAFIZYADA",
  line: "Desi with a little extra.",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "Shop all", href: "/shop" },
        { label: "New arrivals", href: "/collections/new-arrivals" },
        { label: "Desi Baddie Edit", href: "/collections/desi-baddie" },
        { label: "Commute Edit", href: "/collections/commute-edit" },
        { label: "Accessories", href: "/collections/accessories" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "Size guide", href: "/pages/size-guide" },
        { label: "Shipping", href: "/pages/shipping" },
        { label: "Returns & exchanges", href: "/pages/returns" },
        { label: "Contact", href: "/pages/contact" },
      ],
    },
    {
      title: "About",
      links: [
        { label: "Our story", href: "/story" },
        { label: "Privacy", href: "/pages/privacy" },
        { label: "Terms", href: "/pages/terms" },
        { label: "Instagram", href: "https://instagram.com/", external: true },
      ],
    },
  ],
};
