import { pool } from "../config/db.js";

// ===========================
// GET ALL EVENTS
// ===========================
export const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM events ORDER BY date, start_time"
    );
    res.json({ events: rows });
  } catch (error) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// GET EVENT BY ID
// ===========================
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query("SELECT * FROM events WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Event tidak ditemukan" });
    }

    res.json({ event: rows[0] });
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// CREATE EVENT  (ADMIN)
// ===========================
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      category,
      date,
      start_time,
      end_time,
      location,
      description,
      price,
    } = req.body;

    const [result] = await pool.query(
      "INSERT INTO events (title, category, date, start_time, end_time, location, description, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        title,
        category,
        date,
        start_time,
        end_time,
        location,
        description,
        price,
      ]
    );

    res.json({
      message: "Event created",
      event: {
        id: result.insertId,
        title,
        category,
        date,
        start_time,
        end_time,
        location,
        description,
        price,
      },
    });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ message: "Error creating event" });
  }
};

// ===========================
// UPDATE EVENT  (ADMIN)
// ===========================
export const updateEvent = async (req, res) => {
  try {
    let {
      title,
      category,
      date,
      start_time,
      end_time,
      location,
      description,
      price,
    } = req.body;

    // Fix format date
    if (date && date.includes("T")) {
      date = date.split("T")[0];
    }

    const sql = `
      UPDATE events 
      SET title=?, category=?, date=?, start_time=?, end_time=?, location=?, description=?, price=?
      WHERE id=?
    `;

    await pool.query(sql, [
      title,
      category,
      date,
      start_time,
      end_time,
      location,
      description,
      price,
      req.params.id,
    ]);

    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ message: "Error updating event" });
  }
};

// ===========================
// DELETE EVENT  (ADMIN)
// ===========================
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM events WHERE id=?", [id]);

    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// =====================================================
// 🔥 USER REGISTER EVENT
// =====================================================
export const registerEvent = async (req, res) => {
  try {
    const userId = req.user.id; // dari JWT
    const eventId = req.params.id;

    // Cek apakah event ada
    const [event] = await pool.query("SELECT id FROM events WHERE id=?", [
      eventId,
    ]);

    if (event.length === 0) {
      return res.status(404).json({ message: "Event tidak ditemukan" });
    }

    // Cek apakah user sudah daftar
    const [existing] = await pool.query(
      "SELECT id FROM event_registrations WHERE user_id=? AND event_id=?",
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Kamu sudah terdaftar di event ini" });
    }

    // Daftarkan user
    await pool.query(
      "INSERT INTO event_registrations (user_id, event_id) VALUES (?, ?)",
      [userId, eventId]
    );

    res.json({ message: "Berhasil daftar event" });
  } catch (err) {
    console.error("❌ Error registering event:", err);
    res.status(500).json({ message: "Error registering event" });
  }
};

// =====================================================
// 🔥 ADMIN: GET USERS REGISTERED
// =====================================================
export const getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.id;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, er.registered_at
       FROM event_registrations er
       JOIN users u ON u.id = er.user_id
       WHERE er.event_id = ?
       ORDER BY er.registered_at DESC`,
      [eventId]
    );

    res.json({ registrations: rows });
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ message: "Error fetching registrations" });
  }
};
