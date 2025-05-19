document.addEventListener('DOMContentLoaded', function () {
  // === Hamburger toggle ===
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  // === Note Form Logic ===
  const toggleNoteForm = document.getElementById('toggleNoteForm');
  const noteForm = document.getElementById('noteForm');
  toggleNoteForm?.addEventListener('click', () => {
    noteForm.classList.toggle('d-none');
  });

  // === Add Note ===
  const noteDate = document.getElementById('noteDate');
  const noteTitle = document.getElementById('noteTitle');
  const noteText = document.getElementById('noteText');
  const notesList = document.getElementById('notesList');

  noteForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = noteDate.value;
    const title = noteTitle.value.trim();
    const text = noteText.value.trim();

    if (date && title && text) {
      const noteItem = document.createElement('div');
      noteItem.className = 'note-entry mb-3 p-3 bg-light border rounded';
      noteItem.innerHTML = `
        <strong class="note-date">${date}</strong>
        <h5 class="note-title">${title}</h5>
        <p class="mb-0">${text}</p>
      `;
      notesList.insertBefore(noteItem, toggleNoteForm);
      noteForm.reset();
      noteForm.classList.add('d-none');
    }
  });
});
