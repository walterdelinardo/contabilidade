# Usa uma imagem base para compilar a aplicação React
FROM node:18-alpine as build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração e instala as dependências
COPY package.json .
COPY package-lock.json .
RUN npm install

# Copia o código da aplicação e compila para produção
COPY . .
RUN npm run build

# Usa uma imagem NGINX para servir a aplicação estática
FROM nginx:1.21-alpine

# Copia a configuração padrão do NGINX
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copia o build da aplicação para o NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Expõe a porta padrão do NGINX
EXPOSE 80

# Comando para iniciar o NGINX
CMD ["nginx", "-g", "daemon off;"]