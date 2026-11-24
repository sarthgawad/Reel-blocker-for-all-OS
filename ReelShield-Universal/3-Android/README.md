# 🤖 ReelShield for Android (Native App)

> **ReelShield Android** provides **real-time Reels & Shorts blocking for native mobile apps** (YouTube, Instagram, and Facebook apps), complete with an **in-app floating rectangular bar with a circular bordered counter badge** drawn directly on top of your screen.

---

## 💡 How It Works Under The Hood

Because Android apps cannot be modified from the outside, ReelShield uses two official Android OS frameworks:

1. **Android `AccessibilityService` (`ReelBlockerAccessibilityService.kt`)**:
   - Listens to window changes for `com.google.android.youtube`, `com.instagram.android`, and `com.facebook.katana`.
   - Detects when you tap the Shorts or Reels tab or open a reel.
   - Instantly triggers `performGlobalAction(GLOBAL_ACTION_BACK)` to kick you out of the reel viewer before the dopamine loop starts!
   - Increments your daily counter in `ReelStatsManager`.

2. **Android `WindowManager` Overlay (`FloatingBarOverlayService.kt`)**:
   - Uses `SYSTEM_ALERT_WINDOW` permission to draw the **small number with circular border inside a rectangular pill bar** directly over Instagram, YouTube, and Facebook!
   - Fully draggable anywhere on your screen.
   - Updates in real-time as reels are intercepted.
   - Tapping the pill bar opens the ReelShield control hub.

---

## 📁 Android Project Structure

```
ReelShield-Android/
├── build.gradle
├── settings.gradle
└── app/
    ├── build.gradle
    └── src/main/
        ├── AndroidManifest.xml
        ├── res/
        │   ├── drawable/
        │   │   ├── bg_pill_bar.xml           # Rectangular bar with circular ends
        │   │   └── bg_circle_badge.xml        # Circular badge for the small number
        │   ├── layout/
        │   │   ├── activity_main.xml         # Main app dashboard
        │   │   └── layout_floating_counter_bar.xml  # Overlay pill bar layout
        │   ├── values/
        │   │   ├── colors.xml, strings.xml, styles.xml
        │   └── xml/
        │       └── accessibility_service_config.xml
        └── java/com/reelshield/app/
            ├── MainActivity.kt                # UI, permissions & toggles
            ├── ReelBlockerAccessibilityService.kt # Real-time app inspector & blocker
            ├── FloatingBarOverlayService.kt   # System overlay window manager
            └── ReelStatsManager.kt            # Daily counts & midnight rollover
```

---

## 🚀 How to Build & Install on Your Android Phone

### Step 1: Open in Android Studio
1. Launch **Android Studio**.
2. Select **Open** and choose the `ReelShield-Android` directory:
   `c:\Users\sarth\Downloads\EyeCareManagementSystem-main\ReelShield-Android`
3. Let Gradle sync project dependencies.

### Step 2: Build the APK
- Run `./gradlew assembleDebug` or click **Build > Build Bundle(s) / APK(s) > Build APK(s)** in Android Studio.
- The APK will be generated at `app/build/outputs/apk/debug/app-debug.apk`.

### Step 3: Enable Permissions on Phone
1. **Accessibility Permission**:
   - Tap **"1. Enable Accessibility Blocker"** in the app.
   - In Settings > Accessibility > Installed Apps, select **ReelShield** and toggle it **ON**.
2. **Display Over Other Apps Permission**:
   - Tap **"2. Enable Floating Counter Pill (Overlay)"**.
   - Toggle **Allow display over other apps**.
3. Now open YouTube, Instagram, or Facebook! Your floating counter bar will appear and any opened reel will be instantly deflected.
