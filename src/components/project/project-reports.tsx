"use client";

import { Task, Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  FileJson,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo } from "react";

type ProjectReportsProps = {
  project: Project;
  tasks: Task[];
};

export function ProjectReports({ project, tasks }: ProjectReportsProps) {
  const reportData = useMemo(() => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'in-progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'pending').length;
    
    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    
    // Análisis de subtareas
    const totalSubtasks = tasks.reduce((acc, task) => {
      if (task.subtasks) {
        return acc + Object.keys(task.subtasks).length;
      }
      return acc;
    }, 0);
    
    const completedSubtasks = tasks.reduce((acc, task) => {
      if (task.subtasks) {
        const completed = Object.values(task.subtasks).filter((subtask: any) => subtask.done).length;
        return acc + completed;
      }
      return acc;
    }, 0);
    
    // Análisis de fechas
    const now = new Date();
    const overdueTasks = tasks.filter(task => {
      const endDate = new Date(task.endDate);
      return endDate < now && task.status !== 'completed';
    }).length;
    
    // Análisis de asignados
    const allAssignees = new Set<string>();
    tasks.forEach(task => {
      if (task.assignees) {
        task.assignees.forEach(assignee => allAssignees.add(assignee));
      }
    });
    
    const assigneeStats = Array.from(allAssignees).map(assignee => {
      const assignedTasks = tasks.filter(task => 
        task.assignees && task.assignees.includes(assignee)
      );
      const completedByAssignee = assignedTasks.filter(task => task.status === 'completed').length;
      
      return {
        email: assignee,
        totalTasks: assignedTasks.length,
        completedTasks: completedByAssignee,
        progress: assignedTasks.length > 0 ? (completedByAssignee / assignedTasks.length) * 100 : 0
      };
    });
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overallProgress,
      totalSubtasks,
      completedSubtasks,
      subtaskProgress: totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0,
      overdueTasks,
      totalAssignees: allAssignees.size,
      assigneeStats
    };
  }, [tasks]);

  const generateCSVReport = () => {
    const headers = [
      'Título',
      'Estado',
      'Descripción',
      'Fecha Inicio',
      'Fecha Fin',
      'Progreso (%)',
      'Subtareas Totales',
      'Subtareas Completadas',
      'Asignados'
    ];
    
    const rows = tasks.map(task => {
      const subtaskCount = task.subtasks ? Object.keys(task.subtasks).length : 0;
      const completedSubtasks = task.subtasks ? 
        Object.values(task.subtasks).filter((subtask: any) => subtask.done).length : 0;
      const progress = subtaskCount > 0 ? (completedSubtasks / subtaskCount) * 100 : 
        (task.status === 'completed' ? 100 : 0);
      
      return [
        task.title,
        task.status === 'pending' ? 'Pendiente' : 
        task.status === 'in-progress' ? 'En Progreso' : 'Completada',
        task.description || '',
        format(new Date(task.startDate), 'dd/MM/yyyy'),
        format(new Date(task.endDate), 'dd/MM/yyyy'),
        Math.round(progress),
        subtaskCount,
        completedSubtasks,
        task.assignees ? task.assignees.join(', ') : ''
      ];
    });
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${project.title}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  const generateJSONReport = () => {
    const jsonReportData = {
      proyecto: {
        titulo: project.title,
        descripcion: project.description,
        fechaInicio: project.startDate,
        fechaFin: project.endDate
      },
      resumen: {
        totalTareas: reportData.totalTasks,
        tareasCompletadas: reportData.completedTasks,
        tareasEnProgreso: reportData.inProgressTasks,
        tareasPendientes: reportData.pendingTasks,
        progresoGeneral: Math.round(reportData.overallProgress),
        tareasVencidas: reportData.overdueTasks,
        totalAsignados: reportData.totalAssignees
      },
      tareas: tasks.map(task => ({
        id: task.id,
        titulo: task.title,
        descripcion: task.description,
        estado: task.status,
        fechaInicio: task.startDate,
        fechaFin: task.endDate,
        asignados: task.assignees || [],
        subtareas: task.subtasks ? Object.values(task.subtasks) : []
      })),
      estadisticasPorAsignado: reportData.assigneeStats,
      fechaReporte: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(jsonReportData, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${project.title}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Resumen Ejecutivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen del Proyecto
          </CardTitle>
          <CardDescription>
            Métricas generales y progreso del proyecto {project.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{reportData.totalTasks}</div>
              <div className="text-sm text-muted-foreground">Total Tareas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reportData.completedTasks}</div>
              <div className="text-sm text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reportData.inProgressTasks}</div>
              <div className="text-sm text-muted-foreground">En Progreso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{reportData.overdueTasks}</div>
              <div className="text-sm text-muted-foreground">Vencidas</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso General</span>
                <span className="text-sm text-muted-foreground">
                  {Math.round(reportData.overallProgress)}%
                </span>
              </div>
              <Progress value={reportData.overallProgress} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Subtareas</span>
                <span className="text-sm text-muted-foreground">
                  {reportData.completedSubtasks}/{reportData.totalSubtasks}
                </span>
              </div>
              <Progress value={reportData.subtaskProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Estado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Distribución por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-lg font-semibold text-muted-foreground">Pendiente</div>
              <div className="text-2xl font-bold">{reportData.pendingTasks}</div>
              <Badge variant="secondary" className="mt-2">
                {reportData.totalTasks > 0 ? Math.round((reportData.pendingTasks / reportData.totalTasks) * 100) : 0}%
              </Badge>
            </div>
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-lg font-semibold text-blue-600">En Progreso</div>
              <div className="text-2xl font-bold">{reportData.inProgressTasks}</div>
              <Badge variant="secondary" className="mt-2">
                {reportData.totalTasks > 0 ? Math.round((reportData.inProgressTasks / reportData.totalTasks) * 100) : 0}%
              </Badge>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-lg font-semibold text-green-600">Completada</div>
              <div className="text-2xl font-bold">{reportData.completedTasks}</div>
              <Badge variant="secondary" className="mt-2">
                {reportData.totalTasks > 0 ? Math.round((reportData.completedTasks / reportData.totalTasks) * 100) : 0}%
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis del Equipo */}
      {reportData.assigneeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Análisis del Equipo
            </CardTitle>
            <CardDescription>
              Rendimiento y carga de trabajo por miembro del equipo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.assigneeStats.map((assignee) => (
                <div key={assignee.email} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{assignee.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {assignee.completedTasks}/{assignee.totalTasks} tareas completadas
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium">{Math.round(assignee.progress)}%</div>
                    </div>
                    <div className="w-20">
                      <Progress value={assignee.progress} className="h-2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información del Proyecto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Información del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Inicio</label>
              <p className="font-medium">{format(new Date(project.startDate), "d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha de Fin</label>
              <p className="font-medium">{format(new Date(project.endDate), "d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Total de Asignados</label>
              <p className="font-medium">{reportData.totalAssignees} miembros del equipo</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Estado General</label>
              <div className="flex items-center gap-2">
                {reportData.overdueTasks > 0 ? (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {reportData.overdueTasks} tareas vencidas
                  </Badge>
                ) : reportData.overallProgress === 100 ? (
                  <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Proyecto Completado
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    En Progreso
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Descarga */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Descargar Reportes
          </CardTitle>
          <CardDescription>
            Exporta los datos del proyecto en diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={generateCSVReport} variant="outline" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Descargar CSV
            </Button>
            <Button onClick={generateJSONReport} variant="outline" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Descargar JSON
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Los reportes incluyen todas las tareas, subtareas, asignaciones y métricas del proyecto.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}