# 🛡️ ReelShield Universal: Complete Cross-Platform Suite

> **ReelShield Universal** contains the complete, production-ready project for **all 4 operating systems** (Windows, macOS, Android, and iOS) inside this single unified folder.
> 
> Created with care by **Sarth**.

---

## 📁 Unified Folder Organization

```
ReelShield-Universal/
│
├── HUB.html                           # 🌟 MASTER CENTRAL PORTAL (Click to browse all OS)
├── README.md                          # Master documentation for all platforms
│
├── 1-Windows/                         # 🪟 WINDOWS SECTION
│   ├── manifest.json                  # Chrome, Edge, Brave Extension config
│   ├── index.html                     # Standalone Windows simulator & dashboard
│   ├── Launch-ReelShield-Windows.bat  # 1-Click Windows Launcher
│   ├── content/                       # Content scripts (YouTube, Insta, FB, Counter Bar)
│   ├── popup/                         # Windows extension popup
│   └── dashboard/                     # Full analytics dashboard
│
├── 2-macOS/                           # 🍎 macOS SECTION
│   ├── manifest.json                  # Mac Chrome, Edge, Brave, Safari extension
│   ├── index.html                     # Mac simulator & dashboard
│   ├── Launch-ReelShield-Mac.command  # 1-Click Mac Launcher
│   ├── content/                       # Injected scripts & floating bar
│   └── dashboard/                     # Full analytics
│
├── 3-Android/                         # 🤖 ANDROID SECTION (Native App Project)
│   ├── build.gradle, settings.gradle  # Gradle build configuration
│   ├── README.md                      # Complete Android build & APK instructions
│   └── app/src/main/
│       ├── AndroidManifest.xml        # Permissions: Accessibility & Overlay
│       ├── java/com/reelshield/app/
│       │   ├── MainActivity.kt        # Dashboard & permission toggles
│       │   ├── ReelBlockerAccessibilityService.kt # Real-time native app blocker
│       │   ├── FloatingBarOverlayService.kt       # Floating WindowManager overlay
│       │   └── ReelStatsManager.kt    # Daily counts & midnight rollover
│       └── res/layout/
│           ├── activity_main.xml      # App dashboard
│           └── layout_floating_counter_bar.xml # Floating pill bar with 'by Sarth'
│
└── 4-iOS/                             # 📱 iOS SECTION (iPhone & iPad)
    ├── README.md                      # iOS Screen Time & Xcode guide
    ├── App/
    │   ├── ReelShieldApp.swift        # SwiftUI Lifecycle
    │   └── ContentView.swift          # Screen Time Dashboard with 'by Sarth'
    ├── ShieldExtension/               # Custom Apple Screen Time Shield Screen
    ├── DeviceActivityExtension/       # Limits & schedules monitor
    └── SafariExtension/               # Mobile Safari extension with floating bar
```

---

## 🌟 Instant Quick Launch

- **Open the Master Portal**: Double-click [`HUB.html`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/HUB.html) to open the interactive visual portal for all platforms.
- **On Windows**: Run [`1-Windows/Launch-ReelShield-Windows.bat`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/1-Windows/Launch-ReelShield-Windows.bat).
- **On Mac**: Run [`2-macOS/Launch-ReelShield-Mac.command`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/2-macOS/Launch-ReelShield-Mac.command).
- **On Android**: Open [`3-Android/`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/3-Android) in Android Studio.
- **On iOS**: Open [`4-iOS/`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/4-iOS) in Xcode.

---

## 🪟 1. Windows Guide
- **Supported Browsers**: Google Chrome, Microsoft Edge, Brave, Opera.
- **Installation**:
  1. Open `chrome://extensions` or `edge://extensions`.
  2. Toggle **Developer mode** to ON.
  3. Click **Load unpacked** and select the [`1-Windows`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/1-Windows) folder.
  4. Browse YouTube, Instagram, or Facebook distraction-free with the floating counter bar!

---

## 🍎 2. macOS Guide
- **Supported Browsers**: Chrome for Mac, Safari, Brave, Edge.
- **Installation**:
  1. For Chrome/Brave/Edge on Mac: Load unpacked from [`2-macOS`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/2-macOS).
  2. For Safari on Mac: Convert using Xcode's `xcrun safari-web-extension-converter`.
  3. Includes the full floating bar with the small circular bordered number and **`by Sarth`**.

---

## 🤖 3. Android Guide (Native Phone App)
- **Supported Devices**: Any Android phone or tablet (Android 8.0 through Android 14+).
- **How It Works**:
  - `ReelBlockerAccessibilityService`: Automatically kicks you out of native YouTube Shorts, Instagram Reels, and Facebook Reels.
  - `FloatingBarOverlayService`: Draws the **small number with circular border rectangular bar** directly on your phone screen over all apps!
- **How to Build**:
  1. Open [`3-Android`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/3-Android) in Android Studio.
  2. Connect your phone via USB (with USB Debugging ON) or click **Build > Build APK(s)** to generate `app-debug.apk`.
  3. Install on phone, enable **Accessibility** + **Draw over other apps**, and enjoy.

---

## 📱 4. iOS Guide (iPhone & iPad)
- **Supported Devices**: iPhone & iPad running iOS 16+.
- **How It Works**:
  - **Apple Screen Time API** (`FamilyControls` & `ManagedSettings`): Shields native Instagram, YouTube, and Facebook apps.
  - **Mobile Safari Extension**: Injects the floating counter bar onto mobile web pages in Safari.
- **How to Build**:
  1. Open [`4-iOS`](file:///c:/Users/sarth/Downloads/EyeCareManagementSystem-main/ReelShield-Universal/4-iOS) in Xcode on macOS.
  2. Add your Apple Developer signing team and run on your iPhone.

---

<p align="center">
  <b>✨ Designed, Built & Maintained with ❤️ by Sarth ✨</b>
</p>
