(function () {
  try {
    var root = document.documentElement;
    var rawSettings = localStorage.getItem('cdes_user_settings_v1');
    var parsed = rawSettings ? JSON.parse(rawSettings) : null;

    var themeMode =
      parsed && (parsed.themeMode === 'light' || parsed.themeMode === 'dark' || parsed.themeMode === 'system')
        ? parsed.themeMode
        : localStorage.getItem('cdes_study_theme');

    var prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    var isDark = themeMode === 'dark' || (themeMode === 'system' && prefersDark);
    root.classList.toggle('dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';

    if (parsed && typeof parsed === 'object') {
      var accents = { blue: 1, emerald: 1, teal: 1, amber: 1, slate: 1 };
      var layouts = { standard: 1, wide: 1, full: 1 };
      var densities = { comfortable: 1, compact: 1 };
      var fonts = { jakarta: 1, inter: 1, serif: 1, system: 1, mono: 1 };
      var scales = { sm: 1, md: 1, lg: 1, xl: 1 };
      var spacings = { normal: 1, relaxed: 1 };

      if (accents[parsed.accentColor]) root.dataset.accent = parsed.accentColor;
      if (layouts[parsed.layoutWidth]) root.dataset.layout = parsed.layoutWidth;
      if (densities[parsed.cardDensity]) root.dataset.density = parsed.cardDensity;
      if (fonts[parsed.fontFamily]) root.dataset.font = parsed.fontFamily;
      if (scales[parsed.fontScale]) root.dataset.fontScale = parsed.fontScale;
      if (spacings[parsed.lineSpacing]) root.dataset.lineSpacing = parsed.lineSpacing;
      if (parsed.highContrast === true) root.dataset.contrast = 'high';
      if (parsed.reducedMotion === true) root.dataset.reduceMotion = 'true';
    }
  } catch (e) {
    // Ignore storage access or JSON parse restrictions
  }
})();
