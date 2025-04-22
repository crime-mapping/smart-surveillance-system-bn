import { AuthRequest } from "../middleware/authMiddleware";
import Camera from "../models/Camera";
import { Request, Response } from "express";
import SupervisedLocation from "../models/SupervisedLocation";

export const getAllCameras = async (req: AuthRequest, res: Response) => {
  try {
    const cameras = await Camera.find({ active: true })
      .populate("location")
      .sort({ createdAt: -1 });
    res.status(200).json(cameras);
  } catch (error) {
    console.error("❌ Failed to fetch cameras:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCamera = async (req: AuthRequest, res: Response) => {
  try {
    const { name, streamUrl, description, location } = req.body;

    if (!name || !streamUrl || !location) {
      res.status(400).json({
        error: "Camera Name, location and streamUrl of the camera are required",
      });
      return;
    }

    const camera = await Camera.create({
      name,
      streamUrl,
      description,
      location,
      recordedBy: req.user?.id,
    });
    await SupervisedLocation.findByIdAndUpdate(
      location,
      {
        $push: { cameras: camera._id },
      },
      { new: true }
    );
    res.status(201).json(camera);
  } catch (error) {
    console.error("❌ Failed to create camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateCamera = async (req: AuthRequest, res: Response) => {
  try {
    const { name, streamUrl, description, location } = req.body;
    if (!name || !streamUrl || !location) {
      res.status(400).json({
        error: "Camera Name, location and streamUrl of the camera are required",
      });
      return;
    }
    const updateCamera = new Camera({
      name,
      streamUrl,
      description,
      location,
      lastUpdatedBy: req.user?.id,
    });
    const camera = await Camera.findOneAndUpdate(
      { _id: req.params.id },
      updateCamera,
      { new: true }
    );
    if (!camera)
      res.status(403).json({ error: "Not allowed or camera not found" });
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const disconnectCamera = async (req: AuthRequest, res: Response) => {
  try {
    const camera = await Camera.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          isConnected: false,
          lastUpdatededBy: req.user?.id,
        },
      },
      { new: true }
    );
    if (!camera)
      res.status(403).json({ error: "Not allowed or camera not found" });
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const connectCamera = async (req: AuthRequest, res: Response) => {
  try {
    const camera = await Camera.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          isConnected: true,
          lastUpdatededBy: req.user?.id,
        },
      },
      { new: true }
    );
    if (!camera)
      res.status(403).json({ error: "Not allowed or camera not found" });
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const desactivateCamera = async (req: AuthRequest, res: Response) => {
  try {
    const camera = await Camera.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          active: false,
          desactivatedBy: req.user?.id,
        },
      },
      { new: true }
    );
    if (!camera)
      res.status(403).json({ error: "Not allowed or camera not found" });
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};
