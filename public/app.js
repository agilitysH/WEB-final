const TOKEN_KEY = "token";
const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);



const API_BASE = "/api";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const parseJson = async (response) => {
    const text = await response.text();
    if (!text) {
        return null;
    }
    try {
        return JSON.parse(text);
    } catch {
        return { message: text };
    }
};

const request = async (path, options = {}) => {
const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
    const response = await fetch(path, options);
    const data = await parseJson(response);
    if (!response.ok) {
        const message = data?.message || "Request failed.";
        throw new Error(message);}
    return data;
};

const setStatus = (element, message, type) => {
    if (!element) {
        return;
    }
    element.textContent = message || "";
    element.classList.remove("error", "success");
    if (type) {
        element.classList.add(type);
    }
};

const createCard = (content, className) => {
    const card = document.createElement("div");
    card.className = className ? `card ${className}` : "card";
    card.innerHTML = content;
    return card;
};

const syncUserId = (value) => {
    if (!value) {
        return;
    }
    localStorage.setItem("userId", value);
    const watchlistUser = $("#watchlist-user");
    const reviewsUser = $("#reviews-user");
    if (watchlistUser && watchlistUser.value !== value) {
        watchlistUser.value = value;
    }
    if (reviewsUser && reviewsUser.value !== value) {
        reviewsUser.value = value;
    }
};

async function doLogin(username, password) {
  const data = await request(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  setToken(data.accessToken);
  setUserId(data.id); 
  return data;
}

async function doRegister(username, email, password) {
  return request(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
}

function logout() {
  clearToken();
  clearUserId();
}

const initUserInputs = () => {
    const stored = getStoredUserId();
    const watchlistUser = $("#watchlist-user");
    const reviewsUser = $("#reviews-user");
    if (watchlistUser && stored) {
        watchlistUser.value = stored;
    }
    if (reviewsUser && stored) {
        reviewsUser.value = stored;
    }

    watchlistUser?.addEventListener("input", (event) => syncUserId(event.target.value.trim()));
    reviewsUser?.addEventListener("input", (event) => syncUserId(event.target.value.trim()));
};

const renderEmptyState = (container, message) => {
    container.innerHTML = `<p>${message}</p>`;
    container.classList.add("empty-state");
};

const renderAnimeResults = (results) => {
    const container = $("#anime-results");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    container.classList.remove("empty-state");

    if (!results || results.length === 0) {
        renderEmptyState(container, "No anime found.");
        return;
    }

    results.forEach((item) => {
        const card = createCard(
            `
            ${item.image ? `<img class="image-thumb" src="${item.image}" alt="${item.title}" />` : ""}
            <div class="card-title">
                <span>${item.title || "Untitled"}</span>
                <span class="badge">${item.score ?? "N/A"}</span>
            </div>
            <div>Episodes: ${item.episodes ?? "?"}</div>
            <div>Year: ${item.year ?? "?"}</div>
            <div class="card-actions">
                <button class="btn ghost anime-detail-btn" data-id="${item.id}">Details</button>
            </div>
        `,
            "anime-card",
        );
        card.dataset.id = item.id;
        container.appendChild(card);
    });
};

const setAnimeResults = (results) => {
    const normalized = Array.isArray(results) ? results : [];
    renderAnimeResults(normalized);
};

const renderAnimeDetail = (detail) => {
    const container = $("#anime-detail");
    if (!container) {
        return;
    }
    container.classList.remove("empty-state");
    container.innerHTML = `
        ${detail.image ? `<img class="image-thumb" src="${detail.image}" alt="${detail.title}" />` : ""}
        <div class="card-title">
            <span>${detail.title || "Unknown title"}</span>
            <span class="badge">${detail.score ?? detail.mean ?? "N/A"}</span>
        </div>
        <div>${detail.synopsis || "No synopsis provided."}</div>
        <div>Episodes: ${detail.episodes ?? detail.numEpisodes ?? "?"}</div>
        <div>Status: ${detail.status ?? "?"}</div>
        <div>Genres: ${(detail.genres || []).join(", ") || "?"}</div>
    `;
};

const renderWatchlist = (items) => {
    const container = $("#watchlist-results");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    container.classList.remove("empty-state");

    if (!items || items.length === 0) {
        renderEmptyState(container, "No watchlist items found.");
        return;
    }

    items.forEach((item) => {
        const statusOptions = ["Watching", "Plan to Watch", "Completed", "Dropped"]
            .map(
                (status) =>
                    `<option value="${status}" ${
                        status === item.status ? "selected" : ""
                    }>${status}</option>`,
            )
            .join("");
        const card = createCard(`
            <div class="card-title">
                <span>${item.title}</span>
                <span class="badge">${item.status}</span>
            </div>
            <div>Anime ID: ${item.animeId}</div>
            <div>Episodes: ${item.episodesWatched ?? 0}</div>
            <div>Score: ${item.score ?? "N/A"}</div>
            <div class="card-actions">
                <select name="status">${statusOptions}</select>
                <input type="number" name="episodesWatched" min="0" placeholder="Episodes" value="${item.episodesWatched ?? 0}" />
                <input type="number" name="score" min="1" max="10" placeholder="Score" value="${item.score ?? ""}" />
                <button class="btn ghost watchlist-update-btn" data-id="${item.id}">Update</button>
                <button class="btn ghost watchlist-delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `);
        container.appendChild(card);
    });
};

const renderReviews = (items) => {
    const container = $("#reviews-results");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    container.classList.remove("empty-state");

    if (!items || items.length === 0) {
        renderEmptyState(container, "No reviews found.");
        return;
    }

    items.forEach((item) => {
        const card = createCard(`
            <div class="card-title">
                <span>Anime ${item.animeId}</span>
                <span class="badge">${item.rating}/10</span>
            </div>
            <div>${item.reviewText}</div>
            <div>Likes: ${item.likesCount ?? 0}</div>
            <div class="card-actions">
                <textarea name="reviewText" rows="2">${item.reviewText}</textarea>
                <input type="number" name="rating" min="1" max="10" value="${item.rating}" />
                <button class="btn ghost review-update-btn" data-id="${item.id}">Update</button>
                <button class="btn ghost review-delete-btn" data-id="${item.id}">Delete</button>
                <button class="btn ghost review-like-btn" data-id="${item.id}">Like</button>
            </div>
        `);
        container.appendChild(card);
    });
};

const handleAnimeSearch = () => {
    const form = $("#anime-search-form");
    const status = $("#anime-status");
    const trendingBtn = $("#anime-trending-btn");

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const query = formData.get("title")?.toString().trim();
        const genre = formData.get("genre")?.toString().trim();
        const provider = formData.get("provider")?.toString();
        const popular = formData.get("popular") === "on";

        const params = new URLSearchParams();
        if (query) params.set("title", query);
        if (genre) params.set("genre", genre);
        if (provider) params.set("provider", provider);
        if (popular) {
            params.set("orderBy", "popularity");
            params.set("sort", "asc");
        }

        setStatus(status, "Searching...", null);
        try {
            const data = await request(`${API_BASE}/anime/search?${params.toString()}`);
            setAnimeResults(data.results);
            setStatus(status, `Found ${data.results?.length ?? 0} results.`, "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

    trendingBtn?.addEventListener("click", async () => {
        const provider = form?.querySelector("select[name='provider']")?.value || "jikan";
        setStatus(status, "Loading trending anime...", null);
        try {
            const data = await request(`${API_BASE}/anime/trending?provider=${provider}`);
            setAnimeResults(data.results);
            setStatus(status, `Loaded ${data.results?.length ?? 0} trending titles.`, "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

    $("#anime-results")?.addEventListener("click", async (event) => {
        const button = event.target.closest(".anime-detail-btn");
        const card = event.target.closest(".anime-card");
        if (!button && !card) {
            return;
        }
        const provider = form?.querySelector("select[name='provider']")?.value || "jikan";
        const animeId = button?.dataset.id || card?.dataset.id;
        if (!animeId) {
            return;
        }
        setStatus(status, "Loading details...", null);
        try {
            const data = await request(`${API_BASE}/anime/${animeId}?provider=${provider}`);
            renderAnimeDetail(data.result);
            setStatus(status, "Details loaded.", "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

};

const handleWatchlist = () => {
    const form = $("#watchlist-form");
    const status = $("#watchlist-status");
    const loadBtn = $("#watchlist-load-btn");

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const userId = formData.get("userId")?.toString().trim();
        const animeId = Number(formData.get("animeId"));
        const title = formData.get("title")?.toString().trim();
        const statusValue = formData.get("status")?.toString();
        const episodesWatched = Number(formData.get("episodesWatched"));
        const scoreRaw = formData.get("score")?.toString();

        if (!userId) {
            setStatus(status, "User ID is required.", "error");
            return;
        }
        if (!Number.isFinite(animeId)) {
            setStatus(status, "Anime ID must be a number.", "error");
            return;
        }
        if (!title) {
            setStatus(status, "Title is required.", "error");
            return;
        }

        syncUserId(userId);

        const payload = {
            userId,
            animeId,
            title,
            status: statusValue,
            episodesWatched: Number.isNaN(episodesWatched) ? 0 : episodesWatched,
        };
        if (scoreRaw) {
            payload.score = Number(scoreRaw);
        }

        setStatus(status, "Adding to watchlist...", null);
        try {
            await request(`${API_BASE}/watchlist`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus(status, "Added to watchlist.", "success");
            form.reset();
            $("#watchlist-user").value = userId;
            await loadWatchlist();
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

    const loadWatchlist = async () => {
        const userId = $("#watchlist-user")?.value.trim();
        if (!userId) {
            setStatus(status, "User ID is required to load watchlist.", "error");
            return;
        }
        syncUserId(userId);
        setStatus(status, "Loading watchlist...", null);
        try {
            const data = await request(`${API_BASE}/watchlist?userId=${userId}`);
            renderWatchlist(data);
            setStatus(status, `Loaded ${data.length} items.`, "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    };

    loadBtn?.addEventListener("click", loadWatchlist);

    $("#watchlist-results")?.addEventListener("click", async (event) => {
        const updateBtn = event.target.closest(".watchlist-update-btn");
        const deleteBtn = event.target.closest(".watchlist-delete-btn");
        if (!updateBtn && !deleteBtn) {
            return;
        }

        const card = event.target.closest(".card");
        const itemId = (updateBtn || deleteBtn).dataset.id;

        if (deleteBtn) {
            setStatus(status, "Removing item...", null);
            try {
                await request(`${API_BASE}/watchlist/${itemId}`, { method: "DELETE" });
                setStatus(status, "Item removed.", "success");
                await loadWatchlist();
            } catch (error) {
                setStatus(status, error.message, "error");
            }
            return;
        }

        const statusInput = card.querySelector("select[name='status']");
        const episodesInput = card.querySelector("input[name='episodesWatched']");
        const scoreInput = card.querySelector("input[name='score']");

        const payload = {};
        if (statusInput?.value) {
            payload.status = statusInput.value;
        }
        if (episodesInput?.value) {
            payload.episodesWatched = Number(episodesInput.value);
        }
        if (scoreInput?.value) {
            payload.score = Number(scoreInput.value);
        }

        setStatus(status, "Updating item...", null);
        try {
            await request(`${API_BASE}/watchlist/${itemId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus(status, "Item updated.", "success");
            await loadWatchlist();
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });
};

const handleReviews = () => {
    const form = $("#review-form");
    const status = $("#reviews-status");
    const loadBtn = $("#reviews-load-btn");

    const loadReviews = async () => {
        const animeId = $("#reviews-anime")?.value;
        if (!animeId) {
            setStatus(status, "Anime ID is required to load reviews.", "error");
            return;
        }
        setStatus(status, "Loading reviews...", null);
        try {
            const data = await request(`${API_BASE}/reviews/anime/${animeId}`);
            renderReviews(data);
            setStatus(status, `Loaded ${data.length} reviews.`, "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    };

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const userId = formData.get("userId")?.toString().trim();
        const animeId = Number(formData.get("animeId"));
        const rating = Number(formData.get("rating"));
        const reviewText = formData.get("reviewText")?.toString().trim();

        if (!userId) {
            setStatus(status, "User ID is required.", "error");
            return;
        }
        if (!Number.isFinite(animeId)) {
            setStatus(status, "Anime ID must be a number.", "error");
            return;
        }
        if (!Number.isFinite(rating)) {
            setStatus(status, "Rating must be a number.", "error");
            return;
        }

        syncUserId(userId);

        setStatus(status, "Publishing review...", null);
        try {
            await request(`${API_BASE}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, animeId, rating, reviewText }),
            });
            setStatus(status, "Review published.", "success");
            form.reset();
            $("#reviews-user").value = userId;
            $("#reviews-anime").value = animeId;
            await loadReviews();
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

    loadBtn?.addEventListener("click", loadReviews);

    $("#reviews-results")?.addEventListener("click", async (event) => {
        const updateBtn = event.target.closest(".review-update-btn");
        const deleteBtn = event.target.closest(".review-delete-btn");
        const likeBtn = event.target.closest(".review-like-btn");

        if (!updateBtn && !deleteBtn && !likeBtn) {
            return;
        }

        const card = event.target.closest(".card");
        const reviewId = (updateBtn || deleteBtn || likeBtn).dataset.id;

        if (deleteBtn) {
            setStatus(status, "Deleting review...", null);
            try {
                await request(`${API_BASE}/reviews/${reviewId}`, { method: "DELETE" });
                setStatus(status, "Review deleted.", "success");
                await loadReviews();
            } catch (error) {
                setStatus(status, error.message, "error");
            }
            return;
        }

        if (likeBtn) {
            const userId = $("#reviews-user")?.value.trim();
            if (!userId) {
                setStatus(status, "User ID is required to like.", "error");
                return;
            }
            setStatus(status, "Toggling like...", null);
            try {
                await request(`${API_BASE}/reviews/${reviewId}/like`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId }),
                });
                setStatus(status, "Like updated.", "success");
                await loadReviews();
            } catch (error) {
                setStatus(status, error.message, "error");
            }
            return;
        }

        const reviewText = card.querySelector("textarea[name='reviewText']")?.value.trim();
        const ratingValue = card.querySelector("input[name='rating']")?.value;
        const payload = {};
        if (reviewText) {
            payload.reviewText = reviewText;
        }
        if (ratingValue) {
            payload.rating = Number(ratingValue);
        }

        setStatus(status, "Updating review...", null);
        try {
            await request(`${API_BASE}/reviews/${reviewId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus(status, "Review updated.", "success");
            await loadReviews();
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });
};

const init = () => {
    initUserInputs();
    handleAnimeSearch();
    handleWatchlist();
    handleReviews();
};

init();
