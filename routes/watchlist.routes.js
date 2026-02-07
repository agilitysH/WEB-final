import { Router } from "express";
import {
    addToWatchlist,
    getWatchlist,
    updateWatchlistItem,
    removeWatchlistItem,
} from "../controllers/watchlist.controller.js";

const router = Router();

router.post("/", addToWatchlist);
router.get("/", getWatchlist);
router.put("/:id", updateWatchlistItem);
router.delete("/:id", removeWatchlistItem);

export default router;
