import { useState, useEffect } from 'react'
import axios from 'axios' // Certifique-se de ter o axios instalado (npm install axios)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Importe Textarea se for usar para exibir texto completo do OCR ou editar
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

// URL base da sua API. ALtere se o seu back-end estiver em outra porta/domínio.
const API_BASE_URL = 'http://localhost:5000/api/documentos'; // Exemplo para Flask na porta 5000 com prefixo /api/documentos

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
    mes_referencia: '',
    file: null // Adicionado estado para o arquivo selecionado
  })
  const [uploadStatusMessage, setUploadStatusMessage] = useState(''); // Mensagem de status do upload
  
  // Ref para o input de arquivo, para poder limpá-lo após o upload
  const fileInputRef = React.useRef(null); // Importe React no topo se não estiver

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

  // Função para buscar os documentos do back-end
  const fetchDocumentos = async () => {
    try {
      // Ajuste esta rota se necessário para buscar todos os documentos
      const response = await axios.get(`${API_BASE_URL}/`); // Você precisará criar uma rota GET /api/documentos/ no seu back-end
      setDocumentos(response.data.documentos); // Assumindo que a API retorna { documentos: [...] }
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      // setUploadStatusMessage('Erro ao carregar documentos.'); // Poderia exibir um erro aqui
    }
  };

  // Função para buscar clientes do back-end (se você tiver uma API de clientes)
  const fetchClientes = async () => {
    try {
      // Ajuste esta rota para sua API de clientes
      const response = await axios.get('http://localhost:5000/api/clientes'); // Exemplo: rota para buscar clientes
      setClientes(response.data.clientes); // Assumindo que a API retorna { clientes: [...] }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      // Fallback para clientes simulados se a API não estiver pronta
      setClientes([
        { id: 1, nome: 'Empresa ABC Ltda' },
        { id: 2, nome: 'Comércio XYZ' },
        { id: 3, nome: 'Loja DEF' }
      ]);
    }
  };


  useEffect(() => {
    fetchClientes(); // Carrega clientes
    fetchDocumentos(); // Carrega documentos existentes
  }, []);

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = (documento.cliente_nome && documento.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (documento.nome_arquivo && documento.nome_arquivo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            (documento.categoria && documento.categoria.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategoria = categoriaFilter === 'todas' || documento.categoria === categoriaFilter
    const matchesStatus = statusFilter === 'todos' || documento.status_processamento === statusFilter
    
    return matchesSearch && matchesCategoria && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'processado': return 'bg-green-100 text-green-800'
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'pendente_revisao': return 'bg-yellow-100 text-yellow-800' // Novo status para OCR
      case 'erro': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processado': return <CheckCircle className="w-4 h-4" />
      case 'pendente': 
      case 'pendente_revisao': return <Clock className="w-4 h-4" /> // Ícone para pendente de revisão
      case 'erro': return <AlertCircle className="w-4 h-4" />
      default: return <File className="w-4 h-4" />
    }
  }

  const getFileIcon = (tipo) => {
    if (!tipo) return <File className="w-5 h-5 text-gray-600" />; // Adiciona verificação para tipo indefinido
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
      'outros': 'Outros',
      'Sem Categoria': 'Sem Categoria' // Adicionado para a sugestão da IA
    }
    return names[categoria] || categoria
  }

  const handleFileSelect = (event) => {
    setUploadData(prev => ({ ...prev, file: event.target.files[0] }));
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    
    if (!uploadData.file) {
      setUploadStatusMessage('Por favor, selecione um arquivo.');
      return;
    }
    if (!uploadData.cliente_id) {
      setUploadStatusMessage('Por favor, selecione o cliente.');
      return;
    }
    if (!uploadData.categoria) {
      setUploadStatusMessage('Por favor, selecione a categoria.');
      return;
    }
    if (!uploadData.mes_referencia) {
      setUploadStatusMessage('Por favor, selecione o mês de referência.');
      return;
    }

    setUploadStatusMessage('Enviando e processando documento...');
    const formData = new FormData();
    formData.append('documento', uploadData.file);
    formData.append('cliente_id', uploadData.cliente_id);
    formData.append('categoria', uploadData.categoria); // Categoria predefinida, pode ser sobrescrita pela IA
    formData.append('mes_referencia', uploadData.mes_referencia);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload-documento`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadStatusMessage('Upload e processamento concluídos: ' + response.data.message);
      
      // Adiciona o novo documento retornado pelo back-end à lista
      // O back-end deve retornar todos os campos do modelo Documento, incluindo os processados pela IA
      const newDoc = {
        id: response.data.documento_id, // ID retornado do banco de dados
        cliente_id: parseInt(uploadData.cliente_id),
        cliente_nome: clientes.find(c => c.id === parseInt(uploadData.cliente_id))?.nome || 'N/A',
        nome_arquivo: response.data.filename, // Nome do arquivo seguro
        tipo_documento: response.data.filename.split('.').pop().toUpperCase(), // Ex: PDF, JPG
        categoria: response.data.suggested_category || uploadData.categoria, // Preferência para sugestão da IA
        tamanho_arquivo: response.data.tamanho_arquivo, // Tamanho do arquivo do back-end
        mes_referencia: uploadData.mes_referencia,
        resumo_ia: response.data.preview_text, // Usando preview_text como resumo inicial
        pontos_importantes: response.data.pontos_importantes, // Se o back-end retornar
        status_processamento: response.data.status_processamento,
        data_upload: new Date().toISOString(),
        data_processamento: response.data.data_processamento || new Date().toISOString(),
        // Novos campos extraídos pelo OCR/IA
        extracted_value: response.data.extracted_value,
        extracted_date: response.data.extracted_date,
      };

      setDocumentos(prevDocs => [newDoc, ...prevDocs]);
      
      // Limpa o formulário e fecha o modal
      setUploadData({ cliente_id: '', categoria: '', mes_referencia: '', file: null });
      if (fileInputRef.current) {
          fileInputRef.current.value = ''; // Limpa o input de arquivo
      }
      setIsUploadDialogOpen(false);
      setUploadStatusMessage(''); // Limpa a mensagem de status
      fetchDocumentos(); // Opcional: recarregar todos os documentos para garantir consistência
    } catch (error) {
      setUploadStatusMessage('Erro no upload: ' + (error.response?.data?.message || error.message));
      console.error('Erro no upload:', error);
    }
  };

  const handleProcessDocument = async (documentoId) => {
    // Esta função será para um "processamento manual" ou "aprovação"
    // Uma vez que o OCR já fez o "processamento" inicial.
    // Agora seria mais um "Aprovar Lançamento" ou "Corrigir e Aprovar".
    // Por enquanto, vamos simular a atualização do status
    try {
        // Enviar requisição para o back-end para mudar o status para 'processado'
        // Ex: await axios.put(`${API_BASE_URL}/${documentoId}/aprovar`);
        
        setDocuments(documents.map(doc => 
            doc.id === documentoId 
              ? { 
                  ...doc, 
                  status_processamento: 'processado',
                  data_processamento: new Date().toISOString(),
                  // Estes campos já viriam do back-end se fossem corrigidos/finalizados
                  // resumo_ia: doc.resumo_ia || 'Documento processado automaticamente pela IA.',
                  // pontos_importantes: doc.pontos_importantes || 'Processamento concluído com sucesso.'
                }
              : doc
        ))
        alert(`Documento ${documentoId} aprovado!`);
    } catch (error) {
        console.error('Erro ao aprovar documento:', error);
        alert('Falha ao aprovar documento.');
    }
  }

  const getDocumentosPorStatus = () => {
    const processados = documentos.filter(d => d.status_processamento === 'processado').length
    const pendentes = documentos.filter(d => d.status_processamento === 'pendente' || d.status_processamento === 'pendente_revisao').length
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
            
            <form onSubmit={handleUploadSubmit} className="space-y-4"> {/* Alterado de handleUpload para handleUploadSubmit */}
              <div>
                <Label htmlFor="cliente_id">Cliente *</Label>
                <Select 
                  value={uploadData.cliente_id} 
                  onValueChange={(value) => setUploadData(prev => ({...prev, cliente_id: value}))}
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
                  onValueChange={(value) => setUploadData(prev => ({...prev, categoria: value}))}
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
                  onChange={(e) => setUploadData(prev => ({...prev, mes_referencia: e.target.value}))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="arquivo">Arquivo *</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf,.xml,.xlsx,.xls,.jpg,.jpeg,.png,.txt"
                  onChange={handleFileSelect} // Lidar com a seleção do arquivo
                  ref={fileInputRef} // Adiciona a ref ao input de arquivo
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
              {uploadStatusMessage && (
                  <p className="text-sm mt-2" style={{ color: uploadStatusMessage.startsWith('Erro') ? 'red' : 'green' }}>
                      {uploadStatusMessage}
                  </p>
              )}
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
                <SelectItem value="pendente_revisao">Pendentes de Revisão</SelectItem> {/* Novo item de filtro */}
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
                        <span className="ml-1 capitalize">{formatCategoryName(documento.status_processamento)}</span> {/* Usa formatCategoryName para exibir "Pendentes de Revisão" */}
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
                      {/* Novos campos do OCR/IA */}
                      {documento.extracted_value !== undefined && ( // Verificar se a propriedade existe
                        <div>
                          <span className="text-gray-500">Valor Extraído:</span>
                          <div className="font-medium">R$ {documento.extracted_value ? documento.extracted_value.toFixed(2) : 'N/A'}</div>
                        </div>
                      )}
                      {documento.extracted_date && (
                        <div>
                          <span className="text-gray-500">Data Extraída:</span>
                          <div className="font-medium">{new Date(documento.extracted_date).toLocaleDateString('pt-BR') || 'N/A'}</div>
                        </div>
                      )}
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
                    {documento.status_processamento === 'pendente_revisao' && ( // Ação para documentos pendentes de revisão
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleProcessDocument(documento.id)} // Renomeado para aprovar/revisar
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Revisar / Aprovar
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
