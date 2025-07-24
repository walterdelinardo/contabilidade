from flask import Blueprint, jsonify, request
from src.services.ia_service import IAService
from src.models.documento import Documento
from src.models.cliente import Cliente
from src.models.user import db
from datetime import datetime
import os

ia_bp = Blueprint('ia', __name__)
ia_service = IAService()

@ia_bp.route('/ia/processar-documento/<int:documento_id>', methods=['POST'])
def processar_documento(documento_id):
    """Processar documento com IA"""
    try:
        documento = Documento.query.get_or_404(documento_id)
        
        # Simular leitura do arquivo (em produção, usar bibliotecas como PyPDF2, python-docx, etc.)
        texto_simulado = f"""
        Documento: {documento.nome_arquivo}
        Cliente: {documento.cliente.nome}
        Categoria: {documento.categoria}
        Mês: {documento.mes_referencia}
        
        [Conteúdo simulado do documento para demonstração]
        Este é um exemplo de texto extraído do documento para análise pela IA.
        """
        
        # Processar com IA
        resultado = ia_service.analisar_documento(
            texto_simulado,
            documento.tipo_documento,
            documento.categoria
        )
        
        # Atualizar documento com resultados
        documento.resumo_ia = resultado.get('resumo', '')
        documento.pontos_importantes = resultado.get('pontos_importantes', '')
        documento.status_processamento = 'processado'
        documento.data_processamento = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'documento': documento.to_dict(),
            'analise': resultado
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/sugerir-obrigacoes/<int:cliente_id>', methods=['POST'])
def sugerir_obrigacoes(cliente_id):
    """Sugerir obrigações para um cliente"""
    try:
        cliente = Cliente.query.get_or_404(cliente_id)
        data = request.json
        mes_referencia = data.get('mes_referencia', datetime.now().strftime('%Y-%m'))
        
        cliente_info = {
            'nome': cliente.nome,
            'cnpj': cliente.cnpj,
            'regime_tributario': cliente.regime_tributario
        }
        
        sugestoes = ia_service.gerar_sugestoes_obrigacoes(cliente_info, mes_referencia)
        
        return jsonify({
            'sucesso': True,
            'cliente': cliente.to_dict(),
            'mes_referencia': mes_referencia,
            'sugestoes': sugestoes
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/gerar-mensagem', methods=['POST'])
def gerar_mensagem():
    """Gerar mensagem automática"""
    try:
        data = request.json
        tipo_mensagem = data.get('tipo_mensagem')
        contexto = data.get('contexto', {})
        
        if not tipo_mensagem:
            return jsonify({'erro': 'Tipo de mensagem é obrigatório'}), 400
        
        mensagem = ia_service.gerar_mensagem_automatica(tipo_mensagem, contexto)
        
        return jsonify({
            'sucesso': True,
            'tipo_mensagem': tipo_mensagem,
            'mensagem': mensagem,
            'contexto': contexto
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/assistente', methods=['POST'])
def assistente_contador():
    """Assistente IA para responder perguntas do contador"""
    try:
        data = request.json
        pergunta = data.get('pergunta')
        contexto = data.get('contexto')
        
        if not pergunta:
            return jsonify({'erro': 'Pergunta é obrigatória'}), 400
        
        resposta = ia_service.responder_pergunta_contador(pergunta, contexto)
        
        return jsonify({
            'sucesso': True,
            'pergunta': pergunta,
            'resposta': resposta,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/analisar-legislacao', methods=['POST'])
def analisar_legislacao():
    """Analisar alterações na legislação"""
    try:
        data = request.json
        texto_legislacao = data.get('texto_legislacao')
        
        if not texto_legislacao:
            return jsonify({'erro': 'Texto da legislação é obrigatório'}), 400
        
        resultado = ia_service.resumir_alteracoes_legislacao(texto_legislacao)
        
        return jsonify({
            'sucesso': True,
            'analise': resultado,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/processar-lote-documentos', methods=['POST'])
def processar_lote_documentos():
    """Processar múltiplos documentos em lote"""
    try:
        data = request.json
        documento_ids = data.get('documento_ids', [])
        
        if not documento_ids:
            return jsonify({'erro': 'Lista de IDs de documentos é obrigatória'}), 400
        
        resultados = []
        
        for doc_id in documento_ids:
            try:
                documento = Documento.query.get(doc_id)
                if not documento:
                    resultados.append({
                        'documento_id': doc_id,
                        'sucesso': False,
                        'erro': 'Documento não encontrado'
                    })
                    continue
                
                # Simular processamento
                texto_simulado = f"Documento: {documento.nome_arquivo} - Cliente: {documento.cliente.nome}"
                
                resultado_ia = ia_service.analisar_documento(
                    texto_simulado,
                    documento.tipo_documento,
                    documento.categoria
                )
                
                # Atualizar documento
                documento.resumo_ia = resultado_ia.get('resumo', '')
                documento.pontos_importantes = resultado_ia.get('pontos_importantes', '')
                documento.status_processamento = 'processado'
                documento.data_processamento = datetime.utcnow()
                
                resultados.append({
                    'documento_id': doc_id,
                    'sucesso': True,
                    'analise': resultado_ia
                })
                
            except Exception as e:
                resultados.append({
                    'documento_id': doc_id,
                    'sucesso': False,
                    'erro': str(e)
                })
        
        db.session.commit()
        
        return jsonify({
            'sucesso': True,
            'total_processados': len([r for r in resultados if r['sucesso']]),
            'total_erros': len([r for r in resultados if not r['sucesso']]),
            'resultados': resultados
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/dashboard-insights', methods=['GET'])
def dashboard_insights():
    """Gerar insights inteligentes para o dashboard"""
    try:
        # Obter dados para análise
        total_clientes = Cliente.query.filter_by(ativo=True).count()
        documentos_pendentes = Documento.query.filter_by(status_processamento='pendente').count()
        
        # Gerar insights com IA
        contexto = {
            'total_clientes': total_clientes,
            'documentos_pendentes': documentos_pendentes,
            'data_atual': datetime.now().strftime('%Y-%m-%d')
        }
        
        pergunta = f"""
        Com base nos dados do escritório contábil:
        - {total_clientes} clientes ativos
        - {documentos_pendentes} documentos pendentes de processamento
        
        Gere 3 insights importantes e 2 recomendações de ação para o contador.
        """
        
        resposta = ia_service.responder_pergunta_contador(pergunta, contexto)
        
        return jsonify({
            'sucesso': True,
            'insights': resposta,
            'dados_base': contexto,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@ia_bp.route('/ia/status', methods=['GET'])
def status_ia():
    """Verificar status do serviço de IA"""
    try:
        # Teste simples para verificar se a IA está funcionando
        teste = ia_service.responder_pergunta_contador("Teste de conectividade")
        
        return jsonify({
            'sucesso': True,
            'status': 'ativo',
            'api_configurada': bool(os.getenv('OPENAI_API_KEY')),
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'sucesso': False,
            'status': 'erro',
            'erro': str(e),
            'api_configurada': bool(os.getenv('OPENAI_API_KEY')),
            'timestamp': datetime.utcnow().isoformat()
        }), 500

