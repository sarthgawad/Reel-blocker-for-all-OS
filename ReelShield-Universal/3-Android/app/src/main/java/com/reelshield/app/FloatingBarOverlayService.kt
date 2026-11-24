package com.reelshield.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat

/**
 * FloatingBarOverlayService (v1.1.0)
 * Renders the persistent floating rectangular bar with the circular bordered number
 * directly over YouTube, Instagram, and Facebook using Android WindowManager.
 * Draggable anywhere on screen. Displays "by Sarth".
 */
class FloatingBarOverlayService : Service() {

    private var windowManager: WindowManager? = null
    private var floatingView: View? = null
    private var layoutParams: WindowManager.LayoutParams? = null
    private lateinit var statsManager: ReelStatsManager

    private val statsReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            updateFloatingUI()
        }
    }

    companion object {
        const val CHANNEL_ID = "ReelShieldOverlayChannel"
        private var instance: FloatingBarOverlayService? = null

        fun start(context: Context) {
            val intent = Intent(context, FloatingBarOverlayService::class.java)
            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(intent)
                } else {
                    context.startService(intent)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, FloatingBarOverlayService::class.java))
        }

        fun notifyStatsChanged() {
            instance?.updateFloatingUI()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        statsManager = ReelStatsManager(this)
        startForegroundServiceNotification()
        setupOverlayView()

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                registerReceiver(
                    statsReceiver,
                    IntentFilter(ReelStatsManager.ACTION_STATS_UPDATED),
                    RECEIVER_NOT_EXPORTED
                )
            } else {
                registerReceiver(
                    statsReceiver,
                    IntentFilter(ReelStatsManager.ACTION_STATS_UPDATED)
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun startForegroundServiceNotification() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "ReelShield Active Monitor",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live status of your floating reels counter"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ReelShield Active")
            .setContentText("Guarding your attention • by Sarth")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                startForeground(1001, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
            } else {
                startForeground(1001, notification)
            }
        } else {
            startForeground(1001, notification)
        }
    }

    private fun setupOverlayView() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
        val inflater = getSystemService(LAYOUT_INFLATER_SERVICE) as LayoutInflater
        floatingView = inflater.inflate(R.layout.layout_floating_counter_bar, null)

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.BOTTOM or Gravity.END
            x = 40
            y = 200
        }

        setupDragListener()
        try {
            windowManager?.addView(floatingView, layoutParams)
        } catch (e: Exception) {
            e.printStackTrace()
        }
        updateFloatingUI()
    }

    private fun setupDragListener() {
        var initialX = 0
        var initialY = 0
        var initialTouchX = 0f
        var initialTouchY = 0f

        floatingView?.setOnTouchListener { _, event ->
            val params = layoutParams ?: return@setOnTouchListener false
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x
                    initialY = params.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX - (event.rawX - initialTouchX).toInt()
                    params.y = initialY - (event.rawY - initialTouchY).toInt()
                    try {
                        windowManager?.updateViewLayout(floatingView, params)
                    } catch (e: Exception) {}
                    true
                }
                MotionEvent.ACTION_UP -> {
                    val diffX = Math.abs(event.rawX - initialTouchX)
                    val diffY = Math.abs(event.rawY - initialTouchY)
                    if (diffX < 10 && diffY < 10) {
                        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                        launchIntent?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(launchIntent)
                    }
                    true
                }
                else -> false
            }
        }
    }

    fun updateFloatingUI() {
        val root = floatingView ?: return
        val countText = root.findViewById<TextView>(R.id.tvFloatingCount) ?: return
        val badge = root.findViewById<FrameLayout>(R.id.flFloatingBadge)
        val ytTag = root.findViewById<TextView>(R.id.tvYtTag)
        val igTag = root.findViewById<TextView>(R.id.tvIgTag)
        val fbTag = root.findViewById<TextView>(R.id.tvFbTag)

        val total = statsManager.getTotalReels()
        val yt = statsManager.getYTCount()
        val ig = statsManager.getIGCount()
        val fb = statsManager.getFBCount()

        countText.text = total.toString()
        ytTag?.text = "YT:$yt "
        igTag?.text = "IG:$ig "
        fbTag?.text = "FB:$fb"

        val strokeColor = when {
            total < 5 -> Color.parseColor("#10B981")
            total < 15 -> Color.parseColor("#6366F1")
            total < 25 -> Color.parseColor("#F59E0B")
            else -> Color.parseColor("#EF4444")
        }

        try {
            val backgroundDrawable = badge?.background
            if (backgroundDrawable is GradientDrawable) {
                backgroundDrawable.setStroke(6, strokeColor)
            }
        } catch (e: Exception) {}
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        try {
            unregisterReceiver(statsReceiver)
        } catch (e: Exception) {}
        if (floatingView != null) {
            try {
                windowManager?.removeView(floatingView)
            } catch (e: Exception) {}
        }
    }
}
