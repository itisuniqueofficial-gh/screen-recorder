import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { APP_NAME, APP_VERSION } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import {
  IconBars,
  IconClose,
  IconInfo,
  IconHistory,
  IconKeyboard,
  IconMoon,
  IconRecord,
  IconSettings,
  IconSun,
} from '@/components/ui/icons';

const NAV_ITEMS = [
  { to: '/', label: 'Record', icon: IconRecord, end: true },
  { to: '/history', label: 'History', icon: IconHistory },
  { to: '/settings', label: 'Settings', icon: IconSettings },
  { to: '/shortcuts', label: 'Shortcuts', icon: IconKeyboard },
  { to: '/about', label: 'About', icon: IconInfo },
];

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const cycle = () => setMode(mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light');
  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${mode}. Click to switch.`}
      title={`Theme: ${mode}`}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mode === 'dark' ? <IconMoon /> : <IconSun />}
    </button>
  );
}

function Brand() {
  return (
    <NavLink to="/" className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-accent text-accent-foreground">
        <IconRecord size={20} />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-semibold">{APP_NAME}</span>
        <span className="block text-xs text-muted-foreground">v{APP_VERSION}</span>
      </span>
    </NavLink>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="sr-scrollbar-none flex flex-col gap-1" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-11 shrink-0 items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`
          }
        >
          <Icon size={18} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconBars size={20} />
          </button>
          <Brand />
        </div>
        <ThemeToggle />
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <div
            className="sr-animate-fade-in absolute inset-0 bg-black/50"
            onClick={() => setMenuOpen(false)}
          />
          <div className="sr-animate-slide-in-left absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
              <Brand />
              <button
                type="button"
                aria-label="Close menu"
                autoFocus
                onClick={() => setMenuOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconClose size={20} />
              </button>
            </div>
            <div className="sr-scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4">
              <NavList onNavigate={() => setMenuOpen(false)} />
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3">
              <span className="text-xs text-muted-foreground">Privacy-first</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-border md:bg-surface">
        <div className="flex h-20 shrink-0 items-center px-6">
          <Brand />
        </div>
        <div className="sr-scrollbar-none min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <NavList />
        </div>
        <div className="flex shrink-0 items-center justify-between border-t border-border px-6 py-4">
          <span className="text-xs text-muted-foreground">Privacy-first</span>
          <ThemeToggle />
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="w-full max-w-[100rem] flex-1 self-center px-4 py-6 sm:px-5 lg:px-6 xl:px-8 2xl:px-12 3xl:max-w-[112rem] md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
