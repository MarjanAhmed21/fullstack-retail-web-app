import "dotenv/config";
import { app } from "./app";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/adminRoutes";
import nodemailer from "nodemailer";

app.use("/admin", adminRoutes);

/* CONTACT ROUTE */
app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;

  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "marjan14362@gmail.com",
        pass: "stlw ewog fjyt ymih"
      }
    });

    await transporter.sendMail({
      from: `"Marjan Threads Contact" <yourgmail@gmail.com>`,
      replyTo: email,
      to: "yourgmail@gmail.com",
      subject: `Contact Form Message from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `
    });

    res.json({ success: true });

  } catch (err: any) {
    console.error("EMAIL ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/* START SERVER */
app.listen(3000, () => {
  console.log("Server running on port 3000");
});