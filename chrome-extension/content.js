// Content script for LeetCode pages
// Monitors for successful problem submissions

let isMonitoring = false;
let lastSubmissionTime = 0;
let detectedSolution = null;

// Initialize monitoring
function initMonitoring() {
  if (isMonitoring) return;
  isMonitoring = true;

  console.log('[Terriyaki] Monitoring LeetCode for solution...');

  // Monitor for success indicators
  observeSuccessIndicators();

  // Monitor submission button clicks
  observeSubmissions();

  // Check for existing success state
  checkExistingSuccess();
}

// Observe for success indicators on the page
function observeSuccessIndicators() {
  const observer = new MutationObserver(() => {
    checkForSuccess();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Also check periodically
  setInterval(checkForSuccess, 2000);
}

// Check for success indicators
function checkForSuccess() {
  // Look for success messages or indicators
  const successIndicators = [
    // LeetCode's success message elements
    document.querySelector('[data-e2e-locator="submission-result"]'),
    document.querySelector('.text-success'),
    document.querySelector('[class*="success"]'),
    // Check for "Accepted" text with runtime info
    ...Array.from(document.querySelectorAll('*')).filter(el => {
      const text = el.textContent || '';
      return text.includes('Accepted') &&
             (text.includes('Runtime') || text.includes('runtime')) &&
             !el.closest('.hidden') &&
             !el.closest('[style*="display: none"]');
    }),
    // Check for green checkmark or success icon
    document.querySelector('svg[class*="success"]'),
    document.querySelector('[class*="accepted"]')
  ].filter(Boolean);

  if (successIndicators.length > 0) {
    // Check if we recently submitted (within last 60 seconds) or if it's a persistent success state
    const now = Date.now();
    const timeSinceSubmission = now - lastSubmissionTime;

    // If we submitted recently OR if there's a persistent "Accepted" state (user already solved it)
    if (timeSinceSubmission < 60000 || timeSinceSubmission > 60000) {
      // Double check it's actually a success state
      const hasAcceptedText = Array.from(document.querySelectorAll('*')).some(el => {
        const text = el.textContent || '';
        return text.trim() === 'Accepted' ||
               (text.includes('Accepted') && text.includes('Runtime'));
      });

      if (hasAcceptedText) {
        extractAndNotifySolution();
      }
    }
  }
}

// Observe submission button clicks
function observeSubmissions() {
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Check if it's a submit button
    if (target.textContent && (
      target.textContent.includes('Submit') ||
      target.textContent.includes('提交') ||
      target.getAttribute('data-e2e-locator') === 'console-submit-button'
    )) {
      lastSubmissionTime = Date.now();

      // Wait a bit for the result
      setTimeout(() => {
        checkForSuccess();
      }, 3000);
    }
  }, true);
}

// Check for existing success state (user already solved it)
function checkExistingSuccess() {
  setTimeout(() => {
    // Look for "Accepted" badge or similar
    const acceptedBadge = Array.from(document.querySelectorAll('*')).find(el => {
      const text = el.textContent || '';
      return text.trim() === 'Accepted' || text.includes('Accepted');
    });

    if (acceptedBadge) {
      // User might have already solved it, but we can still extract code
      extractCode();
    }
  }, 2000);
}

// Extract code and language from LeetCode page
function extractCode() {
  try {
    // Try to find the code editor
    const codeEditor = document.querySelector('.monaco-editor') ||
                      document.querySelector('[class*="CodeMirror"]') ||
                      document.querySelector('textarea[class*="input"]');

    if (!codeEditor) {
      console.log('[Terriyaki] Code editor not found');
      return null;
    }

    // Get code from Monaco editor (LeetCode uses Monaco)
    let code = '';
    let language = 'javascript'; // default

    // Try Monaco editor API
    if (window.monaco && window.monaco.editor) {
      const editors = window.monaco.editor.getEditors();
      if (editors.length > 0) {
        code = editors[0].getValue();
        // Try to detect language from editor model
        const model = editors[0].getModel();
        if (model) {
          const lang = model.getLanguageId();
          language = mapLanguage(lang);
        }
      }
    }

    // Fallback: try to get from textarea or contenteditable
    if (!code) {
      const textarea = document.querySelector('textarea');
      if (textarea) {
        code = textarea.value;
      } else {
        // Try contenteditable
        const editable = document.querySelector('[contenteditable="true"]');
        if (editable) {
          code = editable.textContent || editable.innerText;
        }
      }
    }

    // Try to detect language from UI
    const langSelect = document.querySelector('select') ||
                      document.querySelector('[class*="language"]') ||
                      document.querySelector('[data-cy="lang-select"]');

    if (langSelect) {
      const langText = langSelect.textContent || langSelect.value || '';
      language = detectLanguage(langText);
    }

    if (code && code.trim().length > 10) {
      return { code: code.trim(), language };
    }

    return null;
  } catch (error) {
    console.error('[Terriyaki] Error extracting code:', error);
    return null;
  }
}

// Map Monaco language IDs to backend format
function mapLanguage(monacoLang) {
  const langMap = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'csharp': 'csharp',
    'go': 'go',
    'rust': 'rust',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'scala': 'scala',
    'php': 'php'
  };

  return langMap[monacoLang] || 'javascript';
}

// Detect language from text
function detectLanguage(text) {
  const lower = text.toLowerCase();

  if (lower.includes('javascript') || lower.includes('js')) return 'javascript';
  if (lower.includes('typescript') || lower.includes('ts')) return 'typescript';
  if (lower.includes('python') || lower.includes('py')) return 'python';
  if (lower.includes('java')) return 'java';
  if (lower.includes('c++') || lower.includes('cpp')) return 'cpp';
  if (lower.includes('c#') || lower.includes('csharp')) return 'csharp';
  if (lower.includes('go') || lower.includes('golang')) return 'go';
  if (lower.includes('rust')) return 'rust';
  if (lower.includes('ruby')) return 'ruby';
  if (lower.includes('swift')) return 'swift';
  if (lower.includes('kotlin')) return 'kotlin';
  if (lower.includes('scala')) return 'scala';
  if (lower.includes('php')) return 'php';

  return 'javascript'; // default
}

// Extract solution and notify background
function extractAndNotifySolution() {
  // Prevent duplicate notifications
  const now = Date.now();
  if (detectedSolution && (now - (detectedSolution.timestamp || 0)) < 5000) {
    return; // Already notified recently
  }

  const solution = extractCode();

  if (solution && solution.code && solution.code.trim().length > 10) {
    detectedSolution = {
      ...solution,
      timestamp: now
    };

    // Notify background script
    chrome.runtime.sendMessage({
      action: 'solutionDetected',
      code: solution.code,
      language: solution.language,
      timestamp: now
    }).catch(err => {
      console.error('[Terriyaki] Error sending message:', err);
    });

    console.log('[Terriyaki] Solution detected and sent to background');
  } else {
    console.log('[Terriyaki] Solution detected but code extraction failed or too short');
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getStatus') {
    sendResponse({
      solved: !!detectedSolution,
      code: detectedSolution?.code,
      language: detectedSolution?.language
    });
  } else if (message.action === 'checkSolution') {
    const solution = extractCode();
    const hasSuccess = checkForSuccess();

    sendResponse({
      solved: !!solution && hasSuccess,
      code: solution?.code,
      language: solution?.language
    });
  }

  return true; // Keep channel open for async response
});

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMonitoring);
} else {
  initMonitoring();
}

// Also re-initialize on navigation (LeetCode uses SPA)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    isMonitoring = false;
    detectedSolution = null;
    setTimeout(initMonitoring, 1000);
  }
}).observe(document, { subtree: true, childList: true });

