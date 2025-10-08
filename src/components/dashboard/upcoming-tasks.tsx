
"use client";

import { useMemo } from 'react';
import { Task } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { differenceInDays, format, isFuture, isPast, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Circle, CircleCheck, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

type UpcomingTasksProps = {
  tasks: (Task & { projectName: string })[];
};

const statusIcons = {
  pending: <Circle className="w-3.5 h-3.5 text-muted-foreground" />,
  'in-progress': <CircleDashed className="w-3.5 h-3.5 text-blue-500" />,
  completed: <CircleCheck className="w-3.5 h-3.5 text-green-500" />,
};

export function UpcomingTasks({ tasks }: UpcomingTasksProps) {

  // Tareas próximas a vencer (en los próximos 7 días)
  const now = new Date();
  const oneWeekFromNow = new Date(now);
  oneWeekFromNow.setDate(now.getDate() + 7);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== 'completed' &&
          isFuture(new Date(task.endDate)) &&
          new Date(task.endDate) <= oneWeekFromNow
      )
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [tasks]);

  // Tareas ya expiradas (no completadas y endDate en el pasado)
  const expiredTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== 'completed' &&
          isPast(new Date(task.endDate)) &&
          !isToday(new Date(task.endDate))
      )
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
  }, [tasks]);

  const getUrgency = (endDate: string) => {
    const daysLeft = differenceInDays(new Date(endDate), new Date());
    if (isToday(new Date(endDate))) return { text: "Vence Hoy", className: "bg-amber-500 text-white" };
    if (daysLeft < 0) return { text: `Expirada hace ${Math.abs(daysLeft)}d`, className: "bg-destructive text-white" };
    if (daysLeft <= 3) return { text: `Faltan ${daysLeft}d`, className: "bg-destructive/80 text-destructive-foreground" };
    if (daysLeft <= 7) return { text: `Faltan ${daysLeft}d`, className: "bg-amber-500/80 text-white" };
    return { text: ``, className: ""};
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Próximos Vencimientos</CardTitle>
        <CardDescription>Tareas que vencen en los próximos 7 días.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {(upcomingTasks.length > 0 || expiredTasks.length > 0) ? (
            <div className="space-y-4 pr-4">
              {upcomingTasks.map((task, index) => (
                <div key={`upcoming-${task.id}-${index}`} className="flex items-start gap-4">
                   <div className="mt-1">{statusIcons[task.status]}</div>
                   <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.projectName}</p>
                   </div>
                   <Badge className={cn("text-xs shadow-lg", getUrgency(task.endDate).className)}>
                        {getUrgency(task.endDate).text}
                    </Badge>
                </div>
              ))}
              {expiredTasks.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground mt-4 mb-1 font-semibold uppercase tracking-wide">Expiradas</div>
                  {expiredTasks.map((task, index) => (
                    <div key={`expired-${task.id}-${index}`} className="flex items-start gap-4 opacity-80">
                      <div className="mt-1">{statusIcons[task.status]}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none line-through">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.projectName}</p>
                      </div>
                      <Badge className={cn("text-xs shadow-lg", getUrgency(task.endDate).className)}>
                        {getUrgency(task.endDate).text}
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <p className="text-sm font-medium">No hay vencimientos próximos</p>
              <p className="text-xs text-muted-foreground">¡Disfruta la calma mientras dure!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
