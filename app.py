from flask import Flask, render_template, request, jsonify, send_from_directory
from database import conectar  # Supondo que você tenha uma função conectar em database.py
import os
import uuid

app = Flask(__name__)

# Defina o diretório de upload de imagens
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Garanta que o diretório de uploads exista
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# A rota principal
@app.route('/')
def home():
    return render_template('Cadastro.html')

# Rota para cadastrar
@app.route('/cadastrar', methods=['POST'])
def cadastrar():
    try:
        # Coletar os dados do formulário
        nome = request.form.get('nome')
        email = request.form.get('email')
        whatsapp = request.form.get('whatsapp')
        cep = request.form.get('cep')
        complemento = request.form.get('complemento')
        print(nome, email)

        # Verificar se os campos de latitude e longitude foram preenchidos corretamente
        latitude_str = request.form.get('latitude')
        longitude_str = request.form.get('longitude')

        if not latitude_str or not longitude_str:
            return jsonify({"erro": "Latitude e Longitude são obrigatórios!"}), 400
        
        # Converter latitude e longitude para float
        latitude = float(latitude_str)
        longitude = float(longitude_str)

        itens = request.form.getlist('itens')  # Para itens de coleta como uma lista

        # Coletar a imagem enviada
        imagem = request.files.get('imagem')
        imagem_filename = None  # Variável para armazenar o nome do arquivo da imagem

        if imagem:
            # Gerar um nome único para a imagem
            imagem_filename = str(uuid.uuid4()) + os.path.splitext(imagem.filename)[1]
            imagem.save(os.path.join(app.config['UPLOAD_FOLDER'], imagem_filename))

        # Conectar ao banco de dados
        conn = conectar()
        cursor = conn.cursor()

        # Inserir no banco de dados (ponto de coleta)
        query = """
        INSERT INTO ponto_coleta (nome, email, whatsapp, cep, complemento, imagem, latitude, longitude)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (nome, email, whatsapp, cep, complemento, imagem_filename, latitude, longitude))
        ponto_id = cursor.lastrowid

        # Inserir os itens associados ao ponto de coleta
        for item_id in itens:
            query_ponto_item = """
            INSERT INTO ponto_itens (ponto_id, item_id)
            VALUES (%s, %s)
            """
            cursor.execute(query_ponto_item, (ponto_id, item_id))

        # Inserir horários de funcionamento
        dias = request.form.getlist('dias')
        horarios_inicio = request.form.getlist('hora_inicio')
        horarios_fim = request.form.getlist('hora_fim')

        print("Dias de funcionamento:", dias)
        print("Horários de início:", horarios_inicio)
        print("Horários de fim:", horarios_fim)

        for dia, inicio, fim in zip(dias, horarios_inicio, horarios_fim):
            # Verificar se o dia está desabilitado
            disable_checkbox = request.form.get(f'{dia}_disable')  # Verificar se a checkbox de desabilitar foi marcada

            if disable_checkbox:  # Se a checkbox estiver marcada, não insira o horário para esse dia
                continue

            # Inserir o horário no banco de dados se não estiver desabilitado
            query_horario = """
            INSERT INTO horarios_funcionamento (ponto_id, dia_semana, hora_inicio, hora_fim)
            VALUES (%s, %s, %s, %s)
            """
            cursor.execute(query_horario, (ponto_id, dia, inicio, fim))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Cadastro realizado com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao cadastrar: {e}")
        return jsonify({"erro": f"Erro ao cadastrar ponto de coleta: {str(e)}"}), 500

# Rota para servir as imagens do diretório 'uploads'
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    app.run(debug=True)