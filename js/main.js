// Noirdrop — products grid, bag drawer, countdown, marquee, reveal,
// plus the animation layer: card tilt, magnetic CTAs, nav state,
// scroll progress and countdown tick.
import { PRODUCTS } from "./products.js";

// BUYER SETUP: when the drop closes (countdown target).
const DROP_DATE = new Date("2026-12-05T20:00:00");

const money = (n) => "$" + n.toFixed(0);

const finePointer = matchMedia("(pointer: fine)").matches;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- products grid ---------- */
const grid = document.getElementById("productGrid");
const bag = new Map(JSON.parse(localStorage.getItem("noirdrop-bag") || "[]"));

function saveBag() {
  localStorage.setItem("noirdrop-bag", JSON.stringify([...bag]));
}

/* pointer-tilt on cards (desktop only): CSS vars drive the 3D lean + glare */
function attachTilt(card) {
  if (!finePointer || reducedMotion) return;
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    card.style.setProperty("--ry", (px * 8).toFixed(2) + "deg");
    card.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
    card.style.setProperty("--mx", ((px + 0.5) * 100).toFixed(1) + "%");
    card.style.setProperty("--my", ((py + 0.5) * 100).toFixed(1) + "%");
  });
  card.addEventListener("pointerleave", () => {
    card.style.setProperty("--rx", "0deg");
    card.style.setProperty("--ry", "0deg");
  });
}

function renderGrid() {
  grid.innerHTML = "";
  for (const p of PRODUCTS) {
    const inBag = bag.has(p.id);
    const card = document.createElement("article");
    card.className = "card reveal";
    card.innerHTML = `
      <span class="card-tag">${p.tag}</span>
      <div class="card-img"><img src="${p.image}" alt="${p.name}" loading="lazy" /></div>
      <div class="card-body">
        <div>
          <p class="card-name">${p.name}</p>
          <p class="card-cat">${p.cat}</p>
        </div>
        <div class="card-right">
          <p class="card-price">${money(p.price)}</p>
          <button class="add-btn ${inBag ? "in-bag" : ""}" data-id="${p.id}">
            ${inBag ? "IN BAG" : "ADD +"}
          </button>
        </div>
      </div>`;
    grid.appendChild(card);
    attachTilt(card);
  }
  grid.querySelectorAll(".add-btn").forEach((b) =>
    b.addEventListener("click", () => toggleBag(b.dataset.id))
  );
  observeReveals();
}

function toggleBag(id) {
  if (bag.has(id)) bag.delete(id);
  else {
    bag.set(id, 1);
    const p = PRODUCTS.find((x) => x.id === id);
    toast(`${p.name} added to your bag`);
  }
  saveBag();
  renderGrid();
  renderCart();
}

/* ---------- cart drawer ---------- */
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("cartOverlay");
const cartBtn = document.getElementById("cartBtn");
const cartCount = document.getElementById("cartCount");

function openCart() {
  drawer.hidden = false;
  overlay.hidden = false;
}
function closeCart() {
  drawer.hidden = true;
  overlay.hidden = true;
}
cartBtn.addEventListener("click", openCart);
overlay.addEventListener("click", closeCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

function renderCart() {
  const items = document.getElementById("cartItems");
  const total = [...bag].reduce((s, [id, q]) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return s + (p ? p.price * q : 0);
  }, 0);
  const count = [...bag.values()].reduce((a, b) => a + b, 0);
  cartCount.hidden = count === 0;
  cartCount.textContent = count;
  document.getElementById("cartTotal").textContent = money(total);

  if (bag.size === 0) {
    items.innerHTML = `<p class="cart-empty">Your bag is empty.<br/>The drop won't wait.</p>`;
    return;
  }
  items.innerHTML = "";
  for (const [id, q] of bag) {
    const p = PRODUCTS.find((x) => x.id === id);
    if (!p) continue;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div>
        <p class="ci-name">${p.name}</p>
        <p class="ci-price">${money(p.price)}</p>
      </div>
      <div class="qty">
        <button data-id="${id}" data-d="-1" aria-label="One less">−</button>
        <span>${q}</span>
        <button data-id="${id}" data-d="1" aria-label="One more">+</button>
      </div>`;
    items.appendChild(row);
  }
  items.querySelectorAll(".qty button").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.id;
      const next = (bag.get(id) || 0) + Number(b.dataset.d);
      if (next <= 0) bag.delete(id);
      else bag.set(id, next);
      saveBag();
      renderGrid();
      renderCart();
    })
  );
}

document.getElementById("checkoutBtn").addEventListener("click", () => {
  toast("Demo store — checkout places no real order.");
});

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 2200);
}

/* ---------- countdown (digits tick when they change) ---------- */
function setDigit(id, val) {
  const el = document.getElementById(id);
  if (el.textContent !== val) {
    el.textContent = val;
    if (!reducedMotion) {
      el.classList.remove("tick");
      void el.offsetWidth;
      el.classList.add("tick");
    }
  }
}
function tick() {
  const diff = Math.max(0, DROP_DATE - Date.now());
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  setDigit("cdD", String(d).padStart(2, "0"));
  setDigit("cdH", String(h).padStart(2, "0"));
  setDigit("cdM", String(m).padStart(2, "0"));
  setDigit("cdS", String(s).padStart(2, "0"));
}
tick();
setInterval(tick, 1000);

/* ---------- marquee ---------- */
const track = document.getElementById("marqueeTrack");
const phrase = ["NOIRDROP", "DROP 03 — NEON DISTRICT", "LIMITED RUN", "NO RESTOCK"];
track.innerHTML = Array(4).fill(phrase.map((w) => `<span>${w} ✦</span>`).join("")).join("");

/* ---------- nav state + scroll progress ---------- */
const nav = document.querySelector(".nav");
const scrollBar = document.getElementById("scrollBar");
function onPageScroll() {
  nav.classList.toggle("scrolled", scrollY > 24);
  if (scrollBar) {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollBar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  }
}
addEventListener("scroll", onPageScroll, { passive: true });
onPageScroll();

/* ---------- magnetic hero CTAs (desktop only) ---------- */
if (finePointer && !reducedMotion) {
  document.querySelectorAll(".hero-ctas .btn").forEach((btn) => {
    btn.addEventListener("pointermove", (e) => {
      const r = btn.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      btn.style.transform = `translate(${(dx * 0.16).toFixed(1)}px, ${(dy * 0.26).toFixed(1)}px)`;
    });
    btn.addEventListener("pointerleave", () => {
      btn.style.transform = "";
    });
  });
}

/* ---------- reveal on scroll ---------- */
function observeReveals() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in")),
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal:not(.in)").forEach((el) => io.observe(el));
}

renderGrid();
renderCart();
observeReveals();
