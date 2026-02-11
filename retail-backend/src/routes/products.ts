import "dotenv/config";
import { Router } from "express";
import pool from "../db";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";



const router = Router();

// GET /products
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /products
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  const { name, description, price, stock, image_url } = req.body;

  if (!name || price == null || stock == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || "", price, stock, image_url || ""]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
