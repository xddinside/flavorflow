import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = streamText({
      model: google('gemini-2.0-flash'),
      // model: google('gemini-2.5-flash-preview-05-20'),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful recipe assistant. Based on the following ingredients: [User&apos;s Ingredients], return 3 recipe ideas. Each recipe should be distinct to each other and act as an alternative, but shouldn&apos;t be too niche for it&apos;s image to not show up on a google search. You also don&apos;t have to always use every ingredient mentioned, use ingredients that make sense together. If responding with recipes, respond ONLY with &apos;json&apos; as the first word, then ONLY a valid JSON array of objects. Each object must have the following keys: "recipeName", "description", "ingredients" (as an array of strings), and "steps" (as an array of strings). If replying back in plain text, either due to user not being clear enough or asking a general question, respond with &apos;text&apos; as the first word, then the normal text response. STRICTLY don&apos;t engage in topics that are outside the realm of cooking with the user.,'
        },
        ...messages,
      ],
    });

    return result.toTextStreamResponse();

  } catch (error: any) {
    console.error('🔴 ROOT CAUSE OF ERROR: ', error);

    return NextResponse.json(
      { error: `An error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
