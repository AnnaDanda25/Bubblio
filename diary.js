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

  // === LIGHTBOX FUNCTIONALITY ===
  const thumbnails = document.querySelectorAll('.gallery-thumb');
  const overlay = document.getElementById('lightboxOverlay');
  const lightboxImg = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');

  let currentIndex = 0;

  function showImage(index) {
    const img = thumbnails[index];
    lightboxImg.classList.remove('fade-only');
    void lightboxImg.offsetWidth;
    lightboxImg.src = img.src;
    caption.textContent = img.alt;
    currentIndex = index;
    lightboxImg.classList.add('fade-only');
  }

  thumbnails.forEach((img, index) => {
    img.addEventListener('click', () => {
      showImage(index);
      overlay.classList.remove('d-none');
    });
  });

  closeBtn.addEventListener('click', () => {
    overlay.classList.add('d-none');
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('d-none');
  });

  prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
    showImage(currentIndex, 'left');
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % thumbnails.length;
    showImage(currentIndex, 'right');
  });

  // === Obsługa klawiszy strzałek w lightboxie ===
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('d-none')) {
      if (e.key === 'ArrowLeft') {
        currentIndex = (currentIndex - 1 + thumbnails.length) % thumbnails.length;
        showImage(currentIndex);
      } else if (e.key === 'ArrowRight') {
        currentIndex = (currentIndex + 1) % thumbnails.length;
        showImage(currentIndex);
      } else if (e.key === 'Escape') {
        overlay.classList.add('d-none'); // zamykanie lightboxa Esc
      }
    }
  });


});
