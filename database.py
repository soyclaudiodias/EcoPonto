# import os
# from dotenv import load_dotenv
import mysql.connector

# dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.gitignore', '.env')
# load_dotenv(dotenv_path)
MYSQL_DATABASE = "railway"
MYSQL_HOST = "shortline.proxy.rlwy.net"
MYSQL_PORT = 3306
MYSQL_USER = "root"
MYSQL_PASSWORD = "1234"

def conectar():
    conexao = mysql.connector.connect(
        host="MYSQL_HOST",
        user="MYSQL_USER",
        password="MYSQL_PASSWORD",
        database="MYSQL_DATABASE",
        port="MYSQL_PORT"
    )
    return conexao
