# Terriyaki Chrome Extension

A Chrome extension for Terriyaki. This would track your daily LeetCode tasks and automatically submit solutions when you solve problems.

## Features

- **Daily Task Reminder**: Shows today's LeetCode problem in a popup with deadline countdown and group status
- **User Display**: Shows your username in the extension header for easy identification
- **Leaderboard Stats**: Displays group progress (e.g., "5/6 solved") to see how many participants completed today's task
- **Auto-Detection**: Automatically detects when you solve today's problem task on LeetCode
- **Auto-Submit**: Submits your solution code to the backend automatically
- **Interview Integration**: Quick access to start an AI interview about the problem
- **Smart Badge**: Shows countdown timer and warning indicator on the extension icon
  - Displays hours/minutes remaining until deadline
  - Color-coded by urgency (green → orange → red)
  - Updates automatically based on time remaining
- **Auto Token Import**: Automatically imports your auth token from browser cookies

## Installation

1. **Generate icons** (optional but recommended):
   - Open `generate-icons.html` in your browser
   - Click "Generate Icons" and then download all three icon sizes
   - Place `icon16.png`, `icon48.png`, and `icon128.png` in the [frontend/chrome-extension](.)  folder
   - Alternatively, create your own 16x16, 48x48, and 128x128 PNG icons

2. **Load the extension**:
   - Open Chrome and navigate to [chrome://extensions/](chrome://extensions/)
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the [frontend/chrome-extension](.) folder
   - Press the "reload button" (the circular arrow) if the source codes of the extensions are modified.

3. **Configure settings**:
   - Click the extension icon
   - Click the settings (⚙️) button
   - Enter your API Base URL (default: `http://localhost:8080`)
   - Enter your Auth Token:
     - **Easy way**: Click the "📥 Import" button to automatically import from cookies
     - **Manual way**: Get it from your browser cookies after logging into the web app (see below)
   - Click "Save Settings"
   - Click "Test Connection" to verify

## How to Get Your Auth Token

1. Log into your Terriyaki web app
2. Open Chrome DevTools (F12)
3. Go to Application → Cookies
4. Find the cookie named `token`
5. Copy its value and paste it into the extension settings

## Usage

1. **View Today's Task**:
   - Click the extension icon to see today's LeetCode problem
   - View your username in the header to confirm you're logged in
   - See leaderboard stats showing how many participants have completed (e.g., "5/6 solved")
   - Check the badge countdown on the extension icon for time remaining
   - Click "Open on LeetCode" to navigate to the problem

2. **Solve the Problem**:
   - Work on the problem on LeetCode as usual
   - When you pass all test cases, the extension will automatically detect it

3. **Auto-Submit**:
   - Once detected, the extension will automatically submit your code
   - You'll see a confirmation message
   - The leaderboard stats will update to reflect your completion

4. **Start Interview**:
   - After submitting, you can click "Start Interview" to practice with AI

5. **Badge Features**:
   - The extension icon badge shows time remaining until deadline
   - Colors indicate urgency: Green (plenty of time) → Orange (caution) → Red (urgent)
   - Badge updates automatically and clears when task is completed

## How It Works

- **Content Script** (`content.js`): Monitors LeetCode pages for successful submissions, extracts code and language
- **Background Worker** (`background.js`): Handles API communication, badge countdown updates, and real-time notifications
- **Popup** (`popup.html/js/css`): Displays task information, user info, leaderboard stats, and provides controls
- **Auto Token Sync**: Automatically detects when you log in/out and updates the token accordingly

## Troubleshooting

- **"Please configure your auth token"**: Make sure you've entered your auth token in settings
- **"Connection failed"**: Check that your API URL is correct and the backend is running
- **Auto-submit not working**: Make sure you're on the LeetCode problem page and have passed all test cases
- **Code not detected**: Try clicking "Check Status" manually, or refresh the LeetCode page

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html/css/js`: Extension popup UI
- `content.js`: Script injected into LeetCode pages
- `background.js`: Service worker for background tasks

## Permissions

- `storage`: To save settings and auth token
- `activeTab`: To interact with LeetCode pages
- `tabs`: To open interview pages
- `alarms`: To schedule badge countdown updates
- `cookies`: To automatically import auth token from Terriyaki website
- `host_permissions`: To access LeetCode, your backend API, and frontend domains

## Notes

- The extension only works on LeetCode problem pages
- Make sure your backend API is accessible from the extension
- The auth token is stored securely in Chrome's sync storage
- The extension uses `/api/v1/grinds/current` endpoint (same as web page) for consistency
- Token automatically syncs when you log in/out - no manual updates needed
- Badge countdown updates every 5-60 minutes depending on urgency
- Leaderboard stats show real-time group progress
- For production, update the API URL in settings to point to your production backend

## Updating the Extension

When you modify the extension code:
- Simply click the **reload button** (circular arrow) on the extension card in `chrome://extensions/`
- No need to delete and re-add the extension
- Changes take effect immediately after reload

