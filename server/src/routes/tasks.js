import { Router } from "express";
import { randomUUID } from "node:crypto";
import { readTasks, writeTasks } from "../store/taskStore.js";
import { validatePatchBody, validateTitle } from "../utils/validation.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const { status } = req.query;

    if (!status) {
      return res.json({ data: tasks });
    }

    if (status !== "completed" && status !== "incomplete") {
      return res.status(400).json({ error: "status must be completed or incomplete" });
    }

    const filtered = tasks.filter((task) => task.completed === (status === "completed"));
    return res.json({ data: filtered });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title } = req.body;
    const titleError = validateTitle(title);

    if (titleError) {
      return res.status(400).json({ error: titleError });
    }

    const tasks = await readTasks();
    const task = {
      id: randomUUID(),
      title: title.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(task);
    await writeTasks(tasks);

    return res.status(201).json({ data: task });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const validationError = validatePatchBody(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "task not found" });
    }

    const updatedTask = {
      ...tasks[index],
      ...(Object.hasOwn(req.body, "completed") ? { completed: req.body.completed } : {}),
      ...(Object.hasOwn(req.body, "title") ? { title: req.body.title.trim() } : {}),
    };

    tasks[index] = updatedTask;
    await writeTasks(tasks);

    return res.json({ data: updatedTask });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const tasks = await readTasks();
    const index = tasks.findIndex((task) => task.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "task not found" });
    }

    tasks.splice(index, 1);
    await writeTasks(tasks);
    return res.json({ data: { id: req.params.id } });
  } catch (error) {
    return next(error);
  }
});

export default router;
