
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Project, Task, TaskStatus } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Circle, CircleCheck, CircleDashed, Loader2, Sparkles, BrainCircuit, UserPlus, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { enhanceDescription } from "@/ai/flows/enhance-description";
import { suggestAssignee } from "@/ai/flows/suggest-assignee";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  status: z.enum(["pending", "in-progress", "completed"]),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  endDate: z.date({ required_error: "La fecha de finalización es requerida." }),
  assignees: z.array(z.string().email("Correo inválido.")).optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "La fecha de finalización debe ser posterior a la fecha de inicio.",
  path: ["endDate"],
});

type TaskFormProps = {
  onSubmit: (data: Omit<Task, 'id' | 'subtasks'>, taskId?: string) => void;
  project: Project;
  task?: Task | null;
};

const statusOptions: { value: TaskStatus; label: string; icon: React.ReactNode }[] = [
    { value: "pending", label: "Pendiente", icon: <Circle className="w-4 h-4 text-muted-foreground" /> },
    { value: "in-progress", label: "En Progreso", icon: <CircleDashed className="w-4 h-4 text-blue-500" /> },
    { value: "completed", label: "Completada", icon: <CircleCheck className="w-4 h-4 text-green-500" /> },
];

export function TaskForm({ onSubmit, project, task }: TaskFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      status: task?.status || "pending",
      startDate: task ? new Date(task.startDate) : new Date(),
      endDate: task ? new Date(task.endDate) : new Date(),
      assignees: task?.assignees || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignees",
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      description: values.description || "",
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
      assignees: values.assignees || [],
    }, task?.id);
  };

  const handleEnhanceDescription = async () => {
    const currentDescription = form.getValues("description");
    if (!currentDescription) {
      toast({
        title: "No hay descripción para mejorar",
        description: "Por favor, escribe una descripción primero.",
        variant: "destructive"
      })
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhanceDescription({ text: currentDescription });
      if (result.enhancedText) {
        form.setValue("description", result.enhancedText, { shouldValidate: true });
        toast({ title: "Descripción mejorada con IA." });
      }
    } catch (e) {
      console.error(e);
      toast({
        title: "Error al mejorar la descripción",
        variant: "destructive"
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSuggestAssignee = async () => {
    const taskDescription = form.getValues("description") || form.getValues("title");
     if (!taskDescription) {
      toast({
        title: "Falta contexto para la sugerencia",
        description: "Añade un título o una descripción a la tarea.",
        variant: "destructive"
      });
      return;
    }

    setIsSuggesting(true);
    try {
        const membersString = Object.values(project.members).map(m => `${m.email} (${m.role})`).join(', ');
        const result = await suggestAssignee({
            projectDescription: project.description,
            taskDescription: taskDescription,
            members: membersString
        });

        if (result.suggestedAssigneeEmail) {
            const email = result.suggestedAssigneeEmail;
            if (!form.getValues("assignees")?.includes(email)) {
                append(email);
                toast({ title: "Asignatario sugerido", description: `${email} ha sido añadido.`});
            } else {
                 toast({ title: "Asignatario ya añadido", description: `${email} ya está en la lista.`});
            }
        }
    } catch (e) {
        console.error(e);
        toast({ title: "Error al sugerir asignatario", variant: "destructive" });
    } finally {
        setIsSuggesting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Tarea</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Diseñar maquetas de la página de inicio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
               <div className="flex items-center justify-between">
                <FormLabel>Descripción</FormLabel>
                <Button variant="ghost" size="icon" type="button" onClick={handleEnhanceDescription} disabled={isEnhancing} className="h-7 w-7">
                  {isEnhancing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-primary" />}
                  <span className="sr-only">Mejorar con IA</span>
                </Button>
              </div>
              <FormControl>
                <Textarea placeholder="Detalles sobre la tarea..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <FormLabel>Asignatarios</FormLabel>
                <Button variant="outline" size="sm" type="button" onClick={handleSuggestAssignee} disabled={isSuggesting}>
                    {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <BrainCircuit className="w-4 h-4 mr-2" />}
                    Sugerir
                </Button>
            </div>
            <div className="space-y-2">
                {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <Input
                            {...form.register(`assignees.${index}` as const)}
                            placeholder="correo@ejemplo.com"
                            className="h-9"
                        />
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={() => append("")}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Añadir Asignatario
                </Button>
            </div>
             <FormMessage>{form.formState.errors.assignees?.message}</FormMessage>
        </div>


        <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {statusOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                        {option.icon}
                                        <span>{option.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => date < new Date(project.startDate) || date > new Date(project.endDate)}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Fin</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Elige una fecha</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date(project.endDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">{task ? 'Guardar Cambios' : 'Crear Tarea'}</Button>
      </form>
    </Form>
  );
}

    