import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DB_PATH = new URL("../../data/tasks.json", import.meta.url);
const DB_FILE_PATH = fileURLToPath(DB_PATH);

const ensureDb = async () => {
  const folder = dirname(DB_FILE_PATH);
  await mkdir(folder, { recursive: true });

  try {
    await access(DB_FILE_PATH, constants.F_OK);
  } catch {
    await writeFile(DB_FILE_PATH, "[]", "utf8");
  }
};

export const readTasks = async () => {
  await ensureDb();
  const raw = await readFile(DB_FILE_PATH, "utf8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

export const writeTasks = async (tasks) => {
  await ensureDb();
  await writeFile(DB_FILE_PATH, JSON.stringify(tasks, null, 2), "utf8");
};
