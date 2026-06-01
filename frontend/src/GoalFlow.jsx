import { useState, useEffect, useRef, useCallback } from "react";

// ─── Theme ───────────────────────────────────────────────────────────────────
const C = {
  primary: "#7C3AED",
  primaryDark: "#5B21B6",
  primaryLight: "#EDE9FE",
  accent: "#F59E0B",
  surface: "#FFFFFF",
  bg: "#F5F3FF",
  border: "#DDD6FE",
  text: "#1E1B4B",
  muted: "#6B7280",
  success: "#059669",
  danger: "#DC2626",
  card: "rgba(255,255,255,0.95)",
};

// ─── Simulated Real-Time Backend (replaces Java/MySQL for demo) ──────────────
// In production: replace with fetch() calls to Spring Boot REST endpoints
// and WebSocket connections for real-time updates.

const API_DELAY = () => 300 + Math.random() * 200;

let DB = {
  users: [
    { id: 1, name: "Akila Sharma", email: "akila@demo.com", password: "demo123", avatar: "AS", level: 4, xp: 2760, streak: 7, joinDate: "Jan 2024" },
    { id: 2, name: "Rahul Dev",    email: "rahul@demo.com", password: "demo123", avatar: "RD", level: 3, xp: 1840, streak: 3, joinDate: "Mar 2024" },
  ],
  goals: [
    { id: 1, userId: 1, title: "Frontend Developer Job", category: "Career",    progress: 75, deadline: "2024-08-30", icon: "💻", xp: 750,  createdAt: Date.now()-86400000*10 },
    { id: 2, userId: 1, title: "6-Pack Abs Challenge",   category: "Fitness",   progress: 45, deadline: "2024-09-15", icon: "🏋️", xp: 450,  createdAt: Date.now()-86400000*5  },
    { id: 3, userId: 1, title: "Save ₹50,000",           category: "Finance",   progress: 60, deadline: "2024-12-31", icon: "💰", xp: 600,  createdAt: Date.now()-86400000*3  },
    { id: 4, userId: 1, title: "Read 12 Books",          category: "Study",     progress: 33, deadline: "2024-12-31", icon: "📚", xp: 330,  createdAt: Date.now()-86400000*1  },
    { id: 5, userId: 2, title: "Learn React Native",     category: "Career",    progress: 55, deadline: "2024-10-10", icon: "🧠", xp: 550,  createdAt: Date.now()-86400000*7  },
    { id: 6, userId: 2, title: "Morning Run 5K",         category: "Fitness",   progress: 88, deadline: "2024-12-31", icon: "🏃", xp: 880,  createdAt: Date.now()-86400000*2  },
  ],
  tasks: [
    { id: 1, userId: 1, goalId: 1, text: "Complete React component", done: false, date: new Date().toDateString() },
    { id: 2, userId: 1, goalId: 1, text: "Apply to 3 companies",    done: true,  date: new Date().toDateString() },
    { id: 3, userId: 1, goalId: 2, text: "Workout 45 mins",         done: false, date: new Date().toDateString() },
    { id: 4, userId: 1, goalId: 3, text: "Transfer ₹2000 savings",  done: true,  date: new Date().toDateString() },
    { id: 5, userId: 1, goalId: 4, text: "Read 30 pages",           done: false, date: new Date().toDateString() },
  ],
  activity: [],
  nextGoalId: 7,
  nextTaskId: 6,
};

// Simulated real-time listeners
const listeners = {};
function subscribe(event, cb) {
  if (!listeners[event]) listeners[event] = [];
  listeners[event].push(cb);
  return () => { listeners[event] = listeners[event].filter(x => x !== cb); };
}
function emit(event, data) {
  (listeners[event] || []).forEach(cb => cb(data));
}

// Simulated API
const API = {
  login: (email, password) => new Promise((res, rej) => {
    setTimeout(() => {
      const user = DB.users.find(u => u.email === email && u.password === password);
      user ? res({ ...user }) : rej(new Error("Invalid credentials"));
    }, API_DELAY());
  }),
  register: (name, email, password) => new Promise((res, rej) => {
    setTimeout(() => {
      if (DB.users.find(u => u.email === email)) return rej(new Error("Email already registered"));
      const user = { id: DB.users.length + 1, name, email, password, avatar: name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2), level: 1, xp: 0, streak: 0, joinDate: new Date().toLocaleDateString("en-US",{month:"short",year:"numeric"}) };
      DB.users.push(user);
      res({ ...user });
    }, API_DELAY());
  }),
  getGoals: (userId) => new Promise(res => setTimeout(() => res(DB.goals.filter(g => g.userId === userId).map(g => ({...g}))), API_DELAY())),
  addGoal: (userId, goal) => new Promise(res => setTimeout(() => {
    const newGoal = { ...goal, id: DB.nextGoalId++, userId, progress: 0, xp: 100, createdAt: Date.now() };
    DB.goals.push(newGoal);
    emit("goal:added", { userId, goal: {...newGoal} });
    res({...newGoal});
  }, API_DELAY())),
  updateGoal: (goalId, updates) => new Promise(res => setTimeout(() => {
    const idx = DB.goals.findIndex(g => g.id === goalId);
    if (idx > -1) { DB.goals[idx] = { ...DB.goals[idx], ...updates }; emit("goal:updated", { goalId, goal: {...DB.goals[idx]} }); }
    res(DB.goals[idx] ? {...DB.goals[idx]} : null);
  }, API_DELAY())),
  deleteGoal: (goalId) => new Promise(res => setTimeout(() => {
    DB.goals = DB.goals.filter(g => g.id !== goalId);
    emit("goal:deleted", { goalId });
    res({ success: true });
  }, API_DELAY())),
  getTasks: (userId) => new Promise(res => setTimeout(() => res(DB.tasks.filter(t => t.userId === userId).map(t => ({...t}))), API_DELAY())),
  addTask: (userId, task) => new Promise(res => setTimeout(() => {
    const newTask = { ...task, id: DB.nextTaskId++, userId, done: false, date: new Date().toDateString() };
    DB.tasks.push(newTask);
    emit("task:added", { userId, task: {...newTask} });
    res({...newTask});
  }, API_DELAY())),
  toggleTask: (taskId) => new Promise(res => setTimeout(() => {
    const idx = DB.tasks.findIndex(t => t.id === taskId);
    if (idx > -1) { DB.tasks[idx].done = !DB.tasks[idx].done; emit("task:updated", { taskId, task: {...DB.tasks[idx]} }); }
    res(DB.tasks[idx] ? {...DB.tasks[idx]} : null);
  }, API_DELAY())),
  deleteTask: (taskId) => new Promise(res => setTimeout(() => {
    DB.tasks = DB.tasks.filter(t => t.id !== taskId);
    emit("task:deleted", { taskId });
    res({ success: true });
  }, API_DELAY())),
  getOnlineUsers: () => new Promise(res => setTimeout(() => res(DB.users.map(u => ({id: u.id, name: u.name, avatar: u.avatar, level: u.level}))), 100)),
};

// ─── Reusable UI Components ──────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{font-size:16px;-webkit-text-size-adjust:100%;}
  body{font-family:'DM Sans',system-ui,sans-serif;background:${C.bg};color:${C.text};-webkit-font-smoothing:antialiased;}
  input,button,textarea,select{font-family:inherit;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px;}
  button{cursor:pointer;border:none;background:none;}
  @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes pop{0%{transform:scale(0.85);opacity:0}80%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
  .fade-in{animation:fadeIn 0.35s ease both;}
  .slide-up{animation:slideUp 0.4s ease both;}
  .pop{animation:pop 0.3s ease both;}
  .spin{animation:spin 0.7s linear infinite;}
  .shimmer{background:linear-gradient(90deg,${C.primaryLight} 25%,#fff 50%,${C.primaryLight} 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}
  @media(max-width:640px){.hide-mobile{display:none!important;}}
  @media(min-width:641px){.show-mobile{display:none!important;}}
`;

function Spinner({ size = 20 }) {
  return <div className="spin" style={{ width: size, height: size, borderRadius: "50%", border: `2.5px solid ${C.primaryLight}`, borderTopColor: C.primary }} />;
}

function Avatar({ initials, size = 38, bg = C.primary, color = "#fff", style = {} }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, flexShrink: 0, letterSpacing: -0.5, ...style }}>
      {initials}
    </div>
  );
}

function Toast({ msg, type = "info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = { info: C.primary, success: C.success, danger: C.danger, warning: C.accent }[type];
  return (
    <div className="pop" style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, background: bg, color: "#fff", borderRadius: 14, padding: "12px 18px 12px 16px", maxWidth: 320, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span style={{ flex: 1, lineHeight: 1.4 }}>{msg}</span>
      <button onClick={onClose} style={{ color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1, marginTop: -1 }}>×</button>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 8888, background: "rgba(30,27,75,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 0" }}>
      <div className="slide-up" style={{ background: C.surface, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", padding: "24px 20px 40px", boxShadow: "0 -8px 48px rgba(124,58,237,0.18)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: C.primaryLight, color: C.primary, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>{label}</label>}
      <input {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", background: "#FAFAFA", color: C.text, transition: "border 0.2s", ...props.style }} onFocus={e=>e.target.style.borderColor=C.primary} onBlur={e=>e.target.style.borderColor=C.border} />
    </div>
  );
}

function Select({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 6 }}>{label}</label>}
      <select {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 14, outline: "none", background: "#FAFAFA", color: C.text }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Btn({ children, variant = "primary", loading = false, style = {}, ...props }) {
  const styles = {
    primary: { background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: "#fff", boxShadow: `0 4px 14px rgba(124,58,237,0.3)` },
    secondary: { background: C.primaryLight, color: C.primary, boxShadow: "none" },
    danger: { background: C.danger, color: "#fff", boxShadow: "0 4px 14px rgba(220,38,38,0.25)" },
    ghost: { background: "transparent", color: C.muted, border: `1.5px solid ${C.border}`, boxShadow: "none" },
  };
  return (
    <button {...props} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, transition: "all 0.2s", opacity: (loading || props.disabled) ? 0.65 : 1, ...styles[variant], ...style }} disabled={loading || props.disabled}>
      {loading ? <Spinner size={16} /> : children}
    </button>
  );
}

function CircularProgress({ pct, size = 72, stroke = 7, color = C.primary }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.primaryLight} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
    </svg>
  );
}

function ProgressBar({ value, color = C.primary, height = 6 }) {
  return (
    <div style={{ background: C.primaryLight, borderRadius: height, height, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, value)}%`, height: "100%", background: color, borderRadius: height, transition: "width 0.8s ease" }} />
    </div>
  );
}

// ─── Login / Register Screen ─────────────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("akila@demo.com");
  const [password, setPassword] = useState("demo123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      let user;
      if (mode === "login") user = await API.login(email, password);
      else { if (!name.trim()) throw new Error("Name is required"); user = await API.register(name, email, password); }
      onLogin(user);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(145deg, #EDE9FE 0%, #F5F3FF 50%, #FEF3C7 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="fade-in" style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 16px", boxShadow: `0 8px 32px rgba(124,58,237,0.35)` }}>🎯</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: -0.5 }}>GoalFlow</h1>
          <p style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>Real-time goal tracking, together</p>
        </div>

        <div style={{ background: C.surface, borderRadius: 24, padding: "28px 24px", boxShadow: "0 8px 40px rgba(124,58,237,0.12)", border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", background: C.primaryLight, borderRadius: 12, padding: 3, marginBottom: 24 }}>
            {["login","register"].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 14, fontWeight: 600, background: mode===m ? C.primary : "transparent", color: mode===m ? "#fff" : C.muted, transition: "all 0.2s" }}>
                {m === "login" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === "register" && <Input label="Full Name" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)} required />}
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            {error && <p style={{ fontSize: 13, color: C.danger, marginBottom: 12, fontWeight: 500 }}>⚠️ {error}</p>}
            <Btn loading={loading} style={{ width: "100%" }}>{mode==="login" ? "Sign In →" : "Create Account →"}</Btn>
          </form>

          {mode === "login" && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: C.bg, borderRadius: 12, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              <strong>Demo:</strong> akila@demo.com / demo123<br />
              or rahul@demo.com / demo123
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard / Home ────────────────────────────────────────────────────────

function HomePage({ user, goals, tasks, onToggleTask, onAddTask }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const todayTasks = tasks.filter(t => t.date === new Date().toDateString());
  const done = todayTasks.filter(t => t.done).length;
  const pct = todayTasks.length ? Math.round((done / todayTasks.length) * 100) : 0;
  const [newTask, setNewTask] = useState("");
  const [adding, setAdding] = useState(false);

  async function addTask(e) {
    e.preventDefault();
    if (!newTask.trim()) return;
    setAdding(true);
    await onAddTask({ text: newTask, goalId: null });
    setNewTask(""); setAdding(false);
  }

  const weekDays = ["M","T","W","T","F","S","S"];
  const weekStatus = [1,1,0,1,1,1,0]; // mock last 7 days

  return (
    <div className="fade-in" style={{ padding: "0 0 96px" }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.primary} 0%, ${C.primaryDark} 100%)`, padding: "28px 20px 40px", borderRadius: "0 0 32px 32px", color: "#fff", marginBottom: -20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar initials={user.avatar} size={48} bg="rgba(255,255,255,0.25)" style={{ border: "2px solid rgba(255,255,255,0.5)" }} />
          <div>
            <p style={{ fontSize: 12, opacity: 0.75, fontWeight: 500 }}>{greeting} 👋</p>
            <h2 style={{ fontSize: 20, fontWeight: 800 }}>{user.name}</h2>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>⚡ Lv.{user.level}</div>
            <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>🔥 {user.streak}d</div>
          </div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "11px 14px", fontSize: 13, fontStyle: "italic", backdropFilter: "blur(8px)" }}>
          ✨ "Consistency beats motivation every time."
        </div>
      </div>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
        {/* Progress card */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "20px", boxShadow: "0 4px 24px rgba(124,58,237,0.10)", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <CircularProgress pct={pct} size={76} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: C.primary }}>{pct}%</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <p style={{ fontWeight: 700, fontSize: 15 }}>Today's Progress</p>
                <span style={{ fontSize: 12, fontWeight: 700, background: C.primaryLight, color: C.primary, padding: "3px 10px", borderRadius: 20 }}>{done}/{todayTasks.length} done</span>
              </div>
              <ProgressBar value={pct} />
              <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{pct >= 70 ? "🔥 You're crushing it!" : pct >= 40 ? "⚡ Keep pushing!" : "💪 Let's get started!"}</p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[{icon:"✅",val:done,label:"Done Today"},{icon:"🎯",val:goals.length,label:"Active Goals"},{icon:"⚡",val:user.xp,label:"Total XP"}].map(s => (
            <div key={s.label} style={{ background: C.surface, borderRadius: 16, padding: "14px 10px", textAlign: "center", border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 22 }}>{s.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.primary }}>{s.val}</div>
              <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Weekly tracker */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>📅 This Week</p>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{weekStatus[i] ? "✅" : "⚪"}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's tasks */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>✅ Today's Tasks</p>
          </div>
          <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input value={newTask} onChange={e=>setNewTask(e.target.value)} placeholder="Add a quick task..." style={{ flex: 1, padding: "9px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, outline: "none" }} />
            <Btn loading={adding} style={{ padding: "9px 14px", fontSize: 13 }}>+</Btn>
          </form>
          {todayTasks.length === 0 && <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "8px 0" }}>No tasks yet — add one above!</p>}
          {todayTasks.map(t => (
            <div key={t.id} onClick={() => onToggleTask(t.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.primaryLight}`, cursor: "pointer" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${t.done ? C.success : C.border}`, background: t.done ? C.success : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {t.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: t.done ? C.muted : C.text, textDecoration: t.done ? "line-through" : "none", transition: "all 0.2s" }}>{t.text}</span>
            </div>
          ))}
        </div>

        {/* Recent goals */}
        {goals.slice(0, 2).map(g => (
          <div key={g.id} style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 10, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{g.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.title}</p>
              <ProgressBar value={g.progress} />
              <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{g.progress}% · Due {g.deadline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Goals Page ───────────────────────────────────────────────────────────────

const CATEGORIES = ["All","Career","Fitness","Finance","Study","Self Care","Health","Personal"];
const CAT_ICONS = { Career:"💼", Fitness:"🏋️", Finance:"💰", Study:"📚", "Self Care":"💄", Health:"❤️", Personal:"🌟" };
const GOAL_ICONS = ["🎯","💻","📚","🏋️","💰","❤️","🌟","🚀","🎨","🧠","🏃","✍️","🎸","🌱","💡"];

function GoalsPage({ goals, onAddGoal, onUpdateGoal, onDeleteGoal }) {
  const [filter, setFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", category: "Career", icon: "🎯", deadline: "" });

  const filtered = filter === "All" ? goals : goals.filter(g => g.category === filter);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    await onAddGoal(form);
    setForm({ title:"", category:"Career", icon:"🎯", deadline:"" });
    setShowAdd(false); setLoading(false);
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);
    await onUpdateGoal(showEdit.id, { title: form.title, category: form.category, icon: form.icon, deadline: form.deadline });
    setShowEdit(null); setLoading(false);
  }

  async function handleProgress(goal, delta) {
    const newPct = Math.max(0, Math.min(100, goal.progress + delta));
    await onUpdateGoal(goal.id, { progress: newPct });
  }

  function openEdit(g) {
    setForm({ title: g.title, category: g.category, icon: g.icon, deadline: g.deadline });
    setShowEdit(g);
  }

  const GoalForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit}>
      <Input label="Goal Title" placeholder="e.g. Learn React Native" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required />
      <Select label="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})} options={CATEGORIES.slice(1).map(c=>({value:c,label:c}))} />
      <Input label="Deadline" type="date" value={form.deadline} onChange={e=>setForm({...form,deadline:e.target.value})} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: C.muted, display: "block", marginBottom: 8 }}>Choose Icon</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {GOAL_ICONS.map(ic => (
            <button type="button" key={ic} onClick={() => setForm({...form,icon:ic})} style={{ width: 40, height: 40, borderRadius: 10, fontSize: 20, background: form.icon===ic ? C.primaryLight : C.bg, border: `2px solid ${form.icon===ic ? C.primary : "transparent"}`, transition: "all 0.15s" }}>{ic}</button>
          ))}
        </div>
      </div>
      <Btn loading={loading} style={{ width: "100%" }}>{submitLabel}</Btn>
    </form>
  );

  return (
    <div className="fade-in" style={{ padding: "0 0 96px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, padding: "28px 20px 40px", borderRadius: "0 0 32px 32px", color: "#fff", marginBottom: -20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>🎯 My Goals</h2>
            <p style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>Track. Achieve. Level up.</p>
          </div>
          <button onClick={() => { setForm({title:"",category:"Career",icon:"🎯",deadline:""}); setShowAdd(true); }} style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>+ New</button>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[{v:`Level ${goals.length > 0 ? Math.min(10, Math.floor(goals.reduce((s,g)=>s+g.progress,0)/goals.length/10)+1) : 1}`,l:"Current"},{v:goals.reduce((s,g)=>s+g.xp,0),l:"Total XP"},{v:`${goals.length}/∞`,l:"Goals"}].map(s => (
            <div key={s.l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "10px 14px", flex: 1, textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>{s.v}</div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
        {/* Category filter */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16, scrollbarWidth: "none" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c)} style={{ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", background: filter===c ? C.primary : C.surface, color: filter===c ? "#fff" : C.muted, border: `1.5px solid ${filter===c ? C.primary : C.border}`, transition: "all 0.2s" }}>{c}</button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p style={{ color: C.muted, fontSize: 14 }}>No goals yet. Add your first goal!</p>
            <Btn onClick={() => setShowAdd(true)} style={{ marginTop: 14 }}>+ Add Goal</Btn>
          </div>
        )}

        {filtered.map(g => (
          <div key={g.id} className="fade-in" style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: 14, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{g.icon}</div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{g.title}</p>
                  <span style={{ fontSize: 11, fontWeight: 700, background: C.primaryLight, color: C.primary, padding: "2px 8px", borderRadius: 20 }}>{CAT_ICONS[g.category] || "📌"} {g.category}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openEdit(g)} style={{ width: 30, height: 30, borderRadius: 8, background: C.bg, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                <button onClick={() => onDeleteGoal(g.id)} style={{ width: 30, height: 30, borderRadius: 8, background: "#FEE2E2", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: C.muted }}>
                <span style={{ fontWeight: 700, color: C.primary, fontSize: 14 }}>{g.progress}%</span>
                <span>🗓 {g.deadline || "No deadline"}</span>
              </div>
              <ProgressBar value={g.progress} color={g.progress >= 80 ? C.success : g.progress >= 50 ? C.primary : C.accent} />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => handleProgress(g, -10)} style={{ padding: "5px 12px", borderRadius: 8, background: C.bg, fontSize: 13, fontWeight: 700, color: C.muted, border: `1px solid ${C.border}` }}>−10%</button>
              <button onClick={() => handleProgress(g, +10)} style={{ padding: "5px 12px", borderRadius: 8, background: C.primaryLight, fontSize: 13, fontWeight: 700, color: C.primary }}>+10%</button>
              {g.progress >= 100 && <span style={{ marginLeft: "auto", fontSize: 13, fontWeight: 700, color: C.success }}>🏆 Completed!</span>}
              {g.progress < 100 && <span style={{ marginLeft: "auto", fontSize: 11, color: C.muted }}>⚡ +{g.xp} XP</span>}
            </div>
          </div>
        ))}
      </div>

      {showAdd && <Modal title="Add New Goal" onClose={() => setShowAdd(false)}><GoalForm onSubmit={handleAdd} submitLabel="Add Goal 🎯" /></Modal>}
      {showEdit && <Modal title="Edit Goal" onClose={() => setShowEdit(null)}><GoalForm onSubmit={handleUpdate} submitLabel="Save Changes ✓" /></Modal>}
    </div>
  );
}

// ─── Leaderboard / Community Page ─────────────────────────────────────────────

function CommunityPage({ user }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [liveActivity, setLiveActivity] = useState([
    { id: 1, user: "Rahul", action: "completed 'Morning Run'", time: "2m ago", icon: "🏃" },
    { id: 2, user: "Priya", action: "added goal 'NEET Prep 2025'", time: "5m ago", icon: "📚" },
    { id: 3, user: "Arjun", action: "reached 100% on 'Save ₹30k'", time: "12m ago", icon: "💰" },
    { id: 4, user: "Sneha", action: "started 7-day streak", time: "18m ago", icon: "🔥" },
  ]);

  useEffect(() => {
    API.getOnlineUsers().then(setOnlineUsers);
    // Simulate real-time activity stream
    const interval = setInterval(() => {
      const actions = ["completed a task", "updated their goal", "logged a workout", "hit a milestone"];
      const names = ["Karthik","Divya","Muthu","Lakshmi","Vijay","Ananya"];
      const icons = ["✅","🎯","🏋️","⭐","🔥","💪"];
      const name = names[Math.floor(Math.random()*names.length)];
      const action = actions[Math.floor(Math.random()*actions.length)];
      const icon = icons[Math.floor(Math.random()*icons.length)];
      setLiveActivity(prev => [{ id: Date.now(), user: name, action, time: "just now", icon }, ...prev.slice(0, 6)]);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const leaderboard = [
    { rank: 1, name: "Priya M.", xp: 4200, streak: 21, avatar: "PM", badge: "🥇" },
    { rank: 2, name: user.name, xp: user.xp, streak: user.streak, avatar: user.avatar, badge: "🥈", isYou: true },
    { rank: 3, name: "Rahul D.", xp: 1840, streak: 9, avatar: "RD", badge: "🥉" },
    { rank: 4, name: "Ananya K.", xp: 1200, streak: 5, avatar: "AK", badge: "4️⃣" },
  ];

  return (
    <div className="fade-in" style={{ padding: "0 0 96px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, padding: "28px 20px 36px", borderRadius: "0 0 32px 32px", color: "#fff", marginBottom: -16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>🌍 Community</h2>
        <p style={{ opacity: 0.75, fontSize: 13, marginTop: 2 }}>Stay accountable. Grow together.</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 0 2px rgba(74,222,128,0.3)" }} />
          <span style={{ fontSize: 13 }}>{onlineUsers.length} users online now</span>
        </div>
      </div>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
        {/* Leaderboard */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏆 Weekly Leaderboard</p>
          {leaderboard.map((u, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < leaderboard.length-1 ? `1px solid ${C.primaryLight}` : "none", background: u.isYou ? C.primaryLight : "transparent", margin: u.isYou ? "0 -8px" : 0, padding: u.isYou ? "10px 8px" : "10px 0", borderRadius: u.isYou ? 12 : 0 }}>
              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{u.badge}</span>
              <Avatar initials={u.avatar} size={36} bg={u.isYou ? C.primary : C.border} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{u.name}{u.isYou ? " (You)" : ""}</p>
                <p style={{ fontSize: 11, color: C.muted }}>🔥 {u.streak}d streak</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, color: C.primary, fontSize: 15 }}>{u.xp.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: C.muted }}>XP</div>
              </div>
            </div>
          ))}
        </div>

        {/* Live activity feed */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>⚡ Live Activity</p>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.success, fontWeight: 700 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success }} />
              Real-time
            </div>
          </div>
          {liveActivity.map(a => (
            <div key={a.id} className="fade-in" style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${C.primaryLight}`, alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}><strong>{a.user}</strong> {a.action}</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Online users */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}` }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>👥 Online Now</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {onlineUsers.map(u => (
              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 8, background: C.bg, borderRadius: 12, padding: "8px 12px" }}>
                <div style={{ position: "relative" }}>
                  <Avatar initials={u.avatar} size={30} />
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: C.success, border: "1.5px solid #fff" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ user, goals, tasks, onLogout }) {
  const totalDone = tasks.filter(t => t.done).length;
  const avgProgress = goals.length ? Math.round(goals.reduce((s,g)=>s+g.progress,0)/goals.length) : 0;
  const stats = [
    { label: "Tasks Done",    val: totalDone,        icon: "✅" },
    { label: "Goals Active",  val: goals.length,     icon: "🎯" },
    { label: "Avg Progress",  val: `${avgProgress}%`,icon: "📊" },
    { label: "Current Level", val: user.level,       icon: "⚡" },
    { label: "Total XP",      val: user.xp,          icon: "🌟" },
    { label: "Streak Days",   val: user.streak,      icon: "🔥" },
  ];

  const xpForNextLevel = (user.level) * 1000;
  const xpProgress = Math.min(100, Math.round((user.xp % 1000) / 10));

  return (
    <div className="fade-in" style={{ padding: "0 0 96px" }}>
      <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, padding: "36px 20px 56px", borderRadius: "0 0 40px 40px", color: "#fff", textAlign: "center", marginBottom: -28 }}>
        <Avatar initials={user.avatar} size={80} bg="rgba(255,255,255,0.25)" style={{ margin: "0 auto 12px", border: "3px solid rgba(255,255,255,0.5)", fontSize: 28 }} />
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>{user.name}</h2>
        <p style={{ opacity: 0.8, fontSize: 13, marginTop: 4 }}>Level {user.level} · Joined {user.joinDate}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>🔥 {user.streak}-Day Streak</span>
          <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700 }}>⭐ Top 30%</span>
        </div>
      </div>

      <div style={{ padding: "0 16px", position: "relative", zIndex: 1 }}>
        {/* XP Progress */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <p style={{ fontWeight: 700, fontSize: 14 }}>⚡ Level Progress</p>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.primary }}>{user.xp % 1000} / 1000 XP</span>
          </div>
          <ProgressBar value={xpProgress} />
          <p style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{1000 - (user.xp % 1000)} XP to Level {user.level + 1}</p>
        </div>

        {/* Stats grid */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>📊 Statistics</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {stats.map(s => (
              <div key={s.label} style={{ textAlign: "center", padding: "12px 4px", background: C.bg, borderRadius: 14 }}>
                <div style={{ fontSize: 20 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 17, color: C.primary }}>{s.val}</div>
                <div style={{ fontSize: 9, color: C.muted, fontWeight: 700, marginTop: 2, lineHeight: 1.2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>🏅 Achievements</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[{icon:"🥉",label:"First Goal",earned:true},{icon:"🥈",label:"3-Day Streak",earned:true},{icon:"🥇",label:"10-Day Streak",earned:user.streak>=10},{icon:"👑","label":"Goal Master",earned:goals.length>=5},{icon:"🔥","label":"7-Day Streak",earned:user.streak>=7},{icon:"🚀","label":"Level 5",earned:user.level>=5}].map((b,i) => (
              <div key={i} style={{ textAlign: "center", padding: "10px 4px", borderRadius: 14, background: b.earned ? C.primaryLight : C.bg, opacity: b.earned ? 1 : 0.45 }}>
                <div style={{ fontSize: 26 }}>{b.icon}</div>
                <div style={{ fontSize: 9, fontWeight: 700, color: b.earned ? C.primary : C.muted, marginTop: 4, lineHeight: 1.3 }}>{b.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Account info */}
        <div style={{ background: C.surface, borderRadius: 20, padding: "16px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>👤 Account</p>
          {[{label:"Email",val:user.email,icon:"📧"},{label:"Member Since",val:user.joinDate,icon:"📅"},{label:"User ID",val:`#${user.id.toString().padStart(5,"0")}`,icon:"🔑"}].map((item,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i<2 ? `1px solid ${C.primaryLight}` : "none" }}>
              <span style={{ fontSize: 13, color: C.muted, display: "flex", alignItems: "center", gap: 8 }}><span>{item.icon}</span>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{item.val}</span>
            </div>
          ))}
        </div>

        <Btn variant="danger" onClick={onLogout} style={{ width: "100%" }}>Sign Out</Btn>
      </div>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────

function BottomNav({ page, setPage }) {
  const tabs = [
    { id: "home", icon: "🏠", label: "Home" },
    { id: "goals", icon: "🎯", label: "Goals" },
    { id: "community", icon: "🌍", label: "Community" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 520, background: "rgba(255,255,255,0.97)", backdropFilter: "blur(16px)", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-around", padding: "8px 0 max(12px, env(safe-area-inset-bottom))", zIndex: 1000, boxShadow: "0 -4px 24px rgba(124,58,237,0.10)" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setPage(t.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 18px", background: "none", border: "none", position: "relative" }}>
          <span style={{ fontSize: 22, filter: page===t.id ? "none" : "grayscale(0.7) opacity(0.55)", transform: page===t.id ? "translateY(-2px) scale(1.12)" : "none", transition: "all 0.2s" }}>{t.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: page===t.id ? C.primary : C.muted, letterSpacing: 0.3, textTransform: "uppercase" }}>{t.label}</span>
          {page===t.id && <div style={{ position: "absolute", bottom: -8, width: 4, height: 4, borderRadius: "50%", background: C.primary }} />}
        </button>
      ))}
    </div>
  );
}

// ─── Real-Time Indicator ──────────────────────────────────────────────────────

function RTIndicator() {
  const [ping, setPing] = useState(false);
  useEffect(() => {
    const unsub1 = subscribe("goal:added", () => setPing(true));
    const unsub2 = subscribe("goal:updated", () => setPing(true));
    const unsub3 = subscribe("task:updated", () => setPing(true));
    const t = setInterval(() => setPing(false), 1500);
    return () => { unsub1(); unsub2(); unsub3(); clearInterval(t); };
  }, []);
  return (
    <div style={{ position: "fixed", top: 12, right: 12, zIndex: 9000, display: "flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.9)", borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, color: C.success, border: `1px solid ${C.border}`, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ping ? "#F59E0B" : C.success, transition: "background 0.3s", boxShadow: ping ? `0 0 0 3px rgba(245,158,11,0.3)` : `0 0 0 2px rgba(5,150,105,0.2)` }} />
      {ping ? "Syncing…" : "Live"}
    </div>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [toast, setToast] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const toastKey = useRef(0);

  function showToast(msg, type = "info") {
    setToast({ msg, type, key: ++toastKey.current });
  }

  async function loadData(uid) {
    setLoadingData(true);
    const [g, t] = await Promise.all([API.getGoals(uid), API.getTasks(uid)]);
    setGoals(g); setTasks(t);
    setLoadingData(false);
  }

  function handleLogin(u) {
    setUser(u);
    loadData(u.id);
    showToast(`Welcome back, ${u.name.split(" ")[0]}! 🎉`, "success");
  }

  function handleLogout() {
    setUser(null); setGoals([]); setTasks([]); setPage("home");
  }

  async function handleAddGoal(form) {
    const goal = await API.addGoal(user.id, form);
    setGoals(prev => [...prev, goal]);
    setUser(prev => ({ ...prev, xp: prev.xp + 50 }));
    showToast(`Goal "${goal.title}" added! +50 XP ⚡`, "success");
  }

  async function handleUpdateGoal(goalId, updates) {
    const updated = await API.updateGoal(goalId, updates);
    if (updated) {
      setGoals(prev => prev.map(g => g.id === goalId ? updated : g));
      if (updates.progress === 100) showToast("🏆 Goal completed! Amazing work!", "success");
    }
  }

  async function handleDeleteGoal(goalId) {
    await API.deleteGoal(goalId);
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showToast("Goal removed.", "info");
  }

  async function handleToggleTask(taskId) {
    const updated = await API.toggleTask(taskId);
    if (updated) {
      setTasks(prev => prev.map(t => t.id === taskId ? updated : t));
      if (updated.done) {
        setUser(prev => ({ ...prev, xp: prev.xp + 10 }));
        showToast("Task done! +10 XP ⚡", "success");
      }
    }
  }

  async function handleAddTask(task) {
    const newTask = await API.addTask(user.id, task);
    setTasks(prev => [...prev, newTask]);
  }

  // Real-time subscriptions
  useEffect(() => {
    if (!user) return;
    const unsubs = [
      subscribe("goal:added", ({ userId, goal }) => {
        if (userId !== user.id) return;
        setGoals(prev => prev.find(g => g.id === goal.id) ? prev : [...prev, goal]);
      }),
      subscribe("goal:updated", ({ goalId, goal }) => {
        setGoals(prev => prev.map(g => g.id === goalId ? goal : g));
      }),
      subscribe("goal:deleted", ({ goalId }) => {
        setGoals(prev => prev.filter(g => g.id !== goalId));
      }),
      subscribe("task:updated", ({ taskId, task }) => {
        setTasks(prev => prev.map(t => t.id === taskId ? task : t));
      }),
    ];
    return () => unsubs.forEach(u => u());
  }, [user]);

  if (!user) return (
    <>
      <style>{css}</style>
      <AuthScreen onLogin={handleLogin} />
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );

  return (
    <>
      <style>{css}</style>
      <div style={{ maxWidth: 520, margin: "0 auto", background: C.bg, minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
        <RTIndicator />
        {loadingData ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
            <Spinner size={36} />
            <p style={{ color: C.muted, fontSize: 14 }}>Loading your goals…</p>
          </div>
        ) : (
          <>
            {page === "home"      && <HomePage user={user} goals={goals} tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} />}
            {page === "goals"     && <GoalsPage goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} />}
            {page === "community" && <CommunityPage user={user} />}
            {page === "profile"   && <ProfilePage user={user} goals={goals} tasks={tasks} onLogout={handleLogout} />}
          </>
        )}
        <BottomNav page={page} setPage={setPage} />
      </div>
      {toast && <Toast key={toast.key} msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
