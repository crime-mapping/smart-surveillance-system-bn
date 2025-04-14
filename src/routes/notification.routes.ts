import express from "express";
import {
  getAllNotifications,
  createNotification,
  deleteNotification,
} from "../controllers/notification.controller";

const router = express.Router();

router.get("/", getAllNotifications);
router.post("/", createNotification);
router.delete("/:id", deleteNotification);

export default router;
