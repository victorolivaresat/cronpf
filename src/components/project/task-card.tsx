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
  ChevronRight,
  Loader2 
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { enhanceSubtaskText } from "@/ai/flows/enhance-subtask-text";
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

export function TaskCard({
  task,
  projectId,
  onEdit,
  onDelete,
  forceExpanded = false,
  isCompactView = false,
  isTwoColumnLayout = false,
  isKanbanView = false
}: TaskCardProps) {

  const { user } = useAuth();
  const [newSubtask, setNewSubtask] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [wasTextCorrected, setWasTextCorrected] = useState(false);
  const [isLoadingSubtask, setIsLoadingSubtask] = useState(false);

  const expanded = forceExpanded || isExpanded;

  const subtasks = useMemo(() => {
    return task.subtasks
      ? Object.entries(task.subtasks).map(([id, subtask]) => ({
        id,
        title: (subtask as any).title,
        done: (subtask as any).done
      }))
      : [];
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

  const correctTextWithAI = async (text: string): Promise<string> => {
    try {
      const { corrected } = await enhanceSubtaskText({ text });
      return corrected || text;
    } catch {
      return text;
    }
  };

  const handleAddSubtask = async () => {
    if (!user || isLoadingSubtask) return;
    const rawText = newSubtask.trim();
    if (!rawText) return;

    // 🔥 Muestra loader inmediatamente
    flushSync(() => setIsLoadingSubtask(true));

    try {
      const correctedTitle = await correctTextWithAI(rawText);
      if (!correctedTitle.trim()) return;

      if (correctedTitle !== rawText) {
        setWasTextCorrected(true);
        setTimeout(() => setWasTextCorrected(false), 3000);
      }

      const subtasksRef = ref(db, `projects/${projectId}/tasks/${task.id}/subtasks`);
      const newSubtaskRef = push(subtasksRef);
      await set(newSubtaskRef, { title: correctedTitle, done: false });

      setNewSubtask("");

    } catch (err) {
      console.error("Error al agregar subtarea:", err);
    } finally {
      setTimeout(() => setIsLoadingSubtask(false), 600);
    }
  };

  // --- UI principal ---
  return (
    <Collapsible open={expanded} onOpenChange={setIsExpanded}>
      <Card className={isCompactView ? "border-l-4 border-l-primary/20" : ""}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1 flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {!forceExpanded && (expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                  {statusIcons[task.status]}
                </div>
                <div className="flex-1">
                  <CardTitle className="font-headline text-lg">{task.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                    <span>{statusText[task.status]}</span>
                    <span>{Math.round(progress)}% completado</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(task.endDate), "d MMM", { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
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
            <Progress value={progress} className="h-1.5 mt-2" />
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

              {/* Subtareas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-muted-foreground">Subtareas ({subtasks.length})</h4>
                  {wasTextCorrected && (
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/20 px-2 py-1 rounded">
                      ✓ Subtarea agregada.
                    </span>
                  )}
                </div>

                {subtasks.map((subtask) => (
                  <SubtaskItem key={subtask.id} subtask={subtask} taskId={task.id} projectId={projectId} />
                ))}

                <div className="relative min-h-[36px]">
                  <div
                    className={`absolute inset-0 transition-opacity duration-300 ${isLoadingSubtask ? "opacity-0 pointer-events-none" : "opacity-100"}`}
                  >
                    <div className="flex gap-2 items-center w-full">
                      <Input
                        placeholder="Escribe una subtarea..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        className="h-8 text-xs flex-1"
                      />
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium flex items-center gap-1"
                        onClick={handleAddSubtask}
                        disabled={isLoadingSubtask || !newSubtask.trim()}
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`absolute inset-0 flex items-center justify-between px-3 py-2 rounded-md bg-muted/40 border border-border transition-opacity duration-300 ${isLoadingSubtask ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground italic">
                        Agregando Subtarea...
                      </span>
                    </div>
                    <Loader2 className="h-3.5 w-3.5 text-muted-foreground animate-spin" />
                  </div>
                </div>
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
