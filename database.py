# database.py

import mysql.connector

def conectar():
    conexao = mysql.connector.connect(
        host="localhost",
        user="root",
        password="1234",
        database="ecoponto",
    )
    return conexao
