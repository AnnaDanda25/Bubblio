import os
import uuid
from flask import render_template, redirect, url_for, session, flash, request
from werkzeug.utils import secure_filename
from diary import diary
from models import db, Photo, Note, User

# 📓 Wyświetlenie zakładki Diary
@diary.route('/')
def view_diary():
    if 'user_id' not in session:
        flash("Please log in to view the diary.", "warning")
        return redirect(url_for('auth.login'))

    user_id = session['user_id']
    user = User.query.get(user_id)
    photos = Photo.query.filter_by(user_id=user_id).order_by(Photo.created_at.desc()).all()
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.created_at.desc()).all()

    return render_template('diary.html', user=user, photos=photos, notes=notes)

# 🖼️ Dodawanie zdjęcia do galerii
@diary.route('/add_photo', methods=['POST'])
def add_photo():
    if 'user_id' not in session:
        flash("Please log in to add a photo.", "warning")
        return redirect(url_for('auth.login'))

    # Pobierz dane z formularza
    title = request.form.get('title')
    photo_file = request.files.get('photo')

    # Walidacja pliku
    if not photo_file or photo_file.filename == '':
        flash("No photo selected.", "danger")
        return redirect(url_for('diary.view_diary'))

    # Ustal unikalną nazwę pliku
    filename = secure_filename(photo_file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    upload_folder = os.path.join('static', 'uploads')
    upload_path = os.path.join(upload_folder, unique_filename)

    # Upewnij się, że folder istnieje
    os.makedirs(upload_folder, exist_ok=True)

    # Zapisz plik
    photo_file.save(upload_path)

    # Zapisz do bazy
    new_photo = Photo(
        title=title,
        filename=unique_filename,
        user_id=session['user_id']
    )
    db.session.add(new_photo)
    db.session.commit()

    flash("Photo added successfully!", "success")
    return redirect(url_for('diary.view_diary'))
