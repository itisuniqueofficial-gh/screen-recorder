import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/hooks/useTheme';
import type { ReactNode } from 'react';
import type { AppSettings } from '@/types/settings';
import { IconCheck, IconMonitor, IconMoon, IconSettings, IconSun } from '@/components/ui/icons';
import { PageHeader, SectionCard } from '@/components/ui/primitives';

type ThemeMode = AppSettings['theme'];

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: (p: { size?: number }) => ReactNode;
}[] = [
  { value: 'light', label: 'Light', icon: IconSun },
  { value: 'dark', label: 'Dark', icon: IconMoon },
  { value: 'system', label: 'System', icon: IconMonitor },
];

const RESOLUTION_OPTIONS = ['720p', '1080p', '1440p', '4k'] as const;
const FPS_OPTIONS = [24, 30, 60] as const;
const CODEC_OPTIONS = ['vp8', 'vp9', 'h264', 'av1'] as const;
const SOURCE_OPTIONS = ['screen', 'window', 'tab', 'webcam'] as const;
const AUDIO_OPTIONS = ['microphone', 'system', 'tab', 'mixed', 'none'] as const;

export default function SettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const setSetting = useSettingsStore((s) => s.setSetting);
  const setAudioProcessing = useSettingsStore((s) => s.setAudioProcessing);
  const setStorageSetting = useSettingsStore((s) => s.setStorageSetting);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const { setMode } = useTheme();

  const handleTheme = (value: ThemeMode) => {
    setSetting('theme', value);
    setMode(value);
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to their defaults?')) {
      resetSettings();
      setMode(DEFAULT_THEME);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8">
      <PageHeader
        title="Settings"
        description="Capture options, recording behaviour, export and storage."
        actions={
          <button type="button" className="sr-button-secondary" onClick={handleReset}>
            <IconSettings size={16} />
            Reset to defaults
          </button>
        }
      />

      <form
        className="flex w-full flex-col gap-8"
        onSubmit={(event) => event.preventDefault()}
        onReset={() => {
          resetSettings();
          setMode(DEFAULT_THEME);
        }}
      >
        <SectionCard title="Appearance" description="How the app looks on this device.">
          <div className="flex w-full flex-col gap-3">
            <span className="sr-label">Theme</span>
            <div role="radiogroup" aria-label="Theme" className="grid w-full grid-cols-3 gap-3">
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={settings.theme === value}
                  onClick={() => handleTheme(value)}
                  className={`inline-flex min-h-12 flex-col items-center justify-center gap-1.5 rounded-sm border px-3 py-3 text-sm font-medium transition-colors ${
                    settings.theme === value
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Capture" description="Defaults used when you start a recording.">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Resolution"
              value={settings.defaultResolution}
              onChange={(value) => setSetting('defaultResolution', value)}
              options={RESOLUTION_OPTIONS.map((v) => ({ value: v, label: v }))}
            />
            <SelectField
              label="Frame rate"
              value={settings.defaultFps}
              onChange={(value) => setSetting('defaultFps', value)}
              options={FPS_OPTIONS.map((v) => ({ value: v, label: `${v} fps` }))}
            />
            <SelectField
              label="Codec"
              value={settings.defaultCodec}
              onChange={(value) => setSetting('defaultCodec', value)}
              options={CODEC_OPTIONS.map((v) => ({ value: v, label: v.toUpperCase() }))}
            />
            <SelectField
              label="Source"
              value={settings.defaultSource}
              onChange={(value) => setSetting('defaultSource', value)}
              options={SOURCE_OPTIONS.map((v) => ({ value: v, label: v }))}
            />
            <SelectField
              label="Audio"
              value={settings.defaultAudio}
              onChange={(value) => setSetting('defaultAudio', value)}
              options={AUDIO_OPTIONS.map((v) => ({ value: v, label: v }))}
            />
            <NumberField
              label="Countdown (seconds)"
              value={settings.countdown}
              min={0}
              max={10}
              step={0.5}
              onChange={(value) => setSetting('countdown', value)}
            />
            <NumberField
              label="Bitrate (kbps)"
              value={settings.defaultBitrateKbps}
              min={200}
              max={20_000}
              step={100}
              onChange={(value) => setSetting('defaultBitrateKbps', value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Recording" description="Behaviour while capturing.">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <ToggleField
              label="Show cursor"
              description="Include the mouse cursor in the recording."
              checked={settings.recordCursor}
              onChange={(value) => setSetting('recordCursor', value)}
            />
            <ToggleField
              label="Click highlight"
              description="Highlight mouse clicks while recording."
              checked={settings.clickHighlight}
              onChange={(value) => setSetting('clickHighlight', value)}
            />
            <ToggleField
              label="Picture-in-picture"
              description="Show a self-view while recording."
              checked={settings.pictureInPicture}
              onChange={(value) => setSetting('pictureInPicture', value)}
            />
            <ToggleField
              label="Watermark"
              description="Overlay text on the recording."
              checked={settings.watermark}
              onChange={(value) => setSetting('watermark', value)}
            />
          </div>
          {settings.watermark && (
            <TextField
              label="Watermark text"
              value={settings.watermarkText}
              onChange={(value) => setSetting('watermarkText', value)}
              className="sm:col-span-2"
            />
          )}
          <ToggleField
            label="Auto-name"
            description="Generate descriptive file names automatically."
            checked={settings.autoName}
            onChange={(value) => setSetting('autoName', value)}
          />
          <ToggleField
            label="Confirm before discarding"
            description="Ask before discarding an in-progress recording."
            checked={settings.showConfirmDialog}
            onChange={(value) => setSetting('showConfirmDialog', value)}
          />
          <ToggleField
            label="Keyboard shortcuts"
            description="Allow global shortcuts while the app is open."
            checked={settings.keyboardShortcutsEnabled}
            onChange={(value) => setSetting('keyboardShortcutsEnabled', value)}
          />
        </SectionCard>

        <SectionCard title="Export" description="Output and download behaviour.">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectField
              label="Output format"
              value={settings.outputFormat}
              onChange={(value) => setSetting('outputFormat', value)}
              options={[
                { value: 'webm', label: 'WebM' },
                { value: 'mp4', label: 'MP4' },
              ]}
            />
            <NumberField
              label="GIF frame rate"
              value={settings.gifFps}
              min={1}
              max={60}
              step={1}
              onChange={(value) => setSetting('gifFps', value)}
            />
            <ToggleField
              label="Auto-download"
              description="Download the recording when it finishes."
              checked={settings.autoDownload}
              onChange={(value) => setSetting('autoDownload', value)}
            />
          </div>
        </SectionCard>

        <SectionCard title="Advanced" description="Audio processing and storage.">
          <div className="flex w-full flex-col gap-4">
            <h3 className="sr-label">Audio processing</h3>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <ToggleField
                label="Echo cancellation"
                description="Suppress feedback from speakers."
                checked={settings.audioProcessing.echoCancellation}
                onChange={(value) => setAudioProcessing('echoCancellation', value)}
              />
              <ToggleField
                label="Noise suppression"
                description="Reduce background noise."
                checked={settings.audioProcessing.noiseSuppression}
                onChange={(value) => setAudioProcessing('noiseSuppression', value)}
              />
              <ToggleField
                label="Auto gain control"
                description="Normalise microphone volume."
                checked={settings.audioProcessing.autoGainControl}
                onChange={(value) => setAudioProcessing('autoGainControl', value)}
              />
            </div>

            <h3 className="sr-label mt-4">Storage</h3>
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
              <ToggleField
                label="Keep drafts"
                description="Retain interrupted recordings for recovery."
                checked={settings.storage.keepDrafts}
                onChange={(value) => setStorageSetting('keepDrafts', value)}
              />
              <NumberField
                label="Maximum drafts"
                description="Oldest drafts are removed beyond this limit."
                value={settings.storage.maxDrafts}
                min={0}
                max={20}
                step={1}
                onChange={(value) => setStorageSetting('maxDrafts', value)}
              />
            </div>
          </div>
        </SectionCard>

        <div className="flex w-full justify-end border-t border-border pt-6">
          <button type="submit" className="sr-button-primary">
            <IconCheck size={16} />
            Save
          </button>
        </div>
      </form>
    </div>
  );
}

const DEFAULT_THEME: ThemeMode = 'system';

interface Option<T extends string | number> {
  value: T;
  label: string;
}

function SelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  className = '',
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Option<T>[];
  className?: string;
}) {
  return (
    <label className={`block w-full ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <select
        value={String(value)}
        onChange={(event) => {
          const option = options.find((o) => String(o.value) === event.target.value);
          if (option) onChange(option.value);
        }}
        className="sr-select"
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`block w-full ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="sr-input"
      />
    </label>
  );
}

function NumberField({
  label,
  description,
  value,
  min,
  max,
  step,
  onChange,
  className = '',
}: {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  return (
    <label className={`block w-full ${className}`}>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {description && (
        <span className="mb-1 block text-xs text-muted-foreground">{description}</span>
      )}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isNaN(parsed)) onChange(parsed);
        }}
        className="sr-input"
      />
    </label>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
  className = '',
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  className?: string;
}) {
  return (
    <label
      className={`flex w-full min-h-11 cursor-pointer items-start gap-3 rounded-sm py-2 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-checkbox mt-1"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && <span className="block text-xs text-muted-foreground">{description}</span>}
      </span>
    </label>
  );
}
