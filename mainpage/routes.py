from flask import render_template, request, redirect, url_for, session, flash, jsonify
from mainpage import mainpage
from models import db, Task, Tank, ImportantTask, CompletedImportantTask
from datetime import date, datetime, timedelta
from sqlalchemy.orm import joinedload
import json

@mainpage.route('/')
def home():
    if 'user_id' not in session:
        flash('Please log in to access Bubblio.', 'warning')
        return redirect(url_for('auth.login'))

    user_id = session['user_id']
    today = datetime.today().date()

    tasks = Task.query.filter_by(user_id=user_id).order_by(Task.date.asc()).all()
    tanks = Tank.query.options(joinedload(Tank.important_tasks)).filter_by(user_id=user_id).all()

    # 🔍 Zbiór wykonanych ważnych zadań
    completed_set = set()
    completed_entries = CompletedImportantTask.query.filter_by(user_id=user_id).all()
    for c in completed_entries:
        completed_set.add((c.task_type, c.tank_id, c.completed_date))

    virtual_tasks = []

    for tank in tanks:
        # 🐠 Daily checks – konwersja do listy jeśli potrzeba
        if isinstance(tank.daily_checks, str):
            try:
                tank.daily_checks = json.loads(tank.daily_checks)
            except json.JSONDecodeError:
                tank.daily_checks = []

        # 🔁 Important Tasks – generowanie na 14 dni
        for task in tank.important_tasks:
            title = task.task_type.replace('_', ' ').title()
            start_date = task.start_date
            interval_days = task.interval_days

            if not (title and start_date and interval_days):
                continue

            for day_offset in range(15):
                check_date = today + timedelta(days=day_offset)
                delta_days = (check_date - start_date).days
                if delta_days >= 0 and delta_days % interval_days == 0:
                    is_done = (task.task_type, tank.id, check_date) in completed_set

                    # ❌ Pomijamy wykonane zadania w przeszłości
                    if is_done and check_date < today:
                        continue

                    is_overdue = check_date < today and not is_done

                    virtual_tasks.append({
                        'title': f"{title} ({tank.name})",
                        'date': check_date.strftime('%Y-%m-%d'),
                        'task_type': task.task_type,
                        'tank_id': tank.id,
                        'is_done': is_done,
                        'overdue': is_overdue
                    })

    combined_tasks = []

    for t in tasks:
        task_date = t.date
        if isinstance(task_date, str):
            task_date = datetime.strptime(task_date, '%Y-%m-%d').date()

        # ❌ Pomijamy wykonane w przeszłości
        if t.is_done and task_date < today:
            continue

        is_overdue = task_date < today and not t.is_done

        combined_tasks.append({
            'id': t.id,
            'title': t.title,
            'date': t.date.strftime('%Y-%m-%d') if isinstance(t.date, (datetime, date)) else t.date,
            'is_done': t.is_done,
            'overdue': is_overdue
        })

    combined_tasks += virtual_tasks
    combined_tasks.sort(key=lambda t: t['date'])

    return render_template('mainpage.html', combined_tasks=combined_tasks, tanks=tanks, current_date=date.today().strftime('%Y-%m-%d'))



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


@mainpage.route('/upcoming_tasks_data')
def upcoming_tasks_data():
    today = date.today()
    end_date = today + timedelta(days=14)
    upcoming = []

    tasks = ImportantTask.query.join(Tank).all()
    for task in tasks:
        task_date = task.start_date
        while task_date <= end_date:
            if task_date >= today:
                upcoming.append({
                    "date": task_date.strftime("%Y-%m-%d"),
                    "task_type": task.task_type,
                    "tank_name": task.tank.name if task.tank else "Unknown Tank"
                })
            task_date += timedelta(days=task.interval_days or 7)

    upcoming.sort(key=lambda x: x["date"])
    return jsonify(upcoming)


@mainpage.route('/complete_important_task', methods=['POST'])
def complete_important_task():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 403

    data = request.get_json()
    user_id = session['user_id']
    task_type = data.get('task_type')
    tank_id = data.get('tank_id')
    date = data.get('date')

    if not all([task_type, tank_id, date]):
        return jsonify({'error': 'Missing data'}), 400

    done = CompletedImportantTask(
        user_id=user_id,
        tank_id=tank_id,
        task_type=task_type,
        completed_date=date
    )
    db.session.add(done)

    from models import User
    user = User.query.get(user_id)
    if user:
        user.bubbles = (getattr(user, 'bubbles', 0) or 0) + 3

    db.session.commit()
    return jsonify({'status': 'success'})
