import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.06 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Reveal({ children, delay = 0, style = {}, className = "" }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="10" fill="#0f1623" />
    <path d="M29 9.5c-3.6 0-6.5 2.9-6.5 6.5 0 .8.1 1.5.4 2.2L13.2 27.9c-.7-.3-1.4-.4-2.2-.4C7.4 27.5 4.5 30.4 4.5 34s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5c0-.8-.1-1.5-.4-2.2L26.8 22.1c.7.3 1.4.4 2.2.4 3.6 0 6.5-2.9 6.5-6.5 0-1-.2-1.9-.6-2.8l-3.4 3.4-3-.8-.8-3 3.4-3.4c-.9-.5-1.9-.7-2.9-.7-.1 0-.2 0-.2.1z" fill="white" opacity=".9"/>
    <circle cx="11" cy="34" r="2.6" fill="white" opacity=".5"/>
  </svg>
);

/* ── Minimal SVG icons ── */
const IconChat = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconTicket = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);
const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconBox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);
const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const STEPS = [
  { Icon: IconChat,   title: "Describe the Issue",   desc: "Chat naturally with RepairGenie AI. No forms — just tell it what's wrong." },
  { Icon: IconTicket, title: "Ticket Auto-Created",  desc: "AI extracts location, urgency and category. A structured ticket is generated instantly." },
  { Icon: IconBolt,   title: "Expert Dispatched",    desc: "The smartest match is assigned — by skill, distance, and rating — automatically." },
  { Icon: IconCheck,  title: "Resolved & Logged",    desc: "Track progress live. Assets update. Reports generate. Nothing falls through." },
];

const STATS = [
  { val: "73%",   label: "Faster resolution time" },
  { val: "$4,200", label: "Avg. annual savings" },
  { val: "99.5%", label: "Platform uptime SLA" },
  { val: "4.9★",  label: "Average service rating" },
];

const FEATURES = [
  { Icon: IconChat,     name: "Conversational AI Intake",   desc: "Tenants describe issues in plain language. AI extracts location, urgency, and category — no forms needed." },
  { Icon: IconBolt,     name: "Smart Auto-Assignment",      desc: "The best-fit professional is dispatched instantly, matched by skill, proximity, and performance rating." },
  { Icon: IconBox,      name: "Asset & Warranty Tracking",  desc: "Every appliance tracked with health scores, maintenance logs, warranty dates, and AI-predicted replacements." },
  { Icon: IconBarChart, name: "Analytics & Reporting",      desc: "Monthly AI-generated summaries, cost breakdowns, failure trends, and insurance expiry alerts — automatically." },
];

export default function RepairGenieLanding() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const goToChat = () => navigate("/chatbot");

  useEffect(() => {
    const fn = () => { setScrolled(window.scrollY > 28); };
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (scrolled) setMenuOpen(false);
  }, [scrolled]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Inter', sans-serif;
          background: #fff;
          color: #0f1623;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        :root {
          --blue:   #1a5cff;
          --blue-d: #1348d4;
          --navy:   #0f1623;
          --text:   #0f1623;
          --muted:  #6b7a90;
          --border: #e4eaf2;
          --bg:     #f7f9fc;
          --px:     clamp(20px, 5vw, 80px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── NAV ─── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 60px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--px);
          transition: background .25s, box-shadow .25s;
        }
        .nav.solid {
          background: rgba(255,255,255,.97);
          backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          text-decoration: none; flex-shrink: 0; cursor: pointer;
        }
        .nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 20px;
          color: var(--navy); letter-spacing: -.2px;
        }
        .nav-links { display: flex; gap: 32px; list-style: none; }
        .nav-links a {
          text-decoration: none; font-size: 14px;
          font-weight: 500; color: var(--muted); transition: color .15s;
        }
        .nav-links a:hover { color: var(--navy); }
        .nav-cta { display: flex; gap: 8px; align-items: center; }

        .btn-ghost {
          padding: 7px 16px; background: transparent;
          border: 1px solid var(--border); border-radius: 7px;
          font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 500;
          color: var(--text); cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .btn-ghost:hover { border-color: #b0bece; color: var(--navy); }
        .btn-blue {
          padding: 7px 18px; background: var(--navy); border: none; border-radius: 7px;
          font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 500;
          color: #fff; cursor: pointer;
          transition: all .15s; white-space: nowrap;
        }
        .btn-blue:hover { background: #1c2740; }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 6px; background: none; border: none;
        }
        .hamburger span {
          display: block; width: 20px; height: 1.5px;
          background: var(--navy); border-radius: 2px; transition: all .25s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        .mobile-menu {
          display: none;
          position: fixed; top: 60px; left: 0; right: 0; z-index: 199;
          background: rgba(255,255,255,.98);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border);
          padding: 16px var(--px) 24px;
          flex-direction: column; gap: 0;
          animation: slideDown .2s ease both;
          box-shadow: 0 8px 24px rgba(0,0,0,.05);
        }
        .mobile-menu.visible { display: flex; }
        .mobile-menu a {
          text-decoration: none; font-size: 15px; font-weight: 500;
          color: var(--text); padding: 13px 0;
          border-bottom: 1px solid var(--border); transition: color .15s;
        }
        .mobile-menu a:hover { color: var(--blue); }
        .mobile-menu a:last-of-type { border-bottom: none; }
        .mobile-menu-btns { display: flex; gap: 8px; margin-top: 16px; }
        .mobile-menu-btns button { flex: 1; }

        /* ─── HERO ─── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 120px var(--px) 80px;
          background: #fff;
          position: relative; overflow: hidden;
        }
        .hero-accent {
          position: absolute; top: 0; left: 50%; transform: translateX(-50%);
          width: 100%; max-width: 700px; height: 1px;
          background: linear-gradient(90deg, transparent, var(--blue), transparent);
          opacity: .2;
        }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 7px;
          border: 1px solid var(--border); background: var(--bg);
          color: var(--muted); font-size: 12.5px; font-weight: 500;
          padding: 5px 14px; border-radius: 30px; margin-bottom: 28px;
          animation: fadeUp .5s ease both; letter-spacing: .1px;
        }
        .pill-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }

        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(46px, 7vw, 88px);
          font-weight: 700; color: var(--navy);
          line-height: 1.0; letter-spacing: -2px;
          max-width: 780px; margin-bottom: 22px;
          animation: fadeUp .55s ease .08s both;
        }
        .hero-h1 em {
          font-style: italic;
          color: var(--blue);
        }
        .hero-sub {
          font-size: clamp(15px, 1.8vw, 17px); color: var(--muted); line-height: 1.7;
          max-width: 440px; margin-bottom: 36px; font-weight: 400;
          animation: fadeUp .55s ease .16s both;
        }
        .hero-actions {
          display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;
          animation: fadeUp .55s ease .24s both;
          margin-bottom: 60px;
        }
        .btn-main {
          padding: 12px 26px; background: var(--navy);
          border: none; border-radius: 8px; color: #fff;
          font-size: 14.5px; font-family: 'Inter', sans-serif; font-weight: 500;
          cursor: pointer; transition: all .15s;
        }
        .btn-main:hover { background: #1c2740; }
        .btn-outline {
          padding: 12px 24px; background: transparent;
          border: 1px solid var(--border); border-radius: 8px;
          color: var(--muted); font-size: 14.5px;
          font-family: 'Inter', sans-serif; font-weight: 500;
          cursor: pointer; transition: all .15s;
        }
        .btn-outline:hover { border-color: #b0bece; color: var(--navy); }

        /* ─── HERO TICKET ─── */
        .hero-ticket-wrap {
          animation: fadeUp .7s ease .36s both;
          width: 100%; display: flex; justify-content: center;
          position: relative; z-index: 2;
        }
        .hero-ticket {
          background: #fff; border: 1px solid var(--border); border-radius: 16px;
          width: 100%; max-width: 400px;
          box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 16px 48px rgba(0,0,0,.07);
          overflow: hidden; animation: floatY 7s ease-in-out infinite;
        }
        .ht-top {
          background: var(--bg);
          padding: 14px 18px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .ht-id { font-size: 12px; font-weight: 600; color: var(--muted); letter-spacing: .6px; text-transform: uppercase; }
        .ht-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 500; color: #16a34a;
        }
        .ht-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
        .ht-body { padding: 14px 18px 16px; }
        .ht-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 9px 0; border-bottom: 1px solid #f0f4f8; font-size: 13px;
        }
        .ht-row:last-of-type { border-bottom: none; }
        .ht-lbl { color: var(--muted); font-weight: 400; }
        .ht-val { color: var(--navy); font-weight: 500; text-align: right; }
        .ht-priority {
          background: #fef2f2; color: #dc2626;
          font-size: 12px; font-weight: 500;
          padding: 3px 8px; border-radius: 5px;
        }
        .ht-bar-wrap { margin: 14px 0 4px; background: #edf1f7; border-radius: 4px; height: 4px; overflow: hidden; }
        .ht-bar { height: 100%; width: 65%; background: var(--blue); border-radius: 4px; }
        .ht-foot { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); padding-bottom: 2px; }
        .ht-foot strong { color: var(--navy); font-weight: 600; }

        /* ─── STATS STRIP ─── */
        .stats-strip { background: var(--navy); padding: clamp(40px, 5vw, 56px) var(--px); }
        .stats-inner {
          display: grid; grid-template-columns: repeat(4, 1fr);
          max-width: 900px; margin: 0 auto;
          border-left: 1px solid rgba(255,255,255,.06);
        }
        .stat-item {
          padding: 0 clamp(20px, 3vw, 40px);
          border-right: 1px solid rgba(255,255,255,.06); text-align: center;
        }
        .stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4vw, 48px); font-weight: 700;
          color: #fff; line-height: 1; margin-bottom: 8px;
        }
        .stat-label { font-size: 13px; color: rgba(255,255,255,.4); font-weight: 400; }

        /* ─── SECTION SHARED ─── */
        .s-label {
          display: inline-block; font-size: 11.5px; font-weight: 600;
          letter-spacing: 1.6px; text-transform: uppercase;
          color: var(--blue); margin-bottom: 12px;
        }
        .s-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 4vw, 46px); font-weight: 700;
          color: var(--navy); letter-spacing: -.5px; line-height: 1.1;
        }

        /* ─── HOW IT WORKS ─── */
        .how { padding: clamp(72px, 8vw, 104px) var(--px); background: #fff; }
        .how-head { text-align: center; margin-bottom: clamp(48px, 6vw, 72px); }

        .steps-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          position: relative; max-width: 960px; margin: 0 auto; gap: 0;
        }
        .steps-row::before {
          content: ''; position: absolute;
          top: 23px; left: calc(12.5% + 24px); right: calc(12.5% + 24px);
          height: 1px; background: var(--border); z-index: 0;
        }
        .step-col {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 0 clamp(10px, 2vw, 20px);
          position: relative; z-index: 1;
        }
        .step-num-wrap {
          width: 46px; height: 46px; border-radius: 50%;
          background: #fff; border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px; transition: all .2s;
          color: var(--blue); flex-shrink: 0;
        }
        .step-col:hover .step-num-wrap {
          border-color: var(--blue);
          background: rgba(26,92,255,.04);
        }
        .step-title { font-size: 14px; font-weight: 600; color: var(--navy); margin-bottom: 8px; }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.65; font-weight: 400; }

        /* ─── FEATURES ─── */
        .features { padding: clamp(72px, 8vw, 104px) var(--px); background: var(--bg); }
        .features-head { text-align: center; margin-bottom: clamp(48px, 6vw, 72px); }
        .feat-row {
          display: grid; grid-template-columns: 1fr 1fr;
          max-width: 920px; margin: 0 auto;
          border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
        }
        .feat-item {
          padding: clamp(28px, 3.5vw, 40px) clamp(24px, 3.5vw, 40px);
          background: #fff; transition: background .2s;
        }
        .feat-item:nth-child(odd) { border-right: 1px solid var(--border); }
        .feat-item:nth-child(1), .feat-item:nth-child(2) { border-bottom: 1px solid var(--border); }
        .feat-item:hover { background: #fafbfd; }
        .feat-ico-wrap {
          width: 40px; height: 40px; border-radius: 10px;
          border: 1px solid var(--border); background: #fff;
          display: flex; align-items: center; justify-content: center;
          color: var(--blue); margin-bottom: 16px;
        }
        .feat-name {
          font-size: 15px; font-weight: 600; color: var(--navy); margin-bottom: 8px;
        }
        .feat-desc { font-size: 13.5px; color: var(--muted); line-height: 1.7; font-weight: 400; }

        /* ─── PRICING ─── */
        .pricing { padding: clamp(72px, 8vw, 104px) var(--px); background: #fff; text-align: center; }
        .pricing-head { margin-bottom: clamp(40px, 5vw, 56px); }
        .price-card {
          display: inline-flex; flex-direction: column; align-items: flex-start;
          background: var(--navy); border-radius: 20px; padding: 0;
          width: 100%; max-width: 760px;
          box-shadow: 0 2px 4px rgba(0,0,0,.06), 0 24px 64px rgba(15,22,35,.16);
          overflow: hidden;
        }
        .price-card-top {
          width: 100%;
          padding: clamp(28px, 4vw, 44px) clamp(24px, 4vw, 48px) clamp(24px, 3vw, 36px);
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
          flex-wrap: wrap;
        }
        .pct-tag {
          font-size: 11.5px; font-weight: 600; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(255,255,255,.4); margin-bottom: 8px;
        }
        .pct-plan {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 2.5vw, 26px); font-weight: 700; color: #fff; margin-bottom: 10px;
        }
        .pct-desc { font-size: 14px; color: rgba(255,255,255,.4); max-width: 300px; line-height: 1.6; font-weight: 400; }
        .pct-right { flex-shrink: 0; text-align: right; }
        .pct-amount {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(50px, 6vw, 68px); font-weight: 700;
          color: #fff; line-height: 1; white-space: nowrap;
        }
        .pct-amount sup { font-size: clamp(20px, 2.5vw, 26px); vertical-align: super; }
        .pct-amount sub { font-size: 15px; font-family: 'Inter', sans-serif; font-weight: 300; opacity: .35; }
        .pct-per { font-size: 13px; color: rgba(255,255,255,.3); margin-top: 4px; }
        .price-card-bottom {
          width: 100%;
          padding: clamp(24px, 3vw, 36px) clamp(24px, 4vw, 48px) clamp(28px, 4vw, 44px);
          display: flex; align-items: flex-end; gap: clamp(24px, 4vw, 48px); flex-wrap: wrap;
        }
        .pc-feats {
          flex: 1; display: grid; grid-template-columns: 1fr 1fr;
          gap: 10px 24px; list-style: none; min-width: 240px;
        }
        .pc-feat { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: rgba(255,255,255,.65); font-weight: 400; }
        .pc-ck { color: rgba(255,255,255,.5); font-size: 12px; flex-shrink: 0; }
        .btn-price-wrap { flex-shrink: 0; }
        .btn-price {
          padding: 13px 28px; background: #fff;
          border: none; border-radius: 8px; color: var(--navy);
          font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 600;
          cursor: pointer; white-space: nowrap; transition: all .15s;
        }
        .btn-price:hover { background: #edf1f7; }

        /* ─── CTA ─── */
        .cta {
          padding: clamp(72px, 8vw, 104px) var(--px);
          background: var(--bg);
          display: grid; grid-template-columns: 1fr auto;
          align-items: center; gap: clamp(32px, 4vw, 64px);
          border-top: 1px solid var(--border);
        }
        .cta-h {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 4vw, 52px); font-weight: 700;
          color: var(--navy); letter-spacing: -.7px; line-height: 1.1; margin-bottom: 14px;
        }
        .cta-p { font-size: clamp(14px, 1.6vw, 16px); color: var(--muted); line-height: 1.7; max-width: 380px; font-weight: 400; }
        .cta-right { flex-shrink: 0; display: flex; flex-direction: column; gap: 10px; align-items: flex-end; }

        /* ─── FOOTER ─── */
        .footer {
          padding: clamp(20px, 2.5vw, 28px) var(--px);
          border-top: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between; flex-wrap: wrap; gap: 14px;
        }
        .foot-logo { display: flex; align-items: center; gap: 9px; }
        .foot-brand { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 700; color: var(--navy); }
        .foot-copy { font-size: 13px; color: #a0aec0; font-weight: 400; }
        .foot-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .foot-links a { font-size: 13px; color: #a0aec0; text-decoration: none; transition: color .15s; font-weight: 400; }
        .foot-links a:hover { color: var(--navy); }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-cta { display: none; }
          .hamburger { display: flex; }
          .stats-inner { grid-template-columns: 1fr 1fr; border-left: none; }
          .stat-item { padding: clamp(20px, 3vw, 28px) clamp(16px, 2vw, 24px); border-right: 1px solid rgba(255,255,255,.06); border-bottom: 1px solid rgba(255,255,255,.06); }
          .stat-item:nth-child(2n) { border-right: none; }
          .stat-item:nth-child(3), .stat-item:nth-child(4) { border-bottom: none; }
          .steps-row { grid-template-columns: 1fr 1fr; gap: clamp(32px, 4vw, 48px) clamp(16px, 3vw, 24px); }
          .steps-row::before { display: none; }
          .feat-row { grid-template-columns: 1fr; }
          .feat-item:nth-child(odd) { border-right: none; }
          .feat-item:nth-child(1) { border-bottom: 1px solid var(--border); }
          .feat-item:nth-child(2) { border-bottom: 1px solid var(--border); }
          .feat-item:nth-child(3) { border-bottom: 1px solid var(--border); }
          .price-card-top { flex-direction: column; align-items: flex-start; }
          .pct-right { text-align: left; }
          .price-card-bottom { flex-direction: column; align-items: flex-start; }
          .pc-feats { grid-template-columns: 1fr 1fr; min-width: unset; width: 100%; }
          .btn-price-wrap { width: 100%; }
          .btn-price { width: 100%; text-align: center; }
          .cta { grid-template-columns: 1fr; }
          .cta-right { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
        }

        @media (max-width: 560px) {
          .hero { padding-top: 96px; padding-bottom: 56px; }
          .hero-h1 { letter-spacing: -1px; }
          .hero-actions { flex-direction: column; align-items: stretch; width: 100%; max-width: 300px; }
          .btn-main, .btn-outline { width: 100%; text-align: center; }
          .stats-inner { grid-template-columns: 1fr 1fr; }
          .steps-row { grid-template-columns: 1fr; gap: 28px; max-width: 320px; }
          .step-col { flex-direction: row; text-align: left; gap: 16px; }
          .step-num-wrap { margin-bottom: 0; flex-shrink: 0; }
          .step-body { flex: 1; }
          .feat-item { padding: 22px 20px; }
          .pc-feats { grid-template-columns: 1fr; }
          .cta-right { flex-direction: column; align-items: stretch; width: 100%; }
          .cta-right button { width: 100%; text-align: center; }
          .footer { flex-direction: column; align-items: center; text-align: center; }
          .mobile-menu-btns { flex-direction: column; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "solid" : ""}`}>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo size={34} />
          <span className="nav-brand">RepairGenie</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-ghost" onClick={goToChat}>Log In</button>
          <button className="btn-blue" onClick={goToChat}>Get Started</button>
        </div>
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu ${menuOpen ? "visible" : ""}`}>
        <a href="#how" onClick={() => setMenuOpen(false)}>How It Works</a>
        <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        <div className="mobile-menu-btns">
          <button className="btn-ghost" onClick={goToChat}>Log In</button>
          <button className="btn-blue" onClick={goToChat}>Get Started</button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-accent" />
        <div className="hero-pill">
          <span className="pill-dot" /> AI-Powered Property Maintenance
        </div>
        <h1 className="hero-h1">
          Property care,<br />
          <em>intelligently automated.</em>
        </h1>
        <p className="hero-sub">
          From the first chat message to a resolved ticket — RepairGenie handles every step so your team doesn't have to.
        </p>
        <div className="hero-actions">
          <button className="btn-main" onClick={goToChat}>Try the Demo</button>
          <button className="btn-outline" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
            See How It Works
          </button>
        </div>
        <div className="hero-ticket-wrap">
          <div className="hero-ticket">
            <div className="ht-top">
              <span className="ht-id">RG-84712</span>
              <span className="ht-status"><span className="ht-status-dot" /> In Progress</span>
            </div>
            <div className="ht-body">
              <div className="ht-row"><span className="ht-lbl">Issue</span><span className="ht-val">Kitchen sink leaking</span></div>
              <div className="ht-row"><span className="ht-lbl">Priority</span><span className="ht-priority">High</span></div>
              <div className="ht-row"><span className="ht-lbl">Category</span><span className="ht-val">Plumbing</span></div>
              <div className="ht-row"><span className="ht-lbl">Assigned To</span><span className="ht-val">Mike Torres</span></div>
              <div className="ht-row"><span className="ht-lbl">ETA</span><span className="ht-val">2 hours</span></div>
              <div className="ht-bar-wrap"><div className="ht-bar" /></div>
              <div className="ht-foot"><span>65% complete</span><strong>SLA: 1h 20m left</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="stats-strip">
        <Reveal>
          <div className="stats-inner">
            {STATS.map((s) => (
              <div className="stat-item" key={s.label}>
                <div className="stat-val">{s.val}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="how" id="how">
        <Reveal>
          <div className="how-head">
            <div className="s-label">How It Works</div>
            <h2 className="s-title">From report to resolved<br />in four simple steps</h2>
          </div>
        </Reveal>
        <div className="steps-row">
          {STEPS.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 0.08}>
              <div className="step-col">
                <div className="step-num-wrap"><Icon /></div>
                <div className="step-body">
                  <div className="step-title">{title}</div>
                  <div className="step-desc">{desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <Reveal>
          <div className="features-head">
            <div className="s-label">Platform Features</div>
            <h2 className="s-title">Built for every property,<br />every scenario</h2>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="feat-row">
            {FEATURES.map(({ Icon, name, desc }) => (
              <div className="feat-item" key={name}>
                <div className="feat-ico-wrap"><Icon /></div>
                <div className="feat-name">{name}</div>
                <div className="feat-desc">{desc}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing" id="pricing">
        <Reveal>
          <div className="pricing-head">
            <div className="s-label">Pricing</div>
            <h2 className="s-title">One plan. Everything included.</h2>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div className="price-card">
              <div className="price-card-top">
                <div className="pct-left">
                  <div className="pct-tag">Per Property · Monthly</div>
                  <div className="pct-plan">Professional Plan</div>
                  <div className="pct-desc">The complete maintenance intelligence platform. No hidden fees, no add-ons.</div>
                </div>
                <div className="pct-right">
                  <div className="pct-amount"><sup>$</sup>100<sub>/mo</sub></div>
                  <div className="pct-per">per property</div>
                </div>
              </div>
              <div className="price-card-bottom">
                <ul className="pc-feats">
                  {["AI Chatbot Ticket Intake", "Smart Provider Assignment", "SLA & Escalation Engine", "Asset & Warranty Tracking", "Monthly AI Reports", "Multi-Property Dashboard", "Real-Time Notifications", "24/7 Platform Access"].map(f => (
                    <li className="pc-feat" key={f}><span className="pc-ck">✓</span>{f}</li>
                  ))}
                </ul>
                <div className="btn-price-wrap">
                  <button className="btn-price" onClick={goToChat}>Start Free Trial</button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ── */}
      <section className="cta">
        <Reveal className="cta-left">
          <h2 className="cta-h">Ready to modernize<br />your maintenance?</h2>
          <p className="cta-p">Join hundreds of property managers already resolving issues faster, smarter, and with far less effort.</p>
        </Reveal>
        <Reveal delay={0.12} className="cta-right">
          <button className="btn-main" onClick={goToChat}>Try the AI Demo</button>
          <button className="btn-outline" onClick={goToChat}>Schedule a Call</button>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="foot-logo">
          <Logo size={26} />
          <span className="foot-brand">RepairGenie</span>
        </div>
        <span className="foot-copy">© 2025 RepairGenie. All rights reserved.</span>
        <div className="foot-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Support</a>
        </div>
      </footer>
    </>
  );
}
