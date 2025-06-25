from flask import render_template, request, redirect, session, flash, url_for, jsonify
from models import db, User, Tank, FishSpecies, FishInstance, FishStock, ImportantTask
from tanks import tanks
from datetime import datetime, date
from werkzeug.utils import secure_filename
import os
import json


def get_compatibility_mismatches(tank):
    # Przyjmujemy, że ostatnio wybrana ryba to ta ostatnia dodana
    last = (
        FishStock.query.filter_by(tank_id=tank.id).order_by(FishStock.id.desc()).first()
    )
    if not last:
        return []

    fish = last.fish
    mismatches = []
    if not (fish.min_temp <= tank.temperature <= fish.max_temp):
        mismatches.append("temperature")
    if not (fish.min_ph <= tank.ph <= fish.max_ph):
        mismatches.append("pH")
    if not (fish.min_kh <= tank.kh <= fish.max_kh):
        mismatches.append("KH")
    if not (fish.min_gh <= tank.gh <= fish.max_gh):
        mismatches.append("GH")
    return mismatches


def safe_isoformat(value):
    if isinstance(value, date):
        return value.isoformat()
    return ""


# 🌊 Widok zbiorników użytkownika
@tanks.route("/")
def view_tanks():
    if "user_id" not in session:
        flash("Please log in to view tanks.", "warning")
        return redirect(url_for("auth.login"))

    user = User.query.get(session["user_id"])
    user_tanks = Tank.query.filter_by(user_id=user.id).all()

    for tank in user_tanks:
        tank.fish_stock = FishStock.query.filter_by(tank_id=tank.id).all()
        try:
            tank.daily_checks_list = (
                json.loads(tank.daily_checks) if tank.daily_checks else []
            )
        except Exception:
            tank.daily_checks_list = []

    species_list = FishSpecies.query.all()
    selected_tank = user_tanks[0] if user_tanks else None

    # ✅ Important tasks – serializacja odporna na błędy
    for tank in user_tanks:
        tank.fish_stock = FishStock.query.filter_by(tank_id=tank.id).all()

        try:
            tank.daily_checks_list = (
                json.loads(tank.daily_checks) if tank.daily_checks else []
            )
        except Exception:
            tank.daily_checks_list = []

        # ✅ Important tasks – serializacja odporna na błędy
        tank.important_tasks_list = []
        tasks = ImportantTask.query.filter_by(tank_id=tank.id).all()
        for t in tasks:
            task_dict = {
                "task_type": t.task_type or "",
                "start_date": safe_isoformat(t.start_date),
                "interval_days": t.interval_days if t.interval_days is not None else "",
            }
            tank.important_tasks_list.append(task_dict)

        tank.important_tasks_serialized = tank.important_tasks_list

    return render_template(
        "tanks.html",
        tanks=user_tanks,
        user=user,
        bubbles=user.bubbles if user else 0,
        species_list=species_list,
        selected_tank=selected_tank,
    )


# ➕ Dodawanie zbiornika
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
        image.save(os.path.join(uploads_dir, image_filename))

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
            user_id=session.get("user_id"),
        )
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

    # ✅ Zarybienie – tylko informacyjne, NIE blokujemy
    current_cm = sum(
        fs.count * fs.fish.adult_length
        for fs in FishStock.query.filter_by(tank_id=tank.id).all()
    )
    added_cm = count * fish.adult_length
    total_cm = current_cm + added_cm

    # ✅ Dodanie do stocku
    existing = FishStock.query.filter_by(tank_id=tank_id, fish_id=fish_id).first()
    if existing:
        existing.count += count
    else:
        new_entry = FishStock(tank_id=tank_id, fish_id=fish_id, count=count)
        db.session.add(new_entry)

    db.session.commit()

    return (
        jsonify(
            {
                "message": "Fish added",
                "mismatches": mismatches,
                "total_cm": total_cm,
                "tank_volume": tank.volume,
            }
        ),
        200,
    )


# 🗑️ Usuwanie zbiornika
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


# ✏️ Edycja zbiornika
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
            image.save(os.path.join(uploads_dir, image_filename))
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
    fish_id = request.args.get("fish_id", type=int)
    tank = Tank.query.get(tank_id)
    stock = FishStock.query.filter_by(tank_id=tank_id).all()
    total_cm = sum(s.count * s.fish.adult_length for s in stock)

    mismatches = []
    if fish_id:
        fish = FishSpecies.query.get(fish_id)
        if fish:
            if not (fish.min_temp <= tank.temperature <= fish.max_temp):
                mismatches.append("temperature")
            if not (fish.min_ph <= tank.ph <= fish.max_ph):
                mismatches.append("pH")
            if not (fish.min_kh <= tank.kh <= fish.max_kh):
                mismatches.append("KH")
            if not (fish.min_gh <= tank.gh <= fish.max_gh):
                mismatches.append("GH")

    result = [
        {
            "id": s.id,
            "name": s.fish.name,
            "count": s.count,
            "length": s.fish.adult_length,
        }
        for s in stock
    ]
    return jsonify(
        {
            "stock": result,
            "total_cm": total_cm,
            "tank_volume": tank.volume,
            "mismatches": mismatches,
        }
    )


@tanks.route("/delete_fish/<int:stock_id>", methods=["POST"])
def delete_fish(stock_id):
    fish = FishStock.query.get_or_404(stock_id)
    db.session.delete(fish)
    db.session.commit()
    return jsonify({"success": True})


# ✅ Zapis ustawień daily checks
@tanks.route("/update_checks", methods=["POST"])
def update_checks():
    if "user_id" not in session:
        flash("Please log in.", "warning")
        return redirect(url_for("auth.login"))

    tank_id = request.form.get("tank_id")
    selected_checks = request.form.getlist("checks")

    print(f"🔍 OTRZYMANE: tank_id={tank_id}, checks={selected_checks}")  # ⬅️ dodaj to

    tank = Tank.query.filter_by(id=tank_id, user_id=session["user_id"]).first()
    if tank:
        try:
            tank.daily_checks = json.dumps(selected_checks)
            db.session.commit()
            flash("Daily checks saved!", "success")
        except Exception as e:
            db.session.rollback()
            flash(f"Error saving checks: {str(e)}", "danger")
    else:
        flash("Tank not found or access denied.", "danger")

    return redirect(url_for("tanks.view_tanks"))


# ✅ Zapis ustawień important tasks
@tanks.route("/update_important_tasks", methods=["POST"])
def update_important_tasks():
    if "user_id" not in session:
        flash("Please log in.", "warning")
        return redirect(url_for("auth.login"))

    tank_id = request.form.get("tank_id")
    tank = Tank.query.filter_by(id=tank_id, user_id=session["user_id"]).first()

    if not tank:
        flash("Tank not found or access denied.", "danger")
        return redirect(url_for("tanks.view_tanks"))

    # 🧹 Usuń poprzednie ważne zadania
    ImportantTask.query.filter_by(tank_id=tank.id).delete()

    # 🔁 Zapisz zaznaczone
    for key in request.form:
        if key.startswith("important_tasks"):
            value = request.form[key]
            task_type = value
            start_date = request.form.get(f"{task_type}_start")
            interval = request.form.get(f"{task_type}_interval")

            if start_date and interval:
                new_task = ImportantTask(
                    tank_id=tank.id,
                    task_type=task_type,
                    start_date=datetime.strptime(start_date, "%Y-%m-%d").date(),
                    interval_days=int(interval),
                )
                db.session.add(new_task)

    db.session.commit()
    flash("Important tasks saved!", "success")
    return redirect(url_for("tanks.view_tanks"))
