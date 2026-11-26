import en from '../locales/en/common.json'
import ar from '../locales/ar/common.json'

export type Lang = 'en' | 'ar'
export const locales = { en, ar } as const
export type Dict = typeof en

const KEY = 'lang'

export function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'ar' || saved === 'en') return saved
  } catch {
    /* storage unavailable */
  }
  return 'en'
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    /* storage unavailable */
  }
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

/** Dot-path lookup with fallback to the key itself. */
export function tx(dict: Dict, path: string): string {
  const parts = path.split('.')
  let cur: unknown = dict
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p]
    } else {
      return path
    }
  }
  return typeof cur === 'string' ? cur : path
}
