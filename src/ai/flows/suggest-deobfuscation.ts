// src/ai/flows/suggest-deobfuscation.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for suggesting deobfuscation steps for Python code.
 *
 * - suggestDeobfuscationSteps - A function that takes obfuscated Python code and suggests deobfuscation steps.
 * - SuggestDeobfuscationStepsInput - The input type for the suggestDeobfuscationSteps function.
 * - SuggestDeobfuscationStepsOutput - The return type for the suggestDeobfuscationSteps function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestDeobfuscationStepsInputSchema = z.object({
  obfuscatedCode: z.string().describe('The obfuscated Python code to deobfuscate.'),
});
export type SuggestDeobfuscationStepsInput = z.infer<typeof SuggestDeobfuscationStepsInputSchema>;

const SuggestDeobfuscationStepsOutputSchema = z.object({
  suggestedSteps: z.array(z.string()).describe('An array of suggested deobfuscation steps.'),
});
export type SuggestDeobfuscationStepsOutput = z.infer<typeof SuggestDeobfuscationStepsOutputSchema>;

export async function suggestDeobfuscationSteps(
  input: SuggestDeobfuscationStepsInput
): Promise<SuggestDeobfuscationStepsOutput> {
  return suggestDeobfuscationStepsFlow(input);
}

const suggestDeobfuscationStepsPrompt = ai.definePrompt({
  name: 'suggestDeobfuscationStepsPrompt',
  input: {
    schema: z.object({
      obfuscatedCode: z.string().describe('The obfuscated Python code to deobfuscate.'),
    }),
  },
  output: {
    schema: z.object({
      suggestedSteps: z.array(z.string()).describe('An array of suggested deobfuscation steps.'),
    }),
  },
  prompt: `You are an AI expert in deobfuscating Python code.  Based on the following obfuscated Python code, suggest a series of deobfuscation steps that a developer could take to understand and clean the code.

Obfuscated Code:
{{{obfuscatedCode}}}

Deobfuscation Steps:`,
});

const suggestDeobfuscationStepsFlow = ai.defineFlow<
  typeof SuggestDeobfuscationStepsInputSchema,
  typeof SuggestDeobfuscationStepsOutputSchema
>({
  name: 'suggestDeobfuscationStepsFlow',
  inputSchema: SuggestDeobfuscationStepsInputSchema,
  outputSchema: SuggestDeobfuscationStepsOutputSchema,
},
async input => {
  const {output} = await suggestDeobfuscationStepsPrompt(input);
  return output!;
});
