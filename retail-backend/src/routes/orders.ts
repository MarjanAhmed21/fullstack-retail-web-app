import { Router } from "express";
import pool from "../db";
import { authenticateToken, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// CREATE ORDER
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const result = await pool.query(
      `INSERT INTO orders (user_id)
       VALUES ($1)
       RETURNING *`,
      [userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /orders/:orderId/items
router.post("/:orderId/items", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const orderId = Number(req.params.orderId);
  const { product_id, quantity } = req.body;

  if (!product_id || quantity == null || quantity <= 0) {
    return res.status(400).json({ message: "Invalid product_id or quantity" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Verify order ownership & status
    const orderResult = await client.query(
      `SELECT * FROM orders
       WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: "Order does not exist, does not belong to you, or is completed",
      });
    }

    // 2. Get product stock & price
    const productResult = await client.query(
      "SELECT price, stock FROM products WHERE id = $1",
      [product_id]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    const { price, stock } = productResult.rows[0];

    // 3. Existing quantity in order
    const existingItem = await client.query(
      `SELECT COALESCE(SUM(quantity), 0) AS qty
       FROM order_items
       WHERE order_id = $1 AND product_id = $2`,
      [orderId, product_id]
    );

    const currentQty = Number(existingItem.rows[0].qty);

    if (currentQty + quantity > stock) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        message: `Only ${stock - currentQty} items left in stock`,
      });
    }

    // 4. Insert order item
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [orderId, product_id, quantity, price]
    );

    // 5. Update order total
    await client.query(
      `UPDATE orders
       SET total = total + ($1::numeric * $2::int)
       WHERE id = $3`,
      [price, quantity, orderId]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Item added to order" });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ORDER TRANSACTION ERROR:", err);
    res.status(500).json({ message: "Server error" });
  } finally {
    client.release();
  }
});




// ADMIN: GET ALL ORDERS
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  if (req.user!.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const ordersResult = await pool.query(`
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total,
        o.created_at,
        COUNT(oi.id) AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json(ordersResult.rows);
  } catch (err) {
    console.error("ADMIN GET ORDERS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET /orders/:id
router.get("/:orderId", authenticateToken, async (req: AuthRequest, res) => {
  const orderId = Number(req.params.orderId);
  const userId = req.user!.id;
  const role = req.user!.role;

  try {
    // 1. Get order (admin can view any, user only their own)
    const orderQuery =
      role === "admin"
        ? "SELECT * FROM orders WHERE id = $1"
        : "SELECT * FROM orders WHERE id = $1 AND user_id = $2";

    const orderParams =
      role === "admin" ? [orderId] : [orderId, userId];

    const orderResult = await pool.query(orderQuery, orderParams);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Get order items with product info
    const itemsResult = await pool.query(
      `
      SELECT
        oi.id,
        oi.quantity,
        oi.price,
        p.id AS product_id,
        p.name,
        p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = $1
      `,
      [orderId]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows,
    });

  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// CHECKOUT ORDER
router.post(
  "/:orderId/checkout",
  authenticateToken,
  async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const orderId = Number(req.params.orderId);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Verify order
      const orderResult = await client.query(
        `SELECT * FROM orders
         WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
        [orderId, userId]
      );

      if (orderResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Invalid order" });
      }

      // 2. Get order items
      const itemsResult = await client.query(
        `SELECT oi.product_id, oi.quantity, p.stock
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [orderId]
      );

      if (itemsResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Order has no items" });
      }

      // 3. Check stock
      for (const item of itemsResult.rows) {
        if (item.stock < item.quantity) {
          await client.query("ROLLBACK");
          return res.status(400).json({
            message: `Not enough stock for product ${item.product_id}`,
          });
        }
      }

      // 4. Deduct stock
      for (const item of itemsResult.rows) {
        await client.query(
          `UPDATE products
           SET stock = stock - $1
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }

      // 5. Complete order
      await client.query(
        `UPDATE orders
         SET status = 'completed'
         WHERE id = $1`,
        [orderId]
      );

      await client.query("COMMIT");

      res.json({ message: "Order checked out successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("CHECKOUT ERROR:", err);
      res.status(500).json({ message: "Server error" });
    } finally {
      client.release();
    }
  }
);



export default router;
