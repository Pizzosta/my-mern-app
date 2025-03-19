import express from "express";
import { loginUser, logoutUser, getCurrentUser, createUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../cron/middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", createUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser); // Protected route
router.get("/me",verifyJWT, getCurrentUser )

export default router;