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
