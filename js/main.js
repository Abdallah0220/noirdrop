// Noirdrop — products grid, bag drawer, countdown, marquee, reveal.
import { PRODUCTS } from "./products.js";

// BUYER SETUP: when the drop closes (countdown target).
const DROP_DATE = new Date("2026-12-05T20:00:00");

const money = (n) => "$" + n.toFixed(0);

/* ---------- products grid ---------- */
const grid = document.getElementById("productGrid");
const bag = new Map(JSON.parse(localStorage.getItem("noirdrop-bag") || "[]"));

function saveBag() {
  localStorage.setItem("noirdrop-bag", JSON.stringify([...bag]));
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

/* ---------- countdown ---------- */
function tick() {
  const diff = Math.max(0, DROP_DATE - Date.now());
  const d = Math.floor(diff / 864e5);
  const h = Math.floor((diff % 864e5) / 36e5);
  const m = Math.floor((diff % 36e5) / 6e4);
  const s = Math.floor((diff % 6e4) / 1e3);
  document.getElementById("cdD").textContent = String(d).padStart(2, "0");
  document.getElementById("cdH").textContent = String(h).padStart(2, "0");
  document.getElementById("cdM").textContent = String(m).padStart(2, "0");
  document.getElementById("cdS").textContent = String(s).padStart(2, "0");
}
tick();
setInterval(tick, 1000);

/* ---------- marquee ---------- */
const track = document.getElementById("marqueeTrack");
const phrase = ["NOIRDROP", "DROP 03 — NEON DISTRICT", "LIMITED RUN", "NO RESTOCK"];
track.innerHTML = Array(4).fill(phrase.map((w) => `<span>${w} ✦</span>`).join("")).join("");

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
