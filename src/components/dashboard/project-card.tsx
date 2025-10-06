
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
import Link from "next/link";
import { useMemo } from "react";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {

  const progress = useMemo(() => {
    const tasks = project.tasks ? Object.values(project.tasks) : [];
    if (tasks.length === 0) return 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    return (completedTasks / totalTasks) * 100;
  }, [project.tasks]);

  const projectUrl = `/project/${project.id}`;

  return (
    <Link href={projectUrl}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors hover:shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline truncate">{project.title}</CardTitle>
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
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
      </Card>
    </Link>
  );
}

    