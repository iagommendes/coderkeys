import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/cn';

export function Header() {
  const { t } = useTranslation('common');

  return (
    <header className="border-b border-border bg-surface-elevated/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-accent">⌨</span>
          <span className="font-semibold tracking-tight">{t('appName')}</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn('text-muted transition hover:text-foreground', isActive && 'text-accent')
            }
          >
            {t('nav.catalog')}
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn('text-muted transition hover:text-foreground', isActive && 'text-accent')
            }
          >
            {t('nav.settings')}
          </NavLink>
          <a
            href="https://github.com/iagommendes/coderkeys"
            target="_blank"
            rel="noreferrer"
            className="text-muted transition hover:text-foreground"
          >
            {t('nav.github')}
          </a>
        </nav>
      </div>
    </header>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
