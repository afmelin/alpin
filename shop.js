// Alpin – varukorg och köpknappar (delas av alla sidor)
(function () {
  // Produkter och priser. Ändra här så uppdateras hela sajten.
  const PRODUCTS = {
    start: {
      name: 'Startpaketet',
      desc: '1 märkessköld + 4 skidmärken',
      price: 349,
    },
    syskon: {
      name: 'Syskonpaketet',
      desc: '2 märkessköldar + 8 skidmärken',
      price: 599,
      compare: 698,
    },
    'extra-skidskola': { name: 'Extra märke: Skidskolemärke', desc: 'Lösmärke', price: 49 },
    'extra-barnbacken': { name: 'Extra märke: Barnbacken', desc: 'Lösmärke', price: 49 },
    'extra-gronabacken': { name: 'Extra märke: Gröna backen', desc: 'Lösmärke', price: 49 },
    'extra-knapplift': { name: 'Extra märke: Knapplift', desc: 'Lösmärke', price: 49 },
    present: { name: 'Presentinslagning', desc: 'Inslaget och klart att ge bort', price: 29 },
  };

  const SHIPPING = 39;
  const FREE_SHIPPING_FROM = 499;
  const KEY = 'alpin-cart';

  let memoryCart = {};

  function load() {
    let cart;
    try {
      cart = JSON.parse(localStorage.getItem(KEY) || '{}');
    } catch (e) {
      cart = memoryCart;
    }
    const clean = {};
    if (cart && typeof cart === 'object') {
      for (const id in cart) {
        const qty = parseInt(cart[id], 10);
        if (PRODUCTS[id] && qty > 0) clean[id] = Math.min(qty, 99);
      }
    }
    return clean;
  }

  function save(cart) {
    memoryCart = cart;
    try {
      localStorage.setItem(KEY, JSON.stringify(cart));
    } catch (e) {
      /* privat läge e.d. – varukorgen lever kvar i minnet */
    }
    updateCount();
    document.dispatchEvent(new CustomEvent('cart:change'));
  }

  function add(id, qty) {
    const cart = load();
    cart[id] = (cart[id] || 0) + (qty || 1);
    save(cart);
  }

  function setQty(id, qty) {
    const cart = load();
    if (qty > 0) cart[id] = qty;
    else delete cart[id];
    save(cart);
  }

  function count() {
    const cart = load();
    return Object.values(cart).reduce((sum, q) => sum + q, 0);
  }

  function totals() {
    const cart = load();
    let subtotal = 0;
    for (const id in cart) subtotal += PRODUCTS[id].price * cart[id];
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING;
    return { subtotal, shipping, total: subtotal + shipping };
  }

  function formatPrice(n) {
    return n.toLocaleString('sv-SE') + ' kr';
  }

  function updateCount() {
    const n = count();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = n;
      el.hidden = n === 0;
    });
    document.querySelectorAll('.cart-link').forEach((el) => {
      el.setAttribute('aria-label', 'Varukorg, ' + n + (n === 1 ? ' vara' : ' varor'));
    });
  }

  // Liten bekräftelse längst ner på skärmen
  let toastTimer;
  function toast(text) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    el.append(text + ' ');
    const link = document.createElement('a');
    link.href = 'kassa.html';
    link.textContent = 'Till kassan →';
    el.appendChild(link);
    requestAnimationFrame(() => el.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
  }

  // Knappar: data-add="produkt-id" lägger i varukorgen.
  // Med data-go="kassa" skickas man direkt vidare till kassan.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    let id = btn.dataset.add;
    if (id === 'selected-pack') {
      const checked = document.querySelector('input[name="pack"]:checked');
      id = checked ? checked.value : 'start';
    }
    if (!PRODUCTS[id]) return;
    add(id, 1);
    if (btn.dataset.go === 'kassa') {
      window.location.href = 'kassa.html';
    } else {
      toast(PRODUCTS[id].name + ' ligger i varukorgen.');
    }
  });

  // Paketväljaren uppdaterar priset på köpknapparna
  function updatePackPrice() {
    const checked = document.querySelector('input[name="pack"]:checked');
    if (!checked) return;
    const p = PRODUCTS[checked.value];
    document.querySelectorAll('[data-pack-price]').forEach((el) => {
      el.textContent = formatPrice(p.price);
    });
    document.querySelectorAll('[data-pack-name]').forEach((el) => {
      el.textContent = p.name;
    });
  }

  document.addEventListener('change', (e) => {
    if (e.target.matches('input[name="pack"]')) updatePackPrice();
  });

  // Fast köpfält i mobilen: visas när huvudknappen har scrollats ur bild
  function setupStickyBuy() {
    const bar = document.querySelector('.sticky-buy');
    const anchor = document.querySelector('[data-sticky-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;
    document.body.classList.add('has-sticky');
    const footer = document.querySelector('.footer');
    let anchorVisible = true;
    let footerVisible = false;
    const update = () => bar.classList.toggle('show', !anchorVisible && !footerVisible);
    new IntersectionObserver(([entry]) => {
      anchorVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
      update();
    }).observe(anchor);
    if (footer) {
      new IntersectionObserver(([entry]) => {
        footerVisible = entry.isIntersecting;
        update();
      }).observe(footer);
    }
  }

  window.Alpin = { PRODUCTS, SHIPPING, FREE_SHIPPING_FROM, load, add, setQty, totals, formatPrice };

  updateCount();
  updatePackPrice();
  setupStickyBuy();
  window.addEventListener('storage', updateCount);
})();
