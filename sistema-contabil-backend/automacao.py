from flask import Blueprint, jsonify, request
from src.services.automacao_service import AutomacaoService
from datetime import datetime
import threading
import time

automacao_bp = Blueprint('automacao', __name__)
automacao_service = AutomacaoService()

@automacao_bp.route('/automacao/verificar-vencimentos', methods=['GET'])
def verificar_vencimentos():
    """Verificar vencimentos próximos"""
    try:
        dias_antecedencia = request.args.get('dias', 3, type=int)
        vencimentos = automacao_service.verificar_vencimentos_proximos(dias_antecedencia)
        
        return jsonify({
            'sucesso': True,
            'total_vencimentos': len(vencimentos),
            'dias_antecedencia': dias_antecedencia,
            'vencimentos': vencimentos
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/verificar-documentos-pendentes', methods=['GET'])
def verificar_documentos_pendentes():
    """Verificar documentos pendentes"""
    try:
        dias_limite = request.args.get('dias', 7, type=int)
        documentos = automacao_service.verificar_documentos_pendentes(dias_limite)
        
        return jsonify({
            'sucesso': True,
            'total_documentos': len(documentos),
            'dias_limite': dias_limite,
            'documentos': documentos
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/verificar-mensalidades-atrasadas', methods=['GET'])
def verificar_mensalidades_atrasadas():
    """Verificar mensalidades em atraso"""
    try:
        mensalidades = automacao_service.verificar_mensalidades_atrasadas()
        
        return jsonify({
            'sucesso': True,
            'total_atrasadas': len(mensalidades),
            'mensalidades': mensalidades
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/enviar-lembretes', methods=['POST'])
def enviar_lembretes():
    """Enviar lembretes automáticos"""
    try:
        resultado = automacao_service.processar_lembretes_automaticos()
        
        return jsonify({
            'sucesso': True,
            'resultado': resultado,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/processar-documentos', methods=['POST'])
def processar_documentos():
    """Processar documentos automaticamente"""
    try:
        resultado = automacao_service.processar_documentos_automaticamente()
        
        return jsonify({
            'sucesso': True,
            'resultado': resultado,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/gerar-relatorio', methods=['POST'])
def gerar_relatorio():
    """Gerar relatório automático"""
    try:
        data = request.json
        tipo_relatorio = data.get('tipo', 'obrigacoes')
        periodo = data.get('periodo', 'mensal')
        
        relatorio = automacao_service.gerar_relatorio_automatico(tipo_relatorio, periodo)
        
        return jsonify({
            'sucesso': True,
            'relatorio': relatorio,
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/executar-rotina-diaria', methods=['POST'])
def executar_rotina_diaria():
    """Executar rotina diária completa"""
    try:
        resultado = automacao_service.executar_rotina_diaria()
        
        return jsonify({
            'sucesso': True,
            'resultado': resultado
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/configurar-email', methods=['POST'])
def configurar_email():
    """Configurar parâmetros de email"""
    try:
        data = request.json
        
        # Em um sistema real, salvaria no banco de dados
        configuracao = {
            'smtp_host': data.get('smtp_host'),
            'smtp_port': data.get('smtp_port'),
            'smtp_user': data.get('smtp_user'),
            'smtp_password': data.get('smtp_password')
        }
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Configuração de email salva com sucesso',
            'configuracao': {k: v for k, v in configuracao.items() if k != 'smtp_password'}
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/configurar-whatsapp', methods=['POST'])
def configurar_whatsapp():
    """Configurar parâmetros do WhatsApp"""
    try:
        data = request.json
        
        # Em um sistema real, salvaria no banco de dados
        configuracao = {
            'api_url': data.get('api_url'),
            'token': data.get('token')
        }
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Configuração do WhatsApp salva com sucesso',
            'configuracao': {k: v for k, v in configuracao.items() if k != 'token'}
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/testar-email', methods=['POST'])
def testar_email():
    """Testar envio de email"""
    try:
        data = request.json
        destinatario = data.get('destinatario')
        
        if not destinatario:
            return jsonify({'erro': 'Destinatário é obrigatório'}), 400
        
        assunto = "Teste do Sistema Contábil Inteligente"
        corpo = """
        Este é um email de teste do Sistema Contábil Inteligente.
        
        Se você recebeu esta mensagem, a configuração de email está funcionando corretamente.
        
        Atenciosamente,
        Sistema Contábil Inteligente
        """
        
        sucesso = automacao_service.enviar_email(destinatario, assunto, corpo)
        
        return jsonify({
            'sucesso': sucesso,
            'mensagem': 'Email de teste enviado com sucesso' if sucesso else 'Falha ao enviar email de teste',
            'destinatario': destinatario
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/testar-whatsapp', methods=['POST'])
def testar_whatsapp():
    """Testar envio de WhatsApp"""
    try:
        data = request.json
        numero = data.get('numero')
        
        if not numero:
            return jsonify({'erro': 'Número é obrigatório'}), 400
        
        mensagem = "Teste do Sistema Contábil Inteligente. Se você recebeu esta mensagem, a integração com WhatsApp está funcionando!"
        
        sucesso = automacao_service.enviar_whatsapp(numero, mensagem)
        
        return jsonify({
            'sucesso': sucesso,
            'mensagem': 'WhatsApp de teste enviado com sucesso' if sucesso else 'Falha ao enviar WhatsApp de teste',
            'numero': numero
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

# Variável global para controlar agendamento
agendamento_ativo = False

def executar_rotina_agendada():
    """Função para executar rotina em background"""
    global agendamento_ativo
    
    while agendamento_ativo:
        try:
            print(f"[{datetime.now()}] Executando rotina automática...")
            resultado = automacao_service.executar_rotina_diaria()
            print(f"[{datetime.now()}] Rotina concluída: {resultado.get('lembretes', {}).get('emails_enviados', 0)} emails enviados")
        except Exception as e:
            print(f"[{datetime.now()}] Erro na rotina automática: {str(e)}")
        
        # Aguardar 24 horas (86400 segundos) ou 1 hora para teste (3600 segundos)
        time.sleep(3600)  # 1 hora para demonstração

@automacao_bp.route('/automacao/iniciar-agendamento', methods=['POST'])
def iniciar_agendamento():
    """Iniciar execução automática agendada"""
    try:
        global agendamento_ativo
        
        if agendamento_ativo:
            return jsonify({
                'sucesso': False,
                'mensagem': 'Agendamento já está ativo'
            })
        
        agendamento_ativo = True
        
        # Iniciar thread em background
        thread = threading.Thread(target=executar_rotina_agendada, daemon=True)
        thread.start()
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Agendamento automático iniciado',
            'intervalo': '1 hora (demonstração)'
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/parar-agendamento', methods=['POST'])
def parar_agendamento():
    """Parar execução automática agendada"""
    try:
        global agendamento_ativo
        agendamento_ativo = False
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Agendamento automático parado'
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/status-agendamento', methods=['GET'])
def status_agendamento():
    """Verificar status do agendamento"""
    try:
        global agendamento_ativo
        
        return jsonify({
            'sucesso': True,
            'agendamento_ativo': agendamento_ativo,
            'proxima_execucao': 'A cada 1 hora' if agendamento_ativo else 'Desativado'
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@automacao_bp.route('/automacao/dashboard-alertas', methods=['GET'])
def dashboard_alertas():
    """Obter alertas para o dashboard"""
    try:
        vencimentos = automacao_service.verificar_vencimentos_proximos(7)
        documentos = automacao_service.verificar_documentos_pendentes(5)
        mensalidades = automacao_service.verificar_mensalidades_atrasadas()
        
        # Contar por prioridade
        alertas_por_prioridade = {'critica': 0, 'alta': 0, 'media': 0}
        
        for item in vencimentos + documentos + mensalidades:
            prioridade = item.get('prioridade', 'media')
            alertas_por_prioridade[prioridade] += 1
        
        return jsonify({
            'sucesso': True,
            'resumo': {
                'total_alertas': len(vencimentos) + len(documentos) + len(mensalidades),
                'vencimentos_proximos': len(vencimentos),
                'documentos_pendentes': len(documentos),
                'mensalidades_atrasadas': len(mensalidades),
                'por_prioridade': alertas_por_prioridade
            },
            'detalhes': {
                'vencimentos': vencimentos[:5],  # Primeiros 5
                'documentos': documentos[:5],
                'mensalidades': mensalidades[:5]
            }
        })
        
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

