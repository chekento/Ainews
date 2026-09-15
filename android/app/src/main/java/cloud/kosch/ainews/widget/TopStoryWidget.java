package cloud.kosch.ainews.widget;
import android.graphics.Color;
import cloud.kosch.ainews.R;
public class TopStoryWidget extends BaseNewsWidget { protected int mode(){return 1;} protected String label(){return "PRIMARY SIGNAL";} protected int backgroundRes(){return R.drawable.widget_bg_top;} protected int accentColor(){return Color.rgb(101,247,196);} }
