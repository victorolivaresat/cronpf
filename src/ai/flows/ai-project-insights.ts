
'use server';

/**
 * @fileOverview Provides AI-powered insights for project planning.
 *
 * - aiProjectInsights - Analyzes project details and suggests improvements.
 * - AIProjectInsightsInput - The input type for the aiProjectInsights function.
 * - AIProjectInsightsOutput - The return type for the aiProjectInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIProjectInsightsInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('La descripción del proyecto.'),
  existingTasks: z
    .string()
    .describe(
      'Una lista de tareas existentes en el proyecto, como una cadena de texto. Incluye nombre de la tarea, descripción, estado, fechas de inicio/fin y subtareas si aplica.'
    ),
});
export type AIProjectInsightsInput = z.infer<typeof AIProjectInsightsInputSchema>;

const AIProjectInsightsOutputSchema = z.object({
  suggestedTasks: z
    .string()
    .describe('Una lista de tareas sugeridas para mejorar el plan del proyecto.'),
  timelineConflicts: z
    .string()
    .describe(
      'Posibles conflictos de cronograma o problemas en el plan del proyecto.'
    ),
});
export type AIProjectInsightsOutput = z.infer<typeof AIProjectInsightsOutputSchema>;

export async function aiProjectInsights(input: AIProjectInsightsInput): Promise<AIProjectInsightsOutput> {
  return aiProjectInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiProjectInsightsPrompt',
  input: {schema: AIProjectInsightsInputSchema},
  output: {schema: AIProjectInsightsOutputSchema},
  prompt: `Eres un asistente de IA que analiza planes de proyectos y proporciona sugerencias para mejorarlos.

  Analiza la descripción del proyecto y las tareas existentes para identificar posibles vacíos, conflictos o áreas de optimización.

  Descripción del Proyecto: {{{projectDescription}}}
  Tareas Existentes: {{{existingTasks}}}

  Basado en la descripción del proyecto y las tareas existentes, proporciona lo siguiente:

  1.  Tareas Sugeridas: Una lista de tareas adicionales que podrían mejorar el plan del proyecto.
  2.  Conflictos de Cronograma: Cualquier posible conflicto de cronograma o problema en el plan del proyecto.

  Formatea tu respuesta como una lista de tareas sugeridas, seguida de una lista de conflictos de cronograma, si los hay.
  `,
});

const aiProjectInsightsFlow = ai.defineFlow(
  {
    name: 'aiProjectInsightsFlow',
    inputSchema: AIProjectInsightsInputSchema,
    outputSchema: AIProjectInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    