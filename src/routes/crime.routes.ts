import express from "express";
import {
  getAllCrimes,
  createCrime,
  updateCrime,
  deleteCrime,
  getCrimeDashboardStats,
  getSingleCrime,
  getCrimeAnalytics,
  getCrimeHospotFrequency,
  getCrimesPerLocation,
} from "../controllers/crime.controller";
import authMiddleware from "../middleware/authMiddleware";
import modelAuthMiddleware from "../middleware/modelAuthMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllCrimes);
router.get("/statistics", authMiddleware, getCrimeDashboardStats);
router.get("/crime-hotspot-frequency", authMiddleware, getCrimeHospotFrequency);
router.get("/crimes-per-location", authMiddleware, getCrimesPerLocation);
router.get("/analytics", authMiddleware, getCrimeAnalytics);
router.get("/:id", authMiddleware, getSingleCrime);
router.post("/", modelAuthMiddleware, createCrime);
router.put("/:id", authMiddleware, updateCrime);
router.delete("/:id", authMiddleware, deleteCrime);

export default router;
