import React from 'react'
import ReactDOM from 'react-dom/client' // 👈 Ye '/client' bohot zaroori hai React 18 me
import App from './App.jsx'
import './index.css'

// Naye tarike se root create karna padta hai
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
