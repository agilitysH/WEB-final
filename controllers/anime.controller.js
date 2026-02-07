import {
    fetchAnimeById,
    fetchTrendingAnime,
    searchAnimeWithFilters,
} from "../services/animeApi.service.js";
import {
    animeDetailsView,
    animeSearchView,
    animeTrendingView,
} from "../view/anime.view.js";

const normalizeProvider = (provider) => (provider === "mal" ? "mal" : "jikan");

export const searchAnime = async (req, res) => {
    const provider = normalizeProvider(req.query.provider);
    const query = req.query.title || req.query.q;
    const genre = req.query.genre;
    const orderBy = req.query.orderBy || (req.query.popularity ? "popularity" : undefined);
    const sort = req.query.sort || (req.query.popularity ? "asc" : undefined);

    try {
        const data = await searchAnimeWithFilters({
            provider,
            query,
            genre,
            orderBy,
            sort,
        });
        return res.json(animeSearchView({ provider, data }));
    } catch (error) {
        return res.status(500).json({ message: "Failed to search anime.", error: error.message });
    }
};

export const getAnimeDetails = async (req, res) => {
    const provider = normalizeProvider(req.query.provider);
    const { animeId } = req.params;

    try {
        const data = await fetchAnimeById({ provider, id: animeId });
        return res.json(animeDetailsView({ provider, data }));
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch anime details.", error: error.message });
    }
};

export const getTrendingAnime = async (req, res) => {
    const provider = normalizeProvider(req.query.provider);
    const page = Number(req.query.page) || 1;

    try {
        const data = await fetchTrendingAnime({ provider, page });
        return res.json(animeTrendingView({ provider, data }));
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch trending anime.", error: error.message });
    }
};
