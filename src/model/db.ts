import { GroundingChunk } from "@/app/groundingChunksHandler";
  
export interface SearchResult {
    partitionKey: string;
    id: string;
    userId: string;
    userInput: string;
    searchResult: string;
    groundingChunks: GroundingChunk[];
}