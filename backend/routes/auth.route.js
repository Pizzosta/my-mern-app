import express from "express";
import { loginUser, logoutUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../cron/middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser); // Protected route

export default router;