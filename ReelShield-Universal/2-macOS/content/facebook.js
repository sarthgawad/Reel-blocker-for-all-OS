/**
 * ReelShield - Facebook Reels Blocker (v1.1.0)
 * Real-time interception and counter trigger.
 */

(function () {
  'use strict';

  let settings = { fbEnabled: true };
  let lastCheckedUrl = '';
  let isProcessingReel = false;

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
    interceptFacebookClicks();
  }

  function handleUrlChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastCheckedUrl) return;
    lastCheckedUrl = currentUrl;

    if (!settings.fbEnabled) return;

    const isReelsPath = currentUrl.includes('/reel/') || currentUrl.includes('/reels/') || currentUrl.includes('/watch/reels');
    if (isReelsPath && !isProcessingReel) {
      isProcessingReel = true;
      triggerReelCount('facebook');

      if (window.ReelShieldBlockerOverlay) {
        window.ReelShieldBlockerOverlay.show({
          platform: 'Facebook Reels',
          returnUrl: 'https://www.facebook.com/'
        });
      } else {
        window.location.replace('https://www.facebook.com/');
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
      if (settings.fbEnabled) removeFacebookReelsElements();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    removeFacebookReelsElements();
  }

  function removeFacebookReelsElements() {
    const reelsNav = document.querySelectorAll(`
      a[href*="/reel/"],
      a[href*="/watch/reels/"],
      div[aria-label="Reels"]
    `);
    reelsNav.forEach(el => {
      const container = el.closest('li') || el.closest('div[role="listitem"]') || el;
      container.style.setProperty('display', 'none', 'important');
    });

    const feedTrays = document.querySelectorAll(`
      div[aria-label*="Reels and short videos"],
      div[data-pagelet*="Reels"]
    `);
    feedTrays.forEach(el => el.style.setProperty('display', 'none', 'important'));
  }

  function interceptFacebookClicks() {
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a[href*="/reel/"], a[href*="/reels/"], a[href*="/watch/reels"]');
      if (target && settings.fbEnabled) {
        triggerReelCount('facebook');
      }
    }, true);
  }

  init();
})();
