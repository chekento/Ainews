package cloud.kosch.ainews.widget;
import android.graphics.Color;
import cloud.kosch.ainews.R;
public class BreakingWidget extends BaseNewsWidget { protected int mode(){return 0;} protected String label(){return "AI NEWS // BREAKING";} protected int backgroundRes(){return R.drawable.widget_bg_breaking;} protected int accentColor(){return Color.rgb(255,97,133);} }
