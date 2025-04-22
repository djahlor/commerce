"use client"

import {
  ThemeProvider as NextThemesProvider,
  ThemeProviderProps
} from "next-themes"

export const Providers = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <NextThemesProvider {...props} enableColorScheme enableSystem>
      {children}
    </NextThemesProvider>
  )
} 