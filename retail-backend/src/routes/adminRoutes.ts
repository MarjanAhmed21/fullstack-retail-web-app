import { Router } from "express";
import pool from "../db";
import { authenticateToken, isAdmin, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// GET all users (Admin only)
router.get("/users", authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, created_at FROM users ORDER BY id ASC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET all orders (Admin only)
router.get("/orders", authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        orders.id,
        orders.user_id,
        orders.status,
        orders.total,
        orders.created_at,
        users.name AS customer_name,
        users.email AS customer_email
      FROM orders
      JOIN users ON orders.user_id = users.id
      ORDER BY orders.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// UPDATE order status (Admin only)
router.put("/orders/:id", authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  const orderId = Number(req.params.id);
  const { status } = req.body;

  try {
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order updated successfully", order: result.rows[0] });

  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error" });
  }
});



// DELETE order (Admin only)
router.delete("/orders/:id", authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  const orderId = Number(req.params.id);

  try {
    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING id",
      [orderId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });

  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE user (Admin only)
router.delete("/users/:id", authenticateToken, isAdmin, async (req: AuthRequest, res) => {
  const userId = req.params.id;

  try {
    // Prevent admin from deleting themselves
    if (req.user?.id === Number(userId)) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    // Delete user's orders first
    await pool.query("DELETE FROM orders WHERE user_id = $1", [userId]);

    // Then delete user
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User and related orders deleted successfully" });

  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;