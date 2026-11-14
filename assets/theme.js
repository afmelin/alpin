// Alpin – Shopify-tema
(function () {
  // Paketväljaren uppdaterar pris och namn på köpknapparna
  document.addEventListener('change', function (e) {
    var input = e.target;
    if (!input.matches('.packs input[name="id"]')) return;
    document.querySelectorAll('[data-pack-price]').forEach(function (el) {
      el.textContent = input.dataset.price;
    });
    document.querySelectorAll('[data-pack-name]').forEach(function (el) {
      el.textContent = input.dataset.name;
    });
  });

  // Fast köpfält i mobilen: visas när huvudknappen har scrollats förbi
  function setupStickyBuy() {
    var bar = document.querySelector('.sticky-buy');
    var anchor = document.querySelector('[data-sticky-anchor]');
    if (!bar || !anchor || !('IntersectionObserver' in window)) return;
    document.body.classList.add('has-sticky');
    var footer = document.querySelector('.footer');
    var anchorVisible = true;
    var footerVisible = false;
    function update() {
      bar.classList.toggle('show', !anchorVisible && !footerVisible);
    }
    new IntersectionObserver(function (entries) {
      var entry = entries[0];
      anchorVisible = entry.isIntersecting || entry.boundingClientRect.top > 0;
      update();
    }).observe(anchor);
    if (footer) {
      new IntersectionObserver(function (entries) {
        footerVisible = entries[0].isIntersecting;
        update();
      }).observe(footer);
    }
  }

  // Liten bekräftelse längst ner på skärmen
  var toastTimer;
  function toast(text) {
    var el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = text + ' ';
    var link = document.createElement('a');
    link.href = (window.Shopify && Shopify.routes ? Shopify.routes.root : '/') + 'cart';
    link.textContent = 'Till varukorgen →';
    el.appendChild(link);
    requestAnimationFrame(function () { el.classList.add('show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, 3500);
  }

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
    document.querySelectorAll('.cart-link').forEach(function (el) {
      el.setAttribute('aria-label', 'Varukorg, ' + count + (count === 1 ? ' vara' : ' varor'));
    });
  }

  // Lösmärken läggs i varukorgen utan att man lämnar sidan.
  // Fungerar inte fetch skickas formuläret som vanligt.
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.classList.contains('js-ajax-add') || !window.fetch) return;
    e.preventDefault();
    var root = window.Shopify && Shopify.routes ? Shopify.routes.root : '/';
    var button = form.querySelector('[type="submit"]');
    if (button) button.disabled = true;

    fetch(root + 'cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) {
        if (!res.ok) throw new Error('add failed');
        return res.json();
      })
      .then(function (item) {
        toast(item.product_title + ' ligger i varukorgen.');
        return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } });
      })
      .then(function (res) { return res.json(); })
      .then(function (cart) { updateCartCount(cart.item_count); })
      .catch(function () { form.submit(); })
      .finally(function () { if (button) button.disabled = false; });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupStickyBuy);
  } else {
    setupStickyBuy();
  }
})();
