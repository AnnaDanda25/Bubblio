from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# 🧍 Model użytkownika
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relacje
    tasks = db.relationship('Task', backref='user', lazy=True)
    tanks = db.relationship('Tank', backref='owner', lazy=True)

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def __repr__(self):
        return f"<User {self.login}>"

# ✅ Model zadania (task) w kalendarzu
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(10), nullable=False)  # Format: YYYY-MM-DD
    is_done = db.Column(db.Boolean, default=False)

    recurring = db.Column(db.Boolean, default=False)
    repeat_every = db.Column(db.Integer, nullable=True)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Task {self.title} on {self.date}>"

class Tank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    volume = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=True)
    ph = db.Column(db.Float, nullable=True)
    kh = db.Column(db.Integer, nullable=True)  # 🆕
    gh = db.Column(db.Integer, nullable=True)  # 🆕
    description = db.Column(db.Text, nullable=True)  # 🆕
    image = db.Column(db.String(100), nullable=True)  # 🆕

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Tank {self.name} ({self.volume}L)>"
