'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { Connection, PublicKey, Transaction, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { Program, AnchorProvider, BN, Idl } from '@anchor-lang/core'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { PROGRAM_ID as PROGRAM_ID_STR, DEVNET_RPC, COMMITMENT } from './config'
import { properties } from './properties'

// ── Types ─────────────────────────────────────────────────────────────────────

interface SolanaProvider {
  isPhantom?: boolean
  isSolflare?: boolean
  publicKey: PublicKey | { toString(): string } | null
  isConnected: boolean
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>
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
  getTokenBalance: (tokenMint: string) => Promise<number>
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
  getTokenBalance: async () => 0,
})

export function useWallet() { return useContext(WalletCtx) }

// ── Smart Contract Setup ──────────────────────────────────────────────────────

const PROGRAM_ID = new PublicKey(PROGRAM_ID_STR)
const connection = new Connection(DEVNET_RPC, COMMITMENT)

export const IDL = {
  address: PROGRAM_ID_STR,
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
        { name: "rent" },
        { name: "cooldown" }
      ],
      args: [{ name: "tokenAmount", type: "u64" }, { name: "price", type: "u64" }]
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
        { name: "systemProgram" },
        { name: "cooldown", writable: true }
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
    },
    {
      name: "purchaseTokensWithHistory",
      discriminator: [127, 251, 9, 12, 102, 7, 71, 36],
      accounts: [
        { name: "purchaseRecord", writable: true },
        { name: "property", writable: true },
        { name: "tokenMint", writable: true },
        { name: "buyerTokenAccount", writable: true },
        { name: "propertyVault", writable: true },
        { name: "registry", writable: true },
        { name: "buyer", writable: true, signer: true },
        { name: "tokenProgram" },
        { name: "associatedTokenProgram" },
        { name: "systemProgram" },
        { name: "rent" }
      ],
      args: [
        { name: "_id", type: "string" },
        { name: "tokenAmount", type: "u64" },
        { name: "timestamp", type: "i64" }
      ]
    },
    {
      name: "closePurchaseRecord",
      discriminator: [111, 230, 169, 137, 246, 203, 104, 255],
      accounts: [
        { name: "purchaseRecord", writable: true },
        { name: "buyer", writable: true, signer: true },
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
      discriminator: [167, 97, 203, 156, 150, 97, 238, 220]
    },
    {
      name: "InvestorLockup",
      discriminator: [187, 129, 166, 32, 119, 34, 244, 201]
    },
    {
      name: "PurchaseRecord",
      discriminator: [239, 38, 40, 199, 4, 96, 209, 2]
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
    },
    {
      name: "PurchaseRecord",
      // IMPORTANT: The field order MUST exactly match the smart contract struct in lib.rs
      // otherwise Anchor will read bytes from the wrong offsets (mismatched memory layout).
      discriminator: [239, 38, 40, 199, 4, 96, 209, 2],
      type: {
        kind: "struct",
        fields: [
          { name: "buyer", type: "pubkey" },
          { name: "property", type: "pubkey" },
          { name: "propertyId", type: "string" },
          { name: "tokenMint", type: "pubkey" },
          { name: "tokenAmount", type: "u64" },
          { name: "pricePerToken", type: "u64" },
          { name: "totalPrice", type: "u64" },
          { name: "timestamp", type: "i64" },
          { name: "annualYield", type: "u16" }
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

  const fetchPurchaseHistory = useCallback(async (walletAddr: string) => {
    try {
      const p = getSolanaProvider()
      if (!p) return
      
      const provider = new AnchorProvider(connection, p as any, { preflightCommitment: 'confirmed' })
      const program = new Program(IDL as any, provider)
      
      // Fetch all PurchaseRecord accounts where buyer == walletAddr
      const records = await (program.account as any).purchaseRecord.all([
        {
          memcmp: {
            offset: 8, // Discriminator is 8 bytes, followed by buyer: Pubkey
            bytes: walletAddr
          }
        }
      ])
      
      if (records.length === 0) {
        setPurchases([])
        return
      }
      
      // Map on-chain records to frontend PurchaseRecord interface
      const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
      
      const mappedPurchases: PurchaseRecord[] = records.map((r: any) => {
        const acc = r.account as any
        
        // Find property by calculating PDA for each known property
        const property = properties.find((p) => {
          const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(p.id)],
            PROGRAM_ID
          )
          return pda.equals(acc.property)
        })
        
        // Skip if property not found (avoids showing garbage or legacy records)
        if (!property) return null;

        // BigInt/BN safety: toNumber() throws if > 2^53.
        const tokenAmountRaw = acc.tokenAmount || acc.token_amount
        const tokens = tokenAmountRaw ? Number(tokenAmountRaw.toString()) : 0

        const timestampRaw = acc.timestamp
        const timestampMs = timestampRaw ? Number(timestampRaw.toString()) * 1000 : Date.now()
        
        return {
          id: r.publicKey.toBase58(),
          propertyId: property.id,
          propertyName: property.name,
          propertyLocation: property.location,
          propertyImage: property.image,
          tokens: tokens, // Humman-readable units (e.g. 1, 5, 10)
          pricePerToken: property.pricePerToken,
          totalSol: tokens * property.pricePerToken,
          signature: r.publicKey.toBase58(),
          timestamp: timestampMs,
          annualYield: property.annualYield,
        }
      }).filter((p: PurchaseRecord | null): p is PurchaseRecord => p !== null)
      
      // Sort by timestamp descending
      mappedPurchases.sort((a, b) => b.timestamp - a.timestamp)
      setPurchases(mappedPurchases)
    } catch (err) {
      console.error('[SolEstate] Failed to fetch purchase history:', err)
      setPurchases([]) // no localStorage fallback — blockchain is source of truth
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      fetchPurchaseHistory(publicKey)
    } else {
      setPurchases([])
    }
  }, [publicKey, fetchPurchaseHistory])

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const b = await connection.getBalance(new PublicKey(addr))
      setBalance(b / 1e9)
    } catch { /* noop */ }
  }, [])

  // Re-attach on mount if already approved
  useEffect(() => {
    const autoConnect = async () => {
      const p = getSolanaProvider()
      if (!p) return

      // Check if user previously connected (stored in localStorage)
      const wasConnected = typeof window !== 'undefined' && localStorage.getItem('solestateWalletConnected') === 'true'
      
      if (wasConnected) {
        try {
          // Silently reconnect without showing approval popup
          await p.connect({ onlyIfTrusted: true })
        } catch (err) {
          // If silent connect fails, clear the flag
          console.log('[v0] Silent reconnect failed:', err)
          localStorage.removeItem('solestateWalletConnected')
          return
        }
      }

      // If wallet is already connected, set state
      if (p.isConnected && p.publicKey) {
        const addr = p.publicKey.toString()
        setPublicKey(addr)
        setConnected(true)
        refreshBalance(addr)
        // Ensure flag is set
        if (typeof window !== 'undefined') {
          localStorage.setItem('solestateWalletConnected', 'true')
        }
      }
    }

    autoConnect()
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
      // Save connection state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('solestateWalletConnected', 'true')
      }
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
    // Clear connection state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('solestateWalletConnected')
    }
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

    // 5. Invoke purchaseTokensWithHistory
    const timestamp = Math.floor(Date.now() / 1000)
    
    // Compute PurchaseRecord PDA using BN for compatibility
    const timestampBuffer = new BN(timestamp).toArrayLike(Buffer, 'le', 8)
    
    const [purchaseRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("purchase_record"),
        fromAddress.toBuffer(),
        propertyPda.toBuffer(),
        timestampBuffer
      ],
      PROGRAM_ID
    )

    const signature = await program.methods
      .purchaseTokensWithHistory(params.propertyId, new BN(params.tokens), new BN(timestamp))
      .accounts({
        purchaseRecord: purchaseRecordPda,
        property: propertyPda,
        tokenMint: tokenMint,
        buyerTokenAccount: investorTokenAccount,
        propertyVault: vaultPda,
        registry: registryPda,
        buyer: fromAddress,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      } as any)
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
    setPurchases((prev) => [record, ...prev])

    // 7. Refresh SOL balance
    refreshBalance(fromAddress.toBase58())

    return signature
  }, [refreshBalance])

  const getTokenBalance = useCallback(async (mintStr: string) => {
    if (!publicKey) return 0
    try {
      const mintPk = new PublicKey(mintStr)
      const userPk = new PublicKey(publicKey)
      const ata = getAssociatedTokenAddressSync(mintPk, userPk, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
      
      const info = await connection.getAccountInfo(ata)
      if (!info || info.data.length < 72) return 0
      
      // SPL tokens use base units. In this dapp, property tokens have 6 decimals.
      // We divide by 1,000,000 to get the human-readable amount.
      const amount = info.data.readBigUInt64LE(64)
      return Number(amount.toString()) / 1_000_000
    } catch (err) {
      console.error('[SolEstate] Failed to fetch token balance:', err)
      return 0
    }
  }, [publicKey])

  const shortAddress = useMemo(() =>
    publicKey ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}` : null,
    [publicKey]
  )

  const value = useMemo<WalletContextState>(
    () => ({ connected, connecting, publicKey, balance, shortAddress, purchases, connect, disconnect, sendPurchaseTx, getTokenBalance }),
    [connected, connecting, publicKey, balance, shortAddress, purchases, connect, disconnect, sendPurchaseTx, getTokenBalance]
  )

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>
}
