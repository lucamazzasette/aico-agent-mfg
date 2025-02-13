import { CosmosClient, Container } from "@azure/cosmos";

// Read Cosmos DB_NAME and CONTAINER_NAME from .env
const DB_NAME = process.env.COSMOSDB_DATABASE_ID || "chat";
const CONTAINER_NAME = process.env.COSMOSDB_CONTAINER_ID || "history";
const CONFIG_CONTAINER_NAME =
  process.env.AZURE_COSMOSDB_CONFIG_CONTAINER_NAME || "config";

export const CosmosInstance = () => {
  const endpoint = process.env.COSMOSDB_ENDPOINT;
  const key = process.env.COSMOSDB_KEY;

  if (!endpoint || !key) {
    throw new Error(
      "Azure Cosmos DB is not configured. Please configure it in the .env file."
    );
  }

  return new CosmosClient({ endpoint, key });
};

async function ensureDatabaseAndContainer(client: CosmosClient, dbName: string, containerName: string): Promise<Container> {
  const { database } = await client.databases.createIfNotExists({ id: dbName });
  const { container } = await database.containers.createIfNotExists({ id: containerName });
  return container;
}

export const ConfigContainer = async () => {
  const client = CosmosInstance();
  return ensureDatabaseAndContainer(client, DB_NAME, CONFIG_CONTAINER_NAME);
};

export const HistoryContainer = async () => {
  const client = CosmosInstance();
  return ensureDatabaseAndContainer(client, DB_NAME, CONTAINER_NAME);
};
