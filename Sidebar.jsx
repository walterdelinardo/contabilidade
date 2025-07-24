import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { 
  Calculator, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Upload, 
  LogOut,
  Menu,
  X
} from 'lucide-react'

export function Sidebar({ currentUser, onLogout }) {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      description: 'Visão geral do sistema'
    },
    {
      path: '/clientes',
      icon: Users,
      label: 'Clientes',
      description: 'Gerenciar clientes e empresas'
    },
    {
      path: '/obrigacoes',
      icon: FileText,
      label: 'Obrigações',
      description: 'Agenda e vencimentos'
    },
    {
      path: '/documentos',
      icon: Upload,
      label: 'Documentos',
      description: 'Upload e controle'
    }
  ]

  return (
    <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">Sistema Contábil</h1>
                  <p className="text-xs text-gray-500">Inteligente</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link key={item.path} to={item.path}>
                <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  {!isCollapsed && (
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="mb-3">
              <div className="text-sm font-medium text-gray-900">{currentUser?.name}</div>
              <div className="text-xs text-gray-500">{currentUser?.email}</div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={`${isCollapsed ? 'w-8 h-8 p-0' : 'w-full'} text-gray-600 hover:text-red-600`}
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

