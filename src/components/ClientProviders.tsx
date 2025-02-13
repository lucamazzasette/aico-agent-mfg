"use client"

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { ContextProvider } from "../context/context"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <SessionProvider>
        <ContextProvider>
          {children}
        </ContextProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
