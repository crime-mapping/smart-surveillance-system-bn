import { AuthRequest } from "../middleware/authMiddleware";
import SupervisedLocation from "../models/SupervisedLocation";
import { Request, Response } from "express";

export const getAllSupervisedLocations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const SupervisedLocations = await SupervisedLocation.find()
      .populate("cameras")
      .sort({ createdAt: -1 });
    res.status(200).json(SupervisedLocations);
  } catch (error) {
    console.error("❌ Failed to fetch SupervisedLocations:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createSupervisedLocation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { location, description } = req.body;

    if (!location) {
      res.status(400).json({
        error: "Location name is required",
      });
      return;
    }

    const newLocation = await SupervisedLocation.create({
      description,
      location,
      recordedBy: req.user?.id,
    });
    res.status(201).json(newLocation);
  } catch (error) {
    console.error("❌ Failed to create SupervisedLocation:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateSupervisedLocation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const supervisedLocation = await SupervisedLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    res.status(200).json(supervisedLocation);
  } catch (error) {
    console.error("❌ Failed to update SupervisedLocation:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteSupervisedLocation = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await SupervisedLocation.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete SupervisedLocation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
