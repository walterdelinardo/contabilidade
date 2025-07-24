from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.user import db

class Documento(db.Model):
    __tablename__ = 'documentos'
    
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('clientes.id'), nullable=False)
    nome_arquivo = db.Column(db.String(255), nullable=False)
    tipo_documento = db.Column(db.String(50), nullable=False)  # XML, PDF, XLSX, etc.
    categoria = db.Column(db.String(50), nullable=False)  # folha_pagamento, nota_fiscal, extrato, etc.
    caminho_arquivo = db.Column(db.String(500), nullable=False)
    tamanho_arquivo = db.Column(db.Integer, nullable=False)  # em bytes
    mes_referencia = db.Column(db.String(7), nullable=False)  # formato YYYY-MM
    resumo_ia = db.Column(db.Text, nullable=True)  # resumo gerado pela IA
    pontos_importantes = db.Column(db.Text, nullable=True)  # pontos importantes identificados pela IA
    status_processamento = db.Column(db.String(20), default='pendente')  # pendente, processado, erro
    data_upload = db.Column(db.DateTime, default=datetime.utcnow)
    data_processamento = db.Column(db.DateTime, nullable=True)

    def __repr__(self):
        return f'<Documento {self.nome_arquivo} - {self.cliente.nome}>'

    def to_dict(self):
        return {
            'id': self.id,
            'cliente_id': self.cliente_id,
            'nome_arquivo': self.nome_arquivo,
            'tipo_documento': self.tipo_documento,
            'categoria': self.categoria,
            'caminho_arquivo': self.caminho_arquivo,
            'tamanho_arquivo': self.tamanho_arquivo,
            'mes_referencia': self.mes_referencia,
            'resumo_ia': self.resumo_ia,
            'pontos_importantes': self.pontos_importantes,
            'status_processamento': self.status_processamento,
            'data_upload': self.data_upload.isoformat() if self.data_upload else None,
            'data_processamento': self.data_processamento.isoformat() if self.data_processamento else None
        }

