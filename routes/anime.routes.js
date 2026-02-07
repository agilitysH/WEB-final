import { Router } from "express";
import {
    getAnimeDetails,
    getTrendingAnime,
    searchAnime,
} from "../controllers/anime.controller.js";

const router = Router();

router.get("/search", searchAnime);
router.get("/trending", getTrendingAnime);
router.get("/:animeId", getAnimeDetails);

export default router;
