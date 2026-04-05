# SolEstate — Tokenized Real Estate on Solana

SolEstate is a fractional real-estate ownership platform built on Solana. Investors can buy SPL property tokens, earn rental yield, and trade 24/7 on a secondary P2P market — with no minimum investment of $500k required.

> **Demo project** — all data is fictitious, running on Solana Devnet. No real funds involved.

---

## Live Demo

Deployed on Vercel: `https://your-deployment.vercel.app`

---

## Features

| Feature | Status |
|---|---|
| Landing page with stats & featured properties | Complete |
| Marketplace — search, filter, sort | Complete |
| Property detail — yield chart, token info, buy widget | Complete |
| Phantom / Solflare wallet connect (devnet) | Complete |
| Real SOL balance from devnet RPC | Complete |
| Token purchase flow (wallet-aware) | Complete |
| Investor Dashboard — portfolio, charts, transactions | Complete |
| Secondary P2P Market — sortable listings, buy modal | Complete |
| Pitch & Docs — tokenomics, oracle, roadmap | Complete |
| About / How it works | Complete |

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Charts**: Recharts
- **Blockchain**: Solana Devnet
- **Wallet**: Phantom / Solflare via native `window.solana` provider
- **RPC**: `https://api.devnet.solana.com`
- **Tokens**: SPL Token (mock mint addresses)

---

## Architecture

```
app/
  page.tsx              → Landing page
  marketplace/
    page.tsx            → Property marketplace (search + filter)
    [id]/page.tsx       → Property detail + token purchase
  market/page.tsx       → Secondary P2P token market
  dashboard/page.tsx    → Investor portfolio dashboard
  pitch/page.tsx        → Tokenomics, oracle, roadmap, docs
  about/page.tsx        → How it works

components/
  navbar.tsx            → Wallet connect + navigation
  footer.tsx            → Footer
  property-card.tsx     → Reusable property card

lib/
  properties.ts         → Mock property data + helpers
  wallet-context.tsx    → Solana wallet context (Phantom/Solflare)
  utils.ts              → shadcn cn() helper
```

---

## Wallet Integration

`lib/wallet-context.tsx` provides a `WalletProvider` and `useWallet()` hook.

It detects the browser wallet in this priority order:
1. `window.phantom.solana` (Phantom)
2. `window.solflare` (Solflare)
3. `window.solana` (any Solana wallet)

If no wallet extension is found, clicking "Connect Wallet" opens `https://phantom.app/`.

Real SOL balance is fetched from Solana Devnet RPC via `getBalance` JSON-RPC call.

---

## Oracle Design (Planned — Phase 3)

1. Licensed appraiser submits property valuation to SolEstate API
2. Chainlink DON aggregates + signs the data feed
3. Feed written to Anchor PDA linked to the property mint
4. Token price auto-updates based on oracle feed
5. All updates permanently recorded on-chain

---

## Running Locally

```bash
git clone https://github.com/your-org/solestate
cd solestate
pnpm install
pnpm dev
```

Open `http://localhost:3000` in your browser with Phantom installed.

---

## Roadmap

- **Phase 1** (Complete): SPL tokens, marketplace, wallet connect, dashboard
- **Phase 2** (Complete): Secondary P2P market, price discovery
- **Phase 3** (In Progress): Chainlink oracle, proof-of-asset NFT (Metaplex), Anchor rent escrow
- **Phase 4** (Upcoming): DAO governance token (SOLD), OpenBook order book
- **Phase 5** (Upcoming): Mainnet, SPV legal structure, KYC via Civic, mobile app

---

## Disclaimer

This is a demonstration project built for a hackathon. All properties, tokens, and financial data are fictitious. Nothing on this platform constitutes financial or investment advice.
