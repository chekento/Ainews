package cloud.kosch.ainews.widget;
import android.graphics.Color;
import cloud.kosch.ainews.R;
public class SignalClockWidget extends BaseNewsWidget { protected int mode(){return 7;} protected String label(){return "SIGNAL CLOCK";} protected int backgroundRes(){return R.drawable.widget_bg_clock;} protected int accentColor(){return Color.rgb(169,147,255);} }
