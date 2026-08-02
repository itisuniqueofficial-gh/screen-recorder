import { Link } from 'react-router-dom';
import {
  APP_BASE_URL,
  APP_DESCRIPTION,
  APP_KEYWORDS,
  APP_NAME,
  APP_REPO,
  APP_VERSION,
} from '@/constants';
import { IconExternalLink, IconGithub, IconKeyboard, IconWifiOff } from '@/components/ui/icons';
import { PageHeader, SectionCard } from '@/components/ui/primitives';

const PRIVACY_POINTS = [
  'Everything is processed locally in your browser using WebRTC and FFmpeg (WebAssembly).',
  'No account, no uploads, no analytics — your recordings never leave this device.',
  'Videos are stored in your browser’s IndexedDB and can be deleted at any time.',
];

export default function AboutPage() {
  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader title="About" description={APP_DESCRIPTION} />

      <SectionCard>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {APP_NAME}
          </span>
          <span className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">
            v{APP_VERSION}
          </span>
        </div>

        <div>
          <h2 className="text-base font-semibold">Privacy first</h2>
          <ul className="mt-2 space-y-2">
            {PRIVACY_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                <IconWifiOff size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          {APP_KEYWORDS.map((keyword) => (
            <span
              key={keyword}
              className="rounded-sm border border-border px-2.5 py-1 text-xs text-muted-foreground"
            >
              {keyword}
            </span>
          ))}
        </div>
      </SectionCard>

      <div className="flex flex-wrap gap-3">
        <a
          href={APP_REPO}
          target="_blank"
          rel="noopener noreferrer"
          className="sr-button-secondary"
        >
          <IconGithub size={18} />
          Source code
        </a>
        <a
          href={APP_BASE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="sr-button-secondary"
        >
          <IconExternalLink size={18} />
          Website
        </a>
        <Link to="/shortcuts" className="sr-button-secondary">
          <IconKeyboard size={18} />
          Keyboard shortcuts
        </Link>
      </div>
    </div>
  );
}
