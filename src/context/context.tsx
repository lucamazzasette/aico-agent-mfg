"use client"
import React, { createContext, useState, useContext, ReactNode } from "react";
import { GroundingChunk } from "../app/groundingChunksHandler";
import { useSession } from "next-auth/react";

interface ContextType {
  chatWithVertex: () => Promise<void>;
  response: string;
  setResponse: React.Dispatch<React.SetStateAction<string>>;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  result: string;
  setResult: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  showResult: boolean;
  setShowResult: React.Dispatch<React.SetStateAction<boolean>>;
  recentPrompt: string;
  setRecentPrompt: React.Dispatch<React.SetStateAction<string>>;
  groundingChunks: GroundingChunk[];
  setGroundingChunks: React.Dispatch<React.SetStateAction<GroundingChunk[]>>;
  retrieveStoredData: () => Promise<void>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  recentPrompts: { id: string; prompt: string }[];
  setRecentPrompts: React.Dispatch<React.SetStateAction<{ id: string; prompt: string }[]>>;
}

const Context = createContext<ContextType | undefined>(undefined);

function formatText(text: string): string {
  // Handle bold text
  const boldFormatted = text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>");
  
  // Handle source references as subscripts
  const sourceFormatted = boldFormatted.replace(/\[(.*?)\]/g, "[$1]");
  
  // Handle newline characters, replace multipe <br> with <br></br>into one
  const newlineFormatted = sourceFormatted.replace(/\*/g, "<br>").replace(/\n/g, "<br>").replace(/(<br>\s*){2,}/g, "<br>");
  
  // Handle single asterisks for emphasis (e.g., italic)
  const finalFormatted = newlineFormatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  console.log(finalFormatted);
  return finalFormatted;
}

interface ContextProviderProps {
  children: ReactNode;
}

export function ContextProvider({ children }: ContextProviderProps) 
{
    const [input, setInput] = useState<string>("");
    const [recentPrompt, setRecentPrompt] = useState<string>("");
    const [result, setResult] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [showResult, setShowResult] = useState<boolean>(false);
    const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
    const [error, setError] = useState<string>("");
    const [response, setResponse] = useState<string>("");
    const [recentPrompts, setRecentPrompts] = useState<{ id: string; prompt: string }[]>([]);

    const { status } = useSession();
    // Use effect to retrieve stored data when the component mounts
    React.useEffect(() => {
        if (status === "authenticated"){
            retrieveStoredData();
        }
    }, [status]);


    // Function to store the prompt, result, and grounding chunks in local storage and Cosmos DB
    const storePromptAndResult = async (input: string, formattedResult: string, groundingChunks: GroundingChunk[]) => {
        try {
            const response = await fetch('/api/storeData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ input, formattedResult, groundingChunks }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || response.statusText);
            }

            const responseData = await response.json();
            // console.log('Data successfully stored:', responseData);
            setError(""); // Clear any previous errors

            // Update recentPrompts after successful storage
            const newPrompt = { id: responseData.id, prompt: input };
            setRecentPrompts(prevPrompts => [newPrompt, ...prevPrompts]);
        } catch (error) {
            // console.error("Error storing data in Cosmos DB:", error);
            setError(error instanceof Error ? error.message : String(error));
        }
    };

    // Function to retrieve stored data and set recent prompts
    const retrieveStoredData = async () => {
        try {
            const response = await fetch('/api/retrieveData', {
                method: 'GET',
            });
            if (!response.ok) {
                throw new Error('Failed to retrieve data');
            }
            const data = await response.json();
            // console.log("Retrieved data:", data);
            setRecentPrompts(data);
        } catch (error) {
            // console.error("Error retrieving data from Cosmos DB:", error);
            setError(error instanceof Error ? error.message : String(error));
        }
    };



    const chatWithVertex = async (): Promise<void> => {  
        setResult("");
        setLoading(true);
        setShowResult(true);
        setRecentPrompt(input);

        try {
            const response = await fetch('/api/getResponse', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: input }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate content');
            }
            
            const data = await response.json();
            console.log("data:", data);
            const formattedResult = formatText(data.text);
            await storePromptAndResult(input, formattedResult, data.groundingChunks);
            // console.log("chunks:", data.groundingChunks);
            setResult(formattedResult);
            setGroundingChunks(data.groundingChunks);
        } catch (error) {
            console.error("Error generating content:", error);
            setResult("An error occurred while searching the content. Please try again.");
        } finally {
            setLoading(false);
            setInput("");
        }
    }

    const contextValue: ContextType = {
        chatWithVertex,
        response,
        setResponse,
        input,
        setInput,
        result,
        setResult,
        loading,
        setLoading,
        showResult,
        setShowResult,
        recentPrompt,
        setRecentPrompt,
        groundingChunks,
        setGroundingChunks,
        retrieveStoredData,
        error,
        setError,
        recentPrompts,
        setRecentPrompts,
    }
  
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export function useAppContext(): ContextType {
    const context = useContext(Context);
    if (context === undefined) {
        throw new Error('useAppContext must be used within a ContextProvider');
    }
    return context;
}
