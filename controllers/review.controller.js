import db from "../models/index.js";
import { reviewItemView, reviewListView } from "../view/review.view.js";

const { Review } = db;

export const createReview = async (req, res) => {
    const { animeId, reviewText, rating } = req.body;
    const userId = req.userId;

    if (!userId || !animeId || !reviewText || rating === undefined) {
        return res.status(400).json({ message: "userId, animeId, reviewText, and rating are required." });
    }

    try {
        const created = await Review.create({
            user: userId,
            animeId,
            reviewText,
            rating,
        });

        return res.status(201).json(reviewItemView(created));
    } catch (error) {
        return res.status(500).json({ message: "Failed to create review.", error: error.message });
    }
};

export const getReviewsByAnime = async (req, res) => {
    const { animeId } = req.params;

    try {
        const reviews = await Review.find({ animeId }).sort({ createdAt: -1 });
        return res.json(reviewListView(reviews));
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch reviews.", error: error.message });
    }
};

export const updateReview = async (req, res) => {
    const { id } = req.params;
    const { reviewText, rating } = req.body;
    const updates = {};

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized!" });
    }

    if (reviewText !== undefined) {
        updates.reviewText = reviewText;
    }
    if (rating !== undefined) {
        updates.rating = rating;
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: "No valid fields to update." });
    }

    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }
        if (review.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Forbidden." });
        }

        Object.assign(review, updates);
        const updated = await review.save();
        return res.json(reviewItemView(updated));
    } catch (error) {
        return res.status(500).json({ message: "Failed to update review.", error: error.message });
    }
};

export const deleteReview = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized!" });
    }

    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }
        if (review.user.toString() !== req.userId) {
            return res.status(403).json({ message: "Forbidden." });
        }

        await Review.findByIdAndDelete(id);
        return res.json({ message: "Review deleted." });
    } catch (error) {
        return res.status(500).json({ message: "Failed to delete review.", error: error.message });
    }
};

export const toggleReviewLike = async (req, res) => {
    const { id } = req.params;
    const userId = req.body.userId || req.userId;

    if (!userId) {
        return res.status(400).json({ message: "userId is required." });
    }

    try {
        const review = await Review.findById(id);
        if (!review) {
            return res.status(404).json({ message: "Review not found." });
        }

        const alreadyLiked = review.likes.some((likeId) => likeId.toString() === userId);
        if (alreadyLiked) {
            review.likes = review.likes.filter((likeId) => likeId.toString() !== userId);
        } else {
            review.likes.push(userId);
        }

        await review.save();
        return res.json(reviewItemView(review));
    } catch (error) {
        return res.status(500).json({ message: "Failed to toggle review like.", error: error.message });
    }
};
