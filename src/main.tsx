// src/main.tsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Yeh line zaroori hai (path check kar lena apne project ke hisab se)
// src/main.tsx
import { ThemeProvider } from "./components/theme-provider" 
" 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* App ko ThemeProvider ke andar band karo */}
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
