import { Router } from "express";
import { verifySignUp, authJwt } from "../middlewares/index.js";
import { signup, signin, me } from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/signup",
  [verifySignUp.checkDuplicateUsernameOrEmail, verifySignUp.checkRolesExisted],
  signup
);

router.post("/signin", signin);

router.get("/me", authJwt.verifyToken, me);

export default router;
