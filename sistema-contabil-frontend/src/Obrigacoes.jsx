import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Plus, 
  Search, 
  Edit, 
  Check, 
  AlertTriangle,
  Calendar,
  DollarSign,
  Clock,
  Filter
} from 'lucide-react'

export function Obrigacoes() {
  const [obrigacoes, setObrigacoes] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todas')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingObrigacao, setEditingObrigacao] = useState(null)
  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo: '',
    descricao: '',
    data_vencimento: '',
    valor: '',
    mes_referencia: '',
    codigo_receita: '',
    observacoes: ''
  })

  useEffect(() => {
    // Simular dados de clientes
    setClientes([
      { id: 1, nome: 'Empresa ABC Ltda' },
      { id: 2, nome: 'Comércio XYZ' },
      { id: 3, nome: 'Loja DEF' }
    ])

    // Simular dados de obrigações
    setObrigacoes([
      {
        id: 1,
        cliente_id: 1,
        cliente_nome: 'Empresa ABC Ltda',
        tipo: 'DAS',
        descricao: 'DAS - Simples Nacional',
        data_vencimento: '2024-07-23',
        valor: 1250.00,
        status: 'pendente',
        mes_referencia: '2024-06',
        codigo_receita: '6912',
        observacoes: ''
      },
      {
        id: 2,
        cliente_id: 2,
        cliente_nome: 'Comércio XYZ',
        tipo: 'INSS',
        descricao: 'INSS - Contribuição Previdenciária',
        data_vencimento: '2024-07-23',
        valor: 890.00,
        status: 'pendente',
        mes_referencia: '2024-06',
        codigo_receita: '2100',
        observacoes: ''
      },
      {
        id: 3,
        cliente_id: 1,
        cliente_nome: 'Empresa ABC Ltda',
        tipo: 'DARF',
        descricao: 'IRPJ - Imposto de Renda Pessoa Jurídica',
        data_vencimento: '2024-07-25',
        valor: 2500.00,
        status: 'pendente',
        mes_referencia: '2024-06',
        codigo_receita: '2089',
        observacoes: ''
      },
      {
        id: 4,
        cliente_id: 3,
        cliente_nome: 'Loja DEF',
        tipo: 'DAS',
        descricao: 'DAS - Simples Nacional',
        data_vencimento: '2024-07-20',
        valor: 750.00,
        status: 'pago',
        mes_referencia: '2024-06',
        codigo_receita: '6912',
        observacoes: 'Pago via PIX'
      }
    ])
  }, [])

  const filteredObrigacoes = obrigacoes.filter(obrigacao => {
    const matchesSearch = obrigacao.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obrigacao.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         obrigacao.descricao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'todas' || obrigacao.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status, dataVencimento) => {
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    
    if (status === 'pago') return 'bg-green-100 text-green-800'
    if (vencimento < hoje) return 'bg-red-100 text-red-800'
    if (vencimento.toDateString() === hoje.toDateString()) return 'bg-yellow-100 text-yellow-800'
    return 'bg-blue-100 text-blue-800'
  }

  const getStatusText = (status, dataVencimento) => {
    const hoje = new Date()
    const vencimento = new Date(dataVencimento)
    
    if (status === 'pago') return 'Pago'
    if (vencimento < hoje) return 'Vencido'
    if (vencimento.toDateString() === hoje.toDateString()) return 'Vence Hoje'
    return 'Pendente'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const clienteSelecionado = clientes.find(c => c.id === parseInt(formData.cliente_id))
    
    if (editingObrigacao) {
      // Atualizar obrigação existente
      setObrigacoes(obrigacoes.map(obrigacao => 
        obrigacao.id === editingObrigacao.id 
          ? { 
              ...obrigacao, 
              ...formData,
              cliente_id: parseInt(formData.cliente_id),
              cliente_nome: clienteSelecionado?.nome || '',
              valor: parseFloat(formData.valor) || 0
            }
          : obrigacao
      ))
    } else {
      // Criar nova obrigação
      const novaObrigacao = {
        id: Date.now(),
        ...formData,
        cliente_id: parseInt(formData.cliente_id),
        cliente_nome: clienteSelecionado?.nome || '',
        valor: parseFloat(formData.valor) || 0,
        status: 'pendente'
      }
      setObrigacoes([...obrigacoes, novaObrigacao])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      cliente_id: '',
      tipo: '',
      descricao: '',
      data_vencimento: '',
      valor: '',
      mes_referencia: '',
      codigo_receita: '',
      observacoes: ''
    })
    setEditingObrigacao(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (obrigacao) => {
    setEditingObrigacao(obrigacao)
    setFormData({
      cliente_id: obrigacao.cliente_id.toString(),
      tipo: obrigacao.tipo,
      descricao: obrigacao.descricao,
      data_vencimento: obrigacao.data_vencimento,
      valor: obrigacao.valor.toString(),
      mes_referencia: obrigacao.mes_referencia,
      codigo_receita: obrigacao.codigo_receita,
      observacoes: obrigacao.observacoes
    })
    setIsDialogOpen(true)
  }

  const handleMarkAsPaid = (obrigacaoId) => {
    setObrigacoes(obrigacoes.map(obrigacao => 
      obrigacao.id === obrigacaoId 
        ? { ...obrigacao, status: 'pago' }
        : obrigacao
    ))
  }

  const getObrigacoesPorStatus = () => {
    const hoje = new Date()
    const pendentes = obrigacoes.filter(o => o.status === 'pendente')
    const vencidas = pendentes.filter(o => new Date(o.data_vencimento) < hoje)
    const vencendoHoje = pendentes.filter(o => new Date(o.data_vencimento).toDateString() === hoje.toDateString())
    const pagas = obrigacoes.filter(o => o.status === 'pago')
    
    return { pendentes, vencidas, vencendoHoje, pagas }
  }

  const stats = getObrigacoesPorStatus()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obrigações</h1>
          <p className="text-gray-600">Agenda e controle de vencimentos</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Obrigação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingObrigacao ? 'Editar Obrigação' : 'Nova Obrigação'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações da obrigação abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select 
                    value={formData.cliente_id} 
                    onValueChange={(value) => setFormData({...formData, cliente_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientes.map(cliente => (
                        <SelectItem key={cliente.id} value={cliente.id.toString()}>
                          {cliente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select 
                    value={formData.tipo} 
                    onValueChange={(value) => setFormData({...formData, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAS">DAS</SelectItem>
                      <SelectItem value="DARF">DARF</SelectItem>
                      <SelectItem value="INSS">INSS</SelectItem>
                      <SelectItem value="FGTS">FGTS</SelectItem>
                      <SelectItem value="PIS">PIS</SelectItem>
                      <SelectItem value="COFINS">COFINS</SelectItem>
                      <SelectItem value="IRPJ">IRPJ</SelectItem>
                      <SelectItem value="CSLL">CSLL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_vencimento">Data de Vencimento *</Label>
                  <Input
                    id="data_vencimento"
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    placeholder="0,00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mes_referencia">Mês de Referência *</Label>
                  <Input
                    id="mes_referencia"
                    type="month"
                    value={formData.mes_referencia}
                    onChange={(e) => setFormData({...formData, mes_referencia: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="codigo_receita">Código da Receita</Label>
                  <Input
                    id="codigo_receita"
                    value={formData.codigo_receita}
                    onChange={(e) => setFormData({...formData, codigo_receita: e.target.value})}
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingObrigacao ? 'Atualizar' : 'Criar'} Obrigação
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pendentes.length}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.vencidas.length}</div>
                <div className="text-sm text-gray-600">Vencidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.vencendoHoje.length}</div>
                <div className="text-sm text-gray-600">Vencendo Hoje</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pagas.length}</div>
                <div className="text-sm text-gray-600">Pagas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por cliente, tipo ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="pago">Pagas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Obrigações */}
      <div className="grid gap-4">
        {filteredObrigacoes.length > 0 ? (
          filteredObrigacoes.map((obrigacao) => (
            <Card key={obrigacao.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{obrigacao.tipo} - {obrigacao.cliente_nome}</h3>
                        <p className="text-sm text-gray-600">{obrigacao.descricao}</p>
                      </div>
                      <Badge className={getStatusColor(obrigacao.status, obrigacao.data_vencimento)}>
                        {getStatusText(obrigacao.status, obrigacao.data_vencimento)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(obrigacao.data_vencimento).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span>R$ {obrigacao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>Ref: {obrigacao.mes_referencia}</span>
                      </div>
                      {obrigacao.codigo_receita && (
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Código:</span>
                          <span>{obrigacao.codigo_receita}</span>
                        </div>
                      )}
                    </div>
                    
                    {obrigacao.observacoes && (
                      <div className="mt-2 text-sm text-gray-600">
                        <strong>Obs:</strong> {obrigacao.observacoes}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {obrigacao.status === 'pendente' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkAsPaid(obrigacao.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(obrigacao)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma obrigação encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'todas' ? 'Tente ajustar seus filtros' : 'Comece adicionando sua primeira obrigação'}
              </p>
              {!searchTerm && statusFilter === 'todas' && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Obrigação
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

