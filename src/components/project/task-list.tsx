
import { Task } from "@/lib/types";
import { TaskCard } from "./task-card";

type TaskListProps = {
  tasks: Task[];
  projectId: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
};

export function TaskList({ tasks, projectId, onEditTask, onDeleteTask }: TaskListProps) {
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
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task}
          projectId={projectId}
          onEdit={() => onEditTask(task)}
          onDelete={() => onDeleteTask(task.id)}
        />
      ))}
    </div>
  );
}

    