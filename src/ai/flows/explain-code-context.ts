'use server';

/**
 * @fileOverview Explains the context and purpose of a given code section in plain language.
 *
 * - explainCodeContext - A function that explains the code context.
 * - ExplainCodeContextInput - The input type for the explainCodeContext function.
 * - ExplainCodeContextOutput - The return type for the explainCodeContext function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExplainCodeContextInputSchema = z.object({
  codeSection: z.string().describe('The code section to explain.'),
  programmingLanguage: z.string().describe('The programming language of the code section.'),
  knownContext: z.string().optional().describe('Any known context about the code section.'),
});
export type ExplainCodeContextInput = z.infer<typeof ExplainCodeContextInputSchema>;

const ExplainCodeContextOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code section.'),
});
export type ExplainCodeContextOutput = z.infer<typeof ExplainCodeContextOutputSchema>;

export async function explainCodeContext(input: ExplainCodeContextInput): Promise<ExplainCodeContextOutput> {
  return explainCodeContextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodeContextPrompt',
  input: {
    schema: z.object({
      codeSection: z.string().describe('The code section to explain.'),
      programmingLanguage: z.string().describe('The programming language of the code section.'),
      knownContext: z.string().optional().describe('Any known context about the code section.'),
    }),
  },
  output: {
    schema: z.object({
      explanation: z.string().describe('The explanation of the code section.'),
    }),
  },
  prompt: `You are an expert software developer specializing in reverse engineering and deobfuscating code.

You will be provided a section of code, its programming language, and optionally, some known context.

Your task is to explain the purpose and functionality of the code section in plain, understandable language, even if the code is obfuscated.

Programming Language: {{{programmingLanguage}}}
Code Section:
```{{{programmingLanguage.toLowerCase()}}}
{{{codeSection}}}
```

{{#if knownContext}}
Known Context: {{{knownContext}}}
{{/if}}

Explanation:`, // Ensure the language is lowercase for the code fence
});

const explainCodeContextFlow = ai.defineFlow<
  typeof ExplainCodeContextInputSchema,
  typeof ExplainCodeContextOutputSchema
>(
  {
    name: 'explainCodeContextFlow',
    inputSchema: ExplainCodeContextInputSchema,
    outputSchema: ExplainCodeContextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
