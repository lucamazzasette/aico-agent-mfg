export interface RetrievedContext {
  uri: string;
  title: string;
  text: string;
}

export interface GroundingChunk {
  retrievedContext: RetrievedContext;
}

export interface GroundingMetadata {
  groundingChunks: GroundingChunk[];
}

export interface Candidate {
  groundingMetadata: GroundingMetadata;
}

export interface JsonData {
  candidates: Candidate[];
}

/**
 * Handles the JSON data of groundingChunks
 * @param jsonData - The JSON data containing groundingChunks
 * @returns An array of GroundingChunk objects
 */
export function handleGroundingChunks(jsonData: JsonData): GroundingChunk[] {
  try {
    if (!jsonData.candidates || !jsonData.candidates[0] || !jsonData.candidates[0].groundingMetadata || !jsonData.candidates[0].groundingMetadata.groundingChunks) {
      throw new Error('Invalid JSON structure: groundingChunks not found');
    }

    const groundingChunks: GroundingChunk[] = jsonData.candidates[0].groundingMetadata.groundingChunks;

    // Validate the structure of each groundingChunk
    groundingChunks.forEach((chunk, index) => {
      if (!chunk.retrievedContext || typeof chunk.retrievedContext.uri !== 'string' || typeof chunk.retrievedContext.title !== 'string' || typeof chunk.retrievedContext.text !== 'string') {
        throw new Error(`Invalid groundingChunk structure at index ${index}`);
      }
    });

    return groundingChunks;
  } catch (error) {
    console.error('Error handling groundingChunks:', error);
    return [];
  }
}

/**
 * Extracts retrievedContext from groundingChunks
 * @param groundingChunks - An array of GroundingChunk objects
 * @returns An array of RetrievedContext objects
 */
export function extractRetrievedContext(groundingChunks: GroundingChunk[]): RetrievedContext[] {
  return groundingChunks.map(chunk => chunk.retrievedContext);
}

// Example usage:
// import fs from 'fs/promises';
// import path from 'path';
//
// async function example() {
//   try {
//     const rawData = await fs.readFile(path.resolve(__dirname, 'result.json'), 'utf8');
//     const jsonData: JsonData = JSON.parse(rawData);
//     const groundingChunks = handleGroundingChunks(jsonData);
//     const retrievedContexts = extractRetrievedContext(groundingChunks);
//     console.log(retrievedContexts);
//   } catch (error) {
//     console.error('Error in example:', error);
//   }
// }
//
// example();
