"use client";

import { Menu, Plus, MessageCircle, User, LogOut } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { useAppContext } from "@/context/context";
import { PromptList } from "./UserPrompts";
import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

export default function Sidebar() {
  const [extended, setExtended] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { recentPrompts, setRecentPrompts, setShowResult } = useAppContext();
  const { data: session, status } = useSession();


  const ProfileIcon = () => (
    session?.user?.image ? (
      <Image src={session.user.image} alt="User Avatar" width={20} height={20} className="rounded-full" />
    ) : (
      <User size={20} />
    )
  );

  const handleSignOut = async () => {
    await signOut();
  };

  const getSidebarWidth = () => {
    if (isPopoverOpen) return 'w-80';
    if (extended) return 'w-[200px]';
    return 'w-[80px]';
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between bg-white dark:bg-gray-800 p-3 border-r-2 border-gray-400 dark:border-gray-300 transition-all duration-300 ${getSidebarWidth()}`}>
      <div>
        <Menu
          className="block ml-4 cursor-pointer text-gray-600 dark:text-gray-300"
          onClick={() => setExtended(!extended)}
        />
        <div onClick={() => setShowResult(false)} className={`mt-8 inline-flex items-center cursor-pointer gap-2 px-4 py-2 rounded-full text-sm bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors ${extended ? 'w-full' : 'w-auto'}`}>
          <Plus size={20} />
          {extended && <p>New chat</p>}
        </div>
      </div>

      <div className="mt-8">
        <div className={`flex items-start gap-2 cursor-pointer px-4 py-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${extended ? 'w-full' : 'w-auto'}`}>
          <MessageCircle size={20} onClick={() => setExtended(!extended)} />
          {extended && <p>Recent chats</p>}
        </div>
        {extended && (
          <div className="flex items-start gap-2 cursor-pointer px-4 py-2 rounded-full text-gray-800 dark:text-gray-200 transition-colors w-full">
            <PromptList prompts={recentPrompts} setPrompts={setRecentPrompts} />
          </div>
        )}
      </div>
      
      <div className="flex flex-col gap-2">
        {/* {[
          { icon: HelpCircle, label: "Help" },
          { icon: ActivityIcon, label: "Activity" },
          { icon: SettingsIcon, label: "Settings" },
        ].map((item, index) => (
          <div key={index} className={`flex items-start gap-2 cursor-pointer px-4 py-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${extended ? 'w-full' : 'w-auto'}`}>
            <item.icon size={20} />
            {extended && <p>{item.label}</p>}
          </div>
        ))} */}

        <div className={`flex items-start gap-2 cursor-pointer px-4 py-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${extended ? 'w-full' : 'w-auto'}`}>
          <ThemeToggle />
          {extended && <p>Theme</p>}
        </div>

        <Popover onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger className={`flex items-start gap-2 cursor-pointer px-4 py-2 rounded-full text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors ${extended ? 'w-full' : 'w-auto'}`}>
            <ProfileIcon />
            {extended && <p>Profile</p>}
          </PopoverTrigger>
          <PopoverContent 
            className="rounded-md p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg w-64 max-w-[90vw]" 
            sideOffset={5} 
            align="end"
            alignOffset={-5}
          >
            {status === "authenticated" && session?.user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-2  dark:text-gray-400">
                  <ProfileIcon />
                  <p className="font-medium  dark:text-gray-400">{session.user.name}</p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email: {session.user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="mt-2 flex items-center justify-center gap-2 px-2 py-1 text-sm text-white bg-red-600 hover:bg-red-700 rounded transition-colors w-full"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            ) : status === "loading" ? (
              <p>Loading...</p>
            ) : (
              <p>Not signed in</p>
            )}
          </PopoverContent>
        </Popover>
            

      </div>
    </div>
  );
}
