'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Program, AnchorProvider, BN, Idl } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SolanaProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  publicKey: PublicKey | { toString(): string } | null
  isConnected: boolean
  connect(): Promise<{ publicKey: { toString(): string } }>
  disconnect(): Promise<void>
  signAndSendTransaction(tx: Transaction | { serialize(): Uint8Array } | Uint8Array): Promise<{ signature: string }>
  request(args: { method: string; params?: unknown }): Promise<{ signature: string }>
  signTransaction?(tx: Transaction): Promise<Transaction>
  signAllTransactions?(txs: Transaction[]): Promise<Transaction[]>
}

function getSolanaProvider(): SolanaProvider | null {
  if (typeof window === 'undefined') return null
  const win = window as unknown as {
    phantom?: { solana?: SolanaProvider }
    solflare?: SolanaProvider
    solana?: SolanaProvider
  }
  if (win.phantom?.solana?.isPhantom) return win.phantom.solana
  if (win.solflare?.isSolflare) return win.solflare
  if (win.solana) return win.solana
  return null
}

export interface PurchaseRecord {
  id: string
  propertyId: string
  propertyName: string
  propertyLocation: string
  propertyImage: string
  tokens: number
  pricePerToken: number
  totalSol: number
  signature: string
  timestamp: number
  annualYield: number
}

function getStorageKey(walletAddress: string): string {
  return `solestate_purchases_${walletAddress}`
}

function loadPurchases(walletAddress: string | null): PurchaseRecord[] {
  if (typeof window === 'undefined' || !walletAddress) return []
  try {
    const raw = localStorage.getItem(getStorageKey(walletAddress))
    return raw ? (JSON.parse(raw) as PurchaseRecord[]) : []
  } catch { return [] }
}

function savePurchases(walletAddress: string, list: PurchaseRecord[]) {
  try { 
    localStorage.setItem(getStorageKey(walletAddress), JSON.stringify(list)) 
  } catch { /* noop */ }
}

// ── Context ───────────────────────────────────────────────────────────────────

export interface WalletContextState {
  connected: boolean
  connecting: boolean
  publicKey: string | null
  balance: number | null
  shortAddress: string | null
  purchases: PurchaseRecord[]
  connect: () => Promise<void>
  disconnect: () => void
  sendPurchaseTx: (params: {
    lamports: number
    propertyId: string
    propertyName: string
    propertyLocation: string
    propertyImage: string
    tokens: number
    pricePerToken: number
    annualYield: number
  }) => Promise<string>
}

const WalletCtx = createContext<WalletContextState>({
  connected: false,
  connecting: false,
  publicKey: null,
  balance: null,
  shortAddress: null,
  purchases: [],
  connect: async () => {},
  disconnect: () => {},
  sendPurchaseTx: async () => { throw new Error('Wallet not connected') },
})

export function useWallet() { return useContext(WalletCtx) }

// ── Smart Contract Setup ──────────────────────────────────────────────────────

const DEVNET = 'https://api.devnet.solana.com'
const connection = new Connection(DEVNET, 'confirmed')

const PROGRAM_ID = new PublicKey("5tPSqDkPUP5sA56K25R2jN2sUrW57mf5m1b6QTPdRzYN")

export const IDL = {
  address: "5tPSqDkPUP5sA56K25R2jN2sUrW57mf5m1b6QTPdRzYN",
  metadata: { name: "solestate", version: "0.1.0", spec: "0.1.0" },
  instructions: [
    {
      name: "purchaseTokens",
      discriminator: [142, 1, 16, 160, 115, 120, 55, 254],
      accounts: [
        { name: "property", writable: true },
        { name: "tokenMint", writable: true },
        { name: "investorTokenAccount", writable: true },
        { name: "propertyVault", writable: true },
        { name: "registry", writable: true },
        { name: "investor", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
        { name: "systemProgram" }
      ],
      args: [{ name: "tokenAmount", type: "u64" }]
    },
    {
      name: "lockTokens",
      discriminator: [136, 11, 32, 232, 161, 117, 54, 211],
      accounts: [
        { name: "lockup", writable: true },
        { name: "lockupVault", writable: true },
        { name: "investorTokenAccount", writable: true },
        { name: "property", writable: true },
        { name: "tokenMint" },
        { name: "registry" },
        { name: "investor", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "systemProgram" },
        { name: "rent" }
      ],
      args: [{ name: "tokenAmount", type: "u64" }, { name: "lockDurationDays", type: "u64" }]
    },
    {
      name: "unlockTokens",
      discriminator: [233, 35, 95, 159, 37, 185, 47, 88],
      accounts: [
        { name: "lockup", writable: true },
        { name: "lockupVault", writable: true },
        { name: "investorTokenAccount", writable: true },
        { name: "property" },
        { name: "tokenMint" },
        { name: "registry" },
        { name: "investor", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "systemProgram" }
      ],
      args: []
    },
    {
      name: "createSaleListing",
      discriminator: [73, 149, 159, 221, 165, 15, 130, 126],
      accounts: [
        { name: "saleListing", writable: true },
        { name: "listingVault", writable: true },
        { name: "sellerTokenAccount", writable: true },
        { name: "property" },
        { name: "tokenMint" },
        { name: "registry" },
        { name: "seller", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "systemProgram" },
        { name: "rent" }
      ],
      args: [{ name: "tokenAmount", type: "u64" }, { name: "pricePerTokenLamports", type: "u64" }]
    },
    {
      name: "cancelSaleListing",
      discriminator: [225, 101, 236, 250, 241, 94, 141, 24],
      accounts: [
        { name: "saleListing", writable: true },
        { name: "listingVault", writable: true },
        { name: "sellerTokenAccount", writable: true },
        { name: "property" },
        { name: "tokenMint" },
        { name: "registry" },
        { name: "seller", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "systemProgram" }
      ],
      args: []
    },
    {
      name: "executeSale",
      discriminator: [37, 74, 217, 157, 79, 49, 35, 6],
      accounts: [
        { name: "saleListing", writable: true },
        { name: "listingVault", writable: true },
        { name: "buyerTokenAccount", writable: true },
        { name: "treasury", writable: true },
        { name: "property" },
        { name: "tokenMint" },
        { name: "registry" },
        { name: "seller", writable: true },
        { name: "buyer", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
        { name: "systemProgram" }
      ],
      args: []
    }
  ],
  accounts: [
    {
      name: "PropertyState",
      discriminator: [207, 94, 222, 94, 178, 10, 5, 93]
    },
    {
      name: "SaleListing",
      discriminator: [100, 203, 115, 202, 178, 12, 169, 137]
    },
    {
      name: "InvestorLockup",
      discriminator: [111, 237, 240, 151, 160, 232, 186, 230]
    }
  ],
  types: [
    {
      name: "PropertyState",
      type: {
        kind: "struct",
        fields: [
          { name: "id", type: "string" },
          { name: "admin", type: "pubkey" },
          { name: "tokenMint", type: "pubkey" },
          { name: "totalTokens", type: "u64" },
          { name: "soldTokens", type: "u64" },
          { name: "pricePerTokenLamports", type: "u64" },
          { name: "annualYieldBps", type: "u16" },
          { name: "isActive", type: "bool" },
          { name: "totalRaisedLamports", type: "u64" },
          { name: "investorCount", type: "u32" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "SaleListing",
      type: {
        kind: "struct",
        fields: [
          { name: "seller", type: "pubkey" },
          { name: "property", type: "pubkey" },
          { name: "tokenMint", type: "pubkey" },
          { name: "tokenAmount", type: "u64" },
          { name: "pricePerTokenLamports", type: "u64" },
          { name: "isActive", type: "bool" },
          { name: "createdAt", type: "i64" },
          { name: "bump", type: "u8" }
        ]
      }
    },
    {
      name: "InvestorLockup",
      type: {
        kind: "struct",
        fields: [
          { name: "investor", type: "pubkey" },
          { name: "property", type: "pubkey" },
          { name: "tokenMint", type: "pubkey" },
          { name: "lockedTokens", type: "u64" },
          { name: "lockUntil", type: "i64" },
          { name: "yieldBonusBps", type: "u16" },
          { name: "bump", type: "u8" }
        ]
      }
    }
  ]
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [balance, setBalance] = useState<number | null>(null)
  const [purchases, setPurchases] = useState<PurchaseRecord[]>([])

  // Load transaction history from wallet-specific localStorage
  useEffect(() => {
    if (publicKey) {
      setPurchases(loadPurchases(publicKey))
    } else {
      setPurchases([])
    }
  }, [publicKey])

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const b = await connection.getBalance(new PublicKey(addr))
      setBalance(b / 1e9)
    } catch { /* noop */ }
  }, [])

  // Re-attach on mount if already approved
  useEffect(() => {
    const p = getSolanaProvider()
    if (p?.isConnected && p.publicKey) {
      const addr = p.publicKey.toString()
      setPublicKey(addr)
      setConnected(true)
      refreshBalance(addr)
    }
  }, [refreshBalance])

  const connect = useCallback(async () => {
    const p = getSolanaProvider()
    if (!p) { window.open('https://phantom.app/', '_blank'); return }
    setConnecting(true)
    try {
      const res = await p.connect()
      const addr = res.publicKey.toString()
      setPublicKey(addr)
      setConnected(true)
      refreshBalance(addr)
    } catch (err) {
      const code = (err as { code?: number })?.code
      if (code !== 4001) console.error('[SolEstate] Wallet connect error:', err)
    } finally {
      setConnecting(false)
    }
  }, [refreshBalance])

  const disconnect = useCallback(() => {
    getSolanaProvider()?.disconnect().catch(() => {})
    setConnected(false)
    setPublicKey(null)
    setBalance(null)
  }, [])

  const sendPurchaseTx = useCallback(async (params: {
    lamports: number
    propertyId: string
    propertyName: string
    propertyLocation: string
    propertyImage: string
    tokens: number
    pricePerToken: number
    annualYield: number
  }): Promise<string> => {
    const wallet = getSolanaProvider()
    if (!wallet || !wallet.publicKey) throw new Error('Wallet not connected')

    const fromAddress = new PublicKey(wallet.publicKey.toString())

    // 1. Setup Anchor Provider
    const anchorProvider = new AnchorProvider(
      connection,
      wallet as any,
      { preflightCommitment: 'confirmed' }
    )
    const program = new Program(IDL as any, anchorProvider)

    // 2. Compute PDAs
    const REGISTRY_SEED = Buffer.from("registry")
    const [registryPda] = PublicKey.findProgramAddressSync([REGISTRY_SEED], PROGRAM_ID)

    const propIdBuffer = Buffer.from(params.propertyId)
    const [propertyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("property"), registryPda.toBuffer(), propIdBuffer],
      PROGRAM_ID
    )

    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), propertyPda.toBuffer()],
      PROGRAM_ID
    )

    // 3. Fetch PropertyState to get the tokenMint
    const propAccount = await (program.account as any).propertyState.fetch(propertyPda)
    const tokenMint = propAccount.tokenMint as PublicKey

    // 4. Compute Investor's Associated Token Account
    const investorTokenAccount = getAssociatedTokenAddressSync(
      tokenMint,
      fromAddress,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // 5. Invoke purchaseTokens
    const signature = await program.methods.purchaseTokens(new BN(params.tokens))
      .accounts({
        property: propertyPda,
        tokenMint: tokenMint,
        investorTokenAccount: investorTokenAccount,
        propertyVault: vaultPda,
        registry: registryPda,
        investor: fromAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .rpc()

    // 6. Record purchase in local State
    const record: PurchaseRecord = {
      id: signature,
      propertyId: params.propertyId,
      propertyName: params.propertyName,
      propertyLocation: params.propertyLocation,
      propertyImage: params.propertyImage,
      tokens: params.tokens,
      pricePerToken: params.pricePerToken,
      totalSol: params.lamports / 1e9,
      signature,
      timestamp: Date.now(),
      annualYield: params.annualYield,
    }
    setPurchases((prev) => {
      const next = [record, ...prev]
      if (publicKey) {
        savePurchases(publicKey, next)
      }
      return next
    })

    // 7. Refresh SOL balance
    refreshBalance(fromAddress.toBase58())

    return signature
  }, [refreshBalance])

  const shortAddress = useMemo(() =>
    publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : null,
    [publicKey]
  )

  const value = useMemo<WalletContextState>(
    () => ({ connected, connecting, publicKey, balance, shortAddress, purchases, connect, disconnect, sendPurchaseTx }),
    [connected, connecting, publicKey, balance, shortAddress, purchases, connect, disconnect, sendPurchaseTx]
  )

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>
}

