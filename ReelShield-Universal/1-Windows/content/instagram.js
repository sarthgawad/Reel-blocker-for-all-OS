/**
 * ReelShield - Instagram Reels Blocker (v1.1.0)
 * Real-time interception and counter trigger.
 */

(function () {
  'use strict';

  let settings = { igEnabled: true };
  let lastCheckedUrl = '';
  let isProcessingReel = false;
  let lastTrayBlockTime = 0;

  function init() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings'], (res) => {
        if (res && res.settings) settings = { ...settings, ...res.settings };
      });
      chrome.storage.onChanged.addListener((changes) => {
        if (changes.settings) settings = { ...settings, ...changes.settings.newValue };
      });
    }

    setInterval(() => {
      if (window.location.href !== lastCheckedUrl) {
        handleUrlChange();
      }
    }, 200);

    setupMutationObserver();
    interceptReelClicks();
  }

  function handleUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastCheckedUrl) return;
    lastCheckedUrl = currentUrl;

    if (!settings.igEnabled) return;

    const isReelsPath = currentUrl.includes('/reels/') || /\/reel\/[a-zA-Z0-9_-]+/.test(currentUrl);
    if (isReelsPath && !isProcessingReel) {
      isProcessingReel = true;
      triggerReelCount('instagram');

      if (window.ReelShieldBlockerOverlay) {
        window.ReelShieldBlockerOverlay.show({
          platform: 'Instagram Reels',
          returnUrl: 'https://www.instagram.com/'
        });
      } else {
        window.location.replace('https://www.instagram.com/');
      }

      setTimeout(() => { isProcessingReel = false; }, 1000);
    }
  }

  function triggerReelCount(platform) {
    if (typeof window.ReelShieldIncrementCounter === 'function') {
      window.ReelShieldIncrementCounter(platform);
    }
    window.dispatchEvent(new CustomEvent('reelshield:increment', { detail: { platform } }));

    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'INCREMENT_REEL_COUNT',
        payload: { platform, wasBlocked: true }
      }, () => {
        if (chrome.runtime.lastError) {}
      });
    }
  }

  function setupMutationObserver() {
    const observer = new MutationObserver(() => {
      if (settings.igEnabled) removeInstagramReelsElements();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    removeInstagramReelsElements();
  }

  function removeInstagramReelsElements() {
    const reelsNav = document.querySelectorAll(`
      a[href*="/reels/"],
      svg[aria-label="Reels"],
      div[role="navigation"] a:has(svg[aria-label="Reels"])
    `);
    reelsNav.forEach(el => {
      const container = el.closest('div[role="none"]') || el.closest('li') || el;
      container.style.setProperty('display', 'none', 'important');
    });

    const reelTrays = document.querySelectorAll('article:has(a[href*="/reel/"])');
    if (reelTrays.length > 0) {
      const now = Date.now();
      if (now - lastTrayBlockTime > 4000) {
        lastTrayBlockTime = now;
        triggerReelCount('instagram');
      }
    }
    reelTrays.forEach(el => el.style.setProperty('display', 'none', 'important'));
  }

  function interceptReelClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href*="/reel/"], a[href*="/reels/"]');
      if (target && settings.igEnabled) {
        triggerReelCount('instagram');
      }
    }, true);
  }

  init();
})();
