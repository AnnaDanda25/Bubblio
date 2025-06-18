from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


# 🧍 Model użytkownika
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    login = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    # Relacje
    tasks = db.relationship("Task", backref="user", lazy=True)
    tanks = db.relationship("Tank", backref="owner", lazy=True)
    photos = db.relationship("Photo", backref="user", lazy=True)  # 🆕
    notes = db.relationship("Note", backref="user", lazy=True)  # 🆕
    tasks = db.relationship("Task", backref="user", lazy=True)
    tanks = db.relationship("Tank", backref="owner", lazy=True)
    photos = db.relationship("Photo", backref="user", lazy=True)
    notes = db.relationship("Note", backref="user", lazy=True)

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

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Task {self.title} on {self.date}>"


# ✅ Model zbiornika (tank)
class Tank(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    volume = db.Column(db.Integer, nullable=False)
    temperature = db.Column(db.Float, nullable=True)
    ph = db.Column(db.Float, nullable=True)
    kh = db.Column(db.Integer, nullable=True)
    gh = db.Column(db.Integer, nullable=True)
    description = db.Column(db.Text, nullable=True)
    image = db.Column(db.String(100), nullable=True)

    daily_checks = db.Column(db.PickleType, nullable=True)  # 🆕 lista codziennych zadań

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # ⬇️ Relacja do important tasks (nowy model poniżej)
    important_tasks = db.relationship(
        "ImportantTask", backref="tank", lazy=True, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Tank {self.name} ({self.volume}L)>"


# 🐠 Model ryby
class FishSpecies(db.Model):
    __tablename__ = "fish_species"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # np. "Neon Innesa"
    image = db.Column(db.String(100), nullable=True)  # obrazek ryby
    adult_length = db.Column(db.Float, nullable=False)

    min_temp = db.Column(db.Float)
    max_temp = db.Column(db.Float)
    min_ph = db.Column(db.Float)
    max_ph = db.Column(db.Float)
    min_kh = db.Column(db.Integer)
    max_kh = db.Column(db.Integer)
    min_gh = db.Column(db.Integer)
    max_gh = db.Column(db.Integer)

    description = db.Column(db.Text)

    def __repr__(self):
        return f"<Species {self.name}>"


# Rybki użytkownika w konkretnym akwarium
class FishInstance(db.Model):
    __tablename__ = "fish_instance"
    id = db.Column(db.Integer, primary_key=True)
    quantity = db.Column(db.Integer, nullable=False, default=1)

    tank_id = db.Column(db.Integer, db.ForeignKey("tank.id"), nullable=False)
    species_id = db.Column(db.Integer, db.ForeignKey("fish_species.id"), nullable=False)

    tank = db.relationship("Tank", backref=db.backref("fish_instances", lazy=True))
    species = db.relationship("FishSpecies", backref=db.backref("instances", lazy=True))

    def __repr__(self):
        return f"<{self.quantity} x {self.species.name} in Tank {self.tank_id}>"


class FishStock(db.Model):
    __tablename__ = "fish_stock"
    id = db.Column(db.Integer, primary_key=True)
    tank_id = db.Column(db.Integer, db.ForeignKey("tank.id"))
    fish_id = db.Column(db.Integer, db.ForeignKey("fish_species.id"))
    count = db.Column(db.Integer)

    tank = db.relationship("Tank", backref="fish_stock")
    fish = db.relationship("FishSpecies")


# 📷 Model zdjęcia w galerii
class Photo(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100), nullable=False)
    title = db.Column(db.String(100), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Photo {self.title or self.filename}>"


# 📝 Model notatki
class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    content = db.Column(db.Text, nullable=False)
    date = db.Column(db.Date, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Note {self.title} on {self.date}>"


# 🔁 Model cyklicznego ważnego zadania
class ImportantTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tank_id = db.Column(db.Integer, db.ForeignKey("tank.id"), nullable=False)
    task_type = db.Column(
        db.String(50), nullable=False
    )  # np. 'waterchange', 'trimplants'
    start_date = db.Column(db.Date, nullable=True)
    interval_days = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return f"<ImportantTask {self.task_type} for tank {self.tank_id}>"
