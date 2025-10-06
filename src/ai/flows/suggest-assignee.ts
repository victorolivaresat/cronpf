
'use server';

/**
 * @fileOverview Provides AI-powered assignee suggestions for tasks.
 *
 * - suggestAssignee - Analyzes project and task details to suggest an assignee.
 * - SuggestAssigneeInput - The input type for the suggestAssignee function.
 * - SuggestAssigneeOutput - The return type for the suggestAssignee function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAssigneeInputSchema = z.object({
  projectDescription: z
    .string()
    .describe('La descripción general del proyecto.'),
  taskDescription: z
    .string()
    .describe('La descripción de la tarea específica que necesita un asignatario.'),
  members: z
    .string()
    .describe(
      'Una lista de miembros del proyecto, sus roles y correos. Formato: "email (rol)".'
    ),
});
export type SuggestAssigneeInput = z.infer<typeof SuggestAssigneeInputSchema>;

const SuggestAssigneeOutputSchema = z.object({
    suggestedAssigneeEmail: z
    .string()
    .describe('El correo electrónico del miembro del equipo más adecuado para esta tarea.'),
});
export type SuggestAssigneeOutput = z.infer<typeof SuggestAssigneeOutputSchema>;

export async function suggestAssignee(input: SuggestAssigneeInput): Promise<SuggestAssigneeOutput> {
  return suggestAssigneeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAssigneePrompt',
  input: {schema: SuggestAssigneeInputSchema},
  output: {schema: SuggestAssigneeOutputSchema},
  prompt: `Eres un director de proyectos experto. Tu tarea es asignar la siguiente tarea al miembro del equipo más adecuado.

  Analiza la descripción del proyecto y de la tarea para entender el contexto y las habilidades requeridas. Luego, revisa la lista de miembros del equipo y sus roles.

  Contexto del Proyecto:
  {{{projectDescription}}}

  Tarea a Asignar:
  {{{taskDescription}}}

  Miembros del Equipo Disponibles:
  {{{members}}}

  Basado en esta información, decide qué miembro del equipo es el más adecuado para completar la tarea. Devuelve únicamente la dirección de correo electrónico del miembro sugerido en el campo 'suggestedAssigneeEmail'.
  `,
});

const suggestAssigneeFlow = ai.defineFlow(
  {
    name: 'suggestAssigneeFlow',
    inputSchema: SuggestAssigneeInputSchema,
    outputSchema: SuggestAssigneeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
