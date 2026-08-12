import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  console.log(`🚀 Neuschool API Server running on port ${env.PORT} [${env.NODE_ENV}]`);
});

const handleShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down server gracefully...`);
  server.close(() => {
    console.log("Server shutdown complete.");
    process.exit(0);
  });
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});
