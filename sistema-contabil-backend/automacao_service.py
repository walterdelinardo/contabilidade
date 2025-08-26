import smtplib
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
import json
import os
from src.models.cliente import Cliente
from src.models.obrigacao import Obrigacao
from src.models.documento import Documento
from src.models.mensalidade import Mensalidade
from src.models.notificacao import Notificacao
from src.models.user import db
from src.services.ia_service import IAService

class AutomacaoService:
    def __init__(self):
        """Inicializar serviço de automação"""
        self.ia_service = IAService()
        self.smtp_host = os.getenv('SMTP_HOST', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_user = os.getenv('SMTP_USER', '')
        self.smtp_password = os.getenv('SMTP_PASSWORD', '')
        self.whatsapp_api_url = os.getenv('WHATSAPP_API_URL', '')
        self.whatsapp_token = os.getenv('WHATSAPP_TOKEN', '')
    
    def verificar_vencimentos_proximos(self, dias_antecedencia: int = 3) -> List[Dict]:
        """
        Verificar obrigações que vencem nos próximos dias
        """
        try:
            data_limite = date.today() + timedelta(days=dias_antecedencia)
            
            obrigacoes = Obrigacao.query.filter(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento <= data_limite,
                Obrigacao.data_vencimento >= date.today()
            ).all()
            
            alertas = []
            for obrigacao in obrigacoes:
                dias_restantes = (obrigacao.data_vencimento - date.today()).days
                
                alerta = {
                    'tipo': 'vencimento_proximo',
                    'obrigacao_id': obrigacao.id,
                    'cliente_id': obrigacao.cliente_id,
                    'cliente_nome': obrigacao.cliente.nome,
                    'obrigacao_tipo': obrigacao.tipo,
                    'obrigacao_descricao': obrigacao.descricao,
                    'data_vencimento': obrigacao.data_vencimento.isoformat(),
                    'dias_restantes': dias_restantes,
                    'valor': float(obrigacao.valor) if obrigacao.valor else None,
                    'prioridade': 'alta' if dias_restantes <= 1 else 'media'
                }
                alertas.append(alerta)
            
            return alertas
            
        except Exception as e:
            print(f"Erro ao verificar vencimentos: {str(e)}")
            return []
    
    def verificar_documentos_pendentes(self, dias_limite: int = 7) -> List[Dict]:
        """
        Verificar documentos pendentes há muito tempo
        """
        try:
            data_limite = datetime.now() - timedelta(days=dias_limite)
            
            documentos = Documento.query.filter(
                Documento.status_processamento == 'pendente',
                Documento.data_upload <= data_limite
            ).all()
            
            alertas = []
            for documento in documentos:
                dias_pendente = (datetime.now() - documento.data_upload).days
                
                alerta = {
                    'tipo': 'documento_pendente',
                    'documento_id': documento.id,
                    'cliente_id': documento.cliente_id,
                    'cliente_nome': documento.cliente.nome,
                    'nome_arquivo': documento.nome_arquivo,
                    'categoria': documento.categoria,
                    'dias_pendente': dias_pendente,
                    'data_upload': documento.data_upload.isoformat(),
                    'prioridade': 'alta' if dias_pendente > 10 else 'media'
                }
                alertas.append(alerta)
            
            return alertas
            
        except Exception as e:
            print(f"Erro ao verificar documentos pendentes: {str(e)}")
            return []
    
    def verificar_mensalidades_atrasadas(self) -> List[Dict]:
        """
        Verificar mensalidades em atraso
        """
        try:
            mensalidades = Mensalidade.query.filter(
                Mensalidade.status == 'pendente',
                Mensalidade.data_vencimento < date.today()
            ).all()
            
            alertas = []
            for mensalidade in mensalidades:
                dias_atraso = (date.today() - mensalidade.data_vencimento).days
                
                alerta = {
                    'tipo': 'mensalidade_atrasada',
                    'mensalidade_id': mensalidade.id,
                    'cliente_id': mensalidade.cliente_id,
                    'cliente_nome': mensalidade.cliente.nome,
                    'mes_referencia': mensalidade.mes_referencia,
                    'valor': float(mensalidade.valor),
                    'data_vencimento': mensalidade.data_vencimento.isoformat(),
                    'dias_atraso': dias_atraso,
                    'prioridade': 'critica' if dias_atraso > 30 else 'alta'
                }
                alertas.append(alerta)
            
            return alertas
            
        except Exception as e:
            print(f"Erro ao verificar mensalidades atrasadas: {str(e)}")
            return []
    
    def enviar_email(self, destinatario: str, assunto: str, corpo: str, html: bool = False) -> bool:
        """
        Enviar email
        """
        try:
            if not self.smtp_user or not self.smtp_password:
                print("Configurações SMTP não definidas")
                return False
            
            msg = MIMEMultipart()
            msg['From'] = self.smtp_user
            msg['To'] = destinatario
            msg['Subject'] = assunto
            
            if html:
                msg.attach(MIMEText(corpo, 'html'))
            else:
                msg.attach(MIMEText(corpo, 'plain'))
            
            server = smtplib.SMTP(self.smtp_host, self.smtp_port)
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            
            text = msg.as_string()
            server.sendmail(self.smtp_user, destinatario, text)
            server.quit()
            
            return True
            
        except Exception as e:
            print(f"Erro ao enviar email: {str(e)}")
            return False
    
    def enviar_whatsapp(self, numero: str, mensagem: str) -> bool:
        """
        Enviar mensagem via WhatsApp (simulado)
        """
        try:
            if not self.whatsapp_api_url or not self.whatsapp_token:
                print("API WhatsApp não configurada - simulando envio")
                return True  # Simular sucesso para demonstração
            
            payload = {
                'token': self.whatsapp_token,
                'to': numero,
                'body': mensagem
            }
            
            response = requests.post(self.whatsapp_api_url, json=payload)
            return response.status_code == 200
            
        except Exception as e:
            print(f"Erro ao enviar WhatsApp: {str(e)}")
            return False
    
    def processar_lembretes_automaticos(self) -> Dict:
        """
        Processar e enviar lembretes automáticos
        """
        try:
            resultados = {
                'vencimentos_processados': 0,
                'documentos_processados': 0,
                'mensalidades_processadas': 0,
                'emails_enviados': 0,
                'whatsapp_enviados': 0,
                'erros': []
            }
            
            # Verificar vencimentos próximos
            vencimentos = self.verificar_vencimentos_proximos()
            for vencimento in vencimentos:
                try:
                    cliente = Cliente.query.get(vencimento['cliente_id'])
                    if not cliente or not cliente.email:
                        continue
                    
                    # Gerar mensagem com IA
                    contexto = {
                        'cliente_nome': vencimento['cliente_nome'],
                        'obrigacao_tipo': vencimento['obrigacao_tipo'],
                        'obrigacao_descricao': vencimento['obrigacao_descricao'],
                        'data_vencimento': vencimento['data_vencimento'],
                        'valor': vencimento['valor']
                    }
                    
                    mensagem = self.ia_service.gerar_mensagem_automatica('lembrete_vencimento', contexto)
                    
                    # Enviar email
                    assunto = f"Lembrete: {vencimento['obrigacao_tipo']} vence em {vencimento['dias_restantes']} dia(s)"
                    if self.enviar_email(cliente.email, assunto, mensagem):
                        resultados['emails_enviados'] += 1
                    
                    # Enviar WhatsApp se telefone disponível
                    if cliente.telefone:
                        if self.enviar_whatsapp(cliente.telefone, mensagem):
                            resultados['whatsapp_enviados'] += 1
                    
                    # Criar notificação no sistema
                    notificacao = Notificacao(
                        cliente_id=cliente.id,
                        tipo='vencimento',
                        titulo=assunto,
                        mensagem=mensagem,
                        prioridade=vencimento['prioridade'],
                        canal='sistema'
                    )
                    db.session.add(notificacao)
                    
                    resultados['vencimentos_processados'] += 1
                    
                except Exception as e:
                    resultados['erros'].append(f"Erro ao processar vencimento {vencimento['obrigacao_id']}: {str(e)}")
            
            # Verificar documentos pendentes
            documentos_pendentes = self.verificar_documentos_pendentes()
            for documento in documentos_pendentes:
                try:
                    cliente = Cliente.query.get(documento['cliente_id'])
                    if not cliente or not cliente.email:
                        continue
                    
                    contexto = {
                        'cliente_nome': documento['cliente_nome'],
                        'documentos_pendentes': documento['nome_arquivo'],
                        'mes_referencia': documento.get('mes_referencia', ''),
                        'dias_pendente': documento['dias_pendente']
                    }
                    
                    mensagem = self.ia_service.gerar_mensagem_automatica('documento_pendente', contexto)
                    
                    assunto = f"Documento pendente de processamento há {documento['dias_pendente']} dias"
                    if self.enviar_email(cliente.email, assunto, mensagem):
                        resultados['emails_enviados'] += 1
                    
                    resultados['documentos_processados'] += 1
                    
                except Exception as e:
                    resultados['erros'].append(f"Erro ao processar documento {documento['documento_id']}: {str(e)}")
            
            # Verificar mensalidades atrasadas
            mensalidades_atrasadas = self.verificar_mensalidades_atrasadas()
            for mensalidade in mensalidades_atrasadas:
                try:
                    cliente = Cliente.query.get(mensalidade['cliente_id'])
                    if not cliente or not cliente.email:
                        continue
                    
                    contexto = {
                        'cliente_nome': mensalidade['cliente_nome'],
                        'valor_atraso': mensalidade['valor'],
                        'dias_atraso': mensalidade['dias_atraso'],
                        'mes_referencia': mensalidade['mes_referencia']
                    }
                    
                    mensagem = self.ia_service.gerar_mensagem_automatica('inadimplencia', contexto)
                    
                    assunto = f"Mensalidade em atraso - {mensalidade['dias_atraso']} dias"
                    if self.enviar_email(cliente.email, assunto, mensagem):
                        resultados['emails_enviados'] += 1
                    
                    resultados['mensalidades_processadas'] += 1
                    
                except Exception as e:
                    resultados['erros'].append(f"Erro ao processar mensalidade {mensalidade['mensalidade_id']}: {str(e)}")
            
            db.session.commit()
            return resultados
            
        except Exception as e:
            db.session.rollback()
            return {
                'erro_geral': str(e),
                'vencimentos_processados': 0,
                'documentos_processados': 0,
                'mensalidades_processadas': 0,
                'emails_enviados': 0,
                'whatsapp_enviados': 0,
                'erros': [str(e)]
            }
    
    def gerar_relatorio_automatico(self, tipo_relatorio: str, periodo: str = 'mensal') -> Dict:
        """
        Gerar relatórios automáticos
        """
        try:
            hoje = date.today()
            
            if periodo == 'mensal':
                inicio_periodo = hoje.replace(day=1)
            elif periodo == 'semanal':
                inicio_periodo = hoje - timedelta(days=7)
            else:
                inicio_periodo = hoje - timedelta(days=30)
            
            relatorio = {
                'tipo': tipo_relatorio,
                'periodo': periodo,
                'data_inicio': inicio_periodo.isoformat(),
                'data_fim': hoje.isoformat(),
                'dados': {}
            }
            
            if tipo_relatorio == 'obrigacoes':
                obrigacoes_periodo = Obrigacao.query.filter(
                    Obrigacao.data_vencimento >= inicio_periodo,
                    Obrigacao.data_vencimento <= hoje
                ).all()
                
                relatorio['dados'] = {
                    'total_obrigacoes': len(obrigacoes_periodo),
                    'pagas': len([o for o in obrigacoes_periodo if o.status == 'pago']),
                    'pendentes': len([o for o in obrigacoes_periodo if o.status == 'pendente']),
                    'valor_total': sum(float(o.valor) for o in obrigacoes_periodo if o.valor),
                    'por_tipo': {}
                }
                
                # Agrupar por tipo
                for obrigacao in obrigacoes_periodo:
                    tipo = obrigacao.tipo
                    if tipo not in relatorio['dados']['por_tipo']:
                        relatorio['dados']['por_tipo'][tipo] = {'quantidade': 0, 'valor': 0}
                    relatorio['dados']['por_tipo'][tipo]['quantidade'] += 1
                    if obrigacao.valor:
                        relatorio['dados']['por_tipo'][tipo]['valor'] += float(obrigacao.valor)
            
            elif tipo_relatorio == 'documentos':
                documentos_periodo = Documento.query.filter(
                    Documento.data_upload >= datetime.combine(inicio_periodo, datetime.min.time())
                ).all()
                
                relatorio['dados'] = {
                    'total_documentos': len(documentos_periodo),
                    'processados': len([d for d in documentos_periodo if d.status_processamento == 'processado']),
                    'pendentes': len([d for d in documentos_periodo if d.status_processamento == 'pendente']),
                    'por_categoria': {}
                }
                
                # Agrupar por categoria
                for documento in documentos_periodo:
                    categoria = documento.categoria
                    if categoria not in relatorio['dados']['por_categoria']:
                        relatorio['dados']['por_categoria'][categoria] = 0
                    relatorio['dados']['por_categoria'][categoria] += 1
            
            return relatorio
            
        except Exception as e:
            return {
                'erro': str(e),
                'tipo': tipo_relatorio,
                'periodo': periodo
            }
    
    def processar_documentos_automaticamente(self) -> Dict:
        """
        Processar documentos pendentes automaticamente com IA
        """
        try:
            documentos_pendentes = Documento.query.filter_by(status_processamento='pendente').limit(10).all()
            
            resultados = {
                'total_processados': 0,
                'sucessos': 0,
                'erros': 0,
                'detalhes': []
            }
            
            for documento in documentos_pendentes:
                try:
                    # Simular leitura do documento
                    texto_simulado = f"Documento: {documento.nome_arquivo} - Cliente: {documento.cliente.nome}"
                    
                    # Processar com IA
                    resultado_ia = self.ia_service.analisar_documento(
                        texto_simulado,
                        documento.tipo_documento,
                        documento.categoria
                    )
                    
                    # Atualizar documento
                    documento.resumo_ia = resultado_ia.get('resumo', '')
                    documento.pontos_importantes = resultado_ia.get('pontos_importantes', '')
                    documento.status_processamento = 'processado'
                    documento.data_processamento = datetime.utcnow()
                    
                    resultados['sucessos'] += 1
                    resultados['detalhes'].append({
                        'documento_id': documento.id,
                        'nome_arquivo': documento.nome_arquivo,
                        'status': 'sucesso'
                    })
                    
                except Exception as e:
                    resultados['erros'] += 1
                    resultados['detalhes'].append({
                        'documento_id': documento.id,
                        'nome_arquivo': documento.nome_arquivo,
                        'status': 'erro',
                        'erro': str(e)
                    })
                
                resultados['total_processados'] += 1
            
            db.session.commit()
            return resultados
            
        except Exception as e:
            db.session.rollback()
            return {
                'erro_geral': str(e),
                'total_processados': 0,
                'sucessos': 0,
                'erros': 0,
                'detalhes': []
            }
    
    def executar_rotina_diaria(self) -> Dict:
        """
        Executar rotina diária de automação
        """
        try:
            resultado_geral = {
                'data_execucao': datetime.now().isoformat(),
                'lembretes': {},
                'documentos': {},
                'relatorios': {},
                'tempo_execucao': 0
            }
            
            inicio = datetime.now()
            
            # Processar lembretes
            resultado_geral['lembretes'] = self.processar_lembretes_automaticos()
            
            # Processar documentos
            resultado_geral['documentos'] = self.processar_documentos_automaticamente()
            
            # Gerar relatórios
            resultado_geral['relatorios'] = {
                'obrigacoes': self.gerar_relatorio_automatico('obrigacoes', 'mensal'),
                'documentos': self.gerar_relatorio_automatico('documentos', 'mensal')
            }
            
            fim = datetime.now()
            resultado_geral['tempo_execucao'] = (fim - inicio).total_seconds()
            
            return resultado_geral
            
        except Exception as e:
            return {
                'erro_geral': str(e),
                'data_execucao': datetime.now().isoformat()
            }

