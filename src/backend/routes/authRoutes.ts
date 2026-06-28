import { Router } from "express";
import { AuthController } from "../controllers/authController.ts";
import {
  registerValidationRules,
  loginValidationRules,
  validateRequest,
} from "../validators/authValidator.ts";
import { authenticateJWT } from "../middleware/authMiddleware.ts";

const router = Router();

// Public Routes
router.post(
  "/register",
  registerValidationRules,
  validateRequest,
  AuthController.register
);

router.post(
  "/login",
  loginValidationRules,
  validateRequest,
  AuthController.login
);

router.post("/logout", AuthController.logout);

// Protected Routes
router.get("/profile", authenticateJWT as any, AuthController.getProfile as any);
router.get("/users", authenticateJWT as any, AuthController.getAllUsers as any);

export default router;
