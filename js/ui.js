export function updateProfileInfo(user) {
  // Set hero avatar (initials)
  const avatarEl = document.getElementById('profileAvatar');
  let initials = '';
  if (user.firstName && user.lastName) {
    initials = user.firstName[0].toUpperCase() + user.lastName[0].toUpperCase();
  } else if (user.firstName) {
    initials = user.firstName[0].toUpperCase();
  } else if (user.login) {
    initials = user.login[0].toUpperCase();
  } else {
    initials = 'U';
  }
  if (avatarEl) avatarEl.textContent = initials;

  // Set hero name and welcome message
  const nameHeroEl = document.getElementById('userNameHero');
  const welcomeEl = document.getElementById('heroWelcome');
  if (nameHeroEl) nameHeroEl.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.login || 'User';
  if (welcomeEl) welcomeEl.textContent = `Welcome back, ${user.firstName || user.login || 'User'}!`;

  const loginEl = document.getElementById('userLogin');
  const levelEl = document.getElementById('userLevel');
  const xpEl = document.getElementById('userXP');
  const emailEl = document.getElementById('userEmail');
  if (loginEl) loginEl.textContent = user.login || 'N/A';
  if (levelEl) levelEl.textContent = user.level || 'N/A';
  if (xpEl) xpEl.textContent = user.totalUp ? formatBytes(user.totalUp) : 'N/A';
  if (emailEl) emailEl.textContent = user.email || 'N/A';

  // Audits ratio card
  const auditsDoneEl = document.getElementById('auditsDone');
  const auditsReceivedEl = document.getElementById('auditsReceived');
  const auditRatioEl = document.getElementById('auditRatio');
  const auditMsgEl = document.getElementById('auditMessage');
  if (auditsDoneEl) auditsDoneEl.textContent = user.totalUp ? formatBytes(user.totalUp) : '--';
  if (auditsReceivedEl) auditsReceivedEl.textContent = user.totalDown ? formatBytes(user.totalDown) : '--';
  if (auditRatioEl) auditRatioEl.textContent = user.auditRatio !== undefined ? user.auditRatio : '--';
  if (auditMsgEl) {
    if (user.auditRatio !== undefined && user.auditRatio < 1) {
      auditMsgEl.textContent = 'Make more audits!';
    } else {
      auditMsgEl.textContent = '';
    }
  }

  // Animate audit ratio SVG ring
  const ring = document.getElementById('auditRatioRing');
  const ratio = typeof user.auditRatio === 'number' ? user.auditRatio : 0;
  const percent = Math.max(0, Math.min(1, ratio));
  const circumference = 2 * Math.PI * 48;
  if (ring) {
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${circumference}`;
    // Color: green if >=1, orange if <1
    ring.style.stroke = percent >= 1 ? '#4ade80' : '#ffb49a';
    setTimeout(() => {
      ring.style.strokeDashoffset = `${circumference * (1 - percent)}`;
    }, 100);
  }

  // ...existing code for audits-ratio color...
  const ratioText = document.getElementById('auditRatio');
  if (ratioText) {
    ratioText.style.color = percent >= 1 ? '#4ade80' : '#ffb49a';
    ratioText.textContent = (typeof user.auditRatio === 'number' && !isNaN(user.auditRatio)) ? user.auditRatio.toFixed(1) : '--';
  }
}

export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
