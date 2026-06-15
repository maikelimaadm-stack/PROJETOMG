import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/erp-design-system-2030.css'
import '@/styles/erp-responsive.css'
import '@/styles/mg-prototype.css'
import '@/styles/erp-theme-escuro.css'
import '@/styles/erp-scrollbar.css'
import { registerEmpresasPersonalizacoesDevTools } from '@/framework/cadastro/layouts/userLayoutPreferencesSync'
import { applyErpTemaToDocument, readStoredErpTema } from '@/shared/contexts/ErpThemeContext'

registerEmpresasPersonalizacoesDevTools()
applyErpTemaToDocument(readStoredErpTema())

ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>,
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}