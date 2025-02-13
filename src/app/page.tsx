"use client"

import { useSession } from "next-auth/react"
import Main from "@/components/Main"
import Sidebar from "@/components/Sidebar"
import { redirect } from "next/navigation"

export default function Home() {
  const { status } = useSession()

  if (status === "loading") {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (status === "unauthenticated") {
    redirect('/login');
  }

  return (
    <div className="flex">
      <Sidebar />
      <Main />
    </div>
  )
}
