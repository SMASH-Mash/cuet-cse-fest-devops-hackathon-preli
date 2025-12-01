import express, { Request, Response } from "express";
import { ProductModel } from "../models/product";

const router = express.Router();

/**
 * Create a new product
 * POST /api/products
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, price } = req.body;

    // --- Input validation ---
    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({ error: "Name is required." });
    }

    if (
      typeof price !== "number" ||
      Number.isNaN(price) ||
      price < 0
    ) {
      return res.status(400).json({ error: "Price must be a non-negative number." });
    }

    // Ensure unique product names
    const existing = await ProductModel.findOne({ name: name.trim() });
    if (existing) {
      return res.status(409).json({ error: "Product name already exists." });
    }

    // --- Create document ---
    const created = await ProductModel.create({
      name: name.trim(),
      price,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error("POST /api/products error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * List products with optional pagination
 * GET /api/products?limit=10&offset=20
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await ProductModel.countDocuments();

    return res.json({
      total,
      limit,
      offset,
      count: products.length,
      data: products,
    });
  } catch (err) {
    console.error("GET /api/products error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
