const API_BASE = "/api";


const TOKEN_KEY = "token";
const USERNAME_KEY = "username";
const EPISODES_KEY = "animeEpisodes";
const TITLES_KEY = "animeTitles";
const getToken = () => localStorage.getItem(TOKEN_KEY) || "";
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => localStorage.removeItem(TOKEN_KEY);
const getStoredUsername = () => localStorage.getItem(USERNAME_KEY) || "";
const setStoredUsername = (username) => {
    if (!username) {
        return;
    }
    localStorage.setItem(USERNAME_KEY, username);
};
const clearStoredUsername = () => localStorage.removeItem(USERNAME_KEY);
const getTitlesMap = () => {
    try {
        const raw = localStorage.getItem(TITLES_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};
const setTitlesMap = (map) => {
    localStorage.setItem(TITLES_KEY, JSON.stringify(map));
};
const setTitleForAnime = (animeId, title) => {
    if (!animeId || !title) {
        return;
    }
    const map = getTitlesMap();
    map[String(animeId)] = String(title);
    setTitlesMap(map);
};
const getTitleForAnime = (animeId) => {
    const map = getTitlesMap();
    return map[String(animeId)] || "";
};
const getEpisodesMap = () => {
    try {
        const raw = localStorage.getItem(EPISODES_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
};
const setEpisodesMap = (map) => {
    localStorage.setItem(EPISODES_KEY, JSON.stringify(map));
};
const setEpisodesForAnime = (animeId, total) => {
    if (!animeId || !Number.isFinite(Number(total))) {
        return;
    }
    const map = getEpisodesMap();
    map[String(animeId)] = Number(total);
    setEpisodesMap(map);
};
const getEpisodesForAnime = (animeId) => {
    const map = getEpisodesMap();
    const value = map[String(animeId)];
    return Number.isFinite(Number(value)) ? Number(value) : null;
};


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

    const response = await fetch(path, { ...options, headers });
    const data = await parseJson(response);
    if (!response.ok) {
        const message = data?.message || "Request failed.";
        throw new Error(message);
    }
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

const renderStarPickerMarkup = ({ name, value, max = 10, ariaLabel }) => {
    const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
    const displayValue = safeValue > 0 ? safeValue : "";
    return `
        <div class="star-picker" data-max="${max}">
            <div class="stars" role="radiogroup" aria-label="${ariaLabel}"></div>
            <input type="hidden" name="${name}" value="${displayValue}" />
        </div>
    `;
};

const initStarPicker = (picker) => {
    const input = picker.querySelector("input");
    const starsContainer = picker.querySelector(".stars");
    if (!input || !starsContainer) {
        return;
    }

    const max = Number(picker.dataset.max) || 10;
    const initialValue = Number(input.value) || 0;

    const updateStars = (value) => {
        const normalized = Math.max(0, Math.min(max, value));
        input.value = normalized ? String(normalized) : "";
        starsContainer.querySelectorAll(".star").forEach((star) => {
            const starValue = Number(star.dataset.value);
            star.classList.toggle("active", starValue <= normalized);
            star.setAttribute("aria-checked", starValue === normalized ? "true" : "false");
        });
    };

    starsContainer.innerHTML = "";
    for (let i = 1; i <= max; i += 1) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "star";
        button.dataset.value = String(i);
        button.setAttribute("role", "radio");
        button.setAttribute("aria-checked", "false");
        button.textContent = "\u2605";
        button.addEventListener("click", () => updateStars(i));
        starsContainer.appendChild(button);
    }
    updateStars(initialValue);
};

const initStarPickers = (root = document) => {
    root.querySelectorAll(".star-picker").forEach((picker) => initStarPicker(picker));
};

const debounce = (fn, delay = 300) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
};

const setupAnimePicker = ({ input, list, idInput, meta, titleInput, episodesInput }) => {
    if (!input || !list || !idInput) {
        return;
    }

    const clearSuggestions = () => {
        list.innerHTML = "";
        list.classList.add("hidden");
    };

    const updateMeta = (message) => {
        if (meta) {
            meta.textContent = message;
        }
    };

    const renderSuggestions = (results) => {
        clearSuggestions();
        if (!results || results.length === 0) {
            return;
        }
        list.classList.remove("hidden");
        results.forEach((item) => {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "suggestion-item";
            button.dataset.animeId = item.id;
            button.dataset.animeTitle = item.title || "Untitled";
            button.dataset.animeYear = item.year ?? "";
            button.dataset.animeEpisodes = item.episodes ?? item.numEpisodes ?? "";

            const title = document.createElement("span");
            title.className = "suggestion-title";
            title.textContent = item.title || "Untitled";

            const metaLine = document.createElement("span");
            metaLine.className = "suggestion-meta";
            const year = item.year ?? "?";
            const score = item.score ?? "N/A";
            metaLine.textContent = `${year} | Score ${score}`;

            button.append(title, metaLine);
            list.appendChild(button);
        });
    };

    const search = debounce(async () => {
        const query = input.value.trim();
        if (query.length < 2) {
            clearSuggestions();
            updateMeta(query ? "Type at least 2 characters to search." : "No anime selected.");
            return;
        }

        try {
            const data = await request(`${API_BASE}/anime/search?title=${encodeURIComponent(query)}`);
            const results = Array.isArray(data?.results) ? data.results.slice(0, 8) : [];
            renderSuggestions(results);
            if (results.length === 0) {
                updateMeta("No matches found.");
            }
        } catch (error) {
            clearSuggestions();
            updateMeta(error.message);
        }
    }, 350);

    input.addEventListener("input", () => {
        idInput.value = "";
        updateMeta("Searching...");
        search();
    });

    list.addEventListener("click", (event) => {
        const button = event.target.closest(".suggestion-item");
        if (!button) {
            return;
        }
        const animeId = button.dataset.animeId;
        const title = button.dataset.animeTitle;
        const year = button.dataset.animeYear;
        const episodes = button.dataset.animeEpisodes;

        idInput.value = animeId;
        input.value = title;
        if (titleInput) {
            titleInput.value = title;
        }
        if (title) {
            setTitleForAnime(animeId, title);
        }
        if (episodesInput) {
            episodesInput.value = episodes || "";
        }
        if (episodes && animeId) {
            setEpisodesForAnime(animeId, Number(episodes));
        }
        const yearLabel = year ? ` (${year})` : "";
        const episodesLabel = episodes ? ` • ${episodes} eps` : "";
        updateMeta(`Selected: ${title}${yearLabel}${episodesLabel}.`);
        clearSuggestions();
    });

    document.addEventListener("click", (event) => {
        if (event.target === input || list.contains(event.target)) {
            return;
        }
        clearSuggestions();
    });
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

const getStoredUserId = () => localStorage.getItem("userId") || "";

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


const updateAuthUI = (user) => {
    const authState = $("#auth-state");
    const navUser = $("#nav-user");
    const navLogout = $("#nav-logout");
    const logoutBtn = $("#logout-btn");
    const navLogin = $("#nav-login");
    const navRegister = $("#nav-register");

    const loggedIn = !!getToken() && !!getStoredUserId();
    const resolvedUsername = user?.username || getStoredUsername();

    if (authState) authState.textContent = loggedIn ? `Signed in as ${resolvedUsername || "user"} ✅` : "Not signed in.";
    if (navUser) {
        navUser.style.display = loggedIn ? "inline-flex" : "none";
        navUser.textContent = loggedIn ? (resolvedUsername || "Signed in") : "";
    }
    if (navLogout) navLogout.style.display = loggedIn ? "inline-flex" : "none";
    if (logoutBtn) logoutBtn.style.display = loggedIn ? "inline-flex" : "none";
    if (navLogin) navLogin.style.display = loggedIn ? "none" : "inline-flex";
    if (navRegister) navRegister.style.display = loggedIn ? "none" : "inline-flex";

    // If logged in, lock the "User ID" fields to the stored id (still mock-friendly).
    const uid = getStoredUserId();
    const watchlistUser = $("#watchlist-user");
    const reviewsUser = $("#reviews-user");
    if (watchlistUser) {
        watchlistUser.value = uid || watchlistUser.value;
        watchlistUser.disabled = loggedIn;
    }
    if (reviewsUser) {
        reviewsUser.value = uid || reviewsUser.value;
        reviewsUser.disabled = loggedIn;
    }
};

const handleAuth = () => {
    const loginForm = $("#login-form");
    const registerForm = $("#register-form");
    const loginStatus = $("#login-status");
    const registerStatus = $("#register-status");

    const doLogout = () => {
        clearToken();
        localStorage.removeItem("userId");
        clearStoredUsername();
        updateAuthUI(null);
    };

    $("#nav-logout")?.addEventListener("click", doLogout);
    $("#logout-btn")?.addEventListener("click", doLogout);

    loginForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(loginForm);
        const username = fd.get("username")?.toString().trim();
        const password = fd.get("password")?.toString();

        setStatus(loginStatus, "Signing in...", null);
        try {
            const data = await request(`${API_BASE}/auth/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!data?.accessToken || !data?.id) {
                throw new Error("Login succeeded but server response is missing token/id.");
            }

            setToken(data.accessToken);
            syncUserId(data.id);
            setStoredUsername(data.username);
            updateAuthUI({ username: data.username });

            setStatus(loginStatus, "Logged in.", "success");

            // Auto-load watchlist on login (main page behavior)
            window.loadWatchlist?.();

            // Redirect to main app page after login.
            const path = window.location.pathname;
            const isAuthPage = /\/(auth|login|register)\.html$/.test(path);
            if (!path.startsWith("/app") || isAuthPage) {
                window.location.assign("/app");
            }
        } catch (err) {
            doLogout();
            setStatus(loginStatus, err.message, "error");
        }
    });

    registerForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(registerForm);
        const payload = {
            username: fd.get("username")?.toString().trim(),
            email: fd.get("email")?.toString().trim(),
            password: fd.get("password")?.toString(),
        };

        if (!payload.password || payload.password.length < 6) {
            setStatus(registerStatus, "Password must be at least 6 characters.", "error");
            return;
        }

        setStatus(registerStatus, "Creating account...", null);
        try {
            await request(`${API_BASE}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            setStatus(registerStatus, "Account created. Now login.", "success");
            registerForm.reset();
        } catch (err) {
            setStatus(registerStatus, err.message, "error");
        }
    });

    // Initial UI state
    updateAuthUI(null);

    // If already logged in, load watchlist immediately
    if (getToken() && getStoredUserId()) {
        window.loadWatchlist?.();
    }
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
        const totalEpisodes = getEpisodesForAnime(item.animeId);
        const episodesLabel =
            Number.isFinite(totalEpisodes) && totalEpisodes > 0
                ? `${item.episodesWatched ?? 0} / ${totalEpisodes}`
                : `${item.episodesWatched ?? 0}`;
        const card = createCard(`
            <div class="card-title">
                <span>${item.title}</span>
                <span class="badge">${item.status}</span>
            </div>
            <div>Anime ID: ${item.animeId}</div>
            <div>Episodes: <span class="episodes-label" data-anime-id="${item.animeId}">${episodesLabel}</span></div>
            <div>Score: ${item.score ?? "N/A"}</div>
            <div class="card-actions">
                <select name="status">${statusOptions}</select>
                <input type="number" name="episodesWatched" min="0" placeholder="Episodes" value="${item.episodesWatched ?? 0}" />
                ${renderStarPickerMarkup({
                    name: "score",
                    value: item.score,
                    max: 10,
                    ariaLabel: "Score",
                })}
                <button class="btn ghost watchlist-update-btn" data-id="${item.id}">Update</button>
                <button class="btn ghost watchlist-delete-btn" data-id="${item.id}">Delete</button>
            </div>
        `);
        if (Number.isFinite(totalEpisodes)) {
            card.dataset.episodesTotal = String(totalEpisodes);
        }
        card.dataset.animeId = String(item.animeId);
        container.appendChild(card);
    });
    initStarPickers(container);
};

const hydrateWatchlistEpisodes = async (items, container) => {
    if (!items || items.length === 0) {
        return;
    }
    const missing = items.filter((item) => {
        const total = getEpisodesForAnime(item.animeId);
        return !Number.isFinite(total) || total <= 0;
    });
    if (missing.length === 0) {
        return;
    }

    await Promise.all(
        missing.map(async (item) => {
            try {
                const data = await request(`${API_BASE}/anime/${item.animeId}?provider=jikan`);
                const total =
                    data?.result?.episodes ?? data?.result?.numEpisodes ?? null;
                if (!Number.isFinite(Number(total)) || Number(total) <= 0) {
                    return;
                }
                const normalizedTotal = Number(total);
                setEpisodesForAnime(item.animeId, normalizedTotal);

                const label = container?.querySelector(
                    `.episodes-label[data-anime-id="${item.animeId}"]`,
                );
                const card = label?.closest(".card");
                if (card) {
                    card.dataset.episodesTotal = String(normalizedTotal);
                }

                const watchedInput = card?.querySelector("input[name='episodesWatched']");
                const watchedValue = watchedInput?.value;
                const watched = watchedValue ? Number(watchedValue) : item.episodesWatched ?? 0;
                if (label) {
                    label.textContent = `${Number.isFinite(watched) ? watched : 0} / ${normalizedTotal}`;
                }
            } catch {
                // Ignore failures; validation will fall back to unknown total.
            }
        }),
    );
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
        const title = getTitleForAnime(item.animeId);
        const displayTitle = title || `Anime ${item.animeId}`;
        const card = createCard(`
            <div class="card-title">
                <span class="review-anime-title" data-anime-id="${item.animeId}">${displayTitle}</span>
                <span class="badge">${item.rating}/10</span>
            </div>
            <div>${item.reviewText}</div>
            <div>Likes: ${item.likesCount ?? 0}</div>
            <div class="card-actions">
                <textarea name="reviewText" rows="2">${item.reviewText}</textarea>
                ${renderStarPickerMarkup({
                    name: "rating",
                    value: item.rating,
                    max: 10,
                    ariaLabel: "Rating",
                })}
                <button class="btn ghost review-update-btn" data-id="${item.id}">Update</button>
                <button class="btn ghost review-delete-btn" data-id="${item.id}">Delete</button>
                <button class="btn ghost review-like-btn" data-id="${item.id}">Like</button>
            </div>
        `);
        container.appendChild(card);
    });
    initStarPickers(container);
};

const hydrateReviewTitles = async (items, container) => {
    if (!items || items.length === 0) {
        return;
    }
    const missing = items.filter((item) => !getTitleForAnime(item.animeId));
    if (missing.length === 0) {
        return;
    }

    await Promise.all(
        missing.map(async (item) => {
            try {
                const data = await request(`${API_BASE}/anime/${item.animeId}?provider=jikan`);
                const title = data?.result?.title;
                if (!title) {
                    return;
                }
                setTitleForAnime(item.animeId, title);
                const label = container?.querySelector(
                    `.review-anime-title[data-anime-id="${item.animeId}"]`,
                );
                if (label) {
                    label.textContent = title;
                }
            } catch {
                // Ignore failures; title will remain as id.
            }
        }),
    );
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
        const userId =
            getStoredUserId() || formData.get("userId")?.toString().trim();
        const animeIdRaw = formData.get("animeId")?.toString().trim();
        const animeId = Number(animeIdRaw);
        const title = formData.get("title")?.toString().trim();
        const statusValue = formData.get("status")?.toString();
        const episodesWatched = Number(formData.get("episodesWatched"));
        const episodesTotalRaw = formData.get("episodesTotal")?.toString().trim();
        const episodesTotal = Number(episodesTotalRaw);
        const scoreRaw = formData.get("score")?.toString();

        if (!userId) {
            setStatus(status, "User ID is required.", "error");
            return;
        }
        if (!animeIdRaw || !Number.isFinite(animeId) || animeId <= 0) {
            setStatus(status, "Select an anime from the search list.", "error");
            return;
        }
        if (!title) {
            setStatus(status, "Title is required.", "error");
            return;
        }
        if (
            episodesTotalRaw &&
            Number.isFinite(episodesTotal) &&
            Number.isFinite(episodesWatched) &&
            episodesWatched > episodesTotal
        ) {
            setStatus(
                status,
                `Episodes watched cannot exceed total episodes (${episodesTotal}).`,
                "error",
            );
            return;
        }
        if (episodesTotalRaw && animeIdRaw && Number.isFinite(episodesTotal)) {
            setEpisodesForAnime(animeId, episodesTotal);
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
            const scoreValue = Number(scoreRaw);
            if (!Number.isFinite(scoreValue) || scoreValue < 1 || scoreValue > 10) {
                setStatus(status, "Score must be between 1 and 10.", "error");
                return;
            }
            payload.score = scoreValue;
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
            $("#watchlist-anime-meta").textContent = "No anime selected.";
            initStarPickers(form);
            await loadWatchlist();
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    });

    const loadWatchlist = async () => {
        const userId = $("#watchlist-user")?.value.trim() || getStoredUserId();
        if (!userId) {
            setStatus(status, "User ID is required to load watchlist.", "error");
            return;
        }
        syncUserId(userId);
        setStatus(status, "Loading watchlist...", null);
        try {
            const data = await request(`${API_BASE}/watchlist?userId=${userId}`);
            renderWatchlist(data);
            await hydrateWatchlistEpisodes(data, $("#watchlist-results"));
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
            const watchedValue = Number(episodesInput.value);
            const totalEpisodes =
                Number(card.dataset.episodesTotal) ||
                getEpisodesForAnime(card.dataset.animeId);
            if (Number.isFinite(totalEpisodes) && watchedValue > totalEpisodes) {
                setStatus(
                    status,
                    `Episodes watched cannot exceed total episodes (${totalEpisodes}).`,
                    "error",
                );
                return;
            }
            payload.episodesWatched = watchedValue;
        }
        if (scoreInput?.value) {
            const scoreValue = Number(scoreInput.value);
            if (Number.isFinite(scoreValue) && scoreValue >= 1 && scoreValue <= 10) {
                payload.score = scoreValue;
            }
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
            await hydrateReviewTitles(data, $("#reviews-results"));
            setStatus(status, `Loaded ${data.length} reviews.`, "success");
        } catch (error) {
            setStatus(status, error.message, "error");
        }
    };

    form?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const formData = new FormData(form);
        const userId =
            getStoredUserId() || formData.get("userId")?.toString().trim();
        const animeIdRaw = formData.get("animeId")?.toString().trim();
        const animeId = Number(animeIdRaw);
        const ratingRaw = formData.get("rating")?.toString().trim();
        const rating = Number(ratingRaw);
        const reviewText = formData.get("reviewText")?.toString().trim();

        if (!userId) {
            setStatus(status, "User ID is required.", "error");
            return;
        }
        if (!animeIdRaw || !Number.isFinite(animeId) || animeId <= 0) {
            setStatus(status, "Select an anime from the search list.", "error");
            return;
        }
        if (!ratingRaw || !Number.isFinite(rating) || rating < 1 || rating > 10) {
            setStatus(status, "Rating must be between 1 and 10.", "error");
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
            $("#reviews-anime-search").value = "";
            $("#reviews-anime-meta").textContent = "No anime selected.";
            initStarPickers(form);
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
            const userId = $("#reviews-user")?.value.trim() || getStoredUserId();
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
            const ratingNumber = Number(ratingValue);
            if (Number.isFinite(ratingNumber) && ratingNumber >= 1 && ratingNumber <= 10) {
                payload.rating = ratingNumber;
            }
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
    handleAuth();
    handleAnimeSearch();
    handleWatchlist();
    handleReviews();
    setupAnimePicker({
        input: $("#watchlist-anime-search"),
        list: $("#watchlist-anime-suggestions"),
        idInput: $("#watchlist-anime-id"),
        meta: $("#watchlist-anime-meta"),
        titleInput: $("#watchlist-form")?.querySelector("input[name='title']"),
        episodesInput: $("#watchlist-anime-episodes"),
    });
    setupAnimePicker({
        input: $("#reviews-anime-search"),
        list: $("#reviews-anime-suggestions"),
        idInput: $("#reviews-anime"),
        meta: $("#reviews-anime-meta"),
    });
    initStarPickers();
};

init();
