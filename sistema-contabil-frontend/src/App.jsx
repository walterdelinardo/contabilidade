import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { Dashboard } from './Dashboard.jsx'
import { Clientes } from './Clientes.jsx'
import { Obrigacoes } from './Obrigacoes.jsx'
import { Documentos } from './Documentos.jsx'
import { Login } from './Login.jsx'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  const handleLogin = (userData) => {
    setIsAuthenticated(true)
    setCurrentUser(userData)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentUser(null)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        <Sidebar currentUser={currentUser} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/obrigacoes" element={<Obrigacoes />} />
            <Route path="/documentos" element={<Documentos />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

