"use client";

import { useState, useEffect } from 'react';

interface GroundingChunk {
  retrievedContext: {
    uri: string;
    title: string;
    text: string;
  };
}

interface Candidate {
  content: {
    parts: { text: string }[];
  };
  groundingMetadata: {
    groundingChunks: GroundingChunk[];
  };
}

interface Data {
  candidates: Candidate[];
}

export default function ResultPage() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/getData');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData: Data = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      }
    }

    loadData();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Racer5 Robot Information</h1>
      {data.candidates && data.candidates.map((candidate, candidateIndex) => (
        <div key={candidateIndex} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Candidate {candidateIndex + 1}</h2>
          <div className="bg-blue-100 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Generated Content</h3>
            <p>{candidate.content.parts[0].text}</p>
          </div>
          <h3 className="text-lg font-semibold mb-2">Grounding Chunks</h3>
          {candidate.groundingMetadata.groundingChunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="bg-gray-100 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Chunk {chunkIndex + 1}</h4>
              <p className="mb-2"><strong>Source:</strong> {chunk.retrievedContext.title}</p>
              <p className="mb-2"><strong>URI:</strong> {chunk.retrievedContext.uri}</p>
              <p><strong>Content:</strong> {chunk.retrievedContext.text}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
