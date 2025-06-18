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
  userAccess,
  getSingleUser,
  changePassword,
  toggleTwoFactor,
  requestPasswordReset,
  verifyResetCode,
  resetPassword,
} from "../controllers/user.controller";
import authMiddleware from "../middleware/authMiddleware";
import superAdminMiddleware from "../middleware/superAdminMiddleware";

const router = express.Router();

router.get("/", authMiddleware, superAdminMiddleware, getAllUsers);
router.post("/", authMiddleware, superAdminMiddleware, createUser);
router.get("/:id", authMiddleware, getSingleUser);
router.put("/access/:id", authMiddleware, superAdminMiddleware, userAccess);
router.put("/update/:id", authMiddleware, updateUser);
router.put("/profile", authMiddleware, updateUser);
router.put("/change-password", authMiddleware, changePassword);
router.patch("/toggle-2fa", authMiddleware, toggleTwoFactor);
router.put(
  "/desactivate/:id",
  authMiddleware,
  superAdminMiddleware,
  desactivateUser
);
router.post("/login", loginUser);
router.post("/google-login", loginWithGoogle);
router.post("/two-factor", verifyTwoFactor);
router.post("/request-reset", requestPasswordReset);
router.post("/verify-reset", verifyResetCode);
router.post("/reset-password", resetPassword);
router.post("/logout", logoutUser);

export default router;
