(function () {
  try {
    if (localStorage.getItem('cdes_study_theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {
    // Ignore storage access restrictions
  }
})();
