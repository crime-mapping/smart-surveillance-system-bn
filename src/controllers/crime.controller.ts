import Crime from "../models/Crime";
import { Request, Response } from "express";

export const getAllCrimes = async (req: Request, res: Response) => {
  try {
    const crimes = await Crime.find();
    res.status(200).json(crimes);
  } catch (error) {
    console.error("❌ Failed to fetch crimes:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCrime = async (req: Request, res: Response) => {
  try {
    const crime = await Crime.create(req.body);
    res.status(201).json(crime);
  } catch (error) {
    console.error("❌ Failed to create crime:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateCrime = async (req: Request, res: Response) => {
  try {
    const crime = await Crime.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(crime);
  } catch (error) {
    console.error("❌ Failed to update crime:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteCrime = async (req: Request, res: Response) => {
  try {
    await Crime.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete crime:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
