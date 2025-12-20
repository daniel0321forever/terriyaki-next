// Background service worker for Terriyaki extension

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'solutionDetected') {
    // Store the solution detection
    chrome.storage.local.set({
      lastSolution: {
        code: message.code,
        language: message.language,
        timestamp: message.timestamp
      }
    });

    // Notify popup if it's open
    chrome.runtime.sendMessage({
      action: 'solutionDetected',
      code: message.code,
      language: message.language
    }).catch(() => {
      // Popup might not be open, that's okay
    });
  }

  // Update badge when task status changes (from popup)
  if (message.action === 'taskUpdated' || message.action === 'taskCompleted' || message.action === 'updateBadge') {
    updateBadge();
  }

  return true;
});

// Listen for tab updates to check if user navigated to LeetCode
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('leetcode.com/problems/')) {
    // User navigated to a LeetCode problem page
    // The content script will handle monitoring
  }
});

// Calculate time remaining until deadline (end of task date)
function calculateTimeRemaining(taskDate) {
  if (!taskDate) return null;

  // Parse task date (could be string or Date object)
  let deadline;
  if (typeof taskDate === 'string') {
    deadline = new Date(taskDate);
  } else {
    deadline = new Date(taskDate);
  }

  // Task deadline is end of the task date (midnight of next day)
  deadline.setHours(23, 59, 59, 999); // End of day

  const now = new Date();
  const diff = deadline - now;

  if (diff <= 0) {
    return { expired: true, hours: 0, minutes: 0, totalMinutes: 0 };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { expired: false, hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
}

// Format countdown for badge display
function formatCountdown(timeRemaining) {
  if (!timeRemaining || timeRemaining.expired) {
    return '!';
  }

  const { hours, minutes, totalMinutes } = timeRemaining;

  // Show hours if >= 1 hour remaining
  if (hours >= 1) {
    // Show hours only if < 10 hours, otherwise just show "!"
    if (hours < 10) {
      return `${hours}h`;
    } else {
      return '!';
    }
  } else {
    // Less than 1 hour - show minutes
    if (totalMinutes > 0) {
      return `${totalMinutes}m`;
    } else {
      return '!';
    }
  }
}

// Get badge color based on urgency
function getBadgeColor(timeRemaining) {
  if (!timeRemaining || timeRemaining.expired) {
    return '#d32f2f'; // Dark red - expired
  }

  const { hours, totalMinutes } = timeRemaining;

  if (hours < 2 || totalMinutes < 120) {
    return '#d32f2f'; // Dark red - urgent (< 2 hours)
  } else if (hours < 6 || totalMinutes < 360) {
    return '#f5576c'; // Red - warning (< 6 hours)
  } else if (hours < 12 || totalMinutes < 720) {
    return '#ff9800'; // Orange - caution (< 12 hours)
  } else {
    return '#4caf50'; // Green - plenty of time
  }
}

// Update badge based on task status
async function updateBadge() {
  try {
    console.log('[Terriyaki] Updating badge...');
    const settings = await chrome.storage.sync.get(['apiUrl', 'authToken']);

    if (!settings.authToken) {
      console.log('[Terriyaki] No auth token, clearing badge');
      chrome.action.setBadgeText({ text: '' });
      return;
    }

    // Use same endpoint as popup for consistency
    const response = await fetch(`${settings.apiUrl}/api/v1/grinds/current`, {
      headers: {
        'Authorization': `Bearer ${settings.authToken}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      const taskToday = data.grind?.taskToday;

      // Check if task exists
      if (taskToday &&
          taskToday.id &&
          Object.keys(taskToday).length > 0) {

        if (taskToday.completed === true) {
          // Task completed - show green checkmark
          // Using checkmark character - if it doesn't render, Chrome will show a square
          // Alternative: could use '✓' or 'OK' or '✓'
          chrome.action.setBadgeText({ text: '✓' });
          chrome.action.setBadgeBackgroundColor({ color: '#4caf50' }); // Green
          console.log('[Terriyaki] Badge updated: Task completed - showing green checkmark');
          // Clear any scheduled updates since task is done
          if (chrome.alarms) {
            chrome.alarms.clear('updateBadge');
          }
        } else {
          // Task not completed - show countdown or exclamation
          const timeRemaining = calculateTimeRemaining(taskToday.date);
          const badgeText = formatCountdown(timeRemaining);
          const badgeColor = getBadgeColor(timeRemaining);

          chrome.action.setBadgeText({ text: badgeText });
          chrome.action.setBadgeBackgroundColor({ color: badgeColor });

          // Schedule next update based on urgency
          scheduleNextUpdate(timeRemaining);
        }
      } else {
        // No task - clear badge
        chrome.action.setBadgeText({ text: '' });
        if (chrome.alarms) {
          chrome.alarms.clear('updateBadge');
        }
      }
    } else if (response.status === 401) {
      // Unauthorized - clear badge
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
    // On error, clear badge to avoid confusion
    chrome.action.setBadgeText({ text: '' });
  }
}

// Schedule next badge update based on urgency
function scheduleNextUpdate(timeRemaining) {
  if (!chrome.alarms) return;

  let updateInterval = 60; // Default: 60 minutes

  if (timeRemaining && !timeRemaining.expired) {
    const { hours, totalMinutes } = timeRemaining;

    if (totalMinutes < 60) {
      // Less than 1 hour - update every 5 minutes
      updateInterval = 5;
    } else if (totalMinutes < 180) {
      // Less than 3 hours - update every 15 minutes
      updateInterval = 15;
    } else if (totalMinutes < 360) {
      // Less than 6 hours - update every 30 minutes
      updateInterval = 30;
    }
    // Otherwise use default 60 minutes
  }

  // Clear existing alarm and create new one
  chrome.alarms.clear('updateBadge');
  chrome.alarms.create('updateBadge', { delayInMinutes: updateInterval });
}

// Badge management - show notification if task is pending
// Only set up alarms if the API is available
if (chrome.alarms && chrome.alarms.onAlarm) {
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'checkTask' || alarm.name === 'updateBadge' || alarm.name === 'frequentCheck') {
      await updateBadge();
    }
  });

  // Check task status periodically (every hour as fallback)
  chrome.alarms.create('checkTask', { periodInMinutes: 60 });

  // Also check more frequently (every 5 minutes) to catch account switches and status changes
  chrome.alarms.create('frequentCheck', { periodInMinutes: 5 });
}

// Listen for storage changes (e.g., token changes when user switches accounts)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync') {
    if (changes.authToken) {
      // Token changed - update badge immediately
      console.log('[Terriyaki] Auth token changed, updating badge...');
      // Small delay to ensure token is saved
      setTimeout(() => {
        updateBadge();
      }, 200);
    }
    // Also update if API URL changes (might affect badge)
    if (changes.apiUrl) {
      console.log('[Terriyaki] API URL changed, updating badge...');
      setTimeout(() => {
        updateBadge();
      }, 200);
    }
  }
});

// Initial badge check
updateBadge();

