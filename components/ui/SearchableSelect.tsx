"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronUpDownIcon } from "@heroicons/react/24/outline"

const fieldClass =
  "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Search...",
  name,
  required,
  className = "",
}: {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  name?: string
  required?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery("")
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return options
    const q = query.trim().toLowerCase()
    return options.filter((option) => option.toLowerCase().includes(q))
  }, [options, query])

  const handleSelect = (option: string) => {
    onChange(option)
    setOpen(false)
    setQuery("")
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`${fieldClass} flex items-center justify-between gap-2 text-left`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={value ? "text-white" : "text-gray-500"}>
          {value || placeholder}
        </span>
        <ChevronUpDownIcon className="w-5 h-5 text-gray-400 shrink-0" />
      </button>

      {/* Hidden input keeps native form validation (e.g. `required`) working */}
      {name && (
        <input
          type="text"
          name={name}
          value={value}
          required={required}
          onChange={() => {}}
          tabIndex={-1}
          className="sr-only"
          aria-hidden="true"
        />
      )}

      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-white/10 bg-gray-900 shadow-lg overflow-hidden">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search..."
            className="w-full bg-white/5 border-b border-white/10 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none"
          />
          <ul role="listbox" className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-2.5 text-sm text-gray-500">No matches found.</li>
            ) : (
              filtered.map((option) => (
                <li key={option} role="option" aria-selected={option === value}>
                  <button
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-white/10 ${
                      option === value ? "text-orange-400 bg-white/5" : "text-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
