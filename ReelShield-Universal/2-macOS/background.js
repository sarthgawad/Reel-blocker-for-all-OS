/**
 * ReelShield - Background Service Worker (v1.1.0)
 * Bulletproof storage management, badge counter, and midnight roll-over.
 */

const DEFAULT_SETTINGS = {
  ytEnabled: true,
  ytRedirectToWatch: false,
  ytBlockPopups: true,
  igEnabled: true,
  fbEnabled: true,
  showFloatingBar: true,
  floatingBarPosition: { bottom: 24, right: 24 },
  dailyLimit: 0,
  strictMode: false
};

const DEFAULT_STATS = {
  todayDate: getTodayDateString(),
  todayTotal: 0,
  todayYT: 0,
  todayIG: 0,
  todayFB: 0,
  blockedTotal: 0,
  history: []
};

function getTodayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

chrome.runtime.onInstalled.addListener(async () => {
  await ensureInitialized();
  updateBadge();
});

chrome.runtime.onStartup.addListener(async () => {
  await ensureInitialized();
  updateBadge();
});

async function ensureInitialized() {
  const data = await chrome.storage.local.get(['settings', 'stats']);
  let settings = data.settings || DEFAULT_SETTINGS;
  let stats = data.stats || DEFAULT_STATS;

  const today = getTodayDateString();
  if (stats.todayDate !== today) {
    stats = rollOverDay(stats, today);
  }

  await chrome.storage.local.set({ settings, stats });
}

function rollOverDay(oldStats, today) {
  const history = oldStats.history || [];
  if (oldStats.todayDate) {
    history.unshift({
      date: oldStats.todayDate,
      total: oldStats.todayTotal || 0,
      yt: oldStats.todayYT || 0,
      ig: oldStats.todayIG || 0,
      fb: oldStats.todayFB || 0,
      blocked: oldStats.blockedTotal || 0
    });
  }
  return {
    todayDate: today,
    todayTotal: 0,
    todayYT: 0,
    todayIG: 0,
    todayFB: 0,
    blockedTotal: 0,
    history: history.slice(0, 14)
  };
}

async function updateBadge() {
  try {
    const data = await chrome.storage.local.get(['stats']);
    const total = data.stats?.todayTotal || 0;
    chrome.action.setBadgeText({ text: total > 0 ? String(total) : '0' });
    chrome.action.setBadgeBackgroundColor({
      color: total === 0 ? '#10b981' : total < 15 ? '#6366f1' : '#ef4444'
    });
  } catch (err) {}
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message).then(sendResponse);
  return true;
});

async function handleMessage(message) {
  const { action, payload } = message || {};
  const data = await chrome.storage.local.get(['settings', 'stats']);
  let settings = data.settings || DEFAULT_SETTINGS;
  let stats = data.stats || DEFAULT_STATS;

  const today = getTodayDateString();
  if (stats.todayDate !== today) {
    stats = rollOverDay(stats, today);
  }

  switch (action) {
    case 'GET_INITIAL_DATA':
      return { success: true, settings, stats };

    case 'INCREMENT_REEL_COUNT': {
      const { platform, wasBlocked } = payload || {};
      stats.todayTotal = (stats.todayTotal || 0) + 1;
      if (wasBlocked !== false) {
        stats.blockedTotal = (stats.blockedTotal || 0) + 1;
      }

      if (platform === 'youtube') stats.todayYT = (stats.todayYT || 0) + 1;
      else if (platform === 'instagram') stats.todayIG = (stats.todayIG || 0) + 1;
      else if (platform === 'facebook') stats.todayFB = (stats.todayFB || 0) + 1;

      // Writing to storage triggers chrome.storage.onChanged across ALL tabs automatically!
      await chrome.storage.local.set({ stats });
      updateBadge();
      return { success: true, stats };
    }

    case 'UPDATE_SETTINGS': {
      settings = { ...settings, ...payload };
      await chrome.storage.local.set({ settings });
      return { success: true, settings };
    }

    case 'RESET_STATS': {
      stats.todayTotal = 0;
      stats.todayYT = 0;
      stats.todayIG = 0;
      stats.todayFB = 0;
      stats.blockedTotal = 0;
      await chrome.storage.local.set({ stats });
      updateBadge();
      return { success: true, stats };
    }

    default:
      return { success: false, error: 'Unknown action' };
  }
}
