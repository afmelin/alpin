// Alpin – kassan: visar varukorgen, tillägg och hanterar formuläret
(function () {
  const A = window.Alpin;
  const P = A.PRODUCTS;
  const fmt = A.formatPrice;

  const itemsEl = document.getElementById('cart-items');
  const shipEl = document.getElementById('ship-progress');
  const totalsEl = document.getElementById('totals');
  const upsellSection = document.getElementById('upsell-section');
  const upsellsEl = document.getElementById('upsells');
  const form = document.getElementById('checkout-form');
  const msg = document.getElementById('checkout-msg');

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    for (const k in attrs || {}) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    }
    (children || []).forEach((c) => node.append(c));
    return node;
  }

  function renderItems(cart) {
    itemsEl.innerHTML = '';
    const ids = Object.keys(cart);

    if (ids.length === 0) {
      itemsEl.append(
        el('div', { class: 'cart-empty' }, [
          el('p', { text: 'Din varukorg är tom.' }),
          el('a', { href: 'index.html', class: 'btn btn-primary', text: 'Se Startpaketet' }),
        ])
      );
      return;
    }

    ids.forEach((id) => {
      const p = P[id];
      const qty = cart[id];

      const minus = el('button', { type: 'button', 'aria-label': 'Minska antal ' + p.name, text: '−' });
      const plus = el('button', { type: 'button', 'aria-label': 'Öka antal ' + p.name, text: '+' });
      const out = el('output', { text: String(qty) });
      const remove = el('button', { type: 'button', class: 'link-btn', text: 'Ta bort' });

      minus.addEventListener('click', () => A.setQty(id, qty - 1));
      plus.addEventListener('click', () => A.setQty(id, qty + 1));
      remove.addEventListener('click', () => A.setQty(id, 0));

      itemsEl.append(
        el('div', { class: 'line' }, [
          el('div', { class: 'ph', 'aria-hidden': 'true' }),
          el('div', {}, [
            el('div', { class: 'line-name', text: p.name }),
            el('div', { class: 'line-desc', text: p.desc }),
            el('div', {}, [el('span', { class: 'qty' }, [minus, out, plus]), remove]),
          ]),
          el('div', { class: 'line-price', text: fmt(p.price * qty) }),
        ])
      );
    });
  }

  function renderShipping(t) {
    shipEl.innerHTML = '';
    if (t.subtotal === 0) return;
    const left = A.FREE_SHIPPING_FROM - t.subtotal;
    const pct = Math.min(100, Math.round((t.subtotal / A.FREE_SHIPPING_FROM) * 100));
    const text = left > 0
      ? 'Handla för ' + fmt(left) + ' till så får du fri frakt.'
      : 'Du har fri frakt!';
    const bar = el('div', { class: 'ship-bar' }, [el('span', { style: 'width:' + pct + '%' })]);
    shipEl.append(el('div', { text }), bar);
  }

  function renderTotals(t) {
    totalsEl.innerHTML = '';
    if (t.subtotal === 0) return;
    totalsEl.append(
      el('dt', { text: 'Varor' }), el('dd', { text: fmt(t.subtotal) }),
      el('dt', { text: 'Frakt' }), el('dd', { text: t.shipping === 0 ? 'Gratis' : fmt(t.shipping) }),
      el('dt', { class: 'grand', text: 'Totalt' }), el('dd', { class: 'grand', text: fmt(t.total) })
    );
    document.querySelectorAll('[data-total]').forEach((n) => (n.textContent = fmt(t.total)));
  }

  function upsellRow(title, sub, btnText, onClick, highlight) {
    const btn = el('button', { type: 'button', class: 'btn btn-secondary btn-small', text: btnText });
    btn.addEventListener('click', onClick);
    return el('div', { class: 'upsell' + (highlight ? ' highlight' : '') }, [
      el('div', {}, [el('strong', { text: title }), el('span', { text: sub })]),
      btn,
    ]);
  }

  function renderUpsells(cart) {
    upsellsEl.innerHTML = '';
    const rows = [];

    // Uppgradering till syskonpaketet
    if (cart.start === 1 && !cart.syskon) {
      const diff = P.syskon.price - P.start.price;
      rows.push(upsellRow(
        'Uppgradera till Syskonpaketet',
        'Dubbelt så mycket för bara ' + fmt(diff) + ' mer – och fri frakt',
        '+ ' + fmt(diff),
        () => {
          A.setQty('start', 0);
          A.setQty('syskon', 1);
        },
        true
      ));
    }

    if (!cart.present && (cart.start || cart.syskon)) {
      rows.push(upsellRow(
        'Presentinslagning',
        'Inslaget och klart att ge bort',
        '+ ' + fmt(P.present.price),
        () => A.add('present')
      ));
    }

    ['extra-skidskola', 'extra-barnbacken', 'extra-gronabacken', 'extra-knapplift'].forEach((id) => {
      if (cart[id]) return;
      rows.push(upsellRow(
        P[id].name.replace('Extra märke: ', 'Extra ') ,
        'Bra att ha i reserv eller till en kompis',
        '+ ' + fmt(P[id].price),
        () => A.add(id)
      ));
    });

    const hasItems = Object.keys(cart).length > 0;
    upsellSection.hidden = !hasItems || rows.length === 0;
    rows.slice(0, 4).forEach((r) => upsellsEl.append(r));
  }

  function render() {
    const cart = A.load();
    const t = A.totals();
    renderItems(cart);
    renderShipping(t);
    renderTotals(t);
    renderUpsells(cart);
    form.hidden = t.subtotal === 0;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    // Betalningen kopplas in i ett senare steg (t.ex. via Klarna Checkout eller
    // en betalleverantör som stöder kort, Swish och Klarna).
    msg.textContent =
      'Webbshoppen öppnar snart! Betalningen är inte aktiverad ännu, så ingen beställning har skickats och inga pengar har dragits.';
    msg.hidden = false;
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  document.addEventListener('cart:change', render);
  window.addEventListener('storage', render);
  render();
})();
