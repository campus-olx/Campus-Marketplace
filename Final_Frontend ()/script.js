// script.js — index.html (landing page) logic

document.addEventListener("DOMContentLoaded", () => {
  updateNavAuth();

  // ── My Transactions button (show only if logged in) ────────
  const txnBtn = document.getElementById("txnBtn");
  if (txnBtn && isLoggedIn()) {
    txnBtn.style.display = "inline-flex";
  }

  // ── Sell button: require login ─────────────────────────────
  const sellBtn = document.getElementById("sellBtn");
  if (sellBtn) {
    sellBtn.addEventListener("click", () => {
      if (!isLoggedIn()) {
        showToast("Please login first to sell an item.", "info");
        setTimeout(() => { window.location.href = "login.html"; }, 900);
      } else {
        window.location.href = "sell.html";
      }
    });
  }

  // ── Login button ───────────────────────────────────────────
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => { window.location.href = "login.html"; });
  }

  // ── Logo dropdown ──────────────────────────────────────────
  window.toggleDropdown = function () {
    const dropdown = document.getElementById("logo-dropdown");
    if (dropdown) dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
  };
  window.onclick = function (event) {
    if (!event.target.closest(".logo-container")) {
      const dropdown = document.getElementById("logo-dropdown");
      if (dropdown) dropdown.style.display = "none";
    }
  };

  // ── Back to Top ────────────────────────────────────────────
  const topBtn = document.getElementById("backToTop");
  if (topBtn) {
    window.addEventListener("scroll", () => {
      topBtn.style.display = window.scrollY > 400 ? "block" : "none";
    });
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ── File size check ────────────────────────────────────────
  window.checkFileSize = function (input) {
    if (input.files && input.files[0]) {
      if (input.files[0].size / 1024 / 1024 > 5) {
        showToast("File too large! Max 5MB.", "error");
        input.value = "";
      }
    }
  };

  // ── Contact seller ─────────────────────────────────────────
  window.contactSeller = function (itemName, price) {
    if (!isLoggedIn()) {
      showToast("Please login to contact the seller.", "info");
      setTimeout(() => { window.location.href = "login.html"; }, 900);
    } else {
      showToast(`Interested in ${itemName} (₹${price})? Feature coming soon!`, "info");
    }
  };

  // ── Load featured listings from backend ───────────────────
  loadFeaturedListings();
});

// ═══════════════════════════════════════════════════════════════
// FETCH LISTINGS FROM BACKEND
// ═══════════════════════════════════════════════════════════════
async function loadFeaturedListings() {
  const container = document.getElementById("listingsContainer");
  if (!container) return; // page has no listings container, skip silently

  container.innerHTML = `
    <div style="text-align:center; padding:40px; color:#94a3b8; grid-column:1/-1;">
      <i class="fa fa-spinner fa-spin" style="font-size:24px;"></i>
      <p style="margin-top:12px;">Loading listings…</p>
    </div>`;

  try {
    const res  = await fetch(`${API_BASE}/api/listings?limit=8&sort=-createdAt`);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      container.innerHTML = `
        <p style="text-align:center; color:#94a3b8; grid-column:1/-1; padding:40px;">
          No listings yet. Be the first to sell something!
        </p>`;
      return;
    }

    container.innerHTML = "";
    data.data.forEach(item => {
      const imgSrc = item.images?.[0]?.url || "https://via.placeholder.com/300x180?text=No+Image";
      const stars  = "★".repeat(Math.round(item.seller?.trustScore || 5))
                   + "☆".repeat(5 - Math.round(item.seller?.trustScore || 5));

      const card = document.createElement("div");
      card.className = "category-card";
      card.style.cursor = "pointer";
      card.innerHTML = `
        <img src="${imgSrc}" alt="${item.title}"
             style="width:100%;height:180px;object-fit:cover;border-radius:10px 10px 0 0;"
             onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
        <div class="card-text" style="padding:12px;">
          <h3 style="margin:0 0 6px;font-size:15px;">${item.title}</h3>
          <p style="color:#22c55e;font-weight:700;margin:4px 0;">₹${item.price.toLocaleString("en-IN")}</p>
          <p style="color:#94a3b8;font-size:12px;margin:2px 0;">${item.condition} · ${item.category}</p>
          <p style="color:#f59e0b;font-size:12px;">${stars} ${item.seller?.name || "Seller"}</p>
        </div>`;

      card.addEventListener("click", () => {
        window.location.href = `category.html?category=${encodeURIComponent(item.category)}`;
      });

      container.appendChild(card);
    });

  } catch (err) {
    // Backend not running — fail silently, don't break the page
    console.warn("Backend not reachable, skipping listings fetch:", err.message);
    if (container) container.innerHTML = "";
  }
}