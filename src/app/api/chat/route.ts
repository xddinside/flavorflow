import { streamText } from 'ai';
// 1. Import 'createGoogleGenerativeAI' instead of 'google'
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const apiKeys = [
    process.env.GOOGLE_GENERATIVE_AI_API_KEY_1,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY_2,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY_3,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY_4,
  ].filter(Boolean) as string[];

  if (apiKeys.length === 0) {
    console.error('🔴 No API keys found in environment variables.');
    return NextResponse.json(
      { error: 'API key not configured. Please check your .env file.' },
      { status: 500 }
    );
  }
  console.log(`🔑 Found ${apiKeys.length} API keys. Starting requests...`);

  let lastError: any = null;

  for (const apiKey of apiKeys) {
    try {
      // 2. Create a new Google AI provider instance with the current key
      const google = createGoogleGenerativeAI({
        apiKey: apiKey,
      });

      const result = await streamText({
        // model: google('gemini-1.5-flash-latest'),
        model: google('gemini-1.5-flash-8b-latest'),
        messages: [
          {
            role: 'system',
            content: 'You are a specialized recipe assistant focused exclusively on cooking, recipes, and food-related topics. Your primary function is to generate recipes or provide cooking guidance.\n\nFor Recipe Generation:\nWhen users provide ingredients, generate 3 distinct recipe suggestions that use the provided ingredients sensibly (you don\'t need to use every ingredient), are practical and accessible (avoid overly niche dishes), offer variety in cooking methods, cuisines, or meal types, and have ingredients that are commonly available.\n\nResponse Format Rules:\nFor recipe responses: Start with exactly \'json\' (no code blocks, no backticks), followed by a valid JSON array containing exactly 3 recipe objects. Each recipe object must include: recipeName (clear, descriptive name), description (brief 1-2 sentence description of the dish), ingredients (array of strings), and steps (array of strings).\n\nFor clarification/cooking questions: Start with exactly \'text\', followed by your helpful response about cooking, recipes, or ingredient usage.\n\nTopic Boundaries:\nSTRICTLY limit conversations to: recipe generation and suggestions, cooking techniques and methods, ingredient substitutions and usage, food preparation questions, kitchen equipment related to cooking, and nutritional aspects of cooking/recipes.\n\nWhat to REFUSE:\nPolitely decline and redirect any topics outside cooking/recipes, including general life advice, non-food technology, politics, current events, personal relationships, medical advice (beyond basic nutritional information), and any non-cooking related subjects. When declining off-topic requests, briefly redirect: "I\'m focused on helping with recipes and cooking. Is there a dish you\'d like to make or cooking question I can help with?"\n\nQuality Guidelines:\nKeep recipes practical for home cooking, write detailed beginner-friendly steps that explain techniques and timing, specify quantities and temperatures when important for success, include visual cues for doneness (like "golden brown" or "bubbling"), explain cooking techniques briefly when first mentioned, consider dietary restrictions if mentioned, and ensure ingredient lists match the steps provided. Write each step as if teaching someone who has never cooked before, including details like pan sizes, heat levels, and what to look for during cooking.'
          },
          ...messages,
        ],
      });

      return result.toTextStreamResponse();

    } catch (error: any) {
      lastError = error;

      if (error.status === 429) {
        console.warn(`🟡 API key ending in ...${apiKey.slice(-4)} is exhausted. Trying next key.`);
        continue;
      } else {
        console.error(`🔴 Unrecoverable error with key ...${apiKey.slice(-4)}:`, error.message);
        break;
      }
    }
  }

  console.error('🔴 All API keys have failed. Last error:', lastError?.message);
  return NextResponse.json(
    { error: `All API keys are exhausted or an unexpected error occurred. Last error: ${lastError?.message}` },
    { status: 500 }
  );
}
