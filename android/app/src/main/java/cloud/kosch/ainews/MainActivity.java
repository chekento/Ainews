package cloud.kosch.ainews;

import android.Manifest;
import android.app.Activity;
import android.app.job.JobInfo;
import android.app.job.JobScheduler;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.speech.tts.TextToSpeech;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import cloud.kosch.ainews.widget.BaseNewsWidget;
import java.util.Locale;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final int WATCH_JOB_ID = 44021;
    private WebView webView;
    private TextToSpeech tts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().setStatusBarColor(Color.rgb(5, 7, 17));
        getWindow().setNavigationBarColor(Color.rgb(5, 7, 17));
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        webView.setBackgroundColor(Color.rgb(5, 7, 17));
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String bootstrap = "(function(){" +
                    "function css(id,href){if(!document.getElementById(id)){var l=document.createElement('link');l.id=id;l.rel='stylesheet';l.href=href;document.head.appendChild(l);}}" +
                    "function seq(files,i){if(i>=files.length)return;var f=files[i],old=document.getElementById(f[0]);if(old){seq(files,i+1);return;}var s=document.createElement('script');s.id=f[0];s.src=f[1];s.onload=function(){seq(files,i+1)};s.onerror=function(){seq(files,i+1)};document.body.appendChild(s);}" +
                    "css('copilot-v2-css','copilot-v2.css');css('intelligence-v3-css','intelligence-v3.css');css('ux-v31-css','ux-v31.css');" +
                    "seq([['copilot-v2-js','copilot-v2.js'],['intelligence-v3-js','intelligence-v3.js'],['ux-v31-js','ux-v31.js']],0);" +
                    "})();";
                view.evaluateJavascript(bootstrap, null);
                applyLaunchIntent(getIntent(), 550);
            }
        });

        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
        webView.loadUrl("file:///android_asset/index.html");
        scheduleWatchJob();
    }

    @Override protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        applyLaunchIntent(intent, 80);
    }

    private void applyLaunchIntent(Intent intent, int delayMs) {
        if (webView == null || intent == null) return;
        String query = intent.getStringExtra("watchQuery");
        String storyId = intent.getStringExtra("storyId");
        if (query == null || query.trim().isEmpty()) return;
        String script = "setTimeout(function(){try{if(window.AINewsOpenWatch)window.AINewsOpenWatch(" +
            JSONObject.quote(query) + "," + JSONObject.quote(storyId == null ? "" : storyId) + ");}catch(e){}}," + Math.max(0, delayMs) + ");";
        webView.evaluateJavascript(script, null);
        intent.removeExtra("watchQuery");
        intent.removeExtra("storyId");
    }

    public void scheduleWatchJob() {
        String rules = getSharedPreferences("intelPrefs", MODE_PRIVATE).getString("watchlists", "[]");
        JobScheduler js = (JobScheduler) getSystemService(JOB_SCHEDULER_SERVICE);
        if (js == null) return;
        if (rules == null || rules.equals("[]")) { js.cancel(WATCH_JOB_ID); return; }
        try {
            JobInfo info = new JobInfo.Builder(WATCH_JOB_ID, new ComponentName(this, WatchJobService.class))
                .setRequiredNetworkType(JobInfo.NETWORK_TYPE_ANY)
                .setPeriodic(15 * 60 * 1000L)
                .setPersisted(true)
                .build();
            js.schedule(info);
        } catch (Exception ignored) { }
    }

    private void requestAlertPermission() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, 501);
        }
    }

    private void speakText(String text, String languageTag) {
        if (text == null || text.trim().isEmpty()) return;
        runOnUiThread(() -> {
            if (tts != null) {
                Locale locale = Locale.forLanguageTag(languageTag == null || languageTag.isEmpty() ? "en" : languageTag);
                tts.setLanguage(locale);
                tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ai-news-brief");
                return;
            }
            tts = new TextToSpeech(getApplicationContext(), status -> {
                if (status == TextToSpeech.SUCCESS) {
                    Locale locale = Locale.forLanguageTag(languageTag == null || languageTag.isEmpty() ? "en" : languageTag);
                    tts.setLanguage(locale);
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "ai-news-brief");
                }
            });
        });
    }

    @Override protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        if (webView != null) webView.destroy();
        super.onDestroy();
    }

    private void fallbackBack() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override public void onBackPressed() {
        if (webView == null) { super.onBackPressed(); return; }
        webView.evaluateJavascript("(function(){try{return !!(window.AINewsHandleBack&&window.AINewsHandleBack());}catch(e){return false;}})()", value -> {
            if (!"true".equals(value)) fallbackBack();
        });
    }

    public static class AndroidBridge {
        private final MainActivity activity;
        AndroidBridge(MainActivity activity) { this.activity = activity; }

        @JavascriptInterface public void openExternal(String url) {
            try {
                Uri uri = Uri.parse(url); String scheme = uri.getScheme();
                if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return;
                activity.startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public void share(String text) {
            try {
                Intent send = new Intent(Intent.ACTION_SEND); send.setType("text/plain"); send.putExtra(Intent.EXTRA_TEXT, text);
                activity.startActivity(Intent.createChooser(send, "Share AI News"));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public void haptic() {
            try {
                Vibrator vibrator = (Vibrator) activity.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null && vibrator.hasVibrator()) vibrator.vibrate(VibrationEffect.createOneShot(18, VibrationEffect.DEFAULT_AMPLITUDE));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public void setDisabledSources(String json) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences("widgetPrefs", Context.MODE_PRIVATE);
                String next = json == null ? "[]" : json;
                if (next.equals(prefs.getString("disabledSources", "[]"))) return;
                prefs.edit().putString("disabledSources", next).apply();
                BaseNewsWidget.refreshAll(activity);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public void setWidgetSettings(String json) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences("widgetPrefs", Context.MODE_PRIVATE);
                String next = json == null ? "{}" : json;
                if (next.equals(prefs.getString("settings", "{}"))) return;
                prefs.edit().putString("settings", next).apply();
                BaseNewsWidget.refreshAll(activity);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public void refreshWidgets() { try { BaseNewsWidget.refreshAll(activity); } catch (Exception ignored) { } }

        @JavascriptInterface public void setWatchlists(String json) {
            try {
                SharedPreferences prefs = activity.getSharedPreferences("intelPrefs", Context.MODE_PRIVATE);
                String next = json == null ? "[]" : json;
                String old = prefs.getString("watchlists", "[]");
                if (next.equals(old)) return;
                SharedPreferences.Editor editor = prefs.edit().putString("watchlists", next);
                if ((old == null || old.equals("[]")) && !next.equals("[]")) editor.putBoolean("watchArmPending", true);
                editor.apply();
                activity.runOnUiThread(() -> {
                    activity.scheduleWatchJob();
                    if (!next.equals("[]")) activity.requestAlertPermission();
                });
            } catch (Exception ignored) { }
        }

        @JavascriptInterface public String speak(String text, String languageTag) {
            activity.speakText(text, languageTag);
            return "native";
        }

        @JavascriptInterface public void stopSpeech() {
            activity.runOnUiThread(() -> { if (activity.tts != null) activity.tts.stop(); });
        }
    }
}
