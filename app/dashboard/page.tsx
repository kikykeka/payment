'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building2,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ExternalLink,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import {
  mockPortfolio,
  portfolioYieldHistory,
  properties,
  formatSOL,
  formatUSD,
  getFundingProgress,
} from '@/lib/properties'

const SOLANA_PRICE_USD = 180 // mock SOL price

function getPortfolioWithDetails() {
  return mockPortfolio.map((holding) => {
    const property = properties.find((p) => p.id === holding.propertyId)!
    const currentValue = holding.tokensOwned * holding.currentPrice
    const costBasis = holding.tokensOwned * holding.purchasePrice
    const pnl = currentValue - costBasis
    const pnlPercent = ((currentValue - costBasis) / costBasis) * 100
    const monthlyYield = (currentValue * SOLANA_PRICE_USD * (property.annualYield / 100)) / 12
    return { ...holding, property, currentValue, costBasis, pnl, pnlPercent, monthlyYield }
  })
}

const transactions = [
  { type: 'buy', property: 'Manhattan Penthouse', tokens: 40, amount: 16.8, date: '2024-11-03', hash: '5Rk9n...Xw2' },
  { type: 'yield', property: 'Miami Beach Villa', tokens: 0, amount: 0.48, date: '2024-12-01', hash: '3mJpT...Yz8' },
  { type: 'buy', property: 'Dubai Marina Tower', tokens: 8, amount: 6.8, date: '2024-12-10', hash: '7qLeV...Kc4' },
  { type: 'yield', property: 'Manhattan Penthouse', tokens: 0, amount: 0.62, date: '2025-01-01', hash: '9sMxR...Bv6' },
  { type: 'buy', property: 'Marina Bay Residences', tokens: 60, amount: 31.2, date: '2025-01-15', hash: '2wNtU...Qa1' },
  { type: 'yield', property: 'All Properties', tokens: 0, amount: 1.84, date: '2025-02-01', hash: '4yPqS...Dn7' },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const portfolio = getPortfolioWithDetails()
  const totalValue = portfolio.reduce((sum, h) => sum + h.currentValue, 0)
  const totalCost = portfolio.reduce((sum, h) => sum + h.costBasis, 0)
  const totalPnL = totalValue - totalCost
  const totalPnLPercent = ((totalValue - totalCost) / totalCost) * 100
  const monthlyYield = portfolio.reduce((sum, h) => sum + h.monthlyYield, 0)
  const annualYield = monthlyYield * 12

  // Pie chart data (allocation by value)
  const pieData = portfolio.map((h) => ({
    name: h.property.name.split(' ').slice(0, 2).join(' '),
    value: parseFloat((h.currentValue * SOLANA_PRICE_USD).toFixed(0)),
  }))
  const PIE_COLORS = ['#9945ff', '#19fb9b', '#00c2ff', '#ffd700']

  const overviewCards = [
    {
      label: 'Portfolio Value',
      value: formatUSD(totalValue * SOLANA_PRICE_USD),
      sub: `${formatSOL(totalValue)}`,
      icon: Wallet,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total P&L',
      value: `${totalPnL >= 0 ? '+' : ''}${formatUSD(totalPnL * SOLANA_PRICE_USD)}`,
      sub: `${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}% since purchase`,
      icon: totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: totalPnL >= 0 ? 'text-accent' : 'text-destructive',
      bg: totalPnL >= 0 ? 'bg-accent/10' : 'bg-destructive/10',
    },
    {
      label: 'Monthly Yield',
      value: formatUSD(monthlyYield),
      sub: `~${formatUSD(annualYield)} per year`,
      icon: DollarSign,
      color: 'text-chart-3',
      bg: 'bg-chart-3/10',
    },
    {
      label: 'Properties Owned',
      value: String(portfolio.length),
      sub: `${portfolio.reduce((s, h) => s + h.tokensOwned, 0).toLocaleString()} total tokens`,
      icon: Building2,
      color: 'text-chart-5',
      bg: 'bg-chart-5/10',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Welcome back</p>
                <h1 className="text-3xl font-bold text-foreground">Investor Dashboard</h1>
              </div>
              <div className="flex items-center gap-2 glass px-3 py-2 rounded-xl border border-border">
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-mono text-muted-foreground">7xKX...AsU</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* Overview cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card) => {
              const Icon = card.icon
              return (
                <div key={card.label} className="glass rounded-2xl p-5 border-glow">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                  <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                </div>
              )
            })}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Yield history */}
            <div className="lg:col-span-2 glass rounded-2xl p-6 border-glow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-semibold text-foreground">Portfolio Performance</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Monthly earnings (USD)</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-accent">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+29.7% vs. 6mo ago</span>
                </div>
              </div>
              {mounted ? (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={portfolioYieldHistory} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
                    <defs>
                      <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9945ff" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#9945ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill: '#6060a0', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#6060a0', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(153,69,255,0.3)', borderRadius: '8px', color: '#e8e8f0', fontSize: 12 }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monthly Earnings']}
                    />
                    <Area type="monotone" dataKey="value" stroke="#9945ff" strokeWidth={2} fill="url(#portfolioGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-[200px] bg-secondary/20 animate-pulse rounded-xl" />
              )}
            </div>

            {/* Allocation pie */}
            <div className="glass rounded-2xl p-6 border-glow">
              <h2 className="font-semibold text-foreground mb-1">Allocation</h2>
              <p className="text-xs text-muted-foreground mb-4">By property value</p>
              <div className="flex justify-center">
                {mounted ? (
                  <PieChart width={160} height={160}>
                    <Pie
                      data={pieData}
                      cx={75}
                      cy={75}
                      innerRadius={45}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#16161f', border: '1px solid rgba(153,69,255,0.3)', borderRadius: '8px', color: '#e8e8f0', fontSize: 11 }}
                      formatter={(value: number) => [formatUSD(value), '']}
                    />
                  </PieChart>
                ) : (
                  <div className="w-[160px] h-[160px] rounded-full border-[27px] border-secondary/20 animate-pulse" />
                )}
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="text-foreground font-medium">{formatUSD(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Holdings table */}
          <div className="glass rounded-2xl border-glow overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-foreground">My Holdings</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{portfolio.length} properties</p>
              </div>
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                Add property
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['Property', 'Tokens', 'Avg. Price', 'Current', 'Value', 'P&L', 'Yield/mo', ''].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {portfolio.map((holding) => (
                    <tr key={holding.propertyId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={holding.property.image}
                              alt={holding.property.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground whitespace-nowrap">
                              {holding.property.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{holding.property.country}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{holding.tokensOwned.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{formatSOL(holding.purchasePrice)}</td>
                      <td className="px-6 py-4 text-sm text-foreground">{formatSOL(holding.currentPrice)}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-medium">
                        {formatUSD(holding.currentValue * SOLANA_PRICE_USD)}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 text-sm font-medium ${holding.pnl >= 0 ? 'text-accent' : 'text-destructive'}`}>
                          {holding.pnl >= 0 ? (
                            <TrendingUp className="w-3.5 h-3.5" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5" />
                          )}
                          {holding.pnl >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(1)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-accent font-medium">
                        +{formatUSD(holding.monthlyYield)}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/marketplace/${holding.propertyId}`}
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          View
                          <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent transactions */}
          <div className="glass rounded-2xl border-glow overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Transactions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">On-chain activity</p>
            </div>
            <div className="divide-y divide-border/50">
              {transactions.map((tx, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        tx.type === 'buy' ? 'bg-primary/10' : 'bg-accent/10'
                      }`}
                    >
                      {tx.type === 'buy' ? (
                        <Building2 className={`w-4 h-4 text-primary`} />
                      ) : (
                        <DollarSign className={`w-4 h-4 text-accent`} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tx.type === 'buy' ? 'Purchased tokens' : 'Yield received'}
                      </p>
                      <p className="text-xs text-muted-foreground">{tx.property}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${tx.type === 'yield' ? 'text-accent' : 'text-foreground'}`}>
                      {tx.type === 'yield' ? '+' : ''}{formatSOL(tx.amount)}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{tx.date}</span>
                    </div>
                  </div>
                  <a
                    href={`https://solscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-muted-foreground hover:text-primary transition-colors"
                    aria-label="View on Solscan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
