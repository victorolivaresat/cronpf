
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Project, Task } from "@/lib/types";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

type ProjectCardProps = {
  project: Project;
  onDelete?: (projectId: string) => Promise<void>;
  currentUserId?: string;
};

export function ProjectCard({ project, onDelete, currentUserId }: ProjectCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const progress = useMemo(() => {
    const tasks = project.tasks ? Object.values(project.tasks) : [];
    if (tasks.length === 0) return 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    return (completedTasks / totalTasks) * 100;
  }, [project.tasks]);

  const projectUrl = `/project/${project.id}`;
  const canDelete = currentUserId === project.ownerId && onDelete;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(project.id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link href={projectUrl}>
              <CardTitle className="font-headline truncate hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </Link>
            <CardDescription className="line-clamp-2 mt-2">{project.description}</CardDescription>
          </div>
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 ml-2 text-muted-foreground hover:text-destructive flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar proyecto?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el proyecto "{project.title}" y todas sus tareas. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <Link href={projectUrl}>
        <CardContent className="flex-grow">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              {format(new Date(project.startDate), "d MMM, yyyy", { locale: es })} -{" "}
              {format(new Date(project.endDate), "d MMM, yyyy", { locale: es })}
            </p>
            <div className="space-y-1">
                <div className="flex justify-between text-xs">
                    <span>Progreso</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Creado {formatDistanceToNow(new Date(project.startDate), { addSuffix: true, locale: es })}
          </p>
        </CardFooter>
      </Link>
    </Card>
  );
}

    