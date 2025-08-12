import { AuthRequest } from "../middleware/authMiddleware";
import Camera from "../models/Camera";
import { Request, Response } from "express";
import SupervisedLocation from "../models/SupervisedLocation";
import ffmpeg from "fluent-ffmpeg";
import { Types } from "mongoose";

function isStreamValid(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    ffmpeg(url).ffprobe((err, data) => {
      if (err) return resolve(false);
      resolve(true);
    });
  });
}

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

export const getSingleCamera = async (req: AuthRequest, res: Response) => {
  try {
    const cameras = await Camera.findOne({ _id: req.params?.id,active: true })
      .populate("location")
    res.status(200).json(cameras);
  } catch (error) {
    console.error("❌ Failed to fetch camera:", error);
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
    if (!(await isStreamValid(streamUrl))) {
      res.status(400).json({
        error:
          "The Camera Stream URl you're trying to use is not valid or doesn't exist !",
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

    // Find the camera first
    const camera = await Camera.findById(req.params.id);
    if (!camera) {
      return res.status(404).json({ error: "Camera not found" });
    }

    // Update only provided fields
    if (name !== undefined) camera.name = name;
    if (streamUrl !== undefined) camera.streamUrl = streamUrl;
    if (description !== undefined) camera.description = description;
    if (location !== undefined) camera.location = location;

    if (req.user?.id) {
  camera.lastUpdatedBy = new Types.ObjectId(req.user.id);
}


    // Save the updated camera
    const updatedCamera = await camera.save();

    res.status(200).json(updatedCamera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
    await SupervisedLocation.updateMany(
      { cameras: { $in: [req.params.id] } },
      { $pull: { cameras: req.params.id } }
    );
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};
