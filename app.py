from flask import Flask, redirect, url_for
from flask_migrate import Migrate
from models import db, User, Task, Tank

# 📦 Importuj Blueprinty
from mainpage.routes import mainpage
from auth import auth
from profile import profile
from tanks import tanks
from diary import diary

# 🔧 Konfiguracja aplikacji Flask
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bubblio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'supersekretnyklucz'

# 🔁 Inicjalizacja bazy danych i migracji
db.init_app(app)
migrate = Migrate(app, db)

# 🧩 Rejestracja blueprintów
app.register_blueprint(mainpage)
app.register_blueprint(auth)
app.register_blueprint(profile)
app.register_blueprint(tanks)
app.register_blueprint(diary)

# 👉 Domyślny route przekierowuje na login
@app.route('/')
def index():
    return redirect(url_for('auth.login'))

# 🛠️ Tworzymy tabele (jeśli nie istnieją)
with app.app_context():
    db.create_all()

# 🚀 Uruchomienie aplikacji
if __name__ == '__main__':
    app.run(debug=True)
