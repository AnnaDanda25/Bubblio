from app import app
from models import db, FishSpecies

with app.app_context():
    if FishSpecies.query.count() == 0:
        fish_list = [
            FishSpecies(
                name="Neon Tetra",
                image="neon.png",
                adult_length=3.5,
                min_temp=20,
                max_temp=26,
                min_ph=5.0,
                max_ph=7.0,
                min_kh=1,
                max_kh=5,
                min_gh=2,
                max_gh=10,
                description="Peaceful schooling fish, great for community tanks.",
            ),
            FishSpecies(
                name="Guppy",
                image="guppy.png",
                adult_length=5,
                min_temp=22,
                max_temp=28,
                min_ph=6.8,
                max_ph=7.8,
                min_kh=4,
                max_kh=8,
                min_gh=8,
                max_gh=12,
                description="Colorful, active and easy to keep.",
            ),
            FishSpecies(
                name="Platy",
                image="platy.png",
                adult_length=6,
                min_temp=22,
                max_temp=26,
                min_ph=7.0,
                max_ph=8.2,
                min_kh=4,
                max_kh=10,
                min_gh=10,
                max_gh=28,
                description="Great beginner fish, peaceful and hardy.",
            ),
        ]
        db.session.add_all(fish_list)
        db.session.commit()
        print("Fish species added to the database.")
    else:
        print("Fish species already exist.")
