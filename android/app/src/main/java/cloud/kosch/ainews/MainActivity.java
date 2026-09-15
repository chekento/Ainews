package cloud.kosch.ainews;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import cloud.kosch.ainews.widget.BaseNewsWidget;

public class MainActivity extends Activity {
    private WebView webView;

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
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                String bootstrap = "(function(){" +
                    "if(!document.getElementById('copilot-v2-css')){var l=document.createElement('link');l.id='copilot-v2-css';l.rel='stylesheet';l.href='copilot-v2.css';document.head.appendChild(l);}" +
                    "if(!document.getElementById('copilot-v2-js')){var s=document.createElement('script');s.id='copilot-v2-js';s.src='copilot-v2.js';document.body.appendChild(s);}" +
                    "})();";
                view.evaluateJavascript(bootstrap, null);
            }
        });
        webView.addJavascriptInterface(new AndroidBridge(this), "AndroidBridge");
        webView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    public static class AndroidBridge {
        private final Context context;
        AndroidBridge(Context context) { this.context = context; }

        @JavascriptInterface
        public void openExternal(String url) {
            try {
                Uri uri = Uri.parse(url);
                String scheme = uri.getScheme();
                if (!"https".equalsIgnoreCase(scheme) && !"http".equalsIgnoreCase(scheme)) return;
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void share(String text) {
            try {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT, text);
                send.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(Intent.createChooser(send, "Share AI News").addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void haptic() {
            try {
                Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (vibrator != null && vibrator.hasVibrator()) vibrator.vibrate(VibrationEffect.createOneShot(18, VibrationEffect.DEFAULT_AMPLITUDE));
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void setDisabledSources(String json) {
            try {
                context.getSharedPreferences("widgetPrefs", Context.MODE_PRIVATE).edit().putString("disabledSources", json == null ? "[]" : json).apply();
                BaseNewsWidget.refreshAll(context);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void setWidgetSettings(String json) {
            try {
                context.getSharedPreferences("widgetPrefs", Context.MODE_PRIVATE).edit().putString("settings", json == null ? "{}" : json).apply();
                BaseNewsWidget.refreshAll(context);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void refreshWidgets() {
            try { BaseNewsWidget.refreshAll(context); } catch (Exception ignored) { }
        }
    }
}
