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

      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekDays.forEach(day => {
        const div = document.createElement('div');
        div.textContent = day;
        div.classList.add('weekday-tile');
        calendarGrid.appendChild(div);
      });

      for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.classList.add('empty-tile');
        calendarGrid.appendChild(emptyDiv);
      }

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

  // === Your Tanks checkbox strike-through ===
  document.querySelectorAll('.tab-pane input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', function () {
      const li = cb.closest('li');
      if (li) {
        li.classList.toggle('text-decoration-line-through', cb.checked);
      }
    });
  });

  // Show/hide recurring fields
  document.getElementById('recurringType').addEventListener('change', function () {
    const recurringFields = document.getElementById('recurringFields');
    recurringFields.style.display = this.value === 'recurring' ? 'block' : 'none';
  });

  // === Hamburger menu ===
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function () {
      sidebar.classList.toggle('collapsed');
    });
  }
});
