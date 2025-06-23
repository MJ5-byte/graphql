import { GRAPHQL_ENDPOINT, getAuthHeaders } from './config.js';
import { checkAuthentication, setupAuthListeners } from './auth.js';
import { USER_QUERY } from './graphql.js';
import { updateProfileInfo } from './ui.js';
import { createXPGraph, createResultsGraph } from './charts.js';
import { setupLogoutButton } from './logout.js';

async function fetchUserData() {
  const token = localStorage.getItem('jwt');
  if (!token) return window.location.replace('/login');

  const cleanToken = token.replace(/^"|"$/g, '');
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cleanToken}`
    },
    body: JSON.stringify({ query: USER_QUERY })
  });

  if ([401, 403].includes(response.status)) {
    localStorage.removeItem('jwt');
    return window.location.replace('/login');
  }

  const data = await response.json();
  if (data.errors || !data.data || !data.data.user?.length) {
    return window.location.replace('404');
  }

  const user = data.data.user[0];
  const eventUser = data.data.event_user;

  const levelData = eventUser?.filter(e => e.userLogin === user.login);
  user.level = levelData?.length > 0 ? Math.max(...levelData.map(e => e.level || 0)) : 'N/A';

  updateProfileInfo(user);

  if (user.TransactionsFiltered1?.length) {
    createXPGraph(user.TransactionsFiltered1);
  }

  if (data.data.toad_session_game_results?.length) {
    createResultsGraph(data.data.toad_session_game_results);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthentication()) return;
  setupAuthListeners();
  setupLogoutButton();
  fetchUserData();
});
