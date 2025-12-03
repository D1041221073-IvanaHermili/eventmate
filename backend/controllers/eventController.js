import { pool } from "../config/db.js";

// ===========================
// FIX DATE: KEMBALIKAN STRING APA ADANYA
// ===========================
function fixDate(date) {
  if (!date) return null;

  // Jika MySQL mengirim Date object, ambil tanggal lokal tanpa konversi ke UTC
  if (date instanceof Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Jika sudah string, return apa adanya
  if (typeof date === "string") return date;

  return null;
}

// ===========================
// GET ALL EVENTS
// ===========================
export const getEvents = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date, start_time");

    const formatted = rows.map(e => ({
      ...e,
      date: fixDate(e.date),
    }));

    res.json({ events: formatted });
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

    const event = rows[0];
    event.date = fixDate(event.date);

    res.json({ event });
  } catch (error) {
    console.error("❌ Error fetching event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// CREATE EVENT
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

    // FE kirim YYYY-MM-DD → jangan parse ke Date
    await pool.query(
      `INSERT INTO events 
        (title, category, date, start_time, end_time, location, description, price) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, category, date, start_time, end_time, location, description, price]
    );

    res.json({
      message: "Event created",
      event: { title, category, date, start_time, end_time, location, description, price },
    });
  } catch (err) {
    console.error("❌ Error creating event:", err);
    res.status(500).json({ message: "Error creating event" });
  }
};

// ===========================
// UPDATE EVENT
// ===========================
export const updateEvent = async (req, res) => {
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

    // Pastikan date string
    if (typeof date !== "string") {
      return res.status(400).json({ message: "Format tanggal harus string YYYY-MM-DD" });
    }

    await pool.query(
      `UPDATE events 
       SET title=?, category=?, date=?, start_time=?, end_time=?, location=?, description=?, price=?
       WHERE id=?`,
      [title, category, date, start_time, end_time, location, description, price, req.params.id]
    );

    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("❌ Error updating event:", err);
    res.status(500).json({ message: "Error updating event" });
  }
};

// ===========================
// DELETE EVENT
// ===========================
export const deleteEvent = async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id=?", [req.params.id]);
    res.json({ message: "Event deleted" });
  } catch (error) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ===========================
// USER REGISTER EVENT
// ===========================
export const registerEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const [event] = await pool.query("SELECT id FROM events WHERE id=?", [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ message: "Event tidak ditemukan" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM event_registrations WHERE user_id=? AND event_id=?",
      [userId, eventId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Kamu sudah terdaftar di event ini" });
    }

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

// ===========================
// USER CANCEL EVENT
// ===========================
export const cancelEvent = async (req, res) => {
  try {
    const userId = req.user.id;
    const eventId = req.params.id;

    const [existing] = await pool.query(
      "SELECT id FROM event_registrations WHERE user_id=? AND event_id=?",
      [userId, eventId]
    );

    if (existing.length === 0) {
      return res.status(400).json({ message: "Kamu belum daftar event ini" });
    }

    await pool.query(
      "DELETE FROM event_registrations WHERE user_id=? AND event_id=?",
      [userId, eventId]
    );

    res.json({ message: "Pendaftaran dibatalkan" });
  } catch (err) {
    console.error("❌ Error cancel event:", err);
    res.status(500).json({ message: "Error cancel event" });
  }
};

// ===========================
// GET MY EVENTS
// ===========================
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT e.*, er.registered_at 
       FROM event_registrations er
       JOIN events e ON e.id = er.event_id
       WHERE er.user_id = ?
       ORDER BY e.date ASC`,
      [userId]
    );

    const formatted = rows.map(e => ({
      ...e,
      date: fixDate(e.date),
    }));

    res.json({ events: formatted });
  } catch (err) {
    console.error("❌ Error fetching my events:", err);
    res.status(500).json({ message: "Error fetching my events" });
  }
};

// ===========================
// ADMIN: GET ALL REGISTRATIONS
// ===========================
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
