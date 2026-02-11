import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";
import authRoutes from "./routes/auth";

const app = express();

app.use(cors({
  origin: "http://localhost:5174"
}));

app.use(express.json());

app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);

export { app };