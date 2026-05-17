"use client";

import { useState, useEffect, useCallback } from "react";
import { syncLoad, syncSave } from "@/lib/sync";
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  Clock,
  AlertCircle,
  Circle,
  ChevronDown,
  User,
  Calendar,
  Tag,
  Filter,
} from "lucide-react";

type Priority = "high" | "medium" | "low";
type Status = "todo" | "in_progress" | "done";
type Assignee = "Awab" | "Abdul" | "Both";

interface Todo {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  assignee: Assignee;
  client?: string;
  dueDate?: string;
  createdAt: string;
}

const ASSIGNEES: Assignee[] = ["Awab", "Abdul", "Both"];
const PRIORITIES: Priority[] = ["high", "medium", "low"];
const STATUSES: Status[] = ["todo", "in_progress", "done"];

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  high: { label: "High", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  low: { label: "Low", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
};

const STATUS_CONFIG: Record<Status, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  todo: {
    label: "To Do",
    icon: <Circle className="w-4 h-4" />,
    color: "text-[#666]",
    bg: "bg-[#1a1a1a]",
    border: "border-[#2a2a2a]",
  },
  in_progress: {
    label: "In Progress",
    icon: <Clock className="w-4 h-4" />,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  done: {
    label: "Done",
    icon: <Check className="w-4 h-4" />,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
};

const ASSIGNEE_COLORS: Record<Assignee, string> = {
  Awab: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  Abdul: "text-teal-400 bg-teal-500/10 border-teal-500/20",
  Both: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};

function isOverdue(dueDate?: string, status?: Status): boolean {
  if (!dueDate || status === "done") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

function AddTodoModal({
  clients,
  onAdd,
  onClose,
}: {
  clients: string[];
  onAdd: (t: Omit<Todo, "id" | "createdAt">) => void;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [assignee, setAssignee] = useState<Assignee>("Awab");
  const [client, setClient] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onAdd({ title: title.trim(), description: description.trim() || undefined, priority, status: "todo", assignee, client: client || undefined, dueDate: dueDate || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#111] border border-[#222] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h2 className="text-white font-bold text-lg mb-5">Add New Task</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Task Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="e.g. Edit 3 reels for Pets Delight"
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] focus:border-green-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes..."
              rows={2}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm placeholder-[#444] resize-none focus:border-green-500/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Assignee</label>
              <div className="flex gap-1.5">
                {ASSIGNEES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAssignee(a)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                      assignee === a ? ASSIGNEE_COLORS[a] : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Priority</label>
              <div className="flex gap-1.5">
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all capitalize ${
                      priority === p
                        ? `${PRIORITY_CONFIG[p].bg} ${PRIORITY_CONFIG[p].color} ${PRIORITY_CONFIG[p].border}`
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-[#666] hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Client (optional)</label>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
              >
                <option value="">No specific client</option>
                {clients.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[#888] text-xs font-medium mb-1.5 uppercase tracking-wide">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-white text-sm focus:border-green-500/50 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#2a2a2a] text-[#666] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="flex-1 py-3 rounded-xl bg-green-500 hover:bg-green-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
          >
            Add Task
          </button>
        </div>
      </div>
    </div>
  );
}

function TodoCard({
  todo,
  onStatusChange,
  onDelete,
}: {
  todo: Todo;
  onStatusChange: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const overdue = isOverdue(todo.dueDate, todo.status);
  const sc = STATUS_CONFIG[todo.status];
  const pc = PRIORITY_CONFIG[todo.priority];

  return (
    <div className={`bg-[#111] border rounded-2xl p-4 transition-all ${todo.status === "done" ? "border-[#1a1a1a] opacity-60" : "border-[#1e1e1e] hover:border-[#2a2a2a]"}`}>
      <div className="flex items-start gap-3">
        {/* Status toggle */}
        <div className="relative flex-shrink-0 mt-0.5">
          <button
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg border text-xs font-medium transition-all ${sc.bg} ${sc.color} ${sc.border}`}
          >
            {sc.icon}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {showStatusMenu && (
            <div className="absolute top-full left-0 mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-10 min-w-[140px] shadow-xl">
              {STATUSES.map((s) => {
                const sc2 = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => { onStatusChange(todo.id, s); setShowStatusMenu(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-[#222] ${sc2.color}`}
                  >
                    {sc2.icon}
                    {sc2.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium leading-snug ${todo.status === "done" ? "line-through text-[#555]" : "text-white"}`}>
              {todo.title}
            </p>
            <button
              onClick={() => onDelete(todo.id)}
              className="flex-shrink-0 text-[#333] hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {todo.description && (
            <p className="text-[#666] text-xs mt-1 leading-relaxed">{todo.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {/* Priority */}
            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${pc.bg} ${pc.color} ${pc.border}`}>
              {pc.label}
            </span>

            {/* Assignee */}
            <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${ASSIGNEE_COLORS[todo.assignee]}`}>
              {todo.assignee}
            </span>

            {/* Client */}
            {todo.client && (
              <span className="text-xs px-2 py-0.5 rounded-md border border-[#2a2a2a] text-[#888]">
                {todo.client}
              </span>
            )}

            {/* Due date */}
            {todo.dueDate && (
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${
                overdue
                  ? "text-red-400 bg-red-500/10 border-red-500/30"
                  : "text-[#666] border-[#2a2a2a]"
              }`}>
                {overdue && <AlertCircle className="w-3 h-3" />}
                <Calendar className="w-3 h-3" />
                {new Date(todo.dueDate + "T12:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                {overdue && " · Overdue"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterAssignee, setFilterAssignee] = useState<Assignee | "all">("all");
  const [clients, setClients] = useState<string[]>([]);

  useEffect(() => {
    // Load todos: Supabase is source of truth, fall back to localStorage
    const localTodos = (() => {
      try { return JSON.parse(localStorage.getItem("cactus-todos") ?? "null") ?? []; } catch { return []; }
    })();
    syncLoad<Todo[]>("todos", localTodos).then(todos => {
      setTodos(todos);
      localStorage.setItem("cactus-todos", JSON.stringify(todos));
    });

    try {
      const raw = localStorage.getItem("cactus-clients");
      if (raw) {
        const c = JSON.parse(raw) as { name: string }[];
        setClients(c.map((cl) => cl.name));
      }
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((updated: Todo[]) => {
    setTodos(updated);
    localStorage.setItem("cactus-todos", JSON.stringify(updated));
    syncSave("todos", updated);
  }, []);

  const handleAdd = (data: Omit<Todo, "id" | "createdAt">) => {
    save([{ ...data, id: `${Date.now()}`, createdAt: new Date().toISOString() }, ...todos]);
  };

  const handleStatusChange = (id: string, status: Status) => {
    save(todos.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const handleDelete = (id: string) => {
    save(todos.filter((t) => t.id !== id));
  };

  const filtered = todos.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterAssignee !== "all" && t.assignee !== filterAssignee && t.assignee !== "Both") return false;
    return true;
  });

  const counts = {
    todo: todos.filter((t) => t.status === "todo").length,
    in_progress: todos.filter((t) => t.status === "in_progress").length,
    done: todos.filter((t) => t.status === "done").length,
  };

  const overdueCnt = todos.filter((t) => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="space-y-8 fade-in">
      {showAddModal && (
        <AddTodoModal
          clients={clients}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-2">
            <CheckSquare className="w-4 h-4" />
            Task Board
          </div>
          <h1 className="text-white text-2xl font-bold">Tasks & Assignments</h1>
          <p className="text-[#666] mt-1">Track work across the team — assign, prioritize, and close tasks.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "To Do", count: counts.todo, color: "text-[#888]", bg: "bg-[#111]", icon: <Circle className="w-4 h-4" /> },
          { label: "In Progress", count: counts.in_progress, color: "text-blue-400", bg: "bg-blue-500/5", icon: <Clock className="w-4 h-4" /> },
          { label: "Done", count: counts.done, color: "text-green-400", bg: "bg-green-500/5", icon: <Check className="w-4 h-4" /> },
          { label: "Overdue", count: overdueCnt, color: overdueCnt > 0 ? "text-red-400" : "text-[#888]", bg: overdueCnt > 0 ? "bg-red-500/5" : "bg-[#111]", icon: <AlertCircle className="w-4 h-4" /> },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border border-[#1e1e1e] rounded-2xl p-4`}>
            <div className={`flex items-center gap-2 ${s.color} mb-1`}>
              {s.icon}
              <span className="text-xs font-medium">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#555]" />
          <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-xl p-1">
            {(["all", ...STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  filterStatus === s
                    ? "bg-green-500/10 border border-green-500/30 text-green-400"
                    : "text-[#666] hover:text-white"
                }`}
              >
                {s === "all" ? "All Status" : s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Assignee filter */}
        <div className="flex gap-1 bg-[#111] border border-[#1e1e1e] rounded-xl p-1">
          {(["all", ...ASSIGNEES] as const).map((a) => (
            <button
              key={a}
              onClick={() => setFilterAssignee(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterAssignee === a
                  ? "bg-green-500/10 border border-green-500/30 text-green-400"
                  : "text-[#666] hover:text-white"
              }`}
            >
              {a === "all" ? "All Team" : a}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-10">
            <CheckSquare className="w-10 h-10 text-[#444] mx-auto mb-4" />
            {todos.length === 0 ? (
              <>
                <p className="text-[#666] text-sm">No tasks yet.</p>
                <p className="text-[#444] text-xs mt-1">Hit &ldquo;Add Task&rdquo; to create your first one.</p>
              </>
            ) : (
              <>
                <p className="text-[#666] text-sm">No tasks match this filter.</p>
                <button onClick={() => { setFilterStatus("all"); setFilterAssignee("all"); }} className="text-green-400 text-xs mt-2 hover:underline">
                  Clear filters
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Group by status: todo → in_progress → done */}
          {(["todo", "in_progress", "done"] as Status[]).map((status) => {
            const group = filtered.filter((t) => t.status === status);
            if (group.length === 0) return null;
            const sc = STATUS_CONFIG[status];
            return (
              <div key={status}>
                <div className={`flex items-center gap-2 mb-2 ${sc.color}`}>
                  {sc.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider">{sc.label}</span>
                  <span className="text-xs text-[#444]">({group.length})</span>
                </div>
                <div className="space-y-2">
                  {group.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
                <div className="h-4" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
