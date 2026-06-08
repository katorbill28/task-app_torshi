# Task Manager - Full Stack 

Small full-stack task manager with React frontend and Express backend.

## Stack

- Frontend: React (Vite)
- Backend: Node.js + Express
- Storage: file-based JSON (`server/data/tasks.json`)
- Tests: Vitest + Supertest (backend)
- Docker: `docker-compose.yml`

## Features

### Core

- List tasks
- Add task
- Mark task complete/incomplete
- Delete task
- Loading and error states in UI
- Backend validation with clear JSON responses

### Bonus

- Filter by all/incomplete/completed
- Edit existing task title
- Persistence across refreshes
- Basic API tests
- Docker setup

## API

- `GET /tasks` - list all tasks
- `GET /tasks?status=completed|incomplete` - filter tasks
- `POST /tasks` - create task `{ "title": "..." }`
- `PATCH /tasks/:id` - update `{ "completed": true }` and/or `{ "title": "..." }`
- `DELETE /tasks/:id` - delete task

All responses are JSON:

- Success: `{ "data": ... }`
- Error: `{ "error": "message" }`

## Run locally

### 1) Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2) Start backend

```bash
npm --prefix server run dev
```

Backend runs on `http://localhost:4000`.

### 3) Start frontend (new terminal)

```bash
npm --prefix client run dev
```

Frontend runs on `http://localhost:5173`.

## Tests

```bash
npm --prefix server run test
```

## Docker

```bash
docker compose up --build
```

Then open `http://localhost:5173`.

## Assumptions and trade-offs

- Chose file-based persistence to keep scope small and avoid DB setup.
- Kept authentication and multi-user behavior out of scope.
- Frontend refreshes list after mutations for correctness and simpler state management.
