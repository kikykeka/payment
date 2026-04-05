import { Connection, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from '@solana/web3.js'
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor'
import { getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { IDL } from './wallet-context'

const DEVNET = 'https://api.devnet.solana.com'
const connection = new Connection(DEVNET, 'confirmed')
const PROGRAM_ID = new PublicKey("5tPSqDkPUP5sA56K25R2jN2sUrW57mf5m1b6QTPdRzYN")

function getProvider(wallet: any) {
  return new AnchorProvider(connection, wallet, { preflightCommitment: 'confirmed' })
}

export async function createSaleListing(
  wallet: any,
  propertyId: string,
  tokenMint: string,
  tokenAmount: number,
  pricePerTokenLamports: number
) {
  const provider = getProvider(wallet)
  const program = new Program(IDL as any, provider)
  const seller = new PublicKey(wallet.publicKey.toString())
  const mintPk = new PublicKey(tokenMint)

  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propertyId)],
    PROGRAM_ID
  )

  const [saleListingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sale_listing"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const [listingVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing_vault"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const sellerTokenAccount = getAssociatedTokenAddressSync(mintPk, seller, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  return await program.methods.createSaleListing(new BN(tokenAmount), new BN(pricePerTokenLamports))
    .accounts({
      saleListing: saleListingPda,
      listingVault: listingVaultPda,
      sellerTokenAccount,
      property: propertyPda,
      tokenMint: mintPk,
      registry: registryPda,
      seller,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc()
}

export async function cancelSaleListing(
  wallet: any,
  propertyId: string,
  tokenMint: string
) {
  const provider = getProvider(wallet)
  const program = new Program(IDL as any, provider)
  const seller = new PublicKey(wallet.publicKey.toString())
  const mintPk = new PublicKey(tokenMint)

  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propertyId)],
    PROGRAM_ID
  )

  const [saleListingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sale_listing"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const [listingVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing_vault"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const sellerTokenAccount = getAssociatedTokenAddressSync(mintPk, seller, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  return await program.methods.cancelSaleListing()
    .accounts({
      saleListing: saleListingPda,
      listingVault: listingVaultPda,
      sellerTokenAccount,
      property: propertyPda,
      tokenMint: mintPk,
      registry: registryPda,
      seller,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function executeSale(
  wallet: any,
  sellerStr: string,
  propertyId: string,
  tokenMint: string
) {
  const provider = getProvider(wallet)
  const program = new Program(IDL as any, provider)
  const buyer = new PublicKey(wallet.publicKey.toString())
  const seller = new PublicKey(sellerStr)
  const mintPk = new PublicKey(tokenMint)

  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propertyId)],
    PROGRAM_ID
  )
  const [treasuryPda] = PublicKey.findProgramAddressSync([Buffer.from("treasury")], PROGRAM_ID)

  const [saleListingPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("sale_listing"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const [listingVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("listing_vault"), seller.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const buyerTokenAccount = getAssociatedTokenAddressSync(mintPk, buyer, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  return await program.methods.executeSale()
    .accounts({
      saleListing: saleListingPda,
      listingVault: listingVaultPda,
      buyerTokenAccount,
      treasury: treasuryPda,
      property: propertyPda,
      tokenMint: mintPk,
      registry: registryPda,
      seller,
      buyer,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}

export async function lockTokens(
  wallet: any,
  propertyId: string,
  tokenMint: string,
  tokenAmount: number,
  lockDurationDays: number
) {
  const provider = getProvider(wallet)
  const program = new Program(IDL as any, provider)
  const investor = new PublicKey(wallet.publicKey.toString())
  const mintPk = new PublicKey(tokenMint)

  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propertyId)],
    PROGRAM_ID
  )

  const [lockupPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lockup"), investor.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const [lockupVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lockup_vault"), investor.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const investorTokenAccount = getAssociatedTokenAddressSync(mintPk, investor, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  return await program.methods.lockTokens(new BN(tokenAmount), new BN(lockDurationDays))
    .accounts({
      lockup: lockupPda,
      lockupVault: lockupVaultPda,
      investorTokenAccount,
      property: propertyPda,
      tokenMint: mintPk,
      registry: registryPda,
      investor,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .rpc()
}

export async function unlockTokens(
  wallet: any,
  propertyId: string,
  tokenMint: string
) {
  const provider = getProvider(wallet)
  const program = new Program(IDL as any, provider)
  const investor = new PublicKey(wallet.publicKey.toString())
  const mintPk = new PublicKey(tokenMint)

  const [registryPda] = PublicKey.findProgramAddressSync([Buffer.from("registry")], PROGRAM_ID)
  const [propertyPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("property"), registryPda.toBuffer(), Buffer.from(propertyId)],
    PROGRAM_ID
  )

  const [lockupPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lockup"), investor.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const [lockupVaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("lockup_vault"), investor.toBuffer(), propertyPda.toBuffer(), mintPk.toBuffer()],
    PROGRAM_ID
  )

  const investorTokenAccount = getAssociatedTokenAddressSync(mintPk, investor, false, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)

  return await program.methods.unlockTokens()
    .accounts({
      lockup: lockupPda,
      lockupVault: lockupVaultPda,
      investorTokenAccount,
      property: propertyPda,
      tokenMint: mintPk,
      registry: registryPda,
      investor,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc()
}
