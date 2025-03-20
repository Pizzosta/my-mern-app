import express from "express";
import { createUser, deleteUser, getAllUsers, updateUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../cron/middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", createUser);
router.get("/", getAllUsers);
router.delete("/:id", verifyJWT, deleteUser);
router.put("/:id", updateUser);

export default router;