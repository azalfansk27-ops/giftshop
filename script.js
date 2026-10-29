
const SHOP_WHATSAPP = "919923589198"; // Replace with the shop's number

const products = [
  {
    id: 1,
    name: "The Birthday Box",
    category: "Birthday",
    price: 699,
    tag: "Bestseller",
    image: "photo-1513201099705-a9746e1e201f"
  },
  {
    id: 2,
    name: "Forever Yours",
    category: "Anniversary",
    price: 899,
    tag: "Romantic pick",
    image: "photo-1518895949257-7621c3c786d7"
  },
  {
    id: 3,
    name: "Sweet Treat Hamper",
    category: "Hampers",
    price: 549,
    tag: "Customer favourite",
    image: "photo-1549465220-1a8b9238cd48"
  },
  {
    id: 4,
    name: "Personalised Memories",
    category: "Personalized",
    price: 799,
    tag: "Made for you",
    image: "photo-1513883049090-d0b7439799bf"
  },
  {
    id: 5,
    name: "Blush Gift Set",
    category: "Hampers",
    price: 999,
    tag: "Gift of the day",
    image: "photo-1607344645866-009c320b63e0"
  },
  {
    id: 6,
    name: "A Little Celebration",
    category: "Birthday",
    price: 449,
    tag: "Under ₹500",
    image: "photo-1513475382585-d06e58bcb0e0"
  },
  {
    id: 7,
    name: "Rose & Romance",
    category: "Anniversary",
    price: 649,
    tag: "Lovely choice",
    image: "photo-1490750967868-88aa4486c946"
  },
  {
    id: 8,
    name: "Your Special Note",
    category: "Personalized",
    price: 399,
    tag: "Little surprise",
    image: "photo-1512909006721-3d6018887383"
  }
];

const money = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);

const imageURL = id =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categories = document.getElementById("categories");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotal = document.getElementById("subtotal");
const total = document.getElementById("total");
const emptyState = document.getElementById("emptyState");
const orderForm = document.getElementById("orderForm");
const orderFeedback = document.getElementById("orderFeedback");

let activeCategory = "All";
let cart = {};

try {
  const savedCart = JSON.parse(
    localStorage.getItem("giftify-cart") || "{}"
  );

  if (
    savedCart &&
    typeof savedCart === "object" &&
    !Array.isArray(savedCart)
  ) {
    for (const product of products) {
      const quantity = savedCart[product.id];

      if (
        Number.isSafeInteger(quantity) &&
        quantity > 0 &&
        quantity <= 99
      ) {
        cart[product.id] = quantity;
      }
    }
  }
} catch {
  cart = {};
}

// Display products

function renderProducts() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      `${product.name} ${product.category} ${product.tag}`
        .toLowerCase()
        .includes(query);

    return matchesCategory && matchesSearch;
  });

  productGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${imageURL(product.image)}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.style.visibility='hidden'"
        >
        <span class="product-tag">${product.tag}</span>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>

        <div class="product-bottom">
          <span class="product-price">${money(product.price)}</span>
          <button
            class="add-btn"
            data-add="${product.id}"
            aria-label="Add ${product.name} to bag"
          >
            ${cart[product.id] ? "Add another +" : "+ Add to bag"}
          </button>
        </div>
      </div>
    </article>
  `).join("");

  emptyState.hidden = filteredProducts.length > 0;
}

// Save cart in this browser

function saveCart() {
  localStorage.setItem("giftify-cart", JSON.stringify(cart));
}

// Calculate cart values

function getCartProducts() {
  return products.filter(product => cart[product.id]);
}

function getSubtotal() {
  return getCartProducts().reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0
  );
}

// Display cart

function renderCart() {
  const items = getCartProducts();

  const count = items.reduce(
    (sum, product) => sum + cart[product.id],
    0
  );

  cartCount.textContent = count;
  subtotal.textContent = money(getSubtotal());
  total.textContent = money(getSubtotal());

  if (items.length === 0) {
    cartItems.innerHTML = `
      <p class="small-note">
        Your bag is waiting for something lovely. Add a gift above! ♡
      </p>
    `;
  } else {
    cartItems.innerHTML = items.map(product => `
      <article class="cart-item">
        <img src="${imageURL(product.image)}" alt="${product.name}">

        <div>
          <h3>${product.name}</h3>
          <p class="small-note">${money(product.price)} each</p>

          <div class="quantity-controls">
            <button data-minus="${product.id}" aria-label="Decrease quantity">−</button>
            <span>${cart[product.id]}</span>
            <button data-plus="${product.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <div>
          <strong>${money(product.price * cart[product.id])}</strong>
          <br>
          <button class="remove-btn" data-remove="${product.id}">
            Remove
          </button>
        </div>
      </article>
    `).join("");
  }

  renderProducts();
}

// Handle product and cart buttons

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const id = Number(button.dataset.add);
  if (!products.some(product => product.id === id)) return;

  cart[id] = Math.min((cart[id] || 0) + 1, 99);

  saveCart();
  renderCart();

  orderFeedback.textContent = "";
});

cartItems.addEventListener("click", event => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(
    button.dataset.plus ||
    button.dataset.minus ||
    button.dataset.remove
  );

  if (!products.some(product => product.id === id)) return;

  if (button.hasAttribute("data-plus")) {
    cart[id] = Math.min((cart[id] || 0) + 1, 99);
  }

  if (button.hasAttribute("data-minus")) {
    cart[id] -= 1;

    if (cart[id] <= 0) delete cart[id];
  }

  if (button.hasAttribute("data-remove")) {
    delete cart[id];
  }

  saveCart();
  renderCart();
  orderFeedback.textContent = "";
});

// Category filtering

categories.addEventListener("click", event => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  categories.querySelectorAll(".category").forEach(category => {
    const active = category === button;
    category.classList.toggle("active", active);
    category.setAttribute("aria-pressed", String(active));
  });

  renderProducts();
});

// Search

searchInput.addEventListener("input", renderProducts);

// Mobile navigation

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", event => {
  if (event.target.closest("a")) {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

// WhatsApp order

orderForm.addEventListener("submit", event => {
  event.preventDefault();

  const items = getCartProducts();

  if (items.length === 0) {
    orderFeedback.textContent = "Please add a gift to your bag first.";
    return;
  }

  if (!/^91\d{10}$/.test(SHOP_WHATSAPP)) {
    orderFeedback.textContent =
      "Demo mode: add the shop's WhatsApp number in script.js first.";
    return;
  }

  const formData = new FormData(orderForm);

  const customerName = String(formData.get("customerName") || "").trim();
  const recipient = String(formData.get("recipient") || "").trim();
  const occasion = String(formData.get("occasion") || "").trim();
  const giftMessage = String(formData.get("giftMessage") || "").trim();

  if (!customerName || !recipient || !occasion) {
    orderFeedback.textContent = "Please complete the required details.";
    return;
  }

  const orderLines = items.map(product =>
    `• ${product.name} x ${cart[product.id]} — ${
      money(product.price * cart[product.id])
    }`
  );

  const message = [
    "Hello Giftify! ♡ I'd like to place an order.",
    "",
    "CUSTOMER DETAILS",
    `Name: ${customerName}`,
    `Recipient: ${recipient}`,
    `Occasion: ${occasion}`,
    "",
    "MY GIFTS",
    ...orderLines,
    "",
    `Estimated subtotal: ${money(getSubtotal())}`,
    "Delivery charges: To be confirmed by the shop",
    "",
    `Gift message: ${giftMessage || "Not specified"}`,
    "",
    "Please confirm availability and the final amount. Thank you!"
  ].join("\n");

  const whatsappURL =
    `https://wa.me/${SHOP_WHATSAPP}?text=${encodeURIComponent(message)}`;

  const orderWindow = window.open(whatsappURL, "_blank");

  if (orderWindow) {
    orderFeedback.textContent =
      "WhatsApp opened! Review your order and press Send.";
  } else {
    orderFeedback.textContent =
      "Opening WhatsApp... If it didn't open, allow pop-ups and try again.";
  }
});

// Initial page render

renderCart();
