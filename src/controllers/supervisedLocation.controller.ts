import { AuthRequest } from "../middleware/authMiddleware";
import SupervisedLocation from "../models/SupervisedLocation";
import { Request, Response } from "express";
import Camera from "../models/Camera";
import Crime from "../models/Crime";

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
    const { location, description, coordinates } = req.body;

    if (!location || location.trim() === "") {
      res.status(400).json({ error: "Location name is required" });
      return;
    }

    if (
      !coordinates ||
      !Array.isArray(coordinates) ||
      coordinates.length !== 2
    ) {
      res.status(400).json({
        error: "Coordinates must be an array of [latitude, longitude]",
      });
      return;
    }

    const [latitude, longitude] = coordinates;

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      res.status(400).json({ error: "Invalid latitude or longitude values" });
      return;
    }

    const newLocation = await SupervisedLocation.create({
      location: location.trim(),
      description: description?.trim() || "",
      coordinates,
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
    const locationId = req.params.id;

    // Check if there are cameras linked to this location
    const camerasCount = await Camera.countDocuments({ location: locationId });

    if (camerasCount > 0) {
      res
        .status(400)
        .json({ error: "Cannot delete. Location has associated cameras." });
      return;
    }

    // Check if there are crimes linked to this location
    const crimesCount = await Crime.countDocuments({
      crimeLocation: locationId,
    });

    if (crimesCount > 0) {
      res.status(400).json({
        error: "Cannot delete. Location has associated crime reports.",
      });
      return;
    }

    // If no dependencies, delete
    await SupervisedLocation.findByIdAndDelete(locationId);

    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete SupervisedLocation:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
