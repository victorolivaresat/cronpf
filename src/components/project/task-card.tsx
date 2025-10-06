
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
import {
  Circle,
  CircleDashed,
  CircleCheck,
  MoreVertical,
  Calendar,
  Pencil,
  Trash2,
  Plus
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

export function TaskCard({ task, projectId, onEdit, onDelete }: TaskCardProps) {
  const { user } = useAuth();
  const [newSubtask, setNewSubtask] = useState("");

  const subtasks = useMemo(() => {
    return task.subtasks ? Object.entries(task.subtasks).map(([id, subtask]) => ({...(subtask as object), id})) : [];
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

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="font-headline text-lg">{task.title}</CardTitle>
            <CardDescription className="mt-1">{task.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-4">
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-2">
            <Calendar className="w-3 h-3"/>
            {format(new Date(task.startDate), "d MMM", { locale: es })} - {format(new Date(task.endDate), "d MMM, yyyy", { locale: es })}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-muted-foreground">Progreso</span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Subtareas</h4>
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
                <div className="flex items-center -space-x-2">
                <TooltipProvider>
                {task.assignees.map(email => (
                    <Tooltip key={email}>
                        <TooltipTrigger asChild>
                            <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarFallback>{getInitials(email)}</AvatarFallback>
                            </Avatar>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{email}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
                </TooltipProvider>
                </div>
            </CardFooter>
        )}
    </Card>
  );
}
