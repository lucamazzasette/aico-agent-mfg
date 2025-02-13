import { NextResponse } from 'next/server';
import { HistoryContainer } from '@/utils/cosmos';

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('itemId');

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }
  console.log('Attempting to delete itemId:', itemId);
  try {
    const container = await HistoryContainer();
    // console.log('Container retrieved:', container.id);

    // First, try to read the item
    try {
      const { resource: result } = await container.item(itemId).delete();
      //console.log('Delete operation result:', result);
      return NextResponse.json({ message: 'Item deleted successfully', result });
    } catch (readError) {
      console.error('Error reading item:', readError);
      if (readError instanceof Error && readError.message.includes('Entity with the specified id does not exist in the system')) {
        return NextResponse.json({ message: 'Item not found in the database' }, { status: 404 });
      }
      throw readError; // Re-throw if it's an unexpected error
    }
  } catch (error) {
    console.error('Error in delete operation:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    let errorMessage = 'Failed to delete item';
    if (error instanceof Error) {
      errorMessage += `: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
