'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Wallet,
  TrendingUp,
  Building2,
  Coins,
  ExternalLink,
  ArrowUpRight,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from 'recharts'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useWallet } from '@/lib/wallet-context'

function formatNum(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function formatSol(n: number): string {
  return `${n.toFixed(4)} SOL`
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

const COLORS = ['#9945ff', '#19fb9b', '#14f195', '#7c3aed', '#a78bfa', '#34d399', '#60a5fa']

export default function PortfolioPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const { connected, connect, connecting, publicKey, balance, shortAddress, purchases } = useWallet()

  // ── Derived stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!purchases.length) return null

    const totalInvested = purchases.reduce((s, p) => s + p.totalSol, 0)
    const uniqueProperties = new Set(purchases.map((p) => p.propertyId)).size
    const totalTokens = purchases.reduce((s, p) => s + p.tokens, 0)
    const avgYield =
      purchases.reduce((s, p) => s + p.annualYield * p.totalSol, 0) / totalInvested

    // Monthly return estimate
    const monthlyReturn = purchases.reduce((s, p) => {
      return s + (p.totalSol * (p.annualYield / 100)) / 12
    }, 0)

    return { totalInvested, uniqueProperties, totalTokens, avgYield, monthlyReturn }
  }, [purchases])

  // ── Portfolio allocation by property ────────────────────────────────────
  const allocation = useMemo(() => {
    const map = new Map<string, { name: string; sol: number; tokens: number }>()
    for (const p of purchases) {
      const existing = map.get(p.propertyId)
      if (existing) {
        existing.sol += p.totalSol
        existing.tokens += p.tokens
      } else {
        map.set(p.propertyId, { name: p.propertyName, sol: p.totalSol, tokens: p.tokens })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.sol - a.sol)
  }, [purchases])

  // ── Fake cumulative portfolio value chart ────────────────────────────────
  const growthChart = useMemo(() => {
    if (!stats) return []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const now = new Date()
    return months.slice(0, now.getMonth() + 1).map((m, i) => ({
      month: m,
      value: parseFloat((stats.totalInvested * (1 + (stats.avgYield / 100) * (i / 12))).toFixed(4)),
    }))
  }, [stats])

  // ── Not connected state ──────────────────────────────────────────────────
  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 glow-purple">
              <Wallet className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">My Portfolio</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Connect your Solana wallet to view your property token holdings, transaction history, and portfolio performance.
            </p>
            <button
              onClick={connect}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-purple disabled:opacity-60"
            >
              <Wallet className="w-5 h-5" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Portfolio</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">{publicKey}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {balance !== null && (
                <div className="glass px-4 py-2 rounded-xl border border-border flex items-center gap-2">
                  <Coins className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">{balance.toFixed(4)} SOL</span>
                  <span className="text-xs text-muted-foreground">devnet balance</span>
                </div>
              )}
              <a
                href={`https://solscan.io/account/${publicKey}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-xl glass border border-border text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                Solscan <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">

          {purchases.length === 0 ? (
            /* Empty state */
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">No investments yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Browse our marketplace and invest in your first tokenized property to get started.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-purple"
              >
                Browse Marketplace
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              {/* ── Stats row ────────────────────────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="glass rounded-2xl p-5 border-glow col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Coins className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Total Invested</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatSol(stats!.totalInvested)}</p>
                  <p className="text-xs text-muted-foreground mt-1">across all properties</p>
                </div>

                <div className="glass rounded-2xl p-5 border-glow">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Properties</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stats!.uniqueProperties}</p>
                  <p className="text-xs text-muted-foreground mt-1">unique assets</p>
                </div>

                <div className="glass rounded-2xl p-5 border-glow">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Total Tokens</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatNum(stats!.totalTokens)}</p>
                  <p className="text-xs text-muted-foreground mt-1">SPL tokens held</p>
                </div>

                <div className="glass rounded-2xl p-5 border-glow">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Avg. Yield</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">{stats!.avgYield.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground mt-1">annual return</p>
                </div>

                <div className="glass rounded-2xl p-5 border-glow">
                  <div className="flex items-center gap-2 mb-3">
                    <Activity className="w-4 h-4 text-accent" />
                    <span className="text-xs text-muted-foreground">Est. Monthly</span>
                  </div>
                  <p className="text-2xl font-bold text-accent">{formatSol(stats!.monthlyReturn)}</p>
                  <p className="text-xs text-muted-foreground mt-1">rental income</p>
                </div>
              </div>

              {/* ── Charts row ───────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Portfolio value growth */}
                <div className="lg:col-span-2 glass rounded-2xl p-6 border-glow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-semibold text-foreground">Portfolio Value</h2>
                      <p className="text-xs text-muted-foreground">Projected growth this year</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg bg-accent/10 text-accent font-medium">
                      +{stats!.avgYield.toFixed(1)}% APY
                    </span>
                  </div>
                  {mounted ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={growthChart} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                        <defs>
                          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#9945ff" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#9945ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" tick={{ fill: '#6060a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6060a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v.toFixed(2)}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(153,69,255,0.3)', borderRadius: '8px', color: '#e8e8f0', fontSize: 12 }}
                          formatter={(v: number) => [`${v.toFixed(4)} SOL`, 'Value']}
                        />
                        <Area type="monotone" dataKey="value" stroke="#9945ff" strokeWidth={2} fill="url(#portfolioGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-[180px] bg-secondary/20 animate-pulse rounded-xl" />
                  )}
                </div>

                {/* Allocation pie */}
                <div className="glass rounded-2xl p-6 border-glow">
                  <div className="mb-4">
                    <h2 className="text-base font-semibold text-foreground">Allocation</h2>
                    <p className="text-xs text-muted-foreground">By property</p>
                  </div>
                  <div className="flex justify-center mb-3">
                    {mounted ? (
                      <RechartsPie width={160} height={160}>
                        <Pie
                          data={allocation}
                          dataKey="sol"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                        >
                          {allocation.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                      </RechartsPie>
                    ) : (
                      <div className="w-[160px] h-[160px] rounded-full border-[27px] border-secondary/20 animate-pulse" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {allocation.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-muted-foreground truncate max-w-[120px]">{item.name}</span>
                        </div>
                        <span className="text-foreground font-medium">{item.sol.toFixed(3)} SOL</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Holdings table ───────────────────────────────────────── */}
              <div className="glass rounded-2xl border-glow overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Holdings</h2>
                  <span className="text-xs text-muted-foreground">{allocation.length} properties</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left px-6 py-3 text-xs text-muted-foreground font-medium">Property</th>
                        <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Tokens</th>
                        <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Invested</th>
                        <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Yield</th>
                        <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Est. Monthly</th>
                        <th className="text-right px-6 py-3 text-xs text-muted-foreground font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocation.map((item, i) => {
                        const relatedPurchase = purchases.find((p) => p.propertyId === purchases.find(
                          (pp) => pp.propertyName === item.name
                        )?.propertyId)
                        const yieldPct = relatedPurchase?.annualYield ?? 0
                        const monthly = (item.sol * (yieldPct / 100)) / 12
                        const propertyId = purchases.find((p) => p.propertyName === item.name)?.propertyId

                        return (
                          <tr key={item.name} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                <span className="text-foreground font-medium truncate max-w-[180px]">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-right text-foreground">{formatNum(item.tokens)}</td>
                            <td className="px-4 py-4 text-right text-foreground">{item.sol.toFixed(4)} SOL</td>
                            <td className="px-4 py-4 text-right text-accent font-semibold">{yieldPct}%</td>
                            <td className="px-4 py-4 text-right text-accent">+{monthly.toFixed(4)} SOL</td>
                            <td className="px-6 py-4 text-right">
                              {propertyId && (
                                <Link
                                  href={`/marketplace/${propertyId}`}
                                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                >
                                  View <ArrowUpRight className="w-3 h-3" />
                                </Link>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Transaction history ──────────────────────────────────── */}
              <div className="glass rounded-2xl border-glow overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <h2 className="text-base font-semibold text-foreground">Transaction History</h2>
                  <span className="text-xs text-muted-foreground">{purchases.length} transactions</span>
                </div>
                <div className="divide-y divide-border/50">
                  {purchases.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors">
                      {/* Property thumbnail */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                        <Image src={p.propertyImage} alt={p.propertyName} fill className="object-cover" />
                      </div>

                      {/* Main info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-1.5 py-0.5 rounded bg-accent/10 text-accent font-medium">BUY</span>
                          <span className="text-sm font-medium text-foreground truncate">{p.propertyName}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">{p.propertyLocation}</span>
                          <span className="text-xs text-muted-foreground">{formatNum(p.tokens)} tokens</span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">{p.totalSol.toFixed(4)} SOL</p>
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{timeAgo(p.timestamp)}</span>
                        </div>
                      </div>

                      {/* Solscan link */}
                      <a
                        href={`https://solscan.io/tx/${p.signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 p-2 rounded-lg glass border border-border hover:border-primary/50 transition-colors"
                        title="View on Solscan"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground hover:text-primary transition-colors" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Explore more CTA ─────────────────────────────────────── */}
              <div className="glass rounded-2xl p-6 border-glow flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-foreground">Ready to diversify?</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">Browse more tokenized properties and grow your portfolio.</p>
                </div>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors glow-purple whitespace-nowrap"
                >
                  Browse Marketplace
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
