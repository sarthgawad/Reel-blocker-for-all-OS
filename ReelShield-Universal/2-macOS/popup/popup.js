/**
 * ReelShield - Popup Controller Logic (v1.1.0)
 * Listens to chrome.storage.onChanged for live real-time sync.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const circleCounter = document.getElementById('popup-circle-counter');
  const totalSeenEl = document.getElementById('popup-total-seen');
  const blockedCountEl = document.getElementById('popup-blocked-count');
  const timeSavedEl = document.getElementById('popup-time-saved');
  const focusScoreEl = document.getElementById('popup-focus-score');

  const ytCountEl = document.getElementById('popup-yt-count');
  const igCountEl = document.getElementById('popup-ig-count');
  const fbCountEl = document.getElementById('popup-fb-count');

  const limitBadge = document.getElementById('limit-status-badge');
  const inputDailyLimit = document.getElementById('input-daily-limit');

  const toggleYt = document.getElementById('toggle-yt');
  const toggleYtPopups = document.getElementById('toggle-yt-popups');
  const toggleIg = document.getElementById('toggle-ig');
  const toggleFb = document.getElementById('toggle-fb');
  const toggleFloatingBar = document.getElementById('toggle-floating-bar');

  const btnResetStats = document.getElementById('btn-reset-stats');
  const btnOpenDashboard = document.getElementById('btn-open-dashboard');

  let currentSettings = {};
  let currentStats = {};

  loadData();

  // Real-time storage change listener
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.stats) {
        currentStats = changes.stats.newValue;
        updateUI(currentStats, currentSettings);
      }
      if (changes.settings) {
        currentSettings = changes.settings.newValue;
        updateUI(currentStats, currentSettings);
      }
    });
  }

  function loadData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['stats', 'settings'], (result) => {
        if (result) {
          currentStats = result.stats || {};
          currentSettings = result.settings || {};
          updateUI(currentStats, currentSettings);
        }
      });
    } else {
      // Fallback
      updateUI({ todayTotal: 0, todayYT: 0, todayIG: 0, todayFB: 0, blockedTotal: 0 }, {});
    }
  }

  function updateUI(stats = {}, settings = {}) {
    const total = stats.todayTotal || 0;
    const blocked = stats.blockedTotal || 0;
    const yt = stats.todayYT || 0;
    const ig = stats.todayIG || 0;
    const fb = stats.todayFB || 0;

    totalSeenEl.textContent = total;
    blockedCountEl.textContent = blocked;
    
    const minutesSaved = Math.round((blocked * 45) / 60);
    timeSavedEl.textContent = `${minutesSaved}m`;

    const focusScore = (total + blocked) > 0 
      ? Math.round((blocked / (total + blocked)) * 100) 
      : 100;
    focusScoreEl.textContent = `${focusScore}%`;

    ytCountEl.textContent = yt;
    igCountEl.textContent = ig;
    fbCountEl.textContent = fb;

    if (total === 0) {
      circleCounter.style.borderColor = '#10b981';
      circleCounter.style.boxShadow = '0 0 12px rgba(16, 185, 129, 0.4)';
    } else if (total < 10) {
      circleCounter.style.borderColor = '#6366f1';
      circleCounter.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.4)';
    } else if (total < 25) {
      circleCounter.style.borderColor = '#f59e0b';
      circleCounter.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.4)';
    } else {
      circleCounter.style.borderColor = '#ef4444';
      circleCounter.style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.6)';
    }

    const limit = settings.dailyLimit || 0;
    inputDailyLimit.value = limit;
    if (limit > 0) {
      if (total >= limit) {
        limitBadge.textContent = 'Limit Reached!';
        limitBadge.style.background = 'rgba(239, 68, 68, 0.2)';
        limitBadge.style.color = '#f87171';
      } else {
        limitBadge.textContent = `${limit - total} left`;
        limitBadge.style.background = 'rgba(16, 185, 129, 0.2)';
        limitBadge.style.color = '#34d399';
      }
    } else {
      limitBadge.textContent = 'Unlimited';
      limitBadge.style.background = 'rgba(99, 102, 241, 0.15)';
      limitBadge.style.color = '#a5b4fc';
    }

    toggleYt.checked = settings.ytEnabled !== false;
    toggleYtPopups.checked = settings.ytBlockPopups !== false;
    toggleIg.checked = settings.igEnabled !== false;
    toggleFb.checked = settings.fbEnabled !== false;
    toggleFloatingBar.checked = settings.showFloatingBar !== false;
  }

  function saveSettings(partial) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      currentSettings = { ...currentSettings, ...partial };
      chrome.storage.local.set({ settings: currentSettings });
    }
  }

  toggleYt.addEventListener('change', () => saveSettings({ ytEnabled: toggleYt.checked }));
  toggleYtPopups.addEventListener('change', () => saveSettings({ ytBlockPopups: toggleYtPopups.checked }));
  toggleIg.addEventListener('change', () => saveSettings({ igEnabled: toggleIg.checked }));
  toggleFb.addEventListener('change', () => saveSettings({ fbEnabled: toggleFb.checked }));
  toggleFloatingBar.addEventListener('change', () => saveSettings({ showFloatingBar: toggleFloatingBar.checked }));

  inputDailyLimit.addEventListener('change', () => {
    const val = Math.max(0, parseInt(inputDailyLimit.value, 10) || 0);
    saveSettings({ dailyLimit: val });
  });

  btnResetStats.addEventListener('click', () => {
    if (confirm('Reset today’s reel count to 0?')) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'RESET_STATS' }, () => {
          loadData();
        });
      }
    }
  });

  btnOpenDashboard.addEventListener('click', () => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('../dashboard/dashboard.html', '_blank');
    }
  });
});
