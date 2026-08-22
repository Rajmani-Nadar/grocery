'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Loader2, Pencil, Plus, Trash2, ArrowLeft, Grid2X2, Search, CheckCircle2, FolderOpen, X } from 'lucide-react'
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
  const [searchQuery, setSearchQuery] = useState('')

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

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) || category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const activeCategories = categories.filter((category) => category.isActive).length

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
    <main className="admin-categories-layout min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)] px-3 py-6 sm:px-4 sm:py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8">
        <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 p-7 text-white shadow-xl shadow-emerald-900/15 sm:p-9"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/admin/products" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-emerald-100 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to products
            </Link>
            <div className="mb-3 flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><Grid2X2 className="h-6 w-6" /></span><span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Catalog structure</span></div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Categories</h1>
            <p className="mt-2 text-sm text-emerald-50">Create, edit, and remove product categories for your store.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3"><span className="rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium">{categories.length} total categories</span><Button variant="outline" onClick={resetForm} className="gap-2 !border-white/30 !bg-white !text-emerald-700 hover:!bg-emerald-50 hover:!text-emerald-700">
            <Plus className="h-4 w-4" />
            New Category
          </Button></div>
        </div></section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total Categories', value: categories.length, icon: Grid2X2 }, { label: 'Active Categories', value: activeCategories, icon: CheckCircle2 }, { label: 'Products Assigned', value: 'Available in catalog', icon: FolderOpen }, { label: 'Empty Categories', value: categories.filter((category) => !category.description && !category.icon && !category.image).length, icon: X }].map(({ label, value, icon: Icon }, index) => <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="rounded-3xl border border-border/70 bg-white/90 p-5 shadow-lg shadow-slate-200/50 dark:bg-slate-900/90 dark:shadow-black/20"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-xl font-bold tracking-tight text-foreground">{value}</p></div><Icon className="h-6 w-6 text-emerald-600" /></div></motion.div>)}</div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-border/70 bg-white/90 p-4 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6 dark:bg-slate-900/90 dark:shadow-black/20">
            <h2 className="text-xl font-semibold">{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Category Name</label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Fresh Fruits"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Slug</label>
                <input
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="fresh-fruits"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Short description"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Icon</label>
                <input
                  value={icon}
                  onChange={(event) => setIcon(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          <div className="rounded-3xl border border-border/70 bg-white/90 p-4 shadow-xl shadow-slate-200/50 backdrop-blur sm:p-6 dark:bg-slate-900/90 dark:shadow-black/20">
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="relative mb-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search categories" aria-label="Search categories" className="w-full rounded-full border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500" /></div><div>
                <h2 className="text-xl font-semibold">Category List</h2>
                <p className="text-sm text-muted-foreground">{filteredCategories.length} matching categories</p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredCategories.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 p-10 text-center text-sm text-muted-foreground dark:border-emerald-900 dark:bg-emerald-950/20">
                  No categories yet. Create your first one to organize products.
                </div>
              ) : (
                filteredCategories.map((category, index) => (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} whileHover={{ y: -2 }} className="flex flex-col items-start gap-3 rounded-2xl border border-border/70 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between dark:bg-slate-800/60">
                    <div className="min-w-0">
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-sm text-muted-foreground">/{category.slug}</p>
                    </div>
                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
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
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
