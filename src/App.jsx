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
const SLIDE_INTERVAL = 5000;
const COUNTER_BASE = 3000; // base real evaluations
const COUNTER_KEY  = "lt_eval_count"; // localStorage key

// read/write persistent counter
const getCounter = () => {
  try { return parseInt(localStorage.getItem(COUNTER_KEY) || "0", 10); } catch { return 0; }
};
const incrementCounter = () => {
  try {
    const n = getCounter() + 1;
    localStorage.setItem(COUNTER_KEY, String(n));
    return n;
  } catch { return 0; }
};

// ─── HERO SLIDES ──────────────────────────────────────────────────────────────
// Slide 2 badge is injected dynamically with live counter in the component
const SLIDES = [
  {
    badge: "Diagnóstico técnico profesional",
    title: <>Pon a prueba tus<br/><span className="accent">conocimientos técnicos</span>.</>,
    sub: "Descubre tu nivel real en ingeniería civil y laboratorio. Avalado por normas ASTM, ACI, AASHTO, ISO y NTP — los estándares que la industria exige.",
    cta: "Iniciar evaluación →",
  },
  {
    badge: null, // ← injected: "+3,XXX profesionales evaluados"
    title: <>No es un test.<br/>Es tu <span className="accent">diagnóstico técnico</span>.</>,
    sub: "Ingenieros y técnicos de toda LATAM ya conocen su nivel real. Descubre dónde estás y qué necesitas para avanzar.",
    cta: "Evalúate ahora →",
  },
  {
    badge: "Perú · Colombia · México · Chile · Ecuador y más",
    title: <>En toda Latinoamérica,<br/><span className="accent">una sola plataforma</span>.</>,
    sub: "Mide tu competencia técnica con los mismos estándares internacionales que se aplican en proyectos reales de LATAM.",
    cta: "Comenzar evaluación →",
  },
  {
    badge: "Suelos · Concreto · Asfalto · Geotecnia · Lab · Geomecánica",
    title: <>6 áreas técnicas.<br/><span className="accent">Un solo diagnóstico</span>.</>,
    sub: "Evalúate en las disciplinas más demandadas de la ingeniería civil. Preguntas de nivel básico a avanzado con normas reales.",
    cta: "Ver mis áreas →",
  },
  {
    badge: "LEVELTEST+ EXPERT — Próximamente",
    title: <>Tu diagnóstico,<br/>tu <span className="accent">ruta de aprendizaje</span>.</>,
    sub: "Basado en tu resultado, ILTEC diseña la ruta de cursos exacta que necesitas para avanzar al siguiente nivel profesional.",
    cta: "Evalúate hoy →",
  },
];

// ─── CATÁLOGO DE CURSOS ILTEC ─────────────────────────────────────────────────
// Estructura: cada categoría tiene cursos generales y cursos por subtópico.
// El CTA inteligente usa subtopics de las preguntas falladas para recomendar
// el curso más específico disponible.

const CATALOG = {
  mecanica_suelos: {
    general: [
      { label: "Mecánica de Suelos aplicada a Cimentaciones", url: "https://iltec.lat/product/curso-mecanica-de-suelos-con-fines-de-cimentacion/" },
      { label: "Mecánica de Suelos en Obras Viales",          url: "https://iltec.lat/product/curso-mecanica-de-suelos-en-obras-viales/" },
    ],
    subtopics: {
      "consolidación":           { label: "Ensayo de Consolidación Unidimensional", url: "https://iltec.lat/product/ensayo-de-consolidacion-unidimensional-en-suelos/" },
      "consolidación y asentamientos": { label: "Ensayo de Consolidación Unidimensional", url: "https://iltec.lat/product/ensayo-de-consolidacion-unidimensional-en-suelos/" },
      "resistencia al corte":    { label: "Ensayo Triaxial en Suelos",               url: "https://iltec.lat/product/triaxial-suelos/" },
      "propiedades índice":      { label: "Mecánica de Suelos aplicada a Cimentaciones", url: "https://iltec.lat/product/curso-mecanica-de-suelos-con-fines-de-cimentacion/" },
      "clasificación":           { label: "Mecánica de Suelos en Obras Viales",      url: "https://iltec.lat/product/curso-mecanica-de-suelos-en-obras-viales/" },
      "compactación":            { label: "Mecánica de Suelos en Obras Viales",      url: "https://iltec.lat/product/curso-mecanica-de-suelos-en-obras-viales/" },
      "exploración":             { label: "Mecánica de Suelos aplicada a Cimentaciones", url: "https://iltec.lat/product/curso-mecanica-de-suelos-con-fines-de-cimentacion/" },
      "permeabilidad y flujo":   { label: "Mecánica de Suelos aplicada a Cimentaciones", url: "https://iltec.lat/product/curso-mecanica-de-suelos-con-fines-de-cimentacion/" },
      "dinámica de suelos":      { label: "Mecánica de Suelos aplicada a Cimentaciones", url: "https://iltec.lat/product/curso-mecanica-de-suelos-con-fines-de-cimentacion/" },
    },
  },

  concreto: {
    general: [
      { label: "Diseño y Control de Calidad del Concreto", url: "https://iltec.lat/product/diseno-de-concreto/" },
      { label: "Diseño de Mezclas ACI 211",                url: "https://iltec.lat/product/curso-aci211-1-22/" },
    ],
    subtopics: {
      "diseño de mezclas":       { label: "Diseño de Mezclas ACI 211",               url: "https://iltec.lat/product/curso-aci211-1-22/" },
      "control de calidad":      { label: "Control de Calidad del Concreto",         url: "https://iltec.lat/product/cccoc/" },
      "durabilidad":             { label: "Diseño de Concretos Especiales",          url: "https://iltec.lat/product/diseno-de-mezclas-de-concretos-especiales/" },
      "concreto fresco":         { label: "Diseño y Control de Calidad del Concreto",url: "https://iltec.lat/product/diseno-de-concreto/" },
      "propiedades mecánicas":   { label: "Diseño y Control de Calidad del Concreto",url: "https://iltec.lat/product/diseno-de-concreto/" },
      "materiales":              { label: "Diseño de Concretos Especiales",          url: "https://iltec.lat/product/diseno-de-mezclas-de-concretos-especiales/" },
      "evaluación de estructuras": { label: "Control de Calidad del Concreto",       url: "https://iltec.lat/product/cccoc/" },
    },
  },

  asfalto_pavimentos: {
    general: [
      { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
      { label: "Diseño Marshall",                           url: "https://iltec.lat/product/diseno-marshall/" },
    ],
    subtopics: {
      "diseño de mezclas":       { label: "Diseño Marshall",                         url: "https://iltec.lat/product/diseno-marshall/" },
      "caracterización del ligante": { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
      "especificaciones superpave": { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
      "control de calidad":      { label: "Control de Calidad en Movimiento de Tierras", url: "https://iltec.lat/product/control-calidad-movimiento-tierras/" },
      "diseño de pavimentos":    { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
      "evaluación de pavimentos": { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
      "ensayos de desempeño":    { label: "Diseño Marshall",                         url: "https://iltec.lat/product/diseno-marshall/" },
      "durabilidad":             { label: "Diseño de Pavimentos y Mezclas Asfálticas", url: "https://iltec.lat/product/diseno-de-pavimentos-y-mezclas-asfalticas/" },
    },
  },

  geotecnia_cimentaciones: {
    general: [
      { label: "Geotecnia Aplicada a Cimentaciones",        url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      { label: "Estabilidad de Taludes",                    url: "https://iltec.lat/product/estabilidad-de-taludes/" },
    ],
    subtopics: {
      "cimentaciones superficiales":  { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "cimentaciones profundas":      { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "estabilidad de taludes":       { label: "Estabilidad de Taludes en Suelos y Rocas", url: "https://iltec.lat/product/estabilidad-de-taludes/" },
      "presión lateral de tierras":   { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "exploración geotécnica":       { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "dinámica de suelos":           { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "consolidación":                { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "normativa sísmica":            { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
      "permeabilidad y flujo":        { label: "Geotecnia Aplicada a Cimentaciones", url: "https://iltec.lat/product/estudios-geotecnicos-cimentaciones/" },
    },
  },

  laboratorio_materiales: {
    general: [
      { label: "Catálogo completo TESTING+ — Ensayos ASTM", url: "https://iltec.lat/testing/" },
      { label: "Microsoft Excel aplicado a Laboratorio",    url: "https://iltec.lat/product/exlab/" },
    ],
    subtopics: {
      "áridos":                  { label: "ASTM D6913 — Granulometría",              url: "https://iltec.lat/product/astm-d6913/" },
      "propiedades índice":      { label: "ASTM D4318 — Límites de Consistencia",    url: "https://iltec.lat/product/astm-d4318/" },
      "compactación":            { label: "ASTM D1557 — Proctor Modificado",         url: "https://iltec.lat/product/astm-d1557-12/" },
      "ensayos básicos de suelos": { label: "ASTM D2216 — Contenido de Humedad",    url: "https://iltec.lat/product/d2216-19/" },
      "cemento y morteros":      { label: "ASTM C39 — Compresión del Concreto",      url: "https://iltec.lat/product/c39/" },
      "evaluación de estructuras": { label: "ASTM C39 — Compresión del Concreto",   url: "https://iltec.lat/product/c39/" },
      "control de calidad":      { label: "Catálogo TESTING+ — Ensayos ASTM",       url: "https://iltec.lat/testing/" },
      "metrología":              { label: "Microsoft Excel aplicado a Laboratorio",  url: "https://iltec.lat/product/exlab/" },
      "gestión de laboratorios": { label: "Catálogo TESTING+ — Ensayos ASTM",       url: "https://iltec.lat/testing/" },
      "acero":                   { label: "Catálogo TESTING+ — Ensayos ASTM",       url: "https://iltec.lat/testing/" },
    },
  },

  rocas_mineria: {
    general: [
      { label: "Ensayos en Rocas — Normas ASTM",            url: "https://iltec.lat/product/curso-rocas-astm/" },
      { label: "Estabilidad de Taludes en Suelos y Rocas",  url: "https://iltec.lat/product/estabilidad-de-taludes/" },
    ],
    subtopics: {
      "mecánica de rocas":       { label: "Ensayos en Rocas — Normas ASTM",          url: "https://iltec.lat/product/curso-rocas-astm/" },
      "clasificaciones geomecánicas": { label: "Ensayos en Rocas — Normas ASTM",    url: "https://iltec.lat/product/curso-rocas-astm/" },
      "taludes en roca":         { label: "Estabilidad de Taludes en Suelos y Rocas",url: "https://iltec.lat/product/estabilidad-de-taludes/" },
      "tunelería":               { label: "Ensayos en Rocas — Normas ASTM",          url: "https://iltec.lat/product/curso-rocas-astm/" },
      "criterios de rotura":     { label: "Ensayos en Rocas — Normas ASTM",          url: "https://iltec.lat/product/curso-rocas-astm/" },
      "mecánica de discontinuidades": { label: "Ensayos en Rocas — Normas ASTM",    url: "https://iltec.lat/product/curso-rocas-astm/" },
      "minería":                 { label: "Ensayos en Rocas — Normas ASTM",          url: "https://iltec.lat/product/curso-rocas-astm/" },
      "perforación y voladura":  { label: "Ensayos en Rocas — Normas ASTM",          url: "https://iltec.lat/product/curso-rocas-astm/" },
    },
  },
};

// ── Función: obtiene el curso más específico para una categoría + subtopic ──
const getCourse = (catId, subtopic) => {
  const cat = CATALOG[catId];
  if (!cat) return null;
  // buscar match exacto o parcial en subtopics
  if (subtopic) {
    const key = subtopic.toLowerCase().trim();
    const match = Object.entries(cat.subtopics).find(([k]) => key.includes(k) || k.includes(key));
    if (match) return match[1];
  }
  // fallback: primer curso general
  return cat.general[0] || null;
};

// ── Función: top 2 áreas más débiles con cursos recomendados ──
const getSmartRecos = (results) => {
  // agrupar por categoría + rastrear subtopics fallados
  const stats = {};
  results.forEach(r => {
    const cat = r.q.category || "";
    if (!stats[cat]) stats[cat] = { correct:0, total:0, failedSubtopics:[] };
    stats[cat].total++;
    if (r.correct) {
      stats[cat].correct++;
    } else {
      if (r.q.subtopic) stats[cat].failedSubtopics.push(r.q.subtopic);
    }
  });

  // ordenar por % de error descendente, filtrar >= 25% de error
  return Object.entries(stats)
    .map(([cat, s]) => ({
      cat,
      pct: Math.round((s.correct / s.total) * 100),
      failedSubtopics: s.failedSubtopics,
    }))
    .filter(({ pct }) => pct < 75)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2)
    .map(({ cat, pct, failedSubtopics }) => {
      // el subtopic más fallado
      const topSubtopic = failedSubtopics.length
        ? failedSubtopics.sort((a,b) =>
            failedSubtopics.filter(x=>x===b).length - failedSubtopics.filter(x=>x===a).length
          )[0]
        : null;
      const course = getCourse(cat, topSubtopic);
      const catLabel = CATEGORIES.find(c => c.id === cat)?.label || cat;
      return { cat, catLabel, pct, topSubtopic, course };
    })
    .filter(r => r.course !== null);
};

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const icons = {
  mecanica_suelos: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      <ellipse cx="12" cy="5" rx="7" ry="2.5"/>
      <line x1="5" y1="5" x2="5" y2="19"/>
      <line x1="19" y1="5" x2="19" y2="19"/>
      <ellipse cx="12" cy="19" rx="7" ry="2.5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <polyline points="10,2 12,0 14,2"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <polyline points="10,22 12,24 14,22"/>
    </svg>
  ),
  asfalto_pavimentos: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="15" width="20" height="3" rx="0.5"/>
      <rect x="2" y="12" width="20" height="3" rx="0.5"/>
      <rect x="2" y="9" width="20" height="3" rx="0.5"/>
      <line x1="12" y1="3" x2="12" y2="7"/>
      <polyline points="10,6 12,8 14,6"/>
    </svg>
  ),
  geotecnia_cimentaciones: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="3" width="12" height="5" rx="0.5"/>
      <line x1="9" y1="8" x2="9" y2="20"/>
      <line x1="15" y1="8" x2="15" y2="20"/>
      <polyline points="7,19 9,21 11,19"/>
      <polyline points="13,19 15,21 17,19"/>
      <line x1="2" y1="11" x2="22" y2="11" strokeDasharray="3 2"/>
    </svg>
  ),
  laboratorio_materiales: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3h6M10 3v6L6 17a2 2 0 001.8 3h8.4A2 2 0 0018 17L14 9V3"/>
      <line x1="7.5" y1="15" x2="16.5" y2="15"/>
      <circle cx="10" cy="17" r="0.5" fill={color}/>
      <circle cx="13" cy="18" r="0.5" fill={color}/>
    </svg>
  ),
  rocas_mineria: ({ size=28, color="currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="4" rx="5" ry="1.5"/>
      <line x1="7" y1="4" x2="7" y2="18"/>
      <line x1="17" y1="4" x2="17" y2="18"/>
      <ellipse cx="12" cy="18" rx="5" ry="1.5"/>
      <line x1="7" y1="8" x2="17" y2="10"/>
      <line x1="7" y1="13" x2="17" y2="11"/>
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
  body{font-family:'DM Sans',sans-serif;background:${C.bg};color:${C.white};min-height:100vh;-webkit-font-smoothing:antialiased}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:${C.bg}}
  ::-webkit-scrollbar-thumb{background:${C.subtle};border-radius:2px}

  .lt-app{min-height:100vh;display:flex;flex-direction:column}

  /* ── HEADER ── */
  .lt-header{
    display:flex;align-items:center;justify-content:space-between;
    padding:18px 40px;border-bottom:1px solid ${C.border};
    background:rgba(15,23,42,0.95);
    position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);
  }
  .lt-logo{display:flex;align-items:baseline;gap:10px;cursor:pointer;text-decoration:none}
  .lt-logo-main{font-family:'Space Grotesk',sans-serif;font-size:21px;font-weight:700;letter-spacing:-0.5px;color:${C.white};transition:color .2s}
  .lt-logo-main:hover{color:${C.teal}}
  .lt-logo-main span{color:${C.teal}}
  .lt-logo-by{font-size:11px;font-weight:500;color:${C.subtle};letter-spacing:0.5px;text-transform:uppercase;cursor:pointer;transition:color .2s}
  .lt-logo-by:hover{color:${C.teal}}
  .lt-header-tag{font-size:10px;color:${C.subtle};letter-spacing:0.6px;text-transform:uppercase;border:1px solid ${C.border};padding:4px 10px;border-radius:4px;line-height:1.4;text-align:right}

  /* ── FOOTER ── */
  .lt-footer{
    text-align:center;padding:14px 24px;
    border-top:1px solid ${C.border};
    font-size:11px;color:${C.subtle};letter-spacing:0.5px;
    display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap;
  }
  .lt-footer a{color:${C.subtle};text-decoration:none;transition:color .2s}
  .lt-footer a:hover{color:${C.teal}}
  .lt-footer-dot{width:3px;height:3px;border-radius:50%;background:${C.border}}

  /* ── LOADING ── */
  .lt-loading{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px}
  .lt-spinner{width:36px;height:36px;border:3px solid ${C.border};border-top-color:${C.teal};border-radius:50%;animation:spin .8s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .lt-loading p{font-size:13px;color:${C.subtle}}

  /* ── LANDING HERO SLIDES ── */
  .lt-landing{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 24px 40px;position:relative;overflow:hidden}
  .lt-landing::before{content:'';position:absolute;top:-200px;left:50%;transform:translateX(-50%);width:700px;height:700px;background:radial-gradient(circle,rgba(20,184,166,0.055) 0%,transparent 70%);pointer-events:none}

  .lt-hero-slide{
    display:flex;flex-direction:column;align-items:center;
    animation:slideIn .5s ease;
    max-width:760px;width:100%;text-align:center;
  }
  @keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

  .lt-landing-badge{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.22);
    border-radius:20px;padding:5px 14px;font-size:11px;font-weight:600;
    color:${C.teal};letter-spacing:1px;text-transform:uppercase;margin-bottom:24px;
  }
  .lt-landing-badge::before{content:'';width:6px;height:6px;background:${C.teal};border-radius:50%;animation:pulse 2s infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}

  .lt-landing-title{
    font-family:'Space Grotesk',sans-serif;
    font-size:clamp(32px,5.5vw,60px);font-weight:700;line-height:1.1;
    letter-spacing:-1.5px;color:${C.white};margin-bottom:18px;
  }
  .lt-landing-title .accent{color:${C.teal}}
  .lt-landing-sub{font-size:16px;color:${C.muted};max-width:480px;line-height:1.7;margin-bottom:36px}

  .lt-cta-primary{
    background:${C.teal};color:#0F172A;border:none;border-radius:8px;
    padding:15px 40px;font-family:'Space Grotesk',sans-serif;font-size:14px;
    font-weight:700;letter-spacing:0.3px;cursor:pointer;
    transition:background .2s,transform .15s;display:inline-flex;align-items:center;gap:8px;
  }
  .lt-cta-primary:hover{background:${C.tealHov};transform:translateY(-1px)}

  /* slide dots */
  .lt-slide-dots{display:flex;gap:8px;margin-top:32px;align-items:center}
  .lt-slide-dot{width:6px;height:6px;border-radius:3px;background:${C.border};cursor:pointer;transition:all .3s}
  .lt-slide-dot.active{width:20px;background:${C.teal}}

  /* stats bar */
  .lt-landing-stats{display:flex;gap:40px;margin-top:48px;padding-top:40px;border-top:1px solid ${C.border}}
  .lt-stat{text-align:center}
  .lt-stat-num{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:${C.white}}
  .lt-stat-label{font-size:11px;color:${C.subtle};margin-top:4px;text-transform:uppercase;letter-spacing:.8px}

  /* ── EMAIL CAPTURE MODAL ── */
  .lt-modal-overlay{
    position:fixed;inset:0;background:rgba(10,15,28,0.85);
    backdrop-filter:blur(8px);z-index:200;
    display:flex;align-items:center;justify-content:center;padding:24px;
    animation:fadeOverlay .25s ease;
  }
  @keyframes fadeOverlay{from{opacity:0}to{opacity:1}}
  .lt-modal{
    background:${C.surface};border:1px solid rgba(20,184,166,0.2);
    border-radius:16px;padding:40px;max-width:440px;width:100%;
    animation:modalIn .3s cubic-bezier(.34,1.56,.64,1);
    position:relative;
  }
  @keyframes modalIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}

  .lt-modal-icon{
    width:52px;height:52px;border-radius:12px;
    background:rgba(20,184,166,0.1);border:1px solid rgba(20,184,166,0.2);
    display:flex;align-items:center;justify-content:center;
    margin:0 auto 20px;
  }
  .lt-modal-title{font-family:'Space Grotesk',sans-serif;font-size:20px;font-weight:700;color:${C.white};text-align:center;margin-bottom:8px;letter-spacing:-.3px}
  .lt-modal-sub{font-size:13px;color:${C.subtle};text-align:center;line-height:1.65;margin-bottom:24px}
  .lt-modal-sub strong{color:${C.teal}}

  .lt-modal-benefits{display:flex;flex-direction:column;gap:8px;margin-bottom:24px}
  .lt-modal-benefit{display:flex;align-items:center;gap:10px;font-size:12px;color:${C.muted}}
  .lt-modal-benefit::before{content:'✓';color:${C.teal};font-weight:700;font-size:11px;flex-shrink:0}

  .lt-modal-form{display:flex;flex-direction:column;gap:10px}
  .lt-modal-input{
    background:rgba(15,23,42,0.8);border:1px solid ${C.border};border-radius:8px;
    padding:12px 16px;font-size:14px;color:${C.white};outline:none;
    font-family:'DM Sans',sans-serif;transition:border-color .2s;
  }
  .lt-modal-input::placeholder{color:${C.subtle}}
  .lt-modal-input:focus{border-color:rgba(20,184,166,0.5)}
  .lt-modal-submit{
    background:${C.teal};color:#0F172A;border:none;border-radius:8px;
    padding:13px;font-family:'Space Grotesk',sans-serif;font-size:14px;
    font-weight:700;cursor:pointer;transition:background .2s;
  }
  .lt-modal-submit:hover{background:${C.tealHov}}
  .lt-modal-submit:disabled{opacity:.6;cursor:not-allowed}
  .lt-modal-skip{
    text-align:center;margin-top:10px;font-size:11px;color:${C.subtle};
    cursor:pointer;transition:color .2s;
  }
  .lt-modal-skip:hover{color:${C.muted}}
  .lt-modal-privacy{font-size:10px;color:${C.subtle};text-align:center;margin-top:8px;line-height:1.5}

  /* ── CONFIG ── */
  .lt-selector{flex:1;padding:48px 24px 24px;max-width:920px;margin:0 auto;width:100%}
  .lt-step-label{font-size:11px;color:${C.teal};font-weight:600;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px}
  .lt-selector-title{font-family:'Space Grotesk',sans-serif;font-size:26px;font-weight:700;color:${C.white};letter-spacing:-.5px}
  .lt-selector-sub{font-size:13px;color:${C.subtle};margin-top:6px;margin-bottom:28px}

  .lt-cat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin-bottom:32px}
  .lt-cat-card{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:20px;cursor:pointer;transition:all .2s;position:relative;overflow:hidden}
  .lt-cat-card:hover{border-color:rgba(20,184,166,0.4);transform:translateY(-1px)}
  .lt-cat-card.selected{border-color:${C.teal};background:rgba(20,184,166,0.06)}
  .lt-cat-card.selected::after{content:'✓';position:absolute;top:12px;right:14px;color:${C.teal};font-size:13px;font-weight:700}
  .lt-cat-icon{width:44px;height:44px;border-radius:10px;background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.15);display:flex;align-items:center;justify-content:center;margin-bottom:14px;flex-shrink:0}
  .lt-cat-card.selected .lt-cat-icon{background:rgba(20,184,166,0.15);border-color:rgba(20,184,166,0.35)}
  .lt-cat-name{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:600;color:${C.white};margin-bottom:4px}
  .lt-cat-count{font-size:11px;color:${C.teal};margin-bottom:4px;font-weight:600}
  .lt-cat-desc{font-size:11px;color:${C.subtle};line-height:1.5}

  .lt-config-row{display:flex;gap:24px;margin-bottom:32px;flex-wrap:wrap}
  .lt-config-group{flex:1;min-width:180px}
  .lt-config-label{font-size:11px;color:${C.subtle};font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:10px;display:block}
  .lt-pills{display:flex;gap:8px;flex-wrap:wrap}
  .lt-pill{background:transparent;border:1px solid ${C.border};border-radius:6px;padding:7px 14px;font-size:12px;font-weight:500;color:${C.muted};cursor:pointer;transition:all .15s}
  .lt-pill:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}
  .lt-pill.active{background:rgba(20,184,166,0.1);border-color:${C.teal};color:${C.teal}}

  /* ── QUIZ ── */
  .lt-quiz{flex:1;padding:32px 24px;max-width:720px;margin:0 auto;width:100%}
  .lt-quiz-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;gap:14px}
  .lt-progress-wrap{flex:1;height:3px;background:${C.surface};border-radius:2px;overflow:hidden}
  .lt-progress-bar{height:100%;background:${C.teal};border-radius:2px;transition:width .4s ease}
  .lt-q-counter{font-size:12px;color:${C.subtle};font-weight:500;white-space:nowrap}
  .lt-timer-ring{position:relative;width:42px;height:42px;flex-shrink:0}
  .lt-timer-ring svg{transform:rotate(-90deg)}
  .lt-timer-text{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700}

  .lt-quiz-meta{display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap}
  .lt-norm-tag{display:inline-block;font-size:10px;font-weight:600;color:${C.teal};background:rgba(20,184,166,0.08);border:1px solid rgba(20,184,166,0.2);border-radius:4px;padding:2px 8px;letter-spacing:.5px;text-transform:uppercase}
  .lt-diff-tag{display:inline-block;font-size:10px;font-weight:600;border-radius:4px;padding:2px 8px;letter-spacing:.5px;text-transform:uppercase}
  .lt-diff-básico{background:rgba(100,116,139,0.12);color:${C.subtle}}
  .lt-diff-intermedio{background:rgba(245,158,11,0.1);color:${C.warn}}
  .lt-diff-avanzado{background:rgba(239,68,68,0.1);color:${C.error}}
  .lt-subtopic{font-size:11px;color:${C.subtle}}

  .lt-question-text{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:600;color:${C.white};line-height:1.55;letter-spacing:-.3px;margin-bottom:24px}
  .lt-options{display:flex;flex-direction:column;gap:10px}
  .lt-option{background:${C.surface};border:1px solid ${C.border};border-radius:8px;padding:15px 18px;cursor:pointer;transition:all .15s;display:flex;align-items:flex-start;gap:12px;text-align:left;width:100%}
  .lt-option:hover:not(:disabled){border-color:rgba(20,184,166,0.45);background:rgba(30,41,59,.95)}
  .lt-option.correct{border-color:${C.success};background:rgba(34,197,94,0.07)}
  .lt-option.incorrect{border-color:${C.error};background:rgba(239,68,68,0.07)}
  .lt-option.dimmed{opacity:.38}
  .lt-option-letter{width:27px;height:27px;border-radius:6px;flex-shrink:0;background:rgba(100,116,139,0.14);border:1px solid ${C.border};display:flex;align-items:center;justify-content:center;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;color:${C.subtle};transition:all .15s}
  .lt-option.correct .lt-option-letter{background:rgba(34,197,94,0.14);border-color:${C.success};color:${C.success}}
  .lt-option.incorrect .lt-option-letter{background:rgba(239,68,68,0.14);border-color:${C.error};color:${C.error}}
  .lt-option-text{font-size:13px;color:${C.muted};line-height:1.55;padding-top:3px}
  .lt-option.correct .lt-option-text,.lt-option.incorrect .lt-option-text{color:${C.white}}

  .lt-explanation{margin-top:18px;background:rgba(30,41,59,.7);border:1px solid ${C.border};border-left:3px solid ${C.teal};border-radius:8px;padding:14px 18px;animation:fadeUp .3s ease}
  @keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  .lt-explanation-label{font-size:10px;font-weight:700;color:${C.teal};letter-spacing:1px;text-transform:uppercase;margin-bottom:6px}
  .lt-explanation-text{font-size:13px;color:${C.muted};line-height:1.7}
  .lt-explanation-comp{font-size:11px;color:${C.subtle};margin-top:8px;padding-top:8px;border-top:1px solid ${C.border};font-style:italic}

  .lt-next-btn{margin-top:20px;width:100%;background:${C.teal};color:#0F172A;border:none;border-radius:8px;padding:13px;font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;cursor:pointer;transition:background .2s;letter-spacing:.3px}
  .lt-next-btn:hover{background:${C.tealHov}}

  .lt-streak{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:${C.warn};background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:20px;padding:3px 10px;animation:popIn .3s cubic-bezier(.34,1.56,.64,1)}
  @keyframes popIn{from{transform:scale(.7);opacity:0}to{transform:scale(1);opacity:1}}

  /* ── RESULTS ── */
  .lt-results{flex:1;padding:40px 24px 24px;max-width:760px;margin:0 auto;width:100%}
  .lt-results-hero{text-align:center;margin-bottom:36px}
  .lt-score-ring{width:120px;height:120px;margin:0 auto 20px;position:relative}
  .lt-score-ring svg{transform:rotate(-90deg)}
  .lt-score-number{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .lt-score-pct{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:${C.white};line-height:1}
  .lt-score-label{font-size:10px;color:${C.subtle};margin-top:2px;text-transform:uppercase;letter-spacing:.5px}
  .lt-results-title{font-family:'Space Grotesk',sans-serif;font-size:22px;font-weight:700;color:${C.white};margin-bottom:6px;letter-spacing:-.5px}
  .lt-results-sub{font-size:13px;color:${C.subtle}}

  .lt-result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:28px}
  .lt-result-card{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:16px;text-align:center}
  .lt-result-card-num{font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:700;margin-bottom:4px}
  .lt-result-card-label{font-size:10px;color:${C.subtle};text-transform:uppercase;letter-spacing:.6px}

  .lt-level-badge{display:inline-flex;align-items:center;gap:6px;border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-top:8px}
  .badge-novato{background:rgba(100,116,139,0.15);color:${C.subtle}}
  .badge-básico{background:rgba(245,158,11,0.12);color:${C.warn}}
  .badge-intermedio{background:rgba(20,184,166,0.12);color:${C.teal}}
  .badge-avanzado{background:rgba(34,197,94,0.12);color:${C.success}}
  .badge-experto{background:rgba(139,92,246,0.15);color:#a78bfa}

  .lt-breakdown{margin-bottom:24px}
  .lt-breakdown-title{font-size:11px;color:${C.subtle};font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
  .lt-breakdown-row{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .lt-breakdown-name{font-size:12px;color:${C.muted};width:180px;flex-shrink:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .lt-breakdown-bar-wrap{flex:1;height:6px;background:${C.surface};border-radius:3px;overflow:hidden}
  .lt-breakdown-bar{height:100%;border-radius:3px;transition:width 1s ease}
  .lt-breakdown-pct{font-size:11px;color:${C.subtle};width:32px;text-align:right;flex-shrink:0}

  /* smart reco cards */
  .lt-recos{margin-bottom:24px}
  .lt-recos-title{font-size:11px;color:${C.subtle};font-weight:600;letter-spacing:.8px;text-transform:uppercase;margin-bottom:12px}
  .lt-reco-card{
    background:${C.surface};
    border:1px solid rgba(20,184,166,0.18);
    border-left:3px solid ${C.teal};
    border-radius:10px;padding:18px 20px;margin-bottom:10px;
    display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;
  }
  .lt-reco-card-body{}
  .lt-reco-area{font-size:10px;font-weight:600;color:${C.teal};letter-spacing:.8px;text-transform:uppercase;margin-bottom:4px}
  .lt-reco-title{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:${C.white};margin-bottom:4px}
  .lt-reco-sub{font-size:12px;color:${C.subtle};line-height:1.5}
  .lt-reco-pill{
    display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:600;
    background:rgba(239,68,68,0.1);color:${C.error};border-radius:4px;padding:2px 7px;
    margin-bottom:4px;
  }
  .lt-reco-pill.ok{background:rgba(34,197,94,0.1);color:${C.success}}
  .lt-reco-btn{
    background:${C.teal};color:#0F172A;border:none;border-radius:7px;
    padding:9px 16px;font-family:'Space Grotesk',sans-serif;font-size:12px;
    font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;
    text-decoration:none;display:inline-flex;align-items:center;gap:5px;flex-shrink:0;
  }
  .lt-reco-btn:hover{background:${C.tealHov}}

  .lt-general-cta{
    text-align:center;padding:16px;background:rgba(20,184,166,0.04);
    border:1px solid rgba(20,184,166,0.1);border-radius:10px;margin-bottom:20px;
  }
  .lt-general-cta p{font-size:13px;color:${C.subtle};margin-bottom:8px}
  .lt-general-cta a{color:${C.teal};font-weight:600;font-size:13px;text-decoration:none}
  .lt-general-cta a:hover{text-decoration:underline}

  /* review */
  .lt-review-list{display:flex;flex-direction:column;gap:10px;margin-bottom:24px}
  .lt-review-item{background:${C.surface};border:1px solid ${C.border};border-radius:10px;padding:16px 18px}
  .lt-review-item.rw-correct{border-left:3px solid ${C.success}}
  .lt-review-item.rw-incorrect{border-left:3px solid ${C.error}}
  .lt-review-item.rw-timeout{border-left:3px solid ${C.subtle}}
  .lt-review-q{font-size:13px;font-weight:600;color:${C.white};margin-bottom:8px;line-height:1.5}
  .lt-review-ans{font-size:12px;color:${C.subtle};margin-bottom:3px}
  .lt-review-ans span{color:${C.muted}}
  .lt-review-exp{font-size:12px;color:${C.subtle};line-height:1.65;margin-top:8px;padding-top:8px;border-top:1px solid ${C.border}}

  .lt-cta-bar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}
  .lt-btn-outline{flex:1;background:transparent;border:1px solid ${C.border};border-radius:8px;padding:12px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:${C.muted};cursor:pointer;transition:all .2s;text-align:center}
  .lt-btn-outline:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}
  .lt-btn-teal{flex:1;background:${C.teal};border:none;border-radius:8px;padding:12px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;color:#0F172A;cursor:pointer;transition:background .2s;text-align:center}
  .lt-btn-teal:hover{background:${C.tealHov}}

  .lt-back{flex:unset;padding:7px 14px;font-size:11px;background:transparent;border:1px solid ${C.border};border-radius:6px;color:${C.subtle};cursor:pointer;transition:all .2s;font-family:'DM Sans',sans-serif;font-weight:500}
  .lt-back:hover{border-color:rgba(20,184,166,0.4);color:${C.teal}}

  @media(max-width:640px){
    .lt-header{padding:14px 20px}
    .lt-landing-stats{gap:20px}
    .lt-result-grid{grid-template-columns:repeat(2,1fr)}
    .lt-cat-grid{grid-template-columns:1fr}
    .lt-breakdown-name{width:110px}
    .lt-smart-cta{flex-direction:column;align-items:flex-start}
  }
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

const getLevel = pct => {
  if (pct < 40) return { label:"Novato",     cls:"badge-novato",     msg:"Nivel inicial — mucho terreno por cubrir." };
  if (pct < 60) return { label:"Básico",      cls:"badge-básico",     msg:"Nivel básico — buen punto de partida." };
  if (pct < 75) return { label:"Intermedio",  cls:"badge-intermedio", msg:"Nivel intermedio — sólido en lo fundamental." };
  if (pct < 90) return { label:"Avanzado",    cls:"badge-avanzado",   msg:"Nivel avanzado — dominio técnico real." };
  return          { label:"Experto",      cls:"badge-experto",    msg:"Nivel experto — dominio excepcional." };
};

const catColor = pct => pct >= 75 ? C.success : pct >= 50 ? C.warn : C.error;

// getWeakestCat kept as lightweight alias for backwards compat
const getWeakestCat = (results) => {
  const recos = getSmartRecos(results);
  return recos.length ? recos[0].cat : null;
};

// save lead to localStorage
const saveLead = (name, email, score, level, cats) => {
  try {
    const leads = JSON.parse(localStorage.getItem("lt_leads") || "[]");
    leads.push({ name, email, score, level, cats, date: new Date().toISOString() });
    localStorage.setItem("lt_leads", JSON.stringify(leads));
  } catch(e) {}
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function TimerRing({ seconds, total }) {
  const r = 16, circ = 2 * Math.PI * r;
  const color = seconds > 10 ? C.teal : seconds > 5 ? C.warn : C.error;
  return (
    <div className="lt-timer-ring">
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={r} fill="none" stroke={C.surface} strokeWidth="3"/>
        <circle cx="21" cy="21" r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - seconds/total)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear,stroke .5s"}}/>
      </svg>
      <div className="lt-timer-text" style={{color}}>{seconds}</div>
    </div>
  );
}

function ScoreRing({ pct }) {
  const r = 46, circ = 2 * Math.PI * r;
  const color = pct < 60 ? C.error : pct < 75 ? C.warn : C.teal;
  return (
    <div className="lt-score-ring">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke={C.surface} strokeWidth="6"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
          strokeLinecap="round" style={{transition:"stroke-dashoffset 1.2s ease"}}/>
      </svg>
      <div className="lt-score-number">
        <div className="lt-score-pct">{pct}%</div>
        <div className="lt-score-label">Score</div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="lt-footer">
      <span>Powered by <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer">ILTEC</a></span>
      <div className="lt-footer-dot"/>
      <span>Ingeniería aplicada real</span>
      <div className="lt-footer-dot"/>
      <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer">Cursos técnicos</a>
      <div className="lt-footer-dot"/>
      <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer">Membresías ILTEC</a>
    </footer>
  );
}

function Header({ onBack, rightSlot, onLogoClick }) {
  return (
    <header className="lt-header">
      <div className="lt-logo" onClick={onLogoClick} role="button" tabIndex={0}>
        <div className="lt-logo-main">
          LEVELTEST<span>+</span>
        </div>
        <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer"
          className="lt-logo-by" onClick={e => e.stopPropagation()}>
          by ILTEC
        </a>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        {rightSlot}
        {onBack && <button className="lt-back" onClick={onBack}>← Volver</button>}
      </div>
    </header>
  );
}

// ─── EMAIL CAPTURE MODAL ──────────────────────────────────────────────────────
function EmailModal({ onSubmit, onSkip, score, level }) {
  const [name,  setName]  = useState("");
  const [email, setEmail] = useState("");
  const [busy,  setBusy]  = useState(false);

  const valid = email.includes("@") && email.includes(".");

  const handleSubmit = async () => {
    if (!valid) return;
    setBusy(true);
    await new Promise(r => setTimeout(r, 600)); // simulated save
    onSubmit(name.trim(), email.trim());
  };

  return (
    <div className="lt-modal-overlay">
      <div className="lt-modal">
        <div className="lt-modal-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <div className="lt-modal-title">¡Evaluación completada!</div>
        <div className="lt-modal-sub">
          Ingresa tu email para recibir tu <strong>diagnóstico completo</strong> con recomendaciones personalizadas de cursos ILTEC.
        </div>

        <div className="lt-modal-benefits">
          <div className="lt-modal-benefit">Reporte de nivel con desglose por área</div>
          <div className="lt-modal-benefit">Recomendación de ruta de aprendizaje personalizada</div>
          <div className="lt-modal-benefit">Acceso a recursos técnicos gratuitos ILTEC</div>
          <div className="lt-modal-benefit">Información sobre membresías y cursos</div>
        </div>

        <div className="lt-modal-form">
          <input className="lt-modal-input" type="text" placeholder="Tu nombre (opcional)"
            value={name} onChange={e => setName(e.target.value)}/>
          <input className="lt-modal-input" type="email" placeholder="tu@email.com *"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === "Enter" && valid && handleSubmit()}/>
          <button className="lt-modal-submit" onClick={handleSubmit} disabled={!valid || busy}>
            {busy ? "Guardando…" : "Recibir mi diagnóstico completo →"}
          </button>
        </div>
        <div className="lt-modal-privacy">🔒 Tu información es privada. Sin spam.</div>
        <div className="lt-modal-skip" onClick={onSkip}>Continuar sin registrarme</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function LevelTestApp() {
  const [screen,       setScreen]       = useState("loading");
  const [bank,         setBank]         = useState({});
  const [bankError,    setBankError]    = useState(null);
  const [liveCount,    setLiveCount]    = useState(COUNTER_BASE);

  const [selectedCats, setSelectedCats] = useState([]);
  const [difficulty,   setDifficulty]   = useState("todos");
  const [numQ,         setNumQ]         = useState(10);

  const [questions,    setQuestions]    = useState([]);
  const [qIndex,       setQIndex]       = useState(0);
  const [answered,     setAnswered]     = useState(null);
  const [results,      setResults]      = useState([]);
  const [streak,       setStreak]       = useState(0);
  const [timer,        setTimer]        = useState(TIMER_TOTAL);
  const [showReview,   setShowReview]   = useState(false);
  const [showModal,    setShowModal]    = useState(false);
  const [leadSaved,    setLeadSaved]    = useState(false);

  // hero slide
  const [slideIdx,     setSlideIdx]     = useState(0);
  const slideRef = useRef(null);

  const timerRef = useRef(null);

  // ── load bank ──
  useEffect(() => {
    // init counter
    setLiveCount(COUNTER_BASE + getCounter());

    fetch("./questions-v3.json")
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(flat => {
        const obj = {};
        flat.forEach(q => { const c = q.category||"otros"; if(!obj[c]) obj[c]=[]; obj[c].push(q); });
        setBank(obj);
        setScreen("landing");
      })
      .catch(() => {
        setBankError("Usando banco de demostración.");
        setBank(buildFallbackBank());
        setScreen("landing");
      });
  }, []);

  // ── hero auto-rotate ──
  useEffect(() => {
    if (screen !== "landing") return;
    slideRef.current = setInterval(() => setSlideIdx(i => (i + 1) % SLIDES.length), SLIDE_INTERVAL);
    return () => clearInterval(slideRef.current);
  }, [screen]);

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
    setQuestions(picked); setQIndex(0); setAnswered(null);
    setResults([]); setStreak(0); setTimer(TIMER_TOTAL);
    setShowReview(false); setShowModal(false); setLeadSaved(false);
    setScreen("quiz");
  }, [selectedCats, difficulty, numQ, bank]);

  // ── timer ──
  useEffect(() => {
    if (screen !== "quiz") return;
    if (answered !== null) { clearInterval(timerRef.current); return; }
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => { if (t <= 1) { clearInterval(timerRef.current); handleAnswer(-1); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen, qIndex, answered]); // eslint-disable-line

  const handleAnswer = useCallback((idx) => {
    if (answered !== null) return;
    const q = questions[qIndex];
    const correct = idx === q.correct;
    setAnswered(idx);
    setStreak(s => correct ? s + 1 : 0);
    setResults(r => [...r, { q, chosen: idx, correct, time: TIMER_TOTAL - timer }]);
  }, [answered, questions, qIndex, timer]);

  const handleNext = () => {
    if (qIndex + 1 >= questions.length) {
      // increment real counter
      const newCount = incrementCounter();
      setLiveCount(COUNTER_BASE + newCount);
      setScreen("results");
      setShowModal(true);
    } else {
      setQIndex(i => i + 1); setAnswered(null); setTimer(TIMER_TOTAL);
    }
  };

  const handleModalSubmit = (name, email) => {
    const correct = results.filter(r => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    const level = getLevel(pct).label;
    const cats = [...new Set(results.map(r => r.q.category))];
    saveLead(name, email, pct, level, cats);
    setLeadSaved(true);
    setShowModal(false);
  };

  const toggleCat = id => setSelectedCats(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  // ─── LOADING ────────────────────────────────────────────────────────────────
  if (screen === "loading") return (
    <div className="lt-app">
      <style>{css}</style>
      <Header/>
      <div className="lt-loading"><div className="lt-spinner"/><p>Cargando banco de preguntas…</p></div>
      <Footer/>
    </div>
  );

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (screen === "landing") {
    const slide = SLIDES[slideIdx];
    const totalQ = Object.values(bank).reduce((a,qs) => a + qs.length, 0);
    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header
          onLogoClick={() => {}}
          rightSlot={
            <div className="lt-header-tag">
              Ingeniería Civil · Geotecnia · Laboratorio
            </div>
          }
        />
        <main className="lt-landing">
          {bankError && (
            <div style={{background:"rgba(245,158,11,0.08)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:8,padding:"10px 16px",fontSize:12,color:C.warn,marginBottom:20,maxWidth:480,textAlign:"center"}}>
              ⚠️ {bankError}
            </div>
          )}

          {/* hero slide */}
          <div className="lt-hero-slide" key={slideIdx}>
            <div className="lt-landing-badge">
              {slideIdx === 1
                ? `+${liveCount.toLocaleString()} profesionales evaluados`
                : slide.badge}
            </div>
            <h1 className="lt-landing-title">{slide.title}</h1>
            <p className="lt-landing-sub">{slide.sub}</p>
            <button className="lt-cta-primary" onClick={() => setScreen("config")}>
              {slide.cta}
            </button>
          </div>

          {/* slide dots */}
          <div className="lt-slide-dots">
            {SLIDES.map((_, i) => (
              <div key={i}
                className={`lt-slide-dot ${i === slideIdx ? "active" : ""}`}
                onClick={() => { setSlideIdx(i); clearInterval(slideRef.current); }}
              />
            ))}
          </div>

          {/* stats */}
          <div className="lt-landing-stats">
            <div className="lt-stat">
              <div className="lt-stat-num">+{liveCount.toLocaleString()}</div>
              <div className="lt-stat-label">Profesionales evaluados</div>
            </div>
            <div className="lt-stat">
              <div className="lt-stat-num">6</div>
              <div className="lt-stat-label">Áreas de ingeniería</div>
            </div>
            <div className="lt-stat">
              <div className="lt-stat-num">{totalQ}+</div>
              <div className="lt-stat-label">Preguntas técnicas</div>
            </div>
            <div className="lt-stat">
              <div className="lt-stat-num">LATAM</div>
              <div className="lt-stat-label">Cobertura regional</div>
            </div>
          </div>
        </main>
        <Footer/>
      </div>
    );
  }

  // ─── CONFIG ─────────────────────────────────────────────────────────────────
  if (screen === "config") {
    const catsWithCount = CATEGORIES.map(cat => ({ ...cat, count: bank[cat.id]?.length || 0 }));
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
                  <button key={d} className={`lt-pill ${difficulty === d ? "active" : ""}`} onClick={() => setDifficulty(d)}>
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
                    onClick={() => setNumQ(Math.min(n, maxQ))}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          <button className="lt-cta-primary" onClick={startQuiz}
            style={{width:"100%",justifyContent:"center"}} disabled={available === 0}>
            {available === 0 ? "Sin preguntas para esta combinación" : `Iniciar evaluación → ${Math.min(numQ,maxQ)} preguntas`}
          </button>
        </main>
        <Footer/>
      </div>
    );
  }

  // ─── QUIZ ───────────────────────────────────────────────────────────────────
  if (screen === "quiz") {
    const q = questions[qIndex];
    if (!q) return null;
    const progress = (qIndex / questions.length) * 100;
    const catInfo  = CATEGORIES.find(c => c.id === q.category);

    return (
      <div className="lt-app">
        <style>{css}</style>
        <Header
          onLogoClick={() => setScreen("landing")}
          rightSlot={
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {streak >= 2 && <div className="lt-streak">🔥 {streak} racha</div>}
              <div className="lt-header-tag" style={{display:"flex",alignItems:"center",gap:6}}>
                <CatIcon id={q.category} size={13} color={C.subtle}/> {catInfo?.label}
              </div>
            </div>
          }
        />
        <main className="lt-quiz">
          <div className="lt-quiz-topbar">
            <div className="lt-progress-wrap">
              <div className="lt-progress-bar" style={{width:`${progress}%`}}/>
            </div>
            <div className="lt-q-counter">{qIndex + 1}/{questions.length}</div>
            <TimerRing seconds={timer} total={TIMER_TOTAL}/>
          </div>

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
                if (i === q.correct) cls += " correct";
                else if (i === answered) cls += " incorrect";
                else cls += " dimmed";
              }
              return (
                <button key={i} className={cls} onClick={() => handleAnswer(i)} disabled={answered !== null}>
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
                  {answered === q.correct ? "✓ Correcto" : answered === -1 ? "⏱ Tiempo agotado" : "✗ Incorrecto"}
                </div>
                <div className="lt-explanation-text">{q.explanation}</div>
                {q.competency && <div className="lt-explanation-comp">Competencia evaluada: {q.competency}</div>}
              </div>
              <button className="lt-next-btn" onClick={handleNext}>
                {qIndex + 1 >= questions.length ? "Ver resultados →" : "Siguiente pregunta →"}
              </button>
            </>
          )}
        </main>
        <Footer/>
      </div>
    );
  }

  // ─── RESULTS ────────────────────────────────────────────────────────────────
  if (screen === "results") {
    const correct  = results.filter(r => r.correct).length;
    const pct      = Math.round((correct / results.length) * 100);
    const level    = getLevel(pct);
    const avgTime  = Math.round(results.reduce((a,r) => a + r.time, 0) / results.length);
    const maxStrk  = results.reduce((max, _, i, arr) => {
      let s=0, best=0;
      arr.slice(0,i+1).forEach(r => { s = r.correct ? s+1 : 0; best = Math.max(best,s); });
      return Math.max(max, best);
    }, 0);

    const catStats = {};
    results.forEach(r => {
      const cat = r.q.category || "otros";
      if (!catStats[cat]) catStats[cat] = {correct:0,total:0};
      catStats[cat].total++;
      if (r.correct) catStats[cat].correct++;
    });
    const catBreakdown = Object.entries(catStats).map(([cat,s]) => ({
      cat, label: CATEGORIES.find(c=>c.id===cat)?.label || cat,
      pct: Math.round((s.correct/s.total)*100), correct:s.correct, total:s.total,
    })).sort((a,b) => b.pct - a.pct);

    // ── smart recommendations ──
    const recos = getSmartRecos(results);

    return (
      <div className="lt-app">
        <style>{css}</style>

        {/* email modal */}
        {showModal && !leadSaved && (
          <EmailModal
            score={pct}
            level={level.label}
            onSubmit={handleModalSubmit}
            onSkip={() => setShowModal(false)}
          />
        )}

        <Header
          onLogoClick={() => setScreen("landing")}
          rightSlot={<div className="lt-header-tag">Resultado de evaluación</div>}
        />
        <main className="lt-results">
          {leadSaved && (
            <div style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)",borderRadius:8,padding:"10px 16px",fontSize:12,color:C.success,marginBottom:20,textAlign:"center"}}>
              ✓ Diagnóstico guardado — te contactaremos con tus recomendaciones personalizadas.
            </div>
          )}

          <div className="lt-results-hero">
            <ScoreRing pct={pct}/>
            <h2 className="lt-results-title">{level.msg}</h2>
            <p className="lt-results-sub">
              <span className={`lt-level-badge ${level.cls}`}>{level.label}</span>
            </p>
          </div>

          <div className="lt-result-grid">
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{color:C.success}}>{correct}</div>
              <div className="lt-result-card-label">Correctas</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{color:C.error}}>{results.length - correct}</div>
              <div className="lt-result-card-label">Incorrectas</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{color:C.teal}}>{avgTime}s</div>
              <div className="lt-result-card-label">Tiempo prom.</div>
            </div>
            <div className="lt-result-card">
              <div className="lt-result-card-num" style={{color:C.warn}}>{maxStrk}</div>
              <div className="lt-result-card-label">Racha máx.</div>
            </div>
          </div>

          {/* category breakdown */}
          {catBreakdown.length > 1 && (
            <div className="lt-breakdown">
              <div className="lt-breakdown-title">Desempeño por área</div>
              {catBreakdown.map(({cat, label, pct:p, correct:c, total:t}) => (
                <div key={cat} className="lt-breakdown-row">
                  <div className="lt-breakdown-name" title={label}>{label}</div>
                  <div className="lt-breakdown-bar-wrap">
                    <div className="lt-breakdown-bar" style={{width:`${p}%`,background:catColor(p)}}/>
                  </div>
                  <div className="lt-breakdown-pct">{c}/{t}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── smart course recommendations ── */}
          {recos.length > 0 && (
            <div className="lt-recos">
              <div className="lt-recos-title">
                📚 Cursos ILTEC recomendados para ti
              </div>
              {recos.map(({ cat, catLabel, pct: p, topSubtopic, course }) => {
                const intensity = p < 40 ? "Área crítica" : p < 60 ? "Necesitas refuerzo" : "Oportunidad de mejora";
                const subMsg = topSubtopic
                  ? `Subtema con más errores: ${topSubtopic}`
                  : `Tu puntaje en ${catLabel} fue ${p}%`;
                return (
                  <div key={cat} className="lt-reco-card">
                    <div className="lt-reco-card-body">
                      <div className="lt-reco-area">{catLabel}</div>
                      <div className="lt-reco-pill">{intensity} · {p}%</div>
                      <div className="lt-reco-title">{course.label}</div>
                      <div className="lt-reco-sub">{subMsg}</div>
                    </div>
                    <a href={course.url} target="_blank" rel="noopener noreferrer" className="lt-reco-btn">
                      Ver curso →
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* general CTA — always visible */}
          <div className="lt-general-cta">
            <p>¿Quieres ver todos los cursos y membresías disponibles?</p>
            <a href="https://iltec.lat" target="_blank" rel="noopener noreferrer">
              Explorar catálogo completo en ILTEC →
            </a>
          </div>

          <div className="lt-cta-bar">
            <button className="lt-btn-outline" onClick={() => setShowReview(!showReview)}>
              {showReview ? "Ocultar revisión" : "Ver revisión detallada"}
            </button>
            <button className="lt-btn-teal" onClick={() => setScreen("config")}>
              Nueva evaluación
            </button>
          </div>

          {showReview && (
            <div className="lt-review-list">
              {results.map((r,i) => (
                <div key={i} className={`lt-review-item rw-${r.correct ? "correct" : r.chosen===-1 ? "timeout" : "incorrect"}`}>
                  <div className="lt-review-q">{i+1}. {r.q.question}</div>
                  <div className="lt-review-ans">
                    Tu respuesta: <span style={{color:r.correct ? C.success : C.error}}>
                      {r.chosen===-1 ? "Sin respuesta (tiempo agotado)" : r.q.options[r.chosen]}
                    </span>
                  </div>
                  {!r.correct && (
                    <div className="lt-review-ans">
                      Correcta: <span style={{color:C.success}}>{r.q.options[r.q.correct]}</span>
                    </div>
                  )}
                  <div className="lt-review-exp">{r.q.explanation}</div>
                </div>
              ))}
            </div>
          )}
        </main>
        <Footer/>
      </div>
    );
  }

  return null;
}

// ─── FALLBACK BANK ────────────────────────────────────────────────────────────
function buildFallbackBank() {
  const q = (question,options,correct,norm,explanation,difficulty,category) =>
    ({question,options,correct,norm,explanation,difficulty,category,tags:[],subtopic:"general",competency:"Conocimiento técnico fundamental",course_hint:"Ingeniería Civil",region:"LATAM"});
  return {
    mecanica_suelos:[
      q("¿Qué norma regula el análisis granulométrico por tamizado?",["ASTM D422","ASTM D1557","ASTM D4318","ASTM D2216"],0,"ASTM D422","ASTM D422 (NTP 339.128 Perú): tamizado para suelos gruesos e hidrómetro para finos.","básico","mecanica_suelos"),
      q("¿A cuántos golpes se define el límite líquido?",["15","20","25","30"],2,"ASTM D4318","El LL corresponde a la humedad con la que la ranura cierra 13 mm en 25 golpes.","básico","mecanica_suelos"),
    ],
    concreto:[
      q("¿A cuántos días se evalúa f'c?",["7","14","28","56"],2,"ASTM C39","ASTM C39: f'c se verifica a 28 días de curado estándar.","básico","concreto"),
    ],
    asfalto_pavimentos:[
      q("¿Qué determina el ensayo Marshall?",["Solo densidad","Estabilidad y flujo","Solo vacíos","Temperatura"],1,"ASTM D6927","Marshall determina estabilidad y flujo, parámetros principales de diseño.","básico","asfalto_pavimentos"),
    ],
    geotecnia_cimentaciones:[
      q("¿FS mínimo para taludes permanentes?",["1.0","1.2","1.5","2.0"],2,"Geotecnia","FS ≥ 1.5 para taludes permanentes en condición estática.","básico","geotecnia_cimentaciones"),
    ],
    laboratorio_materiales:[
      q("¿Qué mide el ensayo Los Ángeles?",["Compresión","Desgaste por fricción e impacto","Absorción","Módulo de fineza"],1,"ASTM C131","Desgaste = (masa inicial − masa retenida #12)/masa inicial × 100.","básico","laboratorio_materiales"),
    ],
    rocas_mineria:[
      q("¿Qué ensayo mide la UCS de roca?",["PLT","UCS (ASTM D7012)","Ensayo brasileño","Triaxial"],1,"ASTM D7012","ASTM D7012 Método A: probeta cilíndrica H/D=2-2.5, carga axial hasta rotura.","básico","rocas_mineria"),
    ],
  };
}
