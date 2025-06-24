from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash, check_password_hash
from models import db, User
from auth import auth  # używamy już utworzonego Blueprinta z __init__.py

# Strona rejestracji
@auth.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form.get('name')
        login = request.form.get('login')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')

        existing_user = User.query.filter_by(login=login).first()
        if existing_user:
            flash('Login already exists. Please choose another.', 'danger')
            return redirect(url_for('auth.register'))

        if password != confirm_password:
            flash('Passwords do not match.', 'danger')
            return redirect(url_for('auth.register'))

        hashed_password = generate_password_hash(password)
        new_user = User(name=name, login=login, password=hashed_password)
        db.session.add(new_user)
        db.session.commit()

        flash('Account created successfully! You can now log in.', 'success')
        return redirect(url_for('auth.login'))

    return render_template('registration.html')


@auth.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login_input = request.form.get('login')
        password_input = request.form.get('password')
        user = User.query.filter_by(login=login_input).first()

        if user and check_password_hash(user.password, password_input):
            session['user_id'] = user.id
            session['user_name'] = user.name
            return redirect(url_for('mainpage.home'))
        else:
            flash('Invalid login or password.', 'danger')
            return redirect(url_for('auth.login'))

    return render_template('login.html')


@auth.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('auth.login'))
