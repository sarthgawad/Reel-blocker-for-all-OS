package com.reelshield.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.switchmaterial.SwitchMaterial

class MainActivity : AppCompatActivity() {

    private lateinit var statsManager: ReelStatsManager
    private lateinit var tvTotalReelsNumber: TextView
    private lateinit var tvYtCount: TextView
    private lateinit var tvIgCount: TextView
    private lateinit var tvFbCount: TextView
    private lateinit var tvServiceStatus: TextView

    private val statsReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            renderStats()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        statsManager = ReelStatsManager(this)

        initViews()
        setupListeners()
        renderStats()

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

        // Auto start floating overlay if permitted
        if (statsManager.isFloatingEnabled()) {
            if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)) {
                FloatingBarOverlayService.start(this)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        checkPermissions()
        renderStats()
    }

    private fun initViews() {
        tvTotalReelsNumber = findViewById(R.id.tvTotalReelsNumber)
        tvYtCount = findViewById(R.id.tvYtCount)
        tvIgCount = findViewById(R.id.tvIgCount)
        tvFbCount = findViewById(R.id.tvFbCount)
        tvServiceStatus = findViewById(R.id.tvServiceStatus)
    }

    private fun setupListeners() {
        findViewById<Button>(R.id.btnEnableAccessibility).setOnClickListener {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            startActivity(intent)
            Toast.makeText(this, "Find 'ReelShield' and switch it ON", Toast.LENGTH_LONG).show()
        }

        findViewById<Button>(R.id.btnEnableOverlay).setOnClickListener {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
                startActivity(intent)
            } else {
                Toast.makeText(this, "Floating counter permission already granted!", Toast.LENGTH_SHORT).show()
                FloatingBarOverlayService.start(this)
            }
        }

        val switchYT = findViewById<SwitchMaterial>(R.id.switchYT)
        val switchIG = findViewById<SwitchMaterial>(R.id.switchIG)
        val switchFB = findViewById<SwitchMaterial>(R.id.switchFB)
        val switchFloating = findViewById<SwitchMaterial>(R.id.switchFloatingBar)

        switchYT.isChecked = statsManager.isYtEnabled()
        switchIG.isChecked = statsManager.isIgEnabled()
        switchFB.isChecked = statsManager.isFbEnabled()
        switchFloating.isChecked = statsManager.isFloatingEnabled()

        switchYT.setOnCheckedChangeListener { _, isChecked -> statsManager.setYtEnabled(isChecked) }
        switchIG.setOnCheckedChangeListener { _, isChecked -> statsManager.setIgEnabled(isChecked) }
        switchFB.setOnCheckedChangeListener { _, isChecked -> statsManager.setFbEnabled(isChecked) }
        switchFloating.setOnCheckedChangeListener { _, isChecked ->
            statsManager.setFloatingEnabled(isChecked)
            if (isChecked) {
                if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)) {
                    FloatingBarOverlayService.start(this)
                }
            } else {
                FloatingBarOverlayService.stop(this)
            }
        }

        findViewById<Button>(R.id.btnResetToday).setOnClickListener {
            statsManager.resetToday()
            FloatingBarOverlayService.notifyStatsChanged()
            Toast.makeText(this, "Daily stats reset to 0", Toast.LENGTH_SHORT).show()
        }
    }

    private fun checkPermissions() {
        val hasOverlay = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(this)
        if (hasOverlay) {
            tvServiceStatus.text = "Status: Active & Guarding"
            tvServiceStatus.setTextColor(getColor(R.color.color_green))
        } else {
            tvServiceStatus.text = "Status: Permissions Required"
            tvServiceStatus.setTextColor(getColor(R.color.color_amber))
        }
    }

    private fun renderStats() {
        tvTotalReelsNumber.text = statsManager.getTotalReels().toString()
        tvYtCount.text = statsManager.getYTCount().toString()
        tvIgCount.text = statsManager.getIGCount().toString()
        tvFbCount.text = statsManager.getFBCount().toString()
    }

    override fun onDestroy() {
        super.onDestroy()
        try {
            unregisterReceiver(statsReceiver)
        } catch (e: Exception) {}
    }
}
