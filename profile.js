document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');

  function updateSidebarState() {
    if (window.innerWidth > 991) {
      sidebar.classList.remove('collapsed'); 
    } else {
      sidebar.classList.add('collapsed'); 
    }
  }

  toggleButton.addEventListener('click', () => {
    if (window.innerWidth <= 991) {
      sidebar.classList.toggle('collapsed');
    }
  });

  updateSidebarState();
  window.addEventListener('resize', updateSidebarState);
});
