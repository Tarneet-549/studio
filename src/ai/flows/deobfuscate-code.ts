'use server';

/**
 * @fileOverview This file defines a Genkit flow for deobfuscating Python code.
 *
 * - deobfuscateCode - A function that takes obfuscated Python code and attempts to deobfuscate it.
 * - DeobfuscateCodeInput - The input type for the deobfuscateCode function.
 * - DeobfuscateCodeOutput - The return type for the deobfuscateCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const DeobfuscateCodeInputSchema = z.object({
  obfuscatedCode: z.string().describe('The obfuscated Python code to deobfuscate.'),
});
export type DeobfuscateCodeInput = z.infer<typeof DeobfuscateCodeInputSchema>;

const DeobfuscateCodeOutputSchema = z.object({
  deobfuscatedCode: z.string().describe('The deobfuscated Python code.'),
});
export type DeobfuscateCodeOutput = z.infer<typeof DeobfuscateCodeOutputSchema>;

export async function deobfuscateCode(input: DeobfuscateCodeInput): Promise<DeobfuscateCodeOutput> {
  return deobfuscateCodeFlow(input);
}

const deobfuscateCodePrompt = ai.definePrompt({
  name: 'deobfuscateCodePrompt',
  input: {
    schema: z.object({
      obfuscatedCode: z.string().describe('The obfuscated Python code to deobfuscate.'),
    }),
  },
  output: {
    schema: z.object({
      deobfuscatedCode: z.string().describe('The deobfuscated Python code.'),
    }),
  },
  prompt: `You are an expert AI in deobfuscating Python code.  Based on the following obfuscated Python code, you will deobfuscate it to be human readable. Ensure that the deobfuscated code is fully functional and equivalent to the obfuscated code. You will return only valid and runnable python code.
  You should add comments explaining what the code is doing.

Obfuscated Code:
\`\`\`python
{{{obfuscatedCode}}}
\`\`\`

Deobfuscated Code:
\`\`\`python`,
});

const deobfuscateCodeFlow = ai.defineFlow<
  typeof DeobfuscateCodeInputSchema,
  typeof DeobfuscateCodeOutputSchema
>({
  name: 'deobfuscateCodeFlow',
  inputSchema: DeobfuscateCodeInputSchema,
  outputSchema: DeobfuscateCodeOutputSchema,
},
async input => {
  const {output} = await deobfuscateCodePrompt(input);
  return {
    deobfuscatedCode: output!.deobfuscatedCode + '\`\`\`',
  };
});

