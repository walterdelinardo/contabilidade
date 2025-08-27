# Estágio 1: Build da aplicação frontend
FROM node:18-bullseye AS builder

# Define o diretório de trabalho dentro do container
WORKDIR /app/sistema-contabil-frontend

# Copia os arquivos de configuração do projeto frontend
COPY ./sistema-contabil-frontend/package*.json ./
COPY ./sistema-contabil-frontend/pnpm-lock.yaml ./

# Instala o pnpm e as dependências
RUN npm install -g pnpm && pnpm install

# Copia o restante do código da pasta frontend
COPY ./sistema-contabil-frontend/ .

# Executa o comando de build
RUN pnpm run build

# ---

# Estágio 2: Servir a aplicação com Caddy
FROM caddy:2.8.4-alpine

# Copia o Caddyfile da pasta RAIZ, não da subpasta
COPY ./Caddyfile /etc/caddy/Caddyfile

# Copia os arquivos estáticos (build final) do estágio 1
COPY --from=builder /app/sistema-contabil-frontend/dist /usr/share/caddy/html

# Expõe a porta para acesso externo
EXPOSE 2001

# Comando para iniciar o servidor Caddy
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]