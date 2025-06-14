from flask import Flask
from models import db, User, Task
from mainpage.routes import mainpage
from auth import auth
from profile import profile  # ⬅️ import nowego blueprintu

# tworzymy aplikację
app = Flask(__name__)

# konfiguracja bazy danych
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bubblio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# klucz sesji (dla logowania)
app.config['SECRET_KEY'] = 'supersekretnyklucz'  # zmień na silny klucz w produkcji

# inicjalizujemy bazę z aplikacją
db.init_app(app)

# rejestrujemy blueprinty
app.register_blueprint(mainpage)
app.register_blueprint(auth)
app.register_blueprint(profile)  # ⬅️ rejestracja profile

# tworzymy tabele, jeśli nie istnieją
with app.app_context():
    db.create_all()

# uruchamiamy aplikację
if __name__ == '__main__':
    app.run(debug=True)
