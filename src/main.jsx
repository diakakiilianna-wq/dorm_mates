import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'

// No router in this app — GitHub Pages serves index.html for any unmatched
// path via 404.html (see package.json's build script), so a plain pathname
// check is enough to give /admin its own page.
const isAdminRoute = window.location.pathname.replace(/\/+$/, '').endsWith('/admin');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminDashboard /> : <App />}
  </StrictMode>,
)
