from flask import render_template, request, redirect, session, flash, url_for
from models import db, User, Tank
from tanks import tanks

# 🔍 Widok zbiorników danego użytkownika
@tanks.route('/')
def view_tanks():
    if 'user_id' not in session:
        flash("Please log in to view tanks.", "warning")
        return redirect(url_for('auth.login'))

    user = User.query.get(session['user_id'])
    user_tanks = Tank.query.filter_by(user_id=user.id).all()

    return render_template('tanks.html', tanks=user_tanks, user=user)

# ➕ Obsługa dodawania zbiornika
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
        from werkzeug.utils import secure_filename
        import os
        image_filename = secure_filename(image.filename)
        image_path = os.path.join('static/uploads', image_filename)
        image.save(image_path)

    new_tank = Tank(
        name=name,
        volume=int(volume),
        temperature=float(temperature) if temperature else None,
        ph=float(ph) if ph else None,
        kh=int(kh) if kh else None,
        gh=int(gh) if gh else None,
        description=description,
        image=image_filename,
        user_id=session['user_id']
    )

    db.session.add(new_tank)
    db.session.commit()

    flash("Tank added successfully!", "success")
    return redirect(url_for('tanks.view_tanks'))
