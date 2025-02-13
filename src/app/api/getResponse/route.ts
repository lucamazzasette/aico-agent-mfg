import { NextRequest, NextResponse } from 'next/server';
import { getChatResponse } from 'src/google/vertexai';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }    
    const data = await getChatResponse(prompt);
    
    if (data.candidates && data.candidates.length > 0) {
      return NextResponse.json({
        text: data.candidates[0].content?.parts[0]?.text || '',
        groundingChunks: data.candidates[0].groundingMetadata?.groundingChunks || []
      });
    } else {
      console.error('No candidates found in the streaming response:', data);
      throw new Error('No candidates found in the streaming response');
    }
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
  }
}
