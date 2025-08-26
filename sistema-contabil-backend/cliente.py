from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Cliente(db.Model):
    __tablename__ = 'clientes'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(200), nullable=False)
    cnpj = db.Column(db.String(18), unique=True, nullable=False)
    regime_tributario = db.Column(db.String(50), nullable=False)  # Simples Nacional, Lucro Presumido, Lucro Real
    responsavel_legal = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    telefone = db.Column(db.String(20), nullable=True)
    endereco = db.Column(db.Text, nullable=True)
    ativo = db.Column(db.Boolean, default=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    data_atualizacao = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    obrigacoes = db.relationship('Obrigacao', backref='cliente', lazy=True, cascade='all, delete-orphan')
    documentos = db.relationship('Documento', backref='cliente', lazy=True, cascade='all, delete-orphan')
    mensalidades = db.relationship('Mensalidade', backref='cliente', lazy=True, cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Cliente {self.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'cnpj': self.cnpj,
            'regime_tributario': self.regime_tributario,
            'responsavel_legal': self.responsavel_legal,
            'email': self.email,
            'telefone': self.telefone,
            'endereco': self.endereco,
            'ativo': self.ativo,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'data_atualizacao': self.data_atualizacao.isoformat() if self.data_atualizacao else None
        }

