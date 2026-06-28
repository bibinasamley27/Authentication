import { Router } from "express";
import { TaskController } from "../controllers/taskController.ts";
import { authenticateJWT } from "../middleware/authMiddleware.ts";
import {
  taskValidationRules,
  validateTaskId,
  validateRequest,
} from "../validators/taskValidator.ts";

const router = Router();

// Apply auth protection globally to all task endpoints
router.use(authenticateJWT as any);

// CRUD routes
router.get("/", TaskController.getTasks as any);

router.post(
  "/",
  taskValidationRules,
  validateRequest,
  TaskController.createTask as any
);

router.put(
  "/:id",
  validateTaskId,
  taskValidationRules,
  validateRequest,
  TaskController.updateTask as any
);

router.delete(
  "/:id",
  validateTaskId,
  validateRequest,
  TaskController.deleteTask as any
);

export default router;
