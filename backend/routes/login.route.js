import express from "express";
import { login } from "../controllers/login.controller.js";

const router = express.Router();

// POST request for user login
router.post('/', login);

export default router; 