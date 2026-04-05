# SolEstate Anchor Program — Deployment Guide

## Prerequisites

Install the Solana toolchain and Anchor:

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 2. Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install)"

# 3. Install Anchor via AVM
cargo install --git https://github.com/coral-xyz/anchor avm --force
avm install 0.30.1
avm use 0.30.1

# 4. Install Node deps
cd anchor && yarn install
```

## Configure Devnet Wallet

```bash
# Generate a new keypair (or use your existing one)
solana-keygen new --outfile ~/.config/solana/id.json

# Switch to devnet
solana config set --url devnet

# Airdrop 2 SOL for deployment fees
solana airdrop 2

# Check balance
solana balance
```

## Build the Program

```bash
cd anchor
anchor build
```

This generates:
- `target/deploy/solestate.so` — the compiled BPF bytecode
- `target/idl/solestate.json` — the IDL (paste into your frontend)
- `target/types/solestate.ts` — TypeScript types

## Get the Program ID

```bash
solana address -k target/deploy/solestate-keypair.json
```

Copy this address and update TWO places:

1. `anchor/programs/solestate/src/lib.rs` — replace `declare_id!("SoLEsTaTeXXX...")`
2. `anchor/Anchor.toml` — replace under `[programs.devnet]`

Then rebuild:

```bash
anchor build
```

## Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

Expected output:
```
Deploying cluster: https://api.devnet.solana.com
Upgrade authority: ~/.config/solana/id.json
Deploying program "solestate"...
Program Id: <YOUR_PROGRAM_ID>
Deploy success
```

## Run Tests

```bash
anchor test --provider.cluster devnet
```

## Initialize On-Chain (one-time admin setup)

After deployment, call `initialize_registry` once via the Anchor CLI or a script:

```bash
# scripts/init.ts
import * as anchor from "@coral-xyz/anchor";
const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
const program = anchor.workspace.Solestate;
await program.methods.initializeRegistry().rpc();
console.log("Registry initialized!");
```

## Wire Program ID into the Frontend

Once deployed, update `lib/wallet-context.tsx`:

```typescript
export const PROGRAM_ID = "<YOUR_DEPLOYED_PROGRAM_ID>"
export const REGISTRY_SEED = "registry"
export const PROPERTY_SEED = "property"
```

Then use `@coral-xyz/anchor` in the frontend to call `purchaseTokens` directly
instead of the raw transaction serialization fallback.

## Program Architecture

```
SolEstate Program
├── initialize_registry    — admin creates global registry PDA
├── list_property          — admin lists property + creates SPL mint
├── purchase_tokens        — investor buys fractional tokens (SOL → SPL)
├── distribute_yield       — admin distributes rental income to investors
├── create_listing         — investor lists tokens on P2P market
├── fill_listing           — buyer purchases from P2P listing
└── cancel_listing         — seller cancels and reclaims tokens

PDAs
├── registry               seeds: ["registry"]
├── property               seeds: ["property", registry, property_id]
├── vault                  seeds: ["vault", property]
├── listing                seeds: ["listing", property, seller]
└── escrow                 seeds: ["escrow", listing]
```

## Security Notes

- The `property` PDA is the mint authority — only the program can mint tokens
- SOL is held in a vault PDA, not the admin's wallet
- Listings use escrow PDAs so tokens are locked until filled or cancelled
- `distribute_yield` is admin-only via registry admin check
- All arithmetic uses checked math to prevent overflow
