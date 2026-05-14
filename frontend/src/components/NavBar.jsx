import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X, Radio } from 'lucide-react'

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `text-xs tracking-widest uppercase transition-colors px-1 pb-0.5 ${
      isActive
        ? 'text-accent border-b-2 border-accent'
        : 'text-muted hover:text-primary'
    }`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border h-16 flex items-center px-4 md:px-6">
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-fit">
        <img
          src="/rugradarlogo.webp"
          alt="RugRadar"
          className="h-9 w-auto object-contain"
        />
        <span className="text-risk font-bold text-lg tracking-tight">RUGRADAR</span>
        <span className="blink text-risk font-bold">_</span>
      </div>

      {/* Center: Nav links (desktop) */}
      <div className="hidden md:flex items-center gap-8 mx-auto">
        <NavLink to="/" className={linkClass}>
          Live Feed
        </NavLink>
        <NavLink to="/hall-of-shame" className={linkClass}>
          Hall of Shame
        </NavLink>
      </div>

      {/* Right: Telegram + Live indicator + chain badge (desktop) */}
      <div className="hidden md:flex items-center gap-3 min-w-fit">
        <div className="relative group">
          <a
            href="https://t.me/rugradarbirdeyebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.26 14.4l-2.956-.924c-.642-.204-.657-.642.136-.953l11.543-4.453c.537-.194 1.006.131.579.178z"/>
            </svg>
            🚨 Rug Alerts
          </a>
          {/* Tooltip */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
            <div className="bg-surface border border-[#229ED9]/40 rounded px-3 py-2 text-[11px] text-muted leading-relaxed shadow-lg">
              <span className="text-[#229ED9] font-bold block mb-0.5">Telegram Alert Bot</span>
              Get instant rug pull alerts directly on Telegram the moment a high-risk token is detected.
            </div>
            {/* Arrow */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-surface border-l border-t border-[#229ED9]/40 rotate-45" />
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-safe">
          <span className="w-2 h-2 rounded-full bg-safe animate-pulse inline-block" />
          LIVE
        </span>
        <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent border border-accent/30 tracking-widest">
          SOLANA
        </span>
      </div>

      {/* Hamburger (mobile) */}
      <button
        className="md:hidden ml-auto text-muted hover:text-primary p-2"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-surface border-b border-border px-6 py-4 flex flex-col gap-4">
          <NavLink to="/" className={linkClass} onClick={() => setMenuOpen(false)}>
            Live Feed
          </NavLink>
          <NavLink to="/hall-of-shame" className={linkClass} onClick={() => setMenuOpen(false)}>
            Hall of Shame
          </NavLink>
          <a
            href="https://t.me/rugradarbirdeyebot"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs px-3 py-2 rounded border border-[#229ED9]/40 text-[#229ED9] hover:bg-[#229ED9]/10 transition-colors w-fit"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L6.26 14.4l-2.956-.924c-.642-.204-.657-.642.136-.953l11.543-4.453c.537-.194 1.006.131.579.178z"/>
            </svg>
            🚨 Get Instant Rug Alerts
          </a>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-xs text-safe">
              <span className="w-2 h-2 rounded-full bg-safe animate-pulse inline-block" />
              LIVE
            </span>
            <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent border border-accent/30">
              SOLANA
            </span>
          </div>
        </div>
      )}
    </nav>
  )
}
