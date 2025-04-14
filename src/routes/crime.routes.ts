import express from "express";
import {
  getAllCrimes,
  createCrime,
  updateCrime,
  deleteCrime,
} from "../controllers/crime.controller";

const router = express.Router();

router.get("/", getAllCrimes);
router.post("/", createCrime);
router.put("/:id", updateCrime);
router.delete("/:id", deleteCrime);

export default router;
