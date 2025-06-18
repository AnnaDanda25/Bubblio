from flask import render_template, request, redirect, session, flash, url_for
from models import db, User, Tank, FishSpecies, FishInstance
from tanks import tanks
from datetime import datetime
from werkzeug.utils import secure_filename
import os


# 🔍 Widok zbiorników danego użytkownika
@tanks.route("/")
def view_tanks():
    if "user_id" not in session:
        flash("Please log in to view tanks.", "warning")
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])
    user_tanks = Tank.query.filter_by(user_id=user.id).all()
    species_list = FishSpecies.query.all()

    # 👇 DEBUG: logujemy dane w terminalu
    print(f"[DEBUG] Logged-in user ID: {user.id} ({user.login})")
    print(f"[DEBUG] Number of tanks: {len(user_tanks)}")

    return render_template(
        "tanks.html", tanks=user_tanks, user=user, species_list=species_list
    )


# ➕ Obsługa dodawania zbiornika
@tanks.route("/add_tank", methods=["POST"])
def add_tank():
    if "user_id" not in session:
        flash("Please log in to add a tank.", "warning")
        return redirect(url_for("auth.login"))

    name = request.form.get("name")
    volume = request.form.get("volume")
    temperature = request.form.get("temperature")
    ph = request.form.get("ph")
    kh = request.form.get("kh")
    gh = request.form.get("gh")
    description = request.form.get("description")
    image = request.files.get("image")

    image_filename = None
    if image and image.filename != "":
        uploads_dir = os.path.join("static", "uploads")
        os.makedirs(uploads_dir, exist_ok=True)
        image_filename = secure_filename(image.filename)
        image_path = os.path.join(uploads_dir, image_filename)
        image.save(image_path)

        try:
            new_tank = Tank(
                name=name,
                volume=int(volume),
                temperature=float(temperature) if temperature else None,
                ph=float(ph) if ph else None,
                kh=int(kh) if kh else None,
                gh=int(gh) if gh else None,
                description=description,
                image=image_filename,
                user_id=session.get("user_id"),  # ⬅️ bezpieczne pobieranie
            )

            print("[DEBUG] Tworzony Tank:")
            print(f"Name: {new_tank.name}")
            print(f"Volume: {new_tank.volume}")
            print(f"User ID: {new_tank.user_id}")

            db.session.add(new_tank)
            db.session.commit()
            flash("Tank added successfully!", "success")
        except Exception as e:
            db.session.rollback()
            flash(f"Error adding tank: {str(e)}", "danger")

    return redirect(url_for("tanks.view_tanks"))


# 🐠 Obsługa dodawania ryby do zbiornika
@tanks.route("/add_fish", methods=["POST"])
def add_fish():
    if "user_id" not in session:
        flash("Please log in to add a fish.", "warning")
        return redirect(url_for("auth.login"))

    tank_id = request.form.get("tank_id")
    species_id = request.form.get("species_id")
    quantity = int(request.form.get("quantity"))

    tank = Tank.query.filter_by(id=tank_id, user_id=session["user_id"]).first()
    species = FishSpecies.query.get(species_id)

    if not tank or not species:
        flash("Tank or fish species not found.", "danger")
        return redirect(url_for("tanks.view_tanks"))

    # Sprawdzanie zgodności parametrów
    mismatch = []
    if not (species.min_temp <= tank.temperature <= species.max_temp):
        mismatch.append("temperature")
    if not (species.min_ph <= tank.ph <= species.max_ph):
        mismatch.append("pH")
    if not (species.min_kh <= tank.kh <= species.max_kh):
        mismatch.append("KH")
    if not (species.min_gh <= tank.gh <= species.max_gh):
        mismatch.append("GH")

    if mismatch:
        flash(
            f"⚠️ Warning: Tank parameters may not be ideal for this fish: {', '.join(mismatch)}",
            "warning",
        )

    # Obliczenie zarybienia
    total_cm = sum(
        instance.species.adult_length * instance.quantity
        for instance in tank.fish_instances
    )
    new_cm = species.adult_length * quantity
    if total_cm + new_cm > tank.volume:
        flash("⚠️ This fish may overcrowd the tank.", "warning")

    # Dodanie instancji
    new_instance = FishInstance(
        tank_id=tank.id, species_id=species.id, quantity=quantity
    )

    db.session.add(new_instance)
    db.session.commit()
    flash("✅ Fish added to your tank!", "success")
    return redirect(url_for("tanks.view_tanks"))


# 🗑️ Obsługa usuwania zbiornika
@tanks.route("/delete_tank", methods=["POST"])
def delete_tank():
    if "user_id" not in session:
        flash("Please log in to delete tanks.", "warning")
        return redirect(url_for("auth.login"))

    tank_id = request.form.get("tank_id")
    if not tank_id:
        flash("Invalid request: no tank selected.", "danger")
        return redirect(url_for("tanks.view_tanks"))

    tank = Tank.query.get(tank_id)
    if tank and tank.user_id == session["user_id"]:
        try:
            db.session.delete(tank)
            db.session.commit()
            flash("Tank deleted successfully!", "success")
        except Exception as e:
            db.session.rollback()
            flash(f"Error deleting tank: {str(e)}", "danger")
    else:
        flash("Tank not found or access denied.", "danger")

    return redirect(url_for("tanks.view_tanks"))


# ✏️ Backendowa edycja zbiornika
@tanks.route("/edit_tank", methods=["POST"])
def edit_tank():
    if "user_id" not in session:
        flash("Please log in to edit a tank.", "warning")
        return redirect(url_for("auth.login"))

    tank_id = request.form.get("tank_id")
    tank = Tank.query.filter_by(id=tank_id, user_id=session["user_id"]).first()

    if not tank:
        flash("Tank not found.", "danger")
        return redirect(url_for("tanks.view_tanks"))

    try:
        tank.name = request.form.get("editTankName")
        tank.volume = int(request.form.get("editVolume"))
        tank.temperature = float(request.form.get("editTemperature") or 0)
        tank.ph = float(request.form.get("editPh") or 0)
        tank.kh = int(request.form.get("editKh") or 0)
        tank.gh = int(request.form.get("editGh") or 0)
        tank.description = request.form.get("editDescription")

        image = request.files.get("editImage")
        if image and image.filename != "":
            uploads_dir = os.path.join("static", "uploads")
            os.makedirs(uploads_dir, exist_ok=True)
            image_filename = secure_filename(image.filename)
            image_path = os.path.join(uploads_dir, image_filename)
            image.save(image_path)
            tank.image = image_filename

        db.session.commit()
        flash("Tank updated successfully!", "success")

    except Exception as e:
        db.session.rollback()
        flash(f"Error updating tank: {str(e)}", "danger")

    return redirect(url_for("tanks.view_tanks"))
