import { Response } from "express";
import { TaskRepository } from "../models/Task.ts";
import { IAuthRequest } from "../middleware/authMiddleware.ts";

export class TaskController {
  /**
   * GET /api/tasks
   * Fetch all tasks. Admin gets all tasks, standard user gets only their own.
   */
  static async getTasks(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id || req.user!._id!.toString();
      const role = req.user!.role;

      let tasks;
      if (role === "admin") {
        tasks = await TaskRepository.findAll();
      } else {
        tasks = await TaskRepository.findByUserId(userId);
      }

      res.status(200).json({
        success: true,
        count: tasks.length,
        tasks,
      });
    } catch (error) {
      console.error("Fetch Tasks Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while fetching tasks.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * POST /api/tasks
   * Create a new task for the current user
   */
  static async createTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, status } = req.body;
      const userId = req.user!.id || req.user!._id!.toString();

      const task = await TaskRepository.create({
        title,
        description: description || "",
        status: status || "pending",
        userId,
      });

      res.status(201).json({
        success: true,
        message: "Task created successfully.",
        task,
      });
    } catch (error) {
      console.error("Create Task Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while creating task.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * PUT /api/tasks/:id
   * Update a task. Standard users can only update their own tasks.
   */
  static async updateTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body;
      const userId = req.user!.id || req.user!._id!.toString();
      const role = req.user!.role;

      // Find the task
      const task = await TaskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: "Task not found.",
          code: "TASK_NOT_FOUND",
        });
        return;
      }

      // Security check: must own task OR be admin
      if (task.userId !== userId && role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access Denied: You do not have permission to update this task.",
          code: "TASK_FORBIDDEN",
        });
        return;
      }

      const updatedTask = await TaskRepository.update(id, {
        title,
        description,
        status,
      });

      res.status(200).json({
        success: true,
        message: "Task updated successfully.",
        task: updatedTask,
      });
    } catch (error) {
      console.error("Update Task Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while updating task.",
        code: "SERVER_ERROR",
      });
    }
  }

  /**
   * DELETE /api/tasks/:id
   * Delete a task. Standard users can only delete their own tasks.
   */
  static async deleteTask(req: IAuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id || req.user!._id!.toString();
      const role = req.user!.role;

      // Find the task
      const task = await TaskRepository.findById(id);
      if (!task) {
        res.status(404).json({
          success: false,
          error: "Task not found.",
          code: "TASK_NOT_FOUND",
        });
        return;
      }

      // Security check: must own task OR be admin
      if (task.userId !== userId && role !== "admin") {
        res.status(403).json({
          success: false,
          error: "Access Denied: You do not have permission to delete this task.",
          code: "TASK_FORBIDDEN",
        });
        return;
      }

      const success = await TaskRepository.delete(id);
      if (!success) {
        res.status(400).json({
          success: false,
          error: "Failed to delete task.",
          code: "TASK_DELETE_FAILED",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "Task deleted successfully.",
      });
    } catch (error) {
      console.error("Delete Task Error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while deleting task.",
        code: "SERVER_ERROR",
      });
    }
  }
}
