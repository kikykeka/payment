'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X, Wallet, ChevronRight, LogOut, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWallet } from '@/lib/wallet-context'

const navLinks = [
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/market', label: 'P2P Market' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/pitch', label: 'Pitch' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const { connected, connecting, connect, disconnect, shortAddress, balance } = useWallet()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center glow-purple">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-lg text-foreground">
            Sol<span className="text-gradient-primary">Estate</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href || pathname.startsWith(link.href + '/')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet button */}
        <div className="hidden md:flex items-center gap-3 relative">
          {connected ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-medium text-foreground hover:border-primary/50 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-xs text-muted-foreground">{shortAddress}</span>
                {balance !== null && (
                  <span className="flex items-center gap-1 text-xs text-accent font-semibold">
                    <Coins className="w-3 h-3" />
                    {balance.toFixed(4)} SOL
                  </span>
                )}
                <Wallet className="w-4 h-4 text-accent" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-52 glass border border-border rounded-xl p-2 shadow-xl z-50">
                  <Link
                    href="/portfolio"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-foreground hover:bg-secondary transition-colors"
                  >
                    <Wallet className="w-4 h-4 text-primary" />
                    My Portfolio
                  </Link>
                  <button
                    onClick={() => { disconnect(); setShowDropdown(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-secondary transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={connecting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors glow-purple disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-foreground p-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname === link.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              {link.label}
              <ChevronRight className="w-4 h-4" />
            </Link>
          ))}

          {connected ? (
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-secondary border border-border text-sm">
                <span className="font-mono text-xs text-muted-foreground">{shortAddress}</span>
                {balance !== null && (
                  <span className="text-xs text-accent font-semibold">{balance.toFixed(4)} SOL</span>
                )}
              </div>
              <button
                onClick={() => { disconnect(); setMobileOpen(false) }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-secondary border border-border text-sm font-medium text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={() => { connect(); setMobileOpen(false) }}
              disabled={connecting}
              className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60"
            >
              <Wallet className="w-4 h-4" />
              {connecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      )}
    </header>
  )
}
