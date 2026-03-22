import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  bg:      "#0F172A",
  surface: "#1E293B",
  teal:    "#14B8A6",
  tealHov: "#0D9488",
  white:   "#F8FAFC",
  muted:   "#CBD5E1",
  subtle:  "#64748B",
  border:  "rgba(203,213,225,0.10)",
  success: "#22C55E",
  warn:    "#F59E0B",
  error:   "#EF4444",
};

const TIMER_TOTAL = 25;
const LETTERS = ["A","B","C","D"];

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const icons = {
  mecanica_suelos: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* soil layers / strata */}
      <path d="M2 18 Q6 14 12 16 Q18 18 22 14"/>
      <path d="M2 13 Q6 9 12 11 Q18 13 22 9"/>
      <path d="M2 8 Q7 5 12 6 Q17 7 22 4"/>
      <line x1="8" y1="18" x2="8" y2="22"/>
      <line x1="12" y1="16" x2="12" y2="22"/>
      <line x1="16" y1="17" x2="16" y2="22"/>
    </svg>
  ),
  concreto: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* cylinder specimen */}
      <ellipse cx="12" cy="5" rx="7" ry="2.5"/>
      <line x1="5" y1="5" x2="5" y2="19"/>
      <line x1="19" y1="5" x2="19" y2="19"/>
      <ellipse cx="12" cy="19" rx="7" ry="2.5"/>
      {/* compression arrows */}
      <line x1="12" y1="1" x2="12" y2="3"/>
      <polyline points="10,2 12,0 14,2"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <polyline points="10,22 12,24 14,22"/>
    </svg>
  ),
  asfalto_pavimentos: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* road cross-section layers */}
      <rect x="2" y="15" width="20" height="3" rx="0.5"/>
      <rect x="2" y="12" width="20" height="3" rx="0.5"/>
      <rect x="2" y="9" width="20" height="3" rx="0.5"/>
      {/* road markings */}
      <line x1="8" y1="10.5" x2="10" y2="10.5" strokeDasharray="2 2"/>
      <line x1="14" y1="10.5" x2="16" y2="10.5" strokeDasharray="2 2"/>
      {/* Marshall arrow load */}
      <line x1="12" y1="3" x2="12" y2="7"/>
      <polyline points="10,6 12,8 14,6"/>
    </svg>
  ),
  geotecnia_cimentaciones: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* foundation footprint */}
      <rect x="6" y="3" width="12" height="5" rx="0.5"/>
      {/* pile */}
      <line x1="9" y1="8" x2="9" y2="20"/>
      <line x1="15" y1="8" x2="15" y2="20"/>
      {/* pile tip */}
      <polyline points="7,19 9,21 11,19"/>
      <polyline points="13,19 15,21 17,19"/>
      {/* soil line */}
      <line x1="2" y1="11" x2="22" y2="11" strokeDasharray="3 2"/>
    </svg>
  ),
  laboratorio_materiales: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* flask / beaker */}
      <path d="M9 3h6M10 3v6L6 17a2 2 0 001.8 3h8.4A2 2 0 0018 17L14 9V3"/>
      {/* liquid level */}
      <line x1="7.5" y1="15" x2="16.5" y2="15"/>
      {/* bubbles */}
      <circle cx="10" cy="17" r="0.5" fill={color}/>
      <circle cx="13" cy="18" r="0.5" fill={color}/>
    </svg>
  ),
  rocas_mineria: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      {/* rock core sample */}
      <ellipse cx="12" cy="4" rx="5" ry="1.5"/>
      <line x1="7" y1="4" x2="7" y2="18"/>
      <line x1="17" y1="4" x2="17" y2="18"/>
      <ellipse cx="12" cy="18" rx="5" ry="1.5"/>
      {/* fracture lines inside core */}
      <line x1="7" y1="8" x2="17" y2="10"/>
      <line x1="7" y1="13" x2="17" y2="11"/>
      {/* pickaxe hint */}
      <line x1="19" y1="3" x2="22" y2="6"/>
      <line x1="21" y1="3" x2="19" y2="5"/>
    </svg>
  ),
};

const CatIcon = ({ id, size=28, color }) => {
  const Icon = icons[id];
  return Icon ? <Icon size={size} color={color || C.teal}/> : null;
};

const CATEGORIES = [
  { id:"mecanica_suelos",         label:"Mecánica de Suelos",           desc:"Propiedades, clasificación, resistencia y consolidación" },
  { id:"concreto",                label:"Concreto",                      desc:"Tecnología, diseño de mezclas y control de calidad" },
  { id:"asfalto_pavimentos",      label:"Asfalto y Pavimentos",          desc:"Mezclas asfálticas, Marshall, Superpave y gestión vial" },
  { id:"geotecnia_cimentaciones", label:"Geotecnia y Cimentaciones",     desc:"Cimentaciones, taludes, presión lateral y asentamientos" },
  { id:"laboratorio_materiales",  label:"Laboratorio de Materiales",     desc:"Ensayos de cemento, áridos, acero, madera y metrología" },
  { id:"rocas_mineria",           label:"Rocas, Minería y Geomecánica",  desc:"Mecánica de rocas, RMR, Q, GSI, túneles y minería" },
];

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=Space+Grotesk:wght@500;600;700&display=swap');

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

  body{
    font-family:'DM Sans',sans-serif;
    background:${C.bg};
    color:${C.white};
    min-height:100vh;
    -webkit-font-smoothing:antialiased;
  }

  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:${C.bg}}
  ::-webkit-scrollbar-thumb{background:${C.subtle};border-radius:2px}

  .lt-app{min-height:100vh;display:flex;flex-direction:column}

  /* HEADER */
  .lt-header{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 40px;border-bottom:1px solid ${C.border};
    background:rgba(15,23,42,0.95);
    position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);
  }
  .lt-logo{display:flex;align-items:baseline;gap:10px}
  .lt-logo-main{
    font-family:'Space Grotesk',sans-serif;font-size:21px;
    font-weight:700;letter-spacing:-0.5px;color:${C.white};
  }
  .lt-logo-main span{color:${C.teal}}
  .lt-logo-by{font-size:11px;font-weight:500;color:${C.subtle};letter-spacing:0.5px;text-transform:uppercase}
  .lt-header-tag{font-size:11px;color:${C.subtle};letter-spacing:0.8px;text-transform:uppercase;border:1px solid ${C.border};padding:4px 10px;border-radius:4px}

  /* LOADING */
  .lt-loading{
    flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  }
  .lt-spinner{
    width:36px;height:36px;border:3px solid ${C.border};
    border-top-color:${C.teal};border-radius:50%;
    animation:spin 0.8s linear infinite;
  }
  @keyframes spin{to{transform:rotate(360deg)}}
  .lt-loading p{font-size:13px;color:${C.subtle}}

  /* LANDING */
  .lt-landing{
    flex:1;display:flex;flex-direction:column;align-items:center;
    justify-content:center;padding:60px 24px;position:relative;overflow:hidden;
  }
  .lt-landing::before{
    content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);
    width:700px;height:700px;
    background:radial-gradient(circle,rgba(20,184,166,0.055) 0%,transparent 70%);
    pointer-events:none;
  }
  .lt-landing-badge{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.22);
    border-radius:20px;padding:5px 14px;font-size:11px;font-weight:600;
    color:${C.teal};letter-spacing:1px;text-transform:uppercase;margin-bottom:28px;
  }
  .lt-landing-badge::before{
    content:'';width:6px;height:6px;background:${C.teal};border-radius:50%;
    animation:pulse 2s infinite;
  }
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

  .lt-landing-title{
    font-family:'Space Grotesk',sans-serif;
    font-size:clamp(34px,6vw,62px);font-weight:700;text-align:center;
    line-height:1.1;letter-spacing:-1.5px;color:${C.white};
    max-width:760px;margin-bottom:20px;
  }
  .lt-landing-title .accent{color:${C.teal}}

  .lt-landing-sub{
    font-size:16px;color:${C.muted};text-align:center;
    max-width:480px;line-height:1.7;margin-bottom:44px;
  }

  .lt-cta-primary{
    background:${C.teal};color:#0F172A;border:none;border-radius:8px;
    padding:15px 40px;font-family:'Space Grotesk',sans-serif;
    font-size:14px;font-weight:700;letter-spacing:0.3px;cursor:pointer;
    transition:background .2s,transform .15s;
    display:inline-flex;align-items:center;gap:8px;
  }
  .lt-cta-primary:hover{background:${C.tealHov};transform:translateY(-1px)}

  .lt-landing-stats{
    display:flex;gap:48px;margin-top:60px;padding-top:48px;border-top:1px solid ${C.border};
  }
  .lt-stat{text-align:center}
  .lt-stat-num{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:${C.white}}
  .lt-stat-label{font-size:11px;color:${C.subtle};margin-top:4px;text-transform:uppercase;letter-spacing:.8px}

  /* CONFIG */
  .lt-selector{flex:1;padding:48px 24px;max-width:920px;margin:0 auto;width:100%}
  .lt-step-label{font-size:11px;color:${C.teal};font-weight:600;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px}
  .lt-selector-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:${C.white};letter-spacing:-.5px}
  .lt-selector-sub{font-size:13px;color:${C.subtle};margin-top:6px;margin-bottom:28px}

  .lt-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-bottom:32px}
  .lt-cat-card{
    background:${C.surface};border:1px solid ${C.border};border-radius:10px;
    padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;
  }
  .lt-cat-card:hover{border-color:rgba(20,184,166,0.4);transform:translateY(-1px)}
  .lt-cat-card.selected{border-color:${C.teal};background:rgba(20,184,166,0.06)}
  .lt-cat-card.selected::after{
    content:'✓';position:absolute;top:12px;right:14px;
    color:${C.teal};font-size:13px;font-weight:700;
  }
  .lt-cat-icon{
    width:44px;height:44px;border-radius:10px;
    background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.15);
    display:flex;align-items:center;justify-content:center;
    margin-bottom:14px;flex-shrink:0;
  }
  .lt-cat-card.selected .lt-cat-icon{
    background:rgba(20,184,166,0.15);border-color:rgba(20,184,166,0.35);
  }
  .lt-cat-name{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:${C.white};margin-bottom:4px}
  .lt-cat-count{font-size:11px;color:${C.teal};margin-bottom:4px;font-weight:600}
  .lt-cat-desc{font-size:11px;color:${C.subtle};line-height:1.5}

  .lt-config-row{display:flex;gap:24px;margin-bottom:32px;flex-wrap:wrap}
  .lt-config-group{flex:1;min-width:180px}
  .lt-config-label{font-size:11px;color:${C.subtle};font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px;display:block}
  .lt-pills{display:flex;gap:8px;flex-wrap:wrap}
  .lt-pill{
    background:transparent;border:1px solid ${C.border};border-radius:6px;
    padding:7px 14px;font-size:12px;font-weight:500;color:${C.muted};
    cursor:pointer;transition:all .15s;
  }
  .lt-pill:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}
  .lt-pill.active{background:rgba(20,184,166,0.1);border-color:${C.teal};color:${C.teal}}

  /* QUIZ */
  .lt-quiz{flex:1;padding:32px 24px;max-width:720px;margin:0 auto;width:100%}
  .lt-quiz-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:14px}
  .lt-progress-wrap{flex:1;height:3px;background:${C.surface};border-radius:2px;overflow:hidden}
  .lt-progress-bar{height:100%;background:${C.teal};border-radius:2px;transition:width .4s ease}
  .lt-q-counter{font-size:12px;color:${C.subtle};font-weight:500;white-space:nowrap}

  .lt-timer-ring{position:relative;width:42px;height:42px;flex-shrink:0}
  .lt-timer-ring svg{transform:rotate(-90deg)}
  .lt-timer-text{
    position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;
  }

  .lt-quiz-meta{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
  .lt-norm-tag{
    display:inline-block;font-size:10px;font-weight:600;color:${C.teal};
    background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);
    border-radius:4px;padding:2px 8px;letter-spacing:.5px;text-transform:uppercase;
  }
  .lt-diff-tag{
    display:inline-block;font-size:10px;font-weight:600;border-radius:4px;
    padding:2px 8px;letter-spacing:.5px;text-transform:uppercase;
  }
  .lt-diff-básico{background:rgba(100,116,139,0.12);color:${C.subtle}}
  .lt-diff-intermedio{background:rgba(245,158,11,0.1);color:${C.warn}}
  .lt-diff-avanzado{background:rgba(239,68,68,0.1);color:${C.error}}

  .lt-subtopic{font-size:11px;color:${C.subtle}}

  .lt-question-text{
    font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;
    color:${C.white};line-height:1.55;letter-spacing:-.3px;margin-bottom:24px;
  }

  .lt-options{display:flex;flex-direction:column;gap:10px}
  .lt-option{
    background:${C.surface};border:1px solid ${C.border};border-radius:8px;
    padding:15px 18px;cursor:pointer;transition:all .15s;
    display:flex;align-items:flex-start;gap:12px;text-align:left;width:100%;
  }
  .lt-option:hover:not(:disabled){border-color:rgba(20,184,166,0.45);background:rgba(30,41,59,.95)}
  .lt-option.correct{border-color:${C.success};background:rgba(34,197,94,0.07)}
  .lt-option.incorrect{border-color:${C.error};background:rgba(239,68,68,0.07)}
  .lt-option.dimmed{opacity:.38}
  .lt-option-letter{
    width:27px;height:27px;border-radius:6px;flex-shrink:0;
    background:rgba(100,116,139,0.14);border:1px solid ${C.border};
    display:flex;align-items:center;justify-content:center;
    font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;
    color:${C.subtle};transition:all .15s;
  }
  .lt-option.correct .lt-option-letter{background:rgba(34,197,94,0.14);border-color:${C.success};color:${C.success}}
  .lt-option.incorrect .lt-option-letter{background:rgba(239,68,68,0.14);border-color:${C.error};color:${C.error}}
  .lt-option-text{font-size:13px;color:${C.muted};line-height:1.55;padding-top:3px}
  .lt-option.correct .lt-option-text,.lt-option.incorrect .lt-option-text{color:${C.white}}

  .lt-explanation{
    margin-top:18px;background:rgba(30,41,59,.7);
    border:1px solid ${C.border};border-left:3px solid ${C.teal};
    border-radius:8px;padding:14px 18px;animation:fadeUp .3s ease;
  }
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .lt-explanation-label{font-size:10px;font-weight:700;color:${C.teal};letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
  .lt-explanation-text{font-size:13px;color:${C.muted};line-height:1.7}
  .lt-explanation-comp{font-size:11px;color:${C.subtle};margin-top:8px;padding-top:8px;border-top:1px solid ${C.border};font-style:italic}

  .lt-next-btn{
    margin-top:20px;width:100%;background:${C.teal};color:#0F172A;border:none;
    border-radius:8px;padding:13px;font-family:'Space Grotesk',sans-serif;
    font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;letter-spacing:.3px;
  }
  .lt-next-btn:hover{background:${C.tealHov}}

  .lt-streak{
    display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;
    color:${C.warn};background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);
    border-radius:20px;padding:3px 10px;animation:popIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  @keyframes popIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}

  /* RESULTS */
  .lt-results{flex:1;padding:48px 24px;max-width:760px;margin:0 auto;width:100%}
  .lt-results-hero{text-align:center;margin-bottom:40px}
  .lt-score-ring{width:120px;height:120px;margin:0 auto 20px;position:relative}
  .lt-score-ring svg{transform:rotate(-90deg)}
  .lt-score-number{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .lt-score-pct{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:${C.white};line-height:1}
  .lt-score-label{font-size:10px;color:${C.subtle};margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
  .lt-results-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${C.white};margin-bottom:6px;letter-spacing:-.5px}
  .lt-results-sub{font-size:13px;color:${C.subtle}}

  .lt-result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:32px}
  .lt-result-card{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:16px;text-align:center}
  .lt-result-card-num{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;margin-bottom:4px}
  .lt-result-card-label{font-size:10px;color:${C.subtle};text-transform:uppercase;letter-spacing:.6px}

  .lt-level-badge{
    display:inline-flex;align-items:center;gap:6px;
    border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;
    letter-spacing:.5px;text-transform:uppercase;margin-top:8px;
  }
  .badge-novato{background:rgba(100,116,139,0.15);color:${C.subtle}}
  .badge-básico{background:rgba(245,158,11,0.12);color:${C.warn}}
  .badge-intermedio{background:rgba(20,184,166,0.12);color:${C.teal}}
  .badge-avanzado{background:rgba(34,197,94,0.12);color:${C.success}}
  .badge-experto{background:rgba(139,92,246,0.15);color:#a78bfa}

  /* CATEGORY BREAKDOWN */
  .lt-breakdown{margin-bottom:28px}
  .lt-breakdown-title{font-size:11px;color:${C.subtle};font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
  .lt-breakdown-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .lt-breakdown-name{font-size:12px;color:${C.muted};width:180px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .lt-breakdown-bar-wrap{flex:1;height:6px;background:${C.surface};border-radius:3px;overflow:hidden}
  .lt-breakdown-bar{height:100%;border-radius:3px;transition:width 1s ease}
  .lt-breakdown-pct{font-size:11px;color:${C.subtle};width:32px;text-align:right;flex-shrink:0}

  /* REVIEW */
  .lt-review-list{display:flex;flex-direction:column;gap:10px;margin-bottom:28px}
  .lt-review-item{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:16px 18px}
  .lt-review-item.rw-correct{border-left:3px solid ${C.success}}
  .lt-review-item.rw-incorrect{border-left:3px solid ${C.error}}
  .lt-review-item.rw-timeout{border-left:3px solid ${C.subtle}}
  .lt-review-q{font-size:13px;font-weight:600;color:${C.white};margin-bottom:8px;line-height:1.5}
  .lt-review-ans{font-size:12px;color:${C.subtle};margin-bottom:3px}
  .lt-review-ans span{color:${C.muted}}
  .lt-review-exp{font-size:12px;color:${C.subtle};line-height:1.65;margin-top:8px;padding-top:8px;border-top:1px solid ${C.border}}

  /* BUTTONS */
  .lt-cta-bar{display:flex;gap:10px;flex-wrap:wrap}
  .lt-btn-outline{
    flex:1;background:transparent;border:1px solid ${C.border};border-radius:8px;
    padding:12px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;
    color:${C.muted};cursor:pointer;transition:all .2s;text-align:center;
  }
  .lt-btn-outline:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}
  .lt-btn-teal{
    flex:1;background:${C.teal};border:none;border-radius:8px;padding:12px;
    font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;
    color:#0F172A;cursor:pointer;transition:background .2s;text-align:center;
  }
  .lt-btn-teal:hover{background:${C.tealHov}}

  .lt-iltec-cta{
    text-align:center;margin-top:28px;padding:20px;
    background:rgba(20,184,166,0.05);border:1px solid rgba(20,184,166,0.14);border-radius:10px;
  }
  .lt-iltec-cta p{font-size:13px;color:${C.subtle};margin-bottom:10px}
  .lt-iltec-cta a{color:${C.teal};font-weight:600;font-size:14px;text-decoration:none}
  .lt-iltec-cta a:hover{text-decoration:underline}

  /* BACK BTN */
  .lt-back{
    flex:unset;padding:7px 14px;font-size:11px;
    background:transparent;border:1px solid ${C.border};border-radius:6px;
    color:${C.subtle};cursor:pointer;transition:all .2s;
    font-family:'DM Sans',sans-serif;font-weight:500;
  }
  .lt-back:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}

  @media(max-width:640px){
    .lt-header{padding:14px 20px}
    .lt-landing-stats{gap:24px}
    .lt-result-grid{grid-template-columns:repeat(2,1fr)}
    .lt-cat-grid{grid-template-columns:1fr}
    .lt-breakdown-name{width:120px}
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const getLevel = pct => {
  if (pct < 40) return { label:"Novato",      cls:"badge-novato",      msg:"Nivel inicial — mucho terreno por cubrir." };
  if (pct < 60) return { label:"Básico",       cls:"badge-básico",      msg:"Nivel básico — buen punto de partida." };
  if (pct < 75) return { label:"Intermedio",   cls:"badge-intermedio",  msg:"Nivel intermedio — sólido en lo fundamental." };
  if (pct < 90) return { label:"Avanzado",     cls:"badge-avanzado",    msg:"Nivel avanzado — dominio técnico real." };
  return          { label:"Experto",       cls:"badge-experto",     msg:"Nivel experto — dominio excepcional." };
};

const catColor = pct => pct >= 75 ? C.success : pct >= 50 ? C.warn : C.error;

// ─── TIMER RING ───────────────────────────────────────────────────────────────
function TimerRing({ seconds, total }) {
  const r = 16, circ = 2 * Math.PI * r;
  const color = seconds > 10 ? C.teal : seconds > 5 ? C.warn : C.error;
  return (
    <div className="lt-timer-ring">
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke={C.surface} strokeWidth="3"/>
        <circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - seconds / total)}
          strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1s linear,stroke .5s" }}/>
      </svg>
      <div className="lt-timer-text" style={{ color }}>{seconds}</div>
    </div>
  );
}

// ─── SCORE RING ───────────────────────────────────────────────────────────────
function ScoreRing({ pct }) {
  const r = 46, circ = 2 * Math.PI * r;
  const color = pct < 60 ? C.error : pct < 75 ? C.warn : C.teal;
  return (
    <div className="lt-score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.surface} strokeWidth="6"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.2s ease" }}/>
      </svg>
      <div className="lt-score-number">
        <div className="lt-score-pct">{pct}%</div>
        <div className="lt-score-label">Score</div>
      </div>
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ onBack, rightSlot }) {
  return (
    <header className="lt-header">
      <div className="lt-logo">
        <div className="lt-logo-main">LEVELTEST<span>+</span></div>
        <div className="lt-logo-by">by ILTEC</div>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        {rightSlot}
        {onBack && <button className="lt-back" onClick={onBack}>← Volver</button>}
      </div>
    </header>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LevelTestApp() {
  // ── state ──
  const [screen, setScreen]         = useState("loading"); // loading | landing | config | quiz | results
  const [bank, setBank]             = useState({});        // { catId: [questions] }
  const [bankError, setBankError]   = useState(null);

  const [selectedCats, setSelectedCats] = useState([]);
  const [difficulty, setDifficulty]     = useState("todos");
  const [numQ, setNumQ]                 = useState(10);

  const [questions, setQuestions]   = useState([]);
  const [qIndex, setQIndex]         = useState(0);
  const [answered, setAnswered]     = useState(null);
  const [results, setResults]       = useState([]);
  const [streak, setStreak]         = useState(0);
  const [timer, setTimer]           = useState(TIMER_TOTAL);
  const [showReview, setShowReview] = useState(false);

  const timerRef = useRef(null);

  // ── load bank from JSON ──
  useEffect(() => {
    const url = "./questions-v3.json";
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(flat => {
        // flat array → object keyed by category
        const obj = {};
        flat.forEach(q => {
          const cat = q.category || "sin_categoria";
          if (!obj[cat]) obj[cat] = [];
          obj[cat].push(q);
        });
        setBank(obj);
        setScreen("landing");
      })
      .catch(err => {
        // Fallback: use embedded minimal bank so the app is never broken
        console.warn("No se pudo cargar el banco externo, usando banco local.", err);
        setBankError("No se pudo cargar el banco de preguntas externo. Usando banco de demostración.");
        setBank(buildFallbackBank());
        setScreen("landing");
      });
  }, []);

  // ── build quiz ──
  const startQuiz = useCallback(() => {
    const cats = selectedCats.length ? selectedCats : CATEGORIES.map(c => c.id);
    let pool = [];
    cats.forEach(cat => {
      const qs = bank[cat] || [];
      const filtered = difficulty === "todos" ? qs : qs.filter(q => q.difficulty === difficulty);
      pool.push(...filtered);
    });
    if (!pool.length) return;
    const picked = shuffle(pool).slice(0, numQ);
    setQuestions(picked);
    setQIndex(0);
    setAnswered(null);
    setResults([]);
    setStreak(0);
    setTimer(TIMER_TOTAL);
    setShowReview(false);
    setScreen("quiz");
  }, [selectedCats, difficulty, numQ, bank]);

  // ── timer ──
  useEffect(() => {
    if (screen !== "quiz") return;
    if (answered !== null) { clearInterval(timerRef.current); return; }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleAnswer(-1); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIndex, answered]); // eslint-disable-line

  // ── answer ──
  const handleAnswer = useCallback((idx) => {
    if (answered !== null) return;
    const q = questions[qIndex];
    const correct = idx === q.correct;
    setAnswered(idx);
    setStreak(s => correct ? s + 1 : 0);
    setResults(r => [...r, { q, chosen: idx, correct, time: TIMER_TOTAL - timer }]);
  }, [answered, questions, qIndex, timer]);

  // ── next ──
  const handleNext = () => {
    if (qIndex + 1 >= questions.length) { setScreen("results"); return; }
    setQIndex(i => i + 1);
    setAnswered(null);
    setTimer(TIMER_TOTAL);
  };

  const toggleCat = id => setSelectedCats(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ─────────────────────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "loading") return (
    <div className="lt-app">
      <style>{css}</style>
      <Header/>
      <div className="lt-loading">
        <div className="lt-spinner"/>
        <p>Cargando banco de preguntas…</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // LANDING
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "landing") {
    const totalQ = Object.values(bank).reduce((a, qs) => a + qs.length, 0);
    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header rightSlot={<div className="lt-header-tag">Evaluación Técnica · Ingeniería Civil</div>}/>
        <main className="lt-landing">
          {bankError && (
            <div style={{ background:"rgba(245,158,11,0.08)", border:`1px solid rgba(245,158,11,0.2)`, borderRadius:8, padding:"10px 16px", fontSize:12, color:C.warn, marginBottom:20, maxWidth:480, textAlign:"center" }}>
              ⚠️ {bankError}
            </div>
          )}
          <div className="lt-landing-badge">Plataforma EdTech · LATAM</div>
          <h1 className="lt-landing-title">
            No es un test.<br/>
            Es tu <span className="accent">diagnóstico técnico</span>.
          </h1>
          <p className="lt-landing-sub">
            Evalúate como profesional en Mecánica de Suelos, Concreto, Asfalto, Geotecnia, Laboratorio y Geomecánica. Descubre tu nivel real.
          </p>
          <button className="lt-cta-primary" onClick={() => setScreen("config")}>
            Iniciar evaluación →
          </button>
          <div className="lt-landing-stats">
            <div className="lt-stat"><div className="lt-stat-num">{totalQ}</div><div className="lt-stat-label">Preguntas técnicas</div></div>
            <div className="lt-stat"><div className="lt-stat-num">6</div><div className="lt-stat-label">Áreas de ingeniería</div></div>
            <div className="lt-stat"><div className="lt-stat-num">3</div><div className="lt-stat-label">Niveles de dificultad</div></div>
            <div className="lt-stat"><div className="lt-stat-num">LATAM</div><div className="lt-stat-label">Cobertura regional</div></div>
          </div>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // CONFIG
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "config") {
    const catsWithCount = CATEGORIES.map(cat => ({
      ...cat,
      count: bank[cat.id] ? bank[cat.id].length : 0,
    }));

    // calculate available questions for preview
    const activeCats = selectedCats.length ? selectedCats : CATEGORIES.map(c => c.id);
    let available = 0;
    activeCats.forEach(cat => {
      const qs = bank[cat] || [];
      available += difficulty === "todos" ? qs.length : qs.filter(q => q.difficulty === difficulty).length;
    });
    const maxQ = Math.min(available, 25);

    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header onBack={() => setScreen("landing")}/>
        <main className="lt-selector">
          <div className="lt-step-label">Configura tu evaluación</div>
          <h2 className="lt-selector-title">¿Qué áreas quieres evaluar?</h2>
          <p className="lt-selector-sub">Selecciona una o más áreas. Si no seleccionas ninguna, se evalúan todas.</p>

          <div className="lt-cat-grid">
            {catsWithCount.map(cat => (
              <div key={cat.id}
                className={`lt-cat-card ${selectedCats.includes(cat.id) ? "selected" : ""}`}
                onClick={() => toggleCat(cat.id)}>
                <div className="lt-cat-icon"><CatIcon id={cat.id} size={22}/></div>
                <div className="lt-cat-name">{cat.label}</div>
                <div className="lt-cat-count">{cat.count} preguntas</div>
                <div className="lt-cat-desc">{cat.desc}</div>
              </div>
            ))}
          </div>

          <div className="lt-config-row">
            <div className="lt-config-group">
              <span className="lt-config-label">Nivel de dificultad</span>
              <div className="lt-pills">
                {["todos","básico","intermedio","avanzado"].map(d => (
                  <button key={d} className={`lt-pill ${difficulty === d ? "active" : ""}`}
                    onClick={() => setDifficulty(d)}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="lt-config-group">
              <span className="lt-config-label">Número de preguntas <span style={{color:C.subtle,fontWeight:400,textTransform:"none",letterSpacing:0}}>({available} disponibles)</span></span>
              <div className="lt-pills">
                {[5,10,15,20,25].filter(n => n <= maxQ || n === 5).map(n => (
                  <button key={n} className={`lt-pill ${numQ === n ? "active" : ""}`}
                    onClick={() => setNumQ(Math.min(n, maxQ))}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="lt-cta-primary" onClick={startQuiz}
            style={{ width:"100%", justifyContent:"center" }}
            disabled={available === 0}>
            {available === 0
              ? "Sin preguntas disponibles para esta combinación"
              : `Iniciar evaluación → ${Math.min(numQ, maxQ)} preguntas`}
          </button>
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // QUIZ
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    const q = questions[qIndex];
    if (!q) return null;
    const progress = (qIndex / questions.length) * 100;
    const catInfo  = CATEGORIES.find(c => c.id === q.category);

    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header
          rightSlot={
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {streak >= 2 && <div className="lt-streak">🔥 {streak} racha</div>}
              <div className="lt-header-tag" style={{display:"flex",alignItems:"center",gap:6}}>
                <CatIcon id={q.category} size={14} color={C.subtle}/> {catInfo?.label}
              </div>
            </div>
          }
        />
        <main className="lt-quiz">
          {/* progress bar */}
          <div className="lt-quiz-topbar">
            <div className="lt-progress-wrap">
              <div className="lt-progress-bar" style={{ width:`${progress}%` }}/>
            </div>
            <div className="lt-q-counter">{qIndex + 1}/{questions.length}</div>
            <TimerRing seconds={timer} total={TIMER_TOTAL}/>
          </div>

          {/* meta tags */}
          <div className="lt-quiz-meta">
            <span className="lt-norm-tag">{q.norm}</span>
            <span className={`lt-diff-tag lt-diff-${q.difficulty}`}>{q.difficulty}</span>
            {q.subtopic && <span className="lt-subtopic">· {q.subtopic}</span>}
          </div>

          <div className="lt-question-text">{q.question}</div>

          <div className="lt-options">
            {q.options.map((opt, i) => {
              let cls = "lt-option";
              if (answered !== null) {
                if (i === q.correct)                           cls += " correct";
                else if (i === answered && i !== q.correct)   cls += " incorrect";
                else                                           cls += " dimmed";
              }
              return (
                <button key={i} className={cls}
                  onClick={() => handleAnswer(i)}
                  disabled={answered !== null}>
                  <div className="lt-option-letter">{LETTERS[i]}</div>
                  <div className="lt-option-text">{opt}</div>
                </button>
              );
            })}
          </div>

          {answered !== null && (
            <>
              <div className="lt-explanation">
                <div className="lt-explanation-label">
                  {answered === q.correct ? "✓ Correcto"
                    : answered === -1     ? "⏱ Tiempo agotado"
                    :                       "✗ Incorrecto"}
                </div>
                <div className="lt-explanation-text">{q.explanation}</div>
                {q.competency && (
                  <div className="lt-explanation-comp">
                    Competencia evaluada: {q.competency}
                  </div>
                )}
              </div>
              <button className="lt-next-btn" onClick={handleNext}>
                {qIndex + 1 >= questions.length ? "Ver resultados →" : "Siguiente pregunta →"}
              </button>
            </>
          )}
        </main>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RESULTS
  // ─────────────────────────────────────────────────────────────────────────────
  if (screen === "results") {
    const correct  = results.filter(r => r.correct).length;
    const pct      = Math.round((correct / results.length) * 100);
    const level    = getLevel(pct);
    const avgTime  = Math.round(results.reduce((a, r) => a + r.time, 0) / results.length);
    const maxStrk  = results.reduce((max, _, i, arr) => {
      let s = 0, best = 0;
      arr.slice(0, i+1).forEach(r => { s = r.correct ? s+1 : 0; best = Math.max(best,s); });
      return Math.max(max, best);
    }, 0);

    // per-category breakdown
    const catStats = {};
    results.forEach(r => {
      const cat = r.q.category || "otros";
      if (!catStats[cat]) catStats[cat] = { correct:0, total:0 };
      catStats[cat].total++;
      if (r.correct) catStats[cat].correct++;
    });
    const catBreakdown = Object.entries(catStats).map(([cat, s]) => ({
      cat,
      label: CATEGORIES.find(c => c.id === cat)?.label || cat,
      pct: Math.round((s.correct / s.total) * 100),
      correct: s.correct,
      total: s.total,
    })).sort((a, b) => b.pct - a.pct);

    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header
          rightSlot={<div className="lt-header-tag">Resultado de evaluación</div>}
        />
        <main className="lt-results">
          {/* hero */}
          <div className="lt-results-hero">
            <ScoreRing pct={pct}/>
            <h2 className="lt-results-title">{level.msg}</h2>
            <p className="lt-results-sub">
              <span className={`lt-level-badge ${level.cls}`}>{level.label}</span>
            </p>
          </div>

          {/* stats */}
          <div className="lt-result-grid">
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{ color:C.success }}>{correct}</div>
              <div className="lt-result-card-label">Correctas</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{ color:C.error }}>{results.length - correct}</div>
              <div className="lt-result-card-label">Incorrectas</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{ color:C.teal }}>{avgTime}s</div>
              <div className="lt-result-card-label">Tiempo prom.</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{ color:C.warn }}>{maxStrk}</div>
              <div className="lt-result-card-label">Racha máx.</div>
            </div>
          </div>

          {/* category breakdown */}
          {catBreakdown.length > 1 && (
            <div className="lt-breakdown">
              <div className="lt-breakdown-title">Desempeño por área</div>
              {catBreakdown.map(({ cat, label, pct: p, correct: c, total: t }) => (
                <div key={cat} className="lt-breakdown-row">
                  <div className="lt-breakdown-name" title={label}>{label}</div>
                  <div className="lt-breakdown-bar-wrap">
                    <div className="lt-breakdown-bar"
                      style={{ width:`${p}%`, background: catColor(p) }}/>
                  </div>
                  <div className="lt-breakdown-pct">{c}/{t}</div>
                </div>
              ))}
            </div>
          )}

          {/* actions */}
          {!showReview ? (
            <div className="lt-cta-bar" style={{ marginBottom:16 }}>
              <button className="lt-btn-outline" onClick={() => setShowReview(true)}>
                Ver revisión detallada
              </button>
              <button className="lt-btn-teal" onClick={() => setScreen("config")}>
                Nueva evaluación
              </button>
            </div>
          ) : (
            <>
              <div className="lt-review-list">
                {results.map((r, i) => (
                  <div key={i} className={`lt-review-item rw-${r.correct ? "correct" : r.chosen === -1 ? "timeout" : "incorrect"}`}>
                    <div className="lt-review-q">{i+1}. {r.q.question}</div>
                    <div className="lt-review-ans">
                      Tu respuesta: <span style={{ color: r.correct ? C.success : C.error }}>
                        {r.chosen === -1 ? "Sin respuesta (tiempo agotado)" : r.q.options[r.chosen]}
                      </span>
                    </div>
                    {!r.correct && r.chosen !== -1 && (
                      <div className="lt-review-ans">
                        Respuesta correcta: <span style={{ color:C.success }}>{r.q.options[r.q.correct]}</span>
                      </div>
                    )}
                    {!r.correct && r.chosen === -1 && (
                      <div className="lt-review-ans">
                        Respuesta correcta: <span style={{ color:C.success }}>{r.q.options[r.q.correct]}</span>
                      </div>
                    )}
                    <div className="lt-review-exp">{r.q.explanation}</div>
                  </div>
                ))}
              </div>
              <div className="lt-cta-bar" style={{ marginBottom:16 }}>
                <button className="lt-btn-outline" onClick={() => setShowReview(false)}>
                  Ocultar revisión
                </button>
                <button className="lt-btn-teal" onClick={() => setScreen("config")}>
                  Nueva evaluación
                </button>
              </div>
            </>
          )}

          <div className="lt-iltec-cta">
            <p>¿Quieres profundizar en los temas donde fallaste?</p>
            <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer">
              Explorar cursos técnicos en ILTEC →
            </a>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

// ─── FALLBACK BANK (minimal, only used if fetch fails) ────────────────────────
function buildFallbackBank() {
  const q = (question, options, correct, norm, explanation, difficulty, category) =>
    ({ question, options, correct, norm, explanation, difficulty, category,
       tags:[], subtopic:"general", competency:"Conocimiento técnico fundamental",
       course_hint:"Ingeniería Civil", region:"LATAM" });

  return {
    mecanica_suelos: [
      q("¿Qué norma ASTM regula el análisis granulométrico por tamizado de suelos?",
        ["ASTM D422","ASTM D1557","ASTM D4318","ASTM D2216"], 0,
        "ASTM D422", "ASTM D422 (NTP 339.128 Perú): tamizado para suelos gruesos e hidrómetro para finos.", "básico", "mecanica_suelos"),
      q("¿A cuántos golpes se define el límite líquido en la copa de Casagrande?",
        ["15 golpes","20 golpes","25 golpes","30 golpes"], 2,
        "ASTM D4318", "ASTM D4318: el LL corresponde a la humedad con la que la ranura cierra 13 mm en exactamente 25 golpes.", "básico", "mecanica_suelos"),
      q("¿Qué parámetros obtiene el ensayo edométrico (ASTM D2435)?",
        ["φ' y c'","Cv, Cc y σ'p","Cu no drenado","E y ν"], 1,
        "ASTM D2435", "El edómetro proporciona Cv (velocidad de consolidación), Cc (compresibilidad virgen) y σ'p (preconsolidación).", "intermedio", "mecanica_suelos"),
    ],
    concreto: [
      q("¿A cuántos días se evalúa la resistencia de diseño f'c según ASTM C39?",
        ["7 días","14 días","28 días","56 días"], 2,
        "ASTM C39", "ASTM C39 (NTP 339.034 Perú): f'c se verifica a 28 días de curado estándar.", "básico", "concreto"),
      q("¿Qué norma rige el ensayo de asentamiento (slump) con el cono de Abrams?",
        ["ASTM C143","ASTM C138","ASTM C231","ASTM C403"], 0,
        "ASTM C143", "ASTM C143 (NTP 339.035 Perú): cono de Abrams para medir la consistencia del concreto fresco.", "básico", "concreto"),
      q("¿Cuál es el criterio de aceptación de ACI 318 para el concreto en obra?",
        ["Todo cilindro debe superar f'c","Promedio de 3 consecutivos ≥ f'c Y ningún individual < f'c−3.5 MPa","Solo 5% puede estar bajo f'c","Promedio general > 1.10 f'c"], 1,
        "ACI 318-14", "ACI 318-14 §26.12.3: Cond.1 verifica tendencia central; Cond.2 protege contra resultados muy bajos.", "intermedio", "concreto"),
    ],
    asfalto_pavimentos: [
      q("¿Qué determina el ensayo Marshall (ASTM D6927)?",
        ["Solo la densidad de la briqueta","Estabilidad y flujo","El contenido de vacíos únicamente","La temperatura de compactación"], 1,
        "ASTM D6927", "Marshall determina estabilidad (carga máxima) y flujo (deformación), los parámetros de diseño principales.", "básico", "asfalto_pavimentos"),
      q("¿Cuál es el rango de vacíos de diseño (Va) para mezclas asfálticas en caliente?",
        ["1% a 3%","3% a 5%","5% a 8%","8% a 12%"], 1,
        "Manual de Carreteras MTC", "Va diseño = 3–5% (óptimo ≈4%). Va<3%: ahuellamiento. Va>5%: permeabilidad excesiva.", "intermedio", "asfalto_pavimentos"),
    ],
    geotecnia_cimentaciones: [
      q("¿Cuál es el factor de seguridad mínimo para taludes permanentes en análisis estático?",
        ["FS ≥ 1.0","FS ≥ 1.2","FS ≥ 1.5","FS ≥ 2.0"], 2,
        "Geotecnia general", "FS ≥ 1.5 para taludes permanentes estáticos. FS ≥ 1.3 en condición pseudoestática sísmica.", "básico", "geotecnia_cimentaciones"),
      q("¿Cuál es la diferencia entre capacidad portante última (qu) y admisible (qa)?",
        ["Son iguales con FS=1","qa = qu/FS (FS≥2.5–3.0); además deben verificarse los asentamientos","qa = qu − peso propio","qu en arcillas y qa en arenas"], 1,
        "ASTM D1143", "qa = qu/FS. La capacidad admisible también debe garantizar asentamientos tolerables para la estructura.", "básico", "geotecnia_cimentaciones"),
    ],
    laboratorio_materiales: [
      q("¿Qué mide el ensayo de abrasión Los Ángeles (ASTM C131)?",
        ["Resistencia a compresión del árido","Porcentaje de desgaste por fricción e impacto","Absorción de agua del árido","Módulo de fineza de la arena"], 1,
        "ASTM C131", "Desgaste = (masa inicial − masa retenida #12)/masa inicial × 100. Máximo 40% para concreto estructural.", "básico", "laboratorio_materiales"),
      q("¿Qué norma ISO es específica para la acreditación de laboratorios de ensayo?",
        ["ISO 9001","ISO 14001","ISO/IEC 17025","ISO 45001"], 2,
        "ISO/IEC 17025", "ISO 17025 acredita la competencia técnica de laboratorios. ISO 9001 certifica el sistema de gestión general.", "básico", "laboratorio_materiales"),
    ],
    rocas_mineria: [
      q("¿Qué ensayo mide la resistencia a la compresión uniaxial (UCS) de roca intacta?",
        ["PLT (ASTM D5731)","UCS (ASTM D7012 Método A)","Ensayo brasileño (ASTM D3967)","Triaxial de roca"], 1,
        "ASTM D7012", "ASTM D7012 Método A: probeta cilíndrica H/D=2–2.5, carga axial hasta rotura. Ensayo fundamental en geomecánica.", "básico", "rocas_mineria"),
      q("¿Qué clasificación RMR corresponde a roca de 'Buena Calidad' (Clase II)?",
        ["RMR = 20–40","RMR = 41–60","RMR = 61–80","RMR = 81–100"], 2,
        "Bieniawski 1989", "Clase II=61–80 (Buena). Clase I=81–100 (Muy buena). Clase III=41–60 (Regular). Sistema de referencia en LATAM.", "básico", "rocas_mineria"),
    ],
  };
}
