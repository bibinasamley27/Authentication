import mongoose, { Schema, Document } from "mongoose";
import { LocalDB } from "../config/db.ts";

export interface ITask {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITaskDocument extends Document, Omit<ITask, "id" | "_id"> {
  _id: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    userId: { type: String, required: true },
  },
  { timestamps: true }
);

export const TaskModel = mongoose.models.Task || mongoose.model<ITaskDocument>("Task", TaskSchema);

export class TaskRepository {
  private static useMongo(): boolean {
    return !!process.env.MONGODB_URI;
  }

  static async findByUserId(userId: string): Promise<ITask[]> {
    if (this.useMongo()) {
      const tasks = await (TaskModel as any).find({ userId });
      return tasks.map((t: any) => t.toObject());
    } else {
      const db = LocalDB.read();
      return db.tasks.filter((t) => t.userId === userId);
    }
  }

  static async findById(id: string): Promise<ITask | null> {
    if (this.useMongo()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const task = await (TaskModel as any).findById(id);
      return task ? task.toObject() : null;
    } else {
      const db = LocalDB.read();
      const task = db.tasks.find((t) => t.id === id);
      return task ? { ...task } : null;
    }
  }

  static async create(taskData: Omit<ITask, "id" | "_id">): Promise<ITask> {
    if (this.useMongo()) {
      const newTask = new (TaskModel as any)(taskData);
      const savedTask = await newTask.save();
      return savedTask.toObject();
    } else {
      const db = LocalDB.read();
      const newTask: ITask = {
        id: Math.random().toString(36).substr(2, 9),
        title: taskData.title,
        description: taskData.description || "",
        status: taskData.status || "pending",
        userId: taskData.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.tasks.push(newTask);
      LocalDB.write(db);
      return newTask;
    }
  }

  static async update(id: string, updateData: Partial<Omit<ITask, "id" | "_id" | "userId">>): Promise<ITask | null> {
    if (this.useMongo()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await (TaskModel as any).findByIdAndUpdate(id, updateData, { new: true });
      return updated ? updated.toObject() : null;
    } else {
      const db = LocalDB.read();
      const index = db.tasks.findIndex((t) => t.id === id);
      if (index === -1) return null;

      db.tasks[index] = {
        ...db.tasks[index],
        ...updateData,
        updatedAt: new Date(),
      };
      LocalDB.write(db);
      return db.tasks[index];
    }
  }

  static async delete(id: string): Promise<boolean> {
    if (this.useMongo()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const result = await (TaskModel as any).findByIdAndDelete(id);
      return !!result;
    } else {
      const db = LocalDB.read();
      const initialLength = db.tasks.length;
      db.tasks = db.tasks.filter((t) => t.id !== id);
      LocalDB.write(db);
      return db.tasks.length < initialLength;
    }
  }

  // Admin capability: get all tasks
  static async findAll(): Promise<ITask[]> {
    if (this.useMongo()) {
      const tasks = await (TaskModel as any).find({});
      return tasks.map((t: any) => t.toObject());
    } else {
      const db = LocalDB.read();
      return db.tasks;
    }
  }
}
