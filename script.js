const games = [
  {
    id: "roblox", title: "Roblox", genre: "Песочница", rating: 8.5, emoji: "🧱",
    tags: ["Песочница", "Мультиплеер"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Roblox_Logo_2025.png",
    description: "Огромная платформа с тысячами пользовательских миров. Исследуй разные режимы, строй, играй с друзьями и создавай собственные приключения."
  },
  {
    id: "brawl-stars", title: "Brawl Stars", genre: "Шутер", rating: 8.7, emoji: "⭐",
    tags: ["Шутер", "Мультиплеер"],
    image: "https://cdn.supercell.com/supercell.com/210304105450/supercell.com/files/og_mainpage.png",
    description: "Динамичные командные сражения, разные бойцы и короткие матчи. Выбирай персонажа, играй с друзьями и пробуй новые стратегии."
  },
  {
    id: "left-4-dead", title: "Left 4 Dead", genre: "Хоррор", rating: 8.3, emoji: "🧟",
    tags: ["Хоррор", "Шутер", "Мультиплеер"],
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/500/library_600x900.jpg",
    description: "Кооперативный зомби-шутер, в котором команда выживших пытается пройти опасные уровни. Действуй сообща и следи за каждым углом."
  },
  {
    id: "sally-face", title: "Sally Face", genre: "Хоррор", rating: 9.1, emoji: "🎭",
    tags: ["Хоррор", "Приключения"],
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/541570/library_600x900.jpg",
    description: "Мрачное сюжетное приключение с необычным визуальным стилем, загадками и тайнами. История раскрывается постепенно, глава за главой."
  },
  {
    id: "fran-bow", title: "Fran Bow", genre: "Приключения", rating: 9.0, emoji: "🖤",
    tags: ["Хоррор", "Приключения"],
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/362680/library_600x900.jpg",
    description: "Психологическая point-and-click история с головоломками и мрачной сказочной атмосферой. Помогай Фрэн искать ответы и раскрывать тайны."
  },
  {
    id: "little-nightmares", title: "Little Nightmares", genre: "Хоррор", rating: 8.8, emoji: "🌑",
    tags: ["Хоррор", "Приключения"],
    image: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/424840/library_600x900.jpg",
    description: "Атмосферное приключение о маленьком герое в огромном и пугающем мире. Прячься, исследуй окружение и решай, как выбраться."
  }
];

const gameGrid = document.getElementById("game-grid");
const libraryGrid = document.getElementById("library-grid");
const searchInput = document.getElementById("search-input");
const ratingFilter = document.getElementById("rating-filter");
const resultsCount = document.getElementById("results-count");
const emptyMessage = document.getElementById("empty-message");
const modal = document.getElementById("game-modal");
let activeGenre = "Все";
let activeGameId = null;
let savedGames = [];

try {
  savedGames = JSON.parse(localStorage.getItem("gamehub-library") || "[]");
  if (!Array.isArray(savedGames)) savedGames = [];
} catch {
  savedGames = [];
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function gameImage(game, extraClass = "") {
  return `<img class="${extraClass}" src="${game.image}" alt="${escapeHTML(game.title)}" loading="lazy"
    onerror="this.style.display='none'; this.parentElement.querySelector('.cover-fallback')?.classList.remove('hidden')">`;
}

function filteredGames() {
  const query = searchInput.value.trim().toLowerCase();
  const minRating = Number(ratingFilter.value);
  return games.filter(game => {
    const matchesQuery = (game.title + " " + game.genre + " " + game.tags.join(" ")).toLowerCase().includes(query);
    const matchesGenre = activeGenre === "Все" || game.tags.includes(activeGenre) || game.genre === activeGenre;
    return matchesQuery && matchesGenre && game.rating >= minRating;
  });
}

function renderGames() {
  const filtered = filteredGames();
  resultsCount.textContent = `(${filtered.length})`;
  emptyMessage.classList.toggle("hidden", filtered.length !== 0);
  gameGrid.innerHTML = filtered.map(game => `
    <article class="game-card">
      <div class="game-cover">
        ${gameImage(game)}
        <span class="cover-fallback hidden">${game.emoji}</span>
        <div class="cover-overlay"></div>
        <span class="game-badge">${escapeHTML(game.genre)}</span>
        <button class="heart-btn ${savedGames.includes(game.id) ? "saved" : ""}" data-save="${game.id}" aria-label="Добавить в библиотеку">${savedGames.includes(game.id) ? "♥" : "♡"}</button>
      </div>
      <div class="game-info">
        <h3>${escapeHTML(game.title)}</h3>
        <div class="game-meta"><span class="rating">★ ${game.rating.toFixed(1)}</span><span>Оценка игроков</span></div>
        <p>${escapeHTML(game.description.slice(0, 92))}…</p>
        <div class="card-actions">
          <button class="details-btn" data-details="${game.id}">Подробнее</button>
          <button class="save-btn" data-save="${game.id}">${savedGames.includes(game.id) ? "В библиотеке ✓" : "♡ Сохранить"}</button>
        </div>
      </div>
    </article>
  `).join("");
}

function saveLibrary() {
  localStorage.setItem("gamehub-library", JSON.stringify(savedGames));
  document.getElementById("library-count").textContent = savedGames.length;
  document.getElementById("library-title-count").textContent = `(${savedGames.length})`;
  renderLibrary();
  renderGames();
}

function toggleSaved(id) {
  savedGames = savedGames.includes(id) ? savedGames.filter(item => item !== id) : [...savedGames, id];
  saveLibrary();
  if (activeGameId === id) updateModalSaveButton();
}

function renderLibrary() {
  const selected = games.filter(game => savedGames.includes(game.id));
  if (!selected.length) {
    libraryGrid.innerHTML = `<div class="library-empty">♡<span>Здесь пока пусто</span><small>Нажми на сердечко в карточке игры, чтобы добавить её сюда.</small></div>`;
    return;
  }
  libraryGrid.innerHTML = selected.map(game => `
    <article class="library-item">
      ${gameImage(game)}
      <div><h4>${escapeHTML(game.title)}</h4><p>${escapeHTML(game.genre)} · ★ ${game.rating.toFixed(1)}</p></div>
      <button class="heart-btn saved" data-save="${game.id}" aria-label="Убрать из библиотеки">♥</button>
    </article>
  `).join("");
}

function openDetails(id) {
  const game = games.find(item => item.id === id);
  if (!game) return;
  activeGameId = id;
  document.getElementById("modal-cover").innerHTML = `${gameImage(game)}<span class="cover-fallback hidden">${game.emoji}</span>`;
  document.getElementById("modal-genre").textContent = game.tags.join(" · ");
  document.getElementById("modal-title").textContent = game.title;
  document.getElementById("modal-rating").textContent = `★ ${game.rating.toFixed(1)} / 10 · Демонстрационный рейтинг`;
  document.getElementById("modal-description").textContent = game.description;
  updateModalSaveButton();
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function updateModalSaveButton() {
  const button = document.getElementById("modal-library-btn");
  const saved = savedGames.includes(activeGameId);
  button.textContent = saved ? "♥ Убрать из библиотеки" : "♡ Добавить в библиотеку";
}

function closeModal() {
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}

document.addEventListener("click", event => {
  const saveButton = event.target.closest("[data-save]");
  const detailsButton = event.target.closest("[data-details]");
  const genreButton = event.target.closest("[data-genre]");
  if (saveButton) toggleSaved(saveButton.dataset.save);
  if (detailsButton) openDetails(detailsButton.dataset.details);
  if (genreButton) {
    activeGenre = genreButton.dataset.genre;
    document.querySelectorAll(".genre-chip").forEach(button => button.classList.toggle("selected", button === genreButton));
    renderGames();
    document.getElementById("games").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (event.target.dataset.close === "true") closeModal();
});

searchInput.addEventListener("input", renderGames);
ratingFilter.addEventListener("change", renderGames);
document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-library-btn").addEventListener("click", () => {
  if (activeGameId) toggleSaved(activeGameId);
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

document.getElementById("library-count").textContent = savedGames.length;
document.getElementById("library-title-count").textContent = `(${savedGames.length})`;
renderGames();
renderLibrary();
