import numpy as np
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mysql.connector
import json


app = Flask(__name__)
CORS(app)

@app.route('/api/register', methods=['POST'])
def register_wajah():
    nama_baru = request.form.get('nama')
    file_kiriman = request.files['foto']

    if not nama_baru or not file_kiriman:
        return jsonify({"status": "error", "message": "Nama dan Foto wajib diisi, Fiola!"})

    img_array = np.frombuffer(file_kiriman.read(), np.uint8)
    foto_baru = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    try:
        vektor = DeepFace.represent(
            img_path=foto_baru, 
            model_name="Facenet", 
            detector_backend="mtcnn"
        )[0]["embedding"]
        
        print(">>> Ekstraksi selesai! Mencoba connect ke MySQL...")
        teks_vektor = json.dumps(vektor)
        
        db = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="face_db"
        )
        print(">>> MySQL Terhubung! Mencoba query...")
        cursor = db.cursor()
        cursor.execute(
            "INSERT INTO users (nama, vector_wajah) VALUES (%s, %s)", 
            (nama_baru, teks_vektor)
        )
        db.commit()
        cursor.close()
        db.close()

        return jsonify({"status": "success", "message": f"Wajah {nama_baru} berhasil didaftarkan otomatis!"})

    except Exception as e:
        return jsonify({"status": "error", "message": f"Gagal ekstrak wajah. Error: {str(e)}"})

if __name__ == '__main__':
    app.run(port=5001)