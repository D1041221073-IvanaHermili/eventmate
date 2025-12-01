// routes/userRoutes.js
import express from "express";
import { pool } from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/user/events → ambil semua event yang sudah didaftarkan user
router.get("/events", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await pool.query(
      `SELECT e.*
       FROM events e
       JOIN event_registrations r ON e.id = r.event_id
       WHERE r.user_id = ?`,
      [userId]
    );

    res.json({ events: rows });
  } catch (err) {
    console.error("Error fetching user events:", err);
    res.status(500).json({ ok: false, message: "Gagal ambil event user" });
  }
});

// DELETE /api/user/events/:eventId/cancel → batalkan pendaftaran event
router.delete("/events/:eventId/cancel", verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { eventId } = req.params;

  try {
    const [result] = await pool.query(
      `DELETE FROM event_registrations 
       WHERE user_id = ? AND event_id = ?`,
      [userId, eventId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        ok: false,
        message: "Pendaftaran event tidak ditemukan",
      });
    }

    res.json({
      ok: true,
      message: "Berhasil membatalkan pendaftaran event",
    });
  } catch (err) {
    console.error("Error cancel registration:", err);
    res.status(500).json({ ok: false, message: "Gagal membatalkan event" });
  }
});

export default router;
