import { useEffect, useState } from 'react';
import { useRecorderStore } from '@/store/recorderStore';
import { formatDuration } from '@/utils/format';
import { IconPause, IconPlay, IconStop } from '@/components/ui/icons';

const ACTIVE_STATUSES = new Set(['countdown', 'recording', 'paused', 'stopping']);

export function RecordingDock() {
  const status = useRecorderStore((s) => s.status);
  const stats = useRecorderStore((s) => s.stats);
  const countdownRemaining = useRecorderStore((s) => s.countdownRemaining);
  const pause = useRecorderStore((s) => s.pause);
  const resume = useRecorderStore((s) => s.resume);
  const stop = useRecorderStore((s) => s.stop);

  const [elapsed, setElapsed] = useState(stats.elapsedMs);

  useEffect(() => {
    if (status !== 'recording') return;
    setElapsed(stats.elapsedMs);
    const id = setInterval(() => setElapsed((value) => value + 250), 250);
    return () => clearInterval(id);
  }, [status, stats.elapsedMs]);

  if (!ACTIVE_STATUSES.has(status)) return null;

  const isCountdown = status === 'countdown';
  const isPaused = status === 'paused';
  const isStopping = status === 'stopping';

  return (
    <div className="sr-animate-slide-up fixed bottom-4 left-1/2 z-50 -translate-x-1/2 sm:bottom-6">
      <div className="flex items-center gap-2 rounded-sm border border-border bg-surface px-3 py-2">
        {isCountdown ? (
          <div className="flex min-w-40 items-center justify-center gap-3">
            <span className="sr-animate-recording-pulse inline-flex h-2.5 w-2.5 rounded-sm bg-danger" />
            <span className="text-sm font-semibold tabular-nums">
              Starting in {countdownRemaining}
            </span>
            <button
              type="button"
              onClick={() => useRecorderStore.getState().cancel()}
              className="flex min-h-11 items-center rounded-sm bg-danger px-4 text-sm font-medium text-white hover:opacity-90"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-sm ${
                  isPaused ? 'bg-warning' : 'sr-animate-recording-pulse bg-danger'
                }`}
              />
              <span className="text-sm font-medium tabular-nums">{formatDuration(elapsed)}</span>
              {isStopping && <span className="text-xs text-muted-foreground">Finalizing…</span>}
            </div>

            {!isStopping && (
              <>
                {isPaused ? (
                  <button
                    type="button"
                    onClick={resume}
                    aria-label="Resume recording"
                    title="Resume"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-accent text-accent-foreground hover:opacity-90"
                  >
                    <IconPlay size={18} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={pause}
                    aria-label="Pause recording"
                    title="Pause"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-accent text-accent-foreground hover:opacity-90"
                  >
                    <IconPause size={18} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => void stop()}
                  aria-label="Stop recording"
                  title="Stop"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-sm bg-danger text-white hover:opacity-90"
                >
                  <IconStop size={18} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
