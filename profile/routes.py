from flask import render_template, session, redirect, url_for, flash, request
from werkzeug.security import generate_password_hash, check_password_hash
from profile import profile
from models import db, User, Task
from flask import Blueprint, jsonify

auth = Blueprint('auth', __name__)

@profile.route('/')
def view_profile():
    if 'user_id' not in session:
        flash("Please log in to view your profile.", "warning")
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])
    total_tasks = Task.query.filter_by(user_id=user.id).count()
    completed_tasks = Task.query.filter_by(user_id=user.id, is_done=True).count()

    # Faktyczna liczba bąbelków użytkownika – jeśli masz pole `bubbles`, użyj go
    bubbles = user.bubbles if hasattr(user, 'bubbles') else 21  # domyślnie 21 jeśli brak

    # Oblicz level (1–10), co 100 bąbelków
    level_number = min(bubbles // 100 + 1, 10)

    # Nazwy leveli
    level_names = {
        1: "Lil’ Plankton",
        2: "Plankton",
        3: "Plankton Pro",
        4: "Lil’ Shrimp",
        5: "Shrimp",
        6: "Master Shrimp",
        7: "Lil’ Fish",
        8: "Fish",
        9: "Fish Specialist",
        10: "Shark"
    }

    # Lista wszystkich leveli do wyświetlenia przycisków
    levels = [{"id": i, "name": level_names[i]} for i in range(1, 11)]

    # Przykładowe stałe dane – jak wcześniej
    tanks = 3
    fishes = 34

    return render_template('profile.html',
                           user=user,
                           bubbles=bubbles,
                           level=level_number,
                           level_name=level_names[level_number],
                           levels=levels,
                           tanks=tanks,
                           fishes=fishes,
                           completed_tasks=completed_tasks)


@profile.route('/change_password', methods=['POST'])
def change_password():
    if 'user_id' not in session:
        flash("You must be logged in.", "warning")
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])

    current_password = request.form.get('current_password')
    new_password = request.form.get('new_password')
    confirm_password = request.form.get('confirm_password')

    # 1. Weryfikacja obecnego hasła
    if not check_password_hash(user.password, current_password):
        flash("Current password is incorrect.", "danger")
        return redirect(url_for('profile.view_profile'))

    # 2. Sprawdzenie zgodności nowego hasła i potwierdzenia
    if new_password != confirm_password:
        flash("New passwords do not match.", "danger")
        return redirect(url_for('profile.view_profile'))

    # 3. Zapisanie nowego hasła (zahashowanego!)
    user.password = generate_password_hash(new_password)
    db.session.commit()

    flash("Password changed successfully! You can now log in with your new password.", "success")
    return redirect(url_for('profile.view_profile'))


@auth.route('/check_login', methods=['POST'])
def check_login():
    login = request.json.get('login')
    if not login:
        return jsonify({'available': False})
    
    existing_user = User.query.filter_by(login=login).first()
    return jsonify({'available': existing_user is None})

@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        login = request.form.get('login')
        password = request.form.get('password')
        confirm = request.form.get('confirm_password')

        if not name or not login or not password or not confirm:
            flash("Please fill out all fields.", "danger")
            return redirect(url_for('auth.register'))

        if password != confirm:
            flash("Passwords do not match.", "danger")
            return redirect(url_for('auth.register'))

        existing_user = User.query.filter_by(login=login).first()
        if existing_user:
            flash("This login is already taken.", "danger")
            return redirect(url_for('auth.register'))

        hashed_password = generate_password_hash(password)
        new_user = User(name=name, login=login, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash("Account created successfully. You can now log in.", "success")
        return redirect(url_for('auth.login'))

    return render_template("registration.html")


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login = request.form.get('login')
        password = request.form.get('password')

        if not login or not password:
            flash("Invalid login or password.", "danger")
            return render_template("login.html")


        user = User.query.filter_by(login=login).first()
        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            flash("Logged in successfully.", "success")
            return redirect(url_for('profile.view_profile'))
        else:
            flash("Invalid login or password.", "danger")
            return redirect(url_for('auth.login'))

    return render_template("login.html")


