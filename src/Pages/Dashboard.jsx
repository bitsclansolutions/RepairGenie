import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const TICKETS = [
  { id: "RG-48371", issue: "Water heater failure",       location: "Unit 3A · Utility",       category: "plumbing",   priority: "emergency", status: "escalated",   pro: "James Hartley",  proAv: "JH", elapsed: "8 min",    sla: "30 min" },
  { id: "RG-84712", issue: "Kitchen sink leaking",       location: "Unit 4B · Kitchen",        category: "plumbing",   priority: "high",      status: "in_progress", pro: "James Hartley",  proAv: "JH", elapsed: "14 min",   sla: "1h 46m" },
  { id: "RG-39284", issue: "Circuit breaker tripping",   location: "Unit 6C · Panel Room",     category: "electrical", priority: "high",      status: "in_progress", pro: "David Okafor",   proAv: "DO", elapsed: "58 min",   sla: "1h 02m" },
  { id: "RG-91034", issue: "AC not cooling",             location: "Unit 2A · Living Room",    category: "hvac",       priority: "high",      status: "in_progress", pro: "Carlos Reyes",   proAv: "CR", elapsed: "32 min",   sla: "1h 28m" },
  { id: "RG-99107", issue: "Refrigerator not cooling",   location: "Unit 10A · Kitchen",       category: "appliance",  priority: "high",      status: "pending",     pro: "Unassigned",     proAv: null, elapsed: "1 min",    sla: "1h 59m" },
  { id: "RG-73205", issue: "Outlet not working",         location: "Unit 7C · Bedroom",        category: "electrical", priority: "medium",    status: "pending",     pro: "Unassigned",     proAv: null, elapsed: "5 min",    sla: "3h 55m" },
  { id: "RG-66481", issue: "Crack in ceiling",           location: "Unit 1D · Living Room",    category: "structural", priority: "medium",    status: "pending",     pro: "Unassigned",     proAv: null, elapsed: "2 min",    sla: "3h 58m" },
  { id: "RG-55924", issue: "Washing machine noise",      location: "Unit 9B · Laundry",        category: "appliance",  priority: "low",       status: "in_progress", pro: "Priya Sharma",   proAv: "PS", elapsed: "1h 12m",   sla: "2h 48m" },
  { id: "RG-28461", issue: "Door lock jammed",           location: "Unit 5A · Front Door",     category: "general",    priority: "medium",    status: "in_progress", pro: "Robert Mills",   proAv: "RM", elapsed: "2h 30m",   sla: "1h 30m" },
  { id: "RG-17903", issue: "Dishwasher leaking",         location: "Unit 8B · Kitchen",        category: "appliance",  priority: "medium",    status: "resolved",    pro: "Priya Sharma",   proAv: "PS", elapsed: "3h 14m",   sla: "—" },
  { id: "RG-09841", issue: "Window seal broken",         location: "Unit 2C · Bedroom",        category: "structural", priority: "low",       status: "resolved",    pro: "Thomas Nguyen",  proAv: "TN", elapsed: "5h 02m",   sla: "—" },
  { id: "RG-00273", issue: "HVAC filter replacement",    location: "Building B · Rooftop",     category: "hvac",       priority: "low",       status: "resolved",    pro: "Carlos Reyes",   proAv: "CR", elapsed: "6h 48m",   sla: "—" },
];

const PROFESSIONALS = [
  { name: "James Hartley", av: "JH", title: "Licensed Plumber",         status: "busy",      job: "RG-48371", completed: 8,  rating: 4.9, phone: "+1 (555) 204-3871" },
  { name: "David Okafor",  av: "DO", title: "Master Electrician",       status: "busy",      job: "RG-39284", completed: 11, rating: 4.9, phone: "+1 (555) 471-2230" },
  { name: "Carlos Reyes",  av: "CR", title: "HVAC Master Technician",   status: "busy",      job: "RG-91034", completed: 6,  rating: 4.8, phone: "+1 (555) 633-5509" },
  { name: "Priya Sharma",  av: "PS", title: "Appliance Technician",     status: "busy",      job: "RG-55924", completed: 9,  rating: 4.8, phone: "+1 (555) 926-4483" },
  { name: "Robert Mills",  av: "RM", title: "Maintenance Specialist",   status: "busy",      job: "RG-28461", completed: 4,  rating: 4.6, phone: "+1 (555) 107-3392" },
  { name: "Thomas Nguyen", av: "TN", title: "General Contractor",       status: "available", job: null,       completed: 3,  rating: 4.7, phone: "+1 (555) 815-7760" },
  { name: "Sandra Osei",   av: "SO", title: "Journeyman Plumber",       status: "available", job: null,       completed: 2,  rating: 4.7, phone: "+1 (555) 318-7740" },
  { name: "Mei-Lin Torres",av: "MT", title: "Licensed Electrician",     status: "offline",   job: null,       completed: 0,  rating: 4.8, phone: "+1 (555) 562-9910" },
  { name: "Aisha Patel",   av: "AP", title: "HVAC Technician",          status: "offline",   job: null,       completed: 0,  rating: 4.6, phone: "+1 (555) 744-2287" },
];

const EQUIPMENT = [
  { id: "EQ-001", name: "Central HVAC — Block A",    location: "Block A · Rooftop",    category: "hvac",       health: 78, lastService: "Nov 15, 2024", nextService: "Feb 15, 2025", age: "6 yr",  status: "good"     },
  { id: "EQ-002", name: "Boiler System — Block B",   location: "Block B · Basement",   category: "plumbing",   health: 52, lastService: "Aug 22, 2024", nextService: "Jan 22, 2025", age: "11 yr", status: "fair"     },
  { id: "EQ-003", name: "Elevator — Block A",        location: "Block A · Core",       category: "structural", health: 91, lastService: "Dec 01, 2024", nextService: "Mar 01, 2025", age: "3 yr",  status: "good"     },
  { id: "EQ-004", name: "Backup Generator",          location: "Block C · Utility",    category: "electrical", health: 34, lastService: "Jun 10, 2024", nextService: "Overdue",      age: "14 yr", status: "critical" },
  { id: "EQ-005", name: "Washing Machines (4×)",     location: "Block B · Laundry",    category: "appliance",  health: 61, lastService: "Oct 05, 2024", nextService: "Jan 05, 2025", age: "8 yr",  status: "fair"     },
  { id: "EQ-006", name: "Fire Suppression System",   location: "All Blocks",           category: "structural", health: 95, lastService: "Dec 10, 2024", nextService: "Mar 10, 2025", age: "2 yr",  status: "good"     },
  { id: "EQ-007", name: "Water Softener System",     location: "Block A · Utility",    category: "plumbing",   health: 45, lastService: "Sep 14, 2024", nextService: "Overdue",      age: "9 yr",  status: "fair"     },
  { id: "EQ-008", name: "Parking Lot Lights",        location: "Exterior",             category: "electrical", health: 82, lastService: "Nov 28, 2024", nextService: "Feb 28, 2025", age: "4 yr",  status: "good"     },
  { id: "EQ-009", name: "Intercom System",           location: "All Blocks · Lobby",   category: "electrical", health: 88, lastService: "Dec 05, 2024", nextService: "Mar 05, 2025", age: "5 yr",  status: "good"     },
  { id: "EQ-010", name: "Sump Pump — Block C",       location: "Block C · Basement",   category: "plumbing",   health: 29, lastService: "May 20, 2024", nextService: "Overdue",      age: "12 yr", status: "critical" },
  { id: "EQ-011", name: "Ventilation Fans (6×)",     location: "Block B · Utility",    category: "hvac",       health: 70, lastService: "Nov 01, 2024", nextService: "Feb 01, 2025", age: "7 yr",  status: "good"     },
  { id: "EQ-012", name: "Roof Drainage System",      location: "All Blocks · Rooftop", category: "structural", health: 57, lastService: "Aug 30, 2024", nextService: "Jan 30, 2025", age: "10 yr", status: "fair"     },
];

const PROPERTIES = [
  { id: "PROP-01", name: "Riverside Apartments", address: "42 Riverside Dr, Austin TX", units: 24, occupied: 22, activeTickets: 8,  monthlyRevenue: "$52,800",  satisfactionScore: 94 },
  { id: "PROP-02", name: "Oakwood Tower",         address: "185 Oak Ave, Austin TX",    units: 16, occupied: 16, activeTickets: 3,  monthlyRevenue: "$38,400",  satisfactionScore: 97 },
  { id: "PROP-03", name: "Elmwood Gardens",       address: "91 Elm St, Austin TX",      units: 12, occupied: 10, activeTickets: 1,  monthlyRevenue: "$24,000",  satisfactionScore: 91 },
  { id: "PROP-04", name: "Westside Condos",       address: "220 West Blvd, Austin TX",  units: 8,  occupied: 7,  activeTickets: 0,  monthlyRevenue: "$16,800",  satisfactionScore: 98 },
];

const TREND_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
const TREND_VALUES = [14, 22, 18, 28, 24, 19, 31];

const MONTHLY_LABELS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
const RESOLVED_TREND = [72, 78, 75, 82, 87, 91];
const SAT_TREND      = [88, 90, 87, 92, 94, 96];
const TICKET_MONTHLY = [84, 97, 91, 108, 103, 136];

const CATEGORY_BREAKDOWN = [
  { label: "Plumbing",   count: 38, color: "#3b82f6" },
  { label: "Electrical", count: 29, color: "#8b5cf6" },
  { label: "HVAC",       count: 24, color: "#06b6d4" },
  { label: "Appliance",  count: 18, color: "#f59e0b" },
  { label: "Structural", count: 12, color: "#10b981" },
  { label: "General",    count: 15, color: "#6b7280" },
];

const STATUS_SEGMENTS = [
  { label: "Resolved",    count: 3,  color: "#22c55e" },
  { label: "In Progress", count: 5,  color: "#1a5cff" },
  { label: "Pending",     count: 3,  color: "#f59e0b" },
  { label: "Escalated",   count: 1,  color: "#ef4444" },
];

const NOTIFICATIONS = [
  { text: "RG-48371 escalated — water heater emergency",       time: "2 min ago", type: "alert"  },
  { text: "RG-99107 created — refrigerator not cooling",       time: "1 min ago", type: "info"   },
  { text: "Equipment EQ-004 maintenance overdue",              time: "9 min ago", type: "warn"   },
  { text: "James Hartley confirmed arrival for RG-84712",      time: "12 min ago",type: "info"   },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const PRIORITY_STYLE = {
  emergency: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", dot: "#ef4444" },
  high:      { bg: "#fff7ed", border: "#fed7aa", text: "#ea580c", dot: "#f97316" },
  medium:    { bg: "#fefce8", border: "#fde68a", text: "#ca8a04", dot: "#eab308" },
  low:       { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", dot: "#22c55e" },
};
const STATUS_STYLE = {
  escalated:   { bg: "#fef2f2", border: "#fecaca", text: "#dc2626" },
  in_progress: { bg: "#f0f4ff", border: "#c7d4ff", text: "#1a5cff" },
  pending:     { bg: "#fefce8", border: "#fde68a", text: "#ca8a04" },
  resolved:    { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a" },
};
const HEALTH_COLOR = (h) => h >= 70 ? "#16a34a" : h >= 45 ? "#ca8a04" : "#dc2626";
const HEALTH_BG    = (h) => h >= 70 ? "#f0fdf4" : h >= 45 ? "#fefce8" : "#fef2f2";
const STATUS_PRO   = { busy: { dot: "#1a5cff", label: "On Job" }, available: { dot: "#22c55e", label: "Available" }, offline: { dot: "#9ca3af", label: "Offline" } };

function formatClock(d) {
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function formatDate(d) {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}
function catLabel(c) { return c.charAt(0).toUpperCase() + c.slice(1); }

// ─── SVG Charts ─────────────────────────────────────────────────────────────
function LineChart({ values, labels, color = "#1a5cff", h = 130 }) {
  const W = 480, H = h;
  const pad = { t: 12, b: labels ? 26 : 8, l: 6, r: 6 };
  const cW = W - pad.l - pad.r, cH = H - pad.t - pad.b;
  const max = Math.max(...values), min = Math.max(0, Math.min(...values) - 2);
  const range = max - min || 1;
  const xi = (i) => pad.l + (i / (values.length - 1)) * cW;
  const yi = (v) => pad.t + cH - ((v - min) / range) * cH;
  const pts = values.map((v, i) => [xi(i), yi(v)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join("");
  const area = `${line}L${xi(values.length - 1).toFixed(1)},${(pad.t + cH).toFixed(1)}L${xi(0).toFixed(1)},${(pad.t + cH).toFixed(1)}Z`;
  const gid  = `lg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity=".12" />
          <stop offset="100%" stopColor={color} stopOpacity=".01" />
        </linearGradient>
      </defs>
      {[0, .33, .66, 1].map((t, i) => (
        <line key={i} x1={pad.l} y1={pad.t + t * cH} x2={W - pad.r} y2={pad.t + t * cH} stroke="#e4eaf2" strokeWidth=".8" />
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#fff" stroke={color} strokeWidth="1.5" />
      ))}
      {labels && labels.map((l, i) => (
        <text key={i} x={xi(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#6b7a90" fontFamily="Inter,sans-serif">{l}</text>
      ))}
    </svg>
  );
}

function DonutChart({ data, size = 128, thickness = 20 }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const r = (size - thickness) / 2 - 2;
  const cx = size / 2, cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f2f5" strokeWidth={thickness} />
      {data.map((d, i) => {
        const len = (d.count / total) * circ - 1.5;
        const el = <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={thickness} strokeDasharray={`${len} ${circ}`} strokeDashoffset={-offset} />;
        offset += (d.count / total) * circ;
        return el;
      })}
    </svg>
  );
}

// ─── Nav icon components ─────────────────────────────────────────────────────
const IcoOverview    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoTickets     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>;
const IcoPros        = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const IcoEquipment   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>;
const IcoAnalytics   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>;
const IcoProperties  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IcoSettings    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IcoArrow       = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
const IcoTrend       = (up) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points={up ? "23 6 13.5 15.5 8.5 10.5 1 18" : "1 6 10.5 15.5 15.5 10.5 23 18"}/></svg>;

const NAV_ITEMS = [
  { key: "overview",    label: "Overview",       Icon: IcoOverview   },
  { key: "tickets",     label: "Tickets",        Icon: IcoTickets    },
  { key: "professionals",label: "Professionals", Icon: IcoPros       },
  { key: "equipment",   label: "Equipment",      Icon: IcoEquipment  },
  { key: "analytics",   label: "Analytics",      Icon: IcoAnalytics  },
  { key: "properties",  label: "Properties",     Icon: IcoProperties },
];

// ─── Badge components ────────────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const s = PRIORITY_STYLE[priority] || PRIORITY_STYLE.low;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, background:s.bg, border:`1px solid ${s.border}`, borderRadius:20, padding:"2px 8px", fontSize:11, fontWeight:500, color:s.text, whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:s.dot, flexShrink:0 }} />
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}
function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  const labels = { escalated: "Escalated", in_progress: "In Progress", pending: "Pending", resolved: "Resolved" };
  return (
    <span style={{ background:s.bg, border:`1px solid ${s.border}`, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:500, color:s.text, whiteSpace:"nowrap" }}>
      {labels[status] || status}
    </span>
  );
}
function CategoryChip({ category }) {
  const colors = { plumbing:"#3b82f6", electrical:"#8b5cf6", hvac:"#06b6d4", appliance:"#f59e0b", structural:"#10b981", general:"#6b7280" };
  const c = colors[category] || "#6b7280";
  return (
    <span style={{ background:`${c}14`, border:`1px solid ${c}30`, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:500, color:c, whiteSpace:"nowrap" }}>
      {catLabel(category)}
    </span>
  );
}

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, trend, trendUp, sparkData, color = "#1a5cff" }) {
  return (
    <div className="db-kpi">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
        <span className="db-kpi-label">{label}</span>
        {trend && (
          <span style={{ display:"inline-flex", alignItems:"center", gap:3, fontSize:11.5, fontWeight:500, color: trendUp ? "#16a34a" : "#dc2626", background: trendUp ? "#f0fdf4" : "#fef2f2", border: `1px solid ${trendUp ? "#bbf7d0" : "#fecaca"}`, borderRadius:20, padding:"2px 8px" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points={trendUp ? "18 15 12 9 6 15" : "18 9 12 15 6 9"}/></svg>
            {trend}
          </span>
        )}
      </div>
      <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:38, fontWeight:700, color:"#0f1623", lineHeight:1, marginBottom:6 }}>{value}</div>
      <div style={{ fontSize:12, color:"#6b7a90", fontWeight:400, marginBottom: sparkData ? 12 : 0 }}>{sub}</div>
      {sparkData && (
        <div style={{ height:36, marginTop:4 }}>
          <LineChart values={sparkData} color={color} h={36} />
        </div>
      )}
    </div>
  );
}

// ─── Page: Overview ──────────────────────────────────────────────────────────
function OverviewPage({ onNavigate }) {
  const active  = TICKETS.filter(t => t.status !== "resolved").length;
  const resolved= TICKETS.filter(t => t.status === "resolved").length;
  const escalated = TICKETS.filter(t => t.status === "escalated").length;
  const prosBusy = PROFESSIONALS.filter(p => p.status === "busy").length;
  const critEquip = EQUIPMENT.filter(e => e.status === "critical").length;

  return (
    <div className="db-page">
      {/* KPI row */}
      <div className="db-kpi-grid">
        <KPICard label="Active Tickets"      value={active}    sub={`${escalated} escalated`}        trend="↑12% this week"  trendUp={false} sparkData={[8,12,10,15,14,11,active]} color="#1a5cff" />
        <KPICard label="Resolved Today"      value={resolved}  sub="of 12 total tickets"             trend="↑8% vs yesterday" trendUp={true}  sparkData={[6,8,7,11,9,10,resolved]} color="#22c55e" />
        <KPICard label="Avg Response Time"   value="28 min"    sub="across all categories"           trend="↓15% improvement" trendUp={true}  sparkData={[38,35,32,30,29,30,28]} color="#f59e0b" />
        <KPICard label="Satisfaction Score"  value="94%"       sub="based on 47 ratings"             trend="↑3% this month"   trendUp={true}  sparkData={[88,90,87,92,93,94,94]} color="#8b5cf6" />
      </div>

      {/* Charts row */}
      <div className="db-two-col" style={{ gridTemplateColumns: "1fr 320px" }}>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Ticket Volume</div>
              <div className="db-card-sub">Last 7 days</div>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[["#1a5cff","Total"],["#22c55e","Resolved"]].map(([c,l]) => (
                <span key={l} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11.5, color:"#6b7a90" }}>
                  <span style={{ width:10, height:3, background:c, borderRadius:2, display:"inline-block" }} />{l}
                </span>
              ))}
            </div>
          </div>
          <LineChart values={TREND_VALUES} labels={TREND_LABELS} color="#1a5cff" h={150} />
        </div>

        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Status Distribution</div>
              <div className="db-card-sub">Current period</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:16 }}>
            <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <DonutChart data={STATUS_SEGMENTS} size={128} thickness={20} />
              <div style={{ position:"absolute", textAlign:"center" }}>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#0f1623", lineHeight:1 }}>{TICKETS.length}</div>
                <div style={{ fontSize:10, color:"#6b7a90", letterSpacing:"1px", textTransform:"uppercase" }}>Total</div>
              </div>
            </div>
            <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:7 }}>
              {STATUS_SEGMENTS.map(s => (
                <div key={s.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:"#6b7a90" }}>
                    <span style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />{s.label}
                  </span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#0f1623" }}>{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="db-two-col" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Recent tickets */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Recent Tickets</div>
              <div className="db-card-sub">Active and escalated first</div>
            </div>
            <button className="db-link-btn" onClick={() => onNavigate("tickets")}>View all <IcoArrow /></button>
          </div>
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  {["ID", "Issue", "Priority", "Status", "Professional", "Elapsed"].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TICKETS.slice(0, 7).map(t => (
                  <tr key={t.id}>
                    <td><span style={{ fontFamily:"monospace", fontSize:11.5, color:"#1a5cff" }}>{t.id}</span></td>
                    <td>
                      <div style={{ fontSize:13, fontWeight:500, color:"#0f1623" }}>{t.issue}</div>
                      <div style={{ fontSize:11, color:"#6b7a90" }}>{t.location}</div>
                    </td>
                    <td><PriorityBadge priority={t.priority} /></td>
                    <td><StatusBadge status={t.status} /></td>
                    <td>
                      {t.proAv ? (
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:24, height:24, borderRadius:6, background:"#0f1623", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.85)", fontSize:9, fontWeight:700, flexShrink:0 }}>{t.proAv}</div>
                          <span style={{ fontSize:12, color:"#0f1623", fontWeight:400 }}>{t.pro}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize:12, color:"#9ca3af" }}>Unassigned</span>
                      )}
                    </td>
                    <td><span style={{ fontSize:12, color:"#6b7a90" }}>{t.elapsed}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active professionals */}
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Field Team</div>
              <div className="db-card-sub">{prosBusy} on active jobs</div>
            </div>
            <button className="db-link-btn" onClick={() => onNavigate("professionals")}>View all <IcoArrow /></button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {PROFESSIONALS.slice(0, 6).map(p => {
              const st = STATUS_PRO[p.status];
              return (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #f0f4f8" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:"#0f1623", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.85)", fontSize:10, fontWeight:600, flexShrink:0 }}>{p.av}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5, fontWeight:500, color:"#0f1623", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#6b7a90" }}>{p.title}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot }} />
                    <span style={{ fontSize:11, color:"#6b7a90" }}>{st.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Equipment alerts */}
      {critEquip > 0 && (
        <div className="db-card" style={{ borderLeft:"3px solid #ef4444" }}>
          <div className="db-card-head">
            <div>
              <div className="db-card-title" style={{ color:"#dc2626" }}>Equipment Alerts</div>
              <div className="db-card-sub">{critEquip} items require immediate attention</div>
            </div>
            <button className="db-link-btn" onClick={() => onNavigate("equipment")}>View equipment <IcoArrow /></button>
          </div>
          <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
            {EQUIPMENT.filter(e => e.status === "critical").map(e => (
              <div key={e.id} style={{ flex:1, minWidth:220, background:"#fef2f2", border:"1px solid #fecaca", borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:"#dc2626", marginBottom:4 }}>{e.name}</div>
                <div style={{ fontSize:11.5, color:"#6b7a90", marginBottom:8 }}>{e.location}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ flex:1, background:"#fee2e2", borderRadius:4, height:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${e.health}%`, background:"#ef4444", borderRadius:4 }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:600, color:"#dc2626" }}>{e.health}%</span>
                </div>
                <div style={{ fontSize:11, color:"#9ca3af", marginTop:4 }}>Next service: {e.nextService}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page: Tickets ───────────────────────────────────────────────────────────
function TicketsPage() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const tabs = [
    { key: "all",         label: "All",         count: TICKETS.length },
    { key: "escalated",   label: "Escalated",   count: TICKETS.filter(t => t.status === "escalated").length },
    { key: "in_progress", label: "In Progress", count: TICKETS.filter(t => t.status === "in_progress").length },
    { key: "pending",     label: "Pending",     count: TICKETS.filter(t => t.status === "pending").length },
    { key: "resolved",    label: "Resolved",    count: TICKETS.filter(t => t.status === "resolved").length },
  ];
  const visible = TICKETS.filter(t =>
    (filter === "all" || t.status === filter) &&
    (t.issue.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase()) || t.location.toLowerCase().includes(search.toLowerCase()))
  );
  return (
    <div className="db-page">
      <div className="db-card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"18px 20px 0", borderBottom:"1px solid #e4eaf2" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
            <div>
              <div className="db-card-title">All Tickets</div>
              <div className="db-card-sub">{visible.length} tickets shown</div>
            </div>
            <div style={{ position:"relative" }}>
              <svg style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#6b7a90" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets…" style={{ paddingLeft:30, paddingRight:12, height:30, background:"#f7f9fc", border:"1px solid #e4eaf2", borderRadius:7, fontSize:13, fontFamily:"Inter,sans-serif", outline:"none", color:"#0f1623", width:200 }} />
            </div>
          </div>
          <div style={{ display:"flex", gap:0 }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setFilter(t.key)} style={{ padding:"8px 16px", background:"transparent", border:"none", borderBottom: filter === t.key ? "2px solid #1a5cff" : "2px solid transparent", fontSize:13, fontFamily:"Inter,sans-serif", fontWeight: filter === t.key ? 600 : 400, color: filter === t.key ? "#1a5cff" : "#6b7a90", cursor:"pointer", display:"flex", alignItems:"center", gap:6, transition:"all .12s" }}>
                {t.label}
                {t.count > 0 && <span style={{ background: filter === t.key ? "#f0f4ff" : "#f7f9fc", color: filter === t.key ? "#1a5cff" : "#6b7a90", borderRadius:20, padding:"1px 7px", fontSize:11, fontWeight:500 }}>{t.count}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="db-table-wrap" style={{ borderRadius:0 }}>
          <table className="db-table">
            <thead>
              <tr>{["Ticket ID", "Issue", "Location", "Category", "Priority", "Status", "Professional", "Elapsed", "SLA"].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {visible.map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontFamily:"monospace", fontSize:11.5, color:"#1a5cff", fontWeight:600 }}>{t.id}</span></td>
                  <td><div style={{ fontSize:13, fontWeight:500, color:"#0f1623" }}>{t.issue}</div></td>
                  <td><span style={{ fontSize:12, color:"#6b7a90" }}>{t.location}</span></td>
                  <td><CategoryChip category={t.category} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td><StatusBadge status={t.status} /></td>
                  <td>
                    {t.proAv ? (
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:22, height:22, borderRadius:5, background:"#0f1623", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.85)", fontSize:8, fontWeight:700 }}>{t.proAv}</div>
                        <span style={{ fontSize:12, color:"#0f1623" }}>{t.pro}</span>
                      </div>
                    ) : <span style={{ fontSize:12, color:"#9ca3af" }}>Unassigned</span>}
                  </td>
                  <td><span style={{ fontSize:12, color:"#6b7a90" }}>{t.elapsed}</span></td>
                  <td><span style={{ fontSize:12, color: t.sla === "—" ? "#6b7a90" : "#0f1623", fontWeight: t.sla === "—" ? 400 : 500 }}>{t.sla}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Professionals ─────────────────────────────────────────────────────
function ProfessionalsPage() {
  const busy = PROFESSIONALS.filter(p => p.status === "busy").length;
  const avail = PROFESSIONALS.filter(p => p.status === "available").length;
  return (
    <div className="db-page">
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {[["Total Field Staff", PROFESSIONALS.length, "#0f1623"],["On Active Jobs", busy, "#1a5cff"],["Available", avail, "#16a34a"],["Offline", PROFESSIONALS.filter(p => p.status==="offline").length, "#6b7a90"]].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, background:"#fff", border:"1px solid #e4eaf2", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"1.2px", textTransform:"uppercase", color:"#6b7a90", marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {PROFESSIONALS.map(p => {
          const st = STATUS_PRO[p.status];
          return (
            <div key={p.name} className="db-card" style={{ padding:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12, marginBottom:14, paddingBottom:14, borderBottom:"1px solid #e4eaf2" }}>
                <div style={{ width:42, height:42, borderRadius:10, background:"#0f1623", display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(255,255,255,.85)", fontSize:12, fontWeight:600, flexShrink:0 }}>{p.av}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:14.5, fontWeight:600, color:"#0f1623" }}>{p.name}</div>
                  <div style={{ fontSize:12, color:"#6b7a90", marginTop:2 }}>{p.title}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:5 }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", background:st.dot, flexShrink:0 }} />
                    <span style={{ fontSize:11.5, color:"#6b7a90" }}>{st.label}</span>
                    {p.job && <span style={{ fontSize:11, fontFamily:"monospace", color:"#1a5cff" }}>· {p.job}</span>}
                  </div>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px", marginBottom:14 }}>
                {[["Rating", `${p.rating} ★`], ["Completed Today", p.completed], ["Contact", p.phone]].map(([l, v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, fontWeight:600, color:"#6b7a90", letterSpacing:"1px", textTransform:"uppercase", marginBottom:3 }}>{l}</div>
                    <div style={{ fontSize:12.5, fontWeight:500, color:"#0f1623" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: Equipment ─────────────────────────────────────────────────────────
function EquipmentPage() {
  const [filter, setFilter] = useState("all");
  const critical = EQUIPMENT.filter(e => e.status === "critical").length;
  const fair     = EQUIPMENT.filter(e => e.status === "fair").length;
  const good     = EQUIPMENT.filter(e => e.status === "good").length;
  const visible  = filter === "all" ? EQUIPMENT : EQUIPMENT.filter(e => e.status === filter);
  return (
    <div className="db-page">
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {[["Total Assets", EQUIPMENT.length, "#0f1623"],["Good Condition", good, "#16a34a"],["Needs Attention", fair, "#ca8a04"],["Critical", critical, "#dc2626"]].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, background:"#fff", border:"1px solid #e4eaf2", borderLeft: c === "#dc2626" && v > 0 ? "3px solid #ef4444" : undefined, borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"1.2px", textTransform:"uppercase", color:"#6b7a90", marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div className="db-card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #e4eaf2", display:"flex", gap:4 }}>
          {[["all","All"],["good","Good"],["fair","Fair"],["critical","Critical"]].map(([k,l]) => (
            <button key={k} onClick={() => setFilter(k)} style={{ padding:"5px 14px", background: filter===k ? "#0f1623" : "transparent", border: `1px solid ${filter===k ? "#0f1623" : "#e4eaf2"}`, borderRadius:20, fontSize:12.5, fontFamily:"Inter,sans-serif", fontWeight: filter===k ? 500 : 400, color: filter===k ? "#fff" : "#6b7a90", cursor:"pointer", transition:"all .12s" }}>{l}</button>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:0 }}>
          {visible.map((e, i) => {
            const hc = HEALTH_COLOR(e.health);
            const isLast = i === visible.length - 1;
            return (
              <div key={e.id} style={{ padding:"18px 20px", borderRight: (i % 3 !== 2) ? "1px solid #e4eaf2" : undefined, borderBottom: (i < visible.length - 3 || !isLast) ? "1px solid #e4eaf2" : undefined }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <span style={{ fontSize:10, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase", color:"#6b7a90" }}>{e.id}</span>
                  <span style={{ fontSize:11, fontWeight:500, background: HEALTH_BG(e.health), border:`1px solid ${hc}30`, borderRadius:20, padding:"2px 8px", color:hc }}>{e.status === "critical" ? "Critical" : e.status === "fair" ? "Fair" : "Good"}</span>
                </div>
                <div style={{ fontSize:14, fontWeight:600, color:"#0f1623", marginBottom:3 }}>{e.name}</div>
                <div style={{ fontSize:12, color:"#6b7a90", marginBottom:14 }}>{e.location}</div>
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:10.5, color:"#6b7a90" }}>Health</span>
                    <span style={{ fontSize:11, fontWeight:600, color:hc }}>{e.health}%</span>
                  </div>
                  <div style={{ background:"#edf1f7", borderRadius:4, height:5, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${e.health}%`, background:hc, borderRadius:4, transition:"width .4s ease" }} />
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"7px 14px" }}>
                  {[["Age", e.age],["Category", catLabel(e.category)],["Last Service", e.lastService],["Next Service", e.nextService]].map(([l,v]) => (
                    <div key={l}>
                      <div style={{ fontSize:9.5, fontWeight:600, color:"#6b7a90", letterSpacing:"1px", textTransform:"uppercase", marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:11.5, color: v === "Overdue" ? "#dc2626" : "#0f1623", fontWeight: v === "Overdue" ? 600 : 400 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page: Analytics ─────────────────────────────────────────────────────────
function AnalyticsPage() {
  const maxCat = Math.max(...CATEGORY_BREAKDOWN.map(c => c.count));
  return (
    <div className="db-page">
      <div className="db-two-col">
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Monthly Ticket Volume</div>
              <div className="db-card-sub">Aug 2024 – Jan 2025</div>
            </div>
          </div>
          <LineChart values={TICKET_MONTHLY} labels={MONTHLY_LABELS} color="#1a5cff" h={150} />
        </div>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Category Breakdown</div>
              <div className="db-card-sub">All-time distribution</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:11, marginTop:4 }}>
            {CATEGORY_BREAKDOWN.map(c => (
              <div key={c.label} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:12.5, color:"#6b7a90", width:70, flexShrink:0 }}>{c.label}</span>
                <div style={{ flex:1, background:"#f0f2f5", borderRadius:4, height:8, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${(c.count / maxCat) * 100}%`, background:c.color, borderRadius:4, transition:"width .5s ease" }} />
                </div>
                <span style={{ fontSize:12, fontWeight:600, color:"#0f1623", width:28, textAlign:"right" }}>{c.count}</span>
                <span style={{ fontSize:11, color:"#6b7a90", width:32, textAlign:"right" }}>{Math.round(c.count / CATEGORY_BREAKDOWN.reduce((s,c)=>s+c.count,0)*100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="db-two-col">
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Resolution Rate</div>
              <div className="db-card-sub">Percentage resolved within SLA</div>
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#16a34a" }}>91%</span>
          </div>
          <LineChart values={RESOLVED_TREND} labels={MONTHLY_LABELS} color="#16a34a" h={140} />
        </div>
        <div className="db-card">
          <div className="db-card-head">
            <div>
              <div className="db-card-title">Customer Satisfaction</div>
              <div className="db-card-sub">Average CSAT score</div>
            </div>
            <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:700, color:"#8b5cf6" }}>96%</span>
          </div>
          <LineChart values={SAT_TREND} labels={MONTHLY_LABELS} color="#8b5cf6" h={140} />
        </div>
      </div>
      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Total Tickets (All Time)", value:"649",   sub:"Across all properties" },
          { label:"Avg Resolution Time",       value:"31 min",sub:"Below 60-min SLA target" },
          { label:"Repeat Issues Rate",         value:"6.2%", sub:"Down from 9.4% last quarter" },
          { label:"Cost Per Ticket",            value:"$48",  sub:"Including parts & labor" },
        ].map(s => (
          <div key={s.label} style={{ background:"#fff", border:"1px solid #e4eaf2", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"1.1px", textTransform:"uppercase", color:"#6b7a90", marginBottom:8 }}>{s.label}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:700, color:"#0f1623", lineHeight:1, marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11.5, color:"#6b7a90" }}>{s.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page: Properties ────────────────────────────────────────────────────────
function PropertiesPage() {
  const totalUnits = PROPERTIES.reduce((s, p) => s + p.units, 0);
  const totalOcc   = PROPERTIES.reduce((s, p) => s + p.occupied, 0);
  return (
    <div className="db-page">
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        {[
          ["Total Properties", PROPERTIES.length, "#0f1623"],
          ["Total Units", totalUnits, "#1a5cff"],
          ["Occupancy Rate", `${Math.round(totalOcc/totalUnits*100)}%`, "#16a34a"],
          ["Active Tickets", PROPERTIES.reduce((s,p)=>s+p.activeTickets,0), "#f59e0b"],
        ].map(([l,v,c]) => (
          <div key={l} style={{ flex:1, background:"#fff", border:"1px solid #e4eaf2", borderRadius:12, padding:"16px 18px" }}>
            <div style={{ fontSize:11, fontWeight:600, letterSpacing:"1.2px", textTransform:"uppercase", color:"#6b7a90", marginBottom:8 }}>{l}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:700, color:c, lineHeight:1 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
        {PROPERTIES.map(p => {
          const occ = Math.round(p.occupied / p.units * 100);
          return (
            <div key={p.id} className="db-card">
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#0f1623", marginBottom:3 }}>{p.name}</div>
                  <div style={{ fontSize:12, color:"#6b7a90" }}>{p.address}</div>
                </div>
                <span style={{ fontSize:10, fontWeight:600, letterSpacing:"1px", textTransform:"uppercase", color:"#6b7a90", background:"#f7f9fc", border:"1px solid #e4eaf2", borderRadius:6, padding:"4px 9px", height:"fit-content", flexShrink:0 }}>{p.id}</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:16 }}>
                {[["Units", p.units],["Occupied", p.occupied],["Satisfaction", `${p.satisfactionScore}%`],["Active Tickets", p.activeTickets]].map(([l,v]) => (
                  <div key={l} style={{ background:"#f7f9fc", border:"1px solid #e4eaf2", borderRadius:8, padding:"10px 12px" }}>
                    <div style={{ fontSize:10, fontWeight:600, color:"#6b7a90", letterSpacing:"1px", textTransform:"uppercase", marginBottom:4 }}>{l}</div>
                    <div style={{ fontSize:15, fontWeight:600, color:"#0f1623" }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:11.5, color:"#6b7a90" }}>Occupancy</span>
                  <span style={{ fontSize:12, fontWeight:600, color:"#0f1623" }}>{occ}%</span>
                </div>
                <div style={{ background:"#edf1f7", borderRadius:4, height:5 }}>
                  <div style={{ height:"100%", width:`${occ}%`, background: occ >= 90 ? "#16a34a" : occ >= 70 ? "#f59e0b" : "#ef4444", borderRadius:4, transition:"width .4s" }} />
                </div>
              </div>
              <div style={{ fontSize:12, color:"#6b7a90" }}>Monthly revenue: <strong style={{ color:"#0f1623" }}>{p.monthlyRevenue}</strong></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState("overview");
  const [now, setNow] = useState(new Date());
  const [notifOpen, setNotifOpen] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setNow(new Date());
      setSecondsAgo(s => s + 1);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const PAGE_TITLES = { overview:"Overview", tickets:"Tickets", professionals:"Professionals", equipment:"Equipment", analytics:"Analytics", properties:"Properties" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body,#root{height:100%}
        body{font-family:'Inter',sans-serif;background:#f7f9fc;color:#0f1623;-webkit-font-smoothing:antialiased;overflow:hidden}
        :root{--navy:#0f1623;--blue:#1a5cff;--border:#e4eaf2;--muted:#6b7a90;--bg:#f7f9fc}

        @keyframes dbPulse{0%,100%{opacity:1}50%{opacity:.35}}
        @keyframes dbFadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dbSlideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}

        .db-shell{display:flex;height:100vh;width:100vw;overflow:hidden}

        /* Sidebar */
        .db-sidebar{width:220px;flex-shrink:0;background:var(--navy);display:flex;flex-direction:column;overflow:hidden}
        .db-sb-head{padding:20px 16px 18px;border-bottom:1px solid rgba(255,255,255,.06);cursor:pointer;display:flex;align-items:center;gap:10px;text-decoration:none}
        .db-sb-head:hover .db-sb-brand{opacity:.75}
        .db-sb-mark{width:28px;height:28px;border-radius:7px;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .db-sb-brand{font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:700;color:#fff;letter-spacing:-.2px;transition:opacity .15s}
        .db-sb-nav{flex:1;overflow-y:auto;padding:12px 10px}
        .db-sb-nav::-webkit-scrollbar{width:0}
        .db-sb-section{font-size:9.5px;font-weight:600;letter-spacing:1.8px;text-transform:uppercase;color:rgba(255,255,255,.22);padding:10px 8px 5px}
        .db-nav-item{display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:400;color:rgba(255,255,255,.55);transition:all .12s;margin-bottom:2px}
        .db-nav-item:hover{background:rgba(255,255,255,.05);color:rgba(255,255,255,.8)}
        .db-nav-item.active{background:rgba(26,92,255,.2);color:#fff;font-weight:500}
        .db-nav-item .db-nav-icon{opacity:.6;flex-shrink:0;transition:opacity .12s}
        .db-nav-item.active .db-nav-icon{opacity:1}
        .db-nav-item:hover .db-nav-icon{opacity:.9}
        .db-sb-foot{padding:14px 12px;border-top:1px solid rgba(255,255,255,.06)}
        .db-sb-user{display:flex;align-items:center;gap:9px;padding:6px 8px;border-radius:7px}
        .db-sb-av{width:28px;height:28px;border-radius:7px;background:rgba(26,92,255,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:600;flex-shrink:0}

        /* Top bar */
        .db-topbar{height:56px;background:#fff;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:16px;flex-shrink:0}
        .db-topbar-title{fontFamily:'Cormorant Garamond',serif;font-size:18px;font-weight:700;color:var(--navy);flex:1}
        .db-topbar-right{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .db-live-badge{display:flex;align-items:center;gap:5px;background:#f0fdf4;border:1px solid #d1fae5;color:#059669;padding:4px 10px;border-radius:20px;font-size:11.5px;font-weight:500}
        .db-live-dot{width:5px;height:5px;border-radius:50%;background:#10b981;animation:dbPulse 2s ease infinite;flex-shrink:0}
        .db-clock{font-size:12px;color:var(--muted);font-weight:400;white-space:nowrap}
        .db-notif-btn{position:relative;width:32px;height:32px;background:transparent;border:1px solid var(--border);border-radius:7px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--muted);transition:all .12s}
        .db-notif-btn:hover{background:var(--bg);color:var(--navy)}
        .db-notif-badge{position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:#fff}
        .db-notif-drop{position:absolute;top:40px;right:0;width:300px;background:#fff;border:1px solid var(--border);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.1);z-index:100;animation:dbFadeIn .18s ease both;overflow:hidden}
        .db-chat-btn{padding:7px 16px;background:var(--navy);border:none;border-radius:7px;font-size:12.5px;font-family:'Inter',sans-serif;font-weight:500;color:#fff;cursor:pointer;transition:background .12s;white-space:nowrap}
        .db-chat-btn:hover{background:#1c2740}

        /* Main */
        .db-main{flex:1;display:flex;flex-direction:column;min-width:0;overflow:hidden}
        .db-content{flex:1;overflow-y:auto;padding:24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
        .db-content::-webkit-scrollbar{width:4px}
        .db-content::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}

        /* Page */
        .db-page{display:flex;flex-direction:column;gap:16px;animation:dbFadeIn .25s ease both}
        .db-two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px}

        /* Cards */
        .db-card{background:#fff;border:1px solid var(--border);border-radius:14px;padding:20px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
        .db-card-head{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:12px}
        .db-card-title{font-size:14.5px;font-weight:600;color:var(--navy)}
        .db-card-sub{font-size:11.5px;color:var(--muted);font-weight:400;margin-top:2px}
        .db-link-btn{display:flex;align-items:center;gap:5px;background:transparent;border:none;font-size:12px;font-family:'Inter',sans-serif;font-weight:500;color:var(--blue);cursor:pointer;flex-shrink:0;transition:opacity .12s}
        .db-link-btn:hover{opacity:.75}

        /* KPI grid */
        .db-kpi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
        .db-kpi{background:#fff;border:1px solid var(--border);border-radius:14px;padding:18px 20px;box-shadow:0 1px 2px rgba(0,0,0,.03)}
        .db-kpi-label{font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:var(--muted)}

        /* Table */
        .db-table-wrap{overflow-x:auto;border-radius:8px}
        .db-table{width:100%;border-collapse:collapse;font-size:13px}
        .db-table th{text-align:left;font-size:10.5px;font-weight:600;letter-spacing:1.1px;text-transform:uppercase;color:var(--muted);padding:10px 14px;border-bottom:1px solid var(--border);white-space:nowrap;background:#fafbfc}
        .db-table td{padding:10px 14px;border-bottom:1px solid #f5f7fa;vertical-align:middle}
        .db-table tr:last-child td{border-bottom:none}
        .db-table tr:hover td{background:#fafbfc}

        @media(max-width:1100px){.db-kpi-grid{grid-template-columns:1fr 1fr}.db-two-col{grid-template-columns:1fr}}
        @media(max-width:820px){.db-sidebar{display:none}}
      `}</style>

      <div className="db-shell">
        {/* ── SIDEBAR ── */}
        <aside className="db-sidebar">
          <div className="db-sb-head" onClick={() => navigate("/")}>
            <div className="db-sb-mark">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="db-sb-brand">RepairGenie</span>
          </div>

          <nav className="db-sb-nav">
            <div className="db-sb-section">Main</div>
            {NAV_ITEMS.map(({ key, label, Icon }) => (
              <div key={key} className={`db-nav-item ${activePage === key ? "active" : ""}`} onClick={() => setActivePage(key)}>
                <span className="db-nav-icon"><Icon /></span>
                {label}
                {key === "tickets" && TICKETS.filter(t => t.status === "escalated").length > 0 && (
                  <span style={{ marginLeft:"auto", background:"#ef4444", color:"#fff", borderRadius:20, padding:"1px 6px", fontSize:10, fontWeight:700 }}>
                    {TICKETS.filter(t => t.status === "escalated").length}
                  </span>
                )}
              </div>
            ))}
            <div className="db-sb-section" style={{ marginTop:8 }}>System</div>
            <div className="db-nav-item">
              <span className="db-nav-icon"><IcoSettings /></span>
              Settings
            </div>
          </nav>

          <div className="db-sb-foot">
            <div className="db-sb-user">
              <div className="db-sb-av">SA</div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:500, color:"rgba(255,255,255,.75)" }}>Sarah Chen</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,.3)", marginTop:1 }}>Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="db-main">
          {/* Top bar */}
          <div className="db-topbar">
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"#0f1623", letterSpacing:"-.2px" }}>{PAGE_TITLES[activePage]}</div>
              <div style={{ fontSize:11, color:"#6b7a90", marginTop:1 }}>
                {formatDate(now)} · Updated {secondsAgo < 5 ? "just now" : `${secondsAgo}s ago`}
              </div>
            </div>
            <div className="db-topbar-right">
              <div className="db-live-badge"><span className="db-live-dot" />Live</div>
              <div className="db-clock">{formatClock(now)}</div>
              <div style={{ position:"relative" }}>
                <button className="db-notif-btn" onClick={() => setNotifOpen(v => !v)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                  <span className="db-notif-badge">{NOTIFICATIONS.length}</span>
                </button>
                {notifOpen && (
                  <div className="db-notif-drop">
                    <div style={{ padding:"12px 16px 8px", borderBottom:"1px solid #e4eaf2" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0f1623" }}>Notifications</div>
                    </div>
                    {NOTIFICATIONS.map((n, i) => (
                      <div key={i} style={{ padding:"10px 16px", borderBottom: i < NOTIFICATIONS.length - 1 ? "1px solid #f5f7fa" : "none", display:"flex", gap:10 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background: n.type === "alert" ? "#ef4444" : n.type === "warn" ? "#f59e0b" : "#1a5cff", marginTop:4, flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:12.5, color:"#0f1623", lineHeight:1.5 }}>{n.text}</div>
                          <div style={{ fontSize:11, color:"#6b7a90", marginTop:2 }}>{n.time}</div>
                        </div>
                      </div>
                    ))}
                    <div style={{ padding:"10px 16px" }}>
                      <button onClick={() => setNotifOpen(false)} style={{ width:"100%", padding:"8px 0", background:"transparent", border:"1px solid #e4eaf2", borderRadius:7, fontSize:12.5, fontFamily:"Inter,sans-serif", color:"#6b7a90", cursor:"pointer" }}>Dismiss all</button>
                    </div>
                  </div>
                )}
              </div>
              <button className="db-chat-btn" onClick={() => navigate("/chatbot")}>Open Chatbot</button>
            </div>
          </div>

          {/* Page content */}
          <div className="db-content" onClick={() => notifOpen && setNotifOpen(false)}>
            {activePage === "overview"       && <OverviewPage onNavigate={setActivePage} />}
            {activePage === "tickets"        && <TicketsPage />}
            {activePage === "professionals"  && <ProfessionalsPage />}
            {activePage === "equipment"      && <EquipmentPage />}
            {activePage === "analytics"      && <AnalyticsPage />}
            {activePage === "properties"     && <PropertiesPage />}
          </div>
        </div>
      </div>
    </>
  );
}
