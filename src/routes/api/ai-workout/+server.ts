import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Groq from 'groq-sdk';
import { env } from '$env/dynamic/private';
import { SLUG_REGEX, WORKOUT_DIFFICULTIES, WORKOUT_TYPES } from '$lib/constants';
import { workoutFormSchema } from '../../[username]/[routine]/edit/workout-form-schema';
import { z } from 'zod';

const groq = new Groq({
  apiKey: env.GROQ_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, currentData } = await request.json();

    const responseSchema = z.object({
      message: z.string().describe("Friendly message to the user"),
      formData: workoutFormSchema
    });
    
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
          content: `You are an expert AI fitness coach and personal trainer. The user is editing a workout routine. They will provide their goals, current routine data, and instructions on how to optimize it. 
Your task is to respond with a JSON object representing the update.

Keep the 'id' fields the same for existing days and exercises if you modify them, omit the 'id' if you are adding new ones. Do NOT change the properties that the user has locked or that shouldn't change unless requested.
Ensure all outputs strictly conform to a JSON structure without stringified elements.` 
        },
        {
          role: "user",
          content: `Here is my current workout routine data:\n${JSON.stringify(currentData, null, 2)}\n\nHere is my request/goal: ${message}`
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "workout_update_response",
          strict: false,
          schema: z.toJSONSchema(responseSchema)
        }
      }
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");

    // Repair stringified arrays if the LLM output them as strings instead of objects
    if (result.formData && Array.isArray(result.formData.workout_days)) {
      result.formData.workout_days = result.formData.workout_days.map((day: any) => {
        if (typeof day === "string") {
          try {
            return JSON.parse(day);
          } catch (e) {
            return null;
          }
        }
        return day;
      }).filter((day: any) => day !== null);

      result.formData.workout_days.forEach((day: any) => {
        if (Array.isArray(day.workout_exercises)) {
          day.workout_exercises = day.workout_exercises.map((ex: any) => {
            if (typeof ex === "string") {
              try {
                return JSON.parse(ex);
              } catch (e) {
                return null;
              }
            }
            return ex;
          }).filter((ex: any) => ex !== null);
        }
      });
    }

    return json(result);
  } catch (error) {
    console.error("Error calling Groq API:", error);
    return json({ error: "Failed to generate workout routine" }, { status: 500 });
  }
};
