import os
import base64
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'safedrive_secret_key_2026'

# --- Database Configuration ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///safe_drive.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    age = db.Column(db.Integer)
    email = db.Column(db.String(100), unique=True)
    vehicle_type = db.Column(db.String(50))
    vehicle_no = db.Column(db.String(50))
    username = db.Column(db.String(50), unique=True)
    password = db.Column(db.String(200))

class DrowsyLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    event_type = db.Column(db.String(50)) # Drowsy or Yawning
    timestamp = db.Column(db.DateTime, default=datetime.now)
    image_path = db.Column(db.String(200))

# Create Database inside app context
with app.app_context():
    db.create_all()

# --- Admin Credentials (Hardcoded) ---
ADMIN_USER = "admin"
ADMIN_PASS = "admin123"

# --- Routes ---

@app.route('/')
def landing():
    return render_template('landing.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check Admin first
        if username == ADMIN_USER and password == ADMIN_PASS:
            session['admin'] = True
            return redirect(url_for('admin_dashboard'))
            
        # Check User
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['user_name'] = user.name
            return redirect(url_for('dashboard'))
        
        return "Invalid Credentials"
    return render_template('auth.html')

@app.route('/register', methods=['POST'])
def register():
    hashed_pw = generate_password_hash(request.form['reg_password'])
    new_user = User(
        name=request.form['fullname'],
        age=request.form['age'],
        email=request.form['email'],
        vehicle_type=request.form['vehicle_type'],
        vehicle_no=request.form['vehicle_no'],
        username=request.form['reg_username'],
        password=hashed_pw
    )
    db.session.add(new_user)
    db.session.commit()
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session: return redirect(url_for('login'))
    return render_template('dashboard.html')

@app.route('/log_drowsiness', methods=['POST'])
def log_drowsiness():
    if 'user_id' not in session: return jsonify({"status": "unauthorized"}), 401
    
    data = request.json
    image_data = data['image'].split(",")[1]
    event_type = data['type']
    
    # Save Image to static/captures/
    filename = f"capture_{session['user_id']}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.jpg"
    filepath = os.path.join('static/captures', filename)
    
    with open(filepath, "wb") as f:
        f.write(base64.b64decode(image_data))
    
    # Save to Database
    new_log = DrowsyLog(
        user_id=session['user_id'],
        event_type=event_type,
        image_path=filename
    )
    db.session.add(new_log)
    db.session.commit()
    
    return jsonify({"status": "success"})

@app.route('/admin-dashboard')
def admin_dashboard():
    if not session.get('admin'): return redirect(url_for('login'))
    
    logs = db.session.query(DrowsyLog, User).join(User).all()
    # Format data for table
    formatted_logs = []
    for log, user in logs:
        formatted_logs.append({
            "id": log.id,
            "user_name": user.name,
            "vehicle_no": user.vehicle_no,
            "event_type": log.event_type,
            "timestamp": log.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "image_path": log.image_path
        })
    
    return render_template('admin_dashboard.html', logs=formatted_logs, user_count=User.query.count())

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('landing'))

if __name__ == '__main__':
    app.run(debug=True)