from flask import Flask, render_template, request, jsonify, send_from_directory
from database import conectar
import os
import uuid

app = Flask(__name__)

# Diretório de upload
UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def home():
    return render_template('Inicio.html')

@app.route('/consultar')
def consultar_form():
    return render_template('Consulta.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/cadastrar', methods=['GET', 'POST'])
def cadastrar_form():
    if request.method == 'GET':
        return render_template('Cadastro.html')

    try:
        nome = request.form.get('nome')
        email = request.form.get('email')
        whatsapp = request.form.get('whatsapp')
        cep = request.form.get('cep')
        complemento = request.form.get('complemento')
        latitude_str = request.form.get('latitude')
        longitude_str = request.form.get('longitude')
        endereco = request.form.get('endereco')

# Coleta os valores dos checkboxes
        reciclaveis = request.form.get('reciclaveis') == 'on'
        organicos = request.form.get('organicos') == 'on'
        eletronicos = request.form.get('eletronicos') == 'on'
        pilhas_baterias = request.form.get('pilhas_baterias') == 'on'
        oleo_cozinha = request.form.get('oleo_cozinha') == 'on'
        lampadas = request.form.get('lampadas') == 'on'

# Cria lista de resíduos selecionados
        itens_selecionados = []

        if reciclaveis:
            itens_selecionados.append("Recicláveis")
        if organicos:
            itens_selecionados.append("Orgânicos")
        if eletronicos:
            itens_selecionados.append("Eletrônicos")
        if pilhas_baterias:
            itens_selecionados.append("Pilhas e Baterias")
        if oleo_cozinha:
            itens_selecionados.append("Óleo de Cozinha")
        if lampadas:
            itens_selecionados.append("Lâmpadas")

        # Impressão no terminal
        if itens_selecionados:
            print("Itens selecionados:", ", ".join(itens_selecionados))
        else:
            print("Nenhum item de coleta foi selecionado.")



        print("Resíduos selecionados:")
        print(f"  Recicláveis: {reciclaveis}")
        print(f"  Orgânicos: {organicos}")
        print(f"  Eletrônicos: {eletronicos}")
        print(f"  Pilhas e Baterias: {pilhas_baterias}")
        print(f"  Óleo de Cozinha: {oleo_cozinha}")
        print(f"  Lâmpadas: {lampadas}")

        if not latitude_str or not longitude_str:
            return jsonify({"erro": "Latitude e Longitude são obrigatórios!"}), 400

        latitude = float(latitude_str)
        longitude = float(longitude_str)

        imagem = request.files.get('imagem')
        imagem_filename = None

        if imagem:
            imagem_filename = str(uuid.uuid4()) + os.path.splitext(imagem.filename)[1]
            imagem.save(os.path.join(app.config['UPLOAD_FOLDER'], imagem_filename))

        conn = conectar()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO ponto_coleta (
                nome, email, whatsapp, cep, complemento, imagem, latitude, longitude, endereco,
                reciclaveis, organicos, eletronicos, pilhas_baterias, oleo_cozinha, lampadas
            ) 
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            nome, email, whatsapp, cep, complemento, imagem_filename, latitude, longitude, endereco,
            reciclaveis, organicos, eletronicos, pilhas_baterias, oleo_cozinha, lampadas
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Cadastro realizado com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao cadastrar: {e}")
        return jsonify({"erro": f"Erro ao cadastrar ponto de coleta: {str(e)}"}), 500

@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar_ponto(id):
    if request.method == 'GET':
        conn = conectar()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM ponto_coleta WHERE id = %s", (id,))
        ponto = cursor.fetchone()
        cursor.close()
        conn.close()
        if ponto:
            return render_template('Editar.html', ponto=ponto)
        else:
            return "Ponto não encontrado", 404

    try:
        nome = request.form.get('nome')
        email = request.form.get('email')
        whatsapp = request.form.get('whatsapp')
        cep = request.form.get('cep')
        complemento = request.form.get('complemento')
        latitude = float(request.form.get('latitude'))
        longitude = float(request.form.get('longitude'))
        endereco = request.form.get('endereco')

        reciclaveis = request.form.get('reciclaveis')
        organicos = request.form.get('organicos')
        eletronicos = request.form.get('eletronicos')
        pilhas_baterias = request.form.get('pilhas_baterias')
        oleo_cozinha = request.form.get('oleo_cozinha')
        lampadas = request.form.get('lampadas')

        imagem = request.files.get('imagem')

        conn = conectar()
        cursor = conn.cursor()

        if imagem:
            imagem_filename = str(uuid.uuid4()) + os.path.splitext(imagem.filename)[1]
            imagem.save(os.path.join(app.config['UPLOAD_FOLDER'], imagem_filename))
            cursor.execute("""
                UPDATE ponto_coleta SET nome=%s, email=%s, whatsapp=%s, cep=%s, complemento=%s,
                imagem=%s, latitude=%s, longitude=%s, endereco=%s,
                reciclaveis=%s, organicos=%s, eletronicos=%s, pilhas_baterias=%s, oleo_cozinha=%s, lampadas=%s
                WHERE id=%s
            """, (
                nome, email, whatsapp, cep, complemento,
                imagem_filename, latitude, longitude, endereco,
                reciclaveis, organicos, eletronicos, pilhas_baterias, oleo_cozinha, lampadas,
                id
            ))
        else:
            cursor.execute("""
                UPDATE ponto_coleta SET nome=%s, email=%s, whatsapp=%s, cep=%s, complemento=%s,
                latitude=%s, longitude=%s, endereco=%s,
                reciclaveis=%s, organicos=%s, eletronicos=%s, pilhas_baterias=%s, oleo_cozinha=%s, lampadas=%s
                WHERE id=%s
            """, (
                nome, email, whatsapp, cep, complemento,
                latitude, longitude, endereco,
                reciclaveis, organicos, eletronicos, pilhas_baterias, oleo_cozinha, lampadas,
                id
            ))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Ponto de coleta atualizado com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao editar: {e}")
        return jsonify({"erro": f"Erro ao editar ponto de coleta: {str(e)}"}), 500

@app.route('/buscar', methods=['GET'])
def buscar():
    nome = request.args.get('nome')
    conexao = conectar()
    cursor = conexao.cursor()
    cursor.execute("SELECT * FROM ponto_coleta WHERE nome = %s", (nome,))
    ponto = cursor.fetchone()
    cursor.close()
    conexao.close()

    if ponto:
        dados = {
            'id': ponto[0],
            'nome': ponto[1],
            'email': ponto[2],
            'whatsapp': ponto[3],
            'cep': ponto[4],
            'complemento': ponto[5],
            'imagem': ponto[6],
            'latitude': float(ponto[7]),
            'longitude': float(ponto[8]),
            'endereco': ponto[9]
        }
        return jsonify(dados)
    else:
        return jsonify({'mensagem': 'Ponto de coleta não encontrado'}), 404

@app.route('/api/pontos')
def listar_pontos():
    try:
        conn = conectar()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT * FROM ponto_coleta
        """)

        pontos = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify(pontos)
    except Exception as e:
        print(f"Erro ao consultar: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/remover/<int:id>', methods=['DELETE'])
def remover(id):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM ponto_coleta WHERE id = %s", (id,))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Ponto de coleta removido com sucesso!"}), 200

    except Exception as e:
        print(f"Erro ao remover: {e}")
        return jsonify({"erro": f"Erro ao remover ponto de coleta: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)