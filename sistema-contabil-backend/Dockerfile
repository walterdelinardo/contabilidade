# Usa uma imagem Python para o build do backend
FROM python:3.9-slim-bullseye

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de configuração do backend
COPY requirements.txt ./

# Instala as dependências Python a partir do requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o código-fonte da sua aplicação para o diretório de trabalho
COPY . .

# Define o comando para executar a aplicação
# Ele irá executar o main.py usando Gunicorn para ser um servidor de produção
CMD ["gunicorn", "--bind", "0.0.0.0:3001", "main:app"]
