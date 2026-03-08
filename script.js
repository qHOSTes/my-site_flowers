// Данные товаров
const PRODUCTS = [
  {
    id: 'flowers-bouquet',
    name: 'Букет свежих цветов',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1523419403673-5c4a59aef98a?q=80&w=600&auto=format&fit=crop',
    description: 'Красивый bouquet из сезонных цветов.'
  },
  {
    id: 'berries-chocolate',
    name: 'Клубника в шоколаде',
    price: 2200,
    image: 'https://images.unsplash.com/photo-1545165484-3a3d6a3f8a4b?q=80&w=600&auto=format&fit=crop',
    description: 'Свежая клубника в нежном домашнем шоколаде.'
  }
];

// Корзина
let cart = [];

// Элементы DOM
const productGrid = document.getElementById('productGrid');
const cartPanel = document.getElementById('cartPanel');
const cartToggle = document.getElementById('cartToggle');
const cartClose = document.getElementById('cartClose');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const clearCart = document.getElementById('clearCart');
const checkoutFromCart = document.getElementById('checkoutFromCart');
const checkoutForm = document.getElementById('checkoutForm');
const summaryText = document.getElementById('summaryText');
const contactForm = document.getElementById('contactForm');

// Рендер товаров
function renderShop() {
  productGrid.innerHTML = '';
  PRODUCTS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-media">
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="card-content">
        <div class="card-title">${p.name}</div>
        <div class="card-desc">${p.description}</div>
        <div class="card-price">${p.price.toLocaleString()} ₽</div>
        <div class="input-row" style="margin-top:6px;">
          <input type="number" min="1" max="99" value="1" class="qty" id="qty-${p.id}">
          <button class="add-btn" data-id="${p.id}">В корзину</button>
        </div>
      </div>
    `;
    productGrid.appendChild(card);

    const qtyInput = card.querySelector(`#qty-${p.id}`);
    const addBtn = card.querySelector('button[data-id="' + p.id + '"]');
    addBtn.addEventListener('click', () => {
      const qty = parseInt(qtyInput.value) || 1;
      addToCart(p.id, qty);
    });
  });
}

// Добавить в корзину
function addToCart(productId, qty) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id: productId, name: product.name, price: product.price, qty, image: product.image });
  }
  saveCart();
  updateCartUI();
  openCart();
}

// Сохранение и загрузка
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCart() {
  const saved = localStorage.getItem('cart');
  if (saved) {
    cart = JSON.parse(saved);
  }
}
function updateCartUI() {
  // элементы корзины
  cartItems.innerHTML = '';
  let total = 0;
  for (const item of cart) {
    total += item.price * item.qty;
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div style="font-size:12px; color:var(--muted);">Цена: ${item.price.toLocaleString()} ₽</div>
        <div class="input-row" style="margin-top:4px;">
          <input class="cart-qty" type="number" min="1" max="99" value="${item.qty}" data-id="${item.id}" style="width:60px;">
          <button class="btn" style="padding:6px 10px;" data-action="update" data-id="${item.id}">Обновить</button>
          <button class="btn" style="padding:6px 10px;" data-action="remove" data-id="${item.id}">Удалить</button>
        </div>
      </div>
      <div style="align-self:start; font-weight:700; margin-left: auto;">${(item.price * item.qty).toLocaleString()} ₽</div>
    `;
    cartItems.appendChild(row);
  }

  // обработка обновления/удаления
  cartItems.querySelectorAll('button[data-action="update"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const qtyInput = btn.parentElement.querySelector('.cart-qty');
      const newQty = parseInt(qtyInput.value) || 1;
      setCartQty(id, newQty);
    });
  });
  cartItems.querySelectorAll('button[data-action="remove"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      removeFromCart(id);
    });
  });
  // обновление сумм
  cartTotal.textContent = `Итого: ${total.toLocaleString()} ₽`;
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
}
function setCartQty(productId, qty) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty = qty;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }
  saveCart();
  updateCartUI();
}
function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveCart();
  updateCartUI();
}
function clearCartFn() {
  cart = [];
  saveCart();
  updateCartUI();
}
function openCart() {
  cartPanel.setAttribute('aria-hidden', 'false');
}
function closeCart() {
  cartPanel.setAttribute('aria-hidden', 'true');
}

// Оформление заказа
function updateCheckoutSummary() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  summaryText.textContent = total > 0 ? total.toLocaleString() + ' ₽' : '0 ₽';
}
checkoutForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (cart.length === 0) {
    alert('Ваша корзина пуста.');
    return;
  }
  // простая валидация
  const formData = new FormData(checkoutForm);
  const name = formData.get('customerName');
  const phone = formData.get('customerPhone');
  const address = formData.get('deliveryAddress');
  if (!name || !phone || !address) {
    alert('Пожалуйста, заполните имя, телефон и адрес доставки.');
    return;
  }
  // фиктивное оформление
  alert(`Спасибо, ${name}! Ваш заказ подтверждён. Мы свяжемся по телефону ${phone}.`);
  clearCartFn();
  updateCheckoutSummary();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Контактная форма (демо)
contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('nameFeedback').value;
  const email = document.getElementById('emailFeedback').value;
  const msg = document.getElementById('messageFeedback').value;
  if (!name || !email) {
    alert('Пожалуйста, укажите имя и email.');
  } else {
    alert('Спасибо за сообщение! Мы ответим в ближайшее время.');
    contactForm.reset();
  }
});

// Обработчики открытия/закрытия корзины
cartToggle.addEventListener('click', () => {
  updateCartUI();
  openCart();
});
cartClose.addEventListener('click', () => closeCart());
// Клик вне панели закрывать (опционально можно)

clearCart.addEventListener('click', () => clearCartFn());
checkoutFromCart.addEventListener('click', () => {
  // перейти к оформлению, в текущем примере просто пролистать к шагу оформления
  document.querySelector('#checkout').scrollIntoView({ behavior: 'smooth' });
  closeCart();
});

// Инициализация
function init() {
  loadCart();
  renderShop();
  updateCartUI();
  updateCheckoutSummary();
}
init();