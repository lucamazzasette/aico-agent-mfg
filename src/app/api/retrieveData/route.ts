import { NextRequest, NextResponse } from 'next/server';
import { HistoryContainer } from '@/utils/cosmos';
import { auth } from '@/app/auth';
import { userHashedId } from '@/utils/helpers';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const itemId = searchParams.get('itemId');

  const container = await HistoryContainer();

  if (!itemId) {
    // Function 1: Return array of objects with id and input fields for the current user
    const userId = await userHashedId();
    const querySpec = {
      query: 'SELECT c.id, c.prompt FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };

    try {
      const { resources } = await container.items.query(querySpec).fetchAll();
      return NextResponse.json(resources);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      return NextResponse.json({ error: 'Error retrieving user data', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
  } else {
    // Function 2: Get the whole item using the item id
    process.stdout.write(`itemId: ${itemId}\n`);
    try {
      const { resource } = await container.item(itemId).read();
      if (!resource) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      return NextResponse.json(resource);
    } catch (error) {
      console.error('Error retrieving item:', error);
      return NextResponse.json({ error: 'Error retrieving item', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
  }
}
