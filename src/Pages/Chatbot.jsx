import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `You are RepairGenie, an AI-powered property maintenance assistant for the RepairGenie platform. You help property owners, managers, and tenants report and manage maintenance issues.

Your job is to:
1. Greet users warmly and ask about their maintenance issue
2. Gather key information through friendly conversation:
   - Problem description (what's wrong?)
   - Location/room (where is it?)
   - Urgency (emergency/high/medium/low)
   - Category (plumbing, electrical, HVAC, structural, appliance, etc.)
3. Once you have enough info, generate a structured ticket summary with:
   - Ticket ID (format: RG-XXXXX with 5 random digits)
   - Priority level (🔴 Emergency / 🟠 High / 🟡 Medium / 🟢 Low)
   - Category with relevant emoji
   - Estimated response time
   - Recommended action
4. Offer troubleshooting tips when appropriate
5. Be concise but helpful. Use line breaks for readability.
6. After ticket creation, ask if they want to track another issue or need anything else.

Tone: Professional yet warm. Efficient. Reassuring.

Format ticket summaries like this:
---
🎫 **TICKET CREATED**
**ID:** RG-XXXXX
**Issue:** [brief description]
**Location:** [room/area]
**Category:** [emoji + category]
**Priority:** [emoji + level]
**Est. Response:** [timeframe]
**Next Steps:** [what happens now]
---`;

const WELCOME_MSG = {
  role: "assistant",
  content: "👋 Welcome to **RepairGenie AI**! I'm your intelligent property maintenance assistant.\n\nI can help you report issues, create maintenance tickets, and get the right professionals on the job — fast.\n\nWhat maintenance issue can I help you with today?",
};

const CHIPS = [
  { icon: "🚰", text: "My kitchen sink is leaking" },
  { icon: "❄️", text: "AC isn't cooling properly" },
  { icon: "⚡", text: "Power outlet stopped working" },
  { icon: "🏠", text: "Roof is making strange noises" },
];

let sessionCounter = 1;
function makeSession(id) {
  return {
    id,
    label: "New Conversation",
    time: "Just now",
    messages: [{ ...WELCOME_MSG }],
    ticketCount: 0,
    createdAt: Date.now(),
  };
}

const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="11" fill="url(#cg)" />
    <defs>
      <linearGradient id="cg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e6bff" /><stop offset="1" stopColor="#38bdf8" />
      </linearGradient>
    </defs>
    <path d="M29 9.5c-3.6 0-6.5 2.9-6.5 6.5 0 .8.1 1.5.4 2.2L13.2 27.9c-.7-.3-1.4-.4-2.2-.4C7.4 27.5 4.5 30.4 4.5 34s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5c0-.8-.1-1.5-.4-2.2L26.8 22.1c.7.3 1.4.4 2.2.4 3.6 0 6.5-2.9 6.5-6.5 0-1-.2-1.9-.6-2.8l-3.4 3.4-3-.8-.8-3 3.4-3.4c-.9-.5-1.9-.7-2.9-.7z" fill="white" opacity=".93" />
    <circle cx="11" cy="34" r="2.6" fill="white" opacity=".6" />
  </svg>
);

const TypingDots = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 2px" }}>
    {[0, 1, 2].map(i => (
      <div key={i} style={{
        width: 7, height: 7, borderRadius: "50%", background: "#94a3b8",
        animation: `typingBounce 1.3s ease-in-out ${i * 0.18}s infinite`,
      }} />
    ))}
  </div>
);

function parseContent(text) {
  return text.split("\n").map((line, i, arr) => {
    const html = line
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^---$/, "<hr style='border:none;border-top:1px solid rgba(30,107,255,0.18);margin:10px 0' />");
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < arr.length - 1 && <br />}
      </span>
    );
  });
}

function timeLabel(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return "Today";
  return "Yesterday";
}

function getSessionLabel(session) {
  const userMsgs = session.messages.filter(m => m.role === "user");
  if (userMsgs.length === 0) return "New Conversation";
  const first = userMsgs[0].content;
  return first.length > 32 ? first.slice(0, 32) + "…" : first;
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 140) + "px";
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
      // ✅ CHANGED: calls your local proxy instead of Anthropic directly
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
      const reply = data.content?.map(c => c.text || "").join("\n") || "Sorry, something went wrong.";
      const hasTicket = reply.includes("TICKET CREATED");

      updateSession(activeId, s => ({
        messages: [...nextMessages, { role: "assistant", content: reply }],
        ticketCount: hasTicket ? s.ticketCount + 1 : s.ticketCount,
      }));
    } catch {
      updateSession(activeId, s => ({
        messages: [...nextMessages, { role: "assistant", content: "⚠️ Connection issue. Please try again." }],
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body {
          font-family: 'Outfit', sans-serif;
          background: #f6f9ff;
          color: #0f1623;
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
        }
        :root {
          --blue: #1e6bff; --blue-d: #1352d4; --sky: #38bdf8;
          --navy: #0c1a3a; --text: #0f1623; --muted: #64748b;
          --border: #e2ecf8; --bg: #f6f9ff; --white: #ffffff;
          --sw: 264px;
        }
        @keyframes typingBounce {
          0%,60%,100%{transform:translateY(0);opacity:.5} 30%{transform:translateY(-5px);opacity:1}
        }
        @keyframes msgIn {
          from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)}
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideL {
          from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)}
        }
        .shell { display:flex; height:100vh; width:100vw; overflow:hidden; background:var(--bg); }
        .sidebar {
          width:var(--sw); flex-shrink:0;
          background:var(--white);
          border-right:1px solid var(--border);
          display:flex; flex-direction:column;
          transition:width .3s cubic-bezier(.22,1,.36,1), opacity .28s;
          overflow:hidden; position:relative; z-index:10;
        }
        .sidebar.closed { width:0; opacity:0; pointer-events:none; }
        .sb-head {
          padding:16px 14px 12px;
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; justify-content:space-between;
          flex-shrink:0;
        }
        .sb-logo { display:flex; align-items:center; gap:8px; }
        .sb-brand {
          font-family:'Cormorant Garamond',serif;
          font-weight:700; font-size:18px; color:var(--navy);
          white-space:nowrap; letter-spacing:-.2px;
        }
        .new-btn {
          margin:12px 12px 8px;
          padding:10px 14px;
          background:linear-gradient(135deg,var(--blue),var(--blue-d));
          border:none; border-radius:10px;
          color:#fff; font-size:13.5px;
          font-family:'Outfit',sans-serif; font-weight:600;
          cursor:pointer; display:flex; align-items:center; gap:7px;
          box-shadow:0 4px 14px rgba(30,107,255,.22);
          transition:all .2s; white-space:nowrap;
          flex-shrink:0;
        }
        .new-btn:hover { transform:translateY(-1px); box-shadow:0 7px 20px rgba(30,107,255,.32); }
        .sb-section {
          padding:8px 14px 3px;
          font-size:11px; font-weight:700;
          letter-spacing:1.5px; text-transform:uppercase;
          color:#b0bcd0; white-space:nowrap; flex-shrink:0;
        }
        .hist-list { flex:1; overflow-y:auto; padding:3px 6px 10px; }
        .hist-list::-webkit-scrollbar { width:3px; }
        .hist-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .hist-item {
          display:flex; align-items:center; gap:8px;
          padding:8px 9px; border-radius:9px;
          cursor:pointer; transition:background .15s;
          animation:slideL .25s ease both;
          position:relative;
        }
        .hist-item:hover { background:var(--bg); }
        .hist-item.active { background:rgba(30,107,255,.07); }
        .hist-item:hover .hist-del { opacity:1; }
        .hist-ico {
          width:28px; height:28px; border-radius:8px;
          background:var(--bg); border:1px solid var(--border);
          display:flex; align-items:center; justify-content:center;
          font-size:13px; flex-shrink:0;
        }
        .hist-item.active .hist-ico { background:rgba(30,107,255,.1); border-color:rgba(30,107,255,.2); }
        .hist-txt { flex:1; min-width:0; }
        .hist-label {
          font-size:13px; font-weight:500; color:var(--text);
          overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .hist-time { font-size:11px; color:var(--muted); margin-top:1px; }
        .hist-del {
          opacity:0; position:absolute; right:8px;
          width:22px; height:22px; border-radius:6px;
          background:rgba(239,68,68,.08); border:none;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .15s; flex-shrink:0;
          color:#ef4444;
        }
        .hist-del:hover { background:rgba(239,68,68,.15); }
        .del-confirm {
          position:absolute; right:4px; top:50%; transform:translateY(-50%);
          background:white; border:1px solid var(--border);
          border-radius:10px; padding:6px 10px;
          box-shadow:0 4px 20px rgba(0,0,0,.1);
          display:flex; align-items:center; gap:6px;
          z-index:20; white-space:nowrap; animation:fadeIn .15s ease both;
        }
        .del-yes {
          padding:3px 9px; background:#ef4444; border:none;
          border-radius:6px; color:white; font-size:12px;
          font-family:'Outfit',sans-serif; font-weight:600;
          cursor:pointer; transition:background .15s;
        }
        .del-yes:hover { background:#dc2626; }
        .del-no {
          padding:3px 9px; background:var(--bg); border:1px solid var(--border);
          border-radius:6px; color:var(--muted); font-size:12px;
          font-family:'Outfit',sans-serif; font-weight:500;
          cursor:pointer;
        }
        .del-no:hover { border-color:var(--blue); color:var(--blue); }
        .sb-foot {
          padding:10px 12px;
          border-top:1px solid var(--border);
          flex-shrink:0;
        }
        .user-row {
          display:flex; align-items:center; gap:9px;
          padding:7px 9px; border-radius:9px;
          cursor:pointer; transition:background .15s; white-space:nowrap;
        }
        .user-row:hover { background:var(--bg); }
        .user-av {
          width:30px; height:30px; border-radius:8px;
          background:linear-gradient(135deg,var(--blue),var(--sky));
          display:flex; align-items:center; justify-content:center;
          color:white; font-size:12px; font-weight:700; flex-shrink:0;
        }
        .user-name { font-size:13px; font-weight:600; color:var(--navy); }
        .user-plan { font-size:11px; color:var(--muted); margin-top:1px; }
        .main { flex:1; display:flex; flex-direction:column; min-width:0; background:var(--white); }
        .topbar {
          height:56px; padding:0 18px;
          border-bottom:1px solid var(--border);
          display:flex; align-items:center; justify-content:space-between;
          background:rgba(255,255,255,.95); backdrop-filter:blur(12px);
          flex-shrink:0; gap:10px;
        }
        .topbar-l { display:flex; align-items:center; gap:10px; }
        .ico-btn {
          width:32px; height:32px; background:transparent; border:none;
          border-radius:7px; cursor:pointer;
          display:flex; align-items:center; justify-content:center;
          color:var(--muted); transition:all .15s; flex-shrink:0;
        }
        .ico-btn:hover { background:var(--bg); color:var(--blue); }
        .topbar-title {
          font-family:'Cormorant Garamond',serif;
          font-size:17px; font-weight:700; color:var(--navy); white-space:nowrap;
        }
        .topbar-sub { font-size:11.5px; color:var(--muted); margin-top:1px; white-space:nowrap; }
        .topbar-r { display:flex; align-items:center; gap:7px; flex-shrink:0; }
        .pill-green {
          display:flex; align-items:center; gap:5px;
          background:rgba(22,163,74,.07); border:1px solid rgba(22,163,74,.18);
          color:#16a34a; padding:4px 11px; border-radius:20px;
          font-size:12px; font-weight:600; white-space:nowrap;
        }
        .pill-dot {
          width:6px; height:6px; border-radius:50%; background:#16a34a; flex-shrink:0;
          animation:pls 2s ease infinite;
        }
        @keyframes pls { 0%,100%{opacity:1} 50%{opacity:.3} }
        .pill-blue {
          display:flex; align-items:center; gap:5px;
          background:rgba(30,107,255,.07); border:1px solid rgba(30,107,255,.15);
          color:var(--blue); padding:4px 11px; border-radius:20px;
          font-size:12px; font-weight:600; white-space:nowrap;
        }
        .topbar-btn {
          height:32px; padding:0 13px;
          background:transparent; border:1.5px solid var(--border);
          border-radius:8px; font-size:13px;
          font-family:'Outfit',sans-serif; font-weight:500;
          color:var(--muted); cursor:pointer; transition:all .18s; white-space:nowrap;
        }
        .topbar-btn:hover { border-color:var(--blue); color:var(--blue); }
        .topbar-btn.primary {
          background:linear-gradient(135deg,var(--blue),var(--blue-d));
          border:none; color:white;
          box-shadow:0 3px 10px rgba(30,107,255,.25);
        }
        .topbar-btn.primary:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(30,107,255,.35); color:white; }
        .msgs-wrap {
          flex:1; overflow-y:auto; padding:24px 0;
          scrollbar-width:thin; scrollbar-color:var(--border) transparent;
        }
        .msgs-wrap::-webkit-scrollbar { width:4px; }
        .msgs-wrap::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
        .msgs-inner {
          max-width:740px; margin:0 auto;
          padding:0 clamp(14px,4vw,28px);
          display:flex; flex-direction:column; gap:4px;
        }
        .date-sep {
          display:flex; align-items:center; gap:10px;
          padding:8px 0 6px; animation:fadeIn .4s ease both;
        }
        .date-sep::before,.date-sep::after { content:''; flex:1; height:1px; background:var(--border); }
        .date-sep span { font-size:11.5px; color:#b8c6d8; font-weight:500; white-space:nowrap; }
        .msg-row {
          display:flex; align-items:flex-end; gap:8px;
          animation:msgIn .28s cubic-bezier(.22,1,.36,1) both;
        }
        .msg-row.user { flex-direction:row-reverse; }
        .msg-av {
          width:28px; height:28px; border-radius:8px;
          flex-shrink:0; display:flex; align-items:center; justify-content:center;
          overflow:hidden;
        }
        .msg-av.ai-av { background:transparent; }
        .msg-av.user-av {
          background:linear-gradient(135deg,var(--blue),var(--sky));
          color:white; font-size:12px; font-weight:700;
        }
        .msg-bub {
          max-width:min(73%,540px);
          padding:11px 15px;
          border-radius:15px;
          font-size:14.5px; line-height:1.72;
        }
        .msg-bub.ai { background:var(--bg); border:1px solid var(--border); color:var(--text); border-bottom-left-radius:3px; }
        .msg-bub.user { background:linear-gradient(135deg,var(--blue),var(--blue-d)); color:white; border-bottom-right-radius:3px; box-shadow:0 3px 14px rgba(30,107,255,.2); }
        .msg-bub.ticket { background:linear-gradient(140deg,#f0f6ff,#e6effd); border:1px solid rgba(30,107,255,.22); box-shadow:0 4px 22px rgba(30,107,255,.07); }
        .typing-row { display:flex; align-items:flex-end; gap:8px; animation:msgIn .22s ease both; }
        .typing-bub {
          background:var(--bg); border:1px solid var(--border);
          border-radius:15px; border-bottom-left-radius:3px;
          padding:11px 15px; display:flex; align-items:center;
        }
        .welcome {
          display:flex; flex-direction:column; align-items:center;
          text-align:center; padding:28px 0 20px;
          animation:fadeIn .5s ease both;
        }
        .welcome-ico {
          width:58px; height:58px; border-radius:16px;
          background:linear-gradient(135deg,var(--blue),var(--sky));
          display:flex; align-items:center; justify-content:center;
          margin-bottom:14px; box-shadow:0 8px 26px rgba(30,107,255,.24);
        }
        .welcome-h {
          font-family:'Cormorant Garamond',serif;
          font-size:24px; font-weight:700; color:var(--navy); margin-bottom:7px;
        }
        .welcome-p { font-size:14.5px; color:var(--muted); line-height:1.65; max-width:360px; }
        .chips-grid {
          display:grid; grid-template-columns:1fr 1fr;
          gap:9px; margin-top:24px;
          width:100%; max-width:520px;
        }
        .chip {
          background:var(--white); border:1px solid var(--border); border-radius:11px;
          padding:12px 14px; cursor:pointer;
          font-size:13.5px; font-weight:500; color:var(--text);
          font-family:'Outfit',sans-serif; text-align:left;
          transition:all .18s; line-height:1.4;
          display:flex; align-items:center; gap:8px;
        }
        .chip:hover {
          border-color:var(--blue); background:rgba(30,107,255,.03); color:var(--blue);
          transform:translateY(-2px); box-shadow:0 4px 14px rgba(30,107,255,.1);
        }
        .chip-ico { font-size:16px; flex-shrink:0; }
        .input-zone {
          padding:clamp(10px,2vw,16px) clamp(14px,4vw,28px);
          background:var(--white); border-top:1px solid var(--border); flex-shrink:0;
        }
        .input-inner { max-width:740px; margin:0 auto; }
        .input-box {
          display:flex; align-items:flex-end; gap:9px;
          background:var(--bg); border:1.5px solid var(--border);
          border-radius:13px; padding:9px 9px 9px 15px;
          transition:border-color .18s, box-shadow .18s;
        }
        .input-box:focus-within { border-color:rgba(30,107,255,.38); box-shadow:0 0 0 3px rgba(30,107,255,.05); }
        .chat-ta {
          flex:1; background:transparent; border:none; outline:none;
          font-size:14.5px; font-family:'Outfit',sans-serif;
          color:var(--text); resize:none; line-height:1.6;
          min-height:22px; max-height:140px; overflow-y:auto; padding:2px 0;
        }
        .chat-ta::placeholder { color:#b8c6d8; }
        .chat-ta::-webkit-scrollbar { width:3px; }
        .chat-ta::-webkit-scrollbar-thumb { background:var(--border); }
        .send-btn {
          width:36px; height:36px; flex-shrink:0;
          background:linear-gradient(135deg,var(--blue),var(--blue-d));
          border:none; border-radius:9px;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; transition:all .18s;
          box-shadow:0 3px 10px rgba(30,107,255,.26);
        }
        .send-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 5px 15px rgba(30,107,255,.36); }
        .send-btn:disabled { opacity:.32; cursor:not-allowed; transform:none; box-shadow:none; }
        .input-foot {
          display:flex; align-items:center; justify-content:center;
          margin-top:8px; font-size:11px; color:#c4d0de; gap:5px;
        }
        .overlay {
          display:none; position:fixed; inset:0; z-index:300;
          background:rgba(12,26,58,.3); backdrop-filter:blur(2px);
          animation:fadeIn .2s ease both;
        }
        .overlay.on { display:block; }
        @media (max-width:860px) {
          :root { --sw:250px; }
          .sidebar { position:fixed; top:0; left:0; bottom:0; z-index:400; box-shadow:4px 0 28px rgba(12,26,58,.1); }
          .sidebar.closed { width:0; }
          .overlay.on { display:block; }
          .chips-grid { grid-template-columns:1fr; }
          .msg-bub { max-width:min(86%,540px); }
          .topbar-sub { display:none; }
        }
        @media (max-width:560px) {
          .topbar { padding:0 10px; }
          .topbar-title { font-size:15.5px; }
          .pill-green span:not(.pill-dot) { display:none; }
          .pill-green { padding:4px 7px; }
          .msgs-inner { padding:0 10px; }
          .input-zone { padding:8px 10px; }
          .chips-grid { padding:0; }
          .msg-bub { font-size:14px; padding:10px 12px; }
          .pill-blue { display:none; }
          .topbar-btn:not(.primary) { display:none; }
        }
        @media (min-width:1200px) {
          .msgs-inner, .input-inner { max-width:800px; }
        }
      `}</style>

      <div className={`overlay ${sidebarOpen && window.innerWidth <= 860 ? "on" : ""}`}
        onClick={() => setSidebarOpen(false)} />

      <div className="shell">
        <aside className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
          <div className="sb-head">
            <div className="sb-logo">
              <Logo size={28} />
              <span className="sb-brand">RepairGenie</span>
            </div>
          </div>

          <button className="new-btn" onClick={newChat}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            New Conversation
          </button>

          <div className="sb-section">Conversations</div>

          <div className="hist-list">
            {sessions.map((s, i) => (
              <div
                key={s.id}
                className={`hist-item ${s.id === activeId ? "active" : ""}`}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => switchSession(s.id)}
              >
                <div className="hist-ico">
                  {s.messages.filter(m => m.role === "user").length === 0 ? "💬" : "🎫"}
                </div>
                <div className="hist-txt">
                  <div className="hist-label">{getSessionLabel(s)}</div>
                  <div className="hist-time">
                    {s.ticketCount > 0 ? `${s.ticketCount} ticket${s.ticketCount > 1 ? "s" : ""} · ` : ""}
                    {timeLabel(s.createdAt)}
                  </div>
                </div>

                {deleteConfirm === s.id ? (
                  <div className="del-confirm" onClick={e => e.stopPropagation()}>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>Delete?</span>
                    <button className="del-yes" onClick={() => deleteSession(s.id)}>Yes</button>
                    <button className="del-no" onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                ) : (
                  <button
                    className="hist-del"
                    title="Delete"
                    onClick={e => { e.stopPropagation(); setDeleteConfirm(s.id); }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
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
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <div>
                <div className="topbar-title">AI Maintenance Assistant</div>
                <div className="topbar-sub">RepairGenie · Powered by Claude</div>
              </div>
            </div>

            <div className="topbar-r">
              <div className="pill-green">
                <span className="pill-dot" />
                <span>Online</span>
              </div>
              {ticketCount > 0 && (
                <div className="pill-blue">
                  🎫 {ticketCount} ticket{ticketCount > 1 ? "s" : ""}
                </div>
              )}
              <button className="topbar-btn" onClick={newChat}>+ New Chat</button>
            </div>
          </div>

          <div className="msgs-wrap">
            <div className="msgs-inner">
              {isOnlyWelcome && (
                <div className="welcome">
                  <div className="welcome-ico"><Logo size={32} /></div>
                  <div className="welcome-h">How can I help you today?</div>
                  <div className="welcome-p">
                    Describe any property issue and I'll create a structured ticket, find the right professional, and keep you updated every step of the way.
                  </div>
                </div>
              )}

              <div className="date-sep"><span>Today</span></div>

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`msg-row ${m.role}`}
                  style={{ animationDelay: `${Math.min(i * 0.03, 0.18)}s` }}
                >
                  {m.role === "assistant" && (
                    <div className="msg-av ai-av"><Logo size={28} /></div>
                  )}
                  {m.role === "user" && (
                    <div className="msg-av user-av">P</div>
                  )}
                  <div className={`msg-bub ${m.role === "assistant" ? "ai" : "user"} ${m.content.includes("TICKET CREATED") ? "ticket" : ""}`}>
                    {parseContent(m.content)}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="typing-row">
                  <div className="msg-av ai-av"><Logo size={28} /></div>
                  <div className="typing-bub"><TypingDots /></div>
                </div>
              )}

              {isOnlyWelcome && !loading && (
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div className="chips-grid">
                    {CHIPS.map(s => (
                      <button key={s.text} className="chip" onClick={() => send(s.text)}>
                        <span className="chip-ico">{s.icon}</span>
                        {s.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} style={{ height: 6 }} />
            </div>
          </div>

          <div className="input-zone">
            <div className="input-inner">
              <div className="input-box">
                <textarea
                  ref={textareaRef}
                  className="chat-ta"
                  placeholder="Describe your maintenance issue…"
                  value={input}
                  rows={1}
                  disabled={loading}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={onKey}
                />
                <button className="send-btn" disabled={!input.trim() || loading} onClick={() => send()}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="input-foot">
                RepairGenie AI · Powered by Anthropic · Enter to send, Shift+Enter for new line
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}