import User from "../models/User";
import { Request, Response } from "express";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().populate("cameras");
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Failed to fetch users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (error) {
    console.error("❌ Failed to create user:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Failed to update user:", error);
    res.status(400).json({ error: "Bad Request" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    console.error("❌ Failed to delete user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
