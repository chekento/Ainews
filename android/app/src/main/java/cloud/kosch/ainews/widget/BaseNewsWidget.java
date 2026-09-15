package cloud.kosch.ainews.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.widget.RemoteViews;
import cloud.kosch.ainews.MainActivity;
import cloud.kosch.ainews.R;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public abstract class BaseNewsWidget extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "cloud.kosch.ainews.widget.REFRESH";
    private static final String REMOTE = "https://raw.githubusercontent.com/chekento/Ainews/main/data/news.json";

    protected abstract int mode();
    protected abstract String label();
    protected abstract int backgroundRes();
    protected abstract int accentColor();

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        final PendingResult pending = goAsync();
        new Thread(() -> {
            try {
                List<JSONObject> items = loadItems(context);
                for (int id : ids) updateWidget(context, manager, id, items);
            } finally { pending.finish(); }
        }).start();
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (ACTION_REFRESH.equals(intent.getAction())) {
            AppWidgetManager manager = AppWidgetManager.getInstance(context);
            int[] ids = manager.getAppWidgetIds(new ComponentName(context, getClass()));
            onUpdate(context, manager, ids);
            return;
        }
        super.onReceive(context, intent);
    }

    private void updateWidget(Context context, AppWidgetManager manager, int id, List<JSONObject> items) {
        RemoteViews rv = new RemoteViews(context.getPackageName(), R.layout.widget_news);
        rv.setInt(R.id.widgetRoot, "setBackgroundResource", backgroundRes());
        rv.setTextColor(R.id.widgetTitle, accentColor());
        rv.setTextColor(R.id.widgetBadge, accentColor());
        rv.setTextViewText(R.id.widgetTitle, label());

        JSONObject item = choose(items, mode());
        if (item == null) {
            rv.setTextViewText(R.id.widgetBadge, "OFFLINE");
            rv.setTextViewText(R.id.widgetHeadline, "No active AI sources");
            rv.setTextViewText(R.id.widgetMeta, "Open AI News and enable at least one source.");
            rv.setTextViewText(R.id.widgetExtra, "Tap to configure the feed.");
        } else {
            String source = item.optString("source", "AI News");
            String category = item.optString("category", "AI");
            String title = item.optString("title", "AI signal");
            rv.setTextViewText(R.id.widgetBadge, badgeFor(mode()));
            rv.setTextViewText(R.id.widgetHeadline, title);
            rv.setTextViewText(R.id.widgetMeta, source + "  ·  " + category + "  ·  " + timeLabel(item.optString("publishedAt")));
            rv.setTextViewText(R.id.widgetExtra, extra(items, item, mode()));
            String url = item.optString("url", "");
            if (url.startsWith("https://") || url.startsWith("http://")) {
                Intent open = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                PendingIntent pi = PendingIntent.getActivity(context, id + 2000, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
                rv.setOnClickPendingIntent(R.id.widgetHeadline, pi);
            }
        }

        Intent launch = new Intent(context, MainActivity.class);
        PendingIntent launchPi = PendingIntent.getActivity(context, id, launch, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        rv.setOnClickPendingIntent(R.id.widgetRoot, launchPi);

        Intent refresh = new Intent(context, getClass());
        refresh.setAction(ACTION_REFRESH);
        PendingIntent refreshPi = PendingIntent.getBroadcast(context, id + 1000, refresh, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        rv.setOnClickPendingIntent(R.id.widgetRefresh, refreshPi);
        manager.updateAppWidget(id, rv);
    }

    private JSONObject choose(List<JSONObject> items, int mode) {
        if (items.isEmpty()) return null;
        if (mode == 1) return first(items, "provenance", "primary", "official");
        if (mode == 2) {
            for (JSONObject o : items) if (o.optJSONArray("providers") != null && o.optJSONArray("providers").length() > 0) return o;
        }
        if (mode == 3) return first(items, "category", "Compliance & Ethics");
        if (mode == 4) return first(items, "category", "Research", "Infrastructure");
        if (mode == 6) return first(items, "category", "Safety & Security", "Frontier Models", "Products & Agents");
        return items.get(0);
    }

    private JSONObject first(List<JSONObject> items, String key, String... values) {
        for (JSONObject o : items) {
            String v = o.optString(key, "");
            for (String wanted : values) if (wanted.equalsIgnoreCase(v)) return o;
        }
        return items.isEmpty() ? null : items.get(0);
    }

    private String extra(List<JSONObject> items, JSONObject selected, int mode) {
        if (mode == 5) {
            StringBuilder out = new StringBuilder();
            int added = 0;
            for (JSONObject o : items) {
                if (o == selected) continue;
                if (added++ > 1) break;
                if (out.length() > 0) out.append("  ◈  ");
                out.append(o.optString("title", "AI signal"));
            }
            return out.length() == 0 ? "Compact three-signal stack" : out.toString();
        }
        if (mode == 7) return "SYNC " + new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date()) + "  //  tap ↻ for live refresh";
        String summary = selected.optString("summary", "");
        if (summary.length() > 150) summary = summary.substring(0, 147) + "…";
        return summary.isEmpty() ? "Tap headline for the original source." : summary;
    }

    private String badgeFor(int mode) {
        switch (mode) {
            case 1: return "PRIMARY";
            case 2: return "LLM WIRE";
            case 3: return "POLICY";
            case 4: return "R&D";
            case 5: return "STACK";
            case 6: return "CYBER";
            case 7: return "CLOCK";
            default: return "BREAKING";
        }
    }

    private String timeLabel(String iso) {
        try {
            if (iso != null && iso.length() >= 16) return iso.substring(11, 16) + "Z";
        } catch (Exception ignored) { }
        return "LIVE";
    }

    private List<JSONObject> loadItems(Context context) {
        String json = null;
        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(REMOTE + "?widget=" + System.currentTimeMillis()).openConnection();
            conn.setConnectTimeout(7000);
            conn.setReadTimeout(7000);
            conn.setRequestProperty("User-Agent", "AI-News-Android-Widget/1.1");
            if (conn.getResponseCode() >= 200 && conn.getResponseCode() < 300) json = read(conn.getInputStream());
            conn.disconnect();
        } catch (Exception ignored) { }
        if (json == null) {
            try { json = read(context.getAssets().open("news.json")); } catch (Exception ignored) { }
        }
        List<JSONObject> out = new ArrayList<>();
        if (json == null) return out;
        Set<String> disabled = disabled(context);
        try {
            JSONArray arr = new JSONObject(json).optJSONArray("items");
            if (arr == null) return out;
            for (int i = 0; i < arr.length() && out.size() < 100; i++) {
                JSONObject o = arr.optJSONObject(i);
                if (o != null && !disabled.contains(o.optString("source", ""))) out.add(o);
            }
        } catch (Exception ignored) { }
        return out;
    }

    private Set<String> disabled(Context context) {
        Set<String> out = new HashSet<>();
        try {
            String raw = context.getSharedPreferences("widgetPrefs", Context.MODE_PRIVATE).getString("disabledSources", "[]");
            JSONArray a = new JSONArray(raw);
            for (int i = 0; i < a.length(); i++) out.add(a.optString(i));
        } catch (Exception ignored) { }
        return out;
    }

    private String read(InputStream in) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }

    public static void refreshAll(Context context) {
        Class<?>[] classes = new Class<?>[]{BreakingWidget.class, TopStoryWidget.class, ProviderWireWidget.class, GovernanceWidget.class, ResearchWidget.class, CompactStackWidget.class, NeonMatrixWidget.class, SignalClockWidget.class};
        for (Class<?> cls : classes) {
            Intent i = new Intent(context, cls);
            i.setAction(ACTION_REFRESH);
            context.sendBroadcast(i);
        }
    }
}
