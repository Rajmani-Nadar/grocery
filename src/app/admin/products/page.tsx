'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Loader2, Edit2, Trash2, Plus, Search, ChevronLeft, ChevronRight, ChevronDown, Tags, Package, Boxes, AlertTriangle, CheckCircle2, X, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product } from '@/types'

interface PaginationInfo {
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [selectedStock, setSelectedStock] = useState<string>('')
  const [sort, setSort] = useState<string>('newest')
  const [showAddMenu, setShowAddMenu] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      return
    }

    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }

    if (session?.user?.role !== 'ADMIN') {
      router.push('/auth/login')
      return
    }

    fetchCategories()
    fetchProducts()
  }, [status, session, router, currentPage, searchQuery, selectedCategory, selectedStatus, selectedStock, sort])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`/api/categories`)
      const data = await response.json()
      setCategories(data.data || [])
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedStock && { stock: selectedStock }),
        sort,
      })
      const response = await fetch(`/api/admin/products?${params}`)
      const data = await response.json()
      setProducts(data.data.products || [])
      setPagination(data.data.pagination)
    } catch (error) {
      console.error('Failed to fetch products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      setProducts(products.filter((p) => p.id !== id))
      toast.success('Product deleted successfully')
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete product:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = () => {
    setCurrentPage(1) // Reset to first page when filtering
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setSelectedStatus('')
    setSelectedStock('')
    setSort('newest')
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalProducts = pagination?.total || 0
  const activeProducts = products.filter((product) => product.isActive).length
  const outOfStock = products.filter((product) => product.stock === 0).length
  const lowStock = products.filter((product) => product.stock > 0 && product.stock <= 10).length

  if (isLoading || status === 'loading') {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)] px-4 py-10 dark:bg-slate-950">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.1),_transparent_30%)] px-3 py-6 sm:px-4 sm:py-10 dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative z-30 isolate mb-8 overflow-visible rounded-[2rem] bg-gradient-to-br from-emerald-700 via-green-600 to-teal-700 p-7 text-white shadow-xl shadow-emerald-900/15 sm:p-9"><div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3"><span className="rounded-2xl bg-white/15 p-3"><Package className="h-6 w-6" /></span><span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Catalog</span></div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Products</h1>
            <p className="mt-2 text-sm text-emerald-50">Manage your product catalog and keep availability clear at a glance.</p>
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Link href="/admin/categories">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                <Tags className="w-4 h-4" />
                Categories
              </Button>
            </Link>
            <div className="relative">
              <Button 
                className="w-full gap-2 !bg-white !text-emerald-700 shadow-lg hover:!bg-emerald-50 hover:!text-emerald-700 sm:w-auto"
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <Plus className="w-4 h-4" />
                Add Product
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {/* Dropdown Menu */}
              {showAddMenu && (
                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border bg-white text-foreground shadow-2xl dark:bg-slate-800">
                  <Link href="/admin/products/new">
                    <button
                      onClick={() => setShowAddMenu(false)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg first:rounded-t-lg"
                    >
                      <p className="font-medium !text-slate-900 dark:!text-slate-100">Single Product</p>
                      <p className="text-sm !text-slate-500 dark:!text-slate-400">Add one product at a time</p>
                    </button>
                  </Link>
                  <Link href="/admin/products/bulk">
                    <button
                      onClick={() => setShowAddMenu(false)}
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg border-t border-border"
                    >
                      <p className="font-medium !text-slate-900 dark:!text-slate-100">Bulk Products</p>
                      <p className="text-sm !text-slate-500 dark:!text-slate-400">Upload multiple products via Excel</p>
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div><span className="absolute right-7 top-7 hidden rounded-full border border-white/20 bg-white/15 px-4 py-2 text-sm font-medium sm:block">{totalProducts} total products</span>
        </div></section>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[{ label: 'Total Products', value: totalProducts, icon: Boxes }, { label: 'Active Products', value: activeProducts, icon: CheckCircle2 }, { label: 'Out of Stock', value: outOfStock, icon: X }, { label: 'Low Stock', value: lowStock, icon: AlertTriangle }].map(({ label, value, icon: Icon }, index) => <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} whileHover={{ y: -4 }} className="rounded-3xl border border-border/70 bg-white/90 p-5 shadow-lg shadow-slate-200/50 backdrop-blur dark:bg-slate-900/90 dark:shadow-black/20"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p></div><Icon className="h-6 w-6 text-emerald-600" /></div></motion.div>)}</div>

        {/* Search Bar */}
        <div className="mb-6"><div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full rounded-full border border-border bg-white py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-3xl border border-border/70 bg-white/85 p-5 shadow-lg shadow-slate-200/40 backdrop-blur dark:bg-slate-900/85 dark:shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Stock Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Stock Level
              </label>
              <select
                value={selectedStock}
                onChange={(e) => {
                  setSelectedStock(e.target.value)
                  handleFilterChange()
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Stock Levels</option>
                <option value="in-stock">In Stock (&gt; 10)</option>
                <option value="low-stock">Low Stock (1-10)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Sort By
              </label>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-3xl border border-border/70 bg-white/90 shadow-xl shadow-slate-200/50 dark:bg-slate-900/90 dark:shadow-black/20">
          {products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="sticky top-0 z-10 border-b border-border bg-slate-50/95 dark:bg-slate-800/95">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">SKU</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Category</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Date Uploaded</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }} className="border-b border-border/70 even:bg-slate-50/50 hover:bg-emerald-50/50 dark:even:bg-slate-800/30 dark:hover:bg-emerald-950/20">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.images && product.images.length > 0 && (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-11 w-11 rounded-xl object-cover shadow-sm transition duration-300 hover:scale-110"
                              />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{product.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">{product.sku}</td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">{(product.category as any)?.name || 'N/A'}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="font-semibold text-foreground">₹{product.price}</p>
                          {product.discountPrice && product.discountPrice < product.price && (
                            <p className="text-sm text-green-600">₹{product.discountPrice}</p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${product.stock === 0 ? 'bg-red-100 text-red-700' : product.stock <= 10 ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {product.isActive ? (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              Active
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {product.createdAt ? new Date(product.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Button variant="outline" size="sm" className="gap-2">
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </Button>
                          </Link>
                          {deleteConfirm === product.id ? (
                            <div className="inline-flex gap-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(product.id)}
                                disabled={isDeleting}
                              >
                                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={isDeleting}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 text-red-600 hover:text-red-600"
                              onClick={() => setDeleteConfirm(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-border bg-slate-50 dark:bg-slate-700/30 space-y-4 md:space-y-0">
                  {/* Pagination Info - Visible on all screens */}
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * 12 + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} products
                  </div>
                  
                  {/* Desktop Pagination - Show numbers + arrows */}
                  <div className="hidden md:flex items-center justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || isLoading}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={isLoading}
                          className="w-10 h-10"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Mobile Pagination - Only Previous/Next arrows */}
                  <div className="md:hidden flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.hasPrevPage || isLoading}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-foreground">Page {currentPage} of {pagination.totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.hasNextPage || isLoading}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'No products match your search' : 'No products found'}
              </p>
              {!searchQuery && (
                <Link href="/admin/products/new">
                  <Button>Create First Product</Button>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">Total Products</p>
            <p className="text-3xl font-bold text-foreground">{pagination?.total || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">Active Products</p>
            <p className="text-3xl font-bold text-green-600">
              {pagination?.total || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
            <p className="text-muted-foreground text-sm mb-1">Low Stock (&lt;5)</p>
            <p className="text-3xl font-bold text-orange-600">
              {products.filter((p) => p.stock < 5 && p.isActive).length}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
