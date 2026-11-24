# 🛡️ ReelShield - Shorts & Reels Blocker with Floating Counter Bar

> **ReelShield** is a cross-platform digital wellbeing extension and web application designed to block addictive short-form videos across **YouTube (including Shorts & in-player pop-ups)**, **Instagram Reels**, and **Facebook Reels**.
> 
> It features a sleek **floating rectangular bar with a circular-bordered counter badge** that displays the exact number of reels encountered or blocked across all your apps in real-time.

---

## ✨ Key Features

### 1. 🎯 The Signature Floating Counter Pill (User Requested)
- **Rectangular Bar with Circular Bordered Number**: A clean, glassmorphic pill bar with a distinct circular badge showing the number of reels seen today.
- **Dynamic Color Accents**:
  - `0 - 5 reels`: Calming Green (`#10b981`)
  - `6 - 15 reels`: Focused Indigo (`#6366f1`)
  - `16 - 25 reels`: Warning Amber (`#f59e0b`)
  - `25+ reels`: Alert Red (`#ef4444`)
- **Cross-Platform Aggregated Tracking**: Tracks and increments your count across YouTube Shorts, Instagram Reels, and Facebook Reels.
- **Shadow DOM Isolation**: The widget is rendered inside an isolated Shadow DOM (`attachShadow({ mode: 'open' })`), preventing website CSS from breaking its styling.
- **Draggable & Minimizable**: Drag the pill bar anywhere on your screen; click the minimize button to collapse it into a compact circular badge.

---

### 2. 🔴 YouTube Shorts & Pop-Up Blocker
- **URL Interception**: Intercepts `/shorts/<videoId>` navigation instantly.
  - *Option A*: Redirects to `/watch?v=<videoId>` to let you watch in a traditional, non-addictive desktop player.
  - *Option B*: Displays the ReelShield Focus Overlay Screen.
- **Shorts Shelves Removal**: Hides Shorts shelves from the YouTube Home feed, Subscriptions, and Search results (`ytd-rich-shelf-renderer[is-shorts]`, `ytd-reel-shelf-renderer`).
- **Sidebar Tab Removal**: Eliminates the Shorts shortcut from YouTube's guide menu and mini-guide.
- **Pop-Up Shorts Blocker**: Blocks in-player end-screen Shorts cards (`.ytp-ce-element:has(a[href*="/shorts/"])`), teaser cards, and miniplayer pop-ups.

---

### 3. 🟣 Instagram Reels Blocker
- **Navigation Stripping**: Hides the Reels tab and icon in both the desktop sidebar and mobile navigation (`a[href*="/reels/"]`, `svg[aria-label="Reels"]`).
- **URL Interception**: Blocks direct visits to `instagram.com/reels/` and `instagram.com/reel/<id>/`, redirecting to the main feed or focus overlay.
- **Feed Carousel Removal**: Hides suggested reels carousels and exploration tiles.

---

### 4. 🔵 Facebook Reels Blocker
- **Feed Removal**: Automatically removes the "Reels and short videos" shelf from Facebook home feeds and Watch pages.
- **Shortcut Removal**: Hides Reels buttons from the left navigation bar.
- **URL Interception**: Redirects `facebook.com/reel/*` and `facebook.com/watch/reels/*` back to safe feed browsing.

---

### 5. 📊 Analytics Dashboard & Popup Control Hub
- **Popup (`popup/popup.html`)**: Click the extension icon to view today's reels count, blocked count, estimated time saved, platform breakdown, and toggle switches for each site.
- **Full Dashboard (`dashboard/dashboard.html`)**:
  - 7-Day History Chart.
  - Platform comparison graphs.
  - Focus retention score (Attention Health Index).
  - Daily limit configurations (e.g. set a maximum of 5 reels/day).

---

## 📁 Project Architecture

```
ReelShield/
├── manifest.json              # Manifest V3 extension configuration
├── background.js              # Service worker: cross-tab sync & midnight reset
├── index.html                 # Standalone Web App & Interactive Simulator
├── README.md                  # Complete documentation
│
├── content/                   # Injected content scripts & styles
│   ├── counter-bar.js         # Floating rectangular pill bar with circular badge
│   ├── counter-bar.css        # Host container rules
│   ├── blocker-overlay.js     # Motivational focus overlay screen
│   ├── blocker-overlay.css    # Overlay glassmorphic styles
│   ├── youtube.js             # YouTube Shorts & Pop-up blocker logic
│   ├── youtube.css            # Instant CSS hiding rules for YouTube
│   ├── instagram.js           # Instagram Reels blocker logic
│   ├── instagram.css          # Instant CSS hiding rules for Instagram
│   ├── facebook.js            # Facebook Reels blocker logic
│   └── facebook.css           # Instant CSS hiding rules for Facebook
│
├── popup/                     # Toolbar extension popup
│   ├── popup.html             # Popup layout
│   ├── popup.css              # Dark glassmorphism popup styling
│   └── popup.js               # Popup interactions & real-time sync
│
├── dashboard/                 # Full Analytics & Settings page
│   ├── dashboard.html         # Analytics dashboard layout
│   ├── dashboard.css          # Dashboard styling & chart layout
│   └── dashboard.js           # Chart rendering & mock/live data controller
│
└── icons/                     # Extension branding icons
    ├── icon.svg               # Vector shield badge
    ├── icon16.png             # 16x16 icon
    ├── icon48.png             # 48x48 icon
    └── icon128.png            # 128x128 icon
```

---

## 🚀 How to Install in Your Browser (Chrome, Brave, Edge, Opera)

1. Open your browser and go to the extensions page:
   - **Google Chrome / Brave**: `chrome://extensions/`
   - **Microsoft Edge**: `edge://extensions/`
   - **Opera**: `opera://extensions/`
2. Turn **ON** the **Developer mode** toggle (usually located in the top-right corner).
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `ReelShield` folder:
   `c:\Users\sarth\Downloads\EyeCareManagementSystem-main\ReelShield`
5. The extension is installed!
   - Pin **ReelShield** to your toolbar.
   - Open **YouTube**, **Instagram**, or **Facebook** to see the blocker and floating counter bar in action.

---

## 🌐 Running the Standalone Web Simulator

You can also test and demo ReelShield directly in any web browser without installing the extension:
1. Double-click `index.html` (or run a local server: `npx serve ReelShield`).
2. Test clicking **YouTube Short**, **YT Pop-Up Short**, **Instagram Reel**, and **Facebook Reel**.
3. Watch the floating circular-bordered counter bar react and increment in real-time!
