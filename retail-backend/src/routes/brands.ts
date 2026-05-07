import express from "express";
import pool from "../db";

const router = express.Router();

/* GET all brands */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT name FROM brands ORDER BY name ASC");
    res.json(result.rows.map(row => row.name));
  } catch (err) {
    console.error("Fetch brands error:", err);
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});

/* ADD new brand */
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Brand name required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO brands (name) VALUES ($1) RETURNING name",
      [name]
    );

    res.status(201).json(result.rows[0]);

  } catch (err: any) {

    // duplicate (UNIQUE constraint)
    if (err.code === "23505") {
      return res.status(400).json({ error: "Brand already exists" });
    }

    console.error("Add brand error:", err);
    res.status(500).json({ error: "Failed to add brand" });
  }
});

export default router;