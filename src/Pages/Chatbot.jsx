import { useState, useRef, useEffect } from "react";

// ─── Simulated professional database ───────────────────────────────────────
const PROFESSIONALS = {
  plumbing: { name: "James Hartley", title: "Licensed Plumber", company: "Hartley & Sons Plumbing", phone: "+1 (555) 204-3871", rating: 4.9, reviews: 142, rate: 85, eta: 25, distance: "1.4 mi", avatar: "JH", speciality: "Leaks, Pipes, Fixtures" },
  electrical: { name: "David Okafor", title: "Certified Electrician", company: "Okafor Electric Co.", phone: "+1 (555) 471-2230", rating: 4.9, reviews: 211, rate: 95, eta: 20, distance: "0.8 mi", avatar: "DO", speciality: "Outlets, Panels, Wiring" },
  hvac: { name: "Carlos Reyes", title: "HVAC Technician", company: "CoolAir Solutions", phone: "+1 (555) 633-5509", rating: 4.8, reviews: 165, rate: 100, eta: 30, distance: "1.9 mi", avatar: "CR", speciality: "AC, Heating, Ventilation" },
  structural: { name: "Thomas Nguyen", title: "General Contractor", company: "Nguyen Building Group", phone: "+1 (555) 815-7760", rating: 4.7, reviews: 89, rate: 120, eta: 60, distance: "4.1 mi", avatar: "TN", speciality: "Structural, Foundations, Roofing" },
  appliance: { name: "Priya Sharma", title: "Appliance Technician", company: "Sharma Appliance Repair", phone: "+1 (555) 926-4483", rating: 4.8, reviews: 134, rate: 75, eta: 35, distance: "2.0 mi", avatar: "PS", speciality: "All Major Appliances" },
  general: { name: "Robert Mills", title: "Maintenance Specialist", company: "Mills Property Services", phone: "+1 (555) 107-3392", rating: 4.6, reviews: 56, rate: 80, eta: 40, distance: "2.5 mi", avatar: "RM", speciality: "General Maintenance" },
};

function getProfessional(category) {
  const key = (category || "").toLowerCase().trim();
  return PROFESSIONALS[key] || PROFESSIONALS.general;
}

// ─── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are RepairGenie, a professional property maintenance assistant.

Your job:
1. Ask what maintenance issue the user needs help with.
2. Gather key details one question at a time: problem description, location/room, urgency (emergency/high/medium/low), category (plumbing, electrical, hvac, structural, appliance).
3. Once you have enough info, output a ticket in EXACTLY this format — no extra text before the block:

---TICKET_START---
ID: RG-[5 random digits]
Issue: [brief description]
Location: [room/area]
Category: [one of: plumbing, electrical, hvac, structural, appliance, general]
Priority: [Emergency / High / Medium / Low]
Est. Response: [timeframe]
---TICKET_END---

After the ticket block write one sentence: "A nearby professional has been matched — please review their details and confirm to proceed."

4. After ticket output, wait. When the user confirms service, reply with exactly this phrase and nothing else: SERVICE_CONFIRMED
5. After SERVICE_CONFIRMED, say: "Your service is booked. [Professional name] will arrive in approximately [eta] minutes. Is there another issue you would like to report?"

Rules:
- No emojis anywhere. Professional tone only.
- Keep all replies under 70 words except for the ticket block.
- Ask one question at a time.
- Category must be lowercase.`;

const WELCOME_MSG = {
  role: "assistant",
  content: "Welcome to RepairGenie. Please describe the maintenance issue you need to report.",
};

const QUICK_PROMPTS = [
  "Kitchen sink is leaking under the cabinet",
  "Air conditioning is not cooling",
  "Electrical outlet has stopped working",
  "There is a crack in the ceiling",
];

let sessionCounter = 1;
function makeSession(id) {
  return { id, messages: [{ ...WELCOME_MSG }], ticketCount: 0, createdAt: Date.now() };
}

function timeLabel(ts) {
  const d = Date.now() - ts;
  if (d < 60000) return "Just now";
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return "Today";
}
function getSessionLabel(s) {
  const u = s.messages.filter(m => m.role === "user");
  if (!u.length) return "New Session";
  const t = u[0].content;
  return t.length > 30 ? t.slice(0, 30) + "…" : t;
}

function extractTicket(text) {
  const match = text.match(/---TICKET_START---([\s\S]*?)---TICKET_END---/);
  if (!match) return null;
  const block = match[1];
  const get = (key) => { const m = block.match(new RegExp(key + ":\\s*(.+)")); return m ? m[1].trim() : ""; };
  return {
    id: get("ID"), issue: get("Issue"), location: get("Location"),
    category: get("Category").toLowerCase(), priority: get("Priority"), response: get("Est\\. Response"),
  };
}
function stripTicketBlock(text) {
  return text.replace(/---TICKET_START---[\s\S]*?---TICKET_END---/, "").trim();
}

// ─── Stars ──────────────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Ticket Card ────────────────────────────────────────────────────────────
function TicketCard({ ticket }) {
  const colors = {
    emergency: { bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", text: "#dc2626" },
    high:      { bg: "#fff7ed", border: "#fed7aa", dot: "#f97316", text: "#ea580c" },
    medium:    { bg: "#fefce8", border: "#fde68a", dot: "#eab308", text: "#ca8a04" },
    low:       { bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", text: "#16a34a" },
  };
  const p = (ticket.priority || "low").toLowerCase();
  const c = colors[p] || colors.low;
  return (
    <div style={{ background: "#f8faff", border: "1px solid #dbeafe", borderRadius: 10, padding: "14px 16px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#1e40af" }}>Maintenance Ticket</span>
        <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>{ticket.id}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px", marginBottom: 10 }}>
        {[["Issue", ticket.issue], ["Location", ticket.location], ["Category", ticket.category], ["Response", ticket.response]].map(([k, v]) => (
          <div key={k}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 2 }}>{k}</div>
            <div style={{ fontSize: 13, color: "#111827", fontWeight: 500, textTransform: k === "Category" ? "capitalize" : "none" }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 20, padding: "3px 10px" }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot }} />
        <span style={{ fontSize: 11.5, fontWeight: 600, color: c.text }}>{ticket.priority} Priority</span>
      </div>
    </div>
  );
}

// ─── Professional Card ──────────────────────────────────────────────────────
function ProfessionalCard({ pro, confirmed, onConfirm, onDecline }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px", marginTop: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 2px 16px rgba(0,0,0,.06)", animation: "slideUp .3s cubic-bezier(.22,1,.36,1) both" }}>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.8px", textTransform: "uppercase", color: "#0d7377", marginBottom: 12 }}>Nearest Available Professional</div>

      {/* Profile */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 10, background: "linear-gradient(135deg,#1a1a2e,#0d7377)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0, letterSpacing: ".5px" }}>{pro.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#111827" }}>{pro.name}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{pro.title} · {pro.company}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5 }}>
            <Stars rating={pro.rating} />
            <span style={{ fontSize: 11.5, color: "#6b7280" }}>{pro.rating} ({pro.reviews} reviews)</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[
          { label: "Hourly Rate", value: `$${pro.rate}/hr` },
          { label: "ETA", value: `${pro.eta} min` },
          { label: "Distance", value: pro.distance },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 8, padding: "10px 10px 8px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Speciality + contact */}
      <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f3f4f6" }}>
        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 3, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase" }}>Speciality</div>
        <div style={{ fontSize: 13, color: "#374151" }}>{pro.speciality}</div>
        <div style={{ fontSize: 13, color: "#0d7377", marginTop: 4, fontWeight: 500 }}>{pro.phone}</div>
      </div>

      {/* Action */}
      {!confirmed ? (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: "9px 0", background: "#1a1a2e", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 600, cursor: "pointer", transition: "background .15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#0d7377"}
            onMouseLeave={e => e.currentTarget.style.background = "#1a1a2e"}>
            Confirm Service
          </button>
          <button onClick={onDecline}
            style={{ padding: "9px 16px", background: "transparent", border: "1px solid #e5e7eb", borderRadius: 8, color: "#6b7280", fontSize: 13, fontFamily: "'DM Sans',sans-serif", fontWeight: 500, cursor: "pointer", transition: "border-color .15s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "#9ca3af"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "#e5e7eb"}>
            Decline
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#16a34a" }}>Confirmed — {pro.name} is on the way ({pro.eta} min)</span>
        </div>
      )}
    </div>
  );
}

// ─── Content parser ─────────────────────────────────────────────────────────
function MsgContent({ text }) {
  return text.split("\n").map((line, i, arr) => (
    <span key={i}>
      <span dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
      {i < arr.length - 1 && <br />}
    </span>
  ));
}

const TypingDots = () => (
  <div style={{ display: "flex", gap: 4, padding: "2px 0" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#9ca3af", animation: `bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />
    ))}
  </div>
);

// ─── Main ───────────────────────────────────────────────────────────────────
export default function RepairGenieChat() {
  const [sessions, setSessions]       = useState([makeSession(1)]);
  const [activeId, setActiveId]       = useState(1);
  const [loading, setLoading]         = useState(false);
  const [input, setInput]             = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [proStates, setProStates]     = useState({});
  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];
  const messages      = activeSession?.messages || [];
  const isOnlyWelcome = messages.length === 1;
  const proState      = proStates[activeId] || null;
  const totalTickets  = sessions.reduce((a, s) => a + s.ticketCount, 0);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading, proState]);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 130) + "px";
    }
  }, [input]);

  const updateSession = (id, fn) => setSessions(prev => prev.map(s => s.id === id ? { ...s, ...fn(s) } : s));

  const newChat = () => {
    sessionCounter++;
    const s = makeSession(sessionCounter);
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id); setInput(""); setLoading(false);
  };
  const switchSession = (id) => {
    setActiveId(id); setInput(""); setLoading(false);
    if (window.innerWidth <= 860) setSidebarOpen(false);
  };
  const deleteSession = (id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (!next.length) { sessionCounter++; const f = makeSession(sessionCounter); setActiveId(f.id); return [f]; }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
    setDeleteConfirm(null);
  };

  const callAPI = async (msgs) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    const data = await res.json();
    return data.content?.map(c => c.text || "").join("\n") || "";
  };

  const confirmService = async () => {
    const pro = proState?.pro;
    setProStates(prev => ({ ...prev, [activeId]: { ...prev[activeId], confirmed: true } }));
    const confirmMsg = { role: "user", content: "I confirm the service." };
    const nextMsgs = [...activeSession.messages, confirmMsg];
    updateSession(activeId, s => ({ messages: nextMsgs }));
    setLoading(true);
    try {
      const raw = await callAPI(nextMsgs);
      updateSession(activeId, s => ({ messages: [...nextMsgs, { role: "assistant", content: raw }] }));
    } catch {
      updateSession(activeId, s => ({ messages: [...nextMsgs, { role: "assistant", content: `Service confirmed. ${pro?.name || "The technician"} will arrive in approximately ${pro?.eta || "30"} minutes.` }] }));
    } finally { setLoading(false); }
  };

  const declineService = () => {
    setProStates(prev => { const n = { ...prev }; delete n[activeId]; return n; });
    updateSession(activeId, s => ({
      messages: [...s.messages, { role: "assistant", content: "Understood. Would you like me to suggest an alternative professional, or do you have another issue to report?" }],
    }));
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    const nextMsgs = [...activeSession.messages, { role: "user", content: msg }];
    updateSession(activeId, s => ({ messages: nextMsgs }));
    setLoading(true);
    try {
      const raw = await callAPI(nextMsgs);
      const ticket = extractTicket(raw);
      const clean  = ticket ? stripTicketBlock(raw) : raw;

      if (ticket) {
        const pro = getProfessional(ticket.category);
        setProStates(prev => ({ ...prev, [activeId]: { ticket, pro, confirmed: false } }));
        updateSession(activeId, s => ({
          messages: [...nextMsgs, { role: "assistant", content: clean, _ticket: ticket }],
          ticketCount: s.ticketCount + 1,
        }));
      } else {
        updateSession(activeId, s => ({ messages: [...nextMsgs, { role: "assistant", content: clean }] }));
      }
    } catch {
      updateSession(activeId, s => ({ messages: [...nextMsgs, { role: "assistant", content: "Connection issue. Please try again." }] }));
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const onKey = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%}
        body{font-family:'DM Sans',sans-serif;background:#fafafa;color:#111827;overflow:hidden;-webkit-font-smoothing:antialiased}
        :root{--accent:#1a1a2e;--teal:#0d7377;--teal-l:#14a085;--border:#e5e7eb;--muted:#6b7280;--bg:#f9fafb;--sw:256px;--r:8px}
        @keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-4px);opacity:1}}
        @keyframes msgIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes slideL{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
        .shell{display:flex;height:100vh;width:100vw;overflow:hidden}
        /* sidebar */
        .sidebar{width:var(--sw);flex-shrink:0;background:var(--accent);display:flex;flex-direction:column;transition:width .3s cubic-bezier(.22,1,.36,1),opacity .25s;overflow:hidden;position:relative;z-index:10}
        .sidebar.closed{width:0;opacity:0;pointer-events:none}
        .sb-head{padding:20px 16px 16px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:10px;flex-shrink:0}
        .sb-mark{width:28px;height:28px;border-radius:6px;background:var(--teal);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .sb-wordmark{font-family:'DM Serif Display',serif;font-size:17px;color:#fff;letter-spacing:-.2px;white-space:nowrap}
        .sb-wordmark span{color:#14a085}
        .new-btn{margin:12px 12px 10px;padding:9px 14px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);border-radius:var(--r);color:rgba(255,255,255,.85);font-size:13px;font-family:'DM Sans',sans-serif;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .18s;white-space:nowrap;flex-shrink:0}
        .new-btn:hover{background:rgba(255,255,255,.13);color:#fff}
        .sb-section{padding:10px 16px 4px;font-size:10px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:rgba(255,255,255,.3);white-space:nowrap;flex-shrink:0}
        .hist-list{flex:1;overflow-y:auto;padding:3px 8px 10px}
        .hist-list::-webkit-scrollbar{width:2px}
        .hist-list::-webkit-scrollbar-thumb{background:rgba(255,255,255,.1)}
        .hist-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--r);cursor:pointer;transition:background .15s;animation:slideL .22s ease both;position:relative}
        .hist-item:hover{background:rgba(255,255,255,.06)}
        .hist-item.active{background:rgba(13,115,119,.25)}
        .hist-item:hover .hist-del{opacity:1}
        .hist-dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0}
        .hist-item.active .hist-dot{background:var(--teal-l)}
        .hist-label{font-size:12.5px;font-weight:400;color:rgba(255,255,255,.7);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .hist-item.active .hist-label{color:#fff;font-weight:500}
        .hist-time{font-size:11px;color:rgba(255,255,255,.3);margin-top:1px}
        .hist-del{opacity:0;position:absolute;right:8px;width:20px;height:20px;border-radius:4px;background:rgba(239,68,68,.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;color:rgba(239,68,68,.7)}
        .hist-del:hover{background:rgba(239,68,68,.3);color:#ef4444}
        .del-confirm{position:absolute;right:4px;top:50%;transform:translateY(-50%);background:#1f2937;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:5px 9px;box-shadow:0 4px 20px rgba(0,0,0,.3);display:flex;align-items:center;gap:6px;z-index:20;white-space:nowrap;animation:fadeIn .12s ease both}
        .del-yes{padding:2px 8px;background:#ef4444;border:none;border-radius:5px;color:white;font-size:11.5px;font-family:'DM Sans',sans-serif;font-weight:600;cursor:pointer}
        .del-no{padding:2px 8px;background:transparent;border:1px solid rgba(255,255,255,.15);border-radius:5px;color:rgba(255,255,255,.6);font-size:11.5px;font-family:'DM Sans',sans-serif;cursor:pointer}
        .sb-foot{padding:12px 14px;border-top:1px solid rgba(255,255,255,.07);flex-shrink:0}
        .user-row{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:var(--r)}
        .user-av{width:28px;height:28px;border-radius:6px;background:var(--teal);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:600;flex-shrink:0;letter-spacing:.5px}
        .user-name{font-size:12.5px;font-weight:500;color:rgba(255,255,255,.8)}
        .user-plan{font-size:11px;color:rgba(255,255,255,.35);margin-top:1px}
        /* main */
        .main{flex:1;display:flex;flex-direction:column;min-width:0;background:#fff}
        .topbar{height:54px;padding:0 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;background:#fff;flex-shrink:0;gap:12px}
        .topbar-l{display:flex;align-items:center;gap:10px}
        .ico-btn{width:30px;height:30px;background:transparent;border:none;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--muted);transition:all .15s;flex-shrink:0}
        .ico-btn:hover{background:var(--bg);color:#111827}
        .topbar-title{font-family:'DM Serif Display',serif;font-size:16px;color:#111827;white-space:nowrap;letter-spacing:-.2px}
        .topbar-sub{font-size:11px;color:var(--muted);margin-top:1px;white-space:nowrap;font-weight:300}
        .topbar-r{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .status-badge{display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #d1fae5;color:#059669;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:500;white-space:nowrap}
        .status-dot{width:5px;height:5px;border-radius:50%;background:#10b981;flex-shrink:0;animation:pulse 2.5s ease infinite}
        .ticket-badge{display:flex;align-items:center;gap:5px;background:#f0f9ff;border:1px solid #bae6fd;color:#0284c7;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:500;white-space:nowrap}
        .topbar-btn{height:30px;padding:0 12px;background:transparent;border:1px solid var(--border);border-radius:6px;font-size:12.5px;font-family:'DM Sans',sans-serif;font-weight:500;color:var(--muted);cursor:pointer;transition:all .15s;white-space:nowrap}
        .topbar-btn:hover{border-color:#9ca3af;color:#111827}
        /* messages */
        .msgs-wrap{flex:1;overflow-y:auto;padding:28px 0;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
        .msgs-wrap::-webkit-scrollbar{width:3px}
        .msgs-wrap::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
        .msgs-inner{max-width:700px;margin:0 auto;padding:0 clamp(16px,4vw,32px);display:flex;flex-direction:column;gap:6px}
        .date-sep{display:flex;align-items:center;gap:10px;padding:6px 0 10px;animation:fadeIn .4s ease both}
        .date-sep::before,.date-sep::after{content:'';flex:1;height:1px;background:var(--border)}
        .date-sep span{font-size:11px;color:#d1d5db;font-weight:400;white-space:nowrap;letter-spacing:.5px}
        .intro-block{padding:32px 0 16px;display:flex;flex-direction:column;gap:6px;animation:fadeIn .4s ease both}
        .intro-label{font-size:10.5px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:var(--teal);margin-bottom:2px}
        .intro-h{font-family:'DM Serif Display',serif;font-size:22px;color:#111827;line-height:1.3;letter-spacing:-.3px}
        .intro-p{font-size:13.5px;color:var(--muted);line-height:1.65;max-width:420px;font-weight:300}
        .quick-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:20px;max-width:540px}
        .quick-btn{background:var(--bg);border:1px solid var(--border);border-radius:var(--r);padding:10px 14px;cursor:pointer;font-size:13px;font-weight:400;color:#374151;font-family:'DM Sans',sans-serif;text-align:left;transition:all .15s;line-height:1.45}
        .quick-btn:hover{border-color:#9ca3af;background:#fff;color:#111827}
        .msg-row{display:flex;align-items:flex-end;gap:8px;animation:msgIn .25s cubic-bezier(.22,1,.36,1) both}
        .msg-row.user{flex-direction:row-reverse}
        .av{width:26px;height:26px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;letter-spacing:.5px}
        .av.ai{background:var(--accent);color:rgba(255,255,255,.9)}
        .av.usr{background:var(--teal);color:white}
        .bubble{max-width:min(72%,520px);padding:11px 15px;border-radius:10px;font-size:14px;line-height:1.75;font-weight:400}
        .bubble.ai{background:var(--bg);border:1px solid var(--border);color:#111827;border-bottom-left-radius:2px}
        .bubble.usr{background:var(--accent);color:rgba(255,255,255,.92);border-bottom-right-radius:2px}
        .typing-row{display:flex;align-items:flex-end;gap:8px;animation:msgIn .2s ease both}
        .typing-bub{background:var(--bg);border:1px solid var(--border);border-radius:10px;border-bottom-left-radius:2px;padding:12px 15px;display:flex;align-items:center}
        .pro-wrap{padding-left:34px;animation:slideUp .32s cubic-bezier(.22,1,.36,1) both;animation-delay:.08s}
        /* input */
        .input-zone{padding:clamp(10px,2vw,16px) clamp(16px,4vw,32px);background:#fff;border-top:1px solid var(--border);flex-shrink:0}
        .input-inner{max-width:700px;margin:0 auto}
        .input-box{display:flex;align-items:flex-end;gap:8px;background:var(--bg);border:1px solid var(--border);border-radius:10px;padding:9px 9px 9px 14px;transition:border-color .15s,box-shadow .15s}
        .input-box:focus-within{border-color:#9ca3af;box-shadow:0 0 0 3px rgba(13,115,119,.06)}
        .chat-ta{flex:1;background:transparent;border:none;outline:none;font-size:14px;font-family:'DM Sans',sans-serif;font-weight:400;color:#111827;resize:none;line-height:1.6;min-height:22px;max-height:130px;overflow-y:auto;padding:2px 0}
        .chat-ta::placeholder{color:#d1d5db;font-weight:300}
        .send-btn{width:33px;height:33px;flex-shrink:0;background:var(--accent);border:none;border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .15s}
        .send-btn:hover:not(:disabled){background:var(--teal)}
        .send-btn:disabled{opacity:.25;cursor:not-allowed}
        .input-foot{display:flex;align-items:center;justify-content:center;margin-top:7px;font-size:10.5px;color:#d1d5db;font-weight:300;letter-spacing:.2px}
        .overlay{display:none;position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.25);animation:fadeIn .2s ease both}
        .overlay.on{display:block}
        @media(max-width:860px){:root{--sw:240px}.sidebar{position:fixed;top:0;left:0;bottom:0;z-index:400;box-shadow:6px 0 32px rgba(0,0,0,.15)}.sidebar.closed{width:0}.overlay.on{display:block}.quick-grid{grid-template-columns:1fr}.bubble{max-width:min(84%,520px)}.topbar-sub{display:none}}
        @media(max-width:540px){.topbar{padding:0 12px}.status-badge span:not(.status-dot){display:none}.status-badge{padding:4px 7px}.ticket-badge{display:none}.topbar-btn{display:none}.msgs-inner{padding:0 12px}.input-zone{padding:8px 12px}.bubble{font-size:13.5px}.intro-h{font-size:19px}.pro-wrap{padding-left:0}}
      `}</style>

      <div className={`overlay ${sidebarOpen && typeof window !== "undefined" && window.innerWidth <= 860 ? "on" : ""}`} onClick={() => setSidebarOpen(false)} />

      <div className="shell">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sb-head">
            <div className="sb-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="sb-wordmark">Repair<span>Genie</span></span>
          </div>

          <button className="new-btn" onClick={newChat}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/></svg>
            New Session
          </button>

          <div className="sb-section">History</div>
          <div className="hist-list">
            {sessions.map((s, i) => (
              <div key={s.id} className={`hist-item ${s.id === activeId ? "active" : ""}`} style={{ animationDelay: `${i * 0.035}s` }} onClick={() => switchSession(s.id)}>
                <div className="hist-dot" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="hist-label">{getSessionLabel(s)}</div>
                  <div className="hist-time">{s.ticketCount > 0 ? `${s.ticketCount} ticket${s.ticketCount > 1 ? "s" : ""} · ` : ""}{timeLabel(s.createdAt)}</div>
                </div>
                {deleteConfirm === s.id ? (
                  <div className="del-confirm" onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Delete?</span>
                    <button className="del-yes" onClick={() => deleteSession(s.id)}>Yes</button>
                    <button className="del-no" onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                ) : (
                  <button className="hist-del" onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id); }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="sb-foot">
            <div className="user-row">
              <div className="user-av">PM</div>
              <div>
                <div className="user-name">Property Manager</div>
                <div className="user-plan">Professional Plan</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          <div className="topbar">
            <div className="topbar-l">
              <button className="ico-btn" onClick={() => setSidebarOpen(v => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              </button>
              <div>
                <div className="topbar-title">Maintenance Assistant</div>
                <div className="topbar-sub">RepairGenie · Powered by Claude</div>
              </div>
            </div>
            <div className="topbar-r">
              <div className="status-badge"><span className="status-dot" /><span>Online</span></div>
              {totalTickets > 0 && <div className="ticket-badge">{totalTickets} Ticket{totalTickets > 1 ? "s" : ""}</div>}
              <button className="topbar-btn" onClick={newChat}>New Session</button>
            </div>
          </div>

          <div className="msgs-wrap">
            <div className="msgs-inner">
              {isOnlyWelcome && (
                <div className="intro-block">
                  <div className="intro-label">RepairGenie</div>
                  <div className="intro-h">How can we assist<br />you today?</div>
                  <div className="intro-p">Describe a maintenance issue and we will create a structured ticket, match you with the nearest qualified professional, and coordinate their arrival.</div>
                </div>
              )}

              <div className="date-sep"><span>Today</span></div>

              {messages.map((m, i) => {
                const isTicketMsg = !!m._ticket;
                const showProCard = isTicketMsg && proState && proState.ticket?.id === m._ticket?.id;
                return (
                  <div key={i}>
                    <div className={`msg-row ${m.role}`} style={{ animationDelay: `${Math.min(i * 0.025, 0.15)}s` }}>
                      {m.role === "assistant" && <div className="av ai">RG</div>}
                      {m.role === "user"      && <div className="av usr">PM</div>}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: m.role === "assistant" ? "min(78%,560px)" : "min(72%,520px)" }}>
                        {m.content && (
                          <div className={`bubble ${m.role === "assistant" ? "ai" : "usr"}`} style={{ maxWidth: "100%" }}>
                            <MsgContent text={m.content} />
                          </div>
                        )}
                        {isTicketMsg && <TicketCard ticket={m._ticket} />}
                      </div>
                    </div>

                    {showProCard && (
                      <div className="pro-wrap">
                        <ProfessionalCard
                          pro={proState.pro}
                          confirmed={proState.confirmed}
                          onConfirm={confirmService}
                          onDecline={declineService}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="typing-row">
                  <div className="av ai">RG</div>
                  <div className="typing-bub"><TypingDots /></div>
                </div>
              )}

              {isOnlyWelcome && !loading && (
                <div className="quick-grid">
                  {QUICK_PROMPTS.map(q => (
                    <button key={q} className="quick-btn" onClick={() => send(q)}>{q}</button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} style={{ height: 4 }} />
            </div>
          </div>

          <div className="input-zone">
            <div className="input-inner">
              <div className="input-box">
                <textarea
                  ref={textareaRef}
                  className="chat-ta"
                  placeholder="Describe the maintenance issue…"
                  value={input}
                  rows={1}
                  disabled={loading}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                />
                <button className="send-btn" disabled={!input.trim() || loading} onClick={() => send()}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="input-foot">Enter to send · Shift+Enter for new line · RepairGenie by Anthropic</div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
