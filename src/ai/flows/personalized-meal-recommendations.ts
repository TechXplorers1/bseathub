'use server';
/**
 * @fileOverview This file defines a Genkit flow for providing personalized meal recommendations based on user history and preferences.
 *
 * - personalizedMealRecommendations - A function that returns personalized meal recommendations.
 * - PersonalizedMealRecommendationsInput - The input type for the personalizedMealRecommendations function.
 * - PersonalizedMealRecommendationsOutput - The return type for the personalizedMealRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedMealRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate recommendations.'),
  orderHistory: z.string().describe('A stringified JSON array containing the user order history.'),
  preferences: z.string().describe('A stringified JSON object containing the user preferences.'),
});
export type PersonalizedMealRecommendationsInput = z.infer<
  typeof PersonalizedMealRecommendationsInputSchema
>;

const PersonalizedMealRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of meal recommendations for the user.'),
});
export type PersonalizedMealRecommendationsOutput = z.infer<
  typeof PersonalizedMealRecommendationsOutputSchema
>;

export async function personalizedMealRecommendations(
  input: PersonalizedMealRecommendationsInput
): Promise<PersonalizedMealRecommendationsOutput> {
  return personalizedMealRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedMealRecommendationsPrompt',
  input: {schema: PersonalizedMealRecommendationsInputSchema},
  output: {schema: PersonalizedMealRecommendationsOutputSchema},
  prompt: `You are a personalized meal recommendation expert. Given a user's order history and preferences, you will provide a list of meal recommendations.

  User ID: {{{userId}}}
  Order History: {{{orderHistory}}}
  Preferences: {{{preferences}}}

  Based on this information, what meals would you recommend to the user? Respond with an array of strings.`,
});

const personalizedMealRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedMealRecommendationsFlow',
    inputSchema: PersonalizedMealRecommendationsInputSchema,
    outputSchema: PersonalizedMealRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
