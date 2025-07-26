import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      model: google('gemini-2.0-flash'),
      // model: google('gemini-2.5-flash-preview-05-20'),
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates recipes based on user input. For each recipe, provide the ingredients, instructions, and a placeholder for an image (e.g., [IMAGE: pasta carbonara]).',
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
