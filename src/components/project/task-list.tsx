
import { Task } from "@/lib/types";
import { TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, List, Grid3x3, Search, Filter, Columns2, Columns, LayoutGrid, Circle, CircleDashed, CircleCheck, FileBarChart } from "lucide-react";
import { useState, useMemo } from "react";

type TaskListProps = {
  tasks: Task[];
  projectId: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onShowReports?: () => void;
};

export function TaskList({ tasks, projectId, onEditTask, onDeleteTask, onShowReports }: TaskListProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [isCompactView, setIsCompactView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [isTwoColumns, setIsTwoColumns] = useState(true);
  const [isKanbanView, setIsKanbanView] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const columnsData = useMemo(() => {
    if (!isTwoColumns) {
      return { column1: filteredTasks, column2: [] };
    }
    
    const column1: Task[] = [];
    const column2: Task[] = [];
    
    filteredTasks.forEach((task, index) => {
      if (index % 2 === 0) {
        column1.push(task);
      } else {
        column2.push(task);
      }
    });
    
    return { column1, column2 };
  }, [filteredTasks, isTwoColumns]);

  const kanbanData = useMemo(() => {
    const pending = filteredTasks.filter(task => task.status === 'pending');
    const inProgress = filteredTasks.filter(task => task.status === 'in-progress');
    const completed = filteredTasks.filter(task => task.status === 'completed');
    
    return { pending, inProgress, completed };
  }, [filteredTasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">Aún no hay tareas</h3>
        <p className="text-muted-foreground mt-1">Añade una tarea para empezar tu proyecto.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          {onShowReports && (
            <Button
              variant="outline"
              size="sm"
              onClick={onShowReports}
              className="flex items-center gap-2"
            >
              <FileBarChart className="h-4 w-4" />
              Reportes
            </Button>
          )}
        </div>
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Estado:</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="in-progress">En Progreso</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Controles de vista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isKanbanView && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandAll(!expandAll)}
              className="flex items-center gap-2"
            >
              {expandAll ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              {expandAll ? "Colapsar todas" : "Expandir todas"}
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {filteredTasks.length} de {tasks.length} tarea{tasks.length !== 1 ? 's' : ''}
            {filteredTasks.length !== tasks.length && " (filtradas)"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsKanbanView(!isKanbanView)}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            {isKanbanView ? "Vista lista" : "Vista Kanban"}
          </Button>
          {!isKanbanView && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsTwoColumns(!isTwoColumns)}
                className="flex items-center gap-2"
              >
                {isTwoColumns ? <Columns className="h-4 w-4" /> : <Columns2 className="h-4 w-4" />}
                {isTwoColumns ? "1 columna" : "2 columnas"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompactView(!isCompactView)}
                className="flex items-center gap-2"
              >
                {isCompactView ? <Grid3x3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                {isCompactView ? "Vista detallada" : "Vista compacta"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 px-4 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No se encontraron tareas que coincidan con los filtros.</p>
        </div>
      ) : isKanbanView ? (
        /* Vista Kanban */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna Pendiente */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Pendiente</h3>
              </div>
              <Badge variant="secondary">{kanbanData.pending.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] max-h-[600px] p-3 bg-muted/30 rounded-lg overflow-y-auto">
              {kanbanData.pending.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectId={projectId}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  forceExpanded={false}
                  isCompactView={true}
                  isTwoColumnLayout={false}
                  isKanbanView={true}
                />
              ))}
              {kanbanData.pending.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas pendientes</p>
              )}
            </div>
          </div>

          {/* Columna En Progreso */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleDashed className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">En Progreso</h3>
              </div>
              <Badge variant="secondary">{kanbanData.inProgress.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] max-h-[600px] p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg overflow-y-auto">
              {kanbanData.inProgress.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectId={projectId}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  forceExpanded={false}
                  isCompactView={true}
                  isTwoColumnLayout={false}
                  isKanbanView={true}
                />
              ))}
              {kanbanData.inProgress.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas en progreso</p>
              )}
            </div>
          </div>

          {/* Columna Completada */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-green-500" />
                <h3 className="font-semibold">Completada</h3>
              </div>
              <Badge variant="secondary">{kanbanData.completed.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[200px] max-h-[600px] p-3 bg-green-50 dark:bg-green-950/20 rounded-lg overflow-y-auto">
              {kanbanData.completed.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  projectId={projectId}
                  onEdit={() => onEditTask(task)}
                  onDelete={() => onDeleteTask(task.id)}
                  forceExpanded={false}
                  isCompactView={true}
                  isTwoColumnLayout={false}
                  isKanbanView={true}
                />
              ))}
              {kanbanData.completed.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">No hay tareas completadas</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Vista Lista */
        <div className={`${isTwoColumns ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : `space-y-${isCompactView ? '2' : '4'}`}`}>
          {isTwoColumns ? (
            <>
              {/* Columna 1 */}
              <div className={`space-y-${isCompactView ? '2' : '4'}`}>
                {columnsData.column1.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    projectId={projectId}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                    forceExpanded={expandAll}
                    isCompactView={isCompactView}
                    isTwoColumnLayout={true}
                  />
                ))}
              </div>
              
              {/* Columna 2 */}
              <div className={`space-y-${isCompactView ? '2' : '4'}`}>
                {columnsData.column2.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task}
                    projectId={projectId}
                    onEdit={() => onEditTask(task)}
                    onDelete={() => onDeleteTask(task.id)}
                    forceExpanded={expandAll}
                    isCompactView={isCompactView}
                    isTwoColumnLayout={true}
                  />
                ))}
              </div>
            </>
          ) : (
            /* Vista de una columna */
            filteredTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task}
                projectId={projectId}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                forceExpanded={expandAll}
                isCompactView={isCompactView}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

    