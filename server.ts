import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./src/backend/config/db.ts";
import authRoutes from "./src/backend/routes/authRoutes.ts";
import taskRoutes from "./src/backend/routes/taskRoutes.ts";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // 1. Initialize Database
  await connectDB();

  // 2. Security Middlewares
  // Enable helmet with CSP disabled in development to allow Vite script/style injection
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // Configure CORS to support credential-sharing (essential for cookie-based JWT)
  const clientUrl = process.env.CLIENT_URL || process.env.APP_URL || "http://localhost:3000";
  app.use(
    cors({
      origin: [clientUrl, "http://localhost:3000", "http://127.0.0.1:3000"],
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // 3. Body & Cookie Parsing Middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // 4. Mount API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/tasks", taskRoutes);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "healthy",
      timestamp: new Date(),
      databaseMode: process.env.MONGODB_URI ? "MongoDB" : "LocalDB (Sandbox File)",
    });
  });

  // 5. Integrate Frontend Dev Server or Serve Production Static Assets
  if (process.env.NODE_ENV !== "production") {
    console.log("🛠️  Running in DEVELOPMENT mode. Mounting Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 Running in PRODUCTION mode. Serving pre-compiled static files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // 6. Listen on Port 3000 (bind to 0.0.0.0 for Cloud Run routing)
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🌐 Server active on: http://localhost:${PORT}`);
    console.log(`📡 Ingress Gateway: Bind address 0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("💥 Server start crashed:", error);
});
