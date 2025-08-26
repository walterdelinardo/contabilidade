# documento.py

from flask import Blueprint, request, jsonify, current_app
import os
from PIL import Image
import pytesseract
from datetime import datetime
import re
from werkzeug.utils import secure_filename # IMPORTAÇÃO CORRIGIDA

# Importações de módulos internos (verifique a estrutura de pastas)
from src.models.user import db
from src.models.documento import Documento
from src.services.ia_service import suggest_category

# --- CONFIGURAÇÃO TESSERACT (Mova para um arquivo de configuração se tiver) ---
# Você precisa ter o Tesseract OCR instalado no seu sistema.
# Se o caminho não estiver no PATH, descomente e ajuste a linha abaixo:
# pytesseract.pytesseract.tesseract_cmd = r'/caminho/para/seu/tesseract.exe'
# -----------------------------------------------------------------------------

document_bp = Blueprint('documents', __name__)

# Configuração da pasta de upload
UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads', 'documentos')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
# Extensões de arquivos permitidas para upload
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'pdf'}
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Funções de extração de dados (pode mover para um arquivo de serviço)
def extract_value_from_text(text):
    # Procura por R$ e um número com vírgula decimal
    match = re.search(r'R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})', text)
    if match:
        value_str = match.group(1).replace('.', '').replace(',', '.')
        try:
            return float(value_str)
        except ValueError:
            return None
    # Procura por números decimais com ponto ou vírgula
    match = re.search(r'\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})', text)
    if match:
        value_str = match.group(0).replace('.', '').replace(',', '.')
        try:
            return float(value_str)
        except ValueError:
            return None
    return None

def extract_date_from_text(text):
    date_formats = [
        r'(\d{2}/\d{2}/\d{4})', 
        r'(\d{2}-\d{2}-\d{4})', 
        r'(\d{4}-\d{2}-\d{2})'
    ]
    for pattern in date_formats:
        match = re.search(pattern, text)
        if match:
            date_str = match.group(1)
            try:
                if '/' in date_str:
                    return datetime.strptime(date_str, '%d/%m/%Y').strftime('%Y-%m-%d')
                elif '-' in date_str and len(date_str.split('-')[0]) == 4:
                    return datetime.strptime(date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
                elif '-' in date_str:
                    return datetime.strptime(date_str, '%d-%m-%Y').strftime('%Y-%m-%d')
            except ValueError:
                continue
    return None

def get_mes_referencia_from_date(date_str):
    """Converte uma string de data (YYYY-MM-DD) para YYYY-MM."""
    if date_str:
        try:
            dt_obj = datetime.strptime(date_str, '%Y-%m-%d')
            return dt_obj.strftime('%Y-%m')
        except ValueError:
            pass
    return None

# Rota principal para upload e processamento
@document_bp.route('/upload-documento', methods=['POST'])
def upload_documento():
    cliente_id = request.form.get('cliente_id')
    if not cliente_id:
        return jsonify({"message": "ID do cliente é obrigatório."}), 400

    if 'documento' not in request.files:
        return jsonify({"message": "Nenhum arquivo 'documento' encontrado"}), 400

    file = request.files['documento']
    if file.filename == '':
        return jsonify({"message": "Nome de arquivo inválido"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Tipo de arquivo não permitido"}), 400

    filename_safe = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename_safe)

    try:
        file.save(filepath)

        file_ext = os.path.splitext(filename_safe)[1].lower()
        if file_ext == '.pdf':
            doc_type = 'PDF'
            # A lógica para PDFs precisaria ser implementada aqui.
            # Por enquanto, este bloco de código serve como um placeholder.
            full_text = "Lógica de extração de PDF ainda não implementada."
            img = None # A imagem pode vir da conversão de uma página do PDF.
        else: # Imagem
            doc_type = 'IMAGEM'
            img = Image.open(filepath)
            full_text = pytesseract.image_to_string(img, lang='por')

        # Extrair informações com regex
        extracted_value = extract_value_from_text(full_text)
        extracted_date_str = extract_date_from_text(full_text)
        mes_referencia = get_mes_referencia_from_date(extracted_date_str)

        # Sugestão de Categoria usando sua IA
        suggested_cat = suggest_category(full_text)

        novo_documento = Documento(
            cliente_id=int(cliente_id),
            nome_arquivo=filename_safe,
            tipo_documento=doc_type,
            categoria=suggested_cat if suggested_cat else 'Sem Categoria',
            caminho_arquivo=filepath,
            tamanho_arquivo=os.path.getsize(filepath),
            mes_referencia=mes_referencia if mes_referencia else datetime.utcnow().strftime('%Y-%m'),
            resumo_ia=full_text[:500] + "..." if len(full_text) > 500 else full_text,
            status_processamento='pendente_revisao',
            data_upload=datetime.utcnow(),
            data_processamento=datetime.utcnow()
        )
        db.session.add(novo_documento)
        db.session.commit()

        return jsonify({
            "message": "Documento enviado e processado com sucesso!",
            "documento_id": novo_documento.id,
            "filename": novo_documento.nome_arquivo,
            "extracted_value": extracted_value,
            "extracted_date": extracted_date_str,
            "suggested_category": suggested_cat,
            "status_processamento": novo_documento.status_processamento,
            "preview_text": full_text[:200] + "..." if len(full_text) > 200 else full_text
        }), 200

    except ValueError as ve:
        if os.path.exists(filepath): os.remove(filepath)
        return jsonify({"message": f"Erro de validação do arquivo: {str(ve)}"}), 400
    except Exception as e:
        if os: