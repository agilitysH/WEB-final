import externalApiConfig from "../config/externalApi.config.js";

const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`External API error ${response.status}: ${errorBody}`);
    }

    return response.json();
};

const getJikanBaseUrl = () => {
    if (!externalApiConfig.jikanBaseUrl) {
        throw new Error("Jikan base URL is not configured.");
    }

    return externalApiConfig.jikanBaseUrl.replace(/\/$/, "");
};

const getMalBaseUrl = () => {
    if (!externalApiConfig.malBaseUrl) {
        throw new Error("MAL base URL is not configured.");
    }

    return externalApiConfig.malBaseUrl.replace(/\/$/, "");
};

const getMalHeaders = () => {
    if (!externalApiConfig.malClientId) {
        throw new Error("MAL client id is not configured.");
    }

    return {
        "X-MAL-CLIENT-ID": externalApiConfig.malClientId,
    };
};

export const fetchAnimeById = async ({ provider = "jikan", id }) => {
    if (!id) {
        throw new Error("Anime id is required.");
    }

    if (provider === "mal") {
        const url = `${getMalBaseUrl()}/anime/${id}`;
        return requestJson(url, { headers: getMalHeaders() });
    }

    const url = `${getJikanBaseUrl()}/anime/${id}`;
    return requestJson(url);
};

const buildQueryString = (params) => {
    const entries = Object.entries(params).filter(([, value]) => value !== undefined && value !== "");
    if (entries.length === 0) {
        return "";
    }

    return `?${new URLSearchParams(entries).toString()}`;
};

export const searchAnime = async ({ provider = "jikan", query, page = 1 }) => {
    if (!query) {
        throw new Error("Query is required.");
    }

    if (provider === "mal") {
        const url = `${getMalBaseUrl()}/anime?q=${encodeURIComponent(query)}&limit=20&offset=${(page - 1) * 20}`;
        return requestJson(url, { headers: getMalHeaders() });
    }

    const url = `${getJikanBaseUrl()}/anime?q=${encodeURIComponent(query)}&page=${page}`;
    return requestJson(url);
};

export const searchAnimeWithFilters = async ({
    provider = "jikan",
    query,
    genre,
    orderBy,
    sort,
}) => {
    if (provider === "mal") {
        return searchAnime({ provider, query, page: 1 });
    }

    const qs = buildQueryString({
        q: query,
        genres: genre,
        order_by: orderBy,
        sort,
    });
    const url = `${getJikanBaseUrl()}/anime${qs}`;
    return requestJson(url);
};

export const fetchTrendingAnime = async ({ provider = "jikan", page = 1 }) => {
    if (provider === "mal") {
        const url = `${getMalBaseUrl()}/anime/ranking?ranking_type=all&limit=20&offset=${(page - 1) * 20}`;
        return requestJson(url, { headers: getMalHeaders() });
    }

    const qs = buildQueryString({ order_by: "popularity", sort: "asc", page });
    const url = `${getJikanBaseUrl()}/anime${qs}`;
    return requestJson(url);
};
