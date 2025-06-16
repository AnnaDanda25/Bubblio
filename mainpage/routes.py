from flask import render_template, request, redirect, url_for, session, flash
from mainpage import mainpage
from models import db, Task, Tank
from datetime import datetime, timedelta


# Strona główna (main page) – dostęp tylko po zalogowaniu
@mainpage.route('/')
def home():
    if 'user_id' not in session:
        flash('Please log in to access Bubblio.', 'warning')
        return redirect(url_for('auth.login'))

    user_id = session['user_id']
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.date.asc()).all()
    tanks = Tank.query.filter_by(user_id=user_id).all()

    return render_template('mainpage.html', tasks=tasks, tanks=tanks)


# Dodawanie zadania – tylko dla zalogowanego użytkownika
@mainpage.route('/add_task', methods=['POST'])
def add_task():
    if 'user_id' not in session:
        flash('Please log in to add tasks.', 'warning')
        return redirect(url_for('auth.login'))

    # Pobranie danych z formularza
    date = request.form.get('taskDate')
    title = request.form.get('taskDescription')
    recurring_type = request.form.get('recurringType')
    interval = request.form.get('recurringInterval', type=int)
    count = request.form.get('recurringCount', type=int)

    user_id = session['user_id']

    # Obsługa zadań cyklicznych
    if recurring_type == 'recurring' and interval and count:
        start_date = datetime.strptime(date, '%Y-%m-%d')
        for i in range(count):
            new_date = start_date + timedelta(days=i * interval)
            formatted_date = new_date.strftime('%Y-%m-%d')
            new_task = Task(
                title=title,
                date=formatted_date,
                recurring=True,
                repeat_every=interval,
                user_id=user_id
            )
            db.session.add(new_task)
    else:
        # Zadanie jednorazowe
        new_task = Task(
            title=title,
            date=date,
            recurring=False,
            user_id=user_id
        )
        db.session.add(new_task)

    db.session.commit()
    return redirect(url_for('mainpage.home'))
