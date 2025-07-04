document.addEventListener('DOMContentLoaded', function () {
  // Hamburger
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  menuToggle?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));

  // Note Form Logic
  const toggleNoteForm = document.getElementById('toggleNoteForm');
  const noteForm = document.getElementById('noteForm');
  const noteDate = document.getElementById('noteDate');
  const noteTitleInput = document.getElementById('noteTitle');
  const noteText = document.getElementById('noteText');
  const notesList = document.getElementById('notesList');
  const sortSelect = document.getElementById('sortNotes');

  toggleNoteForm?.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10);
    noteDate.value = today;
    noteForm.classList.toggle('d-none');
  });

  noteForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const date = noteDate.value;
    const title = noteTitleInput.value.trim();
    const text = noteText.value.trim();

    if (date && title && text) {
      fetch('/diary/add_note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ title, content: text })
      })
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.text();
        })
        .then(() => {
          const noteItem = document.createElement('div');
          noteItem.className = 'note-entry mb-3 p-3 bg-light border rounded position-relative';
          noteItem.innerHTML = `
            <strong class="note-date">${date}</strong>
            <h5 class="note-title">${title}</h5>
            <p class="mb-0">${text}</p>
          `;
          notesList.insertBefore(noteItem, notesList.querySelector('.sticky-button-container'));
          noteForm.reset();
          noteForm.classList.add('d-none');
          sortAndRenderNotes();
        })
        .catch(error => {
          console.error('Error:', error);
          alert("There was a problem adding the note.");
        });
    }
  });

  sortSelect?.addEventListener('change', sortAndRenderNotes);

  function sortAndRenderNotes() {
    const entries = Array.from(notesList.querySelectorAll('.note-entry'));
    const selected = sortSelect?.value || 'date-desc';

    entries.sort((a, b) => {
      const dateA = a.querySelector('.note-date').textContent.trim();
      const dateB = b.querySelector('.note-date').textContent.trim();
      const titleA = a.querySelector('.note-title').textContent.trim().toLowerCase();
      const titleB = b.querySelector('.note-title').textContent.trim().toLowerCase();

      if (selected === 'date-asc') return dateA.localeCompare(dateB);
      if (selected === 'date-desc') return dateB.localeCompare(dateA);
      if (selected === 'title-asc') return titleA.localeCompare(titleB);
      if (selected === 'title-desc') return titleB.localeCompare(titleA);
      return 0;
    });

    const stickyBtn = notesList.querySelector('.sticky-button-container');
    entries.forEach(entry => {
      notesList.insertBefore(entry, stickyBtn);
    });
  }

  sortAndRenderNotes();

  // Photo modal
  const addPhotoBtn = document.getElementById('addPhotoBtn');
  const photoModal = new bootstrap.Modal(document.getElementById('photoModal'));
  addPhotoBtn?.addEventListener('click', () => photoModal.show());

  // Lightbox for photos
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

  closeBtn.addEventListener('click', () => overlay.classList.add('d-none'));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('d-none');
  });
  prevBtn.addEventListener('click', () => showImage((currentIndex - 1 + thumbnails.length) % thumbnails.length));
  nextBtn.addEventListener('click', () => showImage((currentIndex + 1) % thumbnails.length));
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('d-none')) {
      if (e.key === 'ArrowLeft') showImage((currentIndex - 1 + thumbnails.length) % thumbnails.length);
      else if (e.key === 'ArrowRight') showImage((currentIndex + 1) % thumbnails.length);
      else if (e.key === 'Escape') overlay.classList.add('d-none');
    }
  });

  // Edit Note Modal
  const editNoteModal = document.getElementById('editNoteModal');
  const editNoteForm = document.getElementById('editNoteForm');
  const editTitle = document.getElementById('editNoteTitle');
  const editContent = document.getElementById('editNoteContent');
  const editDate = document.getElementById('editNoteDate');

  editNoteModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const noteId = button.getAttribute('data-note-id');
    const title = button.getAttribute('data-note-title');
    const content = button.getAttribute('data-note-content');
    const date = button.getAttribute('data-note-date');

    editTitle.value = title;
    editContent.value = content;
    editDate.value = date;
    editNoteForm.action = `/diary/edit_note/${noteId}`;
  });

  // Edit Photo Modal
  const editPhotoModal = document.getElementById('editPhotoModal');
  const editPhotoForm = document.getElementById('editPhotoForm');
  const editPhotoTitleInput = document.getElementById('editPhotoTitle');

  editPhotoModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const photoId = button.getAttribute('data-photo-id');
    const title = button.getAttribute('data-photo-title');

    editPhotoTitleInput.value = title;
    editPhotoForm.action = `/diary/edit_photo/${photoId}`;
  });

  // Note Lightbox Modal (custom)
  const noteLightbox = document.getElementById('noteLightboxOverlay');
  const noteClose = document.getElementById('noteLightboxClose');
  const viewNoteTitle = document.getElementById('viewNoteTitle');
  const viewNoteContent = document.getElementById('viewNoteContent');
  const viewNoteDate = document.getElementById('viewNoteDate');

  notesList?.addEventListener('click', function (e) {
    const noteEntry = e.target.closest('.note-entry');
    const isEdit = e.target.closest('[data-bs-target="#editNoteModal"]');
    const isDelete = e.target.closest('form[action*="delete_note"]');

    if (noteEntry && !isEdit && !isDelete) {
      const title = noteEntry.querySelector('.note-title')?.textContent || 'Untitled';
      const content = noteEntry.querySelector('p')?.textContent || '';
      const date = noteEntry.querySelector('.note-date')?.textContent || '';

      viewNoteTitle.textContent = title;
      viewNoteContent.textContent = content;
      viewNoteDate.textContent = date;

      noteLightbox.classList.remove('d-none');
    }
  });

  noteClose?.addEventListener('click', () => noteLightbox.classList.add('d-none'));
  noteLightbox?.addEventListener('click', (e) => {
    if (e.target === noteLightbox) noteLightbox.classList.add('d-none');
  });
});
