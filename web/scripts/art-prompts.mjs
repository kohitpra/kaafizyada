// Brief for commissioned / generated art to replace the interim crops (scripts/crops.json).
// NOTE: product handles here predate the crop-based demo catalogue; rename files to match lib/commerce/demo-data.ts.
// Art brief for every generated image on the site. Style references: the four client illustrations
// in references/illustrations/. Output file names map 1:1 to paths used in content/copy.ts,
// components/scenes/heroScenes.ts and lib/commerce/demo-data.ts.

export const STYLE =
  "Hand-drawn Indian street illustration in sepia ink, matching the reference images: imperfect pen outlines, cross-hatching, scratchy textured shading, gouache and marker fills, warm vintage colour grade (terracotta, mustard, cherry red, olive, faded teal), vintage Indian comic-book poster feel. Faceless women (smooth skin-tone face shapes, no eyes, nose or mouth), contemporary Gen-Z Indian street fashion. No text, no letters, no logos, no watermark.";

const PRODUCT =
  "Fashion product illustration for an online store: one garment centred on a plain warm cream paper background, front view flat lay, drawn in the same sepia ink style with cross-hatching and gouache fills, the garment clear, complete and accurate, generous margin around it, no model, no props, no text.";

const LOOK = "Full-body fashion illustration, the outfit clearly visible from head to toe, single faceless young Indian woman,";

export const scenes = [
  // ---------- 16:9 ----------
  { file: "illustrations/auto-ride.webp", aspect: "16:9", prompt: `Point of view from the back seat of a moving auto-rickshaw driving down a narrow old Mumbai gully. The auto's black canvas canopy edge frames the top of the image; its handlebar, round fare meter and side mirror frame the bottom. Ahead: crumbling balconied buildings, tangled electric wires, a chai tapri with rising steam, hand-painted posters on walls, a fruit cart, two stylish women walking. At the far end of the lane, centred, a small clothes shop with open blue doors and a blank wooden signboard. Slight motion blur at the edges. ${STYLE}` },
  // ---------- 9:16 ----------
  { file: "illustrations/auto-ride-portrait.webp", aspect: "9:16", prompt: `Vertical composition. Point of view from inside a moving auto-rickshaw down a narrow old Mumbai gully: black canopy edge at the top, handlebar and round fare meter at the bottom, tall balconied buildings and tangled wires either side, a chai tapri and a fruit cart, and at the far end of the lane, centred, a small clothes shop with open blue doors and a blank wooden signboard. ${STYLE}` },
  // ---------- 3:4 scenes ----------
  { file: "illustrations/poster-wall.webp", aspect: "3:4", prompt: `${LOOK} confident, in a cherry red halter crop top, ivory wide cargo pants, brass hoops and a bangle stack, posing against an old wall covered in layered, peeling hand-painted vintage film-style posters (abstract shapes and patterns only, no readable text), electric wires above. ${STYLE}` },
  { file: "illustrations/bangle-cart.webp", aspect: "3:4", prompt: `A street-side wooden hand cart piled with glass bangles, brass jhumka earrings, mirror-work bags and marigold garlands; a faceless young Indian woman in an oversized cream shirt and denim tries on a stack of bangles while the elderly cart-wala holds up a small mirror; old gully walls and wires behind. ${STYLE}` },
  { file: "illustrations/story-1.webp", aspect: "3:4", prompt: `Three faceless young Indian women friends laughing at a roadside chai tapri, cutting chai glasses in hand, an elderly chai-wala pouring from a brass kettle, steam rising, a cat asleep on a bench. ${STYLE}` },
  { file: "illustrations/story-2.webp", aspect: "3:4", prompt: `${LOOK} in a bold cherry block-print halter, wide olive pants and brass jewellery, striding confidently through a crowded gully while two aunties on a balcony stare and a street dog watches. ${STYLE}` },
  { file: "illustrations/story-3.webp", aspect: "3:4", prompt: `Close view of an artisan's hands block-printing cherry red paisley onto cream cotton with a carved wooden block, an ink tray and stacks of folded printed fabric in a small workshop. ${STYLE}` },
  // ---------- 3:4 products ----------
  ...[
    ["gully-queen-halter-cherry", "a cropped halter top in cherry red cotton with cream hand block-printed floral motifs, tie-back neck, small brass hook at the hem"],
    ["gully-queen-halter-marigold", "a cropped halter top in marigold orange cotton with cherry red hand block-printed floral motifs, tie-back neck, small brass hook at the hem"],
    ["local-train-palazzo-olive", "floor-length wide-leg palazzo pants in fluid olive green fabric, elastic-back waistband, side pockets"],
    ["chai-break-shirt-cream", "an oversized kurta-style shirt, cream with a cherry red paisley print, mandarin collar, side slits"],
    ["marigold-cargo-ivory", "wide-leg ivory cargo pants with utility pockets and drawstring hems"],
    ["marigold-cargo-olive", "wide-leg olive cargo pants with utility pockets and drawstring hems"],
    ["tapri-corset-top-cherry", "a sweetheart-neck corset top in deep cherry brocade with gold motifs and a brass hook front"],
    ["block-print-denim-jacket-indigo", "a boxy indigo denim jacket with block-printed cotton panels on the yoke and cuffs"],
    ["saree-wrap-skirt-ivory", "a midi wrap skirt in ivory handloom cotton with a woven red border and side ties"],
    ["bandhani-slip-dress-pink", "a bias-cut midi slip dress in rani pink bandhani tie-dye with tiny white dots, thin straps"],
    ["thoda-extra-tee-cream", "an oversized cream t-shirt with a cherry red hand-drawn doodle graphic of chai glass and stars on the chest (no text)"],
    ["thoda-extra-tee-cherry", "an oversized cherry red t-shirt with a cream hand-drawn doodle graphic of chai glass and stars on the chest (no text)"],
    ["commute-co-ord-blue", "a matching relaxed camp-collar shirt and drawstring pants in block-print blue and cream vertical stripes, laid side by side"],
    ["jhumka-hoops-brass", "a pair of large brass hoop earrings, each with a small jhumka bell and tiny ghungroo drops"],
    ["mirror-work-sling-cherry", "a small cherry red canvas sling bag with hand-stitched round mirror-work embroidery, brass clasp and strap"],
    ["bangle-stack-marigold", "a loose stack of twelve bangles in marigold glass, cherry glass and brass"],
  ].map(([h, d]) => ({ file: `products/${h}.webp`, aspect: "3:4", prompt: `${PRODUCT} The item: ${d}. ${STYLE}` })),
  ...[
    ["gully-queen-halter-look", "in a cherry red block-print halter crop top, olive wide-leg pants, gold hoops and bangles, holding the pole of a Mumbai local train"],
    ["local-train-palazzo-look", "in olive wide-leg palazzo pants and a fitted black top, headphones around her neck, at the open door of a local train"],
    ["chai-break-shirt-look", "in an oversized cream shirt with cherry paisley print and matching pants, holding a cutting chai glass at a tapri"],
    ["marigold-cargo-look", "in ivory wide cargo pants, a rust halter top and a small black crossbody bag, walking through an old gully"],
    ["tapri-corset-top-look", "in a cherry brocade corset top, a cream draped wrap skirt and brown cowboy boots, leaning on a chai stall counter"],
    ["block-print-denim-jacket-look", "in a boxy indigo denim jacket with block-print panels, olive cargo pants, a rust scarf and sunglasses on her head"],
    ["saree-wrap-skirt-look", "in an ivory wrap skirt with a red woven border, a black fitted blouse and white sneakers, a printed stole over one shoulder"],
    ["bandhani-slip-dress-look", "in a rani pink bandhani slip dress and brass jewellery, on a rooftop with clotheslines and water tanks"],
    ["thoda-extra-tee-look", "in an oversized cream t-shirt, ripped blue jeans and sneakers, seated in a local train reading a book"],
    ["commute-co-ord-look", "in a blue and cream striped shirt and pant co-ord with kolhapuri sandals, seated in a local train with legs crossed"],
    ["jhumka-hoops-look", "close-up side profile from the shoulders up, wavy hair tucked back, wearing large brass jhumka hoop earrings"],
    ["mirror-work-sling-look", "in an oversized white shirt and wide pants, carrying a small cherry mirror-work sling bag crossbody, walking past a fruit cart"],
    ["bangle-stack-look", "close-up of her hand with mehendi and a stack of marigold, cherry and brass bangles, holding a cutting chai glass"],
  ].map(([h, d]) => ({ file: `products/${h}.webp`, aspect: "3:4", prompt: `${LOOK} ${d}. ${STYLE}` })),
];

if (process.argv[1]?.endsWith("art-prompts.mjs")) {
  console.log(`${scenes.length} images`);
  for (const a of ["16:9", "9:16", "3:4"]) console.log(a, scenes.filter((s) => s.aspect === a).length);
}
