import { Router } from "express";
import { authJwt } from "../middleware/index.js";
import {
  createReview,
  getReviewsByAnime,
  updateReview,
  deleteReview,
  toggleReviewLike,
} from "../controllers/review.controller.js";

const router = Router();

router.get("/anime/:animeId", getReviewsByAnime);

router.post("/", authJwt.verifyToken, createReview);
router.put("/:id", authJwt.verifyToken, updateReview);
router.delete("/:id", authJwt.verifyToken, deleteReview);
router.post("/:id/like", authJwt.verifyToken, toggleReviewLike);

export default router;
