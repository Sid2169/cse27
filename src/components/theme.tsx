'use client';
import { ThemeProvider,useTheme } from 'next-themes';
import { Moon,Sun } from 'lucide-react';
export function Theme({children}:{children:React.ReactNode}){return <ThemeProvider attribute="class" defaultTheme="system" enableSystem>{children}</ThemeProvider>;}
export function ThemeToggle(){const {resolvedTheme,setTheme}=useTheme();return <button className="icon-button" aria-label="Toggle light and dark theme" onClick={()=>setTheme(resolvedTheme==='dark'?'light':'dark')}><Sun size={18} className="sun"/><Moon size={18} className="moon"/></button>;}
