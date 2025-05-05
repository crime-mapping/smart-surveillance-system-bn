import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();

const modelAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiKey = req.header("model-api-key");

  if (!apiKey || apiKey !== process.env.MODEL_API_KEY) {
    res.status(403).json({ error: "Forbidden. Invalid or missing API key." });
    return;
  }

  next();
};

export default modelAuthMiddleware;
