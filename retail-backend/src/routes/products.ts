import "dotenv/config";
import { Router } from "express";
import pool from "../db";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware";

const router = Router();

// -----------------------------
// GET /products — list all products, optional filters
// -----------------------------
router.get("/", async (req, res) => {
  const { category, brand, colour, size } = req.query;

  try {
    let query = "SELECT * FROM products WHERE 1=1";
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND category = $${paramIndex++}`;
      params.push(category);
    }
    if (brand) {
      query += ` AND brand = $${paramIndex++}`;
      params.push(brand);
    }
    if (colour) {
      query += ` AND colour = $${paramIndex++}`;
      params.push(colour);
    }
    if (size) {
      query += ` AND $${paramIndex} = ANY(disabled_sizes) = false`; // or adjust based on how you store sizes
      // optional: or just filter by size availability if you store differently
      // params.push(size);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------
// GET /products/:id — single product by ID
// -----------------------------
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------
// POST /products — add new product
// -----------------------------
router.post("/", authenticateToken, isAdmin, async (req, res) => {
  const { name, description, long_description, price, stock, image_url, category, brand, colour, disabled_sizes } = req.body;

  if (!name || price == null || stock == null) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, long_description, price, stock, image_url, category, brand, colour, disabled_sizes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        name,
        description || "",
        long_description || "",
        price,
        stock,
        image_url,
        category || "",
        brand || "",
        colour || "",
        disabled_sizes || []
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// -----------------------------
// PUT /products/bulk — bulk update colours
// -----------------------------
router.put("/bulk", authenticateToken, isAdmin, async (req, res) => {
  const updates = req.body; // expects array

  try {
    for (const product of updates) {
      await pool.query(
        "UPDATE products SET colour = $1 WHERE id = $2",
        [product.colour, product.id]
      );
    }

    res.json({ message: "Bulk update successful" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -----------------------------
// PUT /products/:id — update product
// -----------------------------
router.put("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, long_description, price, stock, image_url, category, brand, colour, disabled_sizes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           description = $2,
           long_description = $3,
           price = $4,
           stock = $5,
           image_url = $6,
           category = $7,
           brand = $8,
           colour = $9,
           disabled_sizes = $10
       WHERE id = $11
       RETURNING *`,
      [name, description, long_description, price, stock, image_url, category, brand, colour, disabled_sizes, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});




// -----------------------------
// DELETE /products/:id
// -----------------------------
router.delete("/:id", authenticateToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);

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