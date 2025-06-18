from flask import render_template, request, redirect, url_for, session, flash
from mainpage import mainpage
from models import db, Task, Tank, ImportantTask
from datetime import datetime, timedelta
from sqlalchemy.orm import joinedload
import json

@mainpage.route('/')
def home():
    if 'user_id' not in session:
        flash('Please log in to access Bubblio.', 'warning')
        return redirect(url_for('auth.login'))

    user_id = session['user_id']
    today = datetime.today().date()

    # Pobierz zadania i zbiorniki (z relacją do important_tasks!)
    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.date.asc()).all()
    tanks = Tank.query.options(joinedload(Tank.important_tasks)).filter_by(user_id=user_id).all()

    virtual_tasks = []

    for tank in tanks:
        # 🐠 Daily checks – konwersja do JSON jeśli trzeba
        if isinstance(tank.daily_checks, list):
            tank.daily_checks = json.dumps(tank.daily_checks)

        # 🔁 Important Tasks – generowanie na najbliższe 14 dni
        for task in tank.important_tasks:
            title = task.task_type.replace('_', ' ').title()
            start_date = task.start_date
            interval_days = task.interval_days

            if not (title and start_date and interval_days):
                continue

            for day_offset in range(15):  # Dziś + 14 dni
                check_date = today + timedelta(days=day_offset)
                delta_days = (check_date - start_date).days
                if delta_days >= 0 and delta_days % interval_days == 0:
                    task_title = f"{title} ({tank.name})"
                    virtual_tasks.append({
                        'title': task_title,
                        'date': check_date.strftime('%Y-%m-%d')
                    })

    return render_template('mainpage.html', tasks=tasks, virtual_tasks=virtual_tasks, tanks=tanks)


@mainpage.route('/add_task', methods=['POST'])
def add_task():
    if 'user_id' not in session:
        flash('Please log in to add tasks.', 'warning')
        return redirect(url_for('auth.login'))

    date = request.form.get('taskDate')
    title = request.form.get('taskDescription')
    recurring_type = request.form.get('recurringType')
    interval = request.form.get('recurringInterval', type=int)
    count = request.form.get('recurringCount', type=int)

    user_id = session['user_id']

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
        new_task = Task(
            title=title,
            date=date,
            recurring=False,
            user_id=user_id
        )
        db.session.add(new_task)

    db.session.commit()
    return redirect(url_for('mainpage.home'))
