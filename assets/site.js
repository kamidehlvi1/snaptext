/* Snaptext website — config + behaviour shared by index.html and docs.html */

// ========= EDIT THESE (see PUBLISH.md) =================================================
const CONFIG = {
  GITHUB_USER: "kamidehlvi1",          // your GitHub username (profile + downloads)
  REPO: "snaptext",                    // the repository whose Releases hold the installers
  CONTACT: "alkhairsoft@live.com",     // where licence requests and questions go
  CURRENCY: "USD",
  PRICE_SNAPTEXT: "29",                // one PC, one-time. "" = "Contact us"
  PRICE_RX: "",                        // SnapText Rx, one PC, one-time. "" = "Contact us"
  BUY_SNAPTEXT: "",                    // optional checkout link (Gumroad, Lemon Squeezy...). "" = request form
  BUY_RX: "",
  DONATE: {                            // leave "" to hide a button
    github: "",                        // e.g. "https://github.com/sponsors/kamidehlvi1" once Sponsors is approved
    coffee: "",                        // e.g. "https://www.buymeacoffee.com/yourname"
    kofi: "",                          // e.g. "https://ko-fi.com/yourname"
    paypal: "",                        // e.g. "https://paypal.me/yourname"
  },
};
// =======================================================================================

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const GH = `https://github.com/${CONFIG.GITHUB_USER}`;
const REPO_URL = `${GH}/${CONFIG.REPO}`;
const DL = f => `${REPO_URL}/releases/latest/download/${f}`;
const PRODUCTS = {
  "snaptext": { name: "Snaptext", price: CONFIG.PRICE_SNAPTEXT, buy: CONFIG.BUY_SNAPTEXT },
  "snaptext-rx": { name: "SnapText Rx", price: CONFIG.PRICE_RX, buy: CONFIG.BUY_RX },
};

function toast(msg) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove("on"), 2400);
}

async function copyText(text, what = "Copied") {
  try { await navigator.clipboard.writeText(text); toast(`${what} to the clipboard`); }
  catch { const a = document.createElement("textarea"); a.value = text; document.body.appendChild(a); a.select();
          document.execCommand("copy"); a.remove(); toast(`${what} to the clipboard`); }
}

function money(p) { return p ? `$${p}` : ""; }

// ---- links, prices, profile ------------------------------------------------------------
function wire() {
  $$("[data-dl]").forEach(a => a.href = DL(a.dataset.dl));
  $$("[data-gh]").forEach(a => a.href = a.dataset.gh === "repo" ? REPO_URL
                                     : a.dataset.gh === "releases" ? `${REPO_URL}/releases`
                                     : a.dataset.gh === "issues" ? `${REPO_URL}/issues`
                                     : GH);
  $$("[data-gh-name]").forEach(el => el.textContent = `@${CONFIG.GITHUB_USER}`);
  $$("[data-mail]").forEach(a => { a.href = `mailto:${CONFIG.CONTACT}${a.dataset.mail ? "?subject=" + encodeURIComponent(a.dataset.mail) : ""}`;
                                   if (!a.textContent.trim()) a.textContent = CONFIG.CONTACT; });
  $$("[data-price]").forEach(el => {
    const p = PRODUCTS[el.dataset.price].price;
    el.innerHTML = p ? `${money(p)} <small>one-time, per PC</small>` : `Ask us <small>for a price</small>`;
  });
  $$("[data-buy]").forEach(a => {
    const prod = PRODUCTS[a.dataset.buy];
    if (prod.buy) { a.href = prod.buy; a.target = "_blank"; a.rel = "noopener"; return; }
    a.href = "#licence";
    a.addEventListener("click", () => { const r = $(`input[name=product][value="${a.dataset.buy}"]`); if (r) { r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true })); } });
  });
  $$(".yr").forEach(el => el.textContent = new Date().getFullYear());
  const av = $(".avatar img");
  if (av) { av.src = `${GH}.png?size=220`; av.onerror = () => av.remove(); }
}

// ---- donate ----------------------------------------------------------------------------
function donate() {
  const box = $("#donate-btns");
  if (!box) return;
  const items = [
    ["github", "Sponsor on GitHub", "♥"], ["coffee", "Buy me a coffee", "☕"],
    ["kofi", "Support on Ko-fi", "☕"], ["paypal", "Donate with PayPal", "$"],
  ].filter(([k]) => CONFIG.DONATE[k]);
  for (const [k, label, icon] of items) {
    const a = document.createElement("a");
    a.className = "btn " + (k === "github" ? "dark" : "line"); a.href = CONFIG.DONATE[k]; a.target = "_blank"; a.rel = "noopener";
    a.innerHTML = `<span aria-hidden="true">${icon}</span> ${label}`;
    box.appendChild(a);
  }
  if (!items.length) {
    const a = document.createElement("a");
    a.className = "btn line"; a.href = `mailto:${CONFIG.CONTACT}?subject=${encodeURIComponent("Supporting Snaptext")}`;
    a.innerHTML = `<span aria-hidden="true">♥</span> Email us to support`;
    box.appendChild(a);
  }
}

async function share() {
  const data = { title: "Snaptext — private, offline OCR for Windows", text: "Turn anything on your screen into text, completely offline.", url: location.href.split("#")[0] };
  if (navigator.share) { try { await navigator.share(data); } catch { /* cancelled */ } }
  else copyText(data.url, "Link copied");
}

// ---- licence request -------------------------------------------------------------------
function normaliseId(s) {
  const raw = s.replace(/[^0-9a-z]/gi, "").toUpperCase();
  return /^[0-9A-F]{16}$/.test(raw) ? raw.match(/.{4}/g).join("-") : null;
}

function readIds(text) {
  const seen = new Set(), good = [], bad = [];
  for (const part of text.split(/[\n,;]+/).map(t => t.trim()).filter(Boolean)) {
    const id = normaliseId(part);
    if (!id) bad.push(part);
    else if (!seen.has(id)) { seen.add(id); good.push(id); }
  }
  return { good, bad };
}

function reference() {
  const d = new Date(), abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const rnd = Array.from({ length: 4 }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
  return `ST-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${rnd}`;
}

function licenceForm() {
  const f = $("form.req");
  if (!f) return;
  const ids = $("#ids", f), chips = $("#id-chips", f), quote = $("#quote", f), err = $("#req-err", f);

  function state() {
    const product = $("input[name=product]:checked", f).value, plan = $("#plan", f).value;
    const { good, bad } = readIds(ids.value);
    return { product, plan, good, bad };
  }

  function render() {
    const { product, plan, good, bad } = state();
    chips.innerHTML = good.map(i => `<span class="ok">✓ ${i}</span>`).join("")
                    + bad.map(b => `<span class="no">✗ ${b.replace(/[<>&]/g, "")}</span>`).join("");
    const p = PRODUCTS[product];
    if (plan === "site") quote.innerHTML = `<b>Site licence</b> — we'll reply with a quote for your organisation.`;
    else if (!good.length) quote.innerHTML = `Add at least one Machine ID to see your total.`;
    else if (p.price) quote.innerHTML = `<b>${money(+p.price * good.length)} ${CONFIG.CURRENCY}</b> — ${p.name}, ${good.length} PC${good.length > 1 ? "s" : ""} × ${money(p.price)}, one-time.`;
    else quote.innerHTML = `<b>${p.name}</b>, ${good.length} PC${good.length > 1 ? "s" : ""} — we'll reply with the price.`;
  }

  f.addEventListener("input", render);
  f.addEventListener("change", render);
  render();

  f.addEventListener("submit", e => {
    e.preventDefault();
    const { product, plan, good, bad } = state();
    const name = $("#lname", f).value.trim(), email = $("#lemail", f).value.trim();
    const country = $("#lcountry", f).value.trim(), pay = $("#lpay", f).value, notes = $("#lnotes", f).value.trim();
    const problems = [];
    if (!good.length) problems.push("Add your Machine ID (shown in the app under the licence badge).");
    if (bad.length) problems.push(`Fix ${bad.length} Machine ID${bad.length > 1 ? "s" : ""} marked ✗ — an ID is 16 letters and digits like ABCD-1234-EF56-7890.`);
    if (!name) problems.push("Enter the name the licence is for.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("Enter a valid email address — the licence is sent there.");
    err.textContent = problems.join(" ");
    if (problems.length) return;

    const p = PRODUCTS[product], ref = reference();
    const total = plan === "site" ? "Site licence — quote requested"
                : p.price ? `${money(+p.price * good.length)} ${CONFIG.CURRENCY} (${good.length} × ${money(p.price)})` : "Please send a quote";
    const body = [
      `Licence request ${ref}`, "",
      `Product:        ${p.name}`,
      `Plan:           ${plan === "site" ? "Site licence" : "Single PC licence(s)"}`,
      `Licensed to:    ${name}`,
      `Email:          ${email}`,
      country ? `Country:        ${country}` : null,
      `Payment method: ${pay}`,
      `Amount:         ${total}`, "",
      `Machine ID${good.length > 1 ? "s" : ""} (${good.length}):`,
      ...good.map(i => `  ${i}`),
      notes ? "" : null, notes ? `Notes: ${notes}` : null, "",
      "Please send payment details. I understand the licence file is sent after payment.",
    ].filter(l => l !== null).join("\n");
    const subject = `Licence request ${ref} — ${p.name} — ${good.length} PC${good.length > 1 ? "s" : ""}`;
    const out = $("#req-out");
    $("#req-ref").textContent = ref;
    $("#req-text").textContent = body;
    $("#req-mail").href = `mailto:${CONFIG.CONTACT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $("#req-copy").onclick = () => copyText(`To: ${CONFIG.CONTACT}\nSubject: ${subject}\n\n${body}`, "Request copied");
    $("#req-save").onclick = () => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([`To: ${CONFIG.CONTACT}\r\nSubject: ${subject}\r\n\r\n${body.replace(/\n/g, "\r\n")}`], { type: "text/plain" }));
      a.download = `${ref}-licence-request.txt`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $$(".to-addr").forEach(el => el.textContent = CONFIG.CONTACT);
    out.classList.add("on");
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

// ---- page chrome -----------------------------------------------------------------------
function chrome() {
  const nav = $("nav.top"), menu = $(".menu", nav || document);
  if (menu) {
    menu.addEventListener("click", () => { const o = nav.classList.toggle("open"); menu.setAttribute("aria-expanded", o); });
    $$(".links a", nav).forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
  }
  $$("[data-share]").forEach(b => b.addEventListener("click", share));
  $$("[data-copy]").forEach(b => b.addEventListener("click", () => copyText(b.dataset.copy)));

  const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -8% 0px" }) : null;
  $$(".rv").forEach(el => io ? io.observe(el) : el.classList.add("in"));

  // docs: highlight the section in view
  const toc = $$(".toc a[href^='#']");
  if (toc.length && "IntersectionObserver" in window) {
    const map = new Map(toc.map(a => [a.getAttribute("href").slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { toc.forEach(a => a.classList.remove("on")); map.get(e.target.id)?.classList.add("on"); }
    }), { rootMargin: "-20% 0px -70% 0px" });
    $$(".doc h2[id]").forEach(h => spy.observe(h));
  }
}

/* hero loop: still poster for people who ask for reduced motion */
function heroVideo() {
  const v = $(".hero-video");
  if (v && matchMedia("(prefers-reduced-motion: reduce)").matches) { v.removeAttribute("autoplay"); v.pause(); }
}

document.addEventListener("DOMContentLoaded", () => { wire(); donate(); licenceForm(); chrome(); heroVideo(); });
