"use client"

import { useSession } from "next-auth/react"
import Image from "next/image";
import { useTheme } from "next-themes";
import { signIn } from "next-auth/react"
import { redirect } from "next/navigation";


export default function Login() {
  const { status } = useSession();
  const { theme } = useTheme();

  if (status === "authenticated") {
    //redirect to home page
    redirect("/");
  }

  return (
    <div className="bg-[url('/comau-robots2.jpg')] bg-cover bg-center min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center align-middle justify-center py-2">
        <div className="h-[200px] w-[300px] mx-auto border bg-white/80 dark:bg-blue-900/80 backdrop-blur-sm rounded-lg shadow-lg">
          <div className="flex flex-col mx-auto p-4 items-center">
            {
              theme === "light" ? (
                <Image src="/logo-blue.png" alt="Logo" width={90} height={90} />
              ) : (
                <Image src="/logo-white.png" alt="Logo" width={90} height={90} />
              )
            }
          </div>
          <div className="flex flex-col items-center justify-center">
            <button 
              onClick={() => signIn("azure-ad")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Sign in with Microsoft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
