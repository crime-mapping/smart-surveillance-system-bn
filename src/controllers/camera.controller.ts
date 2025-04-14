import Camera from "../models/Camera";
import { Request, Response } from "express";

export const getAllCameras = async (req: Request, res: Response) => {
  try {
    const cameras = await Camera.find().populate("owner");
    res.status(200).json(cameras);
  } catch (error) {
    console.error("❌ Failed to fetch cameras:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCamera = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.create(req.body);
    res.status(201).json(camera);
  } catch (error) {
    console.error("❌ Failed to create camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateCamera = async (req: Request, res: Response) => {
  try {
    const camera = await Camera.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(camera);
  } catch (error) {
    console.error("❌ Failed to update camera:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteCamera = async (req: Request, res: Response) => {
  try {
    await Camera.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete camera:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
