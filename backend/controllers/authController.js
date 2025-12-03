import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

dotenv.config();

const ADMIN_SECRET = process.env.ADMIN_SECRET || "EVENTMATE2025";
const JWT_SECRET = process.env.JWT_SECRET || "mysecretkey123";

// 🧩 REGISTER
export const register = async (req, res) => {
  try {
    const { name, username, password, adminCode } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ message: "Nama, username, dan password wajib diisi" });
    }

    const existingUser = await UserModel.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const inputCode = (adminCode || "").trim().toLowerCase();
    const validAdminCode = (ADMIN_SECRET || "").trim().toLowerCase();
    const role = inputCode === validAdminCode ? "admin" : "user";

    const userId = await UserModel.createUser(name, username, password, role);

    console.log(`🟢 User baru terdaftar: ${username}, Role: ${role}`);

    res.status(201).json({
      message: "User berhasil terdaftar",
      userId,
      role,
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ message: "Gagal mendaftarkan user" });
  }
};

// 🧩 LOGIN
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findByUsername(username);
    if (!user) {
      console.log(`⛔ Login gagal, user tidak ditemukan: ${username}`);
      return res.status(401).json({ message: "User tidak ditemukan" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`⛔ Password salah untuk username: ${username}`);
      return res.status(401).json({ message: "Password salah" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 🔥 Tampilkan token di terminal setiap login
    console.log("==================================");
    console.log("🔐 LOGIN BERHASIL");
    console.log("👤 User:", user.username);
    console.log("📌 Role:", user.role);
    console.log("🔑 TOKEN JWT:");
    console.log(token);
    console.log("==================================");

    res.json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Gagal login" });
  }
};
