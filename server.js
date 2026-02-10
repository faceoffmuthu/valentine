import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const app = express();

// CORS - must run first
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://valenitine.netlify.app",
  "https://valentaines.netlify.app",
];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});
app.use(express.json());

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

app.post("/send-valentine", async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  console.log(`📧 Sending Valentine email to: ${email} for name: ${name}`);

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

    console.log(`✅ Valentine email sent successfully to: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ SEND MAIL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});
