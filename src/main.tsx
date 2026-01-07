import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Ab ye import kaam karega kyun ke humne ThemeProvider export kar diya hai
import { ThemeProvider } from "./hooks/useTheme"; 

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Extra props hata diye hain taake TypeScript error na de */}
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)
