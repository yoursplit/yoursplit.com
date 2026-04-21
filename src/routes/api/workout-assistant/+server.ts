import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Groq from 'groq-sdk';
import { workoutFormSchema } from '../../[username]/[routine]/edit/workout-form-schema';
import { z } from 'zod';
import { GROQ_API_KEY } from '$env/static/private';

const groq = new Groq({ apiKey: GROQ_API_KEY });

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { message, currentData } = await request.json();

    const responseSchema = z.object({
      message: z.string().describe("Friendly message to the user that explicitly includes a concise summary of what was changed in the routine."),
      formData: workoutFormSchema
    });
    
    const response = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { 
          role: "system", 
            content: `You are an expert AI fitness coach and personal trainer. The user is editing a workout routine. They will provide their goals, current routine data, and instructions on how to optimize it.
      Your task is to respond with a JSON object representing the update.

      The 'message' must always include a clear "What I changed" summary with specific edits you made (for example: renamed days, added or removed exercises, changed sets/reps, updated notes, adjusted order).

      CRITICAL SCHEDULING RULES:
      1) Respect day count:
      - If the user explicitly asks for N days, return exactly N workout_days.
      - If the user does not ask to change day count, keep the same number of workout_days as the current routine.
      2) Distribute exercises across days:
      - Do not place all exercises in the first day unless the user explicitly asks for a single-day routine.
      - For multi-day routines, spread exercises across multiple days in a balanced way.
      - Avoid empty days when there are enough exercises to populate them.
      3) Preserve structure and IDs:
      - Keep 'id' for existing days/exercises you modify.
      - Omit 'id' for newly created days/exercises.
      - Do not change unrelated fields unless requested.
      4) Validate before finalizing:
      - If workout_days.length > 1 and all exercises ended up in day 1, revise the plan and redistribute.

      Return valid JSON only, with proper objects/arrays (never stringified JSON).` 
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
