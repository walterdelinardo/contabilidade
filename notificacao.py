from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Notificacao(db.Model):
    __tablename__ = 'notificacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=True)
    tipo = db.Column(db.String(50), nullable=False)  # vencimento, documento_pendente, inadimplencia, etc.
    titulo = db.Column(db.String(200), nullable=False)
    mensagem = db.Column(db.Text, nullable=False)
    prioridade = db.Column(db.String(20), default='media')  # baixa, media, alta, critica
    status = db.Column(db.String(20), default='pendente')  # pendente, enviado, lido
    canal = db.Column(db.String(20), nullable=False)  # email, whatsapp, sistema
    data_envio = db.Column(db.DateTime, nullable=True)
    data_leitura = db.Column(db.DateTime, nullable=True)
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamento opcional com cliente
    cliente = db.relationship('Cliente', foreign_keys=[cliente_id])

    def __repr__(self):
        return f'<Notificacao {self.tipo} - {self.titulo}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'tipo': self.tipo,
            'titulo': self.titulo,
            'mensagem': self.mensagem,
            'prioridade': self.prioridade,
            'status': self.status,
            'canal': self.canal,
            'data_envio': self.data_envio.isoformat() if self.data_envio else None,
            'data_leitura': self.data_leitura.isoformat() if self.data_leitura else None,
            'data_criacao': self.data_criacao.isoformat() if self.data_criacao else None
        }

