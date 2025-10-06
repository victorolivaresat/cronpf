
"use client";

import { Task } from "@/lib/types";
import { differenceInDays, format, parseISO, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { useAuth } from "@/hooks/use-auth";
import { ref, update } from "firebase/database";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";

type GanttBarProps = {
  task: Task & { projectId: string };
  projectStartDate: Date;
  totalDays: number;
  index: number;
  dayWidth: number;
};

const statusColors: Record<Task['status'], string> = {
    pending: 'bg-muted/70 border-muted-foreground/50 text-foreground',
    'in-progress': 'bg-primary/70 border-primary/50 text-primary-foreground',
    completed: 'bg-green-500/70 border-green-500/50 text-white',
};

export function GanttBar({ task, projectStartDate, totalDays, index, dayWidth }: GanttBarProps) {
  const { user } = useAuth();
  const nodeRef = useRef(null);

  const taskStartDate = parseISO(task.startDate);
  const taskEndDate = parseISO(task.endDate);

  const startOffsetDays = differenceInDays(taskStartDate, projectStartDate);
  const durationDays = differenceInDays(taskEndDate, taskStartDate) + 1;

  const [position, setPosition] = useState({ x: startOffsetDays * dayWidth, y: index * 56 + 8 });
  const [width, setWidth] = useState(durationDays * dayWidth);
  
  const barHeight = 32;

  const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
    if (!user) return;

    const newStartOffsetDays = Math.round(data.x / dayWidth);
    const newStartDate = addDays(projectStartDate, newStartOffsetDays);
    const currentDurationDays = Math.round(width / dayWidth);
    const newEndDate = addDays(newStartDate, currentDurationDays - 1);
    
    const taskRef = ref(db, `projects/${task.projectId}/tasks/${task.id}`);
    update(taskRef, { 
      startDate: newStartDate.toISOString(),
      endDate: newEndDate.toISOString()
    });
    
    setPosition({ x: data.x, y: position.y });
  };
  
  const handleResizeStop = (e: any, data: any) => {
    if (!user) return;
    
    const newWidth = data.size.width;
    const newDurationDays = Math.max(1, Math.round(newWidth / dayWidth));
    
    const currentStartDate = parseISO(task.startDate);
    const newEndDate = addDays(currentStartDate, newDurationDays - 1);

    const taskRef = ref(db, `projects/${task.projectId}/tasks/${task.id}`);
    update(taskRef, { endDate: newEndDate.toISOString() });
    
    setWidth(newWidth);
  };

  return (
    <Draggable
        axis="x"
        handle=".drag-handle"
        position={position}
        grid={[dayWidth, 0]}
        onStop={handleDragStop}
        nodeRef={nodeRef}
        bounds={{ left: 0, right: (totalDays - durationDays) * dayWidth }}
    >
        <div 
            ref={nodeRef}
            className="absolute group"
            style={{ height: `${barHeight}px`, width: `${width}px` }}
        >
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="w-full h-full">
                            <ResizableBox 
                                width={width} 
                                height={barHeight}
                                onResizeStop={handleResizeStop}
                                onResize={(e, data) => setWidth(data.size.width)}
                                axis="x"
                                minConstraints={[dayWidth, barHeight]}
                                maxConstraints={[(totalDays - Math.round(position.x / dayWidth)) * dayWidth, barHeight]}
                                handles={['e']}
                                handle={<span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-4 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 cursor-ew-resize" />}
                            >
                                <div
                                    className={cn(
                                        "w-full h-full rounded-lg border-2 flex items-center justify-start px-2 shadow-sm transition-all duration-200 drag-handle",
                                        statusColors[task.status],
                                        "hover:opacity-90"
                                    )}
                                >
                                    <p className="text-sm font-medium truncate pointer-events-none">{task.title}</p>
                                </div>
                            </ResizableBox>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p className="font-bold">{task.title}</p>
                        <p className="capitalize">Estado: {task.status.replace('-', ' ')}</p>
                        <p>Inicia: {format(taskStartDate, "d MMM, yyyy", { locale: es })}</p>
                        <p>Termina: {format(taskEndDate, "d MMM, yyyy", { locale: es })}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    </Draggable>
  );
}
