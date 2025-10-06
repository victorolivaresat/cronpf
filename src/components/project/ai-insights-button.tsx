
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BrainCircuit, Loader2 } from "lucide-react";
import { Project, Task } from "@/lib/types";
import { aiProjectInsights, AIProjectInsightsOutput } from "@/ai/flows/ai-project-insights";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AIInsightsButtonProps = {
  project: Project;
};

export function AiInsightsButton({ project }: AIInsightsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<AIProjectInsightsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getInsights = async () => {
    setIsLoading(true);
    setError(null);
    setInsights(null);

    const tasks = project.tasks ? Object.values(project.tasks) : [];
    const existingTasksString = tasks.map(t => 
        `Tarea: ${t.title}, Estado: ${t.status}, Fechas: ${t.startDate} a ${t.endDate}`
    ).join('\n');

    try {
      const result = await aiProjectInsights({
        projectDescription: project.description,
        existingTasks: existingTasksString,
      });
      setInsights(result);
    } catch (e) {
      setError("Error al generar sugerencias de IA. Por favor, inténtalo de nuevo.");
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={getInsights}>
          <BrainCircuit className="w-4 h-4 mr-2" />
          Sugerencias con IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <BrainCircuit className="w-6 h-6 text-primary" />
            Sugerencias de IA para el Proyecto
          </DialogTitle>
          <DialogDescription>
            Aquí hay algunas sugerencias generadas por IA para mejorar tu plan de proyecto para "{project.title}".
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Analizando tu proyecto...</p>
            </div>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {insights && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Tareas Sugeridas</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-md">{insights.suggestedTasks}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Posibles Conflictos de Cronograma</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/50 p-4 rounded-md">{insights.timelineConflicts || "No se detectaron conflictos."}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    