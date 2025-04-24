import express from "express";
import {
  getAllCameras,
  createCamera,
  updateCamera,
  desactivateCamera,
  connectCamera,
  disconnectCamera,
} from "../controllers/camera.controller";
import authMiddleware from "../middleware/authMiddleware";
import { getCrimeDashboardStats } from "../controllers/crime.controller";

const router = express.Router();

router.get("/", getAllCameras);
router.post("/", authMiddleware, createCamera);
router.put("/:id", authMiddleware, updateCamera);
router.put("/connect/:id", authMiddleware, connectCamera);
router.put("/disconnect/:id", authMiddleware, disconnectCamera);
router.put("/desactivate/:id", authMiddleware, desactivateCamera);
router.get("/statistics", getCrimeDashboardStats);

export default router;
