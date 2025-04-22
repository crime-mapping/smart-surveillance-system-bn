import express from "express";
import {
  getAllCrimes,
  createCrime,
  updateCrime,
  deleteCrime,
  getCrimeDashboardStats,
} from "../controllers/crime.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllCrimes);
router.post("/", authMiddleware, createCrime);
router.put("/:id", authMiddleware, updateCrime);
router.delete("/:id", authMiddleware, deleteCrime);
router.get("/statistics", authMiddleware, getCrimeDashboardStats);

export default router;
