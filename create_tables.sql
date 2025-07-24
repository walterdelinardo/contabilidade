-- Script de migração para PostgreSQL
-- Sistema Contábil Inteligente

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    regime_tributario VARCHAR(50) NOT NULL,
    responsavel_legal VARCHAR(200) NOT NULL,
    email VARCHAR(120) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de obrigações
CREATE TABLE IF NOT EXISTS obrigacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    descricao VARCHAR(200) NOT NULL,
    data_vencimento DATE NOT NULL,
    valor DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'pendente',
    mes_referencia VARCHAR(7) NOT NULL,
    codigo_receita VARCHAR(10),
    observacoes TEXT,
    data_pagamento DATE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_documento VARCHAR(50) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_arquivo INTEGER NOT NULL,
    mes_referencia VARCHAR(7) NOT NULL,
    resumo_ia TEXT,
    pontos_importantes TEXT,
    status_processamento VARCHAR(20) DEFAULT 'pendente',
    data_upload TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_processamento TIMESTAMP
);

-- Tabela de mensalidades
CREATE TABLE IF NOT EXISTS mensalidades (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
    mes_referencia VARCHAR(7) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pendente',
    data_pagamento DATE,
    forma_pagamento VARCHAR(50),
    observacoes TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    prioridade VARCHAR(20) DEFAULT 'media',
    status VARCHAR(20) DEFAULT 'pendente',
    canal VARCHAR(20) NOT NULL,
    data_envio TIMESTAMP,
    data_leitura TIMESTAMP,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de logs de IA
CREATE TABLE IF NOT EXISTS ia_logs (
    id SERIAL PRIMARY KEY,
    tipo_operacao VARCHAR(50) NOT NULL,
    documento_id INTEGER REFERENCES documentos(id) ON DELETE SET NULL,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    prompt TEXT,
    resposta TEXT,
    tokens_utilizados INTEGER,
    tempo_processamento INTEGER, -- em milissegundos
    status VARCHAR(20) DEFAULT 'sucesso',
    erro TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS configuracoes (
    id SERIAL PRIMARY KEY,
    chave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descricao TEXT,
    tipo VARCHAR(20) DEFAULT 'string', -- string, number, boolean, json
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_ativo ON clientes(ativo);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_cliente ON obrigacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_vencimento ON obrigacoes(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_obrigacoes_status ON obrigacoes(status);
CREATE INDEX IF NOT EXISTS idx_documentos_cliente ON documentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status_processamento);
CREATE INDEX IF NOT EXISTS idx_mensalidades_cliente ON mensalidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_mensalidades_vencimento ON mensalidades(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON notificacoes(status);

-- Triggers para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obrigacoes_updated_at BEFORE UPDATE ON obrigacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensalidades_updated_at BEFORE UPDATE ON mensalidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at BEFORE UPDATE ON configuracoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir configurações padrão
INSERT INTO configuracoes (chave, valor, descricao, tipo) VALUES
('sistema_nome', 'Sistema Contábil Inteligente', 'Nome do sistema', 'string'),
('sistema_versao', '1.0.0', 'Versão atual do sistema', 'string'),
('email_smtp_host', '', 'Servidor SMTP para envio de emails', 'string'),
('email_smtp_port', '587', 'Porta do servidor SMTP', 'number'),
('whatsapp_api_url', '', 'URL da API do WhatsApp', 'string'),
('ia_max_tokens', '1000', 'Máximo de tokens por requisição de IA', 'number'),
('backup_automatico', 'true', 'Ativar backup automático', 'boolean'),
('notificacoes_ativas', 'true', 'Ativar sistema de notificações', 'boolean')
ON CONFLICT (chave) DO NOTHING;

-- Inserir dados de exemplo (opcional)
INSERT INTO clientes (nome, cnpj, regime_tributario, responsavel_legal, email, telefone, endereco) VALUES
('Empresa ABC Ltda', '12.345.678/0001-90', 'Simples Nacional', 'João Silva', 'contato@empresaabc.com', '(11) 99999-9999', 'Rua das Flores, 123 - São Paulo/SP'),
('Comércio XYZ', '98.765.432/0001-10', 'Lucro Presumido', 'Maria Santos', 'financeiro@comercioxyz.com', '(11) 88888-8888', 'Av. Principal, 456 - São Paulo/SP'),
('Loja DEF', '11.222.333/0001-44', 'Simples Nacional', 'Pedro Costa', 'contato@lojadef.com', '(11) 77777-7777', 'Rua do Comércio, 789 - São Paulo/SP')
ON CONFLICT (cnpj) DO NOTHING;

