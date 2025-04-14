import express from "express";
import {
  getAllCameras,
  createCamera,
  updateCamera,
  deleteCamera,
} from "../controllers/camera.controller";

const router = express.Router();

router.get("/", getAllCameras);
router.post("/", createCamera);
router.put("/:id", updateCamera);
router.delete("/:id", deleteCamera);

export default router;
