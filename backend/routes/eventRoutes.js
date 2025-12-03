import express from "express";
import {
    cancelEvent,
    createEvent,
    deleteEvent,
    getEventById,
    getEventRegistrations,
    getEvents,
    getMyEvents,
    registerEvent,
    updateEvent,
} from "../controllers/eventController.js";

import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------------------
// ROUTE KHUSUS DULU (lebih panjang)
// ---------------------------

// User melihat event yang dia daftar
router.get("/user/my-events", verifyToken, getMyEvents);

// User daftar event
router.post("/:id/register", verifyToken, registerEvent);

// User batal daftar event
router.delete("/:id/cancel", verifyToken, cancelEvent);

// Admin lihat peserta event
router.get("/:id/registrations", verifyToken, isAdmin, getEventRegistrations);

// Admin CRUD event
router.post("/", verifyToken, isAdmin, createEvent);
router.put("/:id", verifyToken, isAdmin, updateEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);

// ---------------------------
// ROUTE GENERIC (paling bawah)
// ---------------------------
router.get("/", getEvents);
router.get("/:id", getEventById);

export default router;
