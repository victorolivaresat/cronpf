
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project, Task, TaskStatus } from "@/lib/types";
import { Briefcase, CheckCircle2, ListTodo, AlertTriangle } from "lucide-react";
import { useMemo } from "react";

type DashboardSummaryProps = {
  projects: Project[];
  tasks: (Task & { projectName: string })[];
};

export function DashboardSummary({ projects, tasks }: DashboardSummaryProps) {

  const summary = useMemo(() => {
    const totalProjects = projects.length;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress').length;

    return {
      totalProjects,
      completedTasks,
      pendingTasks,
    };
  }, [projects, tasks]);
  
  const overdueTasks = useMemo(() => {
    const now = new Date();
    return tasks.filter(t => t.status !== 'completed' && new Date(t.endDate) < now).length;
  }, [tasks]);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
          <Briefcase className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.totalProjects}</div>
          <p className="text-xs text-muted-foreground">Proyectos de los que eres miembro</p>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Pendientes</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.pendingTasks}</div>
          <p className="text-xs text-muted-foreground">Tareas pendientes o en curso</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Completadas</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.completedTasks}</div>
          <p className="text-xs text-muted-foreground">En todos tus proyectos</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tareas Atrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{overdueTasks}</div>
          <p className="text-xs text-muted-foreground">Tareas que pasaron su fecha límite</p>
        </CardContent>
      </Card>
    </div>
  );
}

    