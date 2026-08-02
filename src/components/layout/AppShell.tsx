import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { APP_NAME, APP_VERSION } from '@/constants';
import { useTheme } from '@/hooks/useTheme';
import {
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
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {mode === 'dark' ? <IconMoon /> : <IconSun />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground md:flex-row">
      <aside className="border-b border-border bg-surface md:sticky md:top-0 md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex h-16 items-center justify-between px-4 md:h-20 md:justify-start md:gap-2">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <IconRecord size={18} />
            </span>
            <span className="hidden leading-tight md:block">
              <span className="block text-sm font-semibold">{APP_NAME}</span>
              <span className="block text-xs text-muted-foreground">v{APP_VERSION}</span>
            </span>
          </NavLink>
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        </div>

        <nav className="sr-scrollbar-none flex gap-1 overflow-x-auto px-2 pb-2 md:flex-1 md:flex-col md:gap-1 md:overflow-visible md:px-3 md:py-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <Icon size={18} />
              <span className="hidden md:inline">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-between border-t border-border px-4 py-3 md:flex">
          <span className="text-xs text-muted-foreground">Privacy-first</span>
          <ThemeToggle />
        </div>
      </aside>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}
