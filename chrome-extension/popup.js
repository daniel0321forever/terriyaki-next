// Configuration
const DEFAULT_API_URL = 'http://localhost:8080';

// State
let currentTask = null;
let settings = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
  await loadUserInfo(); // Load user info first
  await loadTodayTask();
  
  // Trigger badge update when popup opens (in case background was inactive)
  chrome.runtime.sendMessage({ action: 'updateBadge' }).catch(() => {});
});

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get(['apiUrl', 'authToken']);
  settings = {
    apiUrl: result.apiUrl || DEFAULT_API_URL,
    authToken: result.authToken || ''
  };

  // Populate settings form
  document.getElementById('apiUrl').value = settings.apiUrl;
  document.getElementById('authToken').value = settings.authToken;

  // Always check for token changes in cookies (user might have logged in/out)
  const cookieToken = await getTokenFromCookies();
  if (cookieToken && cookieToken !== settings.authToken) {
    // Token has changed! Update it
    console.log('[Terriyaki] Token changed, updating...');
    settings.authToken = cookieToken;
    document.getElementById('authToken').value = cookieToken;
    // Save the new token
    await chrome.storage.sync.set({
      apiUrl: settings.apiUrl,
      authToken: cookieToken
    });
    // Reload user info with new token
    await loadUserInfo();
    // Trigger badge update in background
    chrome.runtime.sendMessage({ action: 'updateBadge' }).catch(() => {});
  } else if (!settings.authToken && cookieToken) {
    // No token stored but found in cookies
    await tryImportTokenFromCookies();
    // Load user info after importing
    await loadUserInfo();
  }
}

// Save settings
async function saveSettings() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  const authToken = document.getElementById('authToken').value.trim();

  if (!apiUrl || !authToken) {
    alert('Please fill in both API URL and Auth Token');
    return;
  }

  await chrome.storage.sync.set({ apiUrl, authToken });
  settings = { apiUrl, authToken };

  // Trigger badge update when settings are saved
  chrome.runtime.sendMessage({ action: 'updateBadge' }).catch(() => {});

  // Hide settings panel and reload task
  document.getElementById('settingsPanel').classList.add('hidden');
  await loadTodayTask();
}

// Setup event listeners
function setupEventListeners() {
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', () => {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('hidden');
  });

  document.getElementById('saveSettings').addEventListener('click', saveSettings);

  document.getElementById('testConnection').addEventListener('click', async () => {
    await testConnection();
  });

  // Import token button
  document.getElementById('importTokenBtn').addEventListener('click', async () => {
    await tryImportTokenFromCookies(true);
  });

  // Retry button
  document.getElementById('retryBtn').addEventListener('click', loadTodayTask);

  // Check status button

  // Interview buttons
  document.getElementById('startInterviewBtn').addEventListener('click', () => {
    if (currentTask) {
      startInterview(currentTask.id);
    }
  });

  document.getElementById('startCompletedInterviewBtn').addEventListener('click', () => {
    if (currentTask) {
      startInterview(currentTask.id);
    }
  });
}

// Test API connection
async function testConnection() {
  if (!settings.authToken) {
    alert('Please enter your auth token first');
    return;
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/v1/verify-token`, {
      headers: {
        'Authorization': `Bearer ${settings.authToken}`
      }
    });

    if (response.ok) {
      alert('✅ Connection successful!');
    } else {
      alert('❌ Connection failed. Please check your token.');
    }
  } catch (error) {
    alert(`❌ Error: ${error.message}`);
  }
}

// Load and display user info
async function loadUserInfo() {
  const usernameEl = document.getElementById('username');

  if (!settings.authToken) {
    usernameEl.textContent = 'Not logged in';
    usernameEl.style.color = '#ffcccc';
    return;
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/v1/verify-token`, {
      headers: {
        'Authorization': `Bearer ${settings.authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        const username = data.user.username || data.user.email || 'Unknown';
        usernameEl.textContent = `👤 ${username}`;
        usernameEl.style.color = 'white';
      } else {
        usernameEl.textContent = 'Invalid token';
        usernameEl.style.color = '#ffcccc';
      }
    } else if (response.status === 401) {
      usernameEl.textContent = 'Token expired';
      usernameEl.style.color = '#ffcccc';
    } else {
      usernameEl.textContent = 'Error loading user';
      usernameEl.style.color = '#ffcccc';
    }
  } catch (error) {
    console.error('Error loading user info:', error);
    usernameEl.textContent = 'Connection error';
    usernameEl.style.color = '#ffcccc';
  }
}

// Load today's task
async function loadTodayTask() {
  showState('loading');

  // Clear previous task data to avoid showing stale data
  currentTask = null;

  // Re-check token from cookies in case user logged in/out
  const cookieToken = await getTokenFromCookies();
  if (cookieToken && cookieToken !== settings.authToken) {
    // Token changed, update it
    settings.authToken = cookieToken;
    document.getElementById('authToken').value = cookieToken;
    await chrome.storage.sync.set({
      apiUrl: settings.apiUrl,
      authToken: cookieToken
    });
    // Trigger badge update when token changes
    chrome.runtime.sendMessage({ action: 'updateBadge' }).catch(() => {});
  }

  if (!settings.authToken) {
    showError('Please configure your auth token in settings');
    return;
  }

  try {
    // Get today's task - use the same endpoint as web page (grind endpoint)
    // This ensures consistency and includes taskToday in the response
    let taskResponse;
    try {
      // First try to get from grind endpoint (same as web page)
      taskResponse = await fetch(`${settings.apiUrl}/api/v1/grinds/current`, {
        headers: {
          'Authorization': `Bearer ${settings.authToken}`
        }
      });
    } catch (fetchError) {
      // Network error (CORS, connection refused, etc.)
      console.error('Network error:', fetchError);
      showError(`Cannot connect to ${settings.apiUrl}. Please check:\n1. Backend is running\n2. API URL is correct\n3. CORS is configured`);
      return;
    }

    if (!taskResponse.ok) {
      // Handle different error status codes
      if (taskResponse.status === 401) {
        // Token might be invalid, try to refresh from cookies
        const newToken = await getTokenFromCookies();
        if (newToken && newToken !== settings.authToken) {
          // Retry with new token
          settings.authToken = newToken;
          await chrome.storage.sync.set({
            apiUrl: settings.apiUrl,
            authToken: newToken
          });
          // Retry the request
          await loadUserInfo(); // Update user info
          return loadTodayTask();
        }
        showError('Invalid auth token. Please log in again and click "Import" to update your token.');
        await loadUserInfo(); // Update user info to show error state
        return;
      }

      if (taskResponse.status === 404) {
        // No task found - this is valid, show "no task" state
        showState('noTask');
        return;
      }

      // Try to get error message from response
      let errorMessage = `Failed to fetch task (${taskResponse.status})`;
      try {
        const errorData = await taskResponse.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // Response is not JSON, use default message
      }

      throw new Error(errorMessage);
    }

    // Parse JSON response
    let grindData;
    try {
      grindData = await taskResponse.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      throw new Error('Invalid response from server. Please check your API URL.');
    }

    // Extract taskToday from grind data (same structure as web page)
    const taskToday = grindData.grind?.taskToday;
    const todayStats = grindData.grind?.todayStats;
    const participants = grindData.grind?.participants || [];

    // Backend returns empty object {} when no task exists for today (from grind serializer)
    // Only show "No active task" when task is null/undefined or empty object
    if (!taskToday ||
        taskToday === null ||
        (typeof taskToday === 'object' && Object.keys(taskToday).length === 0)) {
      showState('noTask');
      return;
    }
    
    // Also check if task has required fields (id is required)
    if (!taskToday.id) {
      showState('noTask');
      return;
    }

    // Task exists - now check its status
    currentTask = taskToday;
    
    // Store leaderboard stats and participants for display
    if (todayStats) {
      currentTask.leaderboardStats = todayStats;
    }
    currentTask.participants = participants;

    // Two states for existing tasks:
    // 1. completed = true → show completed task UI
    // 2. completed = false (or undefined) → show pending task UI
    if (currentTask.completed === true) {
      showCompletedTask();
      // Notify background to update badge
      chrome.runtime.sendMessage({ action: 'taskCompleted' }).catch(() => {});
    } else {
      // Task exists but not completed = pending state
      showTask();
      // Notify background to update badge
      chrome.runtime.sendMessage({ action: 'taskUpdated' }).catch(() => {});
    }

    // Check if we're on LeetCode and monitoring
    await checkLeetCodeMonitoring();

  } catch (error) {
    console.error('Error loading task:', error);
    // Show user-friendly error message
    const errorMsg = error.message || 'Unknown error occurred';
    showError(errorMsg);
  }
}

// Show task UI
function showTask() {
  showState('task');
  
  // Problem name on top left, status on top right
  document.getElementById('taskTitle').textContent = currentTask.title || 'LeetCode Problem';
  document.getElementById('taskDescription').textContent = currentTask.description || 'Daily coding challenge';
  
  // Set status badge
  document.getElementById('statusBadge').textContent = 'Incomplete';
  document.getElementById('statusBadge').className = 'status-badge';
  
  // Set LeetCode link
  if (currentTask.url) {
    document.getElementById('leetcodeLink').href = currentTask.url;
  }
  
  // Show leaderboard toggle if stats are available
  if (currentTask.leaderboardStats && currentTask.participants) {
    showLeaderboard('leaderboardToggle', 'leaderboardHeader', 'toggleIcon', 
                    'leaderboardList', 'leaderboardParticipants',
                    currentTask.leaderboardStats, currentTask.participants);
  } else {
    document.getElementById('leaderboardToggle').classList.add('hidden');
  }
}

// Show completed task UI
function showCompletedTask() {
  showState('completed');
  
  // Problem name on top left, status on top right
  document.getElementById('completedTaskTitle').textContent = currentTask.title || 'LeetCode Problem';
  document.getElementById('completedTaskDescription').textContent = currentTask.description || 'Daily coding challenge';
  
  // Set status badge to completed
  document.getElementById('completedStatusBadge').textContent = 'Completed';
  document.getElementById('completedStatusBadge').className = 'status-badge completed';
  
  // Set LeetCode link
  if (currentTask.url) {
    document.getElementById('completedLeetcodeLink').href = currentTask.url;
  }
  
  // Show leaderboard toggle if stats are available
  if (currentTask.leaderboardStats && currentTask.participants) {
    showLeaderboard('completedLeaderboardToggle', 'completedLeaderboardHeader', 'completedToggleIcon',
                    'completedLeaderboardList', 'completedLeaderboardParticipants',
                    currentTask.leaderboardStats, currentTask.participants);
  } else {
    document.getElementById('completedLeaderboardToggle').classList.add('hidden');
  }
}

// Show error state
function showError(message) {
  showState('error');
  document.getElementById('errorMessage').textContent = message;
}

// Show specific state
function showState(state) {
  const states = ['loading', 'error', 'noTask', 'task', 'completed'];
  states.forEach(s => {
    document.getElementById(`${s}State`).classList.toggle('hidden', s !== state);
  });
}

// Show leaderboard with toggle functionality
function showLeaderboard(toggleId, headerId, iconId, listId, participantsId, stats, participants) {
  const toggleDiv = document.getElementById(toggleId);
  const header = document.getElementById(headerId);
  const icon = document.getElementById(iconId);
  const list = document.getElementById(listId);
  const participantsDiv = document.getElementById(participantsId);
  
  // Update stats
  const completedCount = stats.completed || 0;
  const totalCount = stats.total || 0;
  
  const completedCountEl = toggleId === 'leaderboardToggle' 
    ? document.getElementById('completedCount')
    : document.getElementById('completedCount2');
  const totalCountEl = toggleId === 'leaderboardToggle'
    ? document.getElementById('totalCount')
    : document.getElementById('totalCount2');
  
  completedCountEl.textContent = completedCount;
  totalCountEl.textContent = totalCount;
  
  // Show the toggle
  toggleDiv.classList.remove('hidden');
  
  // Sort participants: completed first, then pending
  const sortedParticipants = [...participants].sort((a, b) => {
    const aCompleted = a.todayTaskCompleted === true;
    const bCompleted = b.todayTaskCompleted === true;
    if (aCompleted && !bCompleted) return -1;
    if (!aCompleted && bCompleted) return 1;
    return 0;
  });
  
  // Render participants list
  participantsDiv.innerHTML = '';
  sortedParticipants.forEach(participant => {
    const participantDiv = document.createElement('div');
    participantDiv.className = 'participant-item';
    const isCompleted = participant.todayTaskCompleted === true;
    participantDiv.classList.toggle('completed', isCompleted);
    
    const checkmark = isCompleted ? '✓' : '○';
    const username = participant.username || 'Unknown';
    
    participantDiv.innerHTML = `
      <span class="participant-check">${checkmark}</span>
      <span class="participant-name">${username}</span>
    `;
    
    participantsDiv.appendChild(participantDiv);
  });
  
  // Set up toggle handler
  header.onclick = () => {
    const isExpanded = !list.classList.contains('hidden');
    list.classList.toggle('hidden', isExpanded);
    icon.textContent = isExpanded ? '▼' : '▲';
  };
  
  // Initially collapsed
  list.classList.add('hidden');
  icon.textContent = '▼';
}

// Check LeetCode monitoring status
async function checkLeetCodeMonitoring() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url && tab.url.includes('leetcode.com/problems/')) {
    // Check if content script detected a solution
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
      if (response && response.solved) {
        showAutoSubmitStatus('Solution detected! Submitting...');
        await submitSolution(response.code, response.language);
      } else {
        showAutoSubmitStatus('Monitoring LeetCode for solution...');
      }
    } catch (error) {
      // Content script not ready or not on LeetCode page
      if (currentTask && !currentTask.completed) {
        showAutoSubmitStatus('Open the problem on LeetCode to enable auto-submit');
      }
    }
  }
}

// Show auto-submit status
function showAutoSubmitStatus(text) {
  const statusDiv = document.getElementById('autoSubmitStatus');
  document.getElementById('autoSubmitText').textContent = text;
  statusDiv.classList.remove('hidden');
}

// Check LeetCode status manually
async function checkLeetCodeStatus() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab || !tab.url || !tab.url.includes('leetcode.com/problems/')) {
    alert('Please open a LeetCode problem page first');
    return;
  }

  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'checkSolution' });

    if (response && response.solved) {
      showAutoSubmitStatus('Solution detected! Submitting...');
      await submitSolution(response.code, response.language);
    } else {
      alert('No solution detected yet. Make sure you\'ve passed all test cases.');
    }
  } catch (error) {
    alert('Error checking status. Please refresh the LeetCode page and try again.');
  }
}

// Submit solution to backend
async function submitSolution(code, language) {
  if (!currentTask) {
    showError('No task found');
    return;
  }

  try {
    const response = await fetch(`${settings.apiUrl}/api/v1/tasks/finish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.authToken}`
      },
      body: JSON.stringify({
        code: code,
        language: language
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit solution');
    }

    const data = await response.json();
    currentTask = data.task;

    showAutoSubmitStatus('✅ Solution submitted successfully!');

    // Notify background that task is completed
    chrome.runtime.sendMessage({ action: 'taskCompleted' }).catch(() => {});

    // Show interview option
    document.getElementById('interviewSection').classList.remove('hidden');

    // Reload task to show completed state
    setTimeout(() => {
      loadTodayTask();
    }, 1000);

  } catch (error) {
    console.error('Error submitting solution:', error);
    showAutoSubmitStatus('❌ Failed to submit solution. Please try again.');
  }
}

// Get token from cookies (helper function)
async function getTokenFromCookies() {
  try {
    // Try common Terriyaki domains
    const domains = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://terriyaki.com',
      'https://www.terriyaki.com'
    ];

    // Also try to get from current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      try {
        const url = new URL(tab.url);
        domains.unshift(url.origin);
      } catch (e) {
        // Invalid URL, skip
      }
    }

    // Try each domain
    for (const domain of domains) {
      try {
        const cookie = await chrome.cookies.get({
          url: domain,
          name: 'token'
        });

        if (cookie && cookie.value) {
          return cookie.value;
        }
      } catch (e) {
        // Domain not accessible or invalid, try next
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting token from cookies:', error);
    return null;
  }
}

// Try to import token from cookies
async function tryImportTokenFromCookies(showMessage = false) {
  const cookieToken = await getTokenFromCookies();

  if (cookieToken) {
    // Found token!
    document.getElementById('authToken').value = cookieToken;
    settings.authToken = cookieToken;

    if (showMessage) {
      alert('✅ Token imported successfully!');
    }

          // Auto-save if we have API URL
      if (settings.apiUrl) {
        await chrome.storage.sync.set({
          apiUrl: settings.apiUrl,
          authToken: cookieToken
        });

        if (showMessage) {
          // Reload user info and task
          await loadUserInfo();
          await loadTodayTask();
        }
      }

      return true;
  } else {
    if (showMessage) {
      alert('❌ Could not find token. Please:\n1. Make sure you\'re logged into Terriyaki\n2. Open the Terriyaki website in a tab\n3. Try again, or manually copy the token from DevTools → Application → Cookies');
    }
    return false;
  }
}

// Start interview
function startInterview(taskId) {
  // Extract base URL from API URL (assuming frontend and backend are on same domain)
  // For localhost: frontend is typically on port 3000, backend on 8080
  let baseUrl = settings.apiUrl;
  if (baseUrl.includes('localhost:8080')) {
    baseUrl = baseUrl.replace(':8080', ':3000');
  } else if (baseUrl.includes('localhost')) {
    baseUrl = baseUrl.replace('/api/v1', '');
  } else {
    // Production: assume frontend is on same domain without /api/v1
    baseUrl = baseUrl.replace('/api/v1', '');
  }

  const interviewUrl = `${baseUrl}/interview/${taskId}`;
  chrome.tabs.create({ url: interviewUrl });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'solutionDetected') {
    if (currentTask && !currentTask.completed) {
      showAutoSubmitStatus('Solution detected! Submitting...');
      submitSolution(message.code, message.language);
    }
  }
});

