import Notification from "../models/Notification";
import { Request, Response } from "express";

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find()
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Failed to fetch notifications:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json(notification);
  } catch (error) {
    console.error("❌ Failed to create notification:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete notification:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
