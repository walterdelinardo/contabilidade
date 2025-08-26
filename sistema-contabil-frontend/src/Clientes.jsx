import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building, 
  Mail, 
  Phone,
  MapPin
} from 'lucide-react'

export function Clientes() {
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCliente, setEditingCliente] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    regime_tributario: '',
    responsavel_legal: '',
    email: '',
    telefone: '',
    endereco: ''
  })

  useEffect(() => {
    // Simular dados de clientes
    setClientes([
      {
        id: 1,
        nome: 'Empresa ABC Ltda',
        cnpj: '12.345.678/0001-90',
        regime_tributario: 'Simples Nacional',
        responsavel_legal: 'João Silva',
        email: 'contato@empresaabc.com',
        telefone: '(11) 99999-9999',
        endereco: 'Rua das Flores, 123 - São Paulo/SP',
        ativo: true
      },
      {
        id: 2,
        nome: 'Comércio XYZ',
        cnpj: '98.765.432/0001-10',
        regime_tributario: 'Lucro Presumido',
        responsavel_legal: 'Maria Santos',
        email: 'financeiro@comercioxyz.com',
        telefone: '(11) 88888-8888',
        endereco: 'Av. Principal, 456 - São Paulo/SP',
        ativo: true
      }
    ])
  }, [])

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.cnpj.includes(searchTerm) ||
    cliente.responsavel_legal.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingCliente) {
      // Atualizar cliente existente
      setClientes(clientes.map(cliente => 
        cliente.id === editingCliente.id 
          ? { ...cliente, ...formData }
          : cliente
      ))
    } else {
      // Criar novo cliente
      const novoCliente = {
        id: Date.now(),
        ...formData,
        ativo: true
      }
      setClientes([...clientes, novoCliente])
    }
    
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      regime_tributario: '',
      responsavel_legal: '',
      email: '',
      telefone: '',
      endereco: ''
    })
    setEditingCliente(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nome: cliente.nome,
      cnpj: cliente.cnpj,
      regime_tributario: cliente.regime_tributario,
      responsavel_legal: cliente.responsavel_legal,
      email: cliente.email,
      telefone: cliente.telefone,
      endereco: cliente.endereco
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (clienteId) => {
    if (confirm('Tem certeza que deseja desativar este cliente?')) {
      setClientes(clientes.map(cliente => 
        cliente.id === clienteId 
          ? { ...cliente, ativo: false }
          : cliente
      ))
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600">Gerenciar clientes e empresas</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCliente ? 'Editar Cliente' : 'Novo Cliente'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do cliente abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="regime_tributario">Regime Tributário *</Label>
                  <Select 
                    value={formData.regime_tributario} 
                    onValueChange={(value) => setFormData({...formData, regime_tributario: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o regime" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simples Nacional">Simples Nacional</SelectItem>
                      <SelectItem value="Lucro Presumido">Lucro Presumido</SelectItem>
                      <SelectItem value="Lucro Real">Lucro Real</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="responsavel_legal">Responsável Legal</Label>
                  <Input
                    id="responsavel_legal"
                    value={formData.responsavel_legal}
                    onChange={(e) => setFormData({...formData, responsavel_legal: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCliente ? 'Atualizar' : 'Criar'} Cliente
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CNPJ ou responsável..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredClientes.length > 0 ? (
          filteredClientes.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{cliente.nome}</h3>
                        <p className="text-sm text-gray-600">{cliente.cnpj}</p>
                      </div>
                      <Badge variant="secondary">
                        {cliente.regime_tributario}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span>{cliente.responsavel_legal}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{cliente.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{cliente.telefone}</span>
                      </div>
                    </div>
                    
                    {cliente.endereco && (
                      <div className="flex items-center space-x-2 text-sm mt-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{cliente.endereco}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(cliente)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(cliente.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Tente ajustar sua busca' : 'Comece adicionando seu primeiro cliente'}
              </p>
              {!searchTerm && (
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

