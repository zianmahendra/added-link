/* ===========================
   AI LINKS — app.js
=========================== */

/* ---- DEFAULT DATA ---- */
const DEFAULT_LINKS = [
  {
    id: "1",
    name: "Claude",
    url: "https://claude.ai",
    category: "chat",
    desc: "AI assistant dari Anthropic. Pintar buat nulis, analisis, coding, dan ngobrol panjang. Context window-nya gede banget.",
    emoji: "✦"
  },
  {
    id: "2",
    name: "ChatGPT",
    url: "https://chatgpt.com",
    category: "chat",
    desc: "AI chat paling populer dari OpenAI. Punya GPT-4o dan bisa browsing web, bikin gambar dengan DALL-E, plus plugins.",
    emoji: "💬"
  },
  {
    id: "3",
    name: "Midjourney",
    url: "https://midjourney.com",
    category: "gambar",
    desc: "AI image generator terbaik buat hasil yang artistik dan cinematic. Kualitasnya luar biasa, paling bagus untuk desain.",
    emoji: "🎨"
  },
  {
    id: "4",
    name: "GitHub Copilot",
    url: "https://github.com/features/copilot",
    category: "kode",
    desc: "AI coding assistant langsung di dalam editor. Autocomplete kode, suggest fungsi, dan bantu debug secara real-time.",
    emoji: "💻"
  },
  {
    id: "5",
    name: "Perplexity AI",
    url: "https://perplexity.ai",
    category: "riset",
    desc: "Search engine berbasis AI yang kasih jawaban lengkap dengan sumber. Bagus banget buat riset dan fact-checking.",
    emoji: "🔍"
  },
  {
    id: "6",
    name: "Suno AI",
    url: "https://suno.ai",
    category: "audio",
    desc: "Buat lagu lengkap dengan vokal dan instrumen cuma dari teks. Hasilnya mengejutkan — bisa bikin lagu pop, rock, jazz.",
    emoji: "🎵"
  }
];

/* ---- STATE ---- */
let links = [];
let editingId = null;
let activeFilter = "all";

const STORAGE_KEY = "ai-links-v1";

/* ---- STORAGE ---- */
function loadLinks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      links = JSON.parse(saved);
    } else {
      links = [...DEFAULT_LINKS];
      saveLinks();
    }
  } catch {
    links = [...DEFAULT_LINKS];
  }
}

function saveLinks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
}

/* ---- RENDER ---- */
function getCategoryLabel(cat) {
  const map = {
    chat: "💬 Chat",
    gambar: "🎨 Gambar",
    kode: "💻 Kode",
    produktivitas: "⚡ Produktivitas",
    riset: "🔍 Riset",
    audio: "🎵 Audio",
    video: "🎬 Video",
    lainnya: "✨ Lainnya"
  };
  return map[cat] || cat;
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function createCard(link, delay) {
  const card = document.createElement("div");
  card.className = "link-card";
  card.dataset.id = link.id;
  card.style.animationDelay = `${delay * 40}ms`;

  card.innerHTML = `
    <div class="card-top">
      <div class="card-identity">
        <div class="card-emoji">${link.emoji || "🤖"}</div>
        <div class="card-name-wrap">
          <div class="card-name">${escHtml(link.name)}</div>
          <div class="card-url">${escHtml(getDomain(link.url))}</div>
        </div>
      </div>
      <div class="card-actions">
        <button class="action-btn edit" data-id="${link.id}" title="Edit" aria-label="Edit ${escHtml(link.name)}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="action-btn delete" data-id="${link.id}" title="Hapus" aria-label="Hapus ${escHtml(link.name)}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>
    </div>
    ${link.desc ? `<p class="card-desc">${escHtml(link.desc)}</p>` : ""}
    <div class="card-footer">
      <span class="category-badge cat-${link.category}">${getCategoryLabel(link.category)}</span>
      <a class="visit-link" href="${escAttr(link.url)}" target="_blank" rel="noopener noreferrer">
        Kunjungi
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>
  `;

  card.querySelector(".edit").addEventListener("click", () => openEditModal(link.id));
  card.querySelector(".delete").addEventListener("click", () => deleteLink(link.id));

  return card;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

function getFilteredLinks() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  return links.filter(link => {
    const matchCat = activeFilter === "all" || link.category === activeFilter;
    const matchSearch = !query ||
      link.name.toLowerCase().includes(query) ||
      link.desc.toLowerCase().includes(query) ||
      link.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });
}

function render() {
  const grid = document.getElementById("linksGrid");
  const emptyState = document.getElementById("emptyState");
  const filtered = getFilteredLinks();

  grid.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.style.display = "flex";
  } else {
    emptyState.style.display = "none";
    filtered.forEach((link, i) => {
      grid.appendChild(createCard(link, i));
    });
  }

  const total = links.length;
  const shown = filtered.length;
  const statsText = document.getElementById("statsText");
  if (total === 0) {
    statsText.textContent = "Belum ada link — tambahkan yang pertama!";
  } else if (shown === total) {
    statsText.textContent = `${total} link tersimpan`;
  } else {
    statsText.textContent = `Menampilkan ${shown} dari ${total} link`;
  }
}

/* ---- MODAL ---- */
function openModal(title, fillData) {
  const overlay = document.getElementById("modalOverlay");
  document.getElementById("modalTitle").textContent = title;

  document.getElementById("inputName").value = fillData?.name || "";
  document.getElementById("inputUrl").value = fillData?.url || "";
  document.getElementById("inputCategory").value = fillData?.category || "chat";
  document.getElementById("inputDesc").value = fillData?.desc || "";
  document.getElementById("inputEmoji").value = fillData?.emoji || "";

  overlay.setAttribute("aria-hidden", "false");
  overlay.classList.add("open");
  document.getElementById("inputName").focus();
}

function closeModal() {
  const overlay = document.getElementById("modalOverlay");
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
  editingId = null;
}

function openEditModal(id) {
  const link = links.find(l => l.id === id);
  if (!link) return;
  editingId = id;
  openModal("Edit Link", link);
}

/* ---- SAVE ---- */
function saveLink() {
  const name = document.getElementById("inputName").value.trim();
  const url = document.getElementById("inputUrl").value.trim();
  const category = document.getElementById("inputCategory").value;
  const desc = document.getElementById("inputDesc").value.trim();
  const emoji = document.getElementById("inputEmoji").value.trim() || "🤖";

  if (!name) { showToast("⚠️ Nama AI tidak boleh kosong"); return; }
  if (!url) { showToast("⚠️ URL tidak boleh kosong"); return; }

  let finalUrl = url;
  if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
    finalUrl = "https://" + finalUrl;
  }

  if (editingId) {
    const idx = links.findIndex(l => l.id === editingId);
    if (idx !== -1) {
      links[idx] = { ...links[idx], name, url: finalUrl, category, desc, emoji };
    }
    showToast("✓ Link diperbarui");
  } else {
    const newLink = {
      id: Date.now().toString(),
      name, url: finalUrl, category, desc, emoji
    };
    links.unshift(newLink);
    showToast("✓ Link ditambahkan");
  }

  saveLinks();
  closeModal();
  render();
}

/* ---- DELETE ---- */
function deleteLink(id) {
  const link = links.find(l => l.id === id);
  if (!link) return;
  if (!confirm(`Hapus "${link.name}"?`)) return;
  links = links.filter(l => l.id !== id);
  saveLinks();
  render();
  showToast("Link dihapus");
}

/* ---- TOAST ---- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

/* ---- EVENT LISTENERS ---- */
document.getElementById("btnOpenModal").addEventListener("click", () => {
  editingId = null;
  openModal("Tambah Link Baru");
});

document.getElementById("btnOpenModalEmpty").addEventListener("click", () => {
  editingId = null;
  openModal("Tambah Link Pertama");
});

document.getElementById("btnCloseModal").addEventListener("click", closeModal);
document.getElementById("btnCancelModal").addEventListener("click", closeModal);
document.getElementById("btnSaveLink").addEventListener("click", saveLink);

document.getElementById("modalOverlay").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if ((e.key === "Enter") && document.getElementById("modalOverlay").classList.contains("open")) {
    const focused = document.activeElement.tagName;
    if (focused !== "TEXTAREA" && focused !== "BUTTON") saveLink();
  }
});

document.getElementById("searchInput").addEventListener("input", render);

document.getElementById("filterTags").addEventListener("click", (e) => {
  const btn = e.target.closest(".tag-btn");
  if (!btn) return;
  document.querySelectorAll(".tag-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = btn.dataset.cat;
  render();
});

/* ---- INIT ---- */
loadLinks();
render();
