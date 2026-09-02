import React, { createContext, useContext, useState, useEffect } from 'react'
import { Sparkles, Zap, Box, Scroll, Palette } from 'lucide-react'

const ThemeContext = createContext(null)

export const THEMES = [
  {
    id: 'minimalist',
    label: 'Minimalist',
    icon: Sparkles,
    badge: 'Clean & Refined',
    color: 'text-slate-700 bg-slate-100 border-slate-300',
    desc: 'Desain bersih, modern, dan elegan dengan kontras lembut',
  },
  {
    id: 'cyberpunk',
    label: 'Neon Cyberpunk',
    icon: Zap,
    badge: 'Futuristic Glow',
    color: 'text-cyan-400 bg-slate-900 border-cyan-500',
    desc: 'Latar gelap pekat dengan pendar neon cyan & electric magenta',
  },
  {
    id: 'neobrutalism',
    label: 'Neo-Brutalism',
    icon: Box,
    badge: 'Bold & Retro-Pop',
    color: 'text-black bg-yellow-300 border-black',
    desc: 'Border tebal hitam tegas, hard drop shadow, dan warna pop',
  },
  {
    id: 'vintage',
    label: 'Vintage Editorial',
    icon: Scroll,
    badge: 'Classic Parchment',
    color: 'text-amber-900 bg-amber-100 border-amber-800',
    desc: 'Nuansa kertas perkamen hangat, terakota, & kayu antik',
  },
]

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('spp_aesthetic_theme')
      if (saved && THEMES.some((t) => t.id === saved)) {
        return saved
      }
    } catch (_) {}
    return 'minimalist'
  })

  useEffect(() => {
    const root = document.documentElement
    // Remove all previous theme classes and dark mode
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`))
    root.classList.remove('dark', 'theme-colorblind')
    // Force remove dark attribute if present
    root.removeAttribute('dark')

    // Add current theme class
    root.classList.add(`theme-${theme}`)

    // If cyberpunk, also add dark for utility fallback
    if (theme === 'cyberpunk') {
      root.classList.add('dark')
    }

    try {
      localStorage.setItem('spp_aesthetic_theme', theme)
    } catch (_) {}
  }, [theme])

  const toggleTheme = (newTheme) => {
    setTheme(newTheme)
  }

  const cycleTheme = () => {
    setTheme((curr) => {
      const idx = THEMES.findIndex((t) => t.id === curr)
      const nextIdx = (idx + 1) % THEMES.length
      return THEMES[nextIdx].id
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: toggleTheme, cycleTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

export function ThemeSwitcherDropdown({ className = '' }) {
  const { theme, setTheme, themes } = useTheme()
  const [open, setOpen] = useState(false)
  const currentThemeObj = themes.find((t) => t.id === theme) || themes[0]
  const CurrentIcon = currentThemeObj.icon

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="focus-ring flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-xs transition hover:bg-slate-50"
        title="Pilih Tema Estetika Portal"
      >
        <CurrentIcon size={15} className="shrink-0 text-navy-700" />
        <span className="hidden sm:inline">Tema: {currentThemeObj.label}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-black/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b border-slate-100 mb-1">
              <Palette size={14} className="text-navy-700" />
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Pilih Estetika UI (4 Tema)
              </p>
            </div>
            <div className="space-y-1">
              {themes.map((t) => {
                const Icon = t.icon
                const isSelected = theme === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id)
                      setOpen(false)
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl p-2.5 text-left text-xs transition ${
                      isSelected
                        ? 'bg-navy-700 text-white font-bold shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${t.color}`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold leading-none">{t.label}</p>
                        {isSelected && (
                          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] mt-1 leading-snug ${isSelected ? 'text-navy-100' : 'text-slate-400'}`}>
                        {t.desc}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
