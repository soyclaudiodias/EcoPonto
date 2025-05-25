# database.py
def conectar():
    conexao = mysql.connector.connect(
        host="mysql.railway.internal",
        port=3306,
        user="root",
        password="1234",
        database="railway"
    )
    return conexao

