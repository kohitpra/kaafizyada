# KAAFIZYADA web

Headless storefront for KAAFIZYADA, *Desi with a little extra.* Next.js 16 (App Router) · React 19 · GSAP + Lenis · WebGL hero shader · three.js (one lazy-loaded 3D moment) · Shopify Storefront API (optional).

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Modes

| Mode | When | Cart | Checkout |
|---|---|---|---|
| **demo** (default) | no Shopify env vars | kept in the browser (`localStorage`) | disabled, with a visible "Demo store" note. Nothing can be charged. |
| **shopify** | `SHOPIFY_STORE_DOMAIN` + `SHOPIFY_STOREFRONT_ACCESS_TOKEN` set (see `.env.example`) | Shopify cart via server actions | Shopify hosted checkout (`cart.checkoutUrl`) |

The Shopify adapter (`lib/commerce/shopify.ts`) is written against the Storefront API but **has not been run against a live store yet**. Brand fields (tagline, fabric, fit, care, made-in, callouts, swatches) come from `custom.*` product metafields; the file header lists them.

## What is demo content

- **Catalogue:** `lib/commerce/demo-data.ts`. 15 invented products with prices, stock and copy.
- **Home-page art:** generated in ChatGPT in the brand palette, originals in `../art/generated`. `node scripts/prep-gate.mjs` builds the entrance-gate textures (`public/assets/gate`), `node scripts/prep-home.mjs` the gully corners and story panels (`public/assets/home`).
- **Still interim (to replace later):** product images and the illustrations on inner pages (`public/assets/products`, `public/assets/illustrations`, used by product, story and collection pages) are cut from the client's example illustrations.
- **Policies, size chart, contact email:** `app/pages/[slug]/page.tsx`, `components/commerce/SizeGuide.tsx`.
- **Newsletter:** `app/api/newsletter/route.ts` validates but does not store emails yet.
- **Instagram link** in `content/copy.ts` points to instagram.com until the handle is known.

## Where things live

```
app/                       routes: / · /shop · /collections/[handle] · /products/[handle] · /search · /story · /pages/[slug]
content/copy.ts            all marketing copy (edit words here)
components/scenes/         gate/ (3D entrance, React Three Fiber) · AutoHero (WebGL colour reveal) · heroScenes.ts · revealShader.ts · ChaiGlass3D
components/sections/       PopTicker · EveryCorner (Digital Gully) · OnTheRamp · ShopGrid · HiiWeAre · Faq · JoinTheGang
components/commerce/       CartProvider · CartDrawer · ProductCard · ProductView · FilterBar · SizeGuide
components/layout/         Header · Footer (+ swinging signboard) · SmoothScroll
lib/commerce/              types · demo provider · Shopify provider · filters
public/assets/             brand/ illustrations/ products/ textures/
scripts/                   trace-logo.mjs · process-assets.mjs · art-prompts.mjs (brief for every generated image)
```

## The entrance gate

The home page opens on a 3D haveli doorway (`components/scenes/gate`, once per browser session). Hover the doors and the ink drawing paints itself in; click, tap, scroll or press the button and the doors swing open and the camera walks through into the gully hero. Skipped for reduced motion, missing WebGL2, deep links, and after 12 s on a slow connection. Interaction adapted from ITom's portfolio (MIT, see `THIRD_PARTY_NOTICES.md`).

## The colour reveal

- **Hero** (`components/scenes`): one full-screen WebGL2 quad. The B&W look is computed from the colour art in the shader (one file per scene, so ink and colour always match). Colour arrives by scroll (a wave from the signboard plus regions that paint in one by one) and by a cursor or finger "lantern" trail. Region rectangles and the signboard position live in `heroScenes.ts`, in image coordinates.
- **Everywhere else:** `components/ui/RevealImage.tsx`, a CSS mask that floods colour out from the cursor on hover, or when the image reaches the centre on touch screens.
- **Reduced motion / no WebGL:** static colour illustration, no pinning, no smooth scroll.

## Adding art

1. Generate or commission the image (prompts in `scripts/art-prompts.mjs`; style references in `../references/illustrations`).
2. `node scripts/process-assets.mjs <source> <dest under public/assets>`, for example `illustrations/auto-ride.webp`.
3. For a new hero scene, update `heroScenes.ts` (focus point, regions, signboard rectangle).
