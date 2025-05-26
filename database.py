import os
from dotenv import load_dotenv
import mysql.connector

dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.gitignore', '.env')
load_dotenv(dotenv_path)

def conectar():
    conexao = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DATABASE"),
        port=int(os.getenv("MYSQL_PORT"))
    )
    return conexao
