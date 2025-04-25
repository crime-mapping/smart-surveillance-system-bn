import express from "express";
import {
  getAllCrimes,
  createCrime,
  updateCrime,
  deleteCrime,
  getCrimeDashboardStats,
  getSingleCrime,
} from "../controllers/crime.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllCrimes);
router.get("/statistics", authMiddleware, getCrimeDashboardStats);
router.get("/:id", authMiddleware, getSingleCrime);
router.post("/", authMiddleware, createCrime);
router.put("/:id", authMiddleware, updateCrime);
router.delete("/:id", authMiddleware, deleteCrime);

export default router;
