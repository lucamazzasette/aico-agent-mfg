import React, { useState } from 'react';
import Image from 'next/image';

interface GroundingChunk {
  retrievedContext: {
    uri: string;
    title: string;
    text: string;
  };
}

interface GroundingChunksListProps {
  groundingChunks: GroundingChunk[];
}

const GroundingChunksList: React.FC<GroundingChunksListProps> = ({ groundingChunks }) => {
  return (
    <div className="dark:text-white">
      <br />
      {groundingChunks.length === 0 ? (
        <h1><strong>No reference doc found</strong></h1>
      ):(
        <>
        <h1><strong>References</strong></h1>
        {groundingChunks.map((chunk, index) => (
          <ChunkItem key={index} chunk={chunk} />
        ))}
        </>
      )
      }
    </div>
  );
};

const ChunkItem: React.FC<{ chunk: GroundingChunk }> = ({ chunk }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const chunkUrl = chunk.retrievedContext.uri.replace('gs://', 'https://storage.cloud.google.com/');

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <a href={chunkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
          <Image src="/file.svg" alt="File" width={24} height={24} />
          <span className="ml-2">{chunk.retrievedContext.title}</span>
        </a>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 h-15 bg-blue-500 text-white rounded-full hover:bg-blue-600"
        >
          {isExpanded ? 'Hide content' : 'Show content'}
        </button>
      </div>
      {isExpanded && (
        <div className="mt-2">
          <p><strong>RetrievedContent:</strong> {chunk.retrievedContext.text}</p>
        </div>
      )}
    </div>
  );
};

export default GroundingChunksList;
