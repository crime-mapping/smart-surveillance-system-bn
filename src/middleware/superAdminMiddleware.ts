import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import User from "../models/User";
import { AuthRequest } from "./authMiddleware";

dotenv.config();

const superAdminMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findOne({ _id: req.user?.id });
    if (!user || !(user.role === "SUPERADMIN")) {
      res
        .status(403)
        .json({ error: "You are not allowed to access this route!" });
      return;
    }

    req.user = { id: user._id as string };
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error);
    res.status(401).json({ error: "Invalid or expired token!" });
    return;
  }
};

export default superAdminMiddleware;
