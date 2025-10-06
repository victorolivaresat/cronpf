
"use client";

import { useForm } from "react-hook-form";
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
import { ProjectFormData } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Sparkles, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useState } from "react";
import { enhanceDescription } from "@/ai/flows/enhance-description";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  startDate: z.date({ required_error: "La fecha de inicio es requerida." }),
  endDate: z.date({ required_error: "La fecha de finalización es requerida." }),
  memberEmails: z.string().optional(),
}).refine(data => data.endDate >= data.startDate, {
  message: "La fecha de finalización debe ser posterior a la fecha de inicio.",
  path: ["endDate"],
});

type CreateProjectFormProps = {
  onSubmit: (data: ProjectFormData) => void;
};

export function CreateProjectForm({ onSubmit }: CreateProjectFormProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      memberEmails: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      ...values,
      description: values.description || '',
      startDate: values.startDate.toISOString(),
      endDate: values.endDate.toISOString(),
    });
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título del Proyecto</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Migración CCTV" {...field} />
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
                <Textarea placeholder="Describe brevemente tu proyecto..." {...field} />
              </FormControl>
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
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
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
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
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
                      disabled={(date) => date < (form.getValues("startDate") || new Date(0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <FormField
          control={form.control}
          name="memberEmails"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Añadir Miembros</FormLabel>
              <FormControl>
                <Textarea placeholder="Añade correos de miembros, separados por comas" {...field} />
              </FormControl>
              <FormDescription>
                Deben tener una cuenta ya existente.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Crear Proyecto</Button>
      </form>
    </Form>
  );
}
