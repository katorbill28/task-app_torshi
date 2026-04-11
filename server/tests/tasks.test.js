import { beforeEach, describe, expect, it } from "vitest";
import request from "supertest";
import { mkdir, writeFile } from "node:fs/promises";
import app from "../src/app.js";

const dbFolder = new URL("../data/", import.meta.url);
const dbFile = new URL("../data/tasks.json", import.meta.url);

beforeEach(async () => {
  await mkdir(dbFolder, { recursive: true });
  await writeFile(dbFile, "[]", "utf8");
});

describe("tasks api", () => {
  it("creates and lists tasks", async () => {
    const create = await request(app).post("/tasks").send({ title: "Ship API" });
    expect(create.status).toBe(201);
    expect(create.body.data.title).toBe("Ship API");

    const list = await request(app).get("/tasks");
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
  });

  it("updates completion state", async () => {
    const create = await request(app).post("/tasks").send({ title: "Test patch" });
    const id = create.body.data.id;

    const patch = await request(app).patch(`/tasks/${id}`).send({ completed: true });
    expect(patch.status).toBe(200);
    expect(patch.body.data.completed).toBe(true);
  });

  it("validates title", async () => {
    const create = await request(app).post("/tasks").send({ title: "  " });
    expect(create.status).toBe(400);
    expect(create.body.error).toBeTruthy();
  });
});
