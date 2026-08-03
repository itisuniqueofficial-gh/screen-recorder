import { useRecorderStore } from '@/store/recorderStore';
import { useSettingsStore } from '@/store/settingsStore';
import { formatBitrate, formatBytes, formatDuration, formatNumber } from '@/utils/format';
import { APP_DESCRIPTION } from '@/constants';
import { Link } from 'react-router-dom';
import {
  IconAlert,
  IconMic,
  IconMonitor,
  IconPause,
  IconPlay,
  IconRecord,
  IconStop,
} from '@/components/ui/icons';
import { Spinner } from '@/components/ui/primitives';

const SOURCE_LABELS: Record<string, string> = {
  screen: 'Entire screen',
  window: 'Window',
  tab: 'Browser tab',
  webcam: 'Webcam',
};

const AUDIO_LABELS: Record<string, string> = {
  microphone: 'Microphone',
  system: 'System audio',
  tab: 'Tab audio',
  mixed: 'Mic + system',
  none: 'No audio',
};

export function RecorderPanel() {
  const status = useRecorderStore((s) => s.status);
  const stats = useRecorderStore((s) => s.stats);
  const error = useRecorderStore((s) => s.error);
  const countdownRemaining = useRecorderStore((s) => s.countdownRemaining);
  const start = useRecorderStore((s) => s.start);
  const pause = useRecorderStore((s) => s.pause);
  const resume = useRecorderStore((s) => s.resume);
  const stop = useRecorderStore((s) => s.stop);
  const clearError = useRecorderStore((s) => s.clearError);
  const settings = useSettingsStore((s) => s.settings);

  const busy = status === 'acquiring' || status === 'stopping' || status === 'processing';

  return (
    <div className="sr-card flex min-h-[60vh] w-full flex-col items-center justify-center gap-8 px-6 py-12 text-center sm:px-10">
      {status === 'error' ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-danger/10 text-danger">
            <IconAlert size={26} />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Couldn’t start recording</h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" className="sr-button-secondary" onClick={clearError}>
              Dismiss
            </button>
            <button type="button" className="sr-button-primary" onClick={() => void start()}>
              Try again
            </button>
          </div>
        </div>
      ) : status === 'countdown' ? (
        <div className="flex flex-col items-center gap-3">
          <span className="sr-animate-recording-pulse inline-flex h-4 w-4 rounded-sm bg-danger" />
          <p className="text-6xl font-bold tabular-nums text-accent">{countdownRemaining}</p>
          <p className="sr-hint">Recording starts automatically</p>
        </div>
      ) : status === 'recording' || status === 'paused' || status === 'stopping' ? (
        <ActiveRecording
          status={status}
          stats={stats}
          onPause={pause}
          onResume={resume}
          onStop={() => void stop()}
        />
      ) : busy ? (
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="text-accent" />
          <p className="sr-hint">
            {status === 'acquiring' ? 'Capturing your screen…' : 'Finalizing recording…'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-accent/10 text-accent">
            <IconRecord size={36} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">Ready to record</h1>
            <p className="mx-auto max-w-md text-sm text-muted-foreground">{APP_DESCRIPTION}</p>
          </div>

          <button
            type="button"
            onClick={() => void start()}
            className="inline-flex items-center gap-2.5 rounded-sm bg-accent px-8 py-3.5 text-base font-semibold text-accent-foreground transition-colors hover:opacity-90"
          >
            <IconRecord size={20} />
            Start recording
          </button>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1">
              <IconMonitor size={14} />
              {SOURCE_LABELS[settings.defaultSource] ?? settings.defaultSource}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1">
              <IconMic size={14} />
              {AUDIO_LABELS[settings.defaultAudio] ?? settings.defaultAudio}
            </span>
            <span className="rounded-sm border border-border px-2.5 py-1">
              {settings.defaultResolution} · {settings.defaultFps} fps
            </span>
            <span className="rounded-sm border border-border px-2.5 py-1">
              {settings.defaultCodec.toUpperCase()}
            </span>
          </div>

          <Link to="/settings" className="sr-hint underline-offset-2 hover:underline">
            Adjust capture options
          </Link>
        </div>
      )}
    </div>
  );
}

function ActiveRecording({
  status,
  stats,
  onPause,
  onResume,
  onStop,
}: {
  status: 'recording' | 'paused' | 'stopping';
  stats: ReturnType<typeof useRecorderStore.getState>['stats'];
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const paused = status === 'paused';
  const stopping = status === 'stopping';

  return (
    <div className="flex w-full max-w-2xl flex-col items-center gap-6">
      <div className="flex items-center gap-3">
        <span
          className={`h-3.5 w-3.5 rounded-sm ${
            paused ? 'bg-warning' : 'sr-animate-recording-pulse bg-danger'
          }`}
        />
        <span className="text-3xl font-semibold tabular-nums">
          {formatDuration(stats.elapsedMs)}
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Stat label="Size" value={formatBytes(stats.recordedBytes)} />
        <Stat label="Bitrate" value={stats.bitrate ? formatBitrate(stats.bitrate) : '—'} />
        <Stat label="FPS" value={stats.frameRate ? formatNumber(stats.frameRate) : '—'} />
        <Stat label="Dropped" value={formatNumber(stats.droppedFrames)} />
      </div>

      {!stopping && (
        <div className="flex items-center gap-3">
          {paused ? (
            <button
              type="button"
              onClick={onResume}
              className="sr-button-primary"
              disabled={status !== 'paused'}
            >
              <IconPlay size={18} />
              Resume
            </button>
          ) : (
            <button
              type="button"
              onClick={onPause}
              className="sr-button-secondary"
              disabled={status !== 'recording'}
            >
              <IconPause size={18} />
              Pause
            </button>
          )}
          <button type="button" onClick={onStop} className="sr-button-danger">
            <IconStop size={18} />
            Stop & save
          </button>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-border bg-background px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium tabular-nums">{value}</div>
    </div>
  );
}
