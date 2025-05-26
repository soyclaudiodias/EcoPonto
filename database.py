# database.py
import os
import mysql.connector

def conectar():
    conexao = mysql.connector.connect(
        host=os.getenv("MYSQLHOST", "mysql-swww.railway.internal"),
        user=os.getenv("MYSQLUSER", "root"),
        password=os.getenv("MYSQLPASSWORD", "1234"),
        database=os.getenv("MYSQLDATABASE", "railway"),
        port=int(os.getenv("MYSQLPORT", 3306))
    )
    return conexao
