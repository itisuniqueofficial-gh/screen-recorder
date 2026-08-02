import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex w-full flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
    </header>
  );
}

export function SectionCard({
  title,
  description,
  className = '',
  children,
}: {
  title?: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={`sr-card flex w-full flex-col gap-5 p-5 sm:p-6 ${className}`.trim()}>
      {(title || description) && (
        <div>
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  active?: boolean;
  danger?: boolean;
}

export function IconButton({
  label,
  active = false,
  danger = false,
  className = '',
  children,
  ...rest
}: IconButtonProps) {
  const tone = danger
    ? 'text-danger hover:bg-danger/10'
    : active
      ? 'bg-accent/10 text-accent'
      : 'text-muted-foreground hover:bg-muted hover:text-foreground';
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-11 w-11 items-center justify-center rounded-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${tone} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <i
      aria-hidden="true"
      className={`fa-solid fa-circle-notch fa-spin ${className}`}
      style={{ fontSize: size }}
    />
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-muted text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
