"use server";

/**
 * @fileOverview Flow IA para corregir ortografía y gramática de subtareas.
 * - enhanceSubtaskText - Corrige el texto de la subtarea usando IA.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const EnhanceSubtaskInputSchema = z.object({
  text: z.string().describe('Texto de la subtarea a corregir.'),
});
export type EnhanceSubtaskInput = z.infer<typeof EnhanceSubtaskInputSchema>;

const EnhanceSubtaskOutputSchema = z.object({
  corrected: z.string().describe('Texto corregido por IA.'),
});
export type EnhanceSubtaskOutput = z.infer<typeof EnhanceSubtaskOutputSchema>;

export async function enhanceSubtaskText(input: EnhanceSubtaskInput): Promise<EnhanceSubtaskOutput> {
  return enhanceSubtaskTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceSubtaskTextPrompt',
  input: { schema: EnhanceSubtaskInputSchema },
  output: { schema: EnhanceSubtaskOutputSchema },
  prompt: `Corrige el siguiente texto de subtarea como si fuera una oración completa en español: aplica ortografía, tildes, mayúscula inicial y puntuación final. No cambies el significado ni agregues información. Devuelve solo la frase corregida.\n\nTexto: {{{text}}}`,
});

const enhanceSubtaskTextFlow = ai.defineFlow(
  {
    name: 'enhanceSubtaskTextFlow',
    inputSchema: EnhanceSubtaskInputSchema,
    outputSchema: EnhanceSubtaskOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
