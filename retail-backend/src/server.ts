import "dotenv/config";
import { app } from "./app";
import authRoutes from "./routes/auth";


app.listen(3000, () => {
  console.log("Server running on port 3000");
});