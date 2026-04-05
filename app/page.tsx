import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Lock,
  BarChart3,
  ChevronRight,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { PropertyCard } from '@/components/property-card'
import { getFeaturedProperties, formatUSD } from '@/lib/properties'

const stats = [
  { label: 'Total Value Locked', value: '$21.4M', sub: 'in tokenized properties' },
  { label: 'Properties Listed', value: '7', sub: 'across 6 countries' },
  { label: 'Avg. Annual Yield', value: '8.3%', sub: 'rental income APY' },
  { label: 'Token Holders', value: '4,200+', sub: 'global investors' },
]

const features = [
  {
    icon: Shield,
    title: 'On-Chain Ownership',
    description:
      'Every property token is an SPL token on Solana. Your ownership is immutable, transparent, and fully verifiable on-chain — no middlemen.',
  },
  {
    icon: Zap,
    title: '400ms Settlement',
    description:
      "Solana's ultra-fast finality means your investment settles in under a second. Buy, sell, or transfer tokens anytime, 24/7.",
  },
  {
    icon: TrendingUp,
    title: 'Dual Returns',
    description:
      'Earn passive rental income distributed monthly and benefit from property appreciation — two revenue streams in a single token.',
  },
  {
    icon: Globe,
    title: 'Global Access',
    description:
      'Invest in premium real estate in NYC, Dubai, London, and more — starting from 0.25 SOL. No passport required.',
  },
  {
    icon: Lock,
    title: 'Audited Smart Contracts',
    description:
      'Property contracts are audited by leading Solana security firms. Funds are held in multi-sig program-owned accounts.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Track your portfolio performance, rental yield history, occupancy rates, and market valuations from your dashboard.',
  },
]

const howItWorks = [
  {
    step: '01',
    title: 'Connect your Solana wallet',
    description: 'Link Phantom, Solflare, or any Solana-compatible wallet in one click.',
  },
  {
    step: '02',
    title: 'Browse & select a property',
    description: 'Explore vetted real estate deals with full financials, yield data, and legal docs.',
  },
  {
    step: '03',
    title: 'Buy property tokens',
    description: 'Purchase SPL tokens representing your fractional ownership share on Solana.',
  },
  {
    step: '04',
    title: 'Earn & trade freely',
    description: 'Receive monthly rental distributions and trade your tokens on the secondary market.',
  },
]

export default function HomePage() {
  const featured = getFeaturedProperties()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-bg.jpg"
            alt="Blockchain network background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        </div>

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-24">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border border-accent/30 text-xs font-medium text-accent mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Powered by Solana Blockchain
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight text-balance mb-6">
              Own Real Estate{' '}
              <span className="text-gradient-primary">Anywhere</span>{' '}
              on Solana
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-8 text-pretty">
              Invest in premium tokenized properties worldwide — from Manhattan penthouses to Dubai towers — starting at 0.25 SOL. Earn rental yield. Trade anytime.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors glow-purple"
              >
                Browse Properties
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border text-foreground font-medium text-base hover:bg-secondary transition-colors"
              >
                How it works
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-6 mt-10">
              {[
                'Solana SPL Tokens',
                'Non-Custodial',
                'SEC Compliant Demo',
                'Audited Contracts',
              ].map((badge) => (
                <div key={badge} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5 text-accent" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {stats.map((stat) => (
              <div key={stat.label} className="md:px-8 first:pl-0 last:pr-0">
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-accent mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Featured Properties</h2>
            <p className="text-muted-foreground mt-1">
              Curated premium real estate, fully tokenized on Solana
            </p>
          </div>
          <Link
            href="/marketplace"
            className="hidden sm:flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            View all properties
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-2">
              Start investing in tokenized real estate in 4 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <div key={step.step} className="relative">
                {/* Connector line */}
                {i < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-primary/40 to-transparent z-0 translate-x-[-50%]" />
                )}
                <div className="glass rounded-2xl p-6 border-glow relative z-10 h-full">
                  <div className="text-4xl font-bold text-gradient-primary mb-4">{step.step}</div>
                  <h3 className="font-semibold text-foreground mb-2 leading-snug">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground">Why SolEstate?</h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Built on Solana for speed, security, and global accessibility
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="glass rounded-2xl p-6 border-glow group card-hover">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div
          className="relative rounded-3xl overflow-hidden p-10 md:p-16 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(153,69,255,0.15) 0%, rgba(25,251,155,0.08) 100%)',
            border: '1px solid rgba(153,69,255,0.25)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
              Ready to own a piece of{' '}
              <span className="text-gradient-primary">global real estate?</span>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Join 4,200+ investors already earning passive income from tokenized properties on Solana.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/marketplace"
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-colors glow-purple"
              >
                Start Investing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-8 py-4 rounded-xl border border-border text-foreground font-medium hover:bg-secondary transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
