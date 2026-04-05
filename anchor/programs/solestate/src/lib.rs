use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount, Transfer};
use anchor_spl::metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata, mpl_token_metadata::types::DataV2};

declare_id!("5tPSqDkPUP5sA56K25R2jN2sUrW57mf5m1b6QTPdRzYN");

// ─────────────────────────────────────────────
// SolEstate — Real World Asset Tokenization
// Network: Solana Devnet
// ─────────────────────────────────────────────

#[program]
pub mod solestate {
    use super::*;

    // ─── 1. Initialize the global registry ───────────────────────────────────

    /// Called once by the platform admin to create the global PropertyRegistry.
    pub fn initialize_registry(ctx: Context<InitializeRegistry>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.admin = ctx.accounts.admin.key();
        registry.property_count = 0;
        registry.total_raised_lamports = 0;
        registry.bump = ctx.bumps.registry;
        msg!("SolEstate registry initialized. Admin: {}", registry.admin);
        Ok(())
    }

    // ─── 2. List a new property ───────────────────────────────────────────────

    /// Admin lists a new real-world property on-chain, creating a PropertyState
    /// PDA and a dedicated SPL token Mint for fractional ownership tokens.
    pub fn list_property(
        ctx: Context<ListProperty>,
        params: ListPropertyParams,
    ) -> Result<()> {
        require!(params.total_tokens > 0, SolEstateError::InvalidTokenCount);
        require!(params.price_per_token_lamports > 0, SolEstateError::InvalidPrice);
        require!(params.annual_yield_bps <= 5000, SolEstateError::YieldTooHigh); // max 50%

        let property = &mut ctx.accounts.property;
        let registry = &mut ctx.accounts.registry;

        property.id = params.id.clone();
        property.admin = ctx.accounts.admin.key();
        property.token_mint = ctx.accounts.token_mint.key();
        property.total_tokens = params.total_tokens;
        property.sold_tokens = 0;
        property.price_per_token_lamports = params.price_per_token_lamports;
        property.annual_yield_bps = params.annual_yield_bps;
        property.is_active = true;
        property.total_raised_lamports = 0;
        property.investor_count = 0;
        property.created_at = Clock::get()?.unix_timestamp;
        property.bump = ctx.bumps.property;

        registry.property_count += 1;

        msg!(
            "Property listed: {} | Tokens: {} | Price: {} lamports | Yield: {}bps",
            params.id,
            params.total_tokens,
            params.price_per_token_lamports,
            params.annual_yield_bps,
        );

        Ok(())
    }

    // ─── 3. Purchase fractional tokens ───────────────────────────────────────

    /// Investor sends SOL, receives fractional property tokens (SPL) in return.
    /// This is the core transaction that gets signed via Phantom.
    pub fn purchase_tokens(
        ctx: Context<PurchaseTokens>,
        token_amount: u64,
    ) -> Result<()> {
        // Validate
        require!(ctx.accounts.property.is_active, SolEstateError::PropertyNotActive);
        require!(token_amount > 0, SolEstateError::InvalidTokenCount);
        require!(
            ctx.accounts.property.sold_tokens + token_amount <= ctx.accounts.property.total_tokens,
            SolEstateError::InsufficientTokensAvailable
        );

        // Calculate SOL cost
        let cost_lamports = ctx.accounts.property
            .price_per_token_lamports
            .checked_mul(token_amount)
            .ok_or(SolEstateError::ArithmeticOverflow)?;

        // Transfer SOL from investor → property vault
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.investor.key(),
            &ctx.accounts.property_vault.key(),
            cost_lamports,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.investor.to_account_info(),
                ctx.accounts.property_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Mint fractional tokens to investor's ATA
        let registry_key = ctx.accounts.registry.key();
        let property_id = ctx.accounts.property.id.clone();
        let property_bump = ctx.accounts.property.bump;
        let seeds = &[
            b"property",
            registry_key.as_ref(),
            property_id.as_bytes(),
            &[property_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.token_mint.to_account_info(),
                    to: ctx.accounts.investor_token_account.to_account_info(),
                    authority: ctx.accounts.property.to_account_info(),
                },
                signer_seeds,
            ),
            token_amount,
        )?;

        // Update state
        ctx.accounts.property.sold_tokens += token_amount;
        ctx.accounts.property.total_raised_lamports += cost_lamports;
        ctx.accounts.property.investor_count += 1;

        // Auto-close when fully funded
        if ctx.accounts.property.sold_tokens == ctx.accounts.property.total_tokens {
            ctx.accounts.property.is_active = false;
            msg!("Property {} fully funded!", ctx.accounts.property.id);
        }

        // Update registry totals
        let registry = &mut ctx.accounts.registry;
        registry.total_raised_lamports += cost_lamports;

        emit!(TokensPurchased {
            property_id: ctx.accounts.property.id.clone(),
            investor: ctx.accounts.investor.key(),
            token_amount,
            cost_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!(
            "Purchased {} tokens of {} for {} lamports. Investor: {}",
            token_amount,
            ctx.accounts.property.id,
            cost_lamports,
            ctx.accounts.investor.key(),
        );

        Ok(())
    }

    // ─── 4. Distribute yield to investors ────────────────────────────────────

    /// Admin distributes rental yield SOL to a single investor proportional
    /// to their token holdings. Called off-chain per investor.
    pub fn distribute_yield(
        ctx: Context<DistributeYield>,
        amount_lamports: u64,
    ) -> Result<()> {
        require!(amount_lamports > 0, SolEstateError::InvalidPrice);

        // Transfer yield SOL from vault → investor
        **ctx.accounts.property_vault.try_borrow_mut_lamports()? -= amount_lamports;
        **ctx.accounts.investor.try_borrow_mut_lamports()? += amount_lamports;

        emit!(YieldDistributed {
            property_id: ctx.accounts.property.id.clone(),
            investor: ctx.accounts.investor.key(),
            amount_lamports,
            timestamp: Clock::get()?.unix_timestamp,
        });

        msg!(
            "Yield distributed: {} lamports to {}",
            amount_lamports,
            ctx.accounts.investor.key()
        );

        Ok(())
    }

    // ─── 5. List tokens on P2P secondary market ───────────────────────────────

    /// Investor creates a sell listing for their fractional tokens.
    pub fn create_listing(
        ctx: Context<CreateListing>,
        token_amount: u64,
        price_per_token_lamports: u64,
    ) -> Result<()> {
        require!(token_amount > 0, SolEstateError::InvalidTokenCount);
        require!(price_per_token_lamports > 0, SolEstateError::InvalidPrice);

        // Lock tokens into listing escrow
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.seller_token_account.to_account_info(),
                    to: ctx.accounts.listing_escrow.to_account_info(),
                    authority: ctx.accounts.seller.to_account_info(),
                },
            ),
            token_amount,
        )?;

        let listing = &mut ctx.accounts.listing;
        listing.seller = ctx.accounts.seller.key();
        listing.property = ctx.accounts.property.key();
        listing.token_mint = ctx.accounts.token_mint.key();
        listing.token_amount = token_amount;
        listing.price_per_token_lamports = price_per_token_lamports;
        listing.is_active = true;
        listing.created_at = Clock::get()?.unix_timestamp;
        listing.bump = ctx.bumps.listing;

        msg!(
            "Listing created: {} tokens at {} lamports each by {}",
            token_amount,
            price_per_token_lamports,
            ctx.accounts.seller.key()
        );

        Ok(())
    }

    // ─── 6. Buy from P2P listing ──────────────────────────────────────────────

    /// Buyer purchases tokens from a secondary market listing.
    pub fn fill_listing(ctx: Context<FillListing>) -> Result<()> {
        let token_amount = ctx.accounts.listing.token_amount;
        let price_per_token_lamports = ctx.accounts.listing.price_per_token_lamports;
        let bump = ctx.accounts.listing.bump;

        require!(ctx.accounts.listing.is_active, SolEstateError::ListingNotActive);

        let total_cost = price_per_token_lamports
            .checked_mul(token_amount)
            .ok_or(SolEstateError::ArithmeticOverflow)?;

        // SOL from buyer → seller
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.seller.key(),
            total_cost,
        );
        anchor_lang::solana_program::program::invoke(
            &ix,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.seller.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Tokens from escrow → buyer
        let listing_key = ctx.accounts.listing.key();
        let seeds = &[b"listing", listing_key.as_ref(), &[bump]];
        let signer_seeds = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.listing_escrow.to_account_info(),
                    to: ctx.accounts.buyer_token_account.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
            token_amount,
        )?;

        ctx.accounts.listing.is_active = false;

        emit!(ListingFilled {
            listing: ctx.accounts.listing.key(),
            buyer: ctx.accounts.buyer.key(),
            seller: ctx.accounts.seller.key(),
            token_amount,
            total_cost_lamports: total_cost,
            timestamp: Clock::get()?.unix_timestamp,
        });

        Ok(())
    }

    // ─── 7. Cancel listing ────────────────────────────────────────────────────

    /// Seller cancels their listing and reclaims escrowed tokens.
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        let token_amount = ctx.accounts.listing.token_amount;
        let bump = ctx.accounts.listing.bump;

        require!(ctx.accounts.listing.is_active, SolEstateError::ListingNotActive);
        require!(
            ctx.accounts.listing.seller == ctx.accounts.seller.key(),
            SolEstateError::Unauthorized
        );

        let listing_key = ctx.accounts.listing.key();
        let seeds = &[b"listing", listing_key.as_ref(), &[bump]];
        let signer_seeds = &[&seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.listing_escrow.to_account_info(),
                    to: ctx.accounts.seller_token_account.to_account_info(),
                    authority: ctx.accounts.listing.to_account_info(),
                },
                signer_seeds,
            ),
            token_amount,
        )?;

        ctx.accounts.listing.is_active = false;
        msg!("Listing cancelled by {}", ctx.accounts.seller.key());
        Ok(())
    }

    // ─── 8. Create Metaplex Metadata for existing or new tokens ──────────────
    pub fn create_property_metadata(
        ctx: Context<CreatePropertyMetadata>,
        name: String,
        symbol: String,
        uri: String,
    ) -> Result<()> {
        let registry_key = ctx.accounts.registry.key();
        let property_id = ctx.accounts.property.id.clone();
        let property_bump = ctx.accounts.property.bump;

        let seeds = &[
            b"property",
            registry_key.as_ref(),
            property_id.as_bytes(),
            &[property_bump],
        ];
        let signer_seeds = &[&seeds[..]];

        create_metadata_accounts_v3(
            CpiContext::new_with_signer(
                ctx.accounts.token_metadata_program.to_account_info(),
                CreateMetadataAccountsV3 {
                    metadata: ctx.accounts.metadata_account.to_account_info(),
                    mint: ctx.accounts.token_mint.to_account_info(),
                    mint_authority: ctx.accounts.property.to_account_info(),
                    payer: ctx.accounts.admin.to_account_info(),
                    update_authority: ctx.accounts.property.to_account_info(),
                    system_program: ctx.accounts.system_program.to_account_info(),
                    rent: ctx.accounts.rent.to_account_info(),
                },
                signer_seeds,
            ),
            DataV2 {
                name,
                symbol,
                uri,
                seller_fee_basis_points: 0,
                creators: None,
                collection: None,
                uses: None,
            },
            true, // is_mutable
            true, // update_authority_is_signer
            None, // collection details
        )?;

        msg!("Metadata created for {}", ctx.accounts.property.id);
        Ok(())
    }
}

// ─────────────────────────────────────────────
// Account structs
// ─────────────────────────────────────────────

#[account]
pub struct PropertyRegistry {
    pub admin: Pubkey,          // 32
    pub property_count: u32,    // 4
    pub total_raised_lamports: u64, // 8
    pub bump: u8,               // 1
}

impl PropertyRegistry {
    pub const LEN: usize = 8 + 32 + 4 + 8 + 1;
}

#[account]
pub struct PropertyState {
    pub id: String,                      // 4 + 32 max
    pub admin: Pubkey,                   // 32
    pub token_mint: Pubkey,              // 32
    pub total_tokens: u64,               // 8
    pub sold_tokens: u64,                // 8
    pub price_per_token_lamports: u64,   // 8
    pub annual_yield_bps: u16,           // 2  (basis points, 100 = 1%)
    pub is_active: bool,                 // 1
    pub total_raised_lamports: u64,      // 8
    pub investor_count: u32,             // 4
    pub created_at: i64,                 // 8
    pub bump: u8,                        // 1
}

impl PropertyState {
    pub const MAX_ID_LEN: usize = 32;
    pub const LEN: usize = 8
        + (4 + Self::MAX_ID_LEN)  // String
        + 32 + 32                 // admin + mint
        + 8 + 8 + 8               // tokens x2 + price
        + 2 + 1 + 8 + 4 + 8 + 1; // yield, active, raised, investors, ts, bump
}

#[account]
pub struct Listing {
    pub seller: Pubkey,                  // 32
    pub property: Pubkey,                // 32
    pub token_mint: Pubkey,              // 32
    pub token_amount: u64,               // 8
    pub price_per_token_lamports: u64,   // 8
    pub is_active: bool,                 // 1
    pub created_at: i64,                 // 8
    pub bump: u8,                        // 1
}

impl Listing {
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 1 + 8 + 1;
}

// ─────────────────────────────────────────────
// Context definitions
// ─────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeRegistry<'info> {
    #[account(
        init,
        payer = admin,
        space = PropertyRegistry::LEN,
        seeds = [b"registry"],
        bump
    )]
    pub registry: Account<'info, PropertyRegistry>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(params: ListPropertyParams)]
pub struct ListProperty<'info> {
    #[account(
        init,
        payer = admin,
        space = PropertyState::LEN,
        seeds = [b"property", registry.key().as_ref(), params.id.as_bytes()],
        bump
    )]
    pub property: Box<Account<'info, PropertyState>>,

    /// New SPL mint for this property's fractional tokens
    #[account(
        init,
        payer = admin,
        mint::decimals = 0,         // whole tokens only
        mint::authority = property, // PDA controls minting
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut, seeds = [b"registry"], bump = registry.bump)]
    pub registry: Box<Account<'info, PropertyRegistry>>,

    #[account(mut)]
    pub admin: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct PurchaseTokens<'info> {
    #[account(
        mut,
        seeds = [b"property", registry.key().as_ref(), property.id.as_bytes()],
        bump = property.bump
    )]
    pub property: Box<Account<'info, PropertyState>>,

    #[account(
        mut,
        constraint = token_mint.key() == property.token_mint
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    /// Investor's Associated Token Account for this property's mint
    #[account(
        init_if_needed,
        payer = investor,
        associated_token::mint = token_mint,
        associated_token::authority = investor,
    )]
    pub investor_token_account: Box<Account<'info, TokenAccount>>,

    /// Property vault receives SOL payments
    #[account(
        mut,
        seeds = [b"vault", property.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault, no data needed
    pub property_vault: UncheckedAccount<'info>,

    #[account(mut, seeds = [b"registry"], bump = registry.bump)]
    pub registry: Box<Account<'info, PropertyRegistry>>,

    #[account(mut)]
    pub investor: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(mut, seeds = [b"property", registry.key().as_ref(), property.id.as_bytes()], bump = property.bump)]
    pub property: Account<'info, PropertyState>,

    #[account(
        mut,
        seeds = [b"vault", property.key().as_ref()],
        bump,
    )]
    /// CHECK: PDA vault
    pub property_vault: UncheckedAccount<'info>,

    /// CHECK: investor receiving yield
    #[account(mut)]
    pub investor: UncheckedAccount<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Account<'info, PropertyRegistry>,

    #[account(mut, constraint = admin.key() == registry.admin)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = seller,
        space = Listing::LEN,
        seeds = [b"listing", property.key().as_ref(), seller.key().as_ref()],
        bump
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        init,
        payer = seller,
        token::mint = token_mint,
        token::authority = listing,
        seeds = [b"escrow", listing.key().as_ref()],
        bump
    )]
    pub listing_escrow: Box<Account<'info, TokenAccount>>,

    #[account(mut)]
    pub seller_token_account: Box<Account<'info, TokenAccount>>,

    pub property: Box<Account<'info, PropertyState>>,

    #[account(constraint = token_mint.key() == property.token_mint)]
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub seller: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct FillListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", property.key().as_ref(), listing.seller.as_ref()],
        bump = listing.bump,
        constraint = listing.is_active
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        mut,
        seeds = [b"escrow", listing.key().as_ref()],
        bump,
    )]
    pub listing_escrow: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = token_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Box<Account<'info, TokenAccount>>,

    /// CHECK: receives SOL
    #[account(mut, constraint = seller.key() == listing.seller)]
    pub seller: UncheckedAccount<'info>,

    pub property: Box<Account<'info, PropertyState>>,
    pub token_mint: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub buyer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, anchor_spl::associated_token::AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(
        mut,
        seeds = [b"listing", property.key().as_ref(), seller.key().as_ref()],
        bump = listing.bump,
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        seeds = [b"escrow", listing.key().as_ref()],
        bump,
    )]
    pub listing_escrow: Account<'info, TokenAccount>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    pub property: Account<'info, PropertyState>,

    #[account(mut)]
    pub seller: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

// ─────────────────────────────────────────────
// Instruction params
// ─────────────────────────────────────────────

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ListPropertyParams {
    pub id: String,                    // e.g. "nyc-penthouse-001"
    pub total_tokens: u64,             // e.g. 10000
    pub price_per_token_lamports: u64, // e.g. 500_000_000 (0.5 SOL)
    pub annual_yield_bps: u16,         // e.g. 840 = 8.4%
}

// ─────────────────────────────────────────────
// Events
// ─────────────────────────────────────────────

#[event]
pub struct TokensPurchased {
    pub property_id: String,
    pub investor: Pubkey,
    pub token_amount: u64,
    pub cost_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct YieldDistributed {
    pub property_id: String,
    pub investor: Pubkey,
    pub amount_lamports: u64,
    pub timestamp: i64,
}

#[event]
pub struct ListingFilled {
    pub listing: Pubkey,
    pub buyer: Pubkey,
    pub seller: Pubkey,
    pub token_amount: u64,
    pub total_cost_lamports: u64,
    pub timestamp: i64,
}

// ─────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────


#[derive(Accounts)]
pub struct CreatePropertyMetadata<'info> {
    #[account(
        mut,
        seeds = [b"property", registry.key().as_ref(), property.id.as_bytes()],
        bump = property.bump
    )]
    pub property: Box<Account<'info, PropertyState>>,

    #[account(mut, constraint = token_mint.key() == property.token_mint)]
    pub token_mint: Box<Account<'info, Mint>>,

    /// CHECK: Metaplex Metadata PDA
    #[account(
        mut,
        seeds = [
            b"metadata",
            token_metadata_program.key().as_ref(),
            token_mint.key().as_ref()
        ],
        seeds::program = token_metadata_program.key(),
        bump,
    )]
    pub metadata_account: UncheckedAccount<'info>,

    #[account(seeds = [b"registry"], bump = registry.bump)]
    pub registry: Box<Account<'info, PropertyRegistry>>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[error_code]
pub enum SolEstateError {
    #[msg("Property is not active for investment")]
    PropertyNotActive,
    #[msg("Insufficient tokens available")]
    InsufficientTokensAvailable,
    #[msg("Invalid token count")]
    InvalidTokenCount,
    #[msg("Invalid price")]
    InvalidPrice,
    #[msg("Yield percentage too high (max 50%)")]
    YieldTooHigh,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Listing is not active")]
    ListingNotActive,
    #[msg("Unauthorized")]
    Unauthorized,
}
