"use client";

import Image from "next/image";
import { SendHorizontal, Book, Code, NotebookText, User } from "lucide-react";
import { useAppContext } from "../context/context";
import GroundingChunksList from "./GroundingChunksList";
import { useTheme } from "next-themes";
import { useRef } from "react";

export default function Main() {
  const {
    chatWithVertex,
    groundingChunks,
    input,
    setInput,
    recentPrompt,
    loading,
    showResult,
    result,
    error
  } = useAppContext();
  const { theme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex-1 min-h-screen bg-white dark:bg-gray-900 pb-[15vh] relative border-blue-500 dark:border-gray-300">
      <div className="flex items-center justify-between text-2xl bg-white dark:bg-gray-800 border-b-2 border-gray-400 dark:border-gray-300">
        {
          theme === "light" ? (
            <>
            <div className="flex gap-8">
              <Image className="ml-[20%]" src="/aico-agent.png" alt="Logo" width={180} height={90} />
              <p className="text-blue-800 font-bold dark:text-gray-200">LEAN MANAGEMENT</p>
            </div>

            <Image className="mr-[20%]" src="/logo-blue.png" alt="Logo" width={90} height={90} /></>
          ) : (
            <>            
            <div className="flex gap-8">
              <Image className="ml-[20%]" src="/aico-agent-blk.png" alt="Logo" width={180} height={90} />
              <p className="text-blue-800 font-bold dark:text-gray-200">LEAN MANAGEMENT</p>
            </div>
            <Image className="mr-[20%]" src="/logo-white.png" alt="Logo" width={90} height={90} /></>
          )
        }
      </div>
      <div className="max-w-[900px] mx-auto">
        {!showResult ? (
          <>
            <div className="my-12 text-4xl text-gray-400 dark:text-gray-500 font-light p-5">
              {/* <p><span className="bg-gradient-to-r from-blue-500 to-blue-500 bg-clip-text text-transparent">Hello, AICO Agent</span></p> */}
              <p>How can I help you today?</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-5">
              {[
                { name: "Prompt Improvement", icon: NotebookText, text: "Improve the following prompt for me:" },
                { name: "Document Summary Prompt", icon: Book, text: "Summarize the following document:" },
                { name: "Code Suggestion", icon: Code, text: "Write JavaScript code for following requirement:" },
              ].map((item, index) => (
                <div key={index} onClick={() => {setInput(item.text +" "); inputRef.current?.focus()}} className="h-[150px] p-4 bg-gray-200 dark:bg-gray-700 rounded-lg relative cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600">
                  <p className="text-gray-800 dark:text-gray-200">{item.name}</p>
                  <item.icon className="absolute bottom-2 right-2 p-1 dark:bg-gray-300 rounded-full" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-2 max-h-[70vh] overflow-y-auto">
            <div className="my-10 flex items-center justify-end gap-5">
              <p className="text-gray-800 dark:text-gray-200">{recentPrompt}</p>
              <User size={40} className="rounded-full border border-gray-800 dark:border-gray-200" />
            </div>
            <div className="flex items-start gap-5">
              <Image 
                src="/logo-blue.png" 
                className="dark:bg-white dark:rounded-md" 
                alt="Logo" 
                width={48} 
                height={48} 
              />
              {loading ? (
                <div className="w-full flex flex-col gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-2 bg-blue-500 rounded-full animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <p className="text-gray-800 dark:text-gray-200" dangerouslySetInnerHTML={{__html: result}}></p>
                  <GroundingChunksList groundingChunks={groundingChunks} />
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="absolute bottom-0 w-full max-w-[900px] pt-10 mt-5">
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          <div className="flex items-center justify-between gap-5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 p-2 rounded-full">
            <input 
              ref={inputRef}
              onChange={(e) => setInput(e.target.value)} 
              value={input} 
              onKeyDown={(e) => e.key === "Enter" && chatWithVertex()} 
              type="text" 
              placeholder="prompt for lean knowledge search" 
              className="flex-1 bg-transparent border-none outline-none p-2 text-lg text-gray-800 dark:text-gray-200"
            />
            <div>
              <SendHorizontal onClick={() => chatWithVertex()} className="cursor-pointer text-gray-600 dark:text-gray-400" />
            </div>
          </div>
          <p className="text-sm mt-4 text-center text-gray-600 dark:text-gray-400">
            AICO Agent (Lean AI) generated info may be inaccurate. verify before using.
          </p>
        </div>
      </div>
    </div>
  );
}
