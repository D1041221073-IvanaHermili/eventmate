import { pool } from "../config/db.js";

export default class EventModel {
  static async getAllEvents() {
    const [rows] = await pool.query("SELECT * FROM events ORDER BY date ASC");
    return rows;
  }

  static async createEvent({ title, description, date, location, price }) {
    await pool.query(
      "INSERT INTO events (title, description, date, location, price) VALUES (?, ?, ?, ?, ?)",
      [title, description, date, location, price]
    );
  }

  static async updateEvent(id, { title, description, date, location, price }) {
    await pool.query(
      "UPDATE events SET title=?, description=?, date=?, location=?, price=? WHERE id=?",
      [title, description, date, location, price, id]
    );
  }

  static async deleteEvent(id) {
    await pool.query("DELETE FROM events WHERE id=?", [id]);
  }
}
