'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, MapPin } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PropertyCard } from '@/components/property-card'
import { properties, type PropertyStatus, type PropertyType } from '@/lib/properties'

const statusFilters: { label: string; value: PropertyStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Live', value: 'active' },
  { label: 'Funded', value: 'funded' },
  { label: 'Coming Soon', value: 'coming_soon' },
]

const countryFilters = ['All Countries', 'USA', 'UAE', 'UK', 'Singapore', 'Japan', 'Spain']

const sortOptions = [
  { label: 'Highest Yield', value: 'yield_desc' },
  { label: 'Lowest Min.', value: 'min_asc' },
  { label: 'Most Funded', value: 'funded_desc' },
  { label: 'Newest', value: 'newest' },
]

export default function MarketplacePage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all')
  const [countryFilter, setCountryFilter] = useState('All Countries')
  const [sort, setSort] = useState('yield_desc')

  const filtered = properties
    .filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchCountry = countryFilter === 'All Countries' || p.country === countryFilter
      return matchSearch && matchStatus && matchCountry
    })
    .sort((a, b) => {
      if (sort === 'yield_desc') return b.annualYield - a.annualYield
      if (sort === 'min_asc') return a.minInvestment - b.minInvestment
      if (sort === 'funded_desc') return b.soldTokens / b.totalTokens - a.soldTokens / a.totalTokens
      return 0
    })

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="pt-16 border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
            <MapPin className="w-4 h-4" />
            <span>7 properties across 6 countries</span>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Property Marketplace</h1>
          <p className="text-muted-foreground">
            Browse tokenized real estate deals. Each property is backed by legal title and managed by professional operators.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex-1 w-full">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Country filter */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
          >
            {countryFilters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === f.value
                  ? 'bg-primary text-white'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-sm text-muted-foreground shrink-0">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">No properties match your filters.</p>
            <button
              onClick={() => { setSearch(''); setStatusFilter('all'); setCountryFilter('All Countries') }}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
