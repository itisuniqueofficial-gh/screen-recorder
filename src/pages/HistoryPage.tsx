import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistoryStore } from '@/store/historyStore';
import type { RecordingRecord } from '@/types/settings';
import { trimRecording, type TrimRange } from '@/lib/trim';
import { copyBlobToClipboard, downloadBlob, shareBlob } from '@/lib/export';
import {
  formatBitrate,
  formatBytes,
  formatDate,
  formatDuration,
  formatNumber,
} from '@/utils/format';
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconDownload,
  IconEdit,
  IconFilm,
  IconPlay,
  IconShare,
  IconStar,
  IconStarOutline,
  IconTrash,
  IconTrim,
} from '@/components/ui/icons';
import { EmptyState, Spinner } from '@/components/ui/primitives';

function extensionFor(mimeType: string): string {
  return mimeType.includes('mp4') ? 'mp4' : 'webm';
}

export default function HistoryPage() {
  const records = useHistoryStore((s) => s.records);
  const hydrate = useHistoryStore((s) => s.hydrate);
  const remove = useHistoryStore((s) => s.remove);
  const clearAll = useHistoryStore((s) => s.clearAll);
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite);
  const rename = useHistoryStore((s) => s.rename);

  const [query, setQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [playing, setPlaying] = useState<RecordingRecord | null>(null);
  const [trimming, setTrimming] = useState<RecordingRecord | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((record) => {
      if (favoritesOnly && !record.favorite) return false;
      if (!q) return true;
      return record.name.toLowerCase().includes(q);
    });
  }, [records, query, favoritesOnly]);

  const handleClearAll = async () => {
    if (records.length === 0) return;
    if (window.confirm(`Delete all ${records.length} recordings? This cannot be undone.`)) {
      await clearAll();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {records.length === 0
              ? 'Your recordings will appear here.'
              : `${formatNumber(records.length)} recording${records.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {records.length > 0 && (
          <button
            type="button"
            className="sr-button-secondary"
            onClick={() => void handleClearAll()}
          >
            <IconTrash size={16} />
            Clear all
          </button>
        )}
      </header>

      {records.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search recordings…"
            aria-label="Search recordings"
            className="sr-input w-full sm:w-72"
          />
          <button
            type="button"
            aria-pressed={favoritesOnly}
            onClick={() => setFavoritesOnly((value) => !value)}
            className={`sr-button-secondary ${favoritesOnly ? 'text-accent' : ''}`}
          >
            <IconStar size={16} />
            Favorites
          </button>
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          icon={<IconFilm size={28} />}
          title="No recordings yet"
          description="Record your screen and it will be saved here automatically."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconFilm size={28} />}
          title="Nothing matches"
          description="Try a different search or clear the favorites filter."
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((record) => (
            <RecordingCard
              key={record.id}
              record={record}
              onPlay={() => setPlaying(record)}
              onTrim={() => setTrimming(record)}
              onToggleFavorite={() => void toggleFavorite(record.id)}
              onRemove={() => void remove(record.id)}
              onRename={(name) => void rename(record.id, name)}
            />
          ))}
        </ul>
      )}

      {playing && <PlaybackModal record={playing} onClose={() => setPlaying(null)} />}
      {trimming && <TrimModal record={trimming} onClose={() => setTrimming(null)} />}
    </div>
  );
}

function RecordingCard({
  record,
  onPlay,
  onTrim,
  onToggleFavorite,
  onRemove,
  onRename,
}: {
  record: RecordingRecord;
  onPlay: () => void;
  onTrim: () => void;
  onToggleFavorite: () => void;
  onRemove: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(record.name);
  const [copied, setCopied] = useState(false);
  const url = useRef(URL.createObjectURL(record.blob));

  useEffect(() => () => URL.revokeObjectURL(url.current), []);

  const commitRename = () => {
    const next = draft.trim();
    if (next) onRename(next);
    setEditing(false);
  };

  const handleCopy = async () => {
    try {
      await copyBlobToClipboard(record.blob);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard unsupported; ignore. */
    }
  };

  const handleShare = async () => {
    try {
      await shareBlob(record.blob, `${record.name}.${extensionFor(record.mimeType)}`);
    } catch {
      /* Share unsupported or cancelled; ignore. */
    }
  };

  return (
    <li className="sr-card group flex flex-col gap-3">
      <button
        type="button"
        onClick={onPlay}
        className="relative aspect-video overflow-hidden rounded-md bg-black/10"
        aria-label={`Play ${record.name}`}
      >
        <video src={url.current} className="h-full w-full object-cover" preload="metadata" muted />
        <span className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <IconPlay size={20} />
          </span>
        </span>
        <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs tabular-nums text-white">
          {formatDuration(record.durationMs)}
        </span>
      </button>

      <div className="flex items-start justify-between gap-2">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitRename();
              if (event.key === 'Escape') setEditing(false);
            }}
            className="sr-input w-full py-1 text-sm"
            aria-label="Recording name"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(record.name);
              setEditing(true);
            }}
            className="text-left text-sm font-medium leading-snug hover:text-accent"
            title="Rename"
          >
            {record.name}
          </button>
        )}
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={record.favorite ? 'Remove from favorites' : 'Add to favorites'}
          className={`mt-0.5 shrink-0 ${record.favorite ? 'text-warning' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {record.favorite ? <IconStar size={18} /> : <IconStarOutline size={18} />}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {formatDate(record.createdAt)} · {formatBytes(record.sizeBytes)} · {record.width}×
        {record.height} · {record.codec?.toUpperCase()}
      </p>

      <div className="flex items-center gap-1 border-t border-border pt-2">
        <CardAction
          label="Download"
          onClick={() =>
            downloadBlob(record.blob, `${record.name}.${extensionFor(record.mimeType)}`)
          }
        >
          <IconDownload size={16} />
        </CardAction>
        <CardAction label="Copy to clipboard" onClick={() => void handleCopy()}>
          {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
        </CardAction>
        <CardAction label="Trim" onClick={onTrim}>
          <IconTrim size={16} />
        </CardAction>
        <CardAction
          label="Rename"
          onClick={() => {
            setDraft(record.name);
            setEditing(true);
          }}
        >
          <IconEdit size={16} />
        </CardAction>
        <CardAction label="Share" onClick={() => void handleShare()}>
          <IconShare size={16} />
        </CardAction>
        <CardAction
          label="Delete"
          danger
          onClick={() => {
            if (window.confirm('Delete this recording?')) onRemove();
          }}
        >
          <IconTrash size={16} />
        </CardAction>
      </div>
    </li>
  );
}

function CardAction({
  label,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        danger
          ? 'text-muted-foreground hover:bg-danger/10 hover:text-danger'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      {children}
    </button>
  );
}

function PlaybackModal({ record, onClose }: { record: RecordingRecord; onClose: () => void }) {
  const url = URL.createObjectURL(record.blob);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <ModalShell title={record.name} onClose={onClose}>
      <video src={url} controls autoPlay className="max-h-[60vh] w-full rounded-md bg-black" />
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
        <MetaItem label="Duration" value={formatDuration(record.durationMs)} />
        <MetaItem label="Size" value={formatBytes(record.sizeBytes)} />
        <MetaItem label="Resolution" value={`${record.width}×${record.height}`} />
        <MetaItem label="FPS" value={String(record.fps)} />
        <MetaItem label="Codec" value={record.codec?.toUpperCase()} />
        <MetaItem label="Bitrate" value={record.bitrate ? formatBitrate(record.bitrate) : '—'} />
      </dl>
    </ModalShell>
  );
}

function TrimModal({ record, onClose }: { record: RecordingRecord; onClose: () => void }) {
  const replaceBlob = useHistoryStore((s) => s.replaceBlob);
  const [range, setRange] = useState<TrimRange>({ startMs: 0, endMs: record.durationMs });
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const durationSeconds = Math.max(1, record.durationMs / 1000);
  const startSeconds = range.startMs / 1000;
  const endSeconds = range.endMs / 1000;

  const run = async () => {
    setBusy(true);
    setError(null);
    setProgress(0);
    try {
      const result = await trimRecording(record, range, (p) => setProgress(p));
      await replaceBlob(record.id, result.blob, {
        mimeType: result.mimeType,
        sizeBytes: result.sizeBytes,
        durationMs: result.durationMs,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Trimming failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell title="Trim recording" onClose={onClose}>
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span className="text-muted-foreground">Start</span>
        <span className="font-medium">{formatDuration(range.startMs)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={durationSeconds}
        step={0.25}
        value={startSeconds}
        onChange={(e) => {
          const value = Math.min(Number(e.target.value) * 1000, range.endMs - 250);
          setRange((r) => ({ ...r, startMs: value }));
        }}
        className="w-full accent-accent"
      />
      <div className="flex items-center justify-between text-sm tabular-nums">
        <span className="text-muted-foreground">End</span>
        <span className="font-medium">{formatDuration(range.endMs)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={durationSeconds}
        step={0.25}
        value={endSeconds}
        onChange={(e) => {
          const value = Math.max(Number(e.target.value) * 1000, range.startMs + 250);
          setRange((r) => ({ ...r, endMs: value }));
        }}
        className="w-full accent-accent"
      />
      <p className="sr-hint">
        Selected: {formatDuration(range.endMs - range.startMs)} of{' '}
        {formatDuration(record.durationMs)}
      </p>

      {busy && (
        <div className="flex items-center gap-3">
          <Spinner className="h-5 w-5 text-accent" />
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex justify-end gap-2">
        <button type="button" className="sr-button-secondary" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className="sr-button-primary"
          onClick={() => void run()}
          disabled={busy}
        >
          <IconTrim size={16} />
          Trim & save
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="sr-animate-slide-up max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-lg font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <IconClose size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border px-3 py-2">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}
