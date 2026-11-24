/**
 * ReelShield - Dashboard Controller (v1.1.0)
 * Live real-time sync with chrome.storage and localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.dash-tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${tabId}`)?.classList.add('active');
    });
  });

  // Simulator in dashboard
  let simTotal = parseInt(localStorage.getItem('__reelshield_sim_total') || '0', 10);
  let simYT = parseInt(localStorage.getItem('__reelshield_sim_yt') || '0', 10);
  let simIG = parseInt(localStorage.getItem('__reelshield_sim_ig') || '0', 10);
  let simFB = parseInt(localStorage.getItem('__reelshield_sim_fb') || '0', 10);

  const demoBadge = document.getElementById('demo-circle-badge');
  const demoYT = document.getElementById('demo-yt');
  const demoIG = document.getElementById('demo-ig');
  const demoFB = document.getElementById('demo-fb');

  updateDemo();

  document.getElementById('sim-yt')?.addEventListener('click', () => {
    simTotal++; simYT++;
    saveSim();
    updateDemo();
  });
  document.getElementById('sim-ig')?.addEventListener('click', () => {
    simTotal++; simIG++;
    saveSim();
    updateDemo();
  });
  document.getElementById('sim-fb')?.addEventListener('click', () => {
    simTotal++; simFB++;
    saveSim();
    updateDemo();
  });

  function saveSim() {
    localStorage.setItem('__reelshield_sim_total', simTotal);
    localStorage.setItem('__reelshield_sim_yt', simYT);
    localStorage.setItem('__reelshield_sim_ig', simIG);
    localStorage.setItem('__reelshield_sim_fb', simFB);
  }

  function updateDemo() {
    if (demoBadge) demoBadge.textContent = simTotal;
    if (demoYT) demoYT.textContent = simYT;
    if (demoIG) demoIG.textContent = simIG;
    if (demoFB) demoFB.textContent = simFB;
  }

  // Load real stats
  loadStats();

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.stats) {
        renderData(changes.stats.newValue);
      }
    });
  }

  document.getElementById('btn-refresh-dash')?.addEventListener('click', loadStats);
  document.getElementById('btn-dash-reset')?.addEventListener('click', () => {
    if (confirm('Reset today’s counts?')) {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: 'RESET_STATS' }, loadStats);
      } else {
        localStorage.removeItem('__reelshield_stats__');
        renderData({ todayTotal: 0, todayYT: 0, todayIG: 0, todayFB: 0, blockedTotal: 0 });
      }
    }
  });

  function loadStats() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['stats', 'settings'], (res) => {
        if (res && res.stats) {
          renderData(res.stats, res.settings);
        } else {
          loadFromLocal();
        }
      });
    } else {
      loadFromLocal();
    }
  }

  function loadFromLocal() {
    try {
      const saved = localStorage.getItem('__reelshield_stats__');
      if (saved) {
        renderData(JSON.parse(saved));
        return;
      }
    } catch (e) { }
    renderData({ todayTotal: simTotal, todayYT: simYT, todayIG: simIG, todayFB: simFB, blockedTotal: simTotal });
  }

  function renderData(stats = {}) {
    const total = stats.todayTotal || 0;
    const blocked = stats.blockedTotal || 0;
    const yt = stats.todayYT || 0;
    const ig = stats.todayIG || 0;
    const fb = stats.todayFB || 0;

    const kpiBadge = document.getElementById('kpi-total-badge');
    if (kpiBadge) kpiBadge.textContent = total;

    document.getElementById('kpi-blocked').textContent = blocked;
    document.getElementById('kpi-time-saved').textContent = `${Math.round((blocked * 45) / 60)} mins`;

    const score = (total + blocked) > 0 ? Math.round((blocked / (total + blocked)) * 100) : 100;
    document.getElementById('kpi-score').textContent = `${score}%`;

    document.getElementById('plat-yt-num').textContent = `${yt} shorts`;
    document.getElementById('plat-ig-num').textContent = `${ig} reels`;
    document.getElementById('plat-fb-num').textContent = `${fb} reels`;

    const maxVal = Math.max(1, yt, ig, fb);
    document.getElementById('prog-yt').style.width = `${(yt / maxVal) * 100}%`;
    document.getElementById('prog-ig').style.width = `${(ig / maxVal) * 100}%`;
    document.getElementById('prog-fb').style.width = `${(fb / maxVal) * 100}%`;

    renderHistory(stats.history || []);
  }

  function renderHistory(history) {
    const container = document.getElementById('history-chart-container');
    if (!container) return;
    container.innerHTML = '';

    const days = history.length > 0 ? history.slice(0, 7).reverse() : [
      { date: 'Mon', total: 4 },
      { date: 'Tue', total: 8 },
      { date: 'Wed', total: 2 },
      { date: 'Thu', total: 7 },
      { date: 'Fri', total: 11 },
      { date: 'Sat', total: 5 },
      { date: 'Today', total: simTotal || 6 }
    ];

    const maxVal = Math.max(10, ...days.map(d => d.total || 0));

    days.forEach(item => {
      const col = document.createElement('div');
      col.className = 'hist-col';
      const heightPercent = Math.max(10, Math.round(((item.total || 0) / maxVal) * 100));

      col.innerHTML = `
        <div class="hist-bar" style="height: ${heightPercent}%" title="${item.total || 0} reels"></div>
        <span class="hist-label">${item.date.includes('-') ? item.date.slice(5) : item.date}</span>
      `;
      container.appendChild(col);
    });
  }
});
