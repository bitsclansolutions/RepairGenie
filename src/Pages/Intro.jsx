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
      transform: inView ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}s`,
      ...style
    }}>
      {children}
    </div>
  );
}

const Logo = ({ size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <rect width="44" height="44" rx="11" fill="url(#lg)" />
    <defs>
      <linearGradient id="lg" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e6bff"/><stop offset="1" stopColor="#38bdf8"/>
      </linearGradient>
    </defs>
    <path d="M29 9.5c-3.6 0-6.5 2.9-6.5 6.5 0 .8.1 1.5.4 2.2L13.2 27.9c-.7-.3-1.4-.4-2.2-.4C7.4 27.5 4.5 30.4 4.5 34s2.9 6.5 6.5 6.5 6.5-2.9 6.5-6.5c0-.8-.1-1.5-.4-2.2L26.8 22.1c.7.3 1.4.4 2.2.4 3.6 0 6.5-2.9 6.5-6.5 0-1-.2-1.9-.6-2.8l-3.4 3.4-3-.8-.8-3 3.4-3.4c-.9-.5-1.9-.7-2.9-.7-.1 0-.2 0-.2.1z" fill="white" opacity=".93"/>
    <circle cx="11" cy="34" r="2.6" fill="white" opacity=".6"/>
  </svg>
);

const STEPS = [
  { icon: "💬", title: "Describe the Issue", desc: "Chat naturally with RepairGenie AI. No forms — just tell it what's wrong." },
  { icon: "🎫", title: "Ticket Auto-Created", desc: "AI extracts location, urgency and category. A structured ticket is generated instantly." },
  { icon: "⚡", title: "Expert Dispatched", desc: "The smartest match is assigned — by skill, distance, and rating — automatically." },
  { icon: "✅", title: "Resolved & Logged", desc: "Track progress live. Assets update. Reports generate. Nothing falls through." },
];

const STATS = [
  { val: "73%", label: "Faster resolution time" },
  { val: "$4,200", label: "Avg. annual savings" },
  { val: "99.5%", label: "Platform uptime SLA" },
  { val: "4.9★", label: "Average service rating" },
];

const FEATURES = [
  { ico: "💬", name: "Conversational AI Intake", desc: "Tenants describe issues in plain language. AI extracts location, urgency, and category — no forms needed." },
  { ico: "⚡", name: "Smart Auto-Assignment", desc: "The best-fit professional is dispatched instantly, matched by skill, proximity, and performance rating." },
  { ico: "📋", name: "Asset & Warranty Tracking", desc: "Every appliance tracked with health scores, maintenance logs, warranty dates, and AI-predicted replacements." },
  { ico: "📊", name: "Analytics & Reporting", desc: "Monthly AI-generated summaries, cost breakdowns, failure trends, and insurance expiry alerts — automatically." },
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'Outfit', sans-serif;
          background: #fff;
          color: #0f1623;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
        }

        :root {
          --blue: #1e6bff;
          --blue-d: #1352d4;
          --sky: #38bdf8;
          --navy: #0c1a3a;
          --text: #0f1623;
          --muted: #64748b;
          --border: #e2ecf8;
          --bg: #f6f9ff;
          --bg2: #eef4ff;
          --px: clamp(20px, 5vw, 72px);
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── NAV ─── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 62px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 var(--px);
          transition: background .3s, box-shadow .3s;
        }
        .nav.solid {
          background: rgba(255,255,255,.96);
          backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav-logo { display: flex; align-items: center; gap: 9px; text-decoration: none; flex-shrink: 0; cursor: pointer; }
        .nav-brand {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700; font-size: 21px;
          color: var(--navy); letter-spacing: -.2px;
        }
        .nav-links { display: flex; gap: 30px; list-style: none; }
        .nav-links a {
          text-decoration: none; font-size: 14px;
          font-weight: 500; color: var(--muted); transition: color .2s;
        }
        .nav-links a:hover { color: var(--blue); }
        .nav-cta { display: flex; gap: 10px; align-items: center; }

        .btn-ghost {
          padding: 8px 18px; background: transparent;
          border: 1.5px solid var(--border); border-radius: 8px;
          font-size: 14px; font-family: 'Outfit', sans-serif; font-weight: 500;
          color: var(--text); cursor: pointer; transition: all .2s; white-space: nowrap;
        }
        .btn-ghost:hover { border-color: var(--blue); color: var(--blue); }
        .btn-blue {
          padding: 9px 22px; background: var(--blue); border: none; border-radius: 8px;
          font-size: 14px; font-family: 'Outfit', sans-serif; font-weight: 600;
          color: #fff; cursor: pointer; box-shadow: 0 4px 18px rgba(30,107,255,.26);
          transition: all .2s; white-space: nowrap;
        }
        .btn-blue:hover { background: var(--blue-d); transform: translateY(-1px); box-shadow: 0 8px 24px rgba(30,107,255,.34); }

        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          cursor: pointer; padding: 6px; background: none; border: none;
        }
        .hamburger span {
          display: block; width: 22px; height: 2px;
          background: var(--navy); border-radius: 2px; transition: all .3s;
        }
        .hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mobile-menu {
          display: none;
          position: fixed; top: 62px; left: 0; right: 0; z-index: 199;
          background: rgba(255,255,255,.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 16px var(--px) 24px;
          flex-direction: column; gap: 4px;
          animation: slideDown .25s ease both;
          box-shadow: 0 8px 32px rgba(0,0,0,.06);
        }
        .mobile-menu.visible { display: flex; }
        .mobile-menu a {
          text-decoration: none; font-size: 15px; font-weight: 500;
          color: var(--text); padding: 12px 0;
          border-bottom: 1px solid var(--border); transition: color .2s;
        }
        .mobile-menu a:hover { color: var(--blue); }
        .mobile-menu a:last-of-type { border-bottom: none; }
        .mobile-menu-btns { display: flex; gap: 10px; margin-top: 12px; }
        .mobile-menu-btns button { flex: 1; }

        /* ─── HERO ─── */
        .hero {
          min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center;
          padding: 110px var(--px) 72px;
          background: #fff;
          position: relative; overflow: hidden;
        }
        .hero-glow-a {
          position: absolute; top: -180px; right: -180px;
          width: 600px; height: 600px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,107,255,.07) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-glow-b {
          position: absolute; bottom: -120px; left: -120px;
          width: 480px; height: 480px; border-radius: 50%;
          background: radial-gradient(circle, rgba(56,189,248,.06) 0%, transparent 65%);
          pointer-events: none;
        }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(30,107,255,.18); background: rgba(30,107,255,.04);
          color: var(--blue); font-size: 13px; font-weight: 600;
          padding: 6px 16px; border-radius: 30px; margin-bottom: 26px;
          animation: fadeUp .6s ease both;
        }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }

        .hero-h1 {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(44px, 7vw, 92px);
          font-weight: 700; color: var(--navy);
          line-height: 1.02; letter-spacing: -2px;
          max-width: 820px; margin-bottom: 20px;
          animation: fadeUp .65s ease .1s both;
        }
        .hero-h1 em {
          font-style: italic;
          background: linear-gradient(120deg, var(--blue), var(--sky));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: clamp(15px, 2vw, 18px); color: var(--muted); line-height: 1.75;
          max-width: 480px; margin-bottom: 36px; font-weight: 400;
          animation: fadeUp .65s ease .2s both;
        }
        .hero-actions {
          display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;
          animation: fadeUp .65s ease .3s both;
          margin-bottom: 56px;
        }
        .btn-main {
          padding: 14px 30px; background: linear-gradient(135deg, var(--blue), var(--blue-d));
          border: none; border-radius: 10px; color: #fff;
          font-size: 15.5px; font-family: 'Outfit', sans-serif; font-weight: 600;
          cursor: pointer; box-shadow: 0 8px 28px rgba(30,107,255,.3); transition: all .25s;
        }
        .btn-main:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(30,107,255,.4); }
        .btn-outline {
          padding: 14px 28px; background: transparent;
          border: 1.5px solid var(--border); border-radius: 10px;
          color: var(--text); font-size: 15px;
          font-family: 'Outfit', sans-serif; font-weight: 500;
          cursor: pointer; transition: all .2s;
        }
        .btn-outline:hover { border-color: var(--blue); color: var(--blue); }

        .hero-ticket-wrap {
          animation: fadeUp .8s ease .45s both;
          width: 100%; display: flex; justify-content: center;
          position: relative; z-index: 2;
        }
        .hero-ticket {
          background: #fff; border: 1px solid var(--border); border-radius: 20px;
          width: 100%; max-width: 420px;
          box-shadow: 0 2px 0 0 var(--blue), 0 20px 60px rgba(30,107,255,.1), 0 4px 16px rgba(0,0,0,.05);
          overflow: hidden; animation: floatY 6s ease-in-out infinite;
        }
        .ht-top {
          background: linear-gradient(135deg, #f0f6ff, #e8f0fe);
          padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--border);
        }
        .ht-id { font-size: 13px; font-weight: 700; color: var(--blue); letter-spacing: .5px; }
        .ht-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600; color: #16a34a;
          background: rgba(22,163,74,.08); padding: 4px 10px; border-radius: 20px;
        }
        .ht-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; flex-shrink: 0; }
        .ht-body { padding: 14px 20px; }
        .ht-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 0; border-bottom: 1px solid #f0f5fb; font-size: 13.5px;
        }
        .ht-row:last-of-type { border-bottom: none; }
        .ht-lbl { color: var(--muted); font-weight: 400; }
        .ht-val { color: var(--navy); font-weight: 600; text-align: right; }
        .ht-priority { background: rgba(239,68,68,.08); color: #dc2626; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
        .ht-bar-wrap { margin: 14px 0 4px; background: #eef3fb; border-radius: 6px; height: 5px; overflow: hidden; }
        .ht-bar { height: 100%; width: 65%; background: linear-gradient(90deg, var(--blue), var(--sky)); border-radius: 6px; }
        .ht-foot { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); padding-bottom: 2px; }
        .ht-foot strong { color: var(--blue); font-weight: 600; }

        /* ─── STATS STRIP ─── */
        .stats-strip { background: var(--navy); padding: clamp(36px, 5vw, 52px) var(--px); }
        .stats-inner {
          display: grid; grid-template-columns: repeat(4, 1fr);
          max-width: 960px; margin: 0 auto;
          border-left: 1px solid rgba(255,255,255,.07);
        }
        .stat-item {
          padding: 0 clamp(16px, 3vw, 36px);
          border-right: 1px solid rgba(255,255,255,.07); text-align: center;
        }
        .stat-val {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 4vw, 52px); font-weight: 700;
          background: linear-gradient(135deg, #fff, var(--sky));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          line-height: 1; margin-bottom: 8px;
        }
        .stat-label { font-size: 13px; color: rgba(255,255,255,.45); font-weight: 400; line-height: 1.4; }

        /* ─── HOW IT WORKS ─── */
        .how { padding: clamp(64px, 8vw, 100px) var(--px); background: #fff; }
        .how-head { text-align: center; margin-bottom: clamp(40px, 5vw, 64px); }
        .s-label { display: inline-block; font-size: 12px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: var(--blue); margin-bottom: 10px; }
        .s-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(28px, 4vw, 50px); font-weight: 700; color: var(--navy); letter-spacing: -.7px; line-height: 1.08; }

        .steps-row {
          display: grid; grid-template-columns: repeat(4, 1fr);
          position: relative; max-width: 1000px; margin: 0 auto; gap: 0;
        }
        .steps-row::before {
          content: ''; position: absolute;
          top: 27px; left: 12.5%; right: 12.5%;
          height: 1px; background: linear-gradient(90deg, var(--blue), var(--sky));
          opacity: .18; z-index: 0;
        }
        .step-col {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 0 clamp(8px, 2vw, 20px);
          position: relative; z-index: 1;
        }
        .step-num-wrap {
          width: 54px; height: 54px; border-radius: 50%;
          background: #fff; border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px; transition: all .3s;
          box-shadow: 0 4px 16px rgba(30,107,255,.06); flex-shrink: 0;
        }
        .step-col:hover .step-num-wrap { border-color: var(--blue); box-shadow: 0 6px 24px rgba(30,107,255,.15); transform: translateY(-3px); }
        .step-icon { font-size: 20px; }
        .step-title { font-size: 14.5px; font-weight: 600; color: var(--navy); margin-bottom: 7px; }
        .step-desc { font-size: 13px; color: var(--muted); line-height: 1.65; }

        /* ─── FEATURES ─── */
        .features { padding: clamp(64px, 8vw, 100px) var(--px); background: var(--bg); }
        .features-head { text-align: center; margin-bottom: clamp(40px, 5vw, 72px); }
        .feat-row {
          display: grid; grid-template-columns: 1fr 1fr;
          max-width: 960px; margin: 0 auto;
          border-top: 1px solid var(--border);
        }
        .feat-item {
          padding: clamp(28px, 4vw, 44px) clamp(24px, 4vw, 48px);
          border-bottom: 1px solid var(--border); transition: background .25s;
        }
        .feat-item:nth-child(odd) { border-right: 1px solid var(--border); }
        .feat-item:hover { background: #fff; }
        .feat-ico-wrap {
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(30,107,255,.07);
          display: flex; align-items: center; justify-content: center;
          font-size: 21px; margin-bottom: 14px;
        }
        .feat-name { font-family: 'Cormorant Garamond', serif; font-size: clamp(18px, 2vw, 21px); font-weight: 700; color: var(--navy); margin-bottom: 8px; }
        .feat-desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

        /* ─── PRICING ─── */
        .pricing { padding: clamp(64px, 8vw, 100px) var(--px); background: #fff; text-align: center; }
        .pricing-head { margin-bottom: clamp(36px, 5vw, 52px); }
        .price-card {
          display: inline-flex; flex-direction: column; align-items: flex-start;
          background: var(--navy); border-radius: 24px; padding: 0;
          width: 100%; max-width: 780px;
          box-shadow: 0 32px 80px rgba(12,26,58,.18);
          overflow: hidden; position: relative;
        }
        .price-card-top {
          width: 100%;
          padding: clamp(28px, 4vw, 48px) clamp(24px, 4vw, 52px) clamp(24px, 3vw, 36px);
          border-bottom: 1px solid rgba(255,255,255,.07);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
          position: relative; flex-wrap: wrap;
        }
        .price-card-top::before {
          content: ''; position: absolute; top: -100px; right: -100px;
          width: 320px; height: 320px; border-radius: 50%;
          background: radial-gradient(circle, rgba(30,107,255,.14), transparent 70%);
          pointer-events: none;
        }
        .pct-tag { font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sky); margin-bottom: 6px; }
        .pct-plan { font-family: 'Cormorant Garamond', serif; font-size: clamp(22px, 3vw, 28px); font-weight: 700; color: #fff; margin-bottom: 8px; }
        .pct-desc { font-size: 14px; color: rgba(255,255,255,.45); max-width: 320px; line-height: 1.6; }
        .pct-right { flex-shrink: 0; text-align: right; }
        .pct-amount { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px, 6vw, 72px); font-weight: 700; color: #fff; line-height: 1; white-space: nowrap; }
        .pct-amount sup { font-size: clamp(20px, 2.5vw, 28px); vertical-align: super; }
        .pct-amount sub { font-size: 16px; font-family: 'Outfit', sans-serif; font-weight: 300; opacity: .4; }
        .pct-per { font-size: 13px; color: rgba(255,255,255,.35); margin-top: 4px; }
        .price-card-bottom {
          width: 100%;
          padding: clamp(24px, 3vw, 36px) clamp(24px, 4vw, 52px) clamp(28px, 4vw, 44px);
          display: flex; align-items: flex-end; gap: clamp(24px, 4vw, 48px); flex-wrap: wrap;
        }
        .pc-feats { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 11px 24px; list-style: none; min-width: 240px; }
        .pc-feat { display: flex; align-items: center; gap: 9px; font-size: 14px; color: rgba(255,255,255,.75); }
        .pc-ck { color: var(--sky); font-size: 13px; flex-shrink: 0; }
        .btn-price-wrap { flex-shrink: 0; }
        .btn-price {
          padding: 14px 32px; background: linear-gradient(135deg, var(--blue), var(--sky));
          border: none; border-radius: 10px; color: #fff; font-size: 15px;
          font-family: 'Outfit', sans-serif; font-weight: 600; cursor: pointer;
          white-space: nowrap; box-shadow: 0 6px 22px rgba(30,107,255,.4); transition: all .25s;
        }
        .btn-price:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(30,107,255,.5); }

        /* ─── CTA ─── */
        .cta {
          padding: clamp(64px, 8vw, 100px) var(--px);
          background: linear-gradient(135deg, var(--bg) 0%, var(--bg2) 100%);
          display: grid; grid-template-columns: 1fr auto;
          align-items: center; gap: clamp(28px, 4vw, 56px);
        }
        .cta-h { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4.5vw, 58px); font-weight: 700; color: var(--navy); letter-spacing: -1px; line-height: 1.08; margin-bottom: 14px; }
        .cta-p { font-size: clamp(15px, 1.8vw, 17px); color: var(--muted); line-height: 1.7; max-width: 420px; }
        .cta-right { flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; align-items: flex-end; }

        /* ─── FOOTER ─── */
        .footer {
          padding: clamp(20px, 3vw, 30px) var(--px);
          border-top: 1px solid var(--border);
          display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;
        }
        .foot-logo { display: flex; align-items: center; gap: 9px; }
        .foot-brand { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 700; color: var(--navy); }
        .foot-copy { font-size: 13px; color: #a8b8cc; }
        .foot-links { display: flex; gap: 20px; flex-wrap: wrap; }
        .foot-links a { font-size: 13px; color: #a8b8cc; text-decoration: none; transition: color .2s; }
        .foot-links a:hover { color: var(--blue); }

        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-cta { display: none; }
          .hamburger { display: flex; }
          .stats-inner { grid-template-columns: 1fr 1fr; border-left: none; }
          .stat-item { padding: clamp(20px, 3vw, 28px) clamp(16px, 2vw, 24px); border-right: 1px solid rgba(255,255,255,.07); border-bottom: 1px solid rgba(255,255,255,.07); }
          .stat-item:nth-child(2n) { border-right: none; }
          .stat-item:nth-child(3), .stat-item:nth-child(4) { border-bottom: none; }
          .steps-row { grid-template-columns: 1fr 1fr; gap: clamp(28px, 4vw, 40px) clamp(16px, 3vw, 24px); }
          .steps-row::before { display: none; }
          .feat-row { grid-template-columns: 1fr; }
          .feat-item:nth-child(odd) { border-right: none; }
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
          .hero { padding-top: 90px; padding-bottom: 56px; }
          .hero-h1 { letter-spacing: -1px; }
          .hero-actions { flex-direction: column; align-items: stretch; width: 100%; max-width: 320px; }
          .btn-main, .btn-outline { width: 100%; text-align: center; justify-content: center; }
          .stats-inner { grid-template-columns: 1fr 1fr; }
          .steps-row { grid-template-columns: 1fr; gap: 28px; max-width: 340px; }
          .step-col { flex-direction: row; text-align: left; gap: 16px; }
          .step-num-wrap { margin-bottom: 0; flex-shrink: 0; }
          .step-body { flex: 1; }
          .feat-item { padding: 24px 20px; }
          .pc-feats { grid-template-columns: 1fr; }
          .cta-right { flex-direction: column; align-items: stretch; width: 100%; }
          .cta-right button { width: 100%; text-align: center; }
          .footer { flex-direction: column; align-items: center; text-align: center; }
          .mobile-menu-btns { flex-direction: column; }
        }

        @media (min-width: 1400px) {
          :root { --px: 100px; }
          .hero-ticket { max-width: 460px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav className={`nav ${scrolled ? "solid" : ""}`}>
        <div className="nav-logo" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Logo size={36} />
          <span className="nav-brand">RepairGenie</span>
        </div>
        <ul className="nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#pricing">Pricing</a></li>
        </ul>
        <div className="nav-cta">
          <button className="btn-ghost" onClick={goToChat}>Log In</button>
          <button className="btn-blue" onClick={goToChat}>Get Started →</button>
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
          <button className="btn-blue" onClick={goToChat}>Get Started →</button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-glow-a" />
        <div className="hero-glow-b" />
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
          <button className="btn-main" onClick={goToChat}>Try the Demo →</button>
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
              <div className="ht-row"><span className="ht-lbl">Priority</span><span className="ht-priority">🔴 High</span></div>
              <div className="ht-row"><span className="ht-lbl">Category</span><span className="ht-val">🔧 Plumbing</span></div>
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
          {STEPS.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="step-col">
                <div className="step-num-wrap"><span className="step-icon">{s.icon}</span></div>
                <div className="step-body">
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
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
        <Reveal delay={0.1}>
          <div className="feat-row">
            {FEATURES.map((f) => (
              <div className="feat-item" key={f.name}>
                <div className="feat-ico-wrap">{f.ico}</div>
                <div className="feat-name">{f.name}</div>
                <div className="feat-desc">{f.desc}</div>
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
        <Reveal delay={0.12}>
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
                  <button className="btn-price" onClick={goToChat}>Start Free Trial →</button>
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
        <Reveal delay={0.15} className="cta-right">
          <button className="btn-main" onClick={goToChat}>Try the AI Demo →</button>
          <button className="btn-outline" onClick={goToChat}>Schedule a Call</button>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="foot-logo">
          <Logo size={28} />
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