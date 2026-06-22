import numpy as np
from deepface import DeepFace
from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import mysql.connector
import json

app = Flask(__name__)
CORS(app)

def ambil_semua_wajah_dari_db():
    db = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="face_db"
    )
    cursor = db.cursor()
    cursor.execute("SELECT nama, vector_wajah FROM users")
    hasil = cursor.fetchall()
    cursor.close()
    db.close()
    return hasil

@app.route('/api/detect', methods=['POST'])
def detect_wajah():
    file_kiriman = request.files['webcam']
    img_array = np.frombuffer(file_kiriman.read(), np.uint8)
    foto_baru = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    try:
        vektor_baru = DeepFace.represent(
            img_path=foto_baru,
            model_name="Facenet",
            detector_backend="mtcnn"
        )[0]["embedding"]
        v2 = np.array(vektor_baru)
    except:
        return jsonify({"status": "error", "nama": "Wajah tidak terdeteksi oleh kamera"})

    data_temen = ambil_semua_wajah_dari_db()
    
    nama_terdeteksi = "Orang Asing / Gak Dikenal"
    jarak_terkecil = 1.0

    for nama, teks_vektor in data_temen:
        list_vektor = json.loads(teks_vektor)
        v1 = np.array(list_vektor)

        v1_norm = v1 / np.linalg.norm(v1)
        v2_norm = v2 / np.linalg.norm(v2)
        jarak = np.linalg.norm(v1_norm - v2_norm)

        print(f">>> Muka di Kamera vs DB ({nama}) -> Jarak Skor: {jarak:.4f}")

        if jarak <= 1.0 and jarak < jarak_terkecil:
            jarak_terkecil = jarak
            nama_terdeteksi = nama

    return jsonify({"status": "success", "nama": nama_terdeteksi})

if __name__ == '__main__':
    app.run(port=8080)