import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

export const UserModel = {
  async createUser(name, username, password, role) {
    if (!password) throw new Error("Password is required");
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (name, username, password, role) VALUES (?, ?, ?, ?)",
      [name, username, hashedPassword, role]
    );

    return result.insertId;
  },

  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0];
  },
};
