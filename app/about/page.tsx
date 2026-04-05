import Link from 'next/link'
import {
  Shield,
  Zap,
  Globe,
  TrendingUp,
  Lock,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Building2,
  Coins,
  FileText,
  Banknote,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

const timeline = [
  {
    icon: FileText,
    title: 'Property Vetting & Legal Structuring',
    description:
      'Each property undergoes rigorous due diligence: financial audits, legal title verification, and compliance review. An SPV (Special Purpose Vehicle) is created to hold legal title.',
  },
  {
    icon: Coins,
    title: 'Tokenization on Solana',
    description:
      'The SPV issues SPL tokens on Solana representing fractional ownership shares. Token metadata is stored on-chain via Metaplex, with legal docs anchored to IPFS.',
  },
  {
    icon: Globe,
    title: 'Public Offering',
    description:
      'Tokens are listed on the SolEstate marketplace. Investors connect their Solana wallet and purchase tokens directly — no bank account required.',
  },
  {
    icon: Banknote,
    title: 'Rental Income Distribution',
    description:
      'Monthly rental income is collected from tenants, converted to USDC, and distributed pro-rata to all token holders via an on-chain distribution program.',
  },
  {
    icon: TrendingUp,
    title: 'Secondary Market Trading',
    description:
      'Tokens can be freely traded on the SolEstate secondary market or transferred to DEXs. Price discovery happens in real time based on supply and demand.',
  },
]

const comparisons = [
  { feature: 'Minimum investment', traditional: '$250,000+', solEstate: '0.25 SOL (~$45)' },
  { feature: 'Geographic access', traditional: 'Local only, visa required', solEstate: 'Worldwide, wallet only' },
  { feature: 'Liquidity', traditional: 'Months to sell', solEstate: 'Seconds on Solana' },
  { feature: 'Settlement', traditional: '30–90 days', solEstate: '400ms' },
  { feature: 'Transparency', traditional: 'Opaque, broker-led', solEstate: 'Fully on-chain' },
  { feature: 'Operating hours', traditional: '9am–5pm weekdays', solEstate: '24/7/365' },
]

const techStack = [
  { name: 'Solana', description: 'L1 blockchain — 65,000 TPS, $0.00025 avg. fee' },
  { name: 'SPL Tokens', description: 'Solana Program Library — native fungible token standard' },
  { name: 'Metaplex', description: 'On-chain token metadata standard' },
  { name: 'IPFS', description: 'Decentralized storage for legal documents' },
  { name: 'Anchor', description: 'Rust framework for Solana smart contracts' },
  { name: 'Phantom / Solflare', description: 'Browser wallet adapters for user authentication' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* Hero */}
        <section className="border-b border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-primary/30 text-xs font-medium text-primary mb-6">
                Real World Assets on Solana
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
                Democratizing real estate with{' '}
                <span className="text-gradient-primary">blockchain</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                SolEstate bridges the $326 trillion global real estate market with the speed, transparency, and accessibility of the Solana blockchain — letting anyone invest in premium properties with as little as $45.
              </p>
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">The Problem</h2>
              <div className="space-y-4">
                {[
                  'Real estate requires hundreds of thousands in capital — excluding 99% of potential investors',
                  'Properties are illiquid: selling takes months and involves lawyers, agents, and banks',
                  'Geographic restrictions prevent global diversification',
                  'Lack of transparency in rental income and property management',
                  'High intermediary fees eat into returns',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-destructive text-xs font-bold">×</span>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                The <span className="text-gradient-primary">SolEstate</span> Solution
              </h2>
              <div className="space-y-4">
                {[
                  'Start with 0.25 SOL — fractional ownership with no minimums',
                  'SPL tokens settle in 400ms — sell your position in seconds, not months',
                  'Invest in NYC, Dubai, or Tokyo from anywhere in the world',
                  'All rental income, occupancy, and transactions verifiable on-chain',
                  'Smart contracts eliminate brokers — fees are a fraction of traditional costs',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-accent" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* How it works — detailed */}
        <section className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground">How Tokenization Works</h2>
              <p className="text-muted-foreground mt-2">From property to on-chain asset in 5 steps</p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-primary/60 via-primary/30 to-transparent hidden md:block" />

              <div className="space-y-6">
                {timeline.map((step, i) => {
                  const Icon = step.icon
                  return (
                    <div key={step.title} className="flex items-start gap-6">
                      {/* Icon */}
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                          {i + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="glass rounded-2xl p-5 border-glow flex-1">
                        <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">Traditional vs. SolEstate</h2>
            <p className="text-muted-foreground mt-2">Why blockchain wins</p>
          </div>

          <div className="glass rounded-2xl border-glow overflow-hidden">
            <div className="grid grid-cols-3 bg-secondary/50 border-b border-border">
              <div className="px-6 py-3 text-xs font-medium text-muted-foreground">Feature</div>
              <div className="px-6 py-3 text-xs font-medium text-muted-foreground border-l border-border">Traditional RE</div>
              <div className="px-6 py-3 text-xs font-medium text-primary border-l border-border">SolEstate</div>
            </div>
            {comparisons.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 border-b border-border/50 last:border-0 ${i % 2 === 0 ? '' : 'bg-secondary/10'}`}
              >
                <div className="px-6 py-4 text-sm text-foreground">{row.feature}</div>
                <div className="px-6 py-4 text-sm text-muted-foreground border-l border-border/50">{row.traditional}</div>
                <div className="px-6 py-4 text-sm text-accent font-medium border-l border-border/50">{row.solEstate}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech stack */}
        <section className="border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-foreground">Built on Proven Technology</h2>
              <p className="text-muted-foreground mt-2">Solana-native stack for maximum performance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {techStack.map((tech) => (
                <div key={tech.name} className="glass rounded-xl p-5 border-glow flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{tech.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tech.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 pb-8">
          <div className="glass rounded-2xl p-6 border border-yellow-500/20 bg-yellow-500/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-500 mb-1">Demo Disclaimer</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  SolEstate is a demonstration project built on Solana Devnet. No real money, real property, or real tokens are involved. 
                  All properties, yields, and financial data are fictional and for illustrative purposes only. 
                  This is not financial or investment advice.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div
            className="rounded-3xl p-10 md:p-16 text-center"
            style={{ background: 'linear-gradient(135deg, rgba(153,69,255,0.12) 0%, rgba(25,251,155,0.06) 100%)', border: '1px solid rgba(153,69,255,0.2)' }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4 text-balance">
              Ready to invest in tokenized real estate?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
              Browse the marketplace and start building your global property portfolio today.
            </p>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-purple"
            >
              Explore Properties
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
