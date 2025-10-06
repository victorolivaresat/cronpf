
'use server';

/**
 * @fileOverview Provides AI-powered text enhancement for descriptions.
 *
 * - enhanceDescription - Analyzes text and suggests improvements for clarity and professionalism.
 * - EnhanceDescriptionInput - The input type for the enhanceDescription function.
 * - EnhanceDescriptionOutput - The return type for the enhanceDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceDescriptionInputSchema = z.object({
  text: z.string().describe('El texto a ser mejorado.'),
});
export type EnhanceDescriptionInput = z.infer<typeof EnhanceDescriptionInputSchema>;

const EnhanceDescriptionOutputSchema = z.object({
  enhancedText: z
    .string()
    .describe('La versión mejorada y más profesional del texto.'),
});
export type EnhanceDescriptionOutput = z.infer<typeof EnhanceDescriptionOutputSchema>;

export async function enhanceDescription(input: EnhanceDescriptionInput): Promise<EnhanceDescriptionOutput> {
  return enhanceDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceDescriptionPrompt',
  input: {schema: EnhanceDescriptionInputSchema},
  output: {schema: EnhanceDescriptionOutputSchema},
  prompt: `Eres un experto gestor de proyectos y especialista en comunicaciones. Tu tarea es refinar el siguiente texto para hacerlo más claro, profesional y conciso para un contexto de gestión de proyectos.

  Texto original: {{{text}}}

  Reescribe el texto para que sea más efectivo. Enfócate en la claridad, un lenguaje orientado a la acción y en eliminar la ambigüedad. No añadas ninguna información que no esté presente en el texto original. Devuelve solo el texto mejorado.
  `,
});

const enhanceDescriptionFlow = ai.defineFlow(
  {
    name: 'enhanceDescriptionFlow',
    inputSchema: EnhanceDescriptionInputSchema,
    outputSchema: EnhanceDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    