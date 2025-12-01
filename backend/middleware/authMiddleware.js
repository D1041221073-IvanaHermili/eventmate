import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromQuery = req.query.token;

  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (tokenFromQuery) {
    token = tokenFromQuery;
  }

  if (!token) {
    return res.status(401).json({
      ok: false,
      message: "Token tidak ditemukan",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ ok: false, message: "Token tidak valid" });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Akses hanya untuk admin" });
  }
  next();
};
