import express from "express";
import issueRoutes from "./routes/issues.js";
import agentRoutes from "./routes/agents.js";
import approvalRoutes from "./routes/approvals.js";
import auditRoutes from "./routes/audit.js";
import budgetRoutes from "./routes/budget.js";
import projectRoutes from "./routes/projects.js";
import goalRoutes from "./routes/goals.js";
import labelRoutes from "./routes/labels.js";
import dashboardRoutes from "./routes/dashboard.js";
import webhookRoutes from "./routes/webhooks.js";
import runRoutes from "./routes/runs.js";
import { errorHandler } from "./lib/error-handler.js";

export function createApp() {
  const app = express();

  app.use(express.json());

  // Health check
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Routes
  app.use("/api", issueRoutes);
  app.use("/api", agentRoutes);
  app.use("/api", approvalRoutes);
  app.use("/api", auditRoutes);
  app.use("/api", budgetRoutes);
  app.use("/api", projectRoutes);
  app.use("/api", goalRoutes);
  app.use("/api", labelRoutes);
  app.use("/api", dashboardRoutes);
  app.use("/api", webhookRoutes);
  app.use("/api", runRoutes);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}

// Start server if run directly
const port = parseInt(process.env["PORT"] ?? "3000", 10);
const app = createApp();

app.listen(port, () => {
  console.log(`API server listening on port ${port}`);
});

export default app;
