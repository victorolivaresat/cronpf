
import { eachDayOfInterval, format, startOfMonth, endOfMonth, eachMonthOfInterval, differenceInDays, isWeekend, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

type GanttTimelineProps = {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
};

export function GanttTimeline({ startDate, endDate, dayWidth }: GanttTimelineProps) {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const months = eachMonthOfInterval({ start: startDate, end: endDate });
  const totalDays = differenceInDays(endDate, startDate) + 1;

  return (
    <div className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 pb-2">
      {/* Month row */}
      <div className="relative flex border-b">
        {months.map((month, index) => {
          const monthStart = index === 0 ? startDate : startOfMonth(month);
          const monthEnd = index === months.length - 1 ? endDate : endOfMonth(month);
          const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
          const width = daysInMonth * dayWidth;

          return (
            <div
              key={month.toString()}
              className="h-8 flex items-center justify-center border-r"
              style={{ width: `${width}px` }}
            >
              <span className="text-sm font-semibold capitalize">{format(month, "MMMM yyyy", { locale: es })}</span>
            </div>
          );
        })}
      </div>
      {/* Day row */}
      <div className="relative flex">
        {days.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "h-8 flex items-center justify-center border-r text-center",
              isWeekend(day) && "bg-muted/50",
            )}
            style={{ width: `${dayWidth}px` }}
          >
            <span className="text-xs text-muted-foreground">{format(day, "d")}</span>
          </div>
        ))}
      </div>
       {/* Grid lines & Today indicator */}
       <div className="absolute top-0 left-0 h-full w-full" style={{ height: 'calc(100% + 1000px)', pointerEvents: 'none' }}>
        {days.map((day, index) => (
            <div key={`grid-${index}`} className="absolute top-16 h-full border-r" style={{ left: `${index * dayWidth + (dayWidth-1)}px`, bottom: '-1000px' }}>
                {isToday(day) && (
                    <div className="absolute top-0 h-full -translate-x-1/2" style={{width: `${dayWidth}px`, background: 'hsl(var(--primary) / 0.2)'}}>
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs font-bold text-primary">HOY</div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
}
