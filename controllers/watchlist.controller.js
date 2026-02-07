import db from "../models/index.js";
import { watchlistItemView, watchlistListView } from "../view/watchlist.view.js";

const { Watchlist } = db;

export const addToWatchlist = async (req, res) => {
    const { userId, animeId, title, status, episodesWatched, score } = req.body;

    if (!userId || !animeId || !title || !status) {
        return res.status(400).json({ message: "userId, animeId, title, and status are required." });
    }

    try {
        const created = await Watchlist.create({
            user: userId,
            animeId,
            title,
            status,
            episodesWatched,
            score,
        });

        return res.status(201).json(watchlistItemView(created));
    } catch (error) {
        return res.status(500).json({ message: "Failed to add to watchlist.", error: error.message });
    }
};

export const getWatchlist = async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ message: "userId query parameter is required." });
    }

    try {
        const items = await Watchlist.find({ user: userId }).sort({ updatedAt: -1 });
        return res.json(watchlistListView(items));
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch watchlist.", error: error.message });
    }
};

export const updateWatchlistItem = async (req, res) => {
    const { id } = req.params;
    const { status, episodesWatched, score } = req.body;
    const updates = {};

    if (status !== undefined) {
        updates.status = status;
    }
    if (episodesWatched !== undefined) {
        updates.episodesWatched = episodesWatched;
    }
    if (score !== undefined) {
        updates.score = score;
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update." });
    }

    try {
        const updated = await Watchlist.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) {
            return res.status(404).json({ message: "Watchlist item not found." });
        }

        return res.json(watchlistItemView(updated));
    } catch (error) {
        return res.status(500).json({ message: "Failed to update watchlist item.", error: error.message });
    }
};

export const removeWatchlistItem = async (req, res) => {
    const { id } = req.params;

    try {
        const removed = await Watchlist.findByIdAndDelete(id);
        if (!removed) {
            return res.status(404).json({ message: "Watchlist item not found." });
        }

        return res.json({ message: "Watchlist item removed." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to remove watchlist item.", error: error.message });
    }
};
