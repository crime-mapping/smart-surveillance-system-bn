import express from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  desactivateUser,
  loginUser,
  loginWithGoogle,
  verifyTwoFactor,
  logoutUser,
} from "../controllers/user.controller";
import authMiddleware from "../middleware/authMiddleware";
import superAdminMiddleware from "../middleware/superAdminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, superAdminMiddleware, getAllUsers);
router.post("/", authMiddleware, superAdminMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.put("/:id", authMiddleware, superAdminMiddleware, desactivateUser);
router.post("/login", loginUser);
router.post("/google-login", loginWithGoogle);
router.post("/two-factor", verifyTwoFactor);
router.post("/logout", logoutUser);

export default router;
