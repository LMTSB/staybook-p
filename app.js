(() => {
  "use strict";
  const $ = id => document.getElementById(id);

  const fallbackSvg = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
    '<rect width="800" height="500" fill="#dfe7df"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#4f6454" font-family="sans-serif" font-size="22">SpacialStay Room Preview</text>' +
    '</svg>'
  );

  const rooms = [
    {
      id: "urban",
      name: "The Urban Sanctuary",
      location: "Sukhumvit · Bangkok, Thailand",
      price: 3200,
      rating: "4.9",
      size: "38 m²",
      dimensionsLabel: "6.33 × 6.00 m",
      bed: "King (180×200 cm)",
      maxAdults: 2,
      maxChildren: 1,
      bathSpec: "Glass rain shower",
      tag: "BEST SELLER",
      viewType: "city",
      viewLabel: "Sukhumvit skyline view",
      floorLabel: "Floor 14 · East-facing",
      description: "True-to-scale 38 m² modern corner suite featuring warm oak paneling, a 180×200 cm King bed, dedicated daylight workspace, glass-enclosed rain shower bathroom, and panoramic Floor 14 Sukhumvit skyline views.",
      photo: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
      amenities: ["High-speed Wi-Fi", "Inverter A/C", "55\" 4K Smart TV", "En-suite rain shower", "Daylight work desk", "Espresso & minibar"]
    },
    {
      id: "calm",
      name: "The Calm Residence",
      location: "Ari · Bangkok, Thailand",
      price: 2400,
      rating: "4.8",
      size: "32 m²",
      dimensionsLabel: "6.15 × 5.20 m",
      bed: "Queen (160×200 cm)",
      maxAdults: 2,
      maxChildren: 1,
      bathSpec: "Walk-in shower",
      tag: "MINIMALIST",
      viewType: "garden",
      viewLabel: "Ari garden courtyard view",
      floorLabel: "Floor 4 · Courtyard-facing",
      description: "A serene 32 m² minimalist studio with natural timber finishes, a 160×200 cm Queen bed, writing desk beside full-height windows, compact en-suite bathroom, and tranquil Floor 4 courtyard greenery.",
      photo: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
      amenities: ["High-speed Wi-Fi", "Inverter A/C", "50\" Smart TV", "Walk-in rain shower", "Artisanal tea bar", "Garden-view desk"]
    },
    {
      id: "atelier",
      name: "The Grand Atelier",
      location: "Riverside · Bangkok, Thailand",
      price: 5500,
      rating: "5.0",
      size: "55 m²",
      dimensionsLabel: "8.80 × 6.25 m",
      bed: "King (180×200 cm)",
      maxAdults: 3,
      maxChildren: 2,
      bathSpec: "Soaking tub + shower",
      tag: "PREMIUM SUITE",
      viewType: "river",
      viewLabel: "Chao Phraya river view",
      floorLabel: "Floor 22 · West-facing",
      description: "An expansive 55 m² riverside suite offering a separate lounge sofa area, 180×200 cm King bed, executive desk, spa bathroom with soaking tub and rain shower, and sweeping Floor 22 Chao Phraya sunset views.",
      photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
      amenities: ["High-speed Wi-Fi", "Dual-zone A/C", "65\" 4K Smart TV", "Private lounge sofa", "Soaking tub & shower", "Full refreshment bar"]
    }
  ];

  const ratePlanInfo = {
    saver: { name: "Room Only · Non-Refundable", addon: 0, badge: "Non-Refundable" },
    flex: { name: "Flexible · Free Cancellation", addon: 350, badge: "Free Cancellation" },
    breakfast: { name: "Breakfast + Free Cancellation", addon: 650, badge: "Breakfast + Free Cancel" }
  };

  let selected = rooms[0];
  let toastTimer = null;
  let priceBreakdown = null;
  let currentPage = "login";
  let pageHistory = ["login"];
  let selectedPayMethod = "qr";
  let qrSessionRef = "SB-QR" + Math.floor(1000 + Math.random() * 9000);

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function renderPage(page) {
    currentPage = page;
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    const targetEl = $("page-" + page);
    if (targetEl) targetEl.classList.remove("hidden");

    const order = ["login", "booking", "payment", "confirmation"];
    const activeIdx = order.indexOf(page);
    document.querySelectorAll(".progress-step").forEach(s => {
      const stepIdx = order.indexOf(s.dataset.step);
      s.classList.toggle("active", stepIdx <= activeIdx);
    });

    if (page === "booking") {
      window.dispatchEvent(new Event("spacialstay:3d-resize"));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function go(page, pushHistory = true) {
    if (page === currentPage) return;
    if (pushHistory) {
      pageHistory.push(page);
      if (window.history && window.history.pushState) {
        window.history.pushState({ page }, "", "#" + page);
      }
    }
    renderPage(page);
  }

  function goBack() {
    if (pageHistory.length > 1) {
      pageHistory.pop();
      const prev = pageHistory[pageHistory.length - 1];
      renderPage(prev);
      if (window.history && window.history.replaceState) {
        window.history.replaceState({ page: prev }, "", "#" + prev);
      }
    } else {
      const fallbackMap = {
        confirmation: "payment",
        payment: "booking",
        booking: "login",
        login: "login"
      };
      const target = fallbackMap[currentPage] || "login";
      if (target === currentPage) {
        toast("You are on the first page.");
      } else {
        pageHistory = [target];
        renderPage(target);
      }
    }
  }

  window.addEventListener("popstate", (e) => {
    const target = (e.state && e.state.page) || (window.location.hash ? window.location.hash.replace("#", "") : "login");
    if (["login", "booking", "payment", "confirmation"].includes(target)) {
      if (pageHistory[pageHistory.length - 1] !== target) {
        pageHistory.push(target);
      }
      renderPage(target);
    }
  });

  function nights(a, b) {
    if (!a || !b) return 0;
    const n = (new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000;
    return Number.isInteger(n) && n > 0 ? n : 0;
  }

  function thb(v) {
    return "฿" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function dateLabel(v) {
    if (!v) return "—";
    return new Date(v + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function getSelectedRatePlan() {
    const checked = document.querySelector('input[name="rate-plan"]:checked');
    const key = checked ? checked.value : "saver";
    return { key, ...(ratePlanInfo[key] || ratePlanInfo.saver) };
  }

  function getBreakdown() {
    const count = nights($("detail-in").value, $("detail-out").value);
    const roomCount = Number($("detail-rooms").value) || 1;
    const plan = getSelectedRatePlan();
    const baseSubtotal = selected.price * roomCount * count;
    const planSubtotal = plan.addon * roomCount * count;
    const netSubtotal = baseSubtotal + planSubtotal;
    const service = netSubtotal * 0.05;
    const tax = (netSubtotal + service) * 0.07;
    const total = netSubtotal + service + tax;
    return { count, roomCount, plan, baseSubtotal, planSubtotal, netSubtotal, service, tax, total };
  }

  function updateEstimate() {
    const d = getBreakdown();
    if (!d.count) {
      $("est-room-label").textContent = "Choose valid check-out date";
      $("est-room-sub").textContent = "—";
      $("est-plan-label").textContent = d.plan.name;
      $("est-plan-sub").textContent = "—";
      $("est-service").textContent = "—";
      $("est-tax").textContent = "—";
      $("estimate-total").textContent = "—";
      return;
    }
    const rmTxt = `${d.roomCount} ${d.roomCount === 1 ? "room" : "rooms"} × ${d.count} ${d.count === 1 ? "night" : "nights"}`;
    $("est-room-label").textContent = `Room (${rmTxt})`;
    $("est-room-sub").textContent = thb(d.baseSubtotal);
    $("est-plan-label").textContent = d.plan.name;
    $("est-plan-sub").textContent = thb(d.planSubtotal);
    $("est-service").textContent = thb(d.service);
    $("est-tax").textContent = thb(d.tax);
    $("estimate-total").textContent = thb(d.total);
  }

  function attachImgFallback(img) {
    if (!img) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackSvg;
    };
  }

  function renderRooms() {
    $("rooms").innerHTML = rooms.map(r => `
      <article class="card room-card ${r.id === selected.id ? "selected-room-card" : ""}" data-select-room="${r.id}">
        <img src="${r.photo}" alt="${r.name}" loading="lazy">
        <div class="room-meta"><span class="chip">${r.tag}</span><span>★ ${r.rating}</span></div>
        <h3>${r.name}</h3>
        <p>${r.location} · ${r.size} · ${r.floorLabel.split("·")[0].trim()}</p>
        <div class="room-bottom">
          <div><b>${thb(r.price).replace(".00", "")}</b><small>per night</small></div>
          <button type="button" class="${r.id === selected.id ? "active-inspect-btn" : ""}">${r.id === selected.id ? "Inspecting 3D ✓" : "Select & View 3D"}</button>
        </div>
      </article>
    `).join("");

    $("rooms").querySelectorAll("img").forEach(attachImgFallback);
    $("rooms").querySelectorAll("[data-select-room]").forEach(card => {
      card.addEventListener("click", () => selectRoom(card.dataset.selectRoom, true));
    });
  }

  function selectRoom(id, notify = false) {
    selected = rooms.find(r => r.id === id) || rooms[0];
    $("room-name").textContent = selected.name;
    $("room-location").textContent = selected.location;
    $("room-view-badge").textContent = `${selected.floorLabel} · ${selected.viewLabel}`;
    $("room-rating").textContent = selected.rating;
    attachImgFallback($("room-photo"));
    attachImgFallback($("room-photo-2"));
    $("room-photo").src = selected.photo;
    $("room-photo-2").src = selected.photo2;
    $("room-description").textContent = selected.description;
    $("room-size").textContent = `${selected.size} (${selected.dimensionsLabel})`;
    $("room-bed").textContent = selected.bed;
    $("room-capacity").textContent = `${selected.maxAdults} adults, ${selected.maxChildren} child`;
    $("room-bath-spec").textContent = selected.bathSpec;
    $("room-price").textContent = thb(selected.price).replace(".00", "");
    $("amenities").innerHTML = selected.amenities.map(a => `<span>${a}</span>`).join("");

    renderRooms();
    updateEstimate();
    window.dispatchEvent(new CustomEvent("spacialstay:room-open", { detail: { room: selected } }));
    if (notify) toast(`Loaded 3D model for ${selected.name}`);
  }

  // Deterministic, realistic PromptPay-style SVG QR generator
  function renderPromptPayQR(amount, ref) {
    const wrap = $("qr-svg-wrap");
    if (!wrap) return;
    const seedStr = `00020101021229370016A000000677010111011300668045952255802TH53037645408${amount.toFixed(2)}62120508${ref}`;
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i++) {
      hash ^= seedStr.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }

    const size = 25;
    const cells = [];
    const isFinder = (r, c) =>
      (r < 7 && c < 7) ||
      (r < 7 && c >= size - 7) ||
      (r >= size - 7 && c < 7);

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (isFinder(r, c)) continue;
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) cells.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="#111827"/>`);
          continue;
        }
        hash = (Math.imul(hash ^ (r * 31 + c * 17), 1103515245) + 12345) >>> 0;
        if ((hash & 3) === 0 || ((r * 7 + c * 13 + (hash >>> 8)) % 5 === 0)) {
          cells.push(`<rect x="${c}" y="${r}" width="1" height="1" fill="#111827"/>`);
        }
      }
    }

    const finderSvg = (ox, oy) => `
      <rect x="${ox}" y="${oy}" width="7" height="7" fill="#111827"/>
      <rect x="${ox + 1}" y="${oy + 1}" width="5" height="5" fill="#ffffff"/>
      <rect x="${ox + 2}" y="${oy + 2}" width="3" height="3" fill="#111827"/>
    `;

    wrap.innerHTML = `
      <svg viewBox="-1.5 -1.5 ${size + 3} ${size + 3}" width="176" height="176" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PromptPay QR Code for ${thb(amount)}">
        <rect x="-1.5" y="-1.5" width="${size + 3}" height="${size + 3}" fill="#ffffff"/>
        ${finderSvg(0, 0)}
        ${finderSvg(size - 7, 0)}
        ${finderSvg(0, size - 7)}
        ${cells.join("")}
        <rect x="9.5" y="9.5" width="6" height="6" rx="1" fill="#003d6b"/>
        <text x="12.5" y="13.4" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="2.5" font-weight="bold">QR</text>
      </svg>
    `;
  }

  function setPaymentMethod(method) {
    selectedPayMethod = method;
    document.querySelectorAll(".pay-method-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.paymethod === method);
    });
    ["qr", "card", "bank", "property"].forEach(m => {
      const panel = $("pay-panel-" + m);
      if (panel) panel.classList.toggle("hidden", m !== method);
    });

    const confirmBtn = $("confirm");
    if (confirmBtn) {
      const labels = {
        qr: "Verify QR Payment & Confirm Booking →",
        card: "Pay by Card & Confirm Booking →",
        bank: "Authorize Mobile Banking & Confirm →",
        property: "Confirm Reservation (Pay at Property) →"
      };
      confirmBtn.textContent = labels[method] || "Confirm & Pay Now →";
    }
  }

  function continueToPayment() {
    const d = getBreakdown();
    if (!d.count) return toast("Check-out date must be after check-in date.");
    const adults = Number($("detail-adults").value) || 1;
    const children = Number($("detail-children").value) || 0;
    const maxTotalAdults = selected.maxAdults * d.roomCount;
    const maxTotalChildren = selected.maxChildren * d.roomCount;

    if (adults > maxTotalAdults || children > maxTotalChildren) {
      return toast(`${selected.name} (${d.roomCount} rm) fits up to ${maxTotalAdults} adults & ${maxTotalChildren} children.`);
    }

    priceBreakdown = d;
    attachImgFallback($("pay-photo"));
    $("pay-photo").src = selected.photo;
    $("pay-room").textContent = selected.name;
    $("pay-location").textContent = selected.location;
    $("pay-view-tag").textContent = `${selected.floorLabel} · ${selected.viewLabel}`;
    $("pay-policy-badge").textContent = d.plan.badge;
    $("pay-in").textContent = dateLabel($("detail-in").value);
    $("pay-out").textContent = dateLabel($("detail-out").value);
    $("pay-nights").textContent = `${d.count} ${d.count === 1 ? "night" : "nights"} · ${d.roomCount} ${d.roomCount === 1 ? "room" : "rooms"}`;
    $("pay-guests").textContent = `${adults} ${adults === 1 ? "adult" : "adults"}${children ? `, ${children} ${children === 1 ? "child" : "children"}` : ""}`;
    $("pay-plan").textContent = d.plan.name;
    $("pay-prefs").textContent = `${$("pref-bed").value} · ${$("pref-floor").value}`;

    $("subtotal-label").textContent = `${thb(selected.price).replace(".00", "")} × ${d.roomCount} rm × ${d.count} nt`;
    $("subtotal").textContent = thb(d.baseSubtotal);
    $("plan-addon-label").textContent = d.plan.name;
    $("plan-addon").textContent = thb(d.planSubtotal);
    $("net-subtotal").textContent = thb(d.netSubtotal);
    $("service").textContent = thb(d.service);
    $("tax").textContent = thb(d.tax);
    $("total").textContent = thb(d.total);

    if (!$("guest-email").value) {
      $("guest-email").value = $("login-email").value;
    }

    qrSessionRef = "SB-QR" + Math.floor(1000 + Math.random() * 9000);
    $("qr-amount-display").textContent = thb(d.total);
    $("qr-ref-display").textContent = qrSessionRef;
    renderPromptPayQR(d.total, qrSessionRef);

    go("payment");
  }

  // Navigation & Back button wiring
  $("brand-home").addEventListener("click", e => {
    e.preventDefault();
    go(currentPage === "login" ? "login" : "booking");
  });

  document.querySelectorAll(".progress-step").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.step;
      const order = ["login", "booking", "payment", "confirmation"];
      if (order.indexOf(target) <= order.indexOf(currentPage)) {
        go(target);
      } else {
        toast("Complete the current step first to advance.");
      }
    });
  });

  $("back-from-booking").addEventListener("click", goBack);
  $("back-from-payment").addEventListener("click", goBack);
  $("back-from-confirmation").addEventListener("click", goBack);
  $("edit-booking-again").addEventListener("click", goBack);

  // Step 1: Login handlers
  $("send-code").addEventListener("click", () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("login-email").value.trim())) {
      return toast("Enter a valid email address.");
    }
    $("otp-area").classList.remove("hidden");
    $("otp").focus();
    toast("Verification code 123456 ready.");
  });

  $("verify").addEventListener("click", () => {
    if ($("otp").value.trim() !== "123456") {
      return toast("Incorrect code. Enter 123456.");
    }
    go("booking");
    selectRoom(selected.id, false);
  });

  $("quick-demo-login").addEventListener("click", () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("login-email").value.trim())) {
      $("login-email").value = "guest@example.com";
    }
    go("booking");
    selectRoom(selected.id, false);
  });

  // Step 2: Booking configuration handlers
  ["detail-in", "detail-out", "detail-adults", "detail-children", "detail-rooms"].forEach(id => {
    $(id).addEventListener("change", updateEstimate);
  });

  document.querySelectorAll('input[name="rate-plan"]').forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".rate-option").forEach(lbl => {
        lbl.classList.toggle("active", lbl.querySelector("input").checked);
      });
      updateEstimate();
    });
  });

  $("reserve").addEventListener("click", continueToPayment);

  // Step 3: Payment method & confirmation handlers
  document.querySelectorAll(".pay-method-btn").forEach(btn => {
    btn.addEventListener("click", () => setPaymentMethod(btn.dataset.paymethod));
  });

  document.querySelectorAll(".bank-choice input").forEach(radio => {
    radio.addEventListener("change", () => {
      document.querySelectorAll(".bank-choice").forEach(lbl => {
        lbl.classList.toggle("active", lbl.querySelector("input").checked);
      });
    });
  });

  $("card-number").addEventListener("input", e => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    e.target.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });

  $("card-exp").addEventListener("input", e => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  });

  $("confirm").addEventListener("click", () => {
    const name = $("guest-name").value.trim();
    const email = $("guest-email").value.trim();
    if (!name) return toast("Enter the primary guest's full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid guest email address.");

    if (selectedPayMethod === "qr" && !$("qr-paid-check").checked) {
      return toast("Please tick the PromptPay QR transfer confirmation checkbox.");
    }
    if (selectedPayMethod === "card") {
      const cardNum = $("card-number").value.replace(/\s/g, "");
      if (!$("card-name").value.trim() || cardNum.length < 13 || $("card-exp").value.length < 4 || $("card-cvv").value.length < 3) {
        return toast("Please complete valid demo cardholder name, number, expiry, and CVV.");
      }
    }

    if (!priceBreakdown) priceBreakdown = getBreakdown();
    const refCode = "SB-" + Math.floor(100000 + Math.random() * 900000);
    const adults = Number($("detail-adults").value) || 1;
    const children = Number($("detail-children").value) || 0;

    let methodText = "Thai QR Payment (PromptPay)";
    let statusBadge = "PAID · PROMPTPAY QR";
    if (selectedPayMethod === "card") {
      const last4 = $("card-number").value.replace(/\s/g, "").slice(-4) || "8890";
      methodText = `Credit/Debit Card (•••• ${last4})`;
      statusBadge = "PAID · CARD";
    } else if (selectedPayMethod === "bank") {
      const bankRadio = document.querySelector('input[name="bank-app"]:checked');
      methodText = `Mobile Banking (${bankRadio ? bankRadio.value : "K PLUS"})`;
      statusBadge = "PAID · MOBILE BANKING";
    } else if (selectedPayMethod === "property") {
      methodText = "Pay at Property upon Check-in";
      statusBadge = "GUARANTEED · PAY AT HOTEL";
    }

    $("reference").textContent = refCode;
    $("confirm-pay-status").textContent = statusBadge;
    $("confirm-room").textContent = `${selected.name} (${selected.size})`;
    $("confirm-view").textContent = `${selected.floorLabel} · ${selected.viewLabel}`;
    $("confirm-guest").textContent = `${name} (${email})`;
    $("confirm-dates").textContent = `${dateLabel($("detail-in").value)} – ${dateLabel($("detail-out").value)} (${priceBreakdown.count} nt)`;
    $("confirm-config").textContent = `${priceBreakdown.roomCount} rm · ${adults} adult${adults > 1 ? "s" : ""}${children ? `, ${children} child` : ""} · ${priceBreakdown.plan.name}`;
    $("confirm-method").textContent = methodText;
    $("confirm-tax-note").textContent = `${thb(priceBreakdown.service)} service + ${thb(priceBreakdown.tax)} VAT`;
    $("confirm-total").textContent = thb(priceBreakdown.total);

    go("confirmation");
  });

  $("restart").addEventListener("click", () => {
    pageHistory = ["login", "booking"];
    renderPage("booking");
    selectRoom(selected.id, false);
  });

  // Initialize default dates & room
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 17);
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  $("detail-in").min = iso(now);
  $("detail-out").min = iso(start);
  $("detail-in").value = iso(start);
  $("detail-out").value = iso(end);

  if (window.history && window.history.replaceState) {
    window.history.replaceState({ page: "login" }, "", "#login");
  }
  selectRoom("urban", false);
  setPaymentMethod("qr");
})();
