
'use server';
/**
 * @fileOverview Generates a professional application summary for email notifications.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummaryInputSchema = z.object({
  applicationType: z.enum(['personal', 'business']),
  formData: z.any(),
  accountTitle: z.string(),
});
export type SummaryInput = z.infer<typeof SummaryInputSchema>;

const SummaryOutputSchema = z.object({
  subject: z.string().describe('The professional email subject line.'),
  body: z.string().describe('The structured HTML/Text body of the application summary.'),
  adminNotice: z.string().describe('A brief internal note for the compliance team.'),
});
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export async function generateApplicationSummary(input: SummaryInput): Promise<SummaryOutput> {
  return generateApplicationSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateApplicationSummaryPrompt',
  input: {schema: SummaryInputSchema},
  output: {schema: SummaryOutputSchema},
  prompt: `You are a high-level banking compliance assistant. 
Generate a structured, professional application summary for a {{applicationType}} banking request.

Account Product: {{accountTitle}}
Details: 
{{{formData}}}

Format the body as a clean, easy-to-read summary including:
1. Application Reference ID
2. Client/Entity Identification
3. Contact Details
4. Financial/Transaction Profile
5. Legal Attestations Confirmed

The tone should be formal, secure, and precise.`,
});

const generateApplicationSummaryFlow = ai.defineFlow(
  {
    name: 'generateApplicationSummaryFlow',
    inputSchema: SummaryInputSchema,
    outputSchema: SummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
