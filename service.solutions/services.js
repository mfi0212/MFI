function setTheme(theme) {
  document.documentElement.className = `theme-${theme}`;
  localStorage.setItem('theme', theme);
}
const saved = localStorage.getItem('theme') || 'light';
setTheme(saved);
document.addEventListener('contextmenu', e => e.preventDefault());
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        alert("✅ Back button clicked!\n\n(In a real app this would take you to previous screen or home.)");
    }
}
