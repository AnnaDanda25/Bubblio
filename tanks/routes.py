from flask import render_template, request, redirect, session, flash, url_for, jsonify
from models import db, User, Tank, FishSpecies, FishInstance, FishStock
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
    for tank in user_tanks:
        tank.fish_stock = FishStock.query.filter_by(tank_id=tank.id).all()
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


@tanks.route("/add_fish_to_tank", methods=["POST"])
def add_fish_to_tank():
    data = request.get_json()
    tank_id = data.get("tank_id")
    fish_id = data.get("fish_id")
    count = data.get("count")

    if not (tank_id and fish_id and count):
        return jsonify({"error": "Missing data"}), 400

    try:
        count = int(count)
    except ValueError:
        return jsonify({"error": "Invalid count"}), 400

    tank = Tank.query.get(tank_id)
    fish = FishSpecies.query.get(fish_id)

    if not tank or not fish:
        return jsonify({"error": "Tank or fish not found"}), 404

    # ✅ Kompatybilność
    mismatches = []
    if not (fish.min_temp <= tank.temperature <= fish.max_temp):
        mismatches.append("temperature")
    if not (fish.min_ph <= tank.ph <= fish.max_ph):
        mismatches.append("pH")
    if not (fish.min_kh <= tank.kh <= fish.max_kh):
        mismatches.append("KH")
    if not (fish.min_gh <= tank.gh <= fish.max_gh):
        mismatches.append("GH")

    # ✅ Zarybienie
    current_cm = sum(fs.count * fs.fish.adult_length for fs in FishStock.query.filter_by(tank_id=tank.id).all())
    added_cm = count * fish.adult_length
    if current_cm + added_cm > tank.volume:
        return jsonify({
            "error": "Overstocking",
            "message": f"Adding these fish exceeds the tank volume: {current_cm + added_cm} cm > {tank.volume} L"
        }), 400

    # ✅ Dodanie do stocku
    existing = FishStock.query.filter_by(tank_id=tank_id, fish_id=fish_id).first()
    if existing:
        existing.count += count
    else:
        new_entry = FishStock(tank_id=tank_id, fish_id=fish_id, count=count)
        db.session.add(new_entry)

    db.session.commit()

    return jsonify({
        "message": "Fish added",
        "mismatches": mismatches  # możesz to obsłużyć w JS do komunikatu
    }), 200



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


@tanks.route("/fish_species")
def fish_species():
    species = FishSpecies.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in species])


@tanks.route("/fish_info/<int:fish_id>")
def fish_info(fish_id):
    fish = FishSpecies.query.get_or_404(fish_id)
    return jsonify(
        {
            "id": fish.id,
            "name": fish.name,
            "min_temperature": fish.min_temp,
            "max_temperature": fish.max_temp,
            "min_ph": fish.min_ph,
            "max_ph": fish.max_ph,
            "min_kh": fish.min_kh,
            "max_kh": fish.max_kh,
            "min_gh": fish.min_gh,
            "max_gh": fish.max_gh,
            "image": fish.image,
        }
    )


@tanks.route("/tank_stock/<int:tank_id>")
def tank_stock(tank_id):
    stock = FishStock.query.filter_by(tank_id=tank_id).all()
    result = []
    for s in stock:
        result.append({"id": s.id, "name": s.fish.name, "count": s.count})
    return jsonify(result)


@tanks.route("/delete_fish/<int:stock_id>", methods=["POST"])
def delete_fish(stock_id):
    fish = FishStock.query.get_or_404(stock_id)
    db.session.delete(fish)
    db.session.commit()
    return jsonify({"success": True})
