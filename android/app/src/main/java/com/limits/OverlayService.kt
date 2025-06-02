package com.limits

import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.TextView
import androidx.core.content.ContextCompat

class OverlayService : Service() {
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null

    override fun onBind(intent: Intent): IBinder? {
        return null
    }

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "SHOW_SCREEN_TIME_REMINDER" -> showScreenTimeReminder()
            "SHOW_APP_LIMIT_WARNING" -> {
                val appName = intent.getStringExtra("app_name") ?: "this app"
                showAppLimitWarning(appName)
            }
        }
        return START_NOT_STICKY
    }

    private fun showScreenTimeReminder() {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP
        }

        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.screen_time_reminder, null)
        
        overlayView?.findViewById<Button>(R.id.dismissButton)?.setOnClickListener {
            removeOverlay()
        }

        windowManager?.addView(overlayView, params)
    }

    private fun showAppLimitWarning(appName: String) {
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
        }

        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.app_limit_warning, null)
        
        overlayView?.findViewById<TextView>(R.id.warningText)?.text = 
            "You've reached your time limit for $appName"

        overlayView?.findViewById<Button>(R.id.closeAppButton)?.setOnClickListener {
            // Send broadcast to close the app
            sendBroadcast(Intent("com.limits.CLOSE_APP"))
            removeOverlay()
        }

        overlayView?.findViewById<Button>(R.id.extendTimeButton)?.setOnClickListener {
            // Send broadcast to extend time
            sendBroadcast(Intent("com.limits.EXTEND_TIME"))
            removeOverlay()
        }

        windowManager?.addView(overlayView, params)
    }

    private fun removeOverlay() {
        overlayView?.let {
            windowManager?.removeView(it)
            overlayView = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlay()
    }
} 