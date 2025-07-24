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
  Upload, 
  FileText, 
  Search, 
  Download, 
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  File,
  Image,
  FileSpreadsheet
} from 'lucide-react'

export function Documentos() {
  const [documentos, setDocumentos] = useState([])
  const [clientes, setClientes] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoriaFilter, setCategoriaFilter] = useState('todas')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadData, setUploadData] = useState({
    cliente_id: '',
    categoria: '',
    mes_referencia: ''
  })

  const categorias = [
    'folha_pagamento',
    'nota_fiscal',
    'extrato_bancario',
    'comprovante_pagamento',
    'declaracao',
    'balancete',
    'dre',
    'outros'
  ]

  useEffect(() => {
    // Simular dados de clientes
    setClientes([
      { id: 1, nome: 'Empresa ABC Ltda' },
      { id: 2, nome: 'Comércio XYZ' },
      { id: 3, nome: 'Loja DEF' }
    ])

    // Simular dados de documentos
    setDocumentos([
      {
        id: 1,
        cliente_id: 1,
        cliente_nome: 'Empresa ABC Ltda',
        nome_arquivo: 'folha_pagamento_junho_2024.pdf',
        tipo_documento: 'PDF',
        categoria: 'folha_pagamento',
        tamanho_arquivo: 2048576,
        mes_referencia: '2024-06',
        resumo_ia: 'Folha de pagamento com 15 funcionários, total de R$ 45.000,00 em salários.',
        pontos_importantes: 'Aumento salarial de 5% aplicado. Novo funcionário contratado.',
        status_processamento: 'processado',
        data_upload: '2024-07-20T10:30:00Z',
        data_processamento: '2024-07-20T10:35:00Z'
      },
      {
        id: 2,
        cliente_id: 2,
        cliente_nome: 'Comércio XYZ',
        nome_arquivo: 'notas_fiscais_junho_2024.xml',
        tipo_documento: 'XML',
        categoria: 'nota_fiscal',
        tamanho_arquivo: 512000,
        mes_referencia: '2024-06',
        resumo_ia: null,
        pontos_importantes: null,
        status_processamento: 'pendente',
        data_upload: '2024-07-23T08:15:00Z',
        data_processamento: null
      },
      {
        id: 3,
        cliente_id: 1,
        cliente_nome: 'Empresa ABC Ltda',
        nome_arquivo: 'extrato_bancario_junho_2024.pdf',
        tipo_documento: 'PDF',
        categoria: 'extrato_bancario',
        tamanho_arquivo: 1024000,
        mes_referencia: '2024-06',
        resumo_ia: 'Movimentação bancária com saldo final de R$ 125.000,00. 45 transações no período.',
        pontos_importantes: 'Grande depósito de R$ 50.000,00 no dia 15. Verificar origem.',
        status_processamento: 'processado',
        data_upload: '2024-07-21T14:20:00Z',
        data_processamento: '2024-07-21T14:25:00Z'
      }
    ])
  }, [])

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         documento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategoria = categoriaFilter === 'todas' || documento.categoria === categoriaFilter
    const matchesStatus = statusFilter === 'todos' || documento.status_processamento === statusFilter
    
    return matchesSearch && matchesCategoria && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'processado': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'erro': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processado': return <CheckCircle className="w-4 h-4" />
      case 'pendente': return <Clock className="w-4 h-4" />
      case 'erro': return <AlertCircle className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getFileIcon = (tipo) => {
    switch (tipo.toLowerCase()) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-600" />
      case 'xml': return <File className="w-5 h-5 text-blue-600" />
      case 'xlsx':
      case 'xls': return <FileSpreadsheet className="w-5 h-5 text-green-600" />
      case 'jpg':
      case 'jpeg':
      case 'png': return <Image className="w-5 h-5 text-purple-600" />
      default: return <File className="w-5 h-5 text-gray-600" />
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatCategoryName = (categoria) => {
    const names = {
      'folha_pagamento': 'Folha de Pagamento',
      'nota_fiscal': 'Nota Fiscal',
      'extrato_bancario': 'Extrato Bancário',
      'comprovante_pagamento': 'Comprovante de Pagamento',
      'declaracao': 'Declaração',
      'balancete': 'Balancete',
      'dre': 'DRE',
      'outros': 'Outros'
    }
    return names[categoria] || categoria
  }

  const handleUpload = (e) => {
    e.preventDefault()
    
    // Simular upload de arquivo
    const novoDocumento = {
      id: Date.now(),
      cliente_id: parseInt(uploadData.cliente_id),
      cliente_nome: clientes.find(c => c.id === parseInt(uploadData.cliente_id))?.nome || '',
      nome_arquivo: 'documento_exemplo.pdf',
      tipo_documento: 'PDF',
      categoria: uploadData.categoria,
      tamanho_arquivo: 1024000,
      mes_referencia: uploadData.mes_referencia,
      resumo_ia: null,
      pontos_importantes: null,
      status_processamento: 'pendente',
      data_upload: new Date().toISOString(),
      data_processamento: null
    }
    
    setDocumentos([novoDocumento, ...documentos])
    setUploadData({ cliente_id: '', categoria: '', mes_referencia: '' })
    setIsUploadDialogOpen(false)
  }

  const handleProcessDocument = (documentoId) => {
    setDocumentos(documentos.map(doc => 
      doc.id === documentoId 
        ? { 
            ...doc, 
            status_processamento: 'processado',
            data_processamento: new Date().toISOString(),
            resumo_ia: 'Documento processado automaticamente pela IA.',
            pontos_importantes: 'Processamento concluído com sucesso.'
          }
        : doc
    ))
  }

  const getDocumentosPorStatus = () => {
    const processados = documentos.filter(d => d.status_processamento === 'processado').length
    const pendentes = documentos.filter(d => d.status_processamento === 'pendente').length
    const erros = documentos.filter(d => d.status_processamento === 'erro').length
    
    return { processados, pendentes, erros, total: documentos.length }
  }

  const stats = getDocumentosPorStatus()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
          <p className="text-gray-600">Upload e controle de documentos</p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
              <DialogDescription>
                Selecione o arquivo e preencha as informações abaixo.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select 
                  value={uploadData.cliente_id} 
                  onValueChange={(value) => setUploadData({...uploadData, cliente_id: value})}
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
                <Label htmlFor="categoria">Categoria *</Label>
                <Select 
                  value={uploadData.categoria} 
                  onValueChange={(value) => setUploadData({...uploadData, categoria: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {formatCategoryName(categoria)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="mes_referencia">Mês de Referência *</Label>
                <Input
                  id="mes_referencia"
                  type="month"
                  value={uploadData.mes_referencia}
                  onChange={(e) => setUploadData({...uploadData, mes_referencia: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="arquivo">Arquivo *</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,.xml,.xlsx,.xls,.jpg,.jpeg,.png,.txt"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, XML, Excel, Imagens, TXT
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Fazer Upload
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
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.processados}</div>
                <div className="text-sm text-gray-600">Processados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.pendentes}</div>
                <div className="text-sm text-gray-600">Pendentes</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold">{stats.erros}</div>
                <div className="text-sm text-gray-600">Com Erro</div>
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
                placeholder="Buscar por cliente, arquivo ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {categorias.map(categoria => (
                  <SelectItem key={categoria} value={categoria}>
                    {formatCategoryName(categoria)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="processado">Processados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="erro">Com Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <div className="grid gap-4">
        {filteredDocumentos.length > 0 ? (
          filteredDocumentos.map((documento) => (
            <Card key={documento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {getFileIcon(documento.tipo_documento)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{documento.nome_arquivo}</h3>
                        <p className="text-sm text-gray-600">{documento.cliente_nome}</p>
                      </div>
                      <Badge className={getStatusColor(documento.status_processamento)}>
                        {getStatusIcon(documento.status_processamento)}
                        <span className="ml-1 capitalize">{documento.status_processamento}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div>
                        <span className="text-gray-500">Categoria:</span>
                        <div className="font-medium">{formatCategoryName(documento.categoria)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Tamanho:</span>
                        <div className="font-medium">{formatFileSize(documento.tamanho_arquivo)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Referência:</span>
                        <div className="font-medium">{documento.mes_referencia}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Upload:</span>
                        <div className="font-medium">
                          {new Date(documento.data_upload).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    
                    {documento.resumo_ia && (
                      <div className="bg-blue-50 p-3 rounded-lg mb-3">
                        <div className="text-sm font-medium text-blue-900 mb-1">Resumo da IA:</div>
                        <div className="text-sm text-blue-800">{documento.resumo_ia}</div>
                      </div>
                    )}
                    
                    {documento.pontos_importantes && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-yellow-900 mb-1">Pontos Importantes:</div>
                        <div className="text-sm text-yellow-800">{documento.pontos_importantes}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    {documento.status_processamento === 'pendente' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProcessDocument(documento.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Processar
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoriaFilter !== 'todas' || statusFilter !== 'todos' 
                  ? 'Tente ajustar seus filtros' 
                  : 'Comece fazendo upload do seu primeiro documento'}
              </p>
              {!searchTerm && categoriaFilter === 'todas' && statusFilter === 'todos' && (
                <Button onClick={() => setIsUploadDialogOpen(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

