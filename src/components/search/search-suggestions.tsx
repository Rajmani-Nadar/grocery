'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Clock3, Package, Search, X } from 'lucide-react'
import type { Product } from '@/types'

const RECENT_SEARCHES_KEY = 'grocery-recent-searches'
const MAX_RECENT_SEARCHES = 8

interface SearchSuggestionsProps {
  onNavigate?: () => void
  className?: string
}

function Highlight({ value, query }: { value: string; query: string }) {
  if (!query.trim()) return <>{value}</>
  const parts = value.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'))
  return <>{parts.map((part, index) => part.toLowerCase() === query.trim().toLowerCase() ? <mark key={index} className="rounded bg-emerald-100 px-0.5 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">{part}</mark> : part)}</>
}

export function SearchSuggestions({ onNavigate, className = '' }: SearchSuggestionsProps) {
  const router = useRouter()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY)
    if (stored) {
      try { setRecentSearches(JSON.parse(stored)) } catch { window.localStorage.removeItem(RECENT_SEARCHES_KEY) }
    }
    fetch('/api/products?page=1&pageSize=1000&sort=featured')
      .then((response) => response.json())
      .then((data) => setProducts(data.data?.products || []))
      .catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setIsFocused(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [])

  const matches = products.filter((product) => {
    const normalized = query.trim().toLowerCase()
    return normalized && [product.name, product.sku, product.category?.name]
      .filter((value): value is string => typeof value === 'string')
      .some((value) => value.toLowerCase().includes(normalized))
  }).slice(0, 6)

  const saveRecentSearch = (value: string) => {
    const normalized = value.trim()
    if (!normalized) return
    const next = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, MAX_RECENT_SEARCHES)
    setRecentSearches(next)
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  const navigateToSearch = (value: string) => {
    if (!value.trim()) return
    saveRecentSearch(value)
    setQuery('')
    setIsFocused(false)
    setSelectedIndex(-1)
    onNavigate?.()
    router.push(`/products?search=${encodeURIComponent(value.trim())}`)
  }

  const removeRecentSearch = (value: string) => {
    const next = recentSearches.filter((item) => item !== value)
    setRecentSearches(next)
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next))
  }

  const showDropdown = isFocused && (query.trim().length > 0 || recentSearches.length > 0)
  const options: Array<{ name: string }> = query.trim() ? matches : recentSearches.map((value) => ({ name: value }))

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={(event) => { event.preventDefault(); if (selectedIndex >= 0 && options[selectedIndex]) navigateToSearch(options[selectedIndex].name); else navigateToSearch(query) }}>
        <input
          type="search"
          role="combobox"
          aria-label="Search products"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions-list"
          aria-autocomplete="list"
          value={query}
          placeholder="Search products..."
          onFocus={() => setIsFocused(true)}
          onChange={(event) => { setQuery(event.target.value); setSelectedIndex(-1); setIsFocused(true) }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown') { event.preventDefault(); setSelectedIndex((current) => Math.min(current + 1, options.length - 1)) }
            if (event.key === 'ArrowUp') { event.preventDefault(); setSelectedIndex((current) => Math.max(current - 1, -1)) }
            if (event.key === 'Escape') { setIsFocused(false); setSelectedIndex(-1) }
          }}
          className="w-full rounded-lg border border-input bg-background px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900"
        />
        <button type="submit" aria-label="Submit search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800"><Search size={18} className="text-muted-foreground" /></button>
      </form>

      {showDropdown && <div className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(28rem,calc(100vh-8rem))] overflow-y-auto rounded-2xl border border-emerald-100 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-emerald-900/50 dark:bg-slate-900/95" role="presentation">
        {query.trim() ? (matches.length > 0 ? <ul id="search-suggestions-list" role="listbox" aria-label="Product suggestions">{matches.map((product, index) => <li key={product.id} role="option" aria-selected={selectedIndex === index} onMouseDown={() => navigateToSearch(product.name)} className={`flex cursor-pointer items-center gap-3 rounded-xl border-l-2 p-3 transition ${selectedIndex === index ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
          {product.images?.[0] ? <Image src={product.images[0]} alt="" width={44} height={44} className="h-11 w-11 rounded-lg object-cover" /> : <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800"><Package className="h-5 w-5 text-muted-foreground" /></div>}
          <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold"><Highlight value={product.name} query={query} /></span><span className="block truncate text-xs text-muted-foreground"><Highlight value={product.category?.name || 'Grocery'} query={query} /></span></span>
          <span className="shrink-0 text-right"><span className="block text-sm font-semibold">₹{(product.discountPrice || product.price).toFixed(2)}</span><span className={`text-[11px] font-medium ${product.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></span>
        </li>)}</ul> : <EmptyResults onBrowse={() => { setQuery(''); setIsFocused(false); router.push('/products') }} />) : <RecentSearches searches={recentSearches} onSelect={navigateToSearch} onRemove={removeRecentSearch} onClear={() => { setRecentSearches([]); window.localStorage.removeItem(RECENT_SEARCHES_KEY) }} />}
      </div>}
    </div>
  )
}

function RecentSearches({ searches, onSelect, onRemove, onClear }: { searches: string[]; onSelect: (value: string) => void; onRemove: (value: string) => void; onClear: () => void }) {
  return <div><div className="flex items-center justify-between px-2 py-1"><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recent searches</p><button type="button" onMouseDown={(event) => { event.preventDefault(); onClear() }} className="text-xs font-semibold text-emerald-600 hover:underline">Clear All</button></div><ul id="search-suggestions-list" role="listbox">{searches.map((search) => <li key={search} role="option" className="flex items-center gap-2 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800"><button type="button" onMouseDown={() => onSelect(search)} className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"><Clock3 className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{search}</span></button><button type="button" aria-label={`Remove ${search} from recent searches`} onMouseDown={(event) => { event.preventDefault(); onRemove(search) }} className="rounded p-1 text-muted-foreground hover:text-red-500"><X className="h-4 w-4" /></button></li>)}</ul></div>
}

function EmptyResults({ onBrowse }: { onBrowse: () => void }) {
  return <div className="p-5 text-center"><Search className="mx-auto mb-2 h-6 w-6 text-muted-foreground" /><p className="text-sm font-semibold">No products found.</p><button type="button" onMouseDown={(event) => { event.preventDefault(); onBrowse() }} className="mt-1 text-xs font-semibold text-emerald-600 hover:underline">Browse all products</button></div>
}

