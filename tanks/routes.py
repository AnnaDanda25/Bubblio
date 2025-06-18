from flask import render_template, request, redirect, session, flash, url_for
from models import db, User, Tank, Fish, ImportantTask
from tanks import tanks
from werkzeug.utils import secure_filename
import os
import json  # ✅ Do zapisu i odczytu daily_checks

# 🌊 Widok zbiorników użytkownika
@tanks.route('/')
def view_tanks():
    if 'user_id' not in session:
        flash("Please log in to view tanks.", "warning")
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])
    user_tanks = Tank.query.filter_by(user_id=user.id).all()
    selected_tank = user_tanks[0] if user_tanks else None  # 🔧 Dodane

    return render_template('tanks.html', tanks=user_tanks, user=user, selected_tank=selected_tank)


# ➕ Dodawanie zbiornika
@tanks.route('/add_tank', methods=['POST'])
def add_tank():
    if 'user_id' not in session:
        flash("Please log in to add a tank.", "warning")
        return redirect(url_for('auth.login'))

    name = request.form.get('name')
    volume = request.form.get('volume')
    temperature = request.form.get('temperature')
    ph = request.form.get('ph')
    kh = request.form.get('kh')
    gh = request.form.get('gh')
    description = request.form.get('description')
    image = request.files.get('image')

    image_filename = None
    if image and image.filename != '':
        uploads_dir = os.path.join('static', 'uploads')
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
            user_id=session.get('user_id')
        )
        db.session.add(new_tank)
        db.session.commit()
        flash("Tank added successfully!", "success")
    except Exception as e:
        db.session.rollback()
        flash(f"Error adding tank: {str(e)}", "danger")

    return redirect(url_for('tanks.view_tanks'))

# 🐠 Dodawanie ryby do zbiornika
@tanks.route('/add_fish', methods=['POST'])
def add_fish():
    if 'user_id' not in session:
        flash("Please log in to add fish.", "warning")
        return redirect(url_for('auth.login'))

    tank_id = request.form.get('tank_id')
    name = request.form.get('name')
    species = request.form.get('species')
    count = request.form.get('count')
    image = request.files.get('image')

    image_filename = None
    if image and image.filename != '':
        fish_dir = os.path.join('static', 'img', 'fish_icons')
        os.makedirs(fish_dir, exist_ok=True)
        image_filename = secure_filename(image.filename)
        image.save(os.path.join(fish_dir, image_filename))

    try:
        new_fish = Fish(
            name=name,
            species=species,
            count=int(count),
            image=image_filename,
            tank_id=int(tank_id)
        )
        db.session.add(new_fish)
        db.session.commit()
        flash("Fish added successfully!", "success")
    except Exception as e:
        db.session.rollback()
        flash(f"Error adding fish: {str(e)}", "danger")

    return redirect(url_for('tanks.view_tanks'))

# 🗑️ Usuwanie zbiornika
@tanks.route('/delete_tank', methods=['POST'])
def delete_tank():
    if 'user_id' not in session:
        flash("Please log in to delete tanks.", "warning")
        return redirect(url_for('auth.login'))

    tank_id = request.form.get('tank_id')
    tank = Tank.query.filter_by(id=tank_id, user_id=session['user_id']).first()

    if tank:
        try:
            db.session.delete(tank)
            db.session.commit()
            flash("Tank deleted successfully!", "success")
        except Exception as e:
            db.session.rollback()
            flash(f"Error deleting tank: {str(e)}", "danger")
    else:
        flash("Tank not found or access denied.", "danger")

    return redirect(url_for('tanks.view_tanks'))

# ✏️ Edycja zbiornika
@tanks.route('/edit_tank', methods=['POST'])
def edit_tank():
    if 'user_id' not in session:
        flash("Please log in to edit a tank.", "warning")
        return redirect(url_for('auth.login'))

    tank_id = request.form.get('tank_id')
    tank = Tank.query.filter_by(id=tank_id, user_id=session['user_id']).first()

    if not tank:
        flash("Tank not found.", "danger")
        return redirect(url_for('tanks.view_tanks'))

    try:
        tank.name = request.form.get('editTankName')
        tank.volume = int(request.form.get('editVolume'))
        tank.temperature = float(request.form.get('editTemperature') or 0)
        tank.ph = float(request.form.get('editPh') or 0)
        tank.kh = int(request.form.get('editKh') or 0)
        tank.gh = int(request.form.get('editGh') or 0)
        tank.description = request.form.get('editDescription')

        image = request.files.get('editImage')
        if image and image.filename != '':
            uploads_dir = os.path.join('static', 'uploads')
            os.makedirs(uploads_dir, exist_ok=True)
            image_filename = secure_filename(image.filename)
            image.save(os.path.join(uploads_dir, image_filename))
            tank.image = image_filename

        db.session.commit()
        flash("Tank updated successfully!", "success")

    except Exception as e:
        db.session.rollback()
        flash(f"Error updating tank: {str(e)}", "danger")

    return redirect(url_for('tanks.view_tanks'))

# ✅ Zapis ustawień daily checks
@tanks.route('/update_checks', methods=['POST'])
def update_checks():
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    tank_id = request.form.get('tank_id')
    selected_checks = request.form.getlist('checks')  # np. ['feed', 'temp']

    tank = Tank.query.filter_by(id=tank_id, user_id=session['user_id']).first()
    if tank:
        tank.daily_checks = selected_checks
        db.session.commit()
        flash("Daily checks saved!", "success")
    else:
        flash("Tank not found or access denied.", "danger")

    return redirect(url_for('tanks.view_tanks'))


# ✅ Zapis ustawień important tasks
@tanks.route('/update_important_tasks', methods=['POST'])
def update_important_tasks():
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    tank_id = request.form.get('tank_id')
    tank = Tank.query.filter_by(id=tank_id, user_id=session['user_id']).first()
    
    if not tank:
        flash("Tank not found or access denied.", "danger")
        return redirect(url_for('tanks.view_tanks'))

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
                    interval_days=int(interval)
                )
                db.session.add(new_task)

    db.session.commit()
    flash("Important tasks saved!", "success")
    return redirect(url_for('tanks.view_tanks'))

