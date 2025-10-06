
"use client";

import { Subtask } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";
import { ref, update, remove } from "firebase/database";
import { db } from "@/lib/firebase";
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";

type SubtaskItemProps = {
  subtask: Subtask;
  taskId: string;
  projectId: string;
};

export function SubtaskItem({ subtask, taskId, projectId }: SubtaskItemProps) {
  const { user } = useAuth();

  const handleToggle = async (checked: boolean) => {
    if (!user) return;
    const subtaskRef = ref(db, `projects/${projectId}/tasks/${taskId}/subtasks/${subtask.id}`);
    await update(subtaskRef, { done: checked });
  };
  
  const handleDelete = async () => {
    if (!user) return;
    const subtaskRef = ref(db, `projects/${projectId}/tasks/${taskId}/subtasks/${subtask.id}`);
    await remove(subtaskRef);
  };

  return (
    <div className="flex items-center gap-2 group bg-secondary/30 hover:bg-secondary/70 p-2 rounded-md">
      <Checkbox
        id={`subtask-${subtask.id}`}
        checked={subtask.done}
        onCheckedChange={handleToggle}
      />
      <label
        htmlFor={`subtask-${subtask.id}`}
        className={`flex-1 text-sm cursor-pointer ${subtask.done ? "line-through text-muted-foreground" : ""}`}
      >
        {subtask.title}
      </label>
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        <span className="sr-only">Eliminar subtarea</span>
      </Button>
    </div>
  );
}

    