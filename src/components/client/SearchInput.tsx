'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'

interface Props {
  defaultValue?: string
}

export default function SearchInput({ defaultValue = '' }: Props) {
  const router = useRouter()
  const [value, setValue] = useState(defaultValue)
  const [, startTransition] = useTransition()
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  const submit = (q: string) => {
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => {
      startTransition(() => {
        router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')
      })
    }, 400)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    submit(e.target.value)
  }

  const clear = () => {
    setValue('')
    if (debounce.current) clearTimeout(debounce.current)
    router.push('/search')
  }

  return (
    <div className="relative">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        autoFocus
        value={value}
        onChange={handleChange}
        placeholder="Boutique, produit..."
        className="w-full bg-gray-100 rounded-xl pl-9 pr-9 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {value && (
        <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X size={15} />
        </button>
      )}
    </div>
  )
}
