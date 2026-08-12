import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { sendSuccess } from "./utils/response.js";
import { notFoundMiddleware } from "./middlewares/notFound.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import categoryRoutes from "./routes/category.routes.js";
import courseRoutes from "./routes/course.routes.js";

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (_req, res) => {
  return sendSuccess(
    res,
    {
      status: "online",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    },
    "Neuschool API is running smoothly."
  );
});

// API Feature Routes
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);

// 404 & Error Handling Middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
