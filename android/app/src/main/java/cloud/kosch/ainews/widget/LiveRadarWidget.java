package cloud.kosch.ainews.widget;
import android.graphics.Color;
import cloud.kosch.ainews.R;
public class LiveRadarWidget extends BaseNewsWidget { protected int mode(){return 8;} protected String label(){return "LIVE AI RADAR";} protected int backgroundRes(){return R.drawable.widget_bg_matrix;} protected int accentColor(){return Color.rgb(255,120,200);} }
