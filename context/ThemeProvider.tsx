"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface ThemeContextType {
    mode: string;
    setMode: (mode: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode}) {
    const [mode, setMode] = useState('');
    
    const handleThemeChange = () => {
        if(localStorage.theme === 'dark'|| (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setMode('dark');
            document.documentElement.classList.add('dark');
        } else {
            setMode('light');
            document.documentElement.classList.remove('dark');
        }
    }

    useEffect(() => {
      // localStorage und matchMedia gibt es nur im Browser, darum im Effect lesen.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleThemeChange();
    }, [mode])
    
    

    return (
        <ThemeContext.Provider value={{ mode, setMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext);

    if(context === undefined) {
        throw new Error('usetheme must be used within a ThemeProvider')
    }

    return context
}