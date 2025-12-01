import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🌐 Health check
app.get("/health", (_req, res) =>
  res.json({ ok: true, message: "EventMate backend is healthy 🚀" })
);

// 🧩 Tes koneksi DB
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.json({ ok: true, db: "connected", result: rows[0].result });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// 🛣️ Routes utama
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/user", userRoutes);

// 🚀 Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
