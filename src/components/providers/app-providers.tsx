"use client"

import { AuthProvider } from "@/context/auth-context"
import { ThemeProvider } from "./theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <TooltipProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </TooltipProvider>
        </ThemeProvider>
    )
}
