document.addEventListener('DOMContentLoaded', function () {
  const calendarMonthYear = document.getElementById('calendarMonthYear');
  const calendarGrid = document.getElementById('calendarGrid');
  let today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  function updateCalendar(month, year) {
    const firstDay = new Date(year, month).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    calendarMonthYear.textContent = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    calendarGrid.innerHTML = '';
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    weekDays.forEach(day => {
      const div = document.createElement('div');
      div.textContent = day;
      calendarGrid.appendChild(div);
    });
    for (let i = 0; i < firstDay; i++) {
      calendarGrid.appendChild(document.createElement('div'));
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const div = document.createElement('div');
      div.textContent = i;
      if (i === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
        div.classList.add('selected');
      }
      calendarGrid.appendChild(div);
    }
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

  const taskList = document.getElementById('task-list');
  const addTaskForm = document.getElementById('addTaskForm');
  const tasks = [];

  document.querySelectorAll('#task-list li').forEach(li => tasks.push(li.textContent.trim()));

  addTaskForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = document.getElementById('taskDate').value;
    const desc = document.getElementById('taskDescription').value;
    if (date && desc) {
      const newTask = `${formatDate(date)} – ${desc}`;
      tasks.push(newTask);
      tasks.sort(sortByDate);
      renderTasks();
      bootstrap.Modal.getInstance(document.getElementById('addTaskModal')).hide();
      addTaskForm.reset();
    }
  });

  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `<input type="checkbox" /> ${task}`;
      taskList.appendChild(li);
    });
  }

  function formatDate(inputDate) {
    const date = new Date(inputDate);
    return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
  }

  function sortByDate(a, b) {
    return parseDate(a) - parseDate(b);
  }

  function parseDate(task) {
    const match = task.match(/(\\d{2})\\.(\\d{2})\\.(\\d{4})/);
    return match ? new Date(match[3], match[2] - 1, match[1]) : new Date();
  }

  document.addEventListener('change', function (e) {
    if (e.target.type === 'checkbox') {
      const li = e.target.closest('li');
      if (li) li.classList.toggle('text-decoration-line-through', e.target.checked);
    }
  });
});
