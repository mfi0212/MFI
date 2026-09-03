function setTheme(theme) {
  document.documentElement.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}
const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);
// document.addEventListener('contextmenu', e => e.preventDefault());