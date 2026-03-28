'use client'

import { useTransition } from 'react'
import { toggleCategoryActive, deleteCategory } from '@/app/actions/categoryActions'
import { Trash2 } from 'lucide-react'

interface Props {
  categoryId: string
  isActive: boolean
}

export default function CategoryActions({ categoryId, isActive }: Props) {
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        disabled={pending}
        onClick={() => startTransition(() => toggleCategoryActive(categoryId, isActive))}
        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
          isActive
            ? 'bg-primary-light text-primary hover:bg-red-100'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
        }`}
      >
        {isActive ? 'Actif' : 'Inactif'}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (confirm('Supprimer cette catégorie ?')) {
            startTransition(() => deleteCategory(categoryId))
          }
        }}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
