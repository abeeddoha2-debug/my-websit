const productGrid = document.querySelector("#product-grid");
const products = [...document.querySelectorAll(".product-card")];
const searchInput = document.querySelector("#product-search");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const emptyState = document.querySelector(".empty-state");
const cart = new Map();
let activeFilter = "all";
let toastTimer;

function updateProducts() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    products.forEach((product) => {
        const categories = product.dataset.category.split(" ");
        const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
        const matchesSearch = product.dataset.name.toLowerCase().includes(query);
        const visible = matchesFilter && matchesSearch;
        product.hidden = !visible;
        if (visible) visibleCount += 1;
    });

    emptyState.hidden = visibleCount > 0;
}

function setFilter(filter) {
    activeFilter = filter;
    filterButtons.forEach((button) => {
        const selected = button.dataset.filter === filter;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-pressed", String(selected));
    });
    updateProducts();
}

function showToast(message) {
    const toast = document.querySelector(".toast");
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}

function renderCart() {
    const itemContainer = document.querySelector(".cart-items");
    const items = [...cart.values()];
    const count = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    document.querySelector(".cart-count").textContent = count;
    document.querySelector(".drawer-count").textContent = `(${count})`;
    document.querySelector(".cart-subtotal").textContent = `$${subtotal.toFixed(2).replace(/\.00$/, "")}`;

    if (!items.length) {
        itemContainer.innerHTML = '<p class="cart-empty">Your bag is ready for something good.</p>';
        return;
    }

    itemContainer.innerHTML = items.map((item) => `
        <div class="cart-item">
            <div><h3>${item.name}</h3><p>Quantity: ${item.quantity}</p></div>
            <strong>$${(item.price * item.quantity).toFixed(2).replace(/\.00$/, "")}</strong>
        </div>
    `).join("");
}

function openCart() {
    const drawer = document.querySelector(".cart-drawer");
    const backdrop = document.querySelector(".drawer-backdrop");
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    document.body.classList.add("drawer-open");
    requestAnimationFrame(() => backdrop.classList.add("is-visible"));
    document.querySelector(".drawer-close").focus();
}

function closeCart() {
    const drawer = document.querySelector(".cart-drawer");
    const backdrop = document.querySelector(".drawer-backdrop");
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-visible");
    document.body.classList.remove("drawer-open");
    window.setTimeout(() => { backdrop.hidden = true; }, 250);
    document.querySelector(".cart-trigger").focus();
}

filterButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.classList.contains("is-active")));
    button.addEventListener("click", () => setFilter(button.dataset.filter));
});

document.querySelectorAll("[data-filter]").forEach((link) => {
    if (link.matches(".filter-button")) return;
    link.addEventListener("click", () => {
        setFilter(link.dataset.filter);
        document.querySelector(".primary-navigation").classList.remove("is-open");
        document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    });
});

searchInput.addEventListener("input", updateProducts);

productGrid.addEventListener("click", (event) => {
    const addButton = event.target.closest("[data-add]");
    if (!addButton) return;

    const name = addButton.dataset.add;
    const price = Number(addButton.dataset.price);
    const item = cart.get(name) || { name, price, quantity: 0 };
    item.quantity += 1;
    cart.set(name, item);
    renderCart();
    showToast(`${name} added to your bag`);
});

document.querySelector(".cart-trigger").addEventListener("click", openCart);
document.querySelector(".drawer-close").addEventListener("click", closeCart);
document.querySelector(".drawer-backdrop").addEventListener("click", closeCart);
document.querySelector(".checkout-button").addEventListener("click", () => {
    showToast(cart.size ? "Checkout is coming soon." : "Your bag is empty.");
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
    const button = event.currentTarget;
    const navigation = document.querySelector(".primary-navigation");
    const isOpen = navigation.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    button.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (document.querySelector(".cart-drawer").classList.contains("is-open")) closeCart();
        const navigation = document.querySelector(".primary-navigation");
        navigation.classList.remove("is-open");
        document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
    }
});
