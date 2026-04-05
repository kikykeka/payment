import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import {
  Coins,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  BarChart3,
  Link2,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  Bot,
  ExternalLink,
} from 'lucide-react'

export const metadata = {
  title: 'Pitch & Docs — SolEstate',
  description: 'SolEstate tokenomics, architecture, oracle integration, roadmap and disclaimer.',
}

// ── Data ──────────────────────────────────────────────────────────────────────

const tokenomics = [
  { label: 'Primary Market (property tokens)', pct: 70, color: '#9945ff' },
  { label: 'Liquidity Reserve', pct: 10, color: '#19fb9b' },
  { label: 'Team & Development', pct: 10, color: '#4e9af1' },
  { label: 'DAO Treasury', pct: 5, color: '#f1c44e' },
  { label: 'Community Grants', pct: 5, color: '#f14e7a' },
]

const roadmap = [
  {
    phase: 'Phase 1', title: 'Foundation', status: 'complete',
    items: ['SPL token minting per property', 'Primary marketplace', 'Phantom / Solflare wallet connect', 'Investor dashboard', 'Devnet deployment'],
  },
  {
    phase: 'Phase 2', title: 'Secondary Market', status: 'complete',
    items: ['P2P token listings', 'On-chain order book (Serum/OpenBook)', 'Price discovery', 'Real-time volume tracking'],
  },
  {
    phase: 'Phase 3', title: 'Oracle & Proof-of-Asset', status: 'in-progress',
    items: ['Chainlink price feed integration', 'Notarised property valuation NFT', 'Rent escrow smart contract', 'Automatic yield distribution (Anchor)'],
  },
  {
    phase: 'Phase 4', title: 'DAO Governance', status: 'upcoming',
    items: ['SPL governance token (SOLD)', 'Voting on new property listings', 'On-chain treasury management', 'Cross-chain bridge (Wormhole)'],
  },
  {
    phase: 'Phase 5', title: 'Mainnet & Scale', status: 'upcoming',
    items: ['Legal entity per property (SPV)', 'Regulatory compliance (MiCA, SEC Reg D)', 'KYC/AML on-chain (Civic)', 'Mobile app (React Native)'],
  },
]

const techStack = [
  { name: 'Solana', role: 'L1 Blockchain', detail: 'Sub-second finality, 0.00025 $ fees — ideal for micro-investments.' },
  { name: 'Anchor', role: 'Smart Contracts', detail: 'Rust-based framework for secure, auditable on-chain programs.' },
  { name: 'SPL Tokens', role: 'Property Tokens', detail: 'Each property mints a unique SPL token. Divisible to 9 decimals.' },
  { name: 'Chainlink', role: 'Price Oracle', detail: 'Off-chain property valuations posted on-chain for transparent pricing.' },
  { name: 'Metaplex', role: 'NFT Certificates', detail: 'Proof-of-asset NFT attaches legal documentation to the token.' },
  { name: 'OpenBook', role: 'Order Book', detail: 'Decentralised central limit order book for secondary trading.' },
  { name: 'Civic', role: 'KYC / AML', detail: 'On-chain identity verification — no centralised data storage.' },
  { name: 'Next.js 16', role: 'Frontend', detail: 'App Router, React 19, Turbopack for instant HMR.' },
]

const agentSkills = [
  {
    category: 'Frontend',
    tag: 'Frontend',
    color: '#9945ff',
    name: 'Frontend with framework-kit',
    desc: 'Build React and Next.js Solana apps with a single client instance, Wallet Standard-first connection, and minimal client-side footprint.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: true,
    relevance: 'Used for wallet connection and UI in SolEstate',
  },
  {
    category: 'Tokens',
    tag: 'Токены',
    color: '#19fb9b',
    name: 'Confidential Transfers',
    desc: 'Implement private, encrypted token balances on Solana using the Token-2022 confidential transfers extension.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: true,
    relevance: 'Privacy layer for investor token holdings',
  },
  {
    category: 'Payments',
    tag: 'Платежи',
    color: '#14f195',
    name: 'Payments & Commerce',
    desc: 'Build checkout flows, payment buttons, and QR-based payment requests using Commerce Kit and Solana Pay.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: true,
    relevance: 'Token purchase checkout flow in SolEstate',
  },
  {
    category: 'Security',
    tag: 'Безопасность',
    color: '#f1c44e',
    name: 'Security Checklist',
    desc: 'Program and client security checklist covering account validation, signer checks, and common attack vectors.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: true,
    relevance: 'Applied during Anchor smart contract development',
  },
  {
    category: 'DeFi',
    tag: 'DeFi',
    color: '#60a5fa',
    name: 'Jupiter Skill',
    desc: 'AI coding skill for Jupiter covering Ultra swaps, limit orders, DCA, perpetuals, and lending.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: false,
    relevance: 'Secondary market liquidity via Jupiter swaps',
  },
  {
    category: 'Infra',
    tag: 'Инфраструктура',
    color: '#a78bfa',
    name: 'Metaplex Skill',
    desc: 'Official Metaplex development skill covering Core NFTs, Token Metadata, Bubblegum, and Candy Machine.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: false,
    relevance: 'Proof-of-Asset NFT minting for each property',
  },
  {
    category: 'Infra',
    tag: 'Инфраструктура',
    color: '#f14e7a',
    name: 'Pyth Skill',
    desc: 'AI coding skill for Pyth Network oracle covering real-time price feeds with confidence intervals.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: false,
    relevance: 'Real-time SOL/USD price feed for token pricing',
  },
  {
    category: 'Infra',
    tag: 'Инфраструктура',
    color: '#34d399',
    name: 'Helius Skill',
    desc: 'AI coding skill for Helius RPC infrastructure covering DAS API, Enhanced Transactions, and webhooks.',
    url: 'https://github.com/solana-foundation/solana-dev-skill',
    official: false,
    relevance: 'Enhanced transaction parsing for portfolio activity',
  },
]

const oracleFlow = [
  { step: '1', title: 'Property Valuation', desc: 'Licensed appraiser submits valuation report to SolEstate off-chain API.' },
  { step: '2', title: 'Chainlink Node', desc: 'Chainlink DON aggregates the report hash and current market value into a signed data feed.' },
  { step: '3', title: 'On-chain Update', desc: 'Feed is written to an Anchor PDA (Program Derived Address) linked to the property mint.' },
  { step: '4', title: 'Token Repricing', desc: 'Primary market token price updates automatically based on the oracle feed.' },
  { step: '5', title: 'Audit Trail', desc: 'Every valuation update is permanently recorded on Solana — fully transparent to investors.' },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function PitchPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">

        {/* Hero */}
        <section className="border-b border-border bg-card/40">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Documentation & Pitch</p>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Tokenizing Real Estate<br />
              <span className="text-gradient-primary">on Solana</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              SolEstate is a fractional real-estate ownership protocol built on Solana. This document covers our tokenomics, architecture, oracle design, and roadmap.
            </p>

            {/* Quick nav */}
            <div className="flex flex-wrap gap-3 mt-8">
              {['Problem', 'Solution', 'Tokenomics', 'Architecture', 'Oracle', 'Roadmap', 'Skills', 'Team', 'Disclaimer'].map((s) => (
                <a
                  key={s}
                  href={`#${s.toLowerCase()}`}
                  className="px-4 py-1.5 rounded-full border border-border text-xs font-medium text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-20">

          {/* Problem */}
          <section id="problem">
            <SectionLabel>The Problem</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-6">Real estate is the world&apos;s largest asset class — yet it&apos;s inaccessible.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Coins className="w-5 h-5" />, title: 'High Capital Barrier', body: 'Buying even a single apartment in NYC requires $500k+. 95% of retail investors are locked out entirely.' },
                { icon: <Clock className="w-5 h-5" />, title: 'Illiquidity', body: 'Traditional real estate takes months to buy or sell. There is no secondary market for partial ownership.' },
                { icon: <Globe className="w-5 h-5" />, title: 'Geographic Lock-In', body: 'Investing in foreign property requires local legal entities, banks, and lawyers — prohibitive for most.' },
              ].map((c) => (
                <div key={c.title} className="glass rounded-2xl p-6 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
                    {c.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Solution */}
          <section id="solution">
            <SectionLabel>The Solution</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-6">Fractional ownership via SPL tokens on Solana</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: <Coins className="w-5 h-5" />, title: 'Fractional Tokens', body: 'Each property is divided into 10,000–100,000 SPL tokens. Invest from as little as 1 SOL.' },
                { icon: <TrendingUp className="w-5 h-5" />, title: 'Passive Yield', body: 'Rental income is distributed to token holders monthly via on-chain smart contracts.' },
                { icon: <Zap className="w-5 h-5" />, title: '24/7 Liquidity', body: 'Sell your tokens on the secondary market at any time — no lock-up, instant settlement.' },
                { icon: <Shield className="w-5 h-5" />, title: 'Transparent', body: 'Every transaction, valuation update, and yield payment is permanently recorded on Solana.' },
              ].map((c) => (
                <div key={c.title} className="glass rounded-2xl p-6 border border-border">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
                    {c.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tokenomics */}
          <section id="tokenomics">
            <SectionLabel>Tokenomics</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-6">Token allocation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Visual bar */}
              <div className="glass rounded-2xl border border-border p-6 space-y-4">
                <div className="flex h-8 rounded-xl overflow-hidden gap-px">
                  {tokenomics.map((t) => (
                    <div key={t.label} style={{ width: `${t.pct}%`, background: t.color }} title={`${t.label}: ${t.pct}%`} />
                  ))}
                </div>
                {tokenomics.map((t) => (
                  <div key={t.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: t.color }} />
                      <span className="text-muted-foreground">{t.label}</span>
                    </div>
                    <span className="font-semibold text-foreground">{t.pct}%</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              <div className="space-y-5">
                <div className="glass rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-1">Property Tokens (per asset)</h3>
                  <p className="text-sm text-muted-foreground">Each property mints its own SPL token. Supply is fixed at listing time and tied 1:1 to fractional ownership of the underlying SPV (Special Purpose Vehicle).</p>
                </div>
                <div className="glass rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-1">Platform Token: SOLD</h3>
                  <p className="text-sm text-muted-foreground">Future governance token. Used to vote on new property listings, fee parameters, and treasury allocation. Earned by early investors and liquidity providers.</p>
                </div>
                <div className="glass rounded-2xl border border-border p-5">
                  <h3 className="font-semibold text-foreground mb-1">Fee Structure</h3>
                  <p className="text-sm text-muted-foreground">1% primary market fee, 0.3% secondary market taker fee, 0.1% maker fee. Fees flow to the DAO treasury.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Architecture */}
          <section id="architecture">
            <SectionLabel>Architecture</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-6">Technical stack</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {techStack.map((t) => (
                <div key={t.name} className="glass rounded-2xl border border-border p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-semibold">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Oracle */}
          <section id="oracle">
            <SectionLabel>Oracle & Proof-of-Asset</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-2">How property valuations reach the blockchain</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              We use Chainlink decentralised oracle networks (DON) to bring off-chain real estate valuations on-chain in a trust-minimised way.
            </p>
            <div className="relative">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-8 left-[2.5rem] right-[2.5rem] h-px bg-border z-0" />
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                {oracleFlow.map((o) => (
                  <div key={o.step} className="glass rounded-2xl border border-border p-5">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-sm font-bold mb-3">
                      {o.step}
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{o.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{o.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Proof-of-asset NFT box */}
            <div className="mt-6 glass rounded-2xl border border-border p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Proof-of-Asset NFT (Metaplex)</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                  When a property is listed, a Metaplex NFT is minted containing: the property&apos;s legal title hash, SPV registration number, notarised appraisal report URI, and insurance certificate. This NFT is held by the smart contract and acts as on-chain proof that the tokens are backed by a real asset. Investors can verify authenticity on Solscan at any time.
                </p>
              </div>
            </div>
          </section>

          {/* Roadmap */}
          <section id="roadmap">
            <SectionLabel>Roadmap</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-8">Development phases</h2>
            <div className="space-y-4">
              {roadmap.map((r) => (
                <div key={r.phase} className="glass rounded-2xl border border-border p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                    <span className="text-xs font-mono font-semibold text-primary">{r.phase}</span>
                    <h3 className="font-bold text-lg text-foreground">{r.title}</h3>
                    <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      r.status === 'complete' ? 'bg-accent/10 text-accent border border-accent/20'
                      : r.status === 'in-progress' ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {r.status === 'complete' ? 'Complete' : r.status === 'in-progress' ? 'In Progress' : 'Upcoming'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {r.items.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className={`w-4 h-4 shrink-0 ${r.status === 'complete' ? 'text-accent' : r.status === 'in-progress' ? 'text-primary' : 'text-muted-foreground/40'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Solana Agent Skills */}
          <section id="skills">
            <SectionLabel>Solana Agent Skills</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Built with <a href="https://solana.com/skills" target="_blank" rel="noopener noreferrer" className="text-gradient-primary hover:underline">solana.com/skills</a>
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              SolEstate leverages official and community Solana Agent Skills — ready-made AI coding modules that give agents the context needed to build on Solana. Each skill below is integrated or planned in our architecture.
            </p>

            {/* Official skills header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-md bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Official — Solana Foundation</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {agentSkills.filter(s => s.official).map((skill) => (
                <div key={skill.name} className="glass rounded-2xl border border-border p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-semibold"
                      style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                    >
                      {skill.tag}
                    </span>
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{skill.desc}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-border">
                    <p className="text-xs text-primary/80 flex items-start gap-1">
                      <Bot className="w-3 h-3 shrink-0 mt-0.5" />
                      {skill.relevance}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Community skills header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-accent" />
              </div>
              <span className="text-sm font-semibold text-foreground">Community Skills</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {agentSkills.filter(s => !s.official).map((skill) => (
                <div key={skill.name} className="glass rounded-2xl border border-border p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="px-2 py-0.5 rounded-md text-xs font-semibold"
                      style={{ backgroundColor: `${skill.color}20`, color: skill.color }}
                    >
                      {skill.tag}
                    </span>
                    <a
                      href={skill.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">{skill.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{skill.desc}</p>
                  </div>
                  <div className="mt-auto pt-2 border-t border-border">
                    <p className="text-xs text-accent/80 flex items-start gap-1">
                      <Bot className="w-3 h-3 shrink-0 mt-0.5" />
                      {skill.relevance}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* npx install snippet */}
            <div className="mt-6 glass rounded-xl border border-border p-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <code className="text-xs font-mono text-accent flex-1">
                npx skills add https://github.com/solana-foundation/solana-dev-skill
              </code>
              <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">Install all official skills</span>
            </div>
          </section>

          {/* Team */}
          <section id="team">
            <SectionLabel>Team</SectionLabel>
            <h2 className="text-3xl font-bold text-foreground mb-6">Built by web3 + real estate engineers</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { name: 'Alex Rivera', role: 'CEO & Co-Founder', bg: 'Former VP at Blackstone Real Estate. 12y finance.', addr: '8xKmP4...9nRt' },
                { name: 'Mia Tanaka', role: 'CTO & Co-Founder', bg: 'Solana core contributor. 8y blockchain engineering.', addr: '3wLpQ7...4mSv' },
                { name: 'Omar Hassan', role: 'Head of Legal', bg: 'Ex-SEC attorney. Regulatory expert in digital assets.', addr: 'BqNx5j...7kWz' },
              ].map((t) => (
                <div key={t.name} className="glass rounded-2xl border border-border p-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg mb-4">
                    {t.name[0]}
                  </div>
                  <h3 className="font-semibold text-foreground">{t.name}</h3>
                  <p className="text-xs text-primary mb-2">{t.role}</p>
                  <p className="text-xs text-muted-foreground mb-3">{t.bg}</p>
                  <p className="font-mono text-xs text-muted-foreground">{t.addr}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Disclaimer */}
          <section id="disclaimer">
            <SectionLabel>Disclaimer</SectionLabel>
            <div className="glass rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-3 text-sm text-muted-foreground leading-relaxed">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-400" />
                Important — Please Read
              </p>
              <p>SolEstate is a <strong className="text-foreground">demonstration project</strong> built for educational and hackathon purposes. All properties, tokens, transactions, and financial data shown are entirely fictitious.</p>
              <p>This platform operates exclusively on <strong className="text-foreground">Solana Devnet</strong>. No real assets, real money, or real SOL are involved. Token mint addresses are mock values and do not correspond to real on-chain accounts.</p>
              <p>Nothing on this platform constitutes financial, legal, or investment advice. Fractional real estate investment carries significant risks including illiquidity, regulatory uncertainty, and capital loss. Always consult a licensed financial advisor before making investment decisions.</p>
              <p>The oracle integration (Chainlink), proof-of-asset NFT (Metaplex), and governance token (SOLD) described on this page are <strong className="text-foreground">planned features</strong>, not yet deployed on any network.</p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Ready to explore?</h2>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="/marketplace" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors glow-purple">
                Browse Marketplace <ArrowRight className="w-4 h-4" />
              </a>
              <a href="/market" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold hover:border-primary/50 transition-colors">
                <BarChart3 className="w-4 h-4" /> P2P Market
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary border border-border text-foreground font-semibold hover:border-primary/50 transition-colors"
              >
                <Link2 className="w-4 h-4" /> GitHub
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">{children}</p>
  )
}
