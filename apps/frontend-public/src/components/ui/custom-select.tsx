import { useState, useRef, useEffect } from "react"
import { ChevronDown, Loader2, Check } from "lucide-react"

export interface SelectOption {
  id?: string | number
  value?: string | number
  name?: string
  label?: string
}

interface CustomSelectProps {
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  disabled?: boolean
  loading?: boolean
  placeholder?: string
  label?: string
  size?: "sm" | "md"
}

export function CustomSelect({ value, options, onChange, disabled, loading, placeholder, label, size = "md" }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedLabel = options.find(opt => String(opt.id || opt.value) === value)?.name ||
                        options.find(opt => String(opt.id || opt.value) === value)?.label ||
                        placeholder

  const heightClass = size === "sm" ? "h-[42px]" : "h-[50px]"
  const textClass = size === "sm" ? "text-sm font-medium" : "text-base font-normal"
  const roundedClass = size === "sm" ? "rounded-lg" : "rounded-xl"
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5"
  const checkSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
  const itemRounded = size === "sm" ? "rounded-md" : "rounded-lg"
  const emptyText = size === "sm" ? "text-xs" : "text-sm"

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-xs md:text-sm font-medium text-general-80 mb-1.5">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full ${heightClass} px-${size === "sm" ? "3" : "4"} py-3 text-left bg-white border ${roundedClass} ${textClass}
          flex items-center justify-between transition-all duration-200
          ${isOpen ? 'border-blue-100 ring-2 ring-blue-100/50' : 'border-general-30 focus:border-blue-100'}
          ${disabled ? 'bg-general-20 text-general-60 cursor-not-allowed' : 'text-general-100 cursor-pointer'}
        `}
      >
        <span className={`truncate block mr-2 ${size === "sm" ? "text-sm" : ""} ${!value ? 'text-general-40' : ''}`}>
          {loading ? "Memuat..." : (value ? selectedLabel : placeholder)}
        </span>
        <div className="text-general-60 shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className={`${iconSize} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />}
        </div>
      </button>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-general-30 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 left-0 right-0">
          <div className="max-h-[200px] overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-general-30 scrollbar-track-transparent">
            {options.length > 0 ? (
              options.map((opt) => {
                const optValue = String(opt.id || opt.value)
                const optLabel = opt.name || opt.label
                const isSelected = optValue === value

                return (
                  <button
                    key={optValue}
                    type="button"
                    onClick={() => {
                      onChange(optValue)
                      setIsOpen(false)
                    }}
                    className={`
                      w-full text-left px-3 py-2 text-sm ${itemRounded} transition-colors flex items-center justify-between
                      ${isSelected ? 'bg-blue-100/10 text-blue-100 font-bold' : 'text-general-80 hover:bg-general-20'}
                    `}
                  >
                    <span className="truncate">{optLabel}</span>
                    {isSelected && <Check className={`${checkSize} shrink-0`} />}
                  </button>
                )
              })
            ) : (
              <div className={`px-4 py-3 ${emptyText} text-general-50 text-center italic`}>
                Tidak ada data
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
