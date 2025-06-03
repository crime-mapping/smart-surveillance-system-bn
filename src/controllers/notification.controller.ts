import { AuthRequest } from "../middleware/authMiddleware";
import Notification from "../models/Notification";
import NotificationStatus from "../models/NotificationStatus";
import { Request, Response } from "express";
import { io } from "../server";

// GET all notifications with read status for the current user
export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Get all notifications
    const notifications = await Notification.find().sort({ createdAt: -1 });

    // Get this user's notification statuses
    const statuses = await NotificationStatus.find({ user: userId });

    // Map notification ID => isRead for quick lookup
    const readMap = new Map<string, boolean>(
      statuses.map((status) => [status.notification.toString(), status.isRead])
    );

    // Combine notifications with read status
    const result = notifications.map((notification) => {
      const notifObject = notification.toObject(); // converts to plain JS object
      return {
        ...notifObject,
        isRead: readMap.get(notification._id.toString()) || false,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Failed to fetch notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// POST create a new notification (admin action)
export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.create(req.body);
    io.emit("new-notification", notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

// DELETE a notification (admin action)
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    await NotificationStatus.deleteMany({ notification: req.params.id });
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PATCH mark one notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notificationId = req.params.id;

    await NotificationStatus.findOneAndUpdate(
      { user: userId, notification: notificationId },
      { isRead: true },
      { upsert: true }
    );

    res.status(200).json({ message: "Marked as read" });
  } catch (error) {
    console.error("❌ Failed to mark notification as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// PATCH mark all as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const notifications = await Notification.find();

    const bulk = notifications.map((n) => ({
      updateOne: {
        filter: { user: userId, notification: n._id },
        update: { isRead: true },
        upsert: true,
      },
    }));

    await NotificationStatus.bulkWrite(bulk);

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("❌ Failed to mark all notifications as read:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
