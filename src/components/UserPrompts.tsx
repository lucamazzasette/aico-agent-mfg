import { MessageCircle, Loader, Trash2 } from "lucide-react";
import { useAppContext } from "../context/context";
import { useState } from "react";
import Link from "next/link";


export interface PromptProps {
  id: string; 
  prompt: string
}


export const PromptList: React.FC<{ prompts: PromptProps[], setPrompts: React.Dispatch<React.SetStateAction<PromptProps[]>> }> = ({ prompts, setPrompts }) => {
  const { setError, setRecentPrompt, setResult, setShowResult, setGroundingChunks } = useAppContext();
  const [loading, setLoading] = useState<string | null>(null);
  const displayPrompts = prompts.slice(0, 6);

  console.log("Received prompts:", prompts);
  
  // Check for duplicate IDs
  // const idSet = new Set();
  // prompts.forEach((prompt, index) => {
  //   if (idSet.has(prompt.id)) {
  //     console.error(`Duplicate ID found: ${prompt.id} at index ${index}`);
  //   } else {
  //     idSet.add(prompt.id);
  //   }
  // });

  // // Check for undefined or null IDs
  // prompts.forEach((prompt, index) => {
  //   if (!prompt.id) {
  //     console.error(`Prompt at index ${index} has no ID:`, prompt);
  //   }
  // });

  const handleDelete = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(`/api/deleteData?itemId=${itemId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.status === 404) {
        console.log(data.message);
        // Item not found, remove it from the UI
        setPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== itemId));
        return;
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete data');
      }
      
      console.log('Delete response:', data);
      // Update the prompts list after successful deletion
      setPrompts(prevPrompts => prevPrompts.filter(prompt => prompt.id !== itemId));
    } catch (error) {
      console.error("Error deleting data from Cosmos DB:", error);
      setError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleClick = async (itemId: string) => {
    setLoading(itemId);
    setError("");
    try {
      const response = await fetch(`/api/retrieveData?itemId=${itemId}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve data');
      }
      const data = await response.json();
      console.log("Retrieved data:", data);

      // const formattedResult = formatResultText(data.text);
      // console.log("chunks:", data.groundingChunks);
      setShowResult(true);
      setRecentPrompt(data.prompt);
      setResult(data.result);
      setGroundingChunks(data.groundingChunks);

      // setRecentPrompts(data);
    } catch (error) {
      console.error("Error retrieving data from Cosmos DB:", error);
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="dark:text-white">
      {displayPrompts.map((prompt, index) => (
        <div 
          key={prompt.id || index} 
          className="flex items-start gap-2 cursor-pointer px-2 py-1 rounded-sm hover:bg-gray-300 dark:hover:bg-gray-700"
          onClick={() => handleClick(prompt.id)}
        >
            {loading === prompt.id ? <Loader size={20} className="animate-spin" /> : <MessageCircle size={12} className="flex-shrink-0"/>}
            <p>{prompt.prompt?.substring(0, 12) + (prompt.prompt?.length > 12 ? "..." : "")}</p>
            <Trash2 size={16} className="flex-shrink-0" onClick={(e) => handleDelete(prompt.id, e)} />
        </div>
      ))}
      {prompts.length > 6 && (
        <Link href="/storicprompts" className="text-blue-500 hover:underline mt-2 block">
          More items
        </Link>
      )}
    </div>
  );
};
