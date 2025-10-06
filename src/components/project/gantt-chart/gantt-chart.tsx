
"use client";

import { Project, Task } from "@/lib/types";
import { GanttTimeline } from "./gantt-timeline";
import { GanttBar } from "./gantt-bar";
import { differenceInDays, parseISO } from "date-fns";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

type GanttChartProps = {
  project: Project;
  tasks: Task[];
};

export function GanttChart({ project, tasks }: GanttChartProps) {
  const projectStartDate = parseISO(project.startDate);
  const projectEndDate = parseISO(project.endDate);
  const totalDays = differenceInDays(projectEndDate, projectStartDate) + 1;
  const dayWidth = 40;

  if (tasks.length === 0) {
    return (
       <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">No hay tareas para mostrar</h3>
        <p className="text-muted-foreground mt-1">Añade tareas con fechas de inicio y fin para verlas en la línea de tiempo.</p>
      </div>
    );
  }
  
  const tasksWithProjectId = tasks.map(task => ({...task, projectId: project.id}))

  return (
    <Card className="overflow-hidden border">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="relative p-4" style={{ minWidth: `${totalDays * dayWidth}px` }}>
                <GanttTimeline startDate={projectStartDate} endDate={projectEndDate} dayWidth={dayWidth} />
                <div className="relative h-full" style={{ height: `${tasks.length * 56}px`}}>
                {tasksWithProjectId.map((task, index) => (
                    <GanttBar
                    key={task.id}
                    task={task}
                    projectStartDate={projectStartDate}
                    totalDays={totalDays}
                    index={index}
                    dayWidth={dayWidth}
                    />
                ))}
                </div>
            </div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    </Card>
  );
}
