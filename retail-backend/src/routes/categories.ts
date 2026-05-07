import { Router } from "express";
import pool from "../db";

const router = Router();

// GET categories
router.get("/", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT name FROM categories ORDER BY name ASC"
    );

    res.json(result.rows.map(row => row.name));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ADD category
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO categories (name) VALUES ($1) RETURNING *",
      [name]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;