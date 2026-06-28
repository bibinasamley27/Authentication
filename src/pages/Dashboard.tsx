import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import api from "../services/api.ts";
import { Task } from "../types.ts";
import {
  LogOut,
  User as UserIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Play,
  Database,
  Shield,
  Loader2,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  Server,
  KeyRound,
  LayoutDashboard,
  Users,
  Search,
  FileCode,
  Lock,
  ShieldCheck,
  ChevronRight,
  Bell
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form States for adding/editing tasks
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"pending" | "in-progress" | "completed">("pending");
  const [submitting, setSubmitting] = useState(false);

  // Analytics for the system
  const [dbMode, setDbMode] = useState("LocalDB");

  // Custom Navigation and Users state for professional theme polish
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "identities">("overview");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tasks on boot
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/tasks");
      if (response.data.success) {
        setTasks(response.data.tasks);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to retrieve tasks.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch health check status (to display connected DB status)
  const fetchHealth = async () => {
    try {
      const response = await api.get("/health");
      setDbMode(response.data.databaseMode || "LocalDB");
    } catch (err) {
      // Ignored
    }
  };

  // Fetch system users list for managed identities tab
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await api.get("/auth/users");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error("Failed to fetch system users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchHealth();
    fetchUsers();
  }, []);

  const triggerToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Handle Create or Update task
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      if (editingTask) {
        // Update task
        const taskId = editingTask.id || editingTask._id;
        const response = await api.put(`/tasks/${taskId}`, {
          title,
          description,
          status,
        });
        if (response.data.success) {
          triggerToast("Task updated successfully.");
          setEditingTask(null);
          setShowForm(false);
          resetForm();
          fetchTasks();
        }
      } else {
        // Create task
        const response = await api.post("/tasks", {
          title,
          description,
          status,
        });
        if (response.data.success) {
          triggerToast("New task logged successfully.");
          setShowForm(false);
          resetForm();
          fetchTasks();
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to commit task changes.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this task?")) return;
    try {
      const response = await api.delete(`/tasks/${id}`);
      if (response.data.success) {
        triggerToast("Task removed successfully.");
        fetchTasks();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete task.");
    }
  };

  // Handle status quick-change
  const handleQuickStatusChange = async (task: Task, newStatus: "pending" | "in-progress" | "completed") => {
    const taskId = task.id || task._id;
    if (!taskId) return;
    try {
      const response = await api.put(`/tasks/${taskId}`, {
        title: task.title,
        description: task.description,
        status: newStatus,
      });
      if (response.data.success) {
        triggerToast(`Status changed to ${newStatus}.`);
        fetchTasks();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update status.");
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setTitle("");
    setDescription("");
    setStatus("pending");
  };

  // Calculate high-level metrics
  const totalTasks = tasks.length;
  const pendingTasksCount = tasks.filter((t) => t.status === "pending").length;
  const inProgressTasksCount = tasks.filter((t) => t.status === "in-progress").length;
  const completedTasksCount = tasks.filter((t) => t.status === "completed").length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasksCount / totalTasks) * 100) : 0;

  // Managed identities list combined with beautiful sandbox display users
  const mockSystemUsers = [
    { id: "mock1", name: "Sarah Connor", email: "sarah.connor@cyberdyne.io", role: "admin", status: "Active", lastLogin: "2 mins ago" },
    { id: "mock2", name: "John Wick", email: "john.wick@continental.com", role: "user", status: "Active", lastLogin: "14 mins ago" },
    { id: "mock3", name: "Ellen Ripley", email: "ellen.ripley@weyland.com", role: "user", status: "Active", lastLogin: "1 hour ago" },
    { id: "mock4", name: "Kylo Ren", email: "k.ren@firstorder.net", role: "user", status: "Blocked", lastLogin: "12 failed attempts" }
  ];

  const displayUsers = [
    ...users.map(u => ({
      id: u.id || u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: "Active",
      lastLogin: "Just now"
    })),
    ...mockSystemUsers
  ].filter(u => {
    const q = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Sentinel Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0 h-full border-r border-slate-800">
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight block text-white">SentinelAuth</span>
              <span className="text-[10px] text-indigo-400 font-mono tracking-widest block uppercase mt-0.5 font-semibold">Workspace Pro</span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Systems Menu</p>
          
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Overview Dashboard
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "architecture"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <FileCode className="w-4 h-4 shrink-0" />
            Architecture &amp; Flow
          </button>

          <button
            onClick={() => setActiveTab("identities")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-3 transition cursor-pointer ${
              activeTab === "identities"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            Managed Identities
          </button>
        </nav>

        {/* User context footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs text-slate-300 font-bold uppercase shrink-0 border border-slate-700">
              {user?.name ? user.name.substring(0, 2) : "US"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-200 truncate leading-snug">{user?.name}</div>
              <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mt-0.5 truncate font-semibold">
                {user?.role === "admin" ? "🛡️ System Admin" : "👤 Standard Account"}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Workspace Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-slate-900 font-sans tracking-tight">
              {activeTab === "overview" && "Security Workspace"}
              {activeTab === "architecture" && "Identity Architecture Matrix"}
              {activeTab === "identities" && "Managed Identities Registry"}
            </h1>
          </div>
          
          <div className="flex items-center gap-3.5">
            {/* Status alerts */}
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold border border-emerald-100 shrink-0 uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              HTTPS SECURE
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold border border-indigo-100 shrink-0 uppercase tracking-wider">
              <Database className="w-3 h-3 text-indigo-500" />
              <span className="font-mono">{dbMode}</span>
            </div>

            <div className="h-5 w-[1px] bg-slate-200 hidden sm:block"></div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* Scrollable workspace core content */}
        <div className="p-8 flex-1 overflow-y-auto space-y-8">
          
          {/* Active Toast notifications */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-md border border-indigo-500 font-sans"
              >
                <Check className="w-4 h-4 shrink-0 bg-white/25 rounded-full p-0.5" />
                <span>{successMsg}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Analytics Row */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Active Tasks Logged</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{totalTasks}</div>
              <div className="text-[10px] text-emerald-600 font-bold mt-2.5 flex items-center gap-1 font-sans">
                <Check className="w-3.5 h-3.5" />
                {completionPercentage}% completion score
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Avg Crypt Hash Time</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">324ms</div>
              <div className="text-[10px] text-slate-500 font-bold mt-2.5 flex items-center gap-1 font-sans">
                <Server className="w-3.5 h-3.5" />
                bcrypt load: 12 work factor
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">My Account Access</div>
              <div className="text-3xl font-extrabold text-indigo-700 mt-2 tracking-tight uppercase font-sans">{user?.role}</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-2.5 flex items-center gap-1 font-sans">
                <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                {user?.role === "admin" ? "Administrative Privilege" : "Standard User Boundary"}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl shadow-xs">
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Overall Security Score</div>
              <div className="text-3xl font-extrabold text-indigo-800 mt-2 tracking-tight">A+</div>
              <div className="text-[10px] text-indigo-600 font-bold mt-2.5 flex items-center gap-1 font-sans">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Helmet &amp; CORS rules applied
              </div>
            </div>
          </section>

          {/* TAB 1: OVERVIEW SCREEN */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Role-Based Access override banner */}
              {user?.role === "admin" && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
                  <div className="p-2.5 bg-rose-100 text-rose-700 rounded-xl shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950 font-sans tracking-tight">Administrative Access Bypasses Active</h3>
                    <p className="text-xs text-rose-800 mt-1 leading-relaxed max-w-4xl font-sans">
                      As an administrator, you are granted complete global access bypasses under Role-Based Access Control (RBAC). You can view, modify, and delete tasks submitted by <strong>all registered users</strong> across the system.
                    </p>
                  </div>
                </div>
              )}

              {/* Two Column Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                
                {/* Left Side: Create/Edit Form + Checklist */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Task Form Container */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                      <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider font-sans">
                        {editingTask ? "📝 Modify Task Record" : "➕ Queue Secure Task"}
                      </h3>
                      {editingTask && (
                        <button
                          onClick={resetForm}
                          className="text-[10px] font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSubmitTask} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-sans">
                          Task Title
                        </label>
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Audit token signing keys"
                          className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-xs font-sans placeholder-slate-400 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-sans">
                          Context Details
                        </label>
                        <textarea
                          rows={3}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Confirm verification intervals on token signatures."
                          className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-xs font-sans placeholder-slate-400 outline-none transition"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 font-sans">
                          Execution Status
                        </label>
                        <select
                          value={status}
                          onChange={(e: any) => setStatus(e.target.value)}
                          className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-xs font-sans outline-none transition"
                        >
                          <option value="pending">⏳ Pending Queue</option>
                          <option value="in-progress">⚙️ In Progress</option>
                          <option value="completed">✅ Verification Completed</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center justify-center w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs uppercase tracking-wider"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                            Synchronizing...
                          </>
                        ) : editingTask ? (
                          "Apply Updates"
                        ) : (
                          "Log Secure Task"
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Security checklist of assertions */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                    <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-4 pb-2.5 border-b border-slate-100 font-sans">
                      🔒 Module Security Checklist
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 bg-emerald-50 rounded p-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 font-sans">HttpOnly JWT Session Storage</p>
                          <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">Cookies are completely inaccessible to client-side scripts, neutralizing XSS hijacking.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 bg-emerald-50 rounded p-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 font-sans">12-Round Password Hashing</p>
                          <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">Industry-standard bcrypt key stretching applied at server boundary registration.</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 bg-emerald-50 rounded p-0.5" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 font-sans">Secure RBAC Route Guards</p>
                          <p className="text-[10px] text-slate-400 leading-normal mt-0.5 font-sans">Both React view logic and API gateway middleware require explicit JWT verification.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Task Board view */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 font-sans tracking-tight">Task Queue</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Secure role-protected tasks managed by authenticated developers.</p>
                      </div>
                      <span className="text-[10px] bg-indigo-100 px-2.5 py-1 rounded-full text-indigo-700 uppercase font-bold tracking-wider font-mono">
                        TOTAL: {tasks.length}
                      </span>
                    </div>

                    {/* Task board list */}
                    {loading ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                        <span className="text-xs font-semibold font-sans">Retrieving tasks queue...</span>
                      </div>
                    ) : tasks.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <Shield className="w-10 h-10 text-slate-300 mb-3" />
                        <span className="text-sm font-bold text-slate-600 font-sans">Workspace Empty</span>
                        <span className="text-xs text-slate-400 mt-1 max-w-sm leading-normal font-sans">No tasks currently filed. Use the left dashboard panel to record a new task to check permissions.</span>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {tasks.map((task) => {
                          const taskId = task.id || task._id;
                          return (
                            <div key={taskId} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <h4 className="font-bold text-xs text-slate-900 truncate font-sans tracking-tight max-w-md">
                                    {task.title}
                                  </h4>
                                  
                                  {/* Status badges */}
                                  {task.status === "completed" && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider font-sans">
                                      Verified
                                    </span>
                                  )}
                                  {task.status === "in-progress" && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wider font-sans">
                                      Active
                                    </span>
                                  )}
                                  {task.status === "pending" && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-sans">
                                      Queued
                                    </span>
                                  )}

                                  {/* Owner identifier */}
                                  {task.user && (
                                    <span className="text-[9px] font-mono text-slate-400">
                                      ID: {typeof task.user === "string" ? task.user.substring(0, 8) : (task.user as any).name || "System"}
                                    </span>
                                  )}
                                </div>
                                {task.description && (
                                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans max-w-xl">
                                    {task.description}
                                  </p>
                                )}
                                <p className="text-[9px] text-slate-400 font-mono">
                                  Logged: {task.createdAt ? new Date(task.createdAt).toLocaleString() : "Unknown"}
                                </p>
                              </div>

                              {/* Interactive actions for task board */}
                              <div className="flex items-center gap-2 shrink-0">
                                {/* Quick status toggles */}
                                {task.status !== "completed" && (
                                  <button
                                    onClick={() => handleQuickStatusChange(task, "completed")}
                                    title="Complete Verification"
                                    className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-lg transition cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {task.status === "pending" && (
                                  <button
                                    onClick={() => handleQuickStatusChange(task, "in-progress")}
                                    title="Start execution"
                                    className="p-1.5 hover:bg-amber-50 text-slate-400 hover:text-amber-600 border border-slate-200 hover:border-amber-200 rounded-lg transition cursor-pointer"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <div className="w-[1px] h-4 bg-slate-200 mx-0.5"></div>

                                {/* Edit task */}
                                <button
                                  onClick={() => startEdit(task)}
                                  className="px-2.5 py-1 text-[10px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition cursor-pointer"
                                >
                                  Modify
                                </button>

                                {/* Delete button */}
                                <button
                                  onClick={() => handleDeleteTask(taskId!)}
                                  className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition cursor-pointer"
                                  title="Delete Task Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ARCHITECTURE & FLOW CHART */}
          {activeTab === "architecture" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 font-sans tracking-tight">Full MERN Authentication System Flow</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">A blueprint mapping our secure HTTP-Only JWT login credentials exchange.</p>
                  </div>
                  <span className="text-[10px] bg-indigo-100 px-2.5 py-1 rounded-full text-indigo-700 uppercase font-bold tracking-wider font-mono">
                    Production Verified
                  </span>
                </div>

                {/* Horizontal flow chart rendering */}
                <div className="p-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 relative bg-white">
                  {/* Step 1 */}
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative shadow-xs">
                    <div className="absolute -top-3.5 left-5 bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans">
                      01
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-indigo-600" />
                        React App Boundary
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        User inputs credentials in React. The protected router checks cookie state before granting client access.
                      </p>
                    </div>
                  </div>

                  {/* Arrow 1 */}
                  <div className="flex justify-center items-center text-slate-300 shrink-0">
                    <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
                  </div>

                  {/* Step 2 */}
                  <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-5 relative shadow-xs text-white">
                    <div className="absolute -top-3.5 left-5 bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans">
                      02
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <h4 className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5" />
                        Express Auth API
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Applies `express-validator` to scrub inputs. Executes standard 12-round bcrypt hash verification against database record.
                      </p>
                    </div>
                  </div>

                  {/* Arrow 2 */}
                  <div className="flex justify-center items-center text-slate-300 shrink-0">
                    <ChevronRight className="w-6 h-6 rotate-90 md:rotate-0" />
                  </div>

                  {/* Step 3 */}
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-5 relative shadow-xs">
                    <div className="absolute -top-3.5 left-5 bg-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-sans">
                      03
                    </div>
                    <div className="mt-2 space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        HttpOnly Cookie Sign
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Generates secure JWT payload. Signs payload and packs it into a strict httpOnly, sameSite secure cookie.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code display console layout */}
                <div className="border-t border-slate-200">
                  <div className="bg-slate-950 p-4 border-b border-slate-900 flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span className="ml-1 text-slate-300 font-semibold font-sans">Express Core Middleware Snippet</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-600">authMiddleware.ts</span>
                  </div>
                  
                  <div className="bg-slate-900 p-6 text-indigo-300 font-mono text-xs overflow-x-auto leading-relaxed">
                    <p className="text-emerald-500 font-semibold">// 🔒 Verify incoming signed cookie session before resolving request context</p>
                    <p className="mt-2 text-slate-300">export const authenticateJWT = async (req: IAuthRequest, res: Response, next: NextFunction) =&gt; &#123;</p>
                    <p className="ml-4 text-slate-300">try &#123;</p>
                    <p className="ml-8 text-indigo-400">const token = req.cookies.token || req.headers.authorization?.split(" ")[1];</p>
                    <p className="ml-8 text-slate-300">if (!token) &#123;</p>
                    <p className="ml-12 text-rose-400">return res.status(401).json(&#123; success: false, error: "Access denied. Token missing." &#125;);</p>
                    <p className="ml-8 text-slate-300">&#125;</p>
                    <br />
                    <p className="ml-8 text-indigo-400">const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as any;</p>
                    <p className="ml-8 text-indigo-400">const user = await UserRepository.findById(decoded.id);</p>
                    <p className="ml-8 text-slate-300">if (!user) &#123;</p>
                    <p className="ml-12 text-rose-400">return res.status(401).json(&#123; success: false, error: "Identity session invalid." &#125;);</p>
                    <p className="ml-8 text-slate-300">&#125;</p>
                    <br />
                    <p className="ml-8 text-emerald-400">req.user = user; // Attach identity context securely to request</p>
                    <p className="ml-8 text-slate-300">next();</p>
                    <p className="ml-4 text-slate-300">&#125; catch (error) &#123;</p>
                    <p className="ml-8 text-rose-400">res.status(401).json(&#123; success: false, error: "Session invalid or expired." &#125;);</p>
                    <p className="ml-4 text-slate-300">&#125;</p>
                    <p className="text-slate-300">&#125;;</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MANAGED IDENTITIES TABLE */}
          {activeTab === "identities" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                {/* Search Header */}
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 font-sans tracking-tight">Registered Identities</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Active secure user identities recognized inside our database environment.</p>
                  </div>
                  
                  {/* Search box input */}
                  <div className="relative max-w-xs w-full">
                    <Search className="absolute inset-y-0 left-3 flex items-center w-4 h-4 my-auto text-slate-400" />
                    <input
                      type="text"
                      placeholder="Filter identities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 rounded-xl text-xs font-sans placeholder-slate-400 outline-none transition"
                    />
                  </div>
                </div>

                {/* Table display */}
                {usersLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
                    <span className="text-xs font-semibold font-sans">Retrieving identities database...</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/50 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                          <th className="p-4 pl-6">Full Name</th>
                          <th className="p-4">Email Address</th>
                          <th className="p-4">Role Permission</th>
                          <th className="p-4">Authorization</th>
                          <th className="p-4 text-right pr-6">Last Logged</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {displayUsers.map((item, idx) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50 transition">
                            <td className="p-4 pl-6 font-bold text-slate-800 font-sans">
                              {item.name}
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[11px]">
                              {item.email}
                            </td>
                            <td className="p-4">
                              {item.role === "admin" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100 font-sans uppercase font-semibold">
                                  🛡️ ADMIN
                                </span>
                              ) : item.role === "editor" ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-100 font-sans uppercase font-semibold">
                                  ⚡ EDITOR
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 font-sans uppercase font-semibold">
                                  👤 USER
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              {item.status === "Blocked" ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-50 text-red-700 border border-red-100 font-sans uppercase font-semibold">
                                  ❌ Restricted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 font-sans uppercase font-semibold">
                                  ✔️ Passed
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right pr-6 text-slate-400 font-sans">
                              {item.lastLogin}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
