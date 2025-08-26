from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Mensalidade(db.Model):
    __tablename__ = 'mensalidades'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    mes_referencia = db.Column(db.String(7), nullable=False)  # formato YYYY-MM
    valor = db.Column(db.Numeric(10, 2), nullable=False)
    data_vencimento = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='pendente')  # pendente, pago, vencido, cancelado
    data_pagamento = db.Column(db.Date, nullable=True)
    forma_pagamento = db.Column(db.String(50), nullable=True)  # boleto, pix, cartao, etc.
    observacoes = db.Column(db.Text, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<Mensalidade {self.mes_referencia} - {self.cliente.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'mes_referencia': self.mes_referencia,
            'valor': float(self.valor) if self.valor else None,
            'data_vencimento': self.data_vencimento.isoformat() if self.data_vencimento else None,
            'status': self.status,
            'data_pagamento': self.data_pagamento.isoformat() if self.data_pagamento else None,
            'forma_pagamento': self.forma_pagamento,
            'observacoes': self.observacoes,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

