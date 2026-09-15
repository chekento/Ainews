package cloud.kosch.ainews;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.job.JobParameters;
import android.app.job.JobService;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

public class WatchJobService extends JobService {
    private static final String REMOTE = "https://raw.githubusercontent.com/chekento/Ainews/main/data/news.json";
    private static final String CHANNEL = "ai_news_watches";

    @Override public boolean onStartJob(JobParameters params) {
        new Thread(() -> { try { runWatch(); } catch (Exception ignored) { } jobFinished(params, false); }).start();
        return true;
    }

    @Override public boolean onStopJob(JobParameters params) { return true; }

    private void runWatch() throws Exception {
        SharedPreferences prefs = getSharedPreferences("intelPrefs", MODE_PRIVATE);
        JSONArray rules = new JSONArray(prefs.getString("watchlists", "[]"));
        List<JSONObject> enabled = new ArrayList<>();
        for (int i=0;i<rules.length();i++) { JSONObject r=rules.optJSONObject(i); if (r!=null && r.optBoolean("enabled",true) && !r.optString("query","").isEmpty()) enabled.add(r); }
        if (enabled.isEmpty()) return;
        String raw = fetch(); if (raw == null) return;
        JSONArray items = new JSONObject(raw).optJSONArray("items"); if (items == null) return;
        Set<String> seen = new HashSet<>(prefs.getStringSet("watchSeen", new HashSet<>()));
        Set<String> nextSeen = new HashSet<>(seen);
        int sent=0;
        for (int i=0;i<items.length() && i<120;i++) {
            JSONObject item=items.optJSONObject(i); if (item==null) continue;
            String id=item.optString("id",""); if (id.isEmpty()) continue;
            nextSeen.add(id);
            if (seen.contains(id)) continue;
            for (JSONObject rule:enabled) {
                if (matches(item,rule.optString("query",""))) { notifyMatch(rule.optString("name","AI Watch"), item, sent++); break; }
            }
            if (sent>=3) break;
        }
        if (nextSeen.size()>260) {
            nextSeen.clear();
            for (int i=0;i<items.length() && i<180;i++) { JSONObject o=items.optJSONObject(i); if(o!=null)nextSeen.add(o.optString("id","")); }
        }
        prefs.edit().putStringSet("watchSeen",nextSeen).apply();
    }

    private boolean matches(JSONObject item,String query) {
        String hay=(item.optString("title")+" "+item.optString("summary")+" "+item.optString("source")+" "+item.optString("category")+" "+item.optJSONArray("tags")+" "+item.optJSONArray("providers")).toLowerCase(Locale.ROOT);
        for (String token:query.toLowerCase(Locale.ROOT).trim().split("\\s+")) {
            if (token.isEmpty()) continue;
            int p=token.indexOf(':');
            if (p>0) {
                String key=token.substring(0,p),value=token.substring(p+1),field="";
                if ("provider".equals(key)) field=String.valueOf(item.optJSONArray("providers"));
                else if ("cat".equals(key)) field=item.optString("category");
                else if ("source".equals(key)) field=item.optString("source");
                else if ("tag".equals(key)) field=String.valueOf(item.optJSONArray("tags"));
                else field=hay;
                if (!field.toLowerCase(Locale.ROOT).contains(value)) return false;
            } else if (!hay.contains(token)) return false;
        }
        return true;
    }

    private void notifyMatch(String ruleName,JSONObject item,int offset) {
        NotificationManager nm=(NotificationManager)getSystemService(NOTIFICATION_SERVICE); if(nm==null)return;
        if(Build.VERSION.SDK_INT>=26) nm.createNotificationChannel(new NotificationChannel(CHANNEL,"AI News Smart Watches",NotificationManager.IMPORTANCE_DEFAULT));
        Intent open=new Intent(this,MainActivity.class); open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi=PendingIntent.getActivity(this,7700+offset,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
        android.app.Notification.Builder b=Build.VERSION.SDK_INT>=26?new android.app.Notification.Builder(this,CHANNEL):new android.app.Notification.Builder(this);
        b.setSmallIcon(R.drawable.ic_ai_news).setContentTitle(ruleName+" · "+item.optString("source","AI News")).setContentText(item.optString("title","New AI signal")).setStyle(new android.app.Notification.BigTextStyle().bigText(item.optString("title","New AI signal"))).setContentIntent(pi).setAutoCancel(true).setOnlyAlertOnce(true);
        nm.notify(8800+offset,b.build());
    }

    private String fetch() {
        HttpURLConnection c=null;
        try {
            c=(HttpURLConnection)new URL(REMOTE+"?watch="+System.currentTimeMillis()).openConnection(); c.setConnectTimeout(9000); c.setReadTimeout(9000); c.setRequestProperty("User-Agent","AI-News-Watch/3.0");
            if(c.getResponseCode()<200||c.getResponseCode()>=300)return null;
            BufferedReader br=new BufferedReader(new InputStreamReader(c.getInputStream(), StandardCharsets.UTF_8)); StringBuilder sb=new StringBuilder(); String line; while((line=br.readLine())!=null)sb.append(line); br.close(); return sb.toString();
        } catch(Exception e){return null;} finally {if(c!=null)c.disconnect();}
    }
}
