// DEMO CATALOGUE. Every product, price and stock level here is invented for the prototype.
// Replace by connecting Shopify (see .env.example); no UI code changes are needed.

import type { Collection, Product, ProductImage, Variant } from "./types";

const INR = (amount: number) => ({ amount, currencyCode: "INR" });
const img = (file: string, alt: string): ProductImage => ({
  url: `/assets/products/${file}`,
  alt,
  width: 1200,
  height: 1600,
});

type Seed = {
  handle: string;
  title: string;
  tagline: string;
  description: string;
  productType: Product["productType"];
  tags: string[];
  price: number;
  compareAt?: number;
  colours: { name: string; hex: string; images: ProductImage[] }[];
  sizes: string[];
  /** Units per size; index matches `sizes`. Same for every colour unless overridden. */
  stock: number[];
  details: Product["details"];
  callouts: Product["callouts"];
  createdAt: string;
  sizeChart?: Product["sizeChart"];
};

const APPAREL = ["XS", "S", "M", "L", "XL"];

function build(seed: Seed): Product {
  const hasSize = seed.sizes.length > 1 || seed.sizeChart !== "none";
  const variants: Variant[] = [];
  seed.colours.forEach((c, ci) => {
    seed.sizes.forEach((s, si) => {
      // Second colourway gets slightly different stock so the UI shows real variety.
      const qty = Math.max(0, seed.stock[si] - (ci === 1 ? (si % 2) * 2 : 0));
      variants.push({
        id: `demo:${seed.handle}:${c.name}:${s}`.toLowerCase().replace(/\s+/g, "-"),
        title: seed.colours.length > 1 ? `${c.name} / ${s}` : s,
        availableForSale: qty > 0,
        quantityAvailable: qty,
        selectedOptions: [
          ...(hasSize ? [{ name: "Size", value: s }] : []),
          { name: "Colour", value: c.name },
        ],
        price: INR(seed.price),
        compareAtPrice: seed.compareAt ? INR(seed.compareAt) : null,
        image: c.images[0],
      });
    });
  });

  const options = [
    ...(hasSize ? [{ name: "Size", values: seed.sizes }] : []),
    { name: "Colour", values: seed.colours.map((c) => c.name) },
  ];

  return {
    id: `demo:${seed.handle}`,
    handle: seed.handle,
    title: seed.title,
    tagline: seed.tagline,
    description: seed.description,
    productType: seed.productType,
    tags: seed.tags,
    options,
    variants,
    images: seed.colours.flatMap((c) => c.images),
    priceRange: { min: INR(seed.price), max: INR(seed.price) },
    availableForSale: variants.some((v) => v.availableForSale),
    details: seed.details,
    callouts: seed.callouts,
    swatches: Object.fromEntries(seed.colours.map((c) => [c.name, c.hex])),
    createdAt: seed.createdAt,
    sizeChart: seed.sizeChart ?? "apparel",
  };
}

// Product images are interim crops from the client illustrations (scripts/crops.json),
// so every garment here is one that is actually drawn in the art.
const one = (name: string, hex: string, file: string, alt: string, look: string, lookAlt: string) => ({
  name,
  hex,
  images: [img(file, alt), img(look, lookAlt)],
});

const seeds: Seed[] = [
  {
    handle: "gully-queen-halter",
    title: "Gully Queen Halter",
    tagline: "Block-print halter. Main character energy.",
    description:
      "A cropped halter in hand block-printed cotton, deep cherry with gold motifs, cut close at the waist with a tie-back neck. Wear it with wide pants for the local, or a wrap skirt for the sangeet.",
    productType: "Tops",
    tags: ["new", "desi-baddie", "tops"],
    price: 1490,
    colours: [one("Cherry", "#750505", "gully-queen-halter-cherry.webp", "Cherry block-print halter crop top with gold motifs", "gully-queen-halter-look.webp", "Illustrated woman in the cherry halter and olive palazzo holding the pole of a local train")],
    sizes: APPAREL,
    stock: [3, 8, 0, 6, 2],
    details: { fabric: "100% cotton, hand block-printed", fit: "Cropped, close fit. Take your usual size.", care: "Cold hand wash, dry in shade", madeIn: "Jaipur, India" },
    callouts: [
      { x: 0.55, y: 0.5, label: "hand block-print" },
      { x: 0.3, y: 0.3, label: "halter neck" },
    ],
    createdAt: "2026-11-20",
  },
  {
    handle: "local-train-palazzo",
    title: "Local Train Palazzo",
    tagline: "Wide enough for the 8:14 fast.",
    description: "Floor-grazing wide-leg pants in fluid olive viscose with a high waist and deep pockets. They move when you move.",
    productType: "Bottoms",
    tags: ["new", "commute-edit", "bottoms"],
    price: 2190,
    colours: [one("Olive", "#6B6B2E", "local-train-palazzo-olive.webp", "Olive wide-leg palazzo pants", "local-train-palazzo-look.webp", "Illustrated woman in olive palazzo pants standing in a local train")],
    sizes: APPAREL,
    stock: [5, 9, 7, 4, 3],
    details: { fabric: "Viscose crepe", fit: "High rise, wide leg, full length", care: "Gentle machine wash cold", madeIn: "Mumbai, India" },
    callouts: [
      { x: 0.5, y: 0.08, label: "high waist" },
      { x: 0.35, y: 0.75, label: "floor-grazing" },
    ],
    createdAt: "2026-11-18",
  },
  {
    handle: "chai-break-set",
    title: "Chai Break Paisley Set",
    tagline: "Paisley top to toe. Unbothered.",
    description:
      "A relaxed kurta-shirt and matching straight pants in soft cotton with a cherry paisley print. Wear the set for the full look or split them up across the week.",
    productType: "Sets",
    tags: ["new", "chai", "sets"],
    price: 2890,
    colours: [one("Cream Paisley", "#EEDCC0", "chai-break-set-paisley.webp", "Cream and cherry paisley kurta-shirt", "chai-break-set-look.webp", "Illustrated woman in the paisley set laughing with a chai glass at a tapri")],
    sizes: APPAREL,
    stock: [4, 6, 8, 5, 0],
    details: { fabric: "Cotton cambric", fit: "Relaxed. Take your usual size.", care: "Machine wash cold, inside out", madeIn: "Sanganer, India" },
    callouts: [
      { x: 0.45, y: 0.4, label: "paisley print" },
      { x: 0.25, y: 0.72, label: "3/4 sleeves" },
    ],
    createdAt: "2026-11-16",
  },
  {
    handle: "marigold-cargo",
    title: "Marigold Cargo",
    tagline: "Pockets for everything. Attitude included.",
    description: "Relaxed wide cargo pants in heavy cotton twill with utility pockets and a mid-rise waist. Made for gully walks and long days.",
    productType: "Bottoms",
    tags: ["desi-baddie", "bottoms"],
    price: 2490,
    colours: [
      one("Ivory", "#EFE6D2", "marigold-cargo-ivory.webp", "Ivory wide cargo pants with utility pockets", "marigold-cargo-look.webp", "Illustrated woman in ivory cargos and a halter walking out of the shop"),
      { name: "Olive", hex: "#5E6233", images: [img("marigold-cargo-olive.webp", "Olive wide cargo pants with utility pockets")] },
    ],
    sizes: APPAREL,
    stock: [2, 5, 6, 6, 4],
    details: { fabric: "Cotton twill, 280 gsm", fit: "Mid rise, relaxed wide leg", care: "Machine wash cold", madeIn: "Tiruppur, India" },
    callouts: [{ x: 0.75, y: 0.35, label: "utility pockets" }],
    createdAt: "2026-10-28",
  },
  {
    handle: "tapri-corset-top",
    title: "Tapri Corset Top",
    tagline: "Structured. Sweetheart. Slightly dangerous.",
    description: "A sweetheart-neck corset top in deep cherry with thin straps and a fitted, boned body. Dress it up with a wrap skirt or down with denim.",
    productType: "Tops",
    tags: ["new", "desi-baddie", "tops"],
    price: 1990,
    colours: [one("Cherry", "#5E0A0A", "tapri-corset-top-cherry.webp", "Deep cherry sweetheart corset top", "tapri-corset-top-look.webp", "Illustrated woman in the corset top laughing over chai")],
    sizes: ["XS", "S", "M", "L"],
    stock: [2, 4, 3, 0],
    details: { fabric: "Cotton sateen, cotton lining", fit: "Fitted. Size up if between sizes.", care: "Dry clean only", madeIn: "Mumbai, India" },
    callouts: [{ x: 0.45, y: 0.22, label: "sweetheart neck" }],
    createdAt: "2026-11-22",
  },
  {
    handle: "tapri-wrap-skirt",
    title: "Tapri Wrap Skirt",
    tagline: "All the drape, none of the pins.",
    description: "A short wrap skirt in ivory handloom cotton with a knotted side tie. Pair it with boots, kolhapuris or sneakers.",
    productType: "Bottoms",
    tags: ["desi-baddie", "bottoms", "chai"],
    price: 1790,
    colours: [one("Ivory", "#F1E7D0", "tapri-wrap-skirt-ivory.webp", "Ivory knotted wrap skirt", "tapri-wrap-skirt-look.webp", "Illustrated woman in the wrap skirt and cowboy boots at a chai tapri")],
    sizes: APPAREL,
    stock: [3, 5, 5, 3, 1],
    details: { fabric: "Handloom cotton", fit: "Adjustable wrap, knotted at the side", care: "Cold hand wash", madeIn: "Kolkata, India" },
    callouts: [{ x: 0.45, y: 0.35, label: "knotted tie" }],
    createdAt: "2026-11-12",
  },
  {
    handle: "block-print-denim-jacket",
    title: "Faded Gully Denim Jacket",
    tagline: "Denim, but make it desi.",
    description: "A boxy, sun-faded denim jacket with rolled cuffs and chest pockets, made to layer over everything from halters to kurtas.",
    productType: "Jackets",
    tags: ["commute-edit", "jackets"],
    price: 3490,
    colours: [one("Faded Indigo", "#6F86A3", "block-print-denim-jacket-indigo.webp", "Faded indigo denim jacket", "block-print-denim-jacket-look.webp", "Illustrated woman in the denim jacket, olive cargos and a rust scarf")],
    sizes: APPAREL,
    stock: [1, 3, 4, 2, 2],
    details: { fabric: "12 oz cotton denim", fit: "Boxy, cropped at the hip", care: "Wash rarely, cold, inside out", madeIn: "Ahmedabad, India" },
    callouts: [{ x: 0.3, y: 0.3, label: "chest pockets" }],
    createdAt: "2026-10-12",
  },
  {
    handle: "sneaker-saree",
    title: "Sneaker Saree",
    tagline: "Pre-pleated. Platform-ready.",
    description: "An ivory cotton saree with a block-printed rose border and pre-stitched pleats, so it goes on in two minutes and survives a train ride. Made to be worn with sneakers.",
    productType: "Sarees",
    tags: ["new", "commute-edit"],
    price: 3290,
    colours: [one("Ivory Rose", "#EADCC6", "sneaker-saree-ivory.webp", "Ivory saree with rose block-print border", "sneaker-saree-look.webp", "Illustrated woman in the saree and grey sneakers with a coffee on a local train")],
    sizes: ["One size"],
    stock: [7],
    details: { fabric: "Mulmul cotton, block-printed border", fit: "Pre-pleated, 5.5 m with blouse piece", care: "Cold hand wash", madeIn: "Bagru, India" },
    callouts: [{ x: 0.5, y: 0.8, label: "block-print border" }],
    createdAt: "2026-11-21",
    sizeChart: "none",
  },
  {
    handle: "library-skirt",
    title: "Library Maxi Skirt",
    tagline: "Long skirt, longer reading list.",
    description: "A tiered maxi skirt in crinkled maroon cotton with an elastic waist. Easy to sit in, easy to walk in, very easy to be seen in.",
    productType: "Bottoms",
    tags: ["commute-edit", "bottoms"],
    price: 1990,
    colours: [one("Maroon", "#5A1E1E", "library-skirt-maroon.webp", "Maroon tiered maxi skirt", "library-skirt-look.webp", "Illustrated woman in the maroon skirt reading a book on a local train")],
    sizes: APPAREL,
    stock: [3, 6, 6, 4, 2],
    details: { fabric: "Crinkled cotton", fit: "Elastic waist, ankle length", care: "Machine wash cold, do not iron the crinkles", madeIn: "Jaipur, India" },
    callouts: [{ x: 0.5, y: 0.6, label: "crinkle cotton" }],
    createdAt: "2026-11-08",
  },
  {
    handle: "platform-kurta",
    title: "Platform Kurta",
    tagline: "Leans on poles. Looks good doing it.",
    description: "A long straight kurta in washed blue cotton with a V-neck and side slits. Wear it over wide white pants and sneakers.",
    productType: "Tops",
    tags: ["commute-edit", "tops"],
    price: 1690,
    colours: [one("Washed Blue", "#7D93AE", "platform-kurta-blue.webp", "Washed blue long kurta", "platform-kurta-look.webp", "Illustrated woman in the blue kurta leaning on a train pole")],
    sizes: APPAREL,
    stock: [6, 10, 12, 8, 5],
    details: { fabric: "Washed cotton", fit: "Relaxed, knee length", care: "Machine wash cold", madeIn: "Tiruppur, India" },
    callouts: [{ x: 0.45, y: 0.2, label: "V-neck" }],
    createdAt: "2026-11-05",
  },
  {
    handle: "jamun-kurta",
    title: "Jamun Kurta",
    tagline: "Deep purple. Zero subtlety.",
    description: "A jamun-purple kurta with gold thread embroidery at the neck and cuffs. Polished enough for office, extra enough for after.",
    productType: "Tops",
    tags: ["tops", "sale"],
    price: 1890,
    compareAt: 2390,
    colours: [one("Jamun", "#3B2A55", "jamun-kurta-purple.webp", "Purple kurta with gold embroidery", "jamun-kurta-look.webp", "Illustrated woman in the purple kurta scrolling her phone on a local train")],
    sizes: APPAREL,
    stock: [2, 0, 3, 2, 1],
    details: { fabric: "Cotton silk, zari embroidery", fit: "Straight, calf length", care: "Dry clean recommended", madeIn: "Lucknow, India" },
    callouts: [{ x: 0.6, y: 0.3, label: "zari neckline" }],
    createdAt: "2026-09-30",
  },
  {
    handle: "commute-co-ord",
    title: "Commute Co-ord",
    tagline: "Stripe it. Match it. Catch the train.",
    description: "A relaxed shirt and straight pant set in cream and brown stripes. Wear together for the full look, or split them up across the week.",
    productType: "Sets",
    tags: ["commute-edit", "sets"],
    price: 3290,
    colours: [one("Cream Stripe", "#D9C2A0", "commute-co-ord-stripe.webp", "Cream and brown striped shirt and pant co-ord", "commute-co-ord-look.webp", "Illustrated woman in the striped co-ord seated on a local train")],
    sizes: APPAREL,
    stock: [2, 4, 4, 3, 2],
    details: { fabric: "Cotton-linen blend", fit: "Relaxed shirt, straight pant", care: "Machine wash cold", madeIn: "Jaipur, India" },
    callouts: [{ x: 0.5, y: 0.25, label: "camp collar" }],
    createdAt: "2026-11-08",
  },
  {
    handle: "jhumka-hoops",
    title: "Jhumka Hoops",
    tagline: "Hoops that went to a shaadi.",
    description: "Brass hoops with a hand-finished jhumka bell. Light enough for all day, loud enough for all night.",
    productType: "Accessories",
    tags: ["new", "accessories", "desi-baddie"],
    price: 690,
    colours: [one("Brass", "#B59A6D", "jhumka-hoops-brass.webp", "Brass jhumka hoop earrings, worn", "jhumka-hoops-look.webp", "Illustrated woman laughing in brass hoop earrings")],
    sizes: ["One size"],
    stock: [14],
    details: { fabric: "Brass, nickel-free, anti-tarnish coat", fit: "60 mm hoop, 18 g per earring", care: "Keep dry, store in the pouch", madeIn: "Moradabad, India" },
    callouts: [],
    createdAt: "2026-11-19",
    sizeChart: "none",
  },
  {
    handle: "gully-sling",
    title: "Gully Sling Bag",
    tagline: "Small bag. Big plans.",
    description: "A compact black crossbody with a brass clasp and adjustable strap. Fits phone, keys, lip tint and train pass.",
    productType: "Accessories",
    tags: ["accessories"],
    price: 1290,
    colours: [one("Black", "#1C120F", "gully-sling-black.webp", "Black crossbody sling bag with brass clasp, worn", "gully-sling-look.webp", "Illustrated woman wearing the sling bag with a halter and cargos")],
    sizes: ["One size"],
    stock: [9],
    details: { fabric: "Vegan leather, brass hardware", fit: "20 × 14 × 6 cm, strap 110–130 cm", care: "Wipe clean", madeIn: "Kanpur, India" },
    callouts: [],
    createdAt: "2026-10-20",
    sizeChart: "none",
  },
  {
    handle: "bangle-stack",
    title: "Bangle Stack",
    tagline: "Twelve bangles. Zero chill.",
    description: "A stack of twelve brass and glass bangles. Pre-mixed by us, worn your way, ideally while holding chai.",
    productType: "Accessories",
    tags: ["accessories", "chai"],
    price: 490,
    colours: [one("Brass Mix", "#C89B3C", "bangle-stack-marigold.webp", "Stack of brass bangles on a wrist holding chai", "bangle-stack-look.webp", "Illustrated wrists with bangle stacks at the chai counter")],
    sizes: ["2.4", "2.6", "2.8"],
    stock: [6, 8, 0],
    details: { fabric: "Brass and glass", fit: "Bangle sizes 2.4 / 2.6 / 2.8 (inner diameter 5.7 / 6.0 / 6.4 cm)", care: "Handle gently, glass", madeIn: "Firozabad, India" },
    callouts: [],
    createdAt: "2026-11-01",
    sizeChart: "none",
  },
];

export const demoProducts: Product[] = seeds.map(build);

export const demoCollections: Collection[] = [
  { handle: "new-arrivals", title: "New Arrivals", description: "Fresh off the stove. The latest drop, still steaming.", note: "garam garam!" },
  { handle: "desi-baddie", title: "The Desi Baddie Edit", description: "Halters, corsets, bandhani and brass. For when the poster is you.", note: "poster girl energy" },
  { handle: "commute-edit", title: "The Commute Edit", description: "Built for the local, the metro and the auto. Comfortable, quick, still a look.", note: "next stop: you" },
  { handle: "accessories", title: "Accessories", description: "Hoops, bangles and bags from the corner cart. The little extra.", note: "thoda aur? always." },
  { handle: "tops", title: "Tops", description: "Halters, shirts, corsets and tees.", note: "upar se ekdum set" },
  { handle: "bottoms", title: "Bottoms", description: "Palazzos, cargos and wrap skirts.", note: "neeche bhi dhyaan do" },
  { handle: "sale", title: "Sale", description: "A little extra, for a little less.", note: "bhaav-taav done" },
];
