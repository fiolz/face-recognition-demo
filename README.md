# face-recognition-demo
A face recognition prototype built as an initial R&amp;D milestone before shifting to a scalable 1-to-1 face verification workflow for a school attendance web app.
Originally, this project tested **Face Recognition (1-to-N match)**, where the system compares a scanned face against every single user in the database. However, running 1-to-N matching for over 1,000+ students causes high latency and severe CPU overhead on standard hardware. 
To solve this and ensure instant processing times, the production-ready school attendance system was upgraded to a **Face Verification (1-to-1 match)** workflow. This demo stands as the proven milestone of that initial exploration.

## 🛠️ Tech Stack
* **Backend:** Python 3.11.9, Flask, Flask-CORS
* **ML & Computer Vision:** DeepFace (`Facenet` model backend), OpenCV, NumPy
* **Database:** MySQL
* **Frontend:** HTML5, CSS3 (with custom scanning animations), Vanilla JavaScript (`Fetch API`)

> *Note:* Installing `deepface` will automatically handle `tensorflow` as a core dependency.

## 📁 Project Structure
```
face-recognition-demo/
│
├── css/
│   └── style.css          # UI styling & scanner animation constraints
├── js/
│   ├── script_index.js    # Frontend logic for face detection/identification
│   └── script_regist.js   # Form handling & registration state management
├── sql/
│   └── init.sql           # Database schema initialization script
│
├── app.py                 # Face Detection & Identification API (Port 8080)
├── app_register.py        # Face Vector Registration API (Port 5001)
├── index.html             # Face detection / identification interface
├── register.html          # Face registration interface
└── requirements.txt       # List of Python dependencies
```

## ⚙️ Setup & Installation
### 1. Database Configuration
Create a MySQL database named face_db and run the queries inside sql/init.sql.
### 2. Dependencies
Install the required packages using the requirements file:
```
pip install -r requirements.txt
```
### 3. Running the Services
This project runs on a dual-service architecture to separate workloads:
Start the Registration API:
```
python app_register.py
```
Start the Identification API:
```
python app.py
```
Launch the Client:
Open either index.html (to detect) or register.html (to register) directly in any modern web browser.

## 💡 System Flow
Registration: Frontend sends user details to app_register.py. The backend extracts a face embedding vector via DeepFace, serializes it into a JSON string, and stores it in face_db.

Identification: app.py captures frames from the webcam via index.html, extracts the target vector, pulls all stored templates from the database, and uses vectorized NumPy Euclidean operations to find a match.
