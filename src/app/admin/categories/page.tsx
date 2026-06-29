'use client'

import React, { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, Pencil, Plus, Trash2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface CategoryItem {
  id: string
  name: string
  slug: string
  description?: string | null
  image?: string | null
  icon?: string | null
  isActive: boolean
  createdAt?: string
}

export default function AdminCategoriesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }

    fetchCategories()
  }, [status, session, router])

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/categories?includeInactive=true')
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setSlug('')
    setDescription('')
    setIcon('')
    setIsActive(true)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!name.trim()) {
      toast.error('Category name is required')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        id: editingId || undefined,
        name: name.trim(),
        slug: slug.trim() || undefined,
        description: description.trim() || undefined,
        icon: icon.trim() || undefined,
        isActive,
      }

      const response = await fetch('/api/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save category')
      }

      toast.success(editingId ? 'Category updated' : 'Category created')
      resetForm()
      fetchCategories()
    } catch (error) {
      console.error('Failed to save category:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to save category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (category: CategoryItem) => {
    setEditingId(category.id)
    setName(category.name)
    setSlug(category.slug)
    setDescription(category.description || '')
    setIcon(category.icon || '')
    setIsActive(category.isActive)
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this category?')) return

    try {
      const response = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete category')
      }

      toast.success('Category deleted')
      fetchCategories()
    } catch (error) {
      console.error('Failed to delete category:', error)
      toast.error(error instanceof Error ? error.message : 'Unable to delete category')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto flex h-96 max-w-7xl items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/products" className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
            <h1 className="text-3xl font-bold text-foreground">Categories</h1>
            <p className="mt-1 text-muted-foreground">Create, edit, and remove product categories for your store.</p>
          </div>
          <Button variant="outline" onClick={resetForm} className="gap-2">
            <Plus className="h-4 w-4" />
            New Category
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Category Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Fresh Fruits"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Slug</label>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="fresh-fruits"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Icon</label>
                <input
                  value={icon}
                  onChange={(event) => setIcon(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2"
                  placeholder="apple"
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                />
                Active
              </label>
              <div className="flex gap-3">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {editingId ? 'Save Changes' : 'Create Category'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Category List</h2>
                <p className="text-sm text-muted-foreground">{categories.length} total categories</p>
              </div>
            </div>

            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  No categories yet. Create your first one to organize products.
                </div>
              ) : (
                categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between rounded-xl border border-border bg-slate-50 px-4 py-3 dark:bg-slate-800/60">
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${category.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="gap-1">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)} className="gap-1 text-red-600 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
