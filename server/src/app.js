import express from "express";
import cors from "cors";
import tasksRouter from "./routes/tasks.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/tasks", tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "route not found" });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "internal server error" });
});

export default app;
