export function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('jwt');
    sessionStorage.clear();

    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }

    window.location.replace('/login');
  });
}
