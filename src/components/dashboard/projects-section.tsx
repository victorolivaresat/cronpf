"use client";

import { useState } from "react";
import { Project } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Plus } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useMemo } from "react";

type ViewMode = "grid" | "compact";

interface ProjectsSectionProps {
  projects: Project[];
  visibleProjects: number;
  hasMoreProjects: boolean;
  onLoadMore: () => void;
  onDeleteProject: (projectId: string) => Promise<void>;
  currentUserId?: string;
}

export function ProjectsSection({
  projects,
  visibleProjects,
  hasMoreProjects,
  onLoadMore,
  onDeleteProject,
  currentUserId,
}: ProjectsSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const displayedProjects = projects.slice(0, visibleProjects);

  const getProjectProgress = (project: Project) => {
    const tasks = project.tasks ? Object.values(project.tasks) : [];
    if (tasks.length === 0) return 0;

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    return (completedTasks / totalTasks) * 100;
  };

  const getProjectStats = (project: Project) => {
    const tasks = project.tasks ? Object.values(project.tasks) : [];
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      pending: tasks.filter(task => task.status === 'pending').length,
    };
  };

  const ProjectCompactView = ({ project }: { project: Project }) => {
    const progress = getProjectProgress(project);
    const stats = getProjectStats(project);
    const canDelete = currentUserId === project.ownerId;

    return (
      <AccordionItem value={project.id} className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline group">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {project.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Progreso</p>
                  <p className="font-medium">{Math.round(progress)}%</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Tareas</p>
                  <p className="font-medium">{stats.completed}/{stats.total}</p>
                </div>
                <Badge 
                  variant={progress === 100 ? "default" : progress > 50 ? "default" : "secondary"}
                  className={progress === 100 ? "bg-green-600 hover:bg-green-700" : progress > 0 ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {progress === 100 ? "Completado" : progress > 0 ? "En progreso" : "Sin iniciar"}
                </Badge>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <Card>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Información del Proyecto</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Fechas:</span>{" "}
                        {format(new Date(project.startDate), "d MMM, yyyy", { locale: es })} -{" "}
                        {format(new Date(project.endDate), "d MMM, yyyy", { locale: es })}
                      </p>
                      <p>
                        <span className="font-medium">Creado:</span>{" "}
                        {formatDistanceToNow(new Date(project.startDate), { addSuffix: true, locale: es })}
                      </p>
                      <p>
                        <span className="font-medium">Miembros:</span>{" "}
                        {project.members ? Object.keys(project.members).length : 0}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Progreso General</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completado</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Estadísticas de Tareas</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Completadas:</span>
                        <span className="font-medium">{stats.completed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">En progreso:</span>
                        <span className="font-medium">{stats.inProgress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-orange-600">Pendientes:</span>
                        <span className="font-medium">{stats.pending}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button asChild>
                      <Link href={`/project/${project.id}`}>
                        Ver Proyecto
                      </Link>
                    </Button>
                    {canDelete && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => onDeleteProject(project.id)}
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-2xl font-bold">Tus Proyectos</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Vista Amplia
          </Button>
          <Button
            variant={viewMode === "compact" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("compact")}
          >
            <List className="h-4 w-4 mr-2" />
            Vista Compacta
          </Button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {displayedProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={onDeleteProject}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {displayedProjects.map((project) => (
            <ProjectCompactView key={project.id} project={project} />
          ))}
        </Accordion>
      )}
      
      {hasMoreProjects && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline" 
            onClick={onLoadMore}
            className="px-8"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cargar más proyectos
          </Button>
        </div>
      )}
    </div>
  );
}