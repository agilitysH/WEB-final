import { Router } from "express";
import { getApiEndpointList } from "../controllers/api.controller.js";

const router = Router();

router.get("/", getApiEndpointList);

export default router;
