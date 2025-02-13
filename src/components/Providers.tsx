"use client"

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { ContextProvider } from "../context/context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SessionProvider>
        <ContextProvider>
          {children}
        </ContextProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
