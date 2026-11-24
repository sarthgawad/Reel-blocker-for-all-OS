/**
 * ReelShield - Floating Counter Bar Widget (v1.1.0)
 * Injected on YouTube, Instagram, and Facebook.
 * Renders a rectangular bar with a circular bordered number showing
 * the total reels seen across all platforms, with platform breakdown.
 * Includes "Made by Sarth" in an attractive small font.
 */

(function () {
  if (window.__REELSHIELD_COUNTER_BAR_INJECTED__) return;
  window.__REELSHIELD_COUNTER_BAR_INJECTED__ = true;

  let currentSettings = {
    showFloatingBar: true,
    floatingBarPosition: { bottom: 24, right: 24 },
    dailyLimit: 0,
    strictMode: false
  };

  let currentStats = {
    todayTotal: 0,
    todayYT: 0,
    todayIG: 0,
    todayFB: 0,
    blockedTotal: 0
  };

  let hostElement = null;
  let shadowRoot = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let isMinimized = false;

  // Initialize with multi-layer storage sync
  function init() {
    loadCachedStats();

    // 1. Direct Chrome Storage read
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['settings', 'stats'], (result) => {
        if (result) {
          if (result.settings) currentSettings = { ...currentSettings, ...result.settings };
          if (result.stats) currentStats = { ...currentStats, ...result.stats };
          saveCachedStats();
        }
        mountWidgetIfAllowed();
      });

      // 2. Chrome Storage Change Listener (100% reliable real-time sync across tabs!)
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'local') {
          if (changes.stats) {
            currentStats = { ...currentStats, ...changes.stats.newValue };
            saveCachedStats();
            updateWidgetUI();
          }
          if (changes.settings) {
            currentSettings = { ...currentSettings, ...changes.settings.newValue };
            if (currentSettings.showFloatingBar) {
              mountWidgetIfAllowed();
              updateWidgetUI();
            } else {
              removeWidget();
            }
          }
        }
      });
    } else {
      // Standalone web mode
      mountWidgetIfAllowed();
    }

    // 3. Fallback message listener
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
      chrome.runtime.onMessage.addListener((message) => {
        if (message && message.action === 'STATS_UPDATED') {
          currentStats = { ...currentStats, ...message.stats };
          saveCachedStats();
          updateWidgetUI();
        }
      });
    }

    // 4. Custom in-page event listener for direct script increment
    window.addEventListener('reelshield:increment', (e) => {
      const platform = e.detail?.platform || 'youtube';
      incrementLocal(platform);
    });
  }

  function loadCachedStats() {
    try {
      const saved = localStorage.getItem('__reelshield_stats__');
      if (saved) {
        const parsed = JSON.parse(saved);
        currentStats = { ...currentStats, ...parsed };
      }
    } catch (e) {}
  }

  function saveCachedStats() {
    try {
      localStorage.setItem('__reelshield_stats__', JSON.stringify(currentStats));
    } catch (e) {}
  }

  function incrementLocal(platform) {
    currentStats.todayTotal = (currentStats.todayTotal || 0) + 1;
    currentStats.blockedTotal = (currentStats.blockedTotal || 0) + 1;
    if (platform === 'youtube') currentStats.todayYT = (currentStats.todayYT || 0) + 1;
    else if (platform === 'instagram') currentStats.todayIG = (currentStats.todayIG || 0) + 1;
    else if (platform === 'facebook') currentStats.todayFB = (currentStats.todayFB || 0) + 1;

    saveCachedStats();
    updateWidgetUI();

    // Sync to chrome storage if available
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ stats: currentStats });
    }
  }

  function mountWidgetIfAllowed() {
    if (!currentSettings.showFloatingBar) return;
    if (document.body) {
      renderWidget();
    } else {
      window.addEventListener('DOMContentLoaded', renderWidget, { once: true });
      setTimeout(renderWidget, 500);
    }
  }

  function renderWidget() {
    if (hostElement || !document.body) return;

    hostElement = document.createElement('div');
    hostElement.id = 'reelshield-counter-host';
    hostElement.style.cssText = `
      position: fixed;
      bottom: ${currentSettings.floatingBarPosition.bottom || 24}px;
      right: ${currentSettings.floatingBarPosition.right || 24}px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    `;

    // Attach Shadow DOM for complete CSS isolation from YouTube/Instagram/Facebook styles
    shadowRoot = hostElement.attachShadow({ mode: 'open' });

    const styleTag = document.createElement('style');
    styleTag.textContent = getWidgetCSS();
    shadowRoot.appendChild(styleTag);

    // Widget HTML: Rectangular bar with circular bordered number & "Made by Sarth"
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'rs-pill-bar';
    widgetContainer.id = 'rs-main-bar';
    widgetContainer.innerHTML = `
      <!-- Drag Handle -->
      <div class="rs-drag-handle" title="Drag to reposition">
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.5"/><circle cx="8" cy="2" r="1.5"/>
          <circle cx="2" cy="8" r="1.5"/><circle cx="8" cy="8" r="1.5"/>
          <circle cx="2" cy="14" r="1.5"/><circle cx="8" cy="14" r="1.5"/>
        </svg>
      </div>

      <!-- Shield Brand Icon -->
      <div class="rs-brand-icon" title="ReelShield Active">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      </div>

      <!-- Rectangular Content Area -->
      <div class="rs-bar-content">
        <span class="rs-bar-label">Reels Seen:</span>
        <!-- The Small Number with Circular Border (User requirement) -->
        <div class="rs-circular-badge" id="rs-count-badge" title="Total reels seen/blocked today">
          <span id="rs-count-number">${currentStats.todayTotal || 0}</span>
        </div>
      </div>

      <!-- Quick Platform Indicators -->
      <div class="rs-breakdown-tags" id="rs-breakdown-preview">
        <span class="rs-tag rs-tag-yt" title="YouTube Shorts">YT: <b id="rs-yt-count">${currentStats.todayYT || 0}</b></span>
        <span class="rs-tag rs-tag-ig" title="Instagram Reels">IG: <b id="rs-ig-count">${currentStats.todayIG || 0}</b></span>
        <span class="rs-tag rs-tag-fb" title="Facebook Reels">FB: <b id="rs-fb-count">${currentStats.todayFB || 0}</b></span>
      </div>

      <!-- Action / Collapse Toggle -->
      <button class="rs-icon-btn rs-minimize-btn" id="rs-min-btn" title="Minimize / Expand">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>

      <!-- Attractive "Made by Sarth" small badge -->
      <div class="rs-author-tag" title="ReelShield by Sarth">
        <span>by <b>Sarth</b></span>
      </div>

      <!-- Detailed Breakdown Popover (Visible on hover/click) -->
      <div class="rs-popover" id="rs-detail-popover">
        <div class="rs-popover-header">
          <span>ReelShield Overview</span>
          <span class="rs-badge-today">Today</span>
        </div>
        <div class="rs-popover-stat-row">
          <span class="rs-stat-name"><span class="rs-dot red"></span> YouTube Shorts</span>
          <span class="rs-stat-val" id="rs-pop-yt">${currentStats.todayYT || 0}</span>
        </div>
        <div class="rs-popover-stat-row">
          <span class="rs-stat-name"><span class="rs-dot purple"></span> Instagram Reels</span>
          <span class="rs-stat-val" id="rs-pop-ig">${currentStats.todayIG || 0}</span>
        </div>
        <div class="rs-popover-stat-row">
          <span class="rs-stat-name"><span class="rs-dot blue"></span> Facebook Reels</span>
          <span class="rs-stat-val" id="rs-pop-fb">${currentStats.todayFB || 0}</span>
        </div>
        <div class="rs-popover-divider"></div>
        <div class="rs-popover-stat-row rs-stat-highlight">
          <span class="rs-stat-name">🛡️ Reels Blocked</span>
          <span class="rs-stat-val text-green" id="rs-pop-blocked">${currentStats.blockedTotal || 0}</span>
        </div>
        <div class="rs-popover-stat-row">
          <span class="rs-stat-name">⏳ Est. Time Saved</span>
          <span class="rs-stat-val text-cyan" id="rs-pop-saved">${Math.round(((currentStats.blockedTotal || 0) * 45) / 60)}m</span>
        </div>
        <div class="rs-popover-footer">
          <span class="rs-creator-credit">✨ Made with precision by <b>Sarth</b></span>
        </div>
      </div>
    `;

    shadowRoot.appendChild(widgetContainer);
    document.body.appendChild(hostElement);

    setupEventListeners();
    updateWidgetUI();
  }

  function removeWidget() {
    if (hostElement && hostElement.parentNode) {
      hostElement.parentNode.removeChild(hostElement);
      hostElement = null;
      shadowRoot = null;
    }
  }

  function setupEventListeners() {
    if (!shadowRoot) return;
    const bar = shadowRoot.getElementById('rs-main-bar');
    const dragHandle = shadowRoot.querySelector('.rs-drag-handle');
    const minBtn = shadowRoot.getElementById('rs-min-btn');

    if (dragHandle) {
      dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        dragOffset.x = e.clientX - hostElement.getBoundingClientRect().left;
        dragOffset.y = e.clientY - hostElement.getBoundingClientRect().top;
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        e.preventDefault();
      });
    }

    if (minBtn) {
      minBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isMinimized = !isMinimized;
        bar.classList.toggle('rs-minimized', isMinimized);
        minBtn.innerHTML = isMinimized
          ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>`
          : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
      });
    }
  }

  function onDragMove(e) {
    if (!isDragging || !hostElement) return;
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;

    const boundedX = Math.max(10, Math.min(window.innerWidth - hostElement.offsetWidth - 10, x));
    const boundedY = Math.max(10, Math.min(window.innerHeight - hostElement.offsetHeight - 10, y));

    hostElement.style.left = `${boundedX}px`;
    hostElement.style.top = `${boundedY}px`;
    hostElement.style.right = 'auto';
    hostElement.style.bottom = 'auto';
  }

  function onDragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  }

  function updateWidgetUI() {
    if (!shadowRoot) return;

    const countNum = shadowRoot.getElementById('rs-count-number');
    const badge = shadowRoot.getElementById('rs-count-badge');
    const ytCount = shadowRoot.getElementById('rs-yt-count');
    const igCount = shadowRoot.getElementById('rs-ig-count');
    const fbCount = shadowRoot.getElementById('rs-fb-count');

    const popYt = shadowRoot.getElementById('rs-pop-yt');
    const popIg = shadowRoot.getElementById('rs-pop-ig');
    const popFb = shadowRoot.getElementById('rs-pop-fb');
    const popBlocked = shadowRoot.getElementById('rs-pop-blocked');
    const popSaved = shadowRoot.getElementById('rs-pop-saved');

    const total = currentStats.todayTotal || 0;
    const blocked = currentStats.blockedTotal || 0;
    const yt = currentStats.todayYT || 0;
    const ig = currentStats.todayIG || 0;
    const fb = currentStats.todayFB || 0;

    if (countNum) {
      countNum.textContent = total;
      if (badge) {
        badge.classList.remove('pulse');
        void badge.offsetWidth;
        badge.classList.add('pulse');
      }
    }

    if (badge) {
      if (total === 0) {
        badge.style.borderColor = '#10b981';
        badge.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
      } else if (total < 10) {
        badge.style.borderColor = '#6366f1';
        badge.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.45)';
      } else if (total < 25) {
        badge.style.borderColor = '#f59e0b';
        badge.style.boxShadow = '0 0 12px rgba(245, 158, 11, 0.5)';
      } else {
        badge.style.borderColor = '#ef4444';
        badge.style.boxShadow = '0 0 14px rgba(239, 68, 68, 0.65)';
      }
    }

    if (ytCount) ytCount.textContent = yt;
    if (igCount) igCount.textContent = ig;
    if (fbCount) fbCount.textContent = fb;

    if (popYt) popYt.textContent = yt;
    if (popIg) popIg.textContent = ig;
    if (popFb) popFb.textContent = fb;
    if (popBlocked) popBlocked.textContent = blocked;

    const minutesSaved = Math.round((blocked * 45) / 60);
    if (popSaved) popSaved.textContent = `${minutesSaved}m`;
  }

  function getWidgetCSS() {
    return `
      :host {
        all: initial;
      }
      
      .rs-pill-bar {
        position: relative;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 6px 14px 6px 10px;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1.5px solid rgba(255, 255, 255, 0.16);
        border-radius: 9999px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(99, 102, 241, 0.25);
        color: #f8fafc;
        font-size: 13px;
        font-weight: 500;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: default;
      }

      .rs-pill-bar:hover {
        border-color: rgba(99, 102, 241, 0.65);
        box-shadow: 0 14px 32px rgba(0, 0, 0, 0.7), 0 0 25px rgba(99, 102, 241, 0.35);
      }

      .rs-drag-handle {
        cursor: grab;
        color: #64748b;
        display: flex;
        align-items: center;
        padding: 2px;
      }
      .rs-drag-handle:hover { color: #cbd5e1; }
      .rs-drag-handle:active { cursor: grabbing; }

      .rs-brand-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #6366f1;
      }

      .rs-bar-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .rs-bar-label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.3px;
        color: #cbd5e1;
        white-space: nowrap;
      }

      /* User Requirement: Small number with circular border */
      .rs-circular-badge {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        min-width: 28px;
        border-radius: 50%;
        border: 2px solid #10b981;
        background: rgba(30, 41, 59, 0.95);
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .rs-circular-badge.pulse {
        transform: scale(1.25);
      }

      .rs-breakdown-tags {
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 2px;
      }

      .rs-tag {
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        letter-spacing: 0.2px;
      }

      .rs-tag b {
        color: #f1f5f9;
        font-weight: 700;
      }

      .rs-tag-yt { border-left: 2px solid #ef4444; }
      .rs-tag-ig { border-left: 2px solid #d946ef; }
      .rs-tag-fb { border-left: 2px solid #3b82f6; }

      /* Attractive "Made by Sarth" small badge */
      .rs-author-tag {
        font-size: 9.5px;
        padding: 2px 7px;
        border-radius: 9999px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(217, 70, 239, 0.25) 100%);
        border: 1px solid rgba(168, 85, 247, 0.4);
        color: #e2e8f0;
        letter-spacing: 0.4px;
        display: flex;
        align-items: center;
      }

      .rs-author-tag b {
        background: linear-gradient(135deg, #a5b4fc 0%, #f0abfc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-weight: 700;
        margin-left: 2px;
      }

      .rs-icon-btn {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 50%;
        transition: all 0.15s;
      }

      .rs-icon-btn:hover {
        color: #ffffff;
        background: rgba(255, 255, 255, 0.1);
      }

      .rs-pill-bar.rs-minimized {
        padding: 4px;
        border-radius: 50%;
      }
      .rs-pill-bar.rs-minimized .rs-drag-handle,
      .rs-pill-bar.rs-minimized .rs-brand-icon,
      .rs-pill-bar.rs-minimized .rs-bar-label,
      .rs-pill-bar.rs-minimized .rs-breakdown-tags,
      .rs-pill-bar.rs-minimized .rs-author-tag,
      .rs-pill-bar.rs-minimized #rs-detail-popover {
        display: none !important;
      }

      .rs-popover {
        position: absolute;
        bottom: calc(100% + 12px);
        right: 0;
        width: 230px;
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.15);
        border-radius: 14px;
        padding: 12px 14px;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.7);
        opacity: 0;
        pointer-events: none;
        transform: translateY(6px);
        transition: all 0.2s ease-in-out;
      }

      .rs-pill-bar:hover .rs-popover {
        opacity: 1;
        pointer-events: auto;
        transform: translateY(0);
      }

      .rs-popover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        font-weight: 700;
        color: #94a3b8;
        margin-bottom: 8px;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }

      .rs-badge-today {
        background: #6366f1;
        color: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 9px;
      }

      .rs-popover-stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
        padding: 3px 0;
        color: #cbd5e1;
      }

      .rs-stat-name {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .rs-stat-val {
        font-weight: 700;
        color: #ffffff;
      }

      .rs-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }
      .rs-dot.red { background: #ef4444; }
      .rs-dot.purple { background: #d946ef; }
      .rs-dot.blue { background: #3b82f6; }

      .rs-popover-divider {
        height: 1px;
        background: rgba(255, 255, 255, 0.08);
        margin: 6px 0;
      }

      .text-green { color: #10b981 !important; }
      .text-cyan { color: #38bdf8 !important; }

      .rs-popover-footer {
        margin-top: 10px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        text-align: center;
      }

      .rs-creator-credit {
        font-size: 10.5px;
        color: #cbd5e1;
      }

      .rs-creator-credit b {
        background: linear-gradient(135deg, #a5b4fc 0%, #f0abfc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `;
  }

  // Global helper accessible by content scripts
  window.ReelShieldIncrementCounter = (platform) => {
    incrementLocal(platform);
  };

  // Run on start
  init();
})();
/**
 * ReelShield - Blocker Overlay Screen
 * Displays a mindful, motivational focus screen when navigating to a reel/short,
 * instead of letting the user fall into an infinite scroll trap.
 */

(function () {
  if (window.__REELSHIELD_OVERLAY_INJECTED__) return;
  window.__REELSHIELD_OVERLAY_INJECTED__ = true;

  const QUOTES = [
    "Your focus determines your reality. Don't trade your dreams for 15 seconds of dopamine.",
    "Small disciplines repeated with consistency every day lead to great achievements.",
    "The secret of getting ahead is getting started on what truly matters.",
    "Attention is the rarest and purest form of generosity. Give it to your real life.",
    "You won't remember the 50 reels you watched today, but you will remember what you built."
  ];

  function showBlockScreen(options = {}) {
    const { platform = 'YouTube Shorts', returnUrl = '/', originalVideoId = null } = options;
    
    // Check if already active
    if (document.getElementById('reelshield-block-screen')) return;

    // Pause any playing audio/video on page
    document.querySelectorAll('video, audio').forEach(media => {
      try { media.pause(); } catch(e) {}
    });

    const overlay = document.createElement('div');
    overlay.id = 'reelshield-block-screen';
    
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

    overlay.innerHTML = `
      <div class="rs-modal-card">
        <div class="rs-modal-icon-shield">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>

        <div class="rs-modal-badge">${platform} Blocked</div>

        <h1 class="rs-modal-title">Stay in Control of Your Mind</h1>
        <p class="rs-modal-quote">“${randomQuote}”</p>

        <div class="rs-modal-actions">
          <button id="rs-btn-leave" class="rs-btn rs-btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
            Return to Feed
          </button>
          
          ${originalVideoId ? `
            <button id="rs-btn-watch" class="rs-btn rs-btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Watch as Normal Video
            </button>
          ` : ''}

          <button id="rs-btn-dismiss" class="rs-btn rs-btn-ghost">
            Temporary 30s Pass
          </button>
        </div>

        <div class="rs-modal-footer">
          <span>Protected by <b>ReelShield</b></span>
        </div>
      </div>
    `;

    document.documentElement.appendChild(overlay);

    // Event listeners
    document.getElementById('rs-btn-leave')?.addEventListener('click', () => {
      window.location.href = returnUrl;
    });

    if (originalVideoId) {
      document.getElementById('rs-btn-watch')?.addEventListener('click', () => {
        window.location.href = `https://www.youtube.com/watch?v=${originalVideoId}`;
      });
    }

    document.getElementById('rs-btn-dismiss')?.addEventListener('click', () => {
      overlay.remove();
    });
  }

  window.ReelShieldBlockerOverlay = {
    show: showBlockScreen
  };
})();
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
