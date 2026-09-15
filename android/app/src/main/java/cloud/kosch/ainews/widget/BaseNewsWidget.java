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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.time.Instant;

public abstract class BaseNewsWidget extends AppWidgetProvider {
    public static final String ACTION_REFRESH = "cloud.kosch.ainews.widget.REFRESH";
    public static final String ACTION_NEXT = "cloud.kosch.ainews.widget.NEXT";
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
        if (ACTION_REFRESH.equals(intent.getAction()) || ACTION_NEXT.equals(intent.getAction())) {
            AppWidgetManager manager=AppWidgetManager.getInstance(context);
            int requestedId=intent.getIntExtra("appWidgetId",AppWidgetManager.INVALID_APPWIDGET_ID);
            if(ACTION_NEXT.equals(intent.getAction()) && requestedId!=AppWidgetManager.INVALID_APPWIDGET_ID){
                int old=context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getInt("offset_"+requestedId,0);
                context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).edit().putInt("offset_"+requestedId,old+1).apply();
            }
            int[] ids=requestedId!=AppWidgetManager.INVALID_APPWIDGET_ID?new int[]{requestedId}:manager.getAppWidgetIds(new ComponentName(context,getClass()));
            onUpdate(context,manager,ids); return;
        }
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
        rv.setTextColor(R.id.widgetTitle,accent); rv.setTextColor(R.id.widgetBadge,accent); rv.setTextColor(R.id.widgetCopilot,accent); rv.setTextViewText(R.id.widgetTitle,label());
        rv.setTextViewTextSize(R.id.widgetHeadline,TypedValue.COMPLEX_UNIT_SP,(float)(16*scale));
        rv.setTextViewTextSize(R.id.widgetMeta,TypedValue.COMPLEX_UNIT_SP,(float)(10*scale));
        rv.setTextViewTextSize(R.id.widgetExtra,TypedValue.COMPLEX_UNIT_SP,(float)(10*scale));
        rv.setInt(R.id.widgetHeadline,"setMaxLines","compact".equals(density)?2:"roomy".equals(density)?4:3);
        rv.setViewVisibility(R.id.widgetMeta,showMeta?View.VISIBLE:View.GONE); rv.setViewVisibility(R.id.widgetExtra,showSummary?View.VISIBLE:View.GONE);
        String requested=requestedMode(settings);
        List<JSONObject> candidates=candidates(items,requested);
        int offset=context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getInt("offset_"+id,0);
        JSONObject item=candidates.isEmpty()?null:candidates.get(Math.floorMod(offset,candidates.size()));
        Intent launch=new Intent(context,MainActivity.class);launch.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);PendingIntent launchPi=PendingIntent.getActivity(context,id,launch,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetRoot,launchPi);
        if(item==null){
            rv.setTextViewText(R.id.widgetBadge,"OFFLINE");rv.setTextViewText(R.id.widgetHeadline,"No active AI sources");rv.setTextViewText(R.id.widgetMeta,"Open AI News and enable a source.");rv.setTextViewText(R.id.widgetExtra,"Tap the widget to configure the feed.");
            rv.setOnClickPendingIntent(R.id.widgetCopilot,launchPi);
        }
        else{
            String source=item.optString("source","AI News"),category=item.optString("category","AI"),title=item.optString("title","AI signal");
            rv.setTextViewText(R.id.widgetBadge,badgeFor(requested)+"  ·  S"+signalScore(item));rv.setTextViewText(R.id.widgetHeadline,title);rv.setTextViewText(R.id.widgetMeta,source+"  ·  "+category+"  ·  "+timeLabel(item.optString("publishedAt")));rv.setTextViewText(R.id.widgetExtra,extra(items,item,requested));
            String url=item.optString("url","");if(url.startsWith("https://")||url.startsWith("http://")){Intent open=new Intent(Intent.ACTION_VIEW,Uri.parse(url));PendingIntent pi=PendingIntent.getActivity(context,id+2000,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetHeadline,pi);}
            Intent copilot=new Intent(context,MainActivity.class);copilot.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);copilot.putExtra("copilotStoryId",item.optString("id",""));copilot.putExtra("copilotAction","summary");PendingIntent copilotPi=PendingIntent.getActivity(context,id+4000,copilot,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetCopilot,copilotPi);
        }
        Intent refresh=new Intent(context,getClass());refresh.setAction(ACTION_REFRESH);refresh.putExtra("appWidgetId",id);PendingIntent refreshPi=PendingIntent.getBroadcast(context,id+1000,refresh,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetRefresh,refreshPi);
        Intent next=new Intent(context,getClass());next.setAction(ACTION_NEXT);next.putExtra("appWidgetId",id);PendingIntent nextPi=PendingIntent.getBroadcast(context,id+3000,next,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);rv.setOnClickPendingIntent(R.id.widgetNext,nextPi);
        manager.updateAppWidget(id,rv);
    }

    private String requestedMode(JSONObject settings){try{JSONObject modes=settings.optJSONObject("modes");if(modes!=null){String x=modes.optString(getClass().getSimpleName(),"");if(!x.isEmpty())return x;}}catch(Exception ignored){}switch(mode()){case 1:return"primary";case 2:return"models";case 3:return"policy";case 4:return"research";case 6:return"safety";default:return"latest";}}
    private List<JSONObject> candidates(List<JSONObject> items,String requested){List<JSONObject> out=new ArrayList<>();for(JSONObject o:items){boolean ok="latest".equals(requested);if("primary".equals(requested))ok="primary".equalsIgnoreCase(o.optString("provenance"))||"official".equalsIgnoreCase(o.optString("provenance"));else if("models".equals(requested))ok="Frontier Models".equalsIgnoreCase(o.optString("category"));else if("agents".equals(requested))ok="Products & Agents".equalsIgnoreCase(o.optString("category"));else if("policy".equals(requested))ok="Compliance & Ethics".equalsIgnoreCase(o.optString("category"));else if("research".equals(requested))ok="Research".equalsIgnoreCase(o.optString("category"));else if("safety".equals(requested))ok="Safety & Security".equalsIgnoreCase(o.optString("category"));else if("infra".equals(requested))ok="Infrastructure".equalsIgnoreCase(o.optString("category"));else if("robotics".equals(requested))ok="Robotics & Embodied AI".equalsIgnoreCase(o.optString("category"));if(ok)out.add(o);}if(out.isEmpty())out.addAll(items);return out;}
    private int signalScore(JSONObject item){int score=10;String p=item.optString("provenance","");if("primary".equals(p)||"official".equals(p))score+=18;else if("research".equals(p))score+=15;else if("governance".equals(p))score+=14;else if("journalism".equals(p))score+=9;if("high".equals(item.optString("aiConfidence")))score+=15;score+=Math.min(12,(item.optJSONArray("tags")!=null?item.optJSONArray("tags").length():0)*2+(item.optJSONArray("providers")!=null?item.optJSONArray("providers").length():0)*2);try{long age=Math.max(0,System.currentTimeMillis()-Instant.parse(item.optString("publishedAt")).toEpochMilli());double h=age/3600000.0;score+=Math.max(0,(int)(20-Math.log1p(h)*4.1));}catch(Exception ignored){score+=5;}return Math.min(100,score);}
    private String extra(List<JSONObject> items,JSONObject selected,String requested){if(mode()==5){StringBuilder out=new StringBuilder();int added=0;for(JSONObject o:items){if(o==selected)continue;if(added++>1)break;if(out.length()>0)out.append("  ◈  ");out.append(o.optString("title","AI signal"));}return out.length()==0?"Multi-signal stack":out.toString();}if(mode()==7)return"SYNC "+new SimpleDateFormat("HH:mm",Locale.getDefault()).format(new Date())+"  //  "+requested.toUpperCase(Locale.ROOT);if(mode()==8)return radarLine(items);String summary=selected.optString("summary","");if(summary.length()>160)summary=summary.substring(0,157)+"…";return summary.isEmpty()?"Tap headline for the original source.":summary;}
    private String radarLine(List<JSONObject> items){Map<String,Integer> counts=new HashMap<>();for(int i=0;i<items.size()&&i<50;i++){String c=items.get(i).optString("category","AI");counts.put(c,counts.getOrDefault(c,0)+1);}List<Map.Entry<String,Integer>> e=new ArrayList<>(counts.entrySet());e.sort((a,b)->b.getValue()-a.getValue());StringBuilder s=new StringBuilder("72H RADAR  ");for(int i=0;i<e.size()&&i<3;i++){if(i>0)s.append("  ◈  ");s.append(shortCat(e.get(i).getKey())).append(' ').append(e.get(i).getValue());}return s.toString();}
    private String shortCat(String c){if(c.startsWith("Frontier"))return"MODELS";if(c.startsWith("Products"))return"AGENTS";if(c.startsWith("Compliance"))return"POLICY";if(c.startsWith("Safety"))return"SAFETY";if(c.startsWith("Robotics"))return"ROBOTICS";return c.toUpperCase(Locale.ROOT);}
    private String badgeFor(String requested){switch(requested){case"primary":return"PRIMARY";case"models":return"MODEL WIRE";case"agents":return"AGENTS";case"policy":return"POLICY";case"research":return"RESEARCH";case"safety":return"SAFETY";case"infra":return"INFRA";case"robotics":return"ROBOTICS";default:return mode()==8?"ACTIVITY":"AI ONLY";}}
    private int resolveAccent(String a){switch(a){case"mint":return 0xFF65F7C4;case"cyan":return 0xFF55D9FF;case"violet":return 0xFFA993FF;case"magenta":return 0xFFFF78C8;case"amber":return 0xFFFFBF5B;default:return 0;}}
    private int dp(Context c,int v){return Math.round(v*c.getResources().getDisplayMetrics().density);}
    private String timeLabel(String iso){try{if(iso!=null&&iso.length()>=16)return iso.substring(11,16)+"Z";}catch(Exception ignored){}return"LIVE";}
    private JSONObject settings(Context context){try{return new JSONObject(context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getString("settings","{}"));}catch(Exception ignored){return new JSONObject();}}

    private List<JSONObject> loadItems(Context context){String json=null;try{HttpURLConnection conn=(HttpURLConnection)new URL(REMOTE+"?widget="+System.currentTimeMillis()).openConnection();conn.setConnectTimeout(7000);conn.setReadTimeout(7000);conn.setRequestProperty("User-Agent","AI-News-Android-Widget/3.2");if(conn.getResponseCode()>=200&&conn.getResponseCode()<300)json=read(conn.getInputStream());conn.disconnect();}catch(Exception ignored){}if(json==null){try{json=read(context.getAssets().open("news.json"));}catch(Exception ignored){}}List<JSONObject> out=new ArrayList<>();if(json==null)return out;Set<String> disabled=disabled(context);try{JSONObject root=new JSONObject(json);JSONArray arr=root.optJSONArray("items");if(arr==null)return out;for(int i=0;i<arr.length()&&out.size()<180;i++){JSONObject o=arr.optJSONObject(i);if(o!=null&&!"low".equals(o.optString("aiConfidence"))&&!disabled.contains(o.optString("source","")))out.add(o);}}catch(Exception ignored){}return out;}
    private Set<String> disabled(Context context){Set<String> out=new HashSet<>();try{String raw=context.getSharedPreferences("widgetPrefs",Context.MODE_PRIVATE).getString("disabledSources","[]");JSONArray a=new JSONArray(raw);for(int i=0;i<a.length();i++)out.add(a.optString(i));}catch(Exception ignored){}return out;}
    private String read(InputStream in)throws Exception{BufferedReader br=new BufferedReader(new InputStreamReader(in,StandardCharsets.UTF_8));StringBuilder sb=new StringBuilder();String line;while((line=br.readLine())!=null)sb.append(line);br.close();return sb.toString();}
    public static void refreshAll(Context context){Class<?>[] classes=new Class<?>[]{BreakingWidget.class,TopStoryWidget.class,ProviderWireWidget.class,GovernanceWidget.class,ResearchWidget.class,CompactStackWidget.class,NeonMatrixWidget.class,SignalClockWidget.class,LiveRadarWidget.class};for(Class<?> cls:classes){Intent i=new Intent(context,cls);i.setAction(ACTION_REFRESH);context.sendBroadcast(i);}}
}