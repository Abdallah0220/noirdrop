# NOIRDROP

A dark, neon, single-page **drop-store template**. One hero with a live 3D
centerpiece, a countdown, a tight product grid, a bag drawer — nothing else,
because a drop doesn't need anything else.

**Live demo:** https://abdallah0220.github.io/noirdrop/

## What's inside

- `index.html` — the whole page (hero, marquee, drop grid, "feel it" section, about, footer, bag drawer)
- `css/style.css` — the full theme (colors and fonts are CSS variables at the top)
- `js/products.js` — **the demo catalog: edit this file to sell your own pieces**
- `js/main.js` — grid, bag drawer (localStorage), countdown, marquee, scroll reveals
- `js/hero3d.js` — the Three.js hero (loads from CDN, removes itself if WebGL is unavailable)

No build step. No dependencies to install. Host it anywhere static files go.

## Buyer setup (5 minutes)

1. **Your products** — edit the array in `js/products.js`: `id`, `name`, `cat`, `price`, `tag`, `image`.
2. **Your drop date** — edit `DROP_DATE` at the top of `js/main.js`.
3. **Your colors** — edit `--red` / `--cyan` / `--bg` at the top of `css/style.css`.
4. **Your name** — search-replace `NOIRDROP` in `index.html` (nav, footer) and the marquee phrases in `js/main.js`.
5. Deploy the folder to GitHub Pages, Netlify, Cloudflare Pages, or any static host.

See **DOCUMENTATION.md** for the full buyer guide.

## Notes

- The 3D hero uses Three.js `0.160.0` from the jsDelivr CDN via an import map.
  If the CDN or WebGL fails, the script removes its canvas and the hero's
  gradient remains — the page never breaks.
- The bag is a front-end demo: it persists in `localStorage` and the checkout
  button shows a demo notice. It places no real orders.
- Demo photos are Unsplash sample images; replace them with your own product shots.
- Honors `prefers-reduced-motion`.

## Honest limits

- This is a **template with demo data**, not a store with a backend. Payments,
  inventory and orders are yours to wire (or ask about our full-store template
  with a real backend).
- No tracking, no cookies, no accounts.
