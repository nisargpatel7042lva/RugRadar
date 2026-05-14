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

      {/* Right: Live indicator + chain badge (desktop) */}
      <div className="hidden md:flex items-center gap-3 min-w-fit">
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
          <div className="flex items-center gap-3 pt-1">
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
