import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { translations } from './translations'

export type Language = 'en' | 'vi'

type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language')
    return (saved === 'en' || saved === 'vi') ? saved : 'vi'
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  // Simple nested lookup helper
  const t = (key: string): string => {
    const keys = key.split('.')
    let current: any = translations[language]

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k]
      } else {
        // Fallback to English if translation is missing in current language
        let enCurrent: any = translations['en']
        for (const enK of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enK in enCurrent) {
            enCurrent = enCurrent[enK]
          } else {
            enCurrent = null
            break
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : key
      }
    }

    return typeof current === 'string' ? current : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
