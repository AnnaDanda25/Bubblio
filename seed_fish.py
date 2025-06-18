from models import db, FishSpecies
from app import app  # upewnij się, że masz dostęp do app context

fish_data = [
    {
        "name": "Neon Tetra",
        "min_temp": 20,
        "max_temp": 26,
        "min_ph": 5.0,
        "max_ph": 7.0,
        "min_kh": 1,
        "max_kh": 5,
        "min_gh": 2,
        "max_gh": 10,
        "adult_length": 3.5,
        "image": "neon.jpg",
    },
    {
        "name": "Guppy",
        "min_temp": 22,
        "max_temp": 28,
        "min_ph": 6.5,
        "max_ph": 8.0,
        "min_kh": 4,
        "max_kh": 8,
        "min_gh": 6,
        "max_gh": 12,
        "adult_length": 4.0,
        "image": "guppy.jpg",
    },
    # Dodaj więcej gatunków...
]

with app.app_context():
    for fish in fish_data:
        existing = FishSpecies.query.filter_by(name=fish["name"]).first()
        if existing:
            # 🔁 Aktualizuj dane
            for key, value in fish.items():
                setattr(existing, key, value)
            print(f"Updated {fish['name']}")
        else:
            # ➕ Dodaj nowy wpis
            new_fish = FishSpecies(**fish)
            db.session.add(new_fish)
            print(f"Added {fish['name']}")
    db.session.commit()
    print("✅ Fish database updated.")
