import { useSettingsStore } from '@/store/settingsStore';
import { SHORTCUTS, formatShortcutKeys } from '@/config/shortcuts';
import { IconKeyboard } from '@/components/ui/icons';
import { EmptyState, PageHeader } from '@/components/ui/primitives';

export default function ShortcutsPage() {
  const enabled = useSettingsStore((s) => s.settings.keyboardShortcutsEnabled);
  const setSetting = useSettingsStore((s) => s.setSetting);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Keyboard shortcuts"
        description="Control recording without touching the mouse."
        actions={
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setSetting('keyboardShortcutsEnabled', event.target.checked)}
              className="sr-checkbox"
            />
            Enabled
          </label>
        }
      />

      {enabled ? (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-medium text-muted-foreground">
                  Action
                </th>
                <th
                  scope="col"
                  className="hidden px-4 py-2.5 font-medium text-muted-foreground sm:table-cell"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-4 py-2.5 text-right font-medium text-muted-foreground"
                >
                  Shortcut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {SHORTCUTS.map((shortcut) => (
                <tr key={shortcut.id}>
                  <td className="px-4 py-3 font-medium">{shortcut.label}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {shortcut.description}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <kbd className="rounded-sm border border-border bg-surface px-2 py-1 text-xs text-foreground">
                      {formatShortcutKeys(shortcut.keys)}
                    </kbd>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon={<IconKeyboard size={28} />}
          title="Shortcuts are disabled"
          description="Turn them on above to start using keyboard shortcuts while recording."
        />
      )}

      <p className="sr-hint">
        Shortcuts are active anywhere in the app. “⌘/Ctrl + Shift + R” starts or stops a recording.
      </p>
    </div>
  );
}
