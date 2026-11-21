# NOIRDROP — Documentation

Everything a buyer needs to customize and deploy the template. No build tools,
no framework, no backend required.

---

## 1. File map

```
noirdrop/
├── index.html          # the whole page, section by section
├── css/
│   └── style.css       # theme: variables at the top, then per-section styles
├── js/
│   ├── products.js     # demo catalog (export const PRODUCTS = [...])
│   ├── main.js         # grid render, bag, countdown, marquee, reveals
│   └── hero3d.js       # Three.js hero scene (self-removing on failure)
├── .nojekyll           # keeps GitHub Pages from processing the files
└── README.md
```

## 2. Products

`js/products.js` exports one array. One entry per piece:

```js
{
  id: "shadow-hoodie",        // unique string, used by the bag
  name: "Shadow Oversized Hoodie",
  cat: "420gsm heavyweight fleece",  // small line under the name
  price: 120,                 // number, no currency symbol
  tag: "01 / FLEECE",         // corner badge; use "" for none
  image: "https://…/hoodie.jpg"      // square-ish image works best
}
```

Add, remove, reorder — the grid and the bag all read from this array.

**Currency:** prices render through `money()` at the top of `js/main.js`,
which currently prepends `$`. Change that one function to change the currency
display everywhere (grid, bag, subtotal).

## 3. Drop date

Top of `js/main.js`:

```js
const DROP_DATE = new Date("2026-12-05T20:00:00");
```

Parsed as the visitor's local time. To pin a timezone, append an offset:
`new Date("2026-12-05T20:00:00+02:00")`. When the date passes, the countdown
holds at zero — swap in a new date before each drop.

## 4. Theme

Top of `css/style.css`:

```css
:root {
  --bg: #0a0a0e;        /* page background */
  --panel: #101017;     /* cards and drawer */
  --line: #1d1d28;      /* hairline borders */
  --text: #f2f2ef;
  --muted: #8a8a96;
  --red: #ff2d2d;       /* primary neon */
  --cyan: #00e5ff;      /* secondary neon */
  --display: "Anton", Impact, sans-serif;
  --body: "Space Grotesk", system-ui, sans-serif;
}
```

Both neons drive glows, borders, the countdown and prices across the page —
change them once and the page follows. The 3D hero has its own light colors at
the top of `js/hero3d.js` (`0xff2d2d` / `0x00e5ff`); update those too if you
retheme.

Fonts: **Anton** (display) + **Space Grotesk** (body), loaded from Google
Fonts in `index.html`. Swap the `<link>` and the two variables above to change.

## 5. Copy

- **Brand name** — search-replace `NOIRDROP` in `index.html` (nav, footer).
- **Marquee phrases** — the `phrase` array in `js/main.js`.
- **"Feel it" section** — the `#feel` block in `index.html`: heading, copy,
  the three spec numbers, and the look image.
- **About strip** — `#about` in `index.html`.
- **Demo notices** — search for the word "Demo" in `index.html` and
  `js/main.js` to find every notice; delete or reword for a real store.

## 6. The 3D hero

- Loads Three.js from jsDelivr via an import map in `index.html`. No npm.
- If the import fails or WebGL is missing, the script removes its canvas and
  the hero's radial-gradient background remains. Nothing else depends on it.
- To disable it entirely, delete the `<canvas id="hero3d">` line and the
  `<script type="module" src="js/hero3d.js">` line in `index.html`.
- The knot, wireframe shell, shards and light intensities are all plain values
  in `js/hero3d.js` if you want a different centerpiece.

## 7. The bag

- Persists in `localStorage` under the key `noirdrop-bag`.
- Quantities, removal, subtotal — all client-side.
- The checkout button shows a demo toast. To make it real, point it at your
  payment link (Stripe Payment Link, Shopify Buy Button, Lemon Squeezy, …):

```js
// in js/main.js, inside the checkoutBtn click handler:
location.href = "https://buy.stripe.com/your-link";
```

## 8. Deploy

Any static host works. For GitHub Pages:

```bash
git init && git add -A && git commit -m "noirdrop"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
# Settings → Pages → Deploy from branch → main / root
```

The included `.nojekyll` file keeps GitHub Pages from processing the files.
Or drag the folder onto Netlify / Cloudflare Pages. There is nothing to build.

## 9. Honest limits

- Demo catalog, demo prices, demo bag. Nothing here charges a card or ships a
  product by itself.
- No admin area, no database, no analytics. A storefront only.
- Sample images are from Unsplash — replace them before commercial use.
