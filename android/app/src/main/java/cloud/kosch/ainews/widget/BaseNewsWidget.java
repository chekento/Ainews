package cloud.kosch.ainews.widget;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.util.TypedValue;
import android.view.View;
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

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        final PendingResult pending = goAsync();
        new Thread(() -> { try { List<JSONObject> items = loadItems(context); for (int id : ids) updateWidget(context, manager, id, items); } finally { pending.finish(); } }).start();
    }
    @Override public void onReceive(Context context, Intent intent) {
        if (ACTION_REFRESH.equals(intent.getAction())) { AppWidgetManager manager=AppWidgetManager.getInstance(context); int[] ids=manager.getAppWidgetIds(new ComponentName(context,getClass())); onUpdate(context,manager,ids); return; }
        super.onReceive(context,intent);
    }

    private void updateWidget(Context context, AppWidgetManager manager, int id, List<JSONObject> items) {
        RemoteViews rv=new RemoteViews(context.getPackageName(),R.layout.widget_news);
        rv.setInt(R.id.widgetRoot,"setBackgroundResource",backgroundRes());
        JSONObject settings=settings(context);
        int accent=resolveAccent(settings.optString("accent","native")); if(accent==0)accent=accentColor();
        double scale=settings.optDouble("textScale",1.0); String density=settings.optString("density","comfortable");
        boolean showSummary=settings.optBoolean("showSummary",true),showMeta=settings.optBoolean("showMeta",true);
        int pad="compact".equals(density)?10:"roomy".equals(density)?18:14;
        rv.setViewPadding(R.id.widgetRoot,dp(context,pad),dp(context,pad),dp(context,pad),dp(context,pad));
        rv.setTextColor(R.id.widgetTitle,accent); rv.setTextColor(R.id.widgetBadge,accent); rv.setTextViewText(R.id.widgetTitle,label());
        rv.setTextViewTextSize(R.id.widgetHeadline,TypedValue.COMPLEX_UNIT_SP,(float)(16*scale));
        rv.setTextViewTextSize(R.id.widgetMeta,TypedValue.COMPLEX_UNIT_SP,(float)(10*scale));
        rv.setTextViewTextSize(R.id.widgetExtra,TypedValue.COMPLEX_UNIT_SP,(float)(10*scale));
        rv.setInt(R.id.widgetHeadline,"setMaxLines","compact".equals(density)?2:"roomy".equals(density)?4:3);
        rv.setViewVisibility(R.id.widgetMeta,showMeta?View.VISIBLE:View.GONE); rv.setViewVisibility(R.id.widgetExtra,showSummary?View.VISIBLE:View.GONE);
        String requested=requestedMode(settings);
        JSONObject item=choose(items,requested);
        if(item==null){rv.setTextViewText(R.id.widgetBadge,"OFFLINE");rv.setTextViewText(R.id.widgetHeadline,"No active AI sources");rv.setTextViewText(R.id.widgetMeta,"Open AI News and enable a source.");rv.setTextViewText(R.id.widgetExtra,"Tap the widget to configure the feed.");}
        else{
            String source=item.optString("source","AI News"),category=item.optString("category","AI"),title=item.optString("title","AI signal");
            rv.setTextViewText(R.id.widgetBadge,badgeFor(requested));rv.setTextViewText(R.id.widgetHeadline,title);rv.setTextViewText(R.id.widgetMeta,source+"  ·  "+category+"  ·  "+timeLabel(item.optString("publishedAt")));rv.setTextViewText(R.id.widgetExtra,extra(items,item,requested));
            String url=item.optString("url","");if(url.startsWith("https://")||url.startsWith("http://")){Intent open=new Intent(Intent.ACTION_VIEW,Uri.parse(url));PendingIntent pi=PendingIntent.getActivity(context,id+2000,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetHeadline,pi);}
        }
        Intent launch=new Intent(context,MainActivity.class);PendingIntent launchPi=PendingIntent.getActivity(context,id,launch,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetRoot,launchPi);
        Intent refresh=new Intent(context,getClass());refresh.setAction(ACTION_REFRESH);PendingIntent refreshPi=PendingIntent.getBroadcast(context,id+1000,refresh,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetRefresh,refreshPi);manager.updateAppWidget(id,rv);
    }

    private String requestedMode(JSONObject settings){try{JSONObject modes=settings.optJSONObject("modes");if(modes!=null){String x=modes.optString(getClass().getSimpleName(),"");if(!x.isEmpty())return x;}}catch(Exception ignored){}switch(mode()){case 1:return"primary";case 2:return"models";case 3:return"policy";case 4:return"research";case 6:return"safety";default:return"latest";}}
    private JSONObject choose(List<JSONObject> items,String requested){if(items.isEmpty())return null;if("primary".equals(requested))return first(items,"provenance","primary","official");if("models".equals(requested))return first(items,"category","Frontier Models");if("agents".equals(requested))return first(items,"category","Products & Agents");if("policy".equals(requested))return first(items,"category","Compliance & Ethics");if("research".equals(requested))return first(items,"category","Research");if("safety".equals(requested))return first(items,"category","Safety & Security");if("infra".equals(requested))return first(items,"category","Infrastructure");if("robotics".equals(requested))return first(items,"category","Robotics & Embodied AI");return items.get(0);}
    private JSONObject first(List<JSONObject> items,String key,String...values){for(JSONObject o:items){String v=o.optString(key,"");for(String wanted:values)if(wanted.equalsIgnoreCase(v))return o;}return items.isEmpty()?null:items.get(0);}
    private String extra(List<JSONObject> items,JSONObject selected,String requested){if(mode()==5){StringBuilder out=new StringBuilder();int added=0;for(JSONObject o:items){if(o==selected)continue;if(added++>1)break;if(out.length()>0)out.append("  ◈  ");out.append(o.optString("title","AI signal"));}return out.length()==0?"Multi-signal stack":out.toString();}if(mode()==7)return"SYNC "+new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date())+"  //  "+requested.toUpperCase(Locale.ROOT);String summary=selected.optString("summary","");if(summary.length()>160)summary=summary.substring(0,157)+"…";return summary.isEmpty()?"Tap headline for the original source.":summary;}
    private String badgeFor(String requested){switch(requested){case"primary":return"PRIMARY";case"models":return"MODEL WIRE";case"agents":return"AGENTS";case"policy":return"POLICY";case"research":return"RESEARCH";case"safety":return"SAFETY";case"infra":return"INFRA";case"robotics":return"ROBOTICS";default:return"AI ONLY";}}
    private int resolveAccent(String a){switch(a){case"mint":return 0xFF65F7C4;case"cyan":return 0xFF55D9FF;case"violet":return 0xFFA993FF;case"magenta":return 0xFFFF78C8;case"amber":return 0xFFFFBF5B;default:return 0;}}
    private int dp(Context c,int v){return Math.round(v*c.getResources().getDisplayMetrics().density);}
    private String timeLabel(String iso){try{if(iso!=null&&iso.length()>=16)return iso.substring(11,16)+"Z";}catch(Exception ignored){}return"LIVE";}
    private JSONObject settings(Context context){try{return new JSONObject(context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getString("settings","{}"));}catch(Exception ignored){return new JSONObject();}}

    private List<JSONObject> loadItems(Context context){String json=null;try{HttpURLConnection conn=(HttpURLConnection)new URL(REMOTE+"?widget="+System.currentTimeMillis()).openConnection();conn.setConnectTimeout(7000);conn.setReadTimeout(7000);conn.setRequestProperty("User-Agent","AI-News-Android-Widget/2.0");if(conn.getResponseCode()>=200&&conn.getResponseCode()<300)json=read(conn.getInputStream());conn.disconnect();}catch(Exception ignored){}if(json==null){try{json=read(context.getAssets().open("news.json"));}catch(Exception ignored){}}List<JSONObject> out=new ArrayList<>();if(json==null)return out;Set<String> disabled=disabled(context);try{JSONObject root=new JSONObject(json);JSONArray arr=root.optJSONArray("items");if(arr==null)return out;for(int i=0;i<arr.length()&&out.size()<160;i++){JSONObject o=arr.optJSONObject(i);if(o!=null&&!"low".equals(o.optString("aiConfidence"))&&!disabled.contains(o.optString("source","")))out.add(o);}}catch(Exception ignored){}return out;}
    private Set<String> disabled(Context context){Set<String> out=new HashSet<>();try{String raw=context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getString("disabledSources","[]");JSONArray a=new JSONArray(raw);for(int i=0;i<a.length();i++)out.add(a.optString(i));}catch(Exception ignored){}return out;}
    private String read(InputStream in)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(in,StandardCharsets.UTF_8));StringBuilder sb=new StringBuilder();String line;while((line=br.readLine())!=null)sb.append(line);br.close();return sb.toString();}
    public static void refreshAll(Context context){Class<?>[] classes=new Class<?>[]{BreakingWidget.class,TopStoryWidget.class,ProviderWireWidget.class,GovernanceWidget.class,ResearchWidget.class,CompactStackWidget.class,NeonMatrixWidget.class,SignalClockWidget.class};for(Class<?> cls:classes){Intent i=new Intent(context,cls);i.setAction(ACTION_REFRESH);context.sendBroadcast(i);}}
}
