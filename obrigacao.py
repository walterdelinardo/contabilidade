from flask import Blueprint, jsonify, request
from src.models.obrigacao import Obrigacao
from src.models.cliente import Cliente
from src.models.user import db
from datetime import datetime, date
from sqlalchemy import and_, or_

obrigacao_bp = Blueprint('obrigacao', __name__)

@obrigacao_bp.route('/obrigacoes', methods=['GET'])
def get_obrigacoes():
    """Listar obrigações com filtros opcionais"""
    try:
        cliente_id = request.args.get('cliente_id')
        status = request.args.get('status')
        mes_referencia = request.args.get('mes_referencia')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')
        
        query = Obrigacao.query
        
        if cliente_id:
            query = query.filter(Obrigacao.cliente_id == cliente_id)
        if status:
            query = query.filter(Obrigacao.status == status)
        if mes_referencia:
            query = query.filter(Obrigacao.mes_referencia == mes_referencia)
        if data_inicio:
            query = query.filter(Obrigacao.data_vencimento >= datetime.strptime(data_inicio, '%Y-%m-%d').date())
        if data_fim:
            query = query.filter(Obrigacao.data_vencimento <= datetime.strptime(data_fim, '%Y-%m-%d').date())
        
        obrigacoes = query.order_by(Obrigacao.data_vencimento.asc()).all()
        
        resultado = []
        for obrigacao in obrigacoes:
            obrigacao_dict = obrigacao.to_dict()
            obrigacao_dict['cliente_nome'] = obrigacao.cliente.nome
            resultado.append(obrigacao_dict)
        
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes', methods=['POST'])
def create_obrigacao():
    """Criar nova obrigação"""
    try:
        data = request.json
        
        # Validações básicas
        if not all([data.get('cliente_id'), data.get('tipo'), data.get('descricao'), 
                   data.get('data_vencimento'), data.get('mes_referencia')]):
            return jsonify({'erro': 'Campos obrigatórios: cliente_id, tipo, descricao, data_vencimento, mes_referencia'}), 400
        
        # Verificar se cliente existe
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({'erro': 'Cliente não encontrado'}), 404
        
        obrigacao = Obrigacao(
            cliente_id=data['cliente_id'],
            tipo=data['tipo'],
            descricao=data['descricao'],
            data_vencimento=datetime.strptime(data['data_vencimento'], '%Y-%m-%d').date(),
            valor=data.get('valor'),
            mes_referencia=data['mes_referencia'],
            codigo_receita=data.get('codigo_receita'),
            observacoes=data.get('observacoes')
        )
        
        db.session.add(obrigacao)
        db.session.commit()
        
        return jsonify(obrigacao.to_dict()), 201
    except ValueError as e:
        return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes/<int:obrigacao_id>', methods=['GET'])
def get_obrigacao(obrigacao_id):
    """Obter obrigação por ID"""
    try:
        obrigacao = Obrigacao.query.get_or_404(obrigacao_id)
        obrigacao_dict = obrigacao.to_dict()
        obrigacao_dict['cliente_nome'] = obrigacao.cliente.nome
        return jsonify(obrigacao_dict)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes/<int:obrigacao_id>', methods=['PUT'])
def update_obrigacao(obrigacao_id):
    """Atualizar obrigação"""
    try:
        obrigacao = Obrigacao.query.get_or_404(obrigacao_id)
        data = request.json
        
        # Atualizar campos
        obrigacao.tipo = data.get('tipo', obrigacao.tipo)
        obrigacao.descricao = data.get('descricao', obrigacao.descricao)
        
        if data.get('data_vencimento'):
            obrigacao.data_vencimento = datetime.strptime(data['data_vencimento'], '%Y-%m-%d').date()
        
        if data.get('valor'):
            obrigacao.valor = data['valor']
        
        obrigacao.status = data.get('status', obrigacao.status)
        obrigacao.mes_referencia = data.get('mes_referencia', obrigacao.mes_referencia)
        obrigacao.codigo_receita = data.get('codigo_receita', obrigacao.codigo_receita)
        obrigacao.observacoes = data.get('observacoes', obrigacao.observacoes)
        
        if data.get('data_pagamento'):
            obrigacao.data_pagamento = datetime.strptime(data['data_pagamento'], '%Y-%m-%d').date()
        
        obrigacao.data_atualizacao = datetime.utcnow()
        
        db.session.commit()
        return jsonify(obrigacao.to_dict())
    except ValueError as e:
        return jsonify({'erro': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes/<int:obrigacao_id>', methods=['DELETE'])
def delete_obrigacao(obrigacao_id):
    """Excluir obrigação"""
    try:
        obrigacao = Obrigacao.query.get_or_404(obrigacao_id)
        db.session.delete(obrigacao)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes/vencimentos', methods=['GET'])
def get_vencimentos_proximos():
    """Obter obrigações com vencimento próximo"""
    try:
        dias = int(request.args.get('dias', 7))  # próximos 7 dias por padrão
        data_limite = date.today() + datetime.timedelta(days=dias)
        
        obrigacoes = Obrigacao.query.filter(
            and_(
                Obrigacao.data_vencimento <= data_limite,
                Obrigacao.status == 'pendente'
            )
        ).order_by(Obrigacao.data_vencimento.asc()).all()
        
        resultado = []
        for obrigacao in obrigacoes:
            obrigacao_dict = obrigacao.to_dict()
            obrigacao_dict['cliente_nome'] = obrigacao.cliente.nome
            obrigacao_dict['dias_restantes'] = (obrigacao.data_vencimento - date.today()).days
            resultado.append(obrigacao_dict)
        
        return jsonify(resultado)
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

@obrigacao_bp.route('/obrigacoes/dashboard', methods=['GET'])
def get_dashboard_obrigacoes():
    """Obter estatísticas de obrigações para o dashboard"""
    try:
        hoje = date.today()
        
        # Obrigações pendentes
        pendentes = Obrigacao.query.filter_by(status='pendente').count()
        
        # Obrigações vencidas
        vencidas = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento < hoje
            )
        ).count()
        
        # Obrigações vencendo hoje
        vencendo_hoje = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento == hoje
            )
        ).count()
        
        # Obrigações dos próximos 7 dias
        proximos_7_dias = Obrigacao.query.filter(
            and_(
                Obrigacao.status == 'pendente',
                Obrigacao.data_vencimento > hoje,
                Obrigacao.data_vencimento <= hoje + datetime.timedelta(days=7)
            )
        ).count()
        
        return jsonify({
            'pendentes': pendentes,
            'vencidas': vencidas,
            'vencendo_hoje': vencendo_hoje,
            'proximos_7_dias': proximos_7_dias
        })
    except Exception as e:
        return jsonify({'erro': str(e)}), 500

