# LEVELTEST+ by ILTEC

**Evaluación Técnica en Ingeniería Civil y Laboratorio**

Plataforma EdTech de diagnóstico de nivel técnico para profesionales y estudiantes de ingeniería civil en LATAM.

## 🚀 Deploy en Vercel (sin terminal)

1. Descomprimir este ZIP → carpeta `leveltest-project/`
2. Subir la carpeta a GitHub (drag & drop en github.com)
3. Entrar a vercel.com → Add New Project → importar el repositorio
4. Vercel detecta Vite automáticamente → Deploy
5. ✅ URL activa: `leveltest-plus.vercel.app`

## 📁 Estructura

```
leveltest-project/
├── src/
│   ├── App.jsx          ← App React completa (LEVELTEST+)
│   └── main.jsx         ← Entry point
├── public/
│   └── questions-v3.json ← Banco de 150 preguntas (6 cat × 25)
├── index.html
├── vite.config.js
├── package.json
└── vercel.json
```

## 🏗️ Banco de preguntas v3

- **150 preguntas** | 6 categorías × 25 preguntas
- **Balance:** 8 básico / 9 intermedio / 8 avanzado por categoría
- **Cobertura:** Normas ASTM + ACI + AASHTO + ISO + NTP Perú + ICONTEC Colombia + NMX México
- **Schema completo:** question, options, correct, norm, explanation, difficulty, tags, subtopic, competency, course_hint, region

### Categorías
| Key | Nombre |
|-----|--------|
| `mecanica_suelos` | Mecánica de Suelos |
| `concreto` | Concreto |
| `asfalto_pavimentos` | Asfalto y Pavimentos |
| `geotecnia_cimentaciones` | Geotecnia y Cimentaciones |
| `laboratorio_materiales` | Laboratorio de Materiales |
| `rocas_mineria` | Rocas, Minería y Geomecánica |

## 🔄 Actualizar el banco

Para agregar o modificar preguntas:
1. Editar `public/questions-v3.json`
2. Hacer commit a GitHub
3. Vercel redeploya automáticamente en ~30 segundos

## 🌐 Dominio personalizado

1. Vercel → Settings → Domains → agregar `trivia.iltec.lat`
2. En Hostinger (hpanel.hostinger.com) → DNS → CNAME:
   - Nombre: `trivia`
   - Valor: `cname.vercel-dns.com`
   - TTL: 3600

---
**ILTEC** · iltec.lat · Educación que construye
