import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json.error || "Request failed");
  }

  return json.data;
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workingIds, setWorkingIds] = useState(new Set());
  const [error, setError] = useState("");

  const path = useMemo(() => {
    if (filter === "done") return "/tasks?status=completed";
    if (filter === "todo") return "/tasks?status=incomplete";
    return "/tasks";
  }, [filter]);

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request(path);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [path]);

  const markBusy = (id, value) => {
    setWorkingIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const addTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTitle("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTask = async (task) => {
    markBusy(task.id, true);
    setError("");
    try {
      await request(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      markBusy(task.id, false);
    }
  };

  const deleteTask = async (id) => {
    markBusy(id, true);
    setError("");
    try {
      await request(`/tasks/${id}`, { method: "DELETE" });
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      markBusy(id, false);
    }
  };

  const saveTitle = async (id) => {
    if (!editingTitle.trim()) return;

    markBusy(id, true);
    setError("");
    try {
      await request(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingId(null);
      setEditingTitle("");
      await loadTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      markBusy(id, false);
    }
  };

  return (
    <main className="app">
      <h1>Task Manager</h1>

      <form className="add-form" onSubmit={addTask}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Add a task"
          maxLength={120}
          aria-label="Task title"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="filters" role="tablist" aria-label="Task filters">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All</button>
        <button type="button" className={filter === "todo" ? "active" : ""} onClick={() => setFilter("todo")}>Incomplete</button>
        <button type="button" className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>Completed</button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading tasks...</p> : null}

      {!loading && tasks.length === 0 ? <p className="empty">No tasks yet.</p> : null}

      <ul className="task-list">
        {tasks.map((task) => {
          const busy = workingIds.has(task.id);
          const isEditing = editingId === task.id;

          return (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task)}
                disabled={busy}
                aria-label={`Mark ${task.title} completed`}
              />

              {isEditing ? (
                <input
                  value={editingTitle}
                  onChange={(event) => setEditingTitle(event.target.value)}
                  maxLength={120}
                />
              ) : (
                <span className={task.completed ? "done" : ""}>{task.title}</span>
              )}

              <div className="actions">
                {isEditing ? (
                  <>
                    <button type="button" onClick={() => saveTitle(task.id)} disabled={busy}>Save</button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setEditingTitle("");
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(task.id);
                      setEditingTitle(task.title);
                    }}
                    disabled={busy}
                  >
                    Edit
                  </button>
                )}
                <button type="button" onClick={() => deleteTask(task.id)} disabled={busy}>Delete</button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default App;
