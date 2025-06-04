import express from "express";
import {
  getAllNotifications,
  createNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead,
} from "../controllers/notification.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllNotifications);
router.post("/", createNotification);
router.delete("/:id", authMiddleware, deleteNotification);

router.patch("/:id/read", authMiddleware, markAsRead);
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

export default router;
