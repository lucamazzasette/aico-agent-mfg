"use client";

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/context';
import Link from 'next/link';
import GroundingChunksList from '@/components/GroundingChunksList';

interface GroundingChunk {
  retrievedContext: {
    uri: string;
    title: string;
    text: string;
  };
}

interface IncomingChunk {
  retrievedContext?: {
    uri?: string;
    title?: string;
    text?: string;
  };
  metadata?: {
    source?: string;
  };
  content?: string;
}

interface PromptContent {
  result: string;
  groundingChunks: GroundingChunk[];
}

interface ApiResponse {
  result: string;
  groundingChunks: IncomingChunk[];
}

export default function StoricPrompts() {
  const { recentPrompts, setRecentPrompts } = useAppContext();
  const [loading, setLoading] = useState(true);
  const [promptContents, setPromptContents] = useState<{ [key: string]: PromptContent }>({});
  const [loadingContents, setLoadingContents] = useState<{ [key: string]: boolean }>({});
  const [visibleContents, setVisibleContents] = useState<{ [key: string]: boolean }>({});

  const togglePromptContent = async (itemId: string) => {
    setVisibleContents(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    
    if (!promptContents[itemId]) {
      setLoadingContents(prev => ({ ...prev, [itemId]: true }));
      try {
        const response = await fetch(`/api/retrieveData?itemId=${itemId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch prompt content');
        }
        const data: ApiResponse = await response.json();
        
        // Transform groundingChunks to match expected structure
        const transformedGroundingChunks = (data.groundingChunks || []).map((chunk) => ({
          retrievedContext: {
            uri: chunk.retrievedContext?.uri || chunk.metadata?.source || '',
            title: chunk.retrievedContext?.title || '',
            text: chunk.retrievedContext?.text || chunk.content || '',
          }
        }));

        setPromptContents(prev => ({ 
          ...prev, 
          [itemId]: { 
            result: data.result || '', 
            groundingChunks: transformedGroundingChunks
          } 
        }));
      } catch (error) {
        console.error('Error fetching prompt content:', error);
      } finally {
        setLoadingContents(prev => ({ ...prev, [itemId]: false }));
      }
    }
  };

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/retrieveData');
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const data = await response.json();
        setRecentPrompts(data);
      } catch (error) {
        console.error('Error fetching prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [setRecentPrompts]);

  const handleDelete = async (itemId: string) => {
    try {
      const response = await fetch(`/api/deleteData?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      setRecentPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== itemId));
    } catch (error) {
      console.error('Error deleting prompt:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Historical Prompts</h1>
      <Link href="/" className="text-blue-500 hover:underline mb-4 block">Back to Home</Link>
      <ul className="space-y-4">
        {recentPrompts.map((prompt) => (
          <li key={prompt.id} className="bg-gray-100 p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">{prompt.prompt}</span>
              <div>
                <button 
                  onClick={() => togglePromptContent(prompt.id)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                >
                  {visibleContents[prompt.id] ? 'Hide Content' : 'Show Content'}
                </button>
                <button 
                  onClick={() => handleDelete(prompt.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
            {loadingContents[prompt.id] && <p>Loading content...</p>}
            {visibleContents[prompt.id] && promptContents[prompt.id] && (
              <div className="mt-2 p-2 bg-white dark:bg-slate-700 rounded">
                <div className="flex flex-col gap-5">
                  <p 
                    className="text-gray-800 dark:text-gray-200" 
                    dangerouslySetInnerHTML={{__html: promptContents[prompt.id].result}}
                  ></p>
                  <GroundingChunksList groundingChunks={promptContents[prompt.id].groundingChunks} />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
