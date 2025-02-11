import express from "express";
import { createPVideos, deletePVideos, getPVideos, updatePVideos } from "../controllers/pvideo.controller.js";

const router = express.Router();

router.get("/", getPVideos);

router.post("/", createPVideos);

router.delete("/:id", deletePVideos);

router.put("/:id", updatePVideos);

export default router;
