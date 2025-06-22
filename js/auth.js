export function checkAuthentication() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

export function setupAuthListeners() {
  window.addEventListener('pageshow', () => checkAuthentication());
  window.addEventListener('focus', () => checkAuthentication());
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkAuthentication();
  });

  window.addEventListener('beforeunload', () => {
    sessionStorage.clear();
  });

  setInterval(() => {
    checkAuthentication();
  }, 30000);
}
