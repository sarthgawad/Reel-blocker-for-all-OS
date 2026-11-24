/**
 * ReelShield - YouTube Shorts & Pop-up Blocker (v1.1.0)
 * Real-time interception and counter trigger.
 */

(function () {
  'use strict';

  let settings = {
    ytEnabled: true,
    ytRedirectToWatch: false,
    ytBlockPopups: true
  };

  let lastCheckedUrl = '';
  let isProcessingShort = false;
  let lastShelfBlockTime = 0;

  function init() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings'], (res) => {
        if (res && res.settings) settings = { ...settings, ...res.settings };
      });
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.settings) settings = { ...settings, ...changes.settings.newValue };
      });
    }

    // Intercept SPA navigation
    window.addEventListener('yt-navigate-finish', handleUrlChange);
    window.addEventListener('spfdone', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    setInterval(() => {
      if (window.location.href !== lastCheckedUrl) {
        handleUrlChange();
      }
    }, 200);

    setupMutationObserver();
    interceptShortClicks();
  }

  function handleUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastCheckedUrl) return;
    lastCheckedUrl = currentUrl;

    if (!settings.ytEnabled) return;

    const shortsMatch = currentUrl.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    if (shortsMatch && !isProcessingShort) {
      isProcessingShort = true;
      const videoId = shortsMatch[1];

      // Instant counter increment: trigger both window helper and runtime
      triggerReelCount('youtube');

      if (settings.ytRedirectToWatch) {
        window.location.replace(`https://www.youtube.com/watch?v=${videoId}`);
      } else {
        if (window.ReelShieldBlockerOverlay) {
          window.ReelShieldBlockerOverlay.show({
            platform: 'YouTube Shorts',
            returnUrl: 'https://www.youtube.com/',
            originalVideoId: videoId
          });
        }
      }

      setTimeout(() => { isProcessingShort = false; }, 1000);
    }
  }

  function triggerReelCount(platform) {
    // 1. Direct window function if counter-bar is loaded in same frame
    if (typeof window.ReelShieldIncrementCounter === 'function') {
      window.ReelShieldIncrementCounter(platform);
    }
    window.dispatchEvent(new CustomEvent('reelshield:increment', { detail: { platform } }));

    // 2. Chrome runtime message
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'INCREMENT_REEL_COUNT',
        payload: { platform, wasBlocked: true }
      }, () => {
        if (chrome.runtime.lastError) { /* ignore silent wakeup */ }
      });
    }
  }

  function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      if (settings.ytEnabled) removeShortsElements();
      if (settings.ytBlockPopups) removePopUpShorts();
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });
    removeShortsElements();
    if (settings.ytBlockPopups) removePopUpShorts();
  }

  function removeShortsElements() {
    const sidebarShorts = document.querySelectorAll(`
      ytd-guide-entry-renderer:has(a[title="Shorts"]),
      ytd-mini-guide-entry-renderer[aria-label="Shorts"],
      a#endpoint[title="Shorts"]
    `);
    sidebarShorts.forEach(el => el.style.setProperty('display', 'none', 'important'));

    const shelves = document.querySelectorAll(`
      ytd-rich-shelf-renderer[is-shorts],
      ytd-reel-shelf-renderer,
      grid-shelf-renderer:has(span#title:contains("Shorts")),
      ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])
    `);

    if (shelves.length > 0) {
      const now = Date.now();
      // Debounced increment when shelves are eliminated
      if (now - lastShelfBlockTime > 4000) {
        lastShelfBlockTime = now;
        triggerReelCount('youtube');
      }
    }
    shelves.forEach(el => el.style.setProperty('display', 'none', 'important'));

    const gridShorts = document.querySelectorAll(`
      ytd-rich-item-renderer:has(a[href*="/shorts/"]),
      ytd-video-renderer:has(a[href*="/shorts/"])
    `);
    gridShorts.forEach(el => el.style.setProperty('display', 'none', 'important'));
  }

  function removePopUpShorts() {
    const endCards = document.querySelectorAll(`
      .ytp-ce-element:has(a[href*="/shorts/"]),
      .ytp-cards-teaser:has(a[href*="/shorts/"])
    `);
    endCards.forEach(el => {
      el.style.setProperty('display', 'none', 'important');
    });
  }

  function interceptShortClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href*="/shorts/"]');
      if (target && settings.ytEnabled) {
        triggerReelCount('youtube');
      }
    }, true);
  }

  init();
})();
