import { formatBytes } from './formatBytes.js';
import { USER_QUERY } from './query.js';

const GRAPHQL_ENDPOINT = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';
let headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('jwt')}`
};

// Enhanced authentication check function
function checkAuthentication() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

// Check authentication on page load
if (!checkAuthentication()) {
  // This will redirect, so we don't need to continue
  throw new Error('Authentication failed');
}

// Add event listeners for browser navigation
window.addEventListener('pageshow', function(event) {
  // This event fires when the page is shown, including from back/forward cache
  if (!checkAuthentication()) {
    return;
  }
});

window.addEventListener('focus', function() {
  // This event fires when the window gains focus (user switches back to tab)
  if (!checkAuthentication()) {
    return;
  }
});

// Handle visibility change (user switches tabs)
document.addEventListener('visibilitychange', function() {
  if (!document.hidden) {
    if (!checkAuthentication()) {
      return;
    }
  }
});

// Clear sensitive data when user leaves the page
window.addEventListener('beforeunload', function() {
  // Don't clear localStorage here as it might interfere with normal navigation
  // But we can clear any sensitive session data
  sessionStorage.clear();
});

// Periodic authentication check (every 30 seconds)
setInterval(function() {
  if (!checkAuthentication()) {
    return;
  }
}, 30000);

// Get user ID from JWT token
function getUserIdFromToken() {
  const token = localStorage.getItem('jwt');
  if (!token) {
    console.error('No token found in localStorage');
    return null;
  }
  
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const payload = JSON.parse(jsonPayload);
    
    // Get user ID from Hasura claims
    const hasuraClaims = payload['https://hasura.io/jwt/claims'];
    if (hasuraClaims && hasuraClaims['x-hasura-user-id']) {
      return parseInt(hasuraClaims['x-hasura-user-id']);
    }
    
    console.error('No user ID found in Hasura claims');
    return null;
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
  // Clear all authentication data
  localStorage.removeItem('jwt');
  sessionStorage.clear();
  
  // Clear any cached data
  if ('caches' in window) {
    caches.keys().then(function(names) {
      for (let name of names) {
        caches.delete(name);
      }
    });
  }
  
  // Force redirect to login page
  window.location.replace('/login');
});

// Update profile information and audits card
function updateProfileInfo(user) {
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

// Fetch user data
async function fetchUserData() {
  try {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No token found');
      window.location.replace('login');
      return;
    }

    // Remove any quotes from the token if they exist
    const cleanToken = token.replace(/^"|"$/g, '');
    
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cleanToken}`
      },
      body: JSON.stringify({ 
        query: USER_QUERY,
        variables: {}
      })
    });

    
    // Handle unauthorized responses
    if (response.status === 401 || response.status === 403) {
      console.error('Unauthorized access, clearing token and redirecting to login');
      localStorage.removeItem('jwt');
      window.location.replace('/login');
      return;
    }
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL Errors:', JSON.stringify(data.errors, null, 2));
      if (data.errors[0].extensions?.code === 'invalid-jwt' || 
          data.errors[0].message?.includes('JWT') ||
          data.errors[0].message?.includes('unauthorized')) {
        console.error('Invalid JWT token, redirecting to login...');
        localStorage.removeItem('jwt');
        window.location.replace('/login');
        return;
      }
      // Redirect to 404 page instead of error page
      window.location.replace('404');
      return;
    }
    
    
    if (!data.data || !data.data.user || !Array.isArray(data.data.user) || data.data.user.length === 0) {
      console.error('Invalid data structure received:', data);
      // Redirect to 404 page instead of error page
      window.location.replace('404');
      return;
    }

    
    const userData = data.data.user[0];
    
    // Get the user's level from event_user data
    const eventUserData = data.data.event_user;
    let userLevel = 'N/A';
    if (eventUserData && eventUserData.length > 0) {
      // Filter event_user data for the current user
      const userEventData = eventUserData.filter(eu => eu.userLogin === userData.login);
      
      if (userEventData.length > 0) {
        // Get the highest level from all events for this user
        userLevel = Math.max(...userEventData.map(eu => eu.level || 0));
      }
    }
    
    // Add level to userData
    userData.level = userLevel;
    
    updateProfileInfo(userData);
    
    // Create graphs if data is available
    if (userData.TransactionsFiltered1 && userData.TransactionsFiltered1.length > 0) {
      createXPGraph(userData.TransactionsFiltered1);
    } else {
      console.log('No transactions available for user');
    }
    
    if (data.data.toad_session_game_results && data.data.toad_session_game_results.length > 0) {
      createResultsGraph(data.data.toad_session_game_results);
    } else {
      console.log('No game results data available');
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    // If there's a network error or other issue, check if it's authentication related
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      localStorage.removeItem('jwt');
      window.location.replace('/login');
      return;
    }
    // Redirect to 404 page instead of error page
    window.location.replace('404');
  }
}

// Create XP line graph
function createXPGraph(transactions) {
  if (!transactions || transactions.length === 0) {
    console.error('No transaction data available');
    return;
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Calculate cumulative XP
  let cumulativeXP = 0;
  const xpData = sortedTransactions.map(t => {
    cumulativeXP += t.amount;
    return {
      x: new Date(t.createdAt).getTime(),
      y: cumulativeXP
    };
  });

  const options = {
    series: [{
      name: 'Cumulative XP',
      data: xpData
    }],
    chart: {
      type: 'area',
      height: 300,
      toolbar: {
        show: false
      },
      background: '#1f293a',
      foreColor: '#fff',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    theme: {
      mode: 'dark'
    },
    colors: ['#0ef'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#fff'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm'
        }
      },
      tooltip: {
        enabled: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#fff'
        },
        formatter: function(value) {
          return Math.round(value);
        }
      }
    },
    grid: {
      borderColor: '#2c4766',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy HH:mm'
      },
      y: {
        formatter: function(value) {
          return Math.round(value) + ' XP';
        }
      },
      marker: {
        show: true
      }
    },
    markers: {
      size: 4,
      colors: ['#0ef'],
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6
      }
    }
  };

  const chart = new ApexCharts(document.querySelector("#xpGraph"), options);
  chart.render();
}

// Create results pie chart
function createResultsGraph(results) {
  if (!results || results.length === 0) {
    console.error('No results data available');
    return;
  }

  // Count results
  const counts = results.reduce((acc, result) => {
    const status = result.result.name;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const options = {
    series: Object.values(counts),
    chart: {
      type: 'donut',
      height: 300,
      background: '#1f293a',
      foreColor: '#fff'
    },
    theme: {
      mode: 'dark'
    },
    labels: Object.keys(counts),
    colors: ['#0ef', '#2c4766', '#4CAF50', '#FFC107'],
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '22px',
              fontFamily: 'Poppins',
              color: '#fff'
            },
            value: {
              show: true,
              fontSize: '16px',
              fontFamily: 'Poppins',
              color: '#0ef',
              formatter: function (val) {
                return val;
              }
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '16px',
              fontFamily: 'Poppins',
              color: '#fff',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontFamily: 'Poppins',
      labels: {
        colors: '#fff'
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const chart = new ApexCharts(document.querySelector("#resultsGraph"), options);
  chart.render();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication first
  if (!checkAuthentication()) {
    return;
  }
  
  // Additional security check - verify token is still valid
  const token = localStorage.getItem('jwt');
  if (!token) {
    window.location.replace('/login');
    return;
  }
  
  // Fetch user data
  fetchUserData();
});