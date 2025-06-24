import os
import uuid
from datetime import datetime
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
    notes = Note.query.filter_by(user_id=user_id).order_by(Note.date.desc()).all()

    return render_template('diary.html', user=user, photos=photos, notes=notes)

# 🖼️ Dodawanie zdjęcia do galerii
@diary.route('/add_photo', methods=['POST'])
def add_photo():
    if 'user_id' not in session:
        flash("Please log in to add a photo.", "warning")
        return redirect(url_for('auth.login'))

    title = request.form.get('title')
    photo_file = request.files.get('photo')

    if not photo_file or photo_file.filename == '':
        flash("No photo selected.", "danger")
        return redirect(url_for('diary.view_diary'))

    filename = secure_filename(photo_file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    upload_folder = os.path.join('static', 'uploads')
    upload_path = os.path.join(upload_folder, unique_filename)

    os.makedirs(upload_folder, exist_ok=True)
    photo_file.save(upload_path)

    new_photo = Photo(
        title=title,
        filename=unique_filename,
        user_id=session['user_id']
    )
    db.session.add(new_photo)
    db.session.commit()

    flash("Photo added successfully!", "success")
    return redirect(url_for('diary.view_diary'))

# 📝 Dodawanie nowej notatki
@diary.route('/add_note', methods=['POST'])
def add_note():
    if 'user_id' not in session:
        flash("Please log in to add a note.", "warning")
        return redirect(url_for('auth.login'))

    title = request.form.get('title')
    content = request.form.get('content')
    date = request.form.get('date')

    if not title or not content:
        flash("Both title and content are required.", "danger")
        return redirect(url_for('diary.view_diary'))

    # Obsługa daty: użyj dzisiejszej, jeśli nie podano
    if not date:
        date_obj = datetime.today().date()
    else:
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d').date()
        except ValueError:
            flash("Invalid date format.", "danger")
            return redirect(url_for('diary.view_diary'))

    new_note = Note(
        title=title,
        content=content,
        date=date_obj,
        user_id=session['user_id']
    )
    db.session.add(new_note)
    db.session.commit()

    flash("Note added successfully!", "success")
    return redirect(url_for('diary.view_diary'))

# 🗑️ Usuwanie notatki
@diary.route('/delete_note/<int:note_id>', methods=['POST'])
def delete_note(note_id):
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    note = Note.query.get_or_404(note_id)

    # Upewnij się, że notatka należy do zalogowanego użytkownika
    if note.user_id != session['user_id']:
        flash("Unauthorized access.", "danger")
        return redirect(url_for('diary.view_diary'))

    db.session.delete(note)
    db.session.commit()

    flash("Note deleted successfully!", "success")
    return redirect(url_for('diary.view_diary'))

# ✏️ Edytowanie notatki
@diary.route('/edit_note/<int:note_id>', methods=['POST'])
def edit_note(note_id):
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    note = Note.query.get_or_404(note_id)

    if note.user_id != session['user_id']:
        flash("Unauthorized access.", "danger")
        return redirect(url_for('diary.view_diary'))

    note.title = request.form.get('title')
    note.content = request.form.get('content')

    date = request.form.get('date')
    try:
        note.date = datetime.strptime(date, '%Y-%m-%d').date()
    except ValueError:
        flash("Invalid date format.", "danger")
        return redirect(url_for('diary.view_diary'))

    db.session.commit()
    flash("Note updated successfully!", "success")
    return redirect(url_for('diary.view_diary'))


# 🗑️ Usuwanie zdjęcia
@diary.route('/delete_photo/<int:photo_id>', methods=['POST'])
def delete_photo(photo_id):
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    photo = Photo.query.get_or_404(photo_id)

    if photo.user_id != session['user_id']:
        flash("Unauthorized access.", "danger")
        return redirect(url_for('diary.view_diary'))

    # Usuń plik z dysku
    photo_path = os.path.join('static', 'uploads', photo.filename)
    if os.path.exists(photo_path):
        os.remove(photo_path)

    db.session.delete(photo)
    db.session.commit()

    flash("Photo deleted successfully!", "success")
    return redirect(url_for('diary.view_diary'))

# ✏️ Edycja tytułu zdjęcia
@diary.route('/edit_photo/<int:photo_id>', methods=['POST'])
def edit_photo(photo_id):
    if 'user_id' not in session:
        flash("Please log in.", "warning")
        return redirect(url_for('auth.login'))

    photo = Photo.query.get_or_404(photo_id)

    if photo.user_id != session['user_id']:
        flash("Unauthorized access.", "danger")
        return redirect(url_for('diary.view_diary'))

    new_title = request.form.get('title')
    if new_title:
        photo.title = new_title
        db.session.commit()
        flash("Photo title updated!", "success")
    else:
        flash("Title cannot be empty.", "danger")

    return redirect(url_for('diary.view_diary'))

