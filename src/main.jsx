import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```
- Commit

---

**2. Crear la carpeta `public` con el banco**

- **"Add file"** → **"Create new file"**
- Nombre: `public/questions-v3.json`
- Pega todo el contenido del archivo `questions-v3.json`
- Commit

---

**Resultado esperado en tu repo:**
```
leveltest/
├── src/
│   ├── App.jsx
│   └── main.jsx
├── public/
│   └── questions-v3.json
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .gitignore
