(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const fallbackSvg = "data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">' +
    '<rect width="800" height="500" fill="#dfe7df"/>' +
    '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#4f6454" font-family="sans-serif" font-size="22">StayBook Room Preview</text>' +
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
      bed: "King bed",
      capacity: 2,
      tag: "BEST SELLER",
      viewType: "city",
      viewLabel: "Sukhumvit skyline view",
      floorLabel: "Floor 14 · East-facing",
      description: "A refined modern room featuring warm wood textures, natural light, and a spacious king bed. Designed for a peaceful city escape above Bangkok's energetic Sukhumvit district.",
      photo: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
      amenities: ["Free Wi-Fi", "Air conditioning", "Smart TV", "Private bathroom", "Workspace", "Mini bar"]
    },
    {
      id: "calm",
      name: "The Calm Residence",
      location: "Ari · Bangkok, Thailand",
      price: 2400,
      rating: "4.8",
      size: "32 m²",
      bed: "Queen bed",
      capacity: 2,
      tag: "MINIMALIST",
      viewType: "garden",
      viewLabel: "Ari garden view",
      floorLabel: "Floor 4 · Courtyard-facing",
      description: "A peaceful minimalist escape with natural textures, a soft neutral palette, and a thoughtful layout for slow mornings in one of Bangkok's relaxed neighbourhoods.",
      photo: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
      amenities: ["Free Wi-Fi", "Air conditioning", "Smart TV", "Rain shower", "Tea station", "Workspace"]
    },
    {
      id: "atelier",
      name: "The Grand Atelier",
      location: "Riverside · Bangkok, Thailand",
      price: 5500,
      rating: "5.0",
      size: "55 m²",
      bed: "King bed",
      capacity: 3,
      tag: "PREMIUM",
      viewType: "river",
      viewLabel: "Chao Phraya river view",
      floorLabel: "Floor 22 · West-facing",
      description: "A premium contemporary suite with generous living space, elegant finishes, and a calm riverside-inspired atmosphere for a special city stay.",
      photo: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85",
      photo2: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=85",
      amenities: ["Free Wi-Fi", "Air conditioning", "Smart TV", "Lounge area", "Bathtub", "Mini bar"]
    }
  ];

  let selected = rooms[0], toastTimer = null, priceBreakdown = null, currentPage = "login";

  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  function go(page) {
    currentPage = page;
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    $("page-" + page).classList.remove("hidden");
    const active = page === "details" ? "browse" : page;
    const order = ["login", "browse", "payment", "confirmation"];
    document.querySelectorAll(".progress-step").forEach(s => {
      s.classList.toggle("active", order.indexOf(s.dataset.step) <= order.indexOf(active));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nights(a, b) {
    if (!a || !b) return 0;
    const n = (new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000;
    return Number.isInteger(n) && n > 0 ? n : 0;
  }

  function thb(v) {
    return "฿" + Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function dateLabel(v) {
    return new Date(v + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function getBreakdown() {
    const count = nights($("detail-in").value, $("detail-out").value);
    const subtotal = selected.price * count;
    const service = subtotal * 0.05;
    const tax = (subtotal + service) * 0.07;
    return { count, subtotal, service, tax, total: subtotal + service + tax };
  }

  function updateEstimate() {
    const n = nights($("detail-in").value, $("detail-out").value);
    $("estimate-nights").textContent = n ? n + (n === 1 ? " night" : " nights") : "Choose valid dates";
    $("estimate-total").textContent = n ? thb(selected.price * n * 1.05 * 1.07) : "—";
  }

  function attachImgFallback(img) {
    if (!img) return;
    img.onerror = () => {
      img.onerror = null;
      img.src = fallbackSvg;
    };
  }

  function renderRooms() {
    const guestFilter = Number($("search-guests").value) || 2;
    $("rooms").innerHTML = rooms.map(r => {
      const capNote = guestFilter > r.capacity ? ` · Max ${r.capacity} guests` : "";
      return `
        <article class="card room-card">
          <img src="${r.photo}" alt="${r.name} bedroom" loading="lazy">
          <div class="room-meta"><span class="chip">${r.tag}</span><span>★ ${r.rating}</span></div>
          <h3>${r.name}</h3>
          <p>${r.location} · ${r.size}${capNote}</p>
          <div class="room-bottom">
            <div><b>${thb(r.price).replace(".00", "")}</b><small>per night</small></div>
            <button data-room="${r.id}" type="button">Explore room →</button>
          </div>
        </article>
      `;
    }).join("");
    $("rooms").querySelectorAll("img").forEach(attachImgFallback);
    $("rooms").querySelectorAll("[data-room]").forEach(b => {
      b.addEventListener("click", () => selectRoom(b.dataset.room));
    });
  }

  function selectRoom(id) {
    selected = rooms.find(r => r.id === id) || rooms[0];
    $("room-name").textContent = selected.name;
    $("room-location").textContent = selected.location;
    $("room-rating").textContent = selected.rating;
    attachImgFallback($("room-photo"));
    attachImgFallback($("room-photo-2"));
    $("room-photo").src = selected.photo;
    $("room-photo-2").src = selected.photo2;
    $("room-description").textContent = selected.description;
    $("room-size").textContent = selected.size;
    $("room-bed").textContent = selected.bed;
    $("room-capacity").textContent = selected.capacity + " guests";
    $("room-price").textContent = thb(selected.price).replace(".00", "");
    $("amenities").innerHTML = selected.amenities.map(a => `<span>${a}</span>`).join("");
    $("detail-in").value = $("search-in").value;
    $("detail-out").value = $("search-out").value;
    $("detail-guests").value = $("search-guests").value;
    updateEstimate();

    go("details");
    window.dispatchEvent(new CustomEvent("staybook:room-open", { detail: { room: selected } }));
  }

  function continuePayment() {
    const d = getBreakdown();
    if (!d.count) return toast("Check-out must be after check-in.");
    const guests = Number($("detail-guests").value);
    if (guests > selected.capacity) return toast("This room supports up to " + selected.capacity + " guests.");
    priceBreakdown = d;
    attachImgFallback($("pay-photo"));
    $("pay-photo").src = selected.photo;
    $("pay-room").textContent = selected.name;
    $("pay-location").textContent = selected.location;
    $("pay-rating").textContent = selected.rating;
    $("pay-in").textContent = dateLabel($("detail-in").value);
    $("pay-out").textContent = dateLabel($("detail-out").value);
    $("pay-nights").textContent = d.count + (d.count === 1 ? " night" : " nights");
    $("pay-guests").textContent = guests + (guests === 1 ? " guest" : " guests");
    $("subtotal-label").textContent = thb(selected.price).replace(".00", "") + " × " + d.count + (d.count === 1 ? " night" : " nights");
    $("subtotal").textContent = thb(d.subtotal);
    $("service").textContent = thb(d.service);
    $("tax").textContent = thb(d.tax);
    $("total").textContent = thb(d.total);
    $("guest-email").value = $("login-email").value;
    go("payment");
  }

  $("brand-home").addEventListener("click", e => {
    e.preventDefault();
    go(currentPage === "login" ? "login" : "browse");
  });

  $("send-code").addEventListener("click", () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($("login-email").value.trim())) {
      return toast("Enter a valid email address.");
    }
    $("otp-area").classList.remove("hidden");
    $("otp").focus();
    toast("Demo code: 123456 — no email sent.");
  });

  $("verify").addEventListener("click", () => {
    if ($("otp").value.trim() !== "123456") return toast("Incorrect demo code. Use 123456.");
    go("browse");
  });

  $("search").addEventListener("click", () => {
    const n = nights($("search-in").value, $("search-out").value);
    if (!n) return toast("Choose a valid check-out date.");
    renderRooms();
    toast("Showing stays for " + n + (n === 1 ? " night." : " nights."));
  });

  $("back-browse").addEventListener("click", () => go("browse"));
  $("back-details").addEventListener("click", () => go("details"));
  ["detail-in", "detail-out"].forEach(id => $(id).addEventListener("change", updateEstimate));
  $("detail-guests").addEventListener("change", () => {
    if (Number($("detail-guests").value) > selected.capacity) {
      toast("Maximum capacity: " + selected.capacity + " guests.");
    }
  });
  $("reserve").addEventListener("click", continuePayment);

  $("confirm").addEventListener("click", () => {
    const name = $("guest-name").value.trim();
    const email = $("guest-email").value.trim();
    if (!name) return toast("Enter the guest's full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return toast("Enter a valid guest email.");
    if (!priceBreakdown) priceBreakdown = getBreakdown();
    $("reference").textContent = "SB-" + Math.floor(100000 + Math.random() * 900000);
    $("confirm-room").textContent = selected.name;
    $("confirm-guest").textContent = name;
    $("confirm-dates").textContent = dateLabel($("detail-in").value) + " – " + dateLabel($("detail-out").value);
    $("confirm-total").textContent = thb(priceBreakdown.total);
    go("confirmation");
  });

  $("restart").addEventListener("click", () => {
    $("otp-area").classList.add("hidden");
    $("guest-name").value = "";
    $("requests").value = "";
    go("login");
  });

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 17);
  const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  $("search-in").min = iso(now);
  $("detail-in").min = iso(now);
  $("search-in").value = iso(start);
  $("search-out").value = iso(end);
  renderRooms();
})();
