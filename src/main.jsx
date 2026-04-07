import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './assets/style.css' // Đảm bảo đường dẫn này đúng với file css của bạn

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)