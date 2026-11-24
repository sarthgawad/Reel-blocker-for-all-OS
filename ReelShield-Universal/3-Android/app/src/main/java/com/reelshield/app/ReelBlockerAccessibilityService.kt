package com.reelshield.app

import android.accessibilityservice.AccessibilityService
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * ReelBlockerAccessibilityService (v1.1.0)
 * Inspects YouTube, Instagram, and Facebook in real time.
 * Intercepts reels and shorts, presses Back, and increments the counter immediately.
 */
class ReelBlockerAccessibilityService : AccessibilityService() {

    private lateinit var statsManager: ReelStatsManager
    private var lastBlockTimestamp = 0L
    private val BLOCK_DEBOUNCE_MS = 1000L

    override fun onServiceConnected() {
        super.onServiceConnected()
        statsManager = ReelStatsManager(this)
        Log.d("ReelShield", "Accessibility Service Connected & Guard Active")

        if (statsManager.isFloatingEnabled()) {
            FloatingBarOverlayService.start(this)
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val packageName = event.packageName?.toString() ?: return
        val rootNode = rootInActiveWindow ?: event.source ?: return

        val now = SystemClock.uptimeMillis()
        if (now - lastBlockTimestamp < BLOCK_DEBOUNCE_MS) {
            return
        }

        when {
            packageName.contains("youtube") -> {
                if (statsManager.isYtEnabled() && isYouTubeShortsActive(rootNode)) {
                    blockReel("youtube")
                }
            }
            packageName.contains("instagram") -> {
                if (statsManager.isIgEnabled() && isInstagramReelsActive(rootNode)) {
                    blockReel("instagram")
                }
            }
            packageName.contains("facebook") -> {
                if (statsManager.isFbEnabled() && isFacebookReelsActive(rootNode)) {
                    blockReel("facebook")
                }
            }
        }
    }

    private fun blockReel(platform: String) {
        lastBlockTimestamp = SystemClock.uptimeMillis()
        Log.i("ReelShield", "Detected and blocked $platform reel!")

        // 1. Kick user back out of the reel viewer
        performGlobalAction(GLOBAL_ACTION_BACK)

        // 2. Increment stats
        statsManager.incrementCount(platform)

        // 3. Immediately tell Floating Overlay to update UI
        FloatingBarOverlayService.notifyStatsChanged()
    }

    private fun isYouTubeShortsActive(root: AccessibilityNodeInfo): Boolean {
        val shortHolders = root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_player_page_holder")
        if (shortHolders.isNotEmpty()) return true

        val reelWatch = root.findAccessibilityNodeInfosByViewId("com.google.android.youtube:id/reel_watch_fragment")
        if (reelWatch.isNotEmpty()) return true

        return searchNodeRecursive(root) { node ->
            val id = node.viewIdResourceName ?: ""
            val desc = node.contentDescription?.toString() ?: ""
            val text = node.text?.toString() ?: ""

            id.contains("reel_recycler") ||
            (desc.equals("Shorts", ignoreCase = true) && node.className?.contains("ViewGroup") == true) ||
            (id.contains("reel") && text.contains("Remix", ignoreCase = true))
        }
    }

    private fun isInstagramReelsActive(root: AccessibilityNodeInfo): Boolean {
        val reelViewers = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/reel_viewer_framelayout")
        if (reelViewers.isNotEmpty()) return true

        val clipsViewer = root.findAccessibilityNodeInfosByViewId("com.instagram.android:id/clips_viewer_view_pager")
        if (clipsViewer.isNotEmpty()) return true

        return searchNodeRecursive(root) { node ->
            val id = node.viewIdResourceName ?: ""
            val desc = node.contentDescription?.toString() ?: ""
            id.contains("clips_video_container") ||
            id.contains("reel_viewer") ||
            desc.contains("Reel by", ignoreCase = true)
        }
    }

    private fun isFacebookReelsActive(root: AccessibilityNodeInfo): Boolean {
        return searchNodeRecursive(root) { node ->
            val desc = node.contentDescription?.toString() ?: ""
            val text = node.text?.toString() ?: ""
            desc.contains("Reel viewer", ignoreCase = true) ||
            desc.contains("Watch Reels", ignoreCase = true) ||
            (text.equals("Reels", ignoreCase = true) && node.isClickable)
        }
    }

    private fun searchNodeRecursive(node: AccessibilityNodeInfo?, predicate: (AccessibilityNodeInfo) -> Boolean): Boolean {
        if (node == null) return false
        if (predicate(node)) return true

        for (i in 0 until node.childCount) {
            val child = node.getChild(i) ?: continue
            if (searchNodeRecursive(child, predicate)) {
                return true
            }
        }
        return false
    }

    override fun onInterrupt() {}
}
