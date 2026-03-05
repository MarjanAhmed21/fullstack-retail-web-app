import "dotenv/config";
import { app } from "./app";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/adminRoutes";


app.listen(3000, () => {
  console.log("Server running on port 3000");
});

app.use("/admin", adminRoutes);