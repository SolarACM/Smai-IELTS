import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Logo from './Logo.jsx'
import SettingsModal from './SettingsModal.jsx'

const nav = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/speaking', label: 'Speaking' },
  { to: '/writing', label: 'Writing' },
  { to: '/reading', label: 'Reading' },
  { to: '/listening', label: 'Listening' },
]

export default function Layout({ children }) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-navy-100/70 bg-parchment/80 backdrop-blur">
        <div className="container-app flex h-16 items-center justify-between">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                className={({ isActive }) =>
                  'rounded-full px-3.5 py-2 text-sm font-semibold transition ' +
                  (isActive ? 'bg-navy-50 text-ink' : 'text-navy-500 hover:text-ink')
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setSettingsOpen(true)} className="btn-ghost hidden sm:inline-flex">
              ⚙ ตั้งค่า AI
            </button>
            <button
              className="grid h-10 w-10 place-items-center rounded-lg ring-1 ring-navy-100 md:hidden"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-navy-100 bg-parchment md:hidden">
            <div className="container-app flex flex-col gap-1 py-3">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    'rounded-lg px-3 py-2.5 text-sm font-semibold ' +
                    (isActive ? 'bg-navy-50 text-ink' : 'text-navy-600')
                  }
                >
                  {n.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  setSettingsOpen(true)
                }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-navy-600"
              >
                ⚙ ตั้งค่า AI
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-navy-100 bg-white">
        <div className="container-app flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <Logo />
        </div>
      </footer>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
