# KAAFIZYADA — Design System (Stage 2)

> **"An old Indian illustrated street meets a contemporary fashion magazine."**
> Colour is earned: the world starts in pencil and ink, and KAAFIZYADA brings the colour.

---

## 1. Principles

1. **Ink first, colour second.** Every illustrated surface has a monochrome state. Colour arrives through scroll, cursor or touch, and always means "this is KAAFIZYADA".
2. **Paper, not screens.** Cream paper grain, torn edges, tape, stickers, hand-drawn arrows. No glassmorphism, no glossy gradients, no neon glows.
3. **One loud thing per screen.** Each section picks *one* accent colour from the palette on top of the cherry/cream base. Never all twelve at once.
4. **Shopping is calm.** Inside product grids, PDPs and the cart, the illustration steps back: clean type, straight edges, clear prices, big tap targets.
5. **Motion with a reason.** Every animation tells part of the story (a reveal, a ride, a peel) or gives feedback (added to bag). Nothing loops just to look busy.

---

## 2. Colour tokens

### Base

| Token | Hex | Use |
|---|---|---|
| `--cherry` | `#750505` | Identity colour: logo, hero climax, primary buttons, footer |
| `--cherry-deep` | `#4E0303` | Pressed states, deep backgrounds |
| `--cream` | `#FBFCEB` | Page background, breathing space |
| `--paper` | `#F3EEDB` | Cards, secondary surfaces (slightly warmer than cream) |
| `--ink` | `#1C120F` | Body text, black header (a warm black, never `#000`) |
| `--ink-soft` | `#4A3A33` | Secondary text |
| `--pencil` | `#8C847A` | Hairlines, disabled, monochrome UI accents |

### Palette accents (from the client moodboard)

| Token | Hex | Role |
|---|---|---|
| `--jaipur-pink` | `#DC4B7F` | Announcement bar, playful links |
| `--marigold-pink` | `#E50A5D` | Hot accents, "new" stickers, sale |
| `--marigold` | `#F38C02` | Ticker band, warmth |
| `--turmeric` | `#FFC50C` | Highlighter strokes, badges |
| `--chilli` | `#C31807` | Error, urgency (sparingly) |
| `--blockprint-blue` | `#1F4A75` | Contrast sections (FAQ), links on cream |
| `--turquoise` | `#24C8B9` | Rare pop (success, "in stock" dot) |
| `--brass` | `#B59A6D` | Rules, ornaments, muted metallic |
| `--anise` | `#4C3622` | Grounding text on paper |
| `--carved-wood` | `#4E3828` | Footer depths |
| `--cinnamon` | `#A36B4A` | Warm neutrals |
| `--clove` | `#35211C` | Darkest brown |

### Section colour map (one accent each)

| Section | Ground | Accent |
|---|---|---|
| Announcement bar | `--jaipur-pink` | cream text |
| Header | `--ink` | `--jaipur-pink` links, cream logo |
| 1 Auto hero | monochrome → full illustration | `--cherry` climax |
| 2 Pop ticker | `--marigold` band, `--ink` text | cherry stars |
| 3 Every corner has a look | `--cream` | the illustrations carry the colour |
| 4 On the ramp | `--cherry` | cream type, turmeric stickers |
| 5 Abhi ka maal | `--cream` | `--marigold-pink` "new" stickers |
| 6 Hii, we're KAAFIZYADA | `--paper` | `--blockprint-blue` doodles |
| 7 FAQ | `--blockprint-blue` | cream, turmeric highlight |
| 8 Join the gang | `--jaipur-pink` | ink |
| 9 Footer | `--cherry` | cream, brass rules |

**Contrast checks:** cherry on cream ≈ 11.4:1 · ink on cream ≈ 17.7:1 · cream on blockprint-blue ≈ 8.8:1 · ink on marigold ≈ 7.5:1 · pink links on ink header ≈ 4.7:1 (AA) · cream on jaipur-pink ≈ 3.8:1 (**large text / bold UI only**; small copy on pink uses ink, 4.7:1) · cream on marigold-pink ≈ 4.5:1 (AA).

---

## 3. Typography

All fonts are free and open-licence (SIL OFL), served through `next/font` (self-hosted, no layout shift).

| Role | Font | Notes |
|---|---|---|
| **Poster / display** | **Anton** | Condensed, loud. Hero lines, ticker, section titles. Always uppercase, tight leading (0.9). |
| **Editorial serif** | **Gloock** | High-contrast serif for the "magazine" voice: pull quotes, product names on PDP, big numbers. |
| **Hand-lettering** | **Kalam** | Indian hand-script with **Devanagari** support. Doodles, sticker notes, arrows' labels, Hinglish asides (देसी). Use at ≤ 2 places per screen. |
| **UI / body** | **Instrument Sans** | Navigation, product info, prices, forms, checkout. 16 px minimum body. |

### Scale (fluid, `clamp`)

| Token | Size | Use |
|---|---|---|
| `--fs-mega` | clamp(3.5rem, 11vw, 11rem) | Hero lines |
| `--fs-1` | clamp(2.6rem, 6vw, 5.5rem) | Section titles |
| `--fs-2` | clamp(1.8rem, 3.4vw, 3rem) | Sub-titles, PDP name |
| `--fs-3` | clamp(1.25rem, 2vw, 1.6rem) | Card titles, lead copy |
| `--fs-body` | 1rem (16 px) / 1.0625rem desktop | Body |
| `--fs-small` | 0.875rem | Meta, labels |
| `--fs-micro` | 0.75rem, +0.08em tracking, uppercase | Tags, legal |

### Copy voice
Short, confident, Hinglish where it's natural ("Abhi ka maal", "Kuch poochna hai?"). Brand line: **Desi with a little extra.** All copy lives in `content/copy.ts` so the client can edit it without touching components.

---

## 4. Illustration rules

**House style** = the four supplied illustrations:
- Sepia/black ink outline, slightly imperfect, visible pen pressure.
- Cross-hatching and scratchy shading; gouache/marker fills, warm vintage grade.
- **Faceless figures** (skin-tone face shape, no features), the brand's signature. Keeps the focus on clothes and attitude.
- Contemporary outfits: halters, wide-leg pants, cargos, denim, sarees with sneakers, oversized shirts, statement brass jewellery, hoops, bangles, boots.
- Indian everyday settings: gullies, local trains, chai tapris, fruit carts, wires, balconies, painted signboards.
- Cherry-red torn-paper border allowed on framed artworks.

**Never:** cute/chibi faces, glossy 3D characters, vector-flat corporate people, random mandalas/paisleys used as wallpaper, real brand logos (no Coca-Cola; cans are unbranded).

**Monochrome state:** derived in-browser from the colour artwork (luma + slight warm paper tint + contrast lift). One source file per scene, so the B&W and colour versions always match.

**Product imagery:** for this demo, garments are illustrated in the same ink style on a plain paper ground, centred, with nothing hiding the garment. Two views per product (garment + worn look). Real photography replaces these later through the CMS/Shopify with no code change.

---

## 5. Graphic vocabulary (reusable components)

| Element | Description |
|---|---|
| **Sticker** | Rotated (−6°…6°) label, die-cut white edge, slight shadow; colours from accent list |
| **Tape** | Semi-transparent beige strip, torn ends: pins cards and posters |
| **Hand arrow** | SVG wobbly arrow + Kalam label ("chai pe chalo →"), draws itself on view |
| **Torn edge** | SVG mask for section joins (paper tear between sections) |
| **Signboard** | Painted board with screws, used for gully labels and the footer sign-off |
| **Paper grain** | One fixed full-screen noise overlay (`mix-blend-mode: multiply`, 6–8 % opacity) |
| **Highlighter** | Turmeric marker swipe behind a word (animated `scaleX`) |

---

## 6. Buttons & controls

| Variant | Look |
|---|---|
| **Primary** | Cherry fill, cream Instrument Sans 600 uppercase, 2 px ink border, hard 3 px offset ink shadow (poster print feel); hover: shadow grows to 5 px, button lifts 2 px; active: shadow 0 |
| **Secondary** | Transparent, 2 px ink border, ink text; hover: turmeric fill |
| **Ghost/link** | Underline drawn with a hand-wobble SVG on hover |
| **Size chips** | 44×44 min, ink border; selected = ink fill, cream text; sold out = pencil diagonal strike |
| **Colour swatches** | 28 px circles, 2 px ring on select |
| **Focus** | 3 px turmeric outline + 2 px ink offset: visible on every background |

Radius: `0` for posters and buttons (print feel), `2px` for inputs, `999px` only for swatches and pills.

---

## 7. Navigation

- **Announcement bar** (jaipur pink): rotating short promises; dismissible.
- **Header** (ink black): monogram + KAAFIZYADA wordmark on the left · links in pink (Shop, New, Accessories, Story) · search icon + bag count on the right. Becomes compact on scroll-down, returns on scroll-up. **Always** reachable during the hero.
- **Mobile:** burger opens a full-height cream sheet styled like a gully map (links as signboards), with search at top.
- **Skip links:** "Skip to content" and, on the homepage, "Skip the ride, go shopping".

---

## 8. Motion principles

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.22,1,.36,1)` | Entrances |
| `--ease-in-out` | `cubic-bezier(.65,0,.35,1)` | Scene transitions |
| `--ease-snap` | `cubic-bezier(.34,1.56,.64,1)` | Stickers popping in |
| `--dur-1` | 160 ms | Hover feedback |
| `--dur-2` | 320 ms | UI transitions, drawers |
| `--dur-3` | 700 ms | Reveals |

- **Scroll choreography:** GSAP ScrollTrigger with `scrub` (0.6–1 s smoothing); Lenis smooth scroll on desktop only; native scroll on touch.
- **The reveal:** noise-edged colour mask (hero: WebGL shader; elsewhere: CSS mask following the pointer). Hover = local reveal that fades back after ~0.8 s.
- **Allowed loops:** chai steam, wire sway, ticker band. All pause when off-screen.
- **Cleanup:** every component uses `useGSAP` / `gsap.context()` and reverts on unmount.
- **Reduced motion:** no smooth scroll, no pinning, no lantern; illustrations shown in colour after a single 400 ms fade; ticker becomes static.

---

## 9. Responsive rules

| Breakpoint | Width | Behaviour |
|---|---|---|
| `sm` | < 640 | Portrait artwork crops; gully = vertical stack of swipeable corners; 2-column product grid |
| `md` | 640–1023 | Tablet: gully as horizontal swipe; 3-column grid |
| `lg` | ≥ 1024 | Pinned horizontal gully; 4-column grid; cursor lantern |
| `xl` | ≥ 1440 | Max content width 1440 px; illustrations stay full-bleed |

Touch devices: finger-drag = lantern, tap = hold colour; no hover-only information (labels always visible on touch).
Side gutter: 16 px mobile, 24 px tablet, 40 px desktop.

---

## 10. Accessibility

- All text is HTML, never baked into images or canvas.
- Every illustration has meaningful `alt`; purely decorative doodles use `alt=""` / `aria-hidden`.
- Hotspots are `<a>` elements with visible labels, reachable by keyboard; focus also triggers the colour reveal.
- WCAG AA contrast minimum; cart drawer and mobile menu trap focus and close on `Esc`.
- The site works with JavaScript animations disabled; GSAP only adds polish.
