// client/src/main.jsx
THIS_CODE_SHOULD_CRASH_THE_BUILD_IMMEDIATELY!!!
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // This imports Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)