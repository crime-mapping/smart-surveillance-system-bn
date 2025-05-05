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
import modelAuthMiddleware from "../middleware/modelAuthMiddleware";

const router = express.Router();

router.get("/", modelAuthMiddleware, getAllCameras);
router.post("/", authMiddleware, createCamera);
router.put("/:id", authMiddleware, updateCamera);
router.put("/connect/:id", authMiddleware, connectCamera);
router.put("/disconnect/:id", authMiddleware, disconnectCamera);
router.put("/desactivate/:id", authMiddleware, desactivateCamera);

export default router;
