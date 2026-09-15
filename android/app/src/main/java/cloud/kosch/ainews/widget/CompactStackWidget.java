package cloud.kosch.ainews.widget;
import android.graphics.Color;
import cloud.kosch.ainews.R;
public class CompactStackWidget extends BaseNewsWidget { protected int mode(){return 5;} protected String label(){return "SIGNAL STACK";} protected int backgroundRes(){return R.drawable.widget_bg_stack;} protected int accentColor(){return Color.rgb(230,236,255);} }
