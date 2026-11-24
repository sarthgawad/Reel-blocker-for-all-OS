# 🍎 ReelShield for iOS (Screen Time & Safari)

> **ReelShield iOS** brings Reels & Shorts defense to iPhone and iPad through Apple's official **Screen Time Frameworks** and **Safari WebExtensions**.

---

## 💡 Why iOS Works Differently Than Android

Apple enforces strict iOS sandboxing:
- ❌ **No `AccessibilityService`**: Third-party iOS apps cannot read the UI or screen contents of other apps.
- ❌ **No `SYSTEM_ALERT_WINDOW`**: Third-party iOS apps cannot draw floating views on top of other native apps.

### 🛡️ What Actually Works on iOS:

1. **Apple Screen Time API (`FamilyControls` & `ManagedSettings`)**:
   - Uses Apple's official framework (iOS 16+) to shield native Instagram, YouTube, and Facebook apps.
   - `ShieldConfigurationExtension.swift` displays custom ReelShield branding on the block screen.
   - `DeviceActivityMonitorExtension.swift` schedules daily focus windows and enforces limits.

2. **iOS Safari WebExtension**:
   - Included in `SafariExtension/`.
   - Safari on iOS fully supports WebExtensions! When browsing YouTube, Instagram, or Facebook in Safari, the exact **floating rectangular bar with circular bordered number** appears directly on your iPhone screen.

3. **Apple Shortcuts Automations (Zero-Code Workaround)**:
   - iOS Shortcuts allows you to create an automation:
     - **Trigger**: "When Instagram / YouTube opens"
     - **Action**: "Wait 10 seconds / Prompt: Do you really want to scroll? / Open Book or Notes app".

---

## 📁 iOS Project Structure

```
ReelShield-iOS/
├── App/
│   ├── ReelShieldApp.swift            # SwiftUI Application Lifecycle
│   └── ContentView.swift              # Main Dashboard with Circular Badge Bar
├── ShieldExtension/
│   └── ShieldConfigurationExtension.swift  # Custom Screen Time Shield UI
├── DeviceActivityExtension/
│   └── DeviceActivityMonitorExtension.swift # Activity limits & schedules
└── SafariExtension/
    ├── manifest.json                  # Safari WebExtension configuration
    └── content.js                     # Mobile Safari floating pill & interceptor
```

---

## 🚀 How to Run in Xcode

1. Open Xcode on macOS.
2. Create or open the project targeting iOS 16+.
3. Add the **Family Controls** capability in **Signing & Capabilities**.
4. Run on your iPhone to authorize Screen Time and enable the Safari extension in **Settings > Safari > Extensions**.
