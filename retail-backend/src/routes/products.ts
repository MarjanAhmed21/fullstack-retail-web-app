import "dotenv/config";
import { Router } from "express";
import pool from "../db";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";



const router = Router();

// GET /products
router.get("/", async (req, res) => {
  const { category } = req.query;

  try {
    if (category) {
      const result = await pool.query(
        "SELECT * FROM products WHERE category = $1",
        [category]
      );
      return res.json(result.rows);
    }

    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /products
router.post("/", async (req, res) => {
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

// PUT /products
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price, stock, image_url, category } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           price = $3,
           stock = $4,
           image_url = $5,
           category = $6
       WHERE id = $7
       RETURNING *`,
      [name, description, price, stock, image_url, category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// DELETE /products/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted", product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


export default router;
