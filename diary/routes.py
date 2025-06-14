from flask import render_template, redirect, url_for, session, flash
from diary import diary

# 📝 Widok zakładki Diary
@diary.route('/')
def view_diary():
    if 'user_id' not in session:
        flash("Please log in to view the diary.", "warning")
        return redirect(url_for('auth.login'))

    return render_template('diary.html')
