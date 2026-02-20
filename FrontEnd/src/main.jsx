import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ bootstrap grid + utility classes (row/col/d-flex/etc)
import "bootstrap/dist/css/bootstrap.min.css";

// ✅ fontawesome icons (fa fa-facebook ...)
import "@fortawesome/fontawesome-free/css/all.min.css";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
