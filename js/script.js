"use strict";

const filterButtons = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".product-card");
const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search-input");
const emptyResults = document.getElementById("empty-results");
const cartButton = document.querySelector(".cart-button");
const cartCount = document.getElementById("cart-count");
const toast = document.getElementById("toast");
const newsletterForm = document.getElementById("newsletter-form");
const cart = new Map();
let activeFilter = "همه";
let toastTimer;

function normalizeText(value) {
  return value
    .normalize("NFKC")
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/[\u200c\s]+/g, " ")
    .trim()
    .toLocaleLowerCase("fa-AF");
}

function updateProducts() {
  const query = normalizeText(searchInput.value);
  let visibleCount = 0;

  productCards.forEach((card) => {
    const categories = card.dataset.category.split(" ");
    const searchableText = normalizeText(
      `${card.dataset.name} ${card.querySelector(".product-category").textContent}`
    );
    const matchesFilter = activeFilter === "همه" || categories.includes(activeFilter);
    const matchesSearch = searchableText.includes(query);
    const visible = matchesFilter && matchesSearch;

    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  emptyResults.hidden = visibleCount > 0;
}

function updateActiveFilter() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
}

function updateCartCount() {
  const itemCount = Array.from(cart.values()).reduce(
    (total, item) => total + item.quantity,
    0
  );
  cartCount.textContent = new Intl.NumberFormat("fa-AF").format(itemCount);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    updateActiveFilter();
    updateProducts();
  });
});

document.querySelectorAll("[data-nav-category]").forEach((link) => {
  link.addEventListener("click", () => {
    activeFilter = link.dataset.navCategory;
    updateActiveFilter();
    updateProducts();
  });
});

searchInput.addEventListener("input", updateProducts);

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest(".add-button");
  if (!addButton) return;

  const card = addButton.closest(".product-card");
  const productName = card.dataset.name;
  const existingItem = cart.get(productName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.set(productName, {
      name: productName,
      price: Number(card.dataset.price),
      quantity: 1
    });
  }

  updateCartCount();
  showToast(`${productName} به سبد خرید اضافه شد.`);
});

cartButton.addEventListener("click", () => {
  if (cart.size === 0) {
    showToast("سبد خرید شما خالی است.");
    return;
  }

  const items = Array.from(cart.values());
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const formattedCount = new Intl.NumberFormat("fa-AF").format(itemCount);
  const formattedTotal = new Intl.NumberFormat("fa-AF").format(total);

  showToast(`سبد خرید: ${formattedCount} قلم، جمع کل ${formattedTotal} افغانی`);
});

newsletterForm.addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("سپاس از عضویت شما در خبرنامهٔ زرین‌دوز.");
  newsletterForm.reset();
});

updateActiveFilter();
updateProducts();
