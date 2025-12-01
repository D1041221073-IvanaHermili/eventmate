import express from "express";
import {
    createEvent,
    deleteEvent,
    getEventById,
    getEventRegistrations,
    getEvents,
    registerEvent,
    updateEvent,
} from "../controllers/eventController.js";

import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Semua user bisa melihat event
router.get("/", getEvents);
router.get("/:id", getEventById);

// User daftar event
router.post("/:id/register", verifyToken, registerEvent);

// Admin lihat list pendaftar
router.get("/:id/registrations", verifyToken, isAdmin, getEventRegistrations);

// Admin CRUD event
router.post("/", verifyToken, isAdmin, createEvent);
router.put("/:id", verifyToken, isAdmin, updateEvent);
router.delete("/:id", verifyToken, isAdmin, deleteEvent);

export default router;
