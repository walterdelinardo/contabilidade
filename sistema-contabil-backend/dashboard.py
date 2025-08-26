from flask import Blueprint, jsonify, request
from src.models.cliente import Cliente
from src.models.obrigacao import Obrigacao
from src.models.documento import Documento
from src.models.mensalidade import Mensalidade
from src.models.notificacao import Notificacao
from src.models.user import db
from datetime import datetime, date, timedelta
from sqlalchemy import and_, or_, func, extract

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/resumo', methods=['GET'])
def get_resumo_dashboard():
    """Obter resumo geral para o dashboard"""
    try:
        hoje = date.today()
        inicio_mes = hoje.replace(day=1)
        
        # Estatísticas de clientes
        total_clientes = Cliente.query.filter_by(ativo=True).count()
        
        # Estatísticas de obrigações
        obrigacoes_pendentes = Obrigacao.query.filter_by(status='pendente').count()
        obrigacoes_vencidas = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento < hoje
            )
        ).count()
        obrigacoes_vencendo_hoje = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento == hoje
            )
        ).count()
        
        # Documentos pendentes de processamento
        documentos_pendentes = Documento.query.filter_by(status_processamento='pendente').count()
        
        # Mensalidades em atraso
        mensalidades_atrasadas = Mensalidade.query.filter(
            and_(
                Mensalidade.status == 'pendente',
                Mensalidade.data_vencimento < hoje
            )
        ).count()
        
        # Notificações não lidas
        notificacoes_nao_lidas = Notificacao.query.filter_by(status='pendente').count()
        
        return jsonify({
            'clientes': {
                'total': total_clientes
            },
            'obrigacoes': {
                'pendentes': obrigacoes_pendentes,
                'vencidas': obrigacoes_vencidas,
                'vencendo_hoje': obrigacoes_vencendo_hoje
            },
            'documentos': {
                'pendentes_processamento': documentos_pendentes
            },
            'mensalidades': {
                'atrasadas': mensalidades_atrasadas
            },
            'notificacoes': {
                'nao_lidas': notificacoes_nao_lidas
            }
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@dashboard_bp.route('/dashboard/tarefas-hoje', methods=['GET'])
def get_tarefas_hoje():
    """Obter tarefas do dia atual"""
    try:
        hoje = date.today()
        
        # Obrigações vencendo hoje
        obrigacoes_hoje = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento == hoje
            )
        ).all()
        
        # Mensalidades vencendo hoje
        mensalidades_hoje = Mensalidade.query.filter(
            and_(
                Mensalidade.status == 'pendente',
                Mensalidade.data_vencimento == hoje
            )
        ).all()
        
        tarefas = []
        
        # Adicionar obrigações
        for obrigacao in obrigacoes_hoje:
            tarefas.append({
                'tipo': 'obrigacao',
                'id': obrigacao.id,
                'titulo': f"{obrigacao.tipo} - {obrigacao.cliente.nome}",
                'descricao': obrigacao.descricao,
                'prioridade': 'alta',
                'data_vencimento': obrigacao.data_vencimento.isoformat(),
                'cliente_nome': obrigacao.cliente.nome
            })
        
        # Adicionar mensalidades
        for mensalidade in mensalidades_hoje:
            tarefas.append({
                'tipo': 'mensalidade',
                'id': mensalidade.id,
                'titulo': f"Mensalidade - {mensalidade.cliente.nome}",
                'descricao': f"Mensalidade referente a {mensalidade.mes_referencia}",
                'prioridade': 'media',
                'data_vencimento': mensalidade.data_vencimento.isoformat(),
                'cliente_nome': mensalidade.cliente.nome,
                'valor': float(mensalidade.valor)
            })
        
        # Ordenar por prioridade
        prioridade_ordem = {'alta': 1, 'media': 2, 'baixa': 3}
        tarefas.sort(key=lambda x: prioridade_ordem.get(x['prioridade'], 3))
        
        return jsonify(tarefas)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@dashboard_bp.route('/dashboard/vencimentos-proximos', methods=['GET'])
def get_vencimentos_proximos():
    """Obter vencimentos dos próximos dias"""
    try:
        dias = int(request.args.get('dias', 7))
        hoje = date.today()
        data_limite = hoje + timedelta(days=dias)
        
        # Obrigações próximas
        obrigacoes = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento > hoje,
                Obrigacao.data_vencimento <= data_limite
            )
        ).order_by(Obrigacao.data_vencimento.asc()).all()
        
        # Mensalidades próximas
        mensalidades = Mensalidade.query.filter(
            and_(
                Mensalidade.status == 'pendente',
                Mensalidade.data_vencimento > hoje,
                Mensalidade.data_vencimento <= data_limite
            )
        ).order_by(Mensalidade.data_vencimento.asc()).all()
        
        vencimentos = []
        
        # Adicionar obrigações
        for obrigacao in obrigacoes:
            dias_restantes = (obrigacao.data_vencimento - hoje).days
            vencimentos.append({
                'tipo': 'obrigacao',
                'id': obrigacao.id,
                'titulo': f"{obrigacao.tipo} - {obrigacao.cliente.nome}",
                'data_vencimento': obrigacao.data_vencimento.isoformat(),
                'dias_restantes': dias_restantes,
                'cliente_nome': obrigacao.cliente.nome,
                'valor': float(obrigacao.valor) if obrigacao.valor else None
            })
        
        # Adicionar mensalidades
        for mensalidade in mensalidades:
            dias_restantes = (mensalidade.data_vencimento - hoje).days
            vencimentos.append({
                'tipo': 'mensalidade',
                'id': mensalidade.id,
                'titulo': f"Mensalidade - {mensalidade.cliente.nome}",
                'data_vencimento': mensalidade.data_vencimento.isoformat(),
                'dias_restantes': dias_restantes,
                'cliente_nome': mensalidade.cliente.nome,
                'valor': float(mensalidade.valor)
            })
        
        # Ordenar por data de vencimento
        vencimentos.sort(key=lambda x: x['data_vencimento'])
        
        return jsonify(vencimentos)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@dashboard_bp.route('/dashboard/estatisticas-mensais', methods=['GET'])
def get_estatisticas_mensais():
    """Obter estatísticas do mês atual"""
    try:
        hoje = date.today()
        inicio_mes = hoje.replace(day=1)
        
        # Obrigações do mês
        obrigacoes_mes = Obrigacao.query.filter(
            and_(
                Obrigacao.data_vencimento >= inicio_mes,
                Obrigacao.data_vencimento <= hoje
            )
        ).all()
        
        obrigacoes_pagas = [o for o in obrigacoes_mes if o.status == 'pago']
        obrigacoes_pendentes = [o for o in obrigacoes_mes if o.status == 'pendente']
        obrigacoes_vencidas = [o for o in obrigacoes_pendentes if o.data_vencimento < hoje]
        
        # Documentos do mês
        documentos_mes = Documento.query.filter(
            Documento.data_upload >= datetime.combine(inicio_mes, datetime.min.time())
        ).count()
        
        documentos_processados = Documento.query.filter(
            and_(
                Documento.data_upload >= datetime.combine(inicio_mes, datetime.min.time()),
                Documento.status_processamento == 'processado'
            )
        ).count()
        
        # Mensalidades do mês
        mes_referencia = hoje.strftime('%Y-%m')
        mensalidades_mes = Mensalidade.query.filter_by(mes_referencia=mes_referencia).all()
        mensalidades_pagas = [m for m in mensalidades_mes if m.status == 'pago']
        
        valor_total_mensalidades = sum(float(m.valor) for m in mensalidades_mes)
        valor_recebido_mensalidades = sum(float(m.valor) for m in mensalidades_pagas)
        
        return jsonify({
            'obrigacoes': {
                'total': len(obrigacoes_mes),
                'pagas': len(obrigacoes_pagas),
                'pendentes': len(obrigacoes_pendentes),
                'vencidas': len(obrigacoes_vencidas),
                'taxa_cumprimento': round((len(obrigacoes_pagas) / len(obrigacoes_mes) * 100) if obrigacoes_mes else 0, 2)
            },
            'documentos': {
                'total': documentos_mes,
                'processados': documentos_processados,
                'taxa_processamento': round((documentos_processados / documentos_mes * 100) if documentos_mes else 0, 2)
            },
            'mensalidades': {
                'total': len(mensalidades_mes),
                'pagas': len(mensalidades_pagas),
                'valor_total': valor_total_mensalidades,
                'valor_recebido': valor_recebido_mensalidades,
                'taxa_recebimento': round((valor_recebido_mensalidades / valor_total_mensalidades * 100) if valor_total_mensalidades else 0, 2)
            }
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@dashboard_bp.route('/dashboard/alertas', methods=['GET'])
def get_alertas():
    """Obter alertas importantes para o dashboard"""
    try:
        hoje = date.today()
        alertas = []
        
        # Obrigações vencidas
        obrigacoes_vencidas = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento < hoje
            )
        ).count()
        
        if obrigacoes_vencidas > 0:
            alertas.append({
                'tipo': 'erro',
                'titulo': 'Obrigações Vencidas',
                'mensagem': f'{obrigacoes_vencidas} obrigação(ões) em atraso',
                'acao': '/obrigacoes?status=pendente&vencidas=true'
            })
        
        # Documentos há muito tempo sem processamento
        documentos_antigos = Documento.query.filter(
            and_(
                Documento.status_processamento == 'pendente',
                Documento.data_upload < datetime.now() - timedelta(days=3)
            )
        ).count()
        
        if documentos_antigos > 0:
            alertas.append({
                'tipo': 'aviso',
                'titulo': 'Documentos Pendentes',
                'mensagem': f'{documentos_antigos} documento(s) aguardando processamento há mais de 3 dias',
                'acao': '/documentos?status_processamento=pendente'
            })
        
        # Mensalidades em atraso
        mensalidades_atrasadas = Mensalidade.query.filter(
            and_(
                Mensalidade.status == 'pendente',
                Mensalidade.data_vencimento < hoje
            )
        ).count()
        
        if mensalidades_atrasadas > 0:
            alertas.append({
                'tipo': 'aviso',
                'titulo': 'Mensalidades em Atraso',
                'mensagem': f'{mensalidades_atrasadas} mensalidade(s) em atraso',
                'acao': '/mensalidades?status=pendente&atrasadas=true'
            })
        
        # Clientes sem documentos no mês atual
        mes_atual = hoje.strftime('%Y-%m')
        clientes_sem_documentos = db.session.query(Cliente).filter(
            and_(
                Cliente.ativo == True,
                ~Cliente.id.in_(
                    db.session.query(Documento.cliente_id).filter_by(mes_referencia=mes_atual)
                )
            )
        ).count()
        
        if clientes_sem_documentos > 0:
            alertas.append({
                'tipo': 'info',
                'titulo': 'Documentos Pendentes',
                'mensagem': f'{clientes_sem_documentos} cliente(s) ainda não enviaram documentos este mês',
                'acao': '/clientes?sem_documentos_mes=true'
            })
        
        return jsonify(alertas)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

