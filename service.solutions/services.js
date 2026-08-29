function setTheme(theme) {
  document.documentElement.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}

// Load saved theme on page load
const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);