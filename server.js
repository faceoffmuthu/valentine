import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

// ✅ CORS (safe for dev + prod)
app.use(cors());
app.options("*", cors());

app.use(express.json());

/* ===============================
   EMAIL CONFIG
================================ */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP ERROR:", error);
  } else {
    console.log("✅ SMTP is ready to send emails");
  }
});

/* ===============================
   ROUTES
================================ */
app.get("/", (req, res) => {
  res.status(200).send("Backend is running 💖");
});

app.post("/send-valentine", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ success: false, message: "Missing data" });
  }

  const link = `https://valentaines.netlify.app/?name=${encodeURIComponent(
    name
  )}`;

  try {
    await transporter.sendMail({
      from: `"Valentine 💖" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "💖 A Valentine Surprise for You!",
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>💖 A Valentine Surprise for You!</h2>
          <p>Someone special entered your name:</p>
          <h3>${name}</h3>
          <a href="${link}" style="
            display:inline-block;
            margin-top:20px;
            padding:12px 24px;
            background:#ec4899;
            color:white;
            border-radius:30px;
            text-decoration:none;">
            💌 Open Your Valentine
          </a>
          <p style="margin-top:30px">Happy Valentine’s Day ❤️</p>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ SEND MAIL ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email",
    });
  }
});

/* ===============================
   START SERVER (IMPORTANT)
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
