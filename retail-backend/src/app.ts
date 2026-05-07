import express from "express";
import cors from "cors";
import productsRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";
import authRoutes from "./routes/auth";
import brandsRoutes from "./routes/brands";
import categoriesRoutes from "./routes/categories";


const app = express();

app.use(cors());

app.use(express.json());

app.use("/products", productsRoutes);
app.use("/orders", ordersRoutes);
app.use("/auth", authRoutes);
app.use("/brands", brandsRoutes);
app.use("/categories", categoriesRoutes);

export { app };


