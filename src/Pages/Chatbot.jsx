import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are RepairGenie, a professional property maintenance assistant. You help property owners, managers, and tenants report and manage maintenance issues efficiently.

Your job:
1. Start with a concise, professional greeting. Ask what maintenance issue the user needs help with.
2. Gather key details through brief, focused questions (one at a time):
   - Problem description
   - Location or room
   - Urgency (emergency / high / medium / low)
   - Category (plumbing, electrical, HVAC, structural, appliance, etc.)
3. Once you have enough information, generate a structured ticket summary.
4. Offer brief, practical troubleshooting tips when relevant.
5. After ticket creation, ask if they need to report another issue.

Response style:
- Concise and professional. No emojis. No filler phrases.
- Use plain language. Keep responses under 80 words unless generating a ticket.
- One question per message.

Ticket format (use exactly):
---
MAINTENANCE TICKET
ID: RG-XXXXX
Issue: [brief description]
Location: [room/area]
Category: [category]
Priority: [Emergency / High / Medium / Low]
Est. Response: [timeframe based on priority]
Next Steps: [what happens now]
---`;

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
  return {
    id,
    label: "New Session",
    messages: [{ ...WELCOME_MSG }],
    ticketCount: 0,
    createdAt: Date.now(),
  };
}

const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 5, height: 5, borderRadius: "50%", background: "#9ca3af",
        animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite`,
      }} />
    ))}
  </div>
);

function parseContent(text) {
  return text.split("\n").map((line, i, arr) => {
    const formatted = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^(ID|Issue|Location|Category|Priority|Est\. Response|Next Steps):(.*)$/,
        '<span style="color:#374151;font-weight:600;letter-spacing:0.02em">$1:</span><span style="color:#111827">$2</span>');
    if (line === "---") return <hr key={i} style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "6px 0" }} />;
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function timeLabel(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return "Today";
}

function getSessionLabel(session) {
  const userMsgs = session.messages.filter(m => m.role === "user");
  if (userMsgs.length === 0) return "New Session";
  const first = userMsgs[0].content;
  return first.length > 30 ? first.slice(0, 30) + "…" : first;
}

export default function RepairGenieChat() {
  const [sessions, setSessions] = useState([makeSession(1)]);
  const [activeId, setActiveId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeId) || sessions[0];
  const messages = activeSession?.messages || [];
  const ticketCount = activeSession?.ticketCount || 0;
  const isOnlyWelcome = messages.length === 1;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 130) + "px";
    }
  }, [input]);

  const updateSession = (id, updater) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updater(s) } : s));
  };

  const newChat = () => {
    sessionCounter++;
    const s = makeSession(sessionCounter);
    setSessions(prev => [s, ...prev]);
    setActiveId(s.id);
    setInput("");
    setLoading(false);
  };

  const switchSession = (id) => {
    setActiveId(id);
    setInput("");
    setLoading(false);
    if (window.innerWidth <= 860) setSidebarOpen(false);
  };

  const deleteSession = (id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (next.length === 0) {
        sessionCounter++;
        const fresh = makeSession(sessionCounter);
        setActiveId(fresh.id);
        return [fresh];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
    setDeleteConfirm(null);
  };

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const prevMessages = activeSession.messages;
    const nextMessages = [...prevMessages, { role: "user", content: msg }];
    updateSession(activeId, s => ({ messages: nextMessages }));
    setLoading(true);

    try {
      // ✅ Proxy route — works on localhost and Vercel
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.map(c => c.text || "").join("\n") || "An error occurred. Please try again.";
      const hasTicket = reply.includes("MAINTENANCE TICKET");

      updateSession(activeId, s => ({
        messages: [...nextMessages, { role: "assistant", content: reply }],
        ticketCount: hasTicket ? s.ticketCount + 1 : s.ticketCount,
      }));
    } catch {
      updateSession(activeId, s => ({
        messages: [...nextMessages, { role: "assistant", content: "Connection issue. Please try again." }],
      }));
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  };

  const onKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body {
          font-family: 'DM Sans', sans-serif;
          background: #fafafa;
          color: #111827;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --accent: #1a1a2e;
          --accent-light: #16213e;
          --teal: #0d7377;
          --teal-light: #14a085;
          --border: #e5e7eb;
          --muted: #6b7280;
          --bg: #f9fafb;
          --white: #ffffff;
          --sw: 256px;
          --radius: 8px;
        }

        @keyframes bounce {
          0%,60%,100%{transform:translateY(0);opacity:0.4}
          30%{transform:translateY(-4px);opacity:1}
        }
        @keyframes msgIn {
          from{opacity:0;transform:translateY(6px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideL {
          from{opacity:0;transform:translateX(-8px)}
          to{opacity:1;transform:translateX(0)}
        }

        .shell { display:flex; height:100vh; width:100vw; overflow:hidden; }

        .sidebar {
          width:var(--sw); flex-shrink:0;
          background:var(--accent);
          display:flex; flex-direction:column;
          transition:width .3s cubic-bezier(.22,1,.36,1), opacity .25s;
          overflow:hidden; position:relative; z-index:10;
        }
        .sidebar.closed { width:0; opacity:0; pointer-events:none; }

        .sb-head {
          padding:20px 16px 16px;
          border-bottom:1px solid rgba(255,255,255,.07);
          display:flex; align-items:center; gap:10px; flex-shrink:0;
        }
        .sb-wordmark {
          font-family:'DM Serif Display', serif;
          font-size:17px; color:#fff;
          letter-spacing:-.2px; white-space:nowrap;
        }
        .sb-wordmark span { color:#14a085; }
        .sb-mark {
          width:28px; height:28px; border-radius:6px;
          background:var(--teal); display:flex;
          align-items:center; justify-content:center; flex-shrink:0;
        }

        .new-btn {
          margin:12px 12px 10px;
          padding:9px 14px;
          background:rgba(255,255,255,.07);
          border:1px solid rgba(255,255,255,.1);
          border-radius:var(--radius);
          color:rgba(255,255,255,.85); font-size:13px;
          font-family:'DM Sans',sans-serif; font-weight:500;
          cursor:pointer; display:flex; align-items:center; gap:7px;
          transition:all .18s; white-space:nowrap; flex-shrink:0;
        }
        .new-btn:hover { background:rgba(255,255,255,.13); color:#fff; }

        .sb-section {
          padding:10px 16px 4px;
          font-size:10px; font-weight:600;
          letter-spacing:1.8px; text-transform:uppercase;
          color:rgba(255,255,255,.3); white-space:nowrap; flex-shrink:0;
        }

        .hist-list { flex:1; overflow-y:auto; padding:3px 8px 10px; }
        .hist-list::-webkit-scrollbar { width:2px; }
        .hist-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,.1); }

        .hist-item {
          display:flex; align-items:center; gap:8px;
          padding:8px 10px; border-radius:var(--radius);
          cursor:pointer; transition:background .15s;
          animation:slideL .22s ease both; position:relative;
        }
        .hist-item:hover { background:rgba(255,255,255,.06); }
        .hist-item.active { background:rgba(13,115,119,.25); }
        .hist-item:hover .hist-del { opacity:1; }

        .hist-dot {
          width:6px; height:6px; border-radius:50%;
          background:rgba(255,255,255,.2); flex-shrink:0;
        }
        .hist-item.active .hist-dot { background:var(--teal-light); }

        .hist-txt { flex:1; min-width:0; }
        .hist-label {
          font-size:12.5px; font-weight:400; color:rgba(255,255,255,.7);
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .hist-item.active .hist-label { color:#fff; font-weight:500; }
        .hist-time { font-size:11px; color:rgba(255,255,255,.3); margin-top:1px; }

        .hist-del {
          opacity:0; position:absolute; right:8px;
          width:20px; height:20px; border-radius:4px;
          background:rgba(239,68,68,.15); border:none;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .15s; flex-shrink:0;
          color:rgba(239,68,68,.7);
        }
        .hist-del:hover { background:rgba(239,68,68,.3); color:#ef4444; }

        .del-confirm {
          position:absolute; right:4px; top:50%; transform:translateY(-50%);
          background:#1f2937; border:1px solid rgba(255,255,255,.1);
          border-radius:8px; padding:5px 9px;
          box-shadow:0 4px 20px rgba(0,0,0,.3);
          display:flex; align-items:center; gap:6px;
          z-index:20; white-space:nowrap; animation:fadeIn .12s ease both;
        }
        .del-yes {
          padding:2px 8px; background:#ef4444; border:none;
          border-radius:5px; color:white; font-size:11.5px;
          font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer;
        }
        .del-no {
          padding:2px 8px; background:transparent;
          border:1px solid rgba(255,255,255,.15);
          border-radius:5px; color:rgba(255,255,255,.6); font-size:11.5px;
          font-family:'DM Sans',sans-serif; cursor:pointer;
        }

        .sb-foot {
          padding:12px 14px;
          border-top:1px solid rgba(255,255,255,.07); flex-shrink:0;
        }
        .user-row {
          display:flex; align-items:center; gap:9px;
          padding:6px 8px; border-radius:var(--radius); white-space:nowrap;
        }
        .user-av {
          width:28px; height:28px; border-radius:6px;
          background:var(--teal);
          display:flex; align-items:center; justify-content:center;
          color:white; font-size:11px; font-weight:600; flex-shrink:0;
          letter-spacing:.5px;
        }
        .user-name { font-size:12.5px; font-weight:500; color:rgba(255,255,255,.8); }
        .user-plan { font-size:11px; color:rgba(255,255,255,.35); margin-top:1px; }

        .main { flex:1; display:flex; flex-direction:column; min-width:0; background:var(--white); }

        .topbar {
          height:54px; padding:0 20px;
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; justify-content:space-between;
          background:var(--white); flex-shrink:0; gap:12px;
        }
        .topbar-l { display:flex; align-items:center; gap:10px; }
        .ico-btn {
          width:30px; height:30px; background:transparent; border:none;
          border-radius:6px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:var(--muted); transition:all .15s; flex-shrink:0;
        }
        .ico-btn:hover { background:var(--bg); color:#111827; }
        .topbar-title {
          font-family:'DM Serif Display', serif;
          font-size:16px; color:#111827; white-space:nowrap; letter-spacing:-.2px;
        }
        .topbar-sub { font-size:11px; color:var(--muted); margin-top:1px; white-space:nowrap; font-weight:300; }
        .topbar-r { display:flex; align-items:center; gap:8px; flex-shrink:0; }

        .status-badge {
          display:flex; align-items:center; gap:5px;
          background:#f0fdf4; border:1px solid #d1fae5;
          color:#059669; padding:4px 10px; border-radius:20px;
          font-size:11.5px; font-weight:500; white-space:nowrap;
        }
        .status-dot {
          width:5px; height:5px; border-radius:50%; background:#10b981; flex-shrink:0;
          animation:pulse 2.5s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

        .ticket-badge {
          display:flex; align-items:center; gap:5px;
          background:#f0f9ff; border:1px solid #bae6fd;
          color:#0284c7; padding:4px 10px; border-radius:20px;
          font-size:11.5px; font-weight:500; white-space:nowrap;
        }

        .topbar-btn {
          height:30px; padding:0 12px;
          background:transparent; border:1px solid var(--border);
          border-radius:6px; font-size:12.5px;
          font-family:'DM Sans',sans-serif; font-weight:500;
          color:var(--muted); cursor:pointer; transition:all .15s; white-space:nowrap;
        }
        .topbar-btn:hover { border-color:#9ca3af; color:#111827; }

        .msgs-wrap {
          flex:1; overflow-y:auto; padding:28px 0;
          scrollbar-width:thin; scrollbar-color:var(--border) transparent;
        }
        .msgs-wrap::-webkit-scrollbar { width:3px; }
        .msgs-wrap::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

        .msgs-inner {
          max-width:700px; margin:0 auto;
          padding:0 clamp(16px,4vw,32px);
          display:flex; flex-direction:column; gap:6px;
        }

        .date-sep {
          display:flex; align-items:center; gap:10px;
          padding:6px 0 10px; animation:fadeIn .4s ease both;
        }
        .date-sep::before,.date-sep::after { content:''; flex:1; height:1px; background:var(--border); }
        .date-sep span { font-size:11px; color:#d1d5db; font-weight:400; white-space:nowrap; letter-spacing:.5px; }

        .intro-block {
          padding:32px 0 16px;
          display:flex; flex-direction:column; gap:6px;
          animation:fadeIn .4s ease both;
        }
        .intro-label {
          font-size:10.5px; font-weight:600;
          letter-spacing:2px; text-transform:uppercase;
          color:var(--teal); margin-bottom:2px;
        }
        .intro-h {
          font-family:'DM Serif Display', serif;
          font-size:22px; color:#111827; line-height:1.3; letter-spacing:-.3px;
        }
        .intro-p { font-size:13.5px; color:var(--muted); line-height:1.65; max-width:400px; font-weight:300; }

        .quick-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:8px; margin-top:20px; max-width:540px;
        }
        .quick-btn {
          background:var(--bg); border:1px solid var(--border); border-radius:var(--radius);
          padding:10px 14px; cursor:pointer;
          font-size:13px; font-weight:400; color:#374151;
          font-family:'DM Sans',sans-serif; text-align:left;
          transition:all .15s; line-height:1.45;
        }
        .quick-btn:hover { border-color:#9ca3af; background:var(--white); color:#111827; }

        .msg-row {
          display:flex; align-items:flex-end; gap:8px;
          animation:msgIn .25s cubic-bezier(.22,1,.36,1) both;
        }
        .msg-row.user { flex-direction:row-reverse; }

        .av {
          width:26px; height:26px; border-radius:6px;
          flex-shrink:0; display:flex; align-items:center; justify-content:center;
          font-size:10px; font-weight:700; letter-spacing:.5px;
        }
        .av.ai { background:var(--accent); color:rgba(255,255,255,.9); }
        .av.user { background:var(--teal); color:white; }

        .bubble {
          max-width:min(72%,520px);
          padding:11px 15px; border-radius:10px;
          font-size:14px; line-height:1.75; font-weight:400;
        }
        .bubble.ai { background:var(--bg); border:1px solid var(--border); color:#111827; border-bottom-left-radius:2px; }
        .bubble.user { background:var(--accent); color:rgba(255,255,255,.92); border-bottom-right-radius:2px; }
        .bubble.ticket { background:#f8faff; border:1px solid #dbeafe; font-family:'DM Sans',sans-serif; font-size:13.5px; }

        .typing-row { display:flex; align-items:flex-end; gap:8px; animation:msgIn .2s ease both; }
        .typing-bub {
          background:var(--bg); border:1px solid var(--border);
          border-radius:10px; border-bottom-left-radius:2px;
          padding:12px 15px; display:flex; align-items:center;
        }

        .input-zone {
          padding:clamp(10px,2vw,16px) clamp(16px,4vw,32px);
          background:var(--white); border-top:1px solid var(--border); flex-shrink:0;
        }
        .input-inner { max-width:700px; margin:0 auto; }

        .input-box {
          display:flex; align-items:flex-end; gap:8px;
          background:var(--bg); border:1px solid var(--border);
          border-radius:10px; padding:9px 9px 9px 14px;
          transition:border-color .15s, box-shadow .15s;
        }
        .input-box:focus-within { border-color:#9ca3af; box-shadow:0 0 0 3px rgba(13,115,119,.06); }

        .chat-ta {
          flex:1; background:transparent; border:none; outline:none;
          font-size:14px; font-family:'DM Sans',sans-serif; font-weight:400;
          color:#111827; resize:none; line-height:1.6;
          min-height:22px; max-height:130px; overflow-y:auto; padding:2px 0;
        }
        .chat-ta::placeholder { color:#d1d5db; font-weight:300; }
        .chat-ta::-webkit-scrollbar { width:2px; }

        .send-btn {
          width:33px; height:33px; flex-shrink:0;
          background:var(--accent); border:none; border-radius:7px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .15s;
        }
        .send-btn:hover:not(:disabled) { background:var(--teal); }
        .send-btn:disabled { opacity:.25; cursor:not-allowed; }

        .input-foot {
          display:flex; align-items:center; justify-content:center;
          margin-top:7px; font-size:10.5px; color:#d1d5db;
          font-weight:300; letter-spacing:.2px;
        }

        .overlay {
          display:none; position:fixed; inset:0; z-index:300;
          background:rgba(0,0,0,.25); animation:fadeIn .2s ease both;
        }
        .overlay.on { display:block; }

        @media (max-width:860px) {
          :root { --sw:240px; }
          .sidebar { position:fixed; top:0; left:0; bottom:0; z-index:400; box-shadow:6px 0 32px rgba(0,0,0,.15); }
          .sidebar.closed { width:0; }
          .overlay.on { display:block; }
          .quick-grid { grid-template-columns:1fr; }
          .bubble { max-width:min(84%,520px); }
          .topbar-sub { display:none; }
        }
        @media (max-width:540px) {
          .topbar { padding:0 12px; }
          .status-badge span:not(.status-dot) { display:none; }
          .status-badge { padding:4px 7px; }
          .ticket-badge { display:none; }
          .topbar-btn { display:none; }
          .msgs-inner { padding:0 12px; }
          .input-zone { padding:8px 12px; }
          .bubble { font-size:13.5px; }
          .intro-h { font-size:19px; }
        }
      `}</style>

      <div
        className={`overlay ${sidebarOpen && typeof window !== "undefined" && window.innerWidth <= 860 ? "on" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="shell">
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
            New Session
          </button>

          <div className="sb-section">History</div>

          <div className="hist-list">
            {sessions.map((s, i) => (
              <div
                key={s.id}
                className={`hist-item ${s.id === activeId ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.035}s` }}
                onClick={() => switchSession(s.id)}
              >
                <div className="hist-dot" />
                <div className="hist-txt">
                  <div className="hist-label">{getSessionLabel(s)}</div>
                  <div className="hist-time">
                    {s.ticketCount > 0 ? `${s.ticketCount} ticket${s.ticketCount > 1 ? "s" : ""} · ` : ""}
                    {timeLabel(s.createdAt)}
                  </div>
                </div>

                {deleteConfirm === s.id ? (
                  <div className="del-confirm" onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,.5)" }}>Delete?</span>
                    <button className="del-yes" onClick={() => deleteSession(s.id)}>Yes</button>
                    <button className="del-no" onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                ) : (
                  <button
                    className="hist-del"
                    title="Delete"
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
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

        <main className="main">
          <div className="topbar">
            <div className="topbar-l">
              <button className="ico-btn" onClick={() => setSidebarOpen(v => !v)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              <div>
                <div className="topbar-title">Maintenance Assistant</div>
                <div className="topbar-sub">RepairGenie · Powered by Claude</div>
              </div>
            </div>

            <div className="topbar-r">
              <div className="status-badge">
                <span className="status-dot" />
                <span>Online</span>
              </div>
              {ticketCount > 0 && (
                <div className="ticket-badge">
                  {ticketCount} Ticket{ticketCount > 1 ? "s" : ""}
                </div>
              )}
              <button className="topbar-btn" onClick={newChat}>New Session</button>
            </div>
          </div>

          <div className="msgs-wrap">
            <div className="msgs-inner">
              {isOnlyWelcome && (
                <div className="intro-block">
                  <div className="intro-label">RepairGenie</div>
                  <div className="intro-h">How can we assist<br />you today?</div>
                  <div className="intro-p">
                    Report a maintenance issue and we'll create a structured ticket and coordinate the right response.
                  </div>
                </div>
              )}

              <div className="date-sep"><span>Today</span></div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`msg-row ${m.role}`}
                  style={{ animationDelay: `${Math.min(i * 0.025, 0.15)}s` }}
                >
                  {m.role === "assistant" && <div className="av ai">RG</div>}
                  {m.role === "user" && <div className="av user">PM</div>}
                  <div className={`bubble ${m.role === "assistant" ? "ai" : "user"} ${m.content.includes("MAINTENANCE TICKET") ? "ticket" : ""}`}>
                    {parseContent(m.content)}
                  </div>
                </div>
              ))}

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
              <div className="input-foot">
                Enter to send · Shift+Enter for new line · RepairGenie by Anthropic
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}