import express from "express";
import { createProducts, deleteProducts, getProducts, updateProducts, placeBid } from "../controllers/product.controller.js";
import { verifyJWT } from "../cron/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", verifyJWT, createProducts);
router.delete("/:id", verifyJWT, deleteProducts);
router.put("/:id", verifyJWT, updateProducts);
router.post("/:id/bid", verifyJWT, placeBid);

export default router; 