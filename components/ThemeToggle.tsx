'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('theme')
    if (stored === 'dark') {
      setTheme('dark')
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else if (stored === 'light') {
      setTheme('light')
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    localStorage.setItem('theme', nextTheme)
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')
    }
  }

  if (!mounted) {
    return (
      <button
        className="p-2 border-2 border-black rounded-md shadow-brutal-sm"
        style={{ backgroundColor: 'var(--white)' }}
        aria-label="Toggle theme"
      >
        <span className="text-lg">🌓</span>
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border-2 border-black rounded-md shadow-brutal-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
      style={{ backgroundColor: 'var(--white)' }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
    </button>
  )
}
