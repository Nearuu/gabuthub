import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import './index.css'
import { Toaster } from 'react-hot-toast'

// Auto-cleanser for corrupted legacy browser localStorage cache
try {
  const version = localStorage.getItem('gabuthub_v');
  if (version !== '3.0') {
    localStorage.clear();
    localStorage.setItem('gabuthub_v', '3.0');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      username: "admin",
      email: "admin@gabuthub.com",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Admin",
      bio: "Administrator Resmi GabutHub Indonesia 🚀",
      badges: [{ id: 1, name: "Drakor Addict" }, { id: 2, name: "Movie Master" }]
    }));
    localStorage.setItem('token', 'cloud-admin-token-2026');
  }
} catch (e) {}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
    <RouterProvider router={router} />
  </React.StrictMode>,
)