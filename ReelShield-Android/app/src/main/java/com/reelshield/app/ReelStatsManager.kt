package com.reelshield.app

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Manages daily statistics, platform breakdown, and persistence across midnight resets.
 */
class ReelStatsManager(private val context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("ReelShieldStats", Context.MODE_PRIVATE)

    companion object {
        const val ACTION_STATS_UPDATED = "com.reelshield.app.STATS_UPDATED"
        private const val KEY_DATE = "today_date"
        private const val KEY_TOTAL = "today_total"
        private const val KEY_YT = "today_yt"
        private const val KEY_IG = "today_ig"
        private const val KEY_FB = "today_fb"
        private const val KEY_BLOCKED = "today_blocked"

        // Settings keys
        const val KEY_YT_ENABLED = "setting_yt"
        const val KEY_IG_ENABLED = "setting_ig"
        const val KEY_FB_ENABLED = "setting_fb"
        const val KEY_FLOATING_ENABLED = "setting_floating"
    }

    init {
        checkDayRollover()
    }

    private fun getTodayDateString(): String {
        return SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
    }

    private fun checkDayRollover() {
        val today = getTodayDateString()
        val savedDate = prefs.getString(KEY_DATE, "")
        if (savedDate != today) {
            prefs.edit()
                .putString(KEY_DATE, today)
                .putInt(KEY_TOTAL, 0)
                .putInt(KEY_YT, 0)
                .putInt(KEY_IG, 0)
                .putInt(KEY_FB, 0)
                .putInt(KEY_BLOCKED, 0)
                .apply()
        }
    }

    fun incrementCount(platform: String) {
        checkDayRollover()
        val editor = prefs.edit()
        val total = prefs.getInt(KEY_TOTAL, 0) + 1
        editor.putInt(KEY_TOTAL, total)
        editor.putInt(KEY_BLOCKED, prefs.getInt(KEY_BLOCKED, 0) + 1)

        when (platform.lowercase()) {
            "youtube" -> editor.putInt(KEY_YT, prefs.getInt(KEY_YT, 0) + 1)
            "instagram" -> editor.putInt(KEY_IG, prefs.getInt(KEY_IG, 0) + 1)
            "facebook" -> editor.putInt(KEY_FB, prefs.getInt(KEY_FB, 0) + 1)
        }
        editor.apply()

        // Broadcast update
        context.sendBroadcast(Intent(ACTION_STATS_UPDATED))
    }

    fun getTotalReels(): Int {
        checkDayRollover()
        return prefs.getInt(KEY_TOTAL, 0)
    }

    fun getYTCount(): Int = prefs.getInt(KEY_YT, 0)
    fun getIGCount(): Int = prefs.getInt(KEY_IG, 0)
    fun getFBCount(): Int = prefs.getInt(KEY_FB, 0)
    fun getBlockedCount(): Int = prefs.getInt(KEY_BLOCKED, 0)

    fun resetToday() {
        prefs.edit()
            .putInt(KEY_TOTAL, 0)
            .putInt(KEY_YT, 0)
            .putInt(KEY_IG, 0)
            .putInt(KEY_FB, 0)
            .putInt(KEY_BLOCKED, 0)
            .apply()
        context.sendBroadcast(Intent(ACTION_STATS_UPDATED))
    }

    // Settings helpers
    fun isYtEnabled(): Boolean = prefs.getBoolean(KEY_YT_ENABLED, true)
    fun setYtEnabled(enabled: Boolean) = prefs.edit().putBoolean(KEY_YT_ENABLED, enabled).apply()

    fun isIgEnabled(): Boolean = prefs.getBoolean(KEY_IG_ENABLED, true)
    fun setIgEnabled(enabled: Boolean) = prefs.edit().putBoolean(KEY_IG_ENABLED, enabled).apply()

    fun isFbEnabled(): Boolean = prefs.getBoolean(KEY_FB_ENABLED, true)
    fun setFbEnabled(enabled: Boolean) = prefs.edit().putBoolean(KEY_FB_ENABLED, enabled).apply()

    fun isFloatingEnabled(): Boolean = prefs.getBoolean(KEY_FLOATING_ENABLED, true)
    fun setFloatingEnabled(enabled: Boolean) = prefs.edit().putBoolean(KEY_FLOATING_ENABLED, enabled).apply()
}
