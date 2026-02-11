import "dotenv/config";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool
  .query("SELECT NOW()")
  .then((res) => {
    console.log("Database connected. Time:", res.rows[0].now);
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

export default pool;