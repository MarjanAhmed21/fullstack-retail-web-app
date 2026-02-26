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


// GET /products/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE id = $1",
      [id]
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



// POST /products
router.post("/", async (req, res) => {
  const { name, description, long_description, price, stock, image_url, category } = req.body;

  if (!name || price == null || stock == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, long_description, price, stock, image_url, category)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description || "", long_description || "", price, stock, image_url, category || ""]
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
  const { name, description, long_description, price, stock, image_url, category } = req.body;

 try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           long_description = $3,
           price = $4,
           stock = $5,
           image_url = $6,
           category = $7
       WHERE id = $8
       RETURNING *`,
      [name, description, long_description, price, stock, image_url, category, id]
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
