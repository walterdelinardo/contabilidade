import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Calendar,
  DollarSign,
  Bell
} from 'lucide-react'

export function Dashboard() {
  const [resumo, setResumo] = useState({
    clientes: { total: 0 },
    obrigacoes: { pendentes: 0, vencidas: 0, vencendo_hoje: 0 },
    documentos: { pendentes_processamento: 0 },
    mensalidades: { atrasadas: 0 },
    notificacoes: { nao_lidas: 0 }
  })

  const [tarefasHoje, setTarefasHoje] = useState([])
  const [vencimentosProximos, setVencimentosProximos] = useState([])
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    // Simular dados do dashboard
    setResumo({
      clientes: { total: 45 },
      obrigacoes: { pendentes: 23, vencidas: 5, vencendo_hoje: 3 },
      documentos: { pendentes_processamento: 8 },
      mensalidades: { atrasadas: 2 },
      notificacoes: { nao_lidas: 12 }
    })

    setTarefasHoje([
      {
        tipo: 'obrigacao',
        titulo: 'DAS - Empresa ABC Ltda',
        descricao: 'Vencimento hoje - R$ 1.250,00',
        prioridade: 'alta'
      },
      {
        tipo: 'obrigacao',
        titulo: 'INSS - Comércio XYZ',
        descricao: 'Vencimento hoje - R$ 890,00',
        prioridade: 'alta'
      },
      {
        tipo: 'mensalidade',
        titulo: 'Mensalidade - Empresa ABC Ltda',
        descricao: 'Mensalidade referente a 07/2024',
        prioridade: 'media'
      }
    ])

    setVencimentosProximos([
      {
        tipo: 'obrigacao',
        titulo: 'DARF - Empresa DEF Ltda',
        data_vencimento: '2024-07-25',
        dias_restantes: 2,
        valor: 2500.00
      },
      {
        tipo: 'obrigacao',
        titulo: 'DAS - Loja GHI',
        data_vencimento: '2024-07-26',
        dias_restantes: 3,
        valor: 750.00
      }
    ])

    setAlertas([
      {
        tipo: 'erro',
        titulo: 'Obrigações Vencidas',
        mensagem: '5 obrigação(ões) em atraso'
      },
      {
        tipo: 'aviso',
        titulo: 'Documentos Pendentes',
        mensagem: '8 documento(s) aguardando processamento'
      }
    ])
  }, [])

  const getPrioridadeColor = (prioridade) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getAlertaColor = (tipo) => {
    switch (tipo) {
      case 'erro': return 'border-red-200 bg-red-50'
      case 'aviso': return 'border-yellow-200 bg-yellow-50'
      case 'info': return 'border-blue-200 bg-blue-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema contábil</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.clientes.total}</div>
            <p className="text-xs text-muted-foreground">Clientes ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obrigações Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.obrigacoes.pendentes}</div>
            <p className="text-xs text-muted-foreground">
              {resumo.obrigacoes.vencidas} vencidas, {resumo.obrigacoes.vencendo_hoje} hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.documentos.pendentes_processamento}</div>
            <p className="text-xs text-muted-foreground">Aguardando processamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notificações</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.notificacoes.nao_lidas}</div>
            <p className="text-xs text-muted-foreground">Não lidas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tarefas de Hoje */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Tarefas de Hoje</span>
            </CardTitle>
            <CardDescription>Obrigações e tarefas com vencimento hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tarefasHoje.length > 0 ? (
                tarefasHoje.map((tarefa, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{tarefa.titulo}</div>
                      <div className="text-sm text-gray-600">{tarefa.descricao}</div>
                    </div>
                    <Badge className={getPrioridadeColor(tarefa.prioridade)}>
                      {tarefa.prioridade}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhuma tarefa para hoje!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vencimentos Próximos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Próximos Vencimentos</span>
            </CardTitle>
            <CardDescription>Obrigações vencendo nos próximos 7 dias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vencimentosProximos.map((vencimento, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{vencimento.titulo}</div>
                    <div className="text-sm text-gray-600">
                      {vencimento.valor && `R$ ${vencimento.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {vencimento.dias_restantes} dias
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(vencimento.data_vencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <span>Alertas Importantes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertas.map((alerta, index) => (
                <div key={index} className={`p-4 rounded-lg border ${getAlertaColor(alerta.tipo)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{alerta.titulo}</div>
                      <div className="text-sm text-gray-600">{alerta.mensagem}</div>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

