# database.py
import mysql.connector

def conectar():
    conexao = mysql.connector.connect(
        host="mysql-swww.railway.internal",
        user="root",
        password="1234",
        database="railway",
        port=3306
    )
    return conexao
