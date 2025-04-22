import express from "express";
import {
  getAllSupervisedLocations,
  createSupervisedLocation,
  updateSupervisedLocation,
  deleteSupervisedLocation,
} from "../controllers/supervisedLocation.controller";
import authMiddleware from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", authMiddleware, getAllSupervisedLocations);
router.post("/", authMiddleware, createSupervisedLocation);
router.put("/:id", authMiddleware, updateSupervisedLocation);
router.delete("/:id", authMiddleware, deleteSupervisedLocation);

export default router;
