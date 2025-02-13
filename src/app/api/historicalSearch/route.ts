import { NextRequest, NextResponse } from 'next/server';
import { CosmosClient, Container, Database } from '@azure/cosmos'; // Import Container and Database types
import { SearchResult } from '@/model/db';

const endpoint = process.env.COSMOSDB_ENDPOINT;
const key = process.env.COSMOSDB_KEY;
const databaseId = process.env.COSMOSDB_DATABASE_ID || "aicoagents";
const containerId = process.env.COSMOSDB_CONTAINER_ID || "searchResults";

if (!endpoint || !key) {
  throw new Error('COSMOSDB_ENDPOINT and COSMOSDB_KEY must be set in environment variables');
}

const client = new CosmosClient({ endpoint, key });

// Helper function to get or create the container
async function getOrCreateContainer(database: Database, containerId: string): Promise<Container> {
  try {
    const { container } = await database.containers.createIfNotExists({ id: containerId });
    return container;
  } catch (error: unknown) {
    console.error("Error creating container:", error);
    throw error; // Re-throw the error to be handled by the calling function
  }
}

export async function GET(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const database = client.database(databaseId);
    const container = await getOrCreateContainer(database, containerId);

    const id = req.nextUrl.searchParams.get('id');

    if (id) {
      const { resource: result } = await container.item(id, id).read<SearchResult>();
      return NextResponse.json(result);
    } else {
      const { resources: results } = await container.items.readAll<SearchResult>().fetchAll();
      return NextResponse.json(results);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 404 && req.nextUrl.searchParams.get('id')) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }
      console.error("Error in GET:", error.message);
    }
    return NextResponse.json({ error: 'Failed to retrieve data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const database = client.database(databaseId);
    const container = await getOrCreateContainer(database, containerId);

    const newSearchResult: SearchResult = await req.json();
    newSearchResult.partitionKey = newSearchResult.userId;
    const { resource: createdItem } = await container.items.create(newSearchResult);
    return NextResponse.json(createdItem, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in POST:", error.message);
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const database = client.database(databaseId);
    const container = await getOrCreateContainer(database, containerId);

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedSearchResult: SearchResult = await req.json();
    updatedSearchResult.partitionKey = updatedSearchResult.userId;
    const { resource: replacedItem } = await container.item(id, id).replace(updatedSearchResult);
    return NextResponse.json(replacedItem);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in PUT:", error.message);
    }
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest
): Promise<NextResponse> {
  try {
    const database = client.database(databaseId);
    const container = await getOrCreateContainer(database, containerId);

    const id = req.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await container.item(id, id).delete();
    return NextResponse.json({ message: 'Deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in DELETE:", error.message);
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
