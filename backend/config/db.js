// import mysql from "mysql2";

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "",
//   database: "eventmate_db",
// });

// db.connect((err) => {
//   if (err) console.error("❌ DB Connection Error:", err);
//   else console.log("✅ MySQL Connected!");
// });

// export default db;

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});