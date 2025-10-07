
"use client";

import { Task, TaskStatus } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Circle,
  CircleDashed,
  CircleCheck,
  MoreVertical,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { SubtaskItem } from "./subtask-item";
import { ref, update, set, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

type TaskCardProps = {
  task: Task;
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
  forceExpanded?: boolean;
  isCompactView?: boolean;
  isTwoColumnLayout?: boolean;
  isKanbanView?: boolean;
};

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  pending: <Circle className="w-4 h-4 text-muted-foreground" />,
  "in-progress": <CircleDashed className="w-4 h-4 text-blue-500" />,
  completed: <CircleCheck className="w-4 h-4 text-green-500" />,
};

const statusText: Record<TaskStatus, string> = {
  pending: "Pendiente",
  "in-progress": "En Progreso",
  completed: "Completada",
};

const getInitials = (email: string = "") => {
    const name = email.split('@')[0];
    const nameParts = name.split(/[._-]/);
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

export function TaskCard({ task, projectId, onEdit, onDelete, forceExpanded = false, isCompactView = false, isTwoColumnLayout = false, isKanbanView = false }: TaskCardProps) {
  const { user } = useAuth();
  const [newSubtask, setNewSubtask] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const expanded = forceExpanded || isExpanded;

  const subtasks = useMemo(() => {
    return task.subtasks ? Object.entries(task.subtasks).map(([id, subtask]) => ({
      id,
      title: (subtask as any).title,
      done: (subtask as any).done
    })) : [];
  }, [task.subtasks]);

  const progress = useMemo(() => {
    if (subtasks.length === 0) return task.status === 'completed' ? 100 : 0;
    const completedCount = subtasks.filter((st) => st.done).length;
    return (completedCount / subtasks.length) * 100;
  }, [subtasks, task.status]);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (!user) return;
    const taskRef = ref(db, `projects/${projectId}/tasks/${task.id}`);
    await update(taskRef, { status: newStatus });
  };
  
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newSubtask.trim()) return;
    const subtasksRef = ref(db, `projects/${projectId}/tasks/${task.id}/subtasks`);
    const newSubtaskRef = push(subtasksRef);
    await set(newSubtaskRef, { title: newSubtask, done: false });
    setNewSubtask("");
  }

  // Vista Kanban minimalista
  if (isKanbanView) {
    return (
      <Collapsible open={expanded} onOpenChange={setIsExpanded}>
        <Card className="border border-border hover:border-primary/40 transition-colors">
          <CollapsibleTrigger asChild>
            <CardContent className="p-3 cursor-pointer">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm leading-tight truncate pr-2 flex-1">{task.title}</h3>
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                          <Pencil className="mr-2 h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Eliminar</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {statusIcons[task.status]}
                  <span className="text-xs text-muted-foreground">{statusText[task.status]}</span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                </div>
              </div>
            </CardContent>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0 px-3 pb-3">
              <div className="space-y-4">
                {task.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h4>
                    <CardDescription className="text-xs">{task.description}</CardDescription>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Inicio:</span>
                    <p>{format(new Date(task.startDate), "d MMM, yyyy", { locale: es })}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Fin:</span>
                    <p>{format(new Date(task.endDate), "d MMM, yyyy", { locale: es })}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 h-6 text-xs">
                          {statusIcons[task.status]}
                          {statusText[task.status]}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {(Object.keys(statusText) as TaskStatus[]).map((status) => (
                          <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                            {statusIcons[status]}
                            <span className="ml-2">{statusText[status]}</span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Subtareas ({subtasks.length})</h4>
                  {subtasks.map((subtask) => (
                    <SubtaskItem key={subtask.id} subtask={subtask} taskId={task.id} projectId={projectId} />
                  ))}
                  <form onSubmit={handleAddSubtask} className="flex gap-2">
                    <Input
                      placeholder="Añadir una nueva subtarea..."
                      value={newSubtask}
                      onChange={(e) => setNewSubtask(e.target.value)}
                      className="h-7 text-xs"
                    />
                    <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 shrink-0">
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Añadir subtarea</span>
                    </Button>
                  </form>
                </div>

                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Asignados:</span>
                    <div className="flex items-center -space-x-1">
                      <TooltipProvider>
                        {task.assignees.map(email => (
                          <Tooltip key={email}>
                            <TooltipTrigger asChild>
                              <Avatar className="h-6 w-6 border border-background">
                                <AvatarFallback className="text-xs">{getInitials(email)}</AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{email}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </TooltipProvider>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  }

  return (
    <Collapsible open={expanded} onOpenChange={setIsExpanded}>
      <Card className={isCompactView ? "border-l-4 border-l-primary/20" : ""}>
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer hover:bg-muted/50 transition-colors ${isCompactView ? "py-3" : ""}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {!forceExpanded && (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                  {statusIcons[task.status]}
                </div>
                <div className="flex-1">
                  <CardTitle className={`font-headline ${isCompactView ? "text-base" : "text-lg"}`}>{task.title}</CardTitle>
                  <div className={`flex items-center gap-4 ${isCompactView ? "mt-0.5" : "mt-1"}`}>
                    <span className={`${isCompactView ? "text-xs" : "text-sm"} text-muted-foreground`}>{statusText[task.status]}</span>
                    <span className={`${isCompactView ? "text-xs" : "text-sm"} text-muted-foreground`}>{Math.round(progress)}% completado</span>
                    {subtasks.length > 0 && (
                      <span className={`${isCompactView ? "text-xs" : "text-sm"} text-muted-foreground`}>
                        {subtasks.filter(st => st.done).length}/{subtasks.length} subtareas
                      </span>
                    )}
                    <div className={`${isCompactView ? "text-xs" : "text-xs"} text-muted-foreground flex items-center gap-1`}>
                      <Calendar className="w-3 h-3"/>
                      {format(new Date(task.endDate), "d MMM", { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className={`${isCompactView ? "h-7" : "h-8"}`}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Pencil className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Eliminar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="w-full">
              <Progress value={progress} className={`${isCompactView ? "h-1" : "h-1.5"}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              {task.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Descripción</h4>
                  <CardDescription>{task.description}</CardDescription>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">Inicio:</span>
                  <p>{format(new Date(task.startDate), "d MMM, yyyy", { locale: es })}</p>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Fin:</span>
                  <p>{format(new Date(task.endDate), "d MMM, yyyy", { locale: es })}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Estado</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        {statusIcons[task.status]}
                        {statusText[task.status]}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {(Object.keys(statusText) as TaskStatus[]).map((status) => (
                        <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                          {statusIcons[status]}
                          <span className="ml-2">{statusText[status]}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Subtareas ({subtasks.length})</h4>
                {subtasks.map((subtask) => (
                  <SubtaskItem key={subtask.id} subtask={subtask} taskId={task.id} projectId={projectId} />
                ))}
                <form onSubmit={handleAddSubtask} className="flex gap-2">
                  <Input
                    placeholder="Añadir una nueva subtarea..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    className="h-8"
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Añadir subtarea</span>
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
          
          {task.assignees && task.assignees.length > 0 && (
            <CardFooter>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Asignados:</span>
                <div className="flex items-center -space-x-2">
                  <TooltipProvider>
                    {task.assignees.map(email => (
                      <Tooltip key={email}>
                        <TooltipTrigger asChild>
                          <Avatar className="h-8 w-8 border-2 border-background">
                            <AvatarFallback className="text-xs">{getInitials(email)}</AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{email}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>
                </div>
              </div>
            </CardFooter>
          )}
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
