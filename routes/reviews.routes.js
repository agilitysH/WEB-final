import { Router } from "express";
import {
    createReview,
    getReviewsByAnime,
    updateReview,
    deleteReview,
    toggleReviewLike,
} from "../controllers/review.controller.js";

const router = Router();

router.post("/", createReview);
router.get("/anime/:animeId", getReviewsByAnime);
router.put("/:id", updateReview);
router.delete("/:id", deleteReview);
router.post("/:id/like", toggleReviewLike);

export default router;
