from flask import render_template, session, redirect, url_for, flash, request
from werkzeug.security import generate_password_hash, check_password_hash
from profile import profile
from models import db, User, Task

@profile.route('/')
def view_profile():
    if 'user_id' not in session:
        flash("Please log in to view your profile.", "warning")
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])
    total_tasks = Task.query.filter_by(user_id=user.id).count()
    completed_tasks = Task.query.filter_by(user_id=user.id, is_done=True).count()

    # Przykładowe dane
    bubbles = 21
    level = "Water Amateur"
    tanks = 3
    fishes = 34

    return render_template('profile.html',
                           user=user,
                           bubbles=bubbles,
                           level=level,
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

    if not check_password_hash(user.password, current_password):
        flash("Current password is incorrect.", "danger")
        return redirect(url_for('profile.view_profile'))

    if new_password != confirm_password:
        flash("New passwords do not match.", "danger")
        return redirect(url_for('profile.view_profile'))

    user.password = generate_password_hash(new_password)
    db.session.commit()

    flash("Password changed successfully!", "success")
    return redirect(url_for('profile.view_profile'))
