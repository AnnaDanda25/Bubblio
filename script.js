document.addEventListener('DOMContentLoaded', function () {
  const calendarMonthYear = document.getElementById('calendarMonthYear');
  const calendarGrid = document.getElementById('calendarGrid');
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  function updateCalendar(month, year) {
    calendarGrid.classList.remove('fade-in');
    calendarGrid.classList.add('fade-out');

    setTimeout(() => {
      const firstDay = new Date(year, month).getDay();
      const daysInMonth = 32 - new Date(year, month, 32).getDate();

      const rawLabel = new Date(year, month).toLocaleString('default', {
        month: 'long',
        year: 'numeric'
      });
      calendarMonthYear.textContent = rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1);

      calendarGrid.innerHTML = '';

      // Weekdays
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekDays.forEach(day => {
        const div = document.createElement('div');
        div.textContent = day;
        div.classList.add('weekday-tile');
        calendarGrid.appendChild(div);
      });

      // Empty tiles before 1st
      for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty-tile');
        calendarGrid.appendChild(emptyDiv);
      }

      // Days
      for (let i = 1; i <= daysInMonth; i++) {
        const div = document.createElement('div');
        div.textContent = i;
        if (
          i === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          div.classList.add('selected');
        }
        calendarGrid.appendChild(div);
      }

      calendarGrid.classList.remove('fade-out');
      calendarGrid.classList.add('fade-in');
    }, 200);
  }

  updateCalendar(currentMonth, currentYear);

  document.getElementById('prevMonth').addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    updateCalendar(currentMonth, currentYear);
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    updateCalendar(currentMonth, currentYear);
  });

  // === TASKS ===
  const taskList = document.getElementById('task-list');
  const addTaskForm = document.getElementById('addTaskForm');
  const tasks = [];

  // Load initial tasks
  document.querySelectorAll('#task-list li').forEach(li => {
    const text = li.textContent.trim();
    if (text) tasks.push(text);
  });

  addTaskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = document.getElementById('taskDate').value;
    const desc = document.getElementById('taskDescription').value;
    const recurringType = document.getElementById('recurringType').value;
    const interval = parseInt(document.getElementById('recurringInterval').value);
    const count = parseInt(document.getElementById('recurringCount').value);

    if (date && desc) {
      if (recurringType === 'recurring' && interval > 0 && count > 0) {
        let currentDate = new Date(date);
        for (let i = 0; i < count; i++) {
          const taskDate = new Date(currentDate);
          const newTask = `${formatDate(taskDate)} – ${desc}`;
          tasks.push(newTask);
          currentDate.setDate(currentDate.getDate() + interval);
        }
      } else {
        const newTask = `${formatDate(date)} – ${desc}`;
        tasks.push(newTask);
      }

      tasks.sort(sortByDate);
      renderTasks();
      bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
      addTaskForm.reset();
      document.getElementById('recurringFields').style.display = 'none';
    }
  });


  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('change', function () {
        li.classList.toggle('text-decoration-line-through', checkbox.checked);
      });
      li.appendChild(checkbox);
      li.append(' ' + task);
      taskList.appendChild(li);
    });
  }

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  }

  function parseDate(task) {
    const match = task.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    if (match) {
      return new Date(match[3], match[2] - 1, match[1]);
    }
    return new Date(3000, 0, 1); // fallback: place at end
  }

  function sortByDate(a, b) {
    return parseDate(a) - parseDate(b);
  }

  renderTasks(); // Initial render with sorted tasks
    // === Your Tanks checkbox strike-through ===
  document.querySelectorAll('.tab-pane input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function () {
      const li = cb.closest('li');
      if (li) {
        li.classList.toggle('text-decoration-line-through', cb.checked);
      }
    });
  });

  // Pokaż/ukryj pola cykliczne po zmianie typu
  document.getElementById('recurringType').addEventListener('change', function () {
    const recurringFields = document.getElementById('recurringFields');
    recurringFields.style.display = this.value === 'recurring' ? 'block' : 'none';
  });

  // === HAMBURGER MENU ===
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
    });
  }
});
