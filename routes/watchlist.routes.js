import { Router } from "express";
import { authJwt } from "../middlewares/index.js";
import {
  addToWatchlist,
  getWatchlist,
  updateWatchlistItem,
  removeWatchlistItem,
} from "../controllers/watchlist.controller.js";

const router = Router();

router.post("/", authJwt.verifyToken, addToWatchlist);
router.get("/", authJwt.verifyToken, getWatchlist);
router.put("/:id", authJwt.verifyToken, updateWatchlistItem);
router.delete("/:id", authJwt.verifyToken, removeWatchlistItem);

export default router;
