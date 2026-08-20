import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes'
import './index.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <RouterProvider router={router} />
    </ErrorBoundary>
  </React.StrictMode>,
)