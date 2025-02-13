import { NextRequest, NextResponse } from 'next/server';
import { userHashedId } from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';
import { HistoryContainer } from '@/utils/cosmos';


export async function POST(req: NextRequest) {
  const userId = await userHashedId();
  
  try {
    const container = await HistoryContainer();
    const body = await req.json();
    
    // Validate the incoming data
    if (!body.input || !body.formattedResult || !Array.isArray(body.groundingChunks)) {
      return NextResponse.json({ success: false, error: 'Invalid data format' }, { status: 400 });
    }

    // Prepare the item to be stored
    const item = {
      id: uuidv4(), // Use UUID as a unique id
      prompt: body.input,
      userId: userId,
      result: body.formattedResult,
      groundingChunks: body.groundingChunks,
      timestamp: new Date().toISOString()
    };

    // Store the item in Cosmos DB
    const { resource: createdItem } = await container.items.create(item);

    console.log('Data stored successfully:', createdItem);

    return NextResponse.json({ success: true, data: createdItem }, { status: 200 });
  } catch (error) {
    console.error('Error storing data:', error);
    let errorMessage = 'Failed to store data';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
