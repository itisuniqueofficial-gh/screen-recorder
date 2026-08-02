import { useEffect } from 'react';
import { useRecorderStore } from '@/store/recorderStore';
import { isMac } from '@/config/shortcuts';

export function KeyboardShortcuts(): null {
  const start = useRecorderStore((s) => s.start);
  const stop = useRecorderStore((s) => s.stop);
  const pause = useRecorderStore((s) => s.pause);
  const resume = useRecorderStore((s) => s.resume);
  const cancel = useRecorderStore((s) => s.cancel);
  const status = useRecorderStore((s) => s.status);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = isMac() ? event.metaKey : event.ctrlKey;
      if (!mod || !event.shiftKey) return;
      const code = event.code;

      if (code === 'KeyR') {
        event.preventDefault();
        if (status === 'idle' || status === 'error') void start();
        else void stop();
      } else if (code === 'KeyP') {
        event.preventDefault();
        if (status === 'recording') pause();
        else if (status === 'paused') resume();
      } else if (code === 'KeyX') {
        event.preventDefault();
        if (status === 'recording' || status === 'paused' || status === 'countdown') cancel();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status, start, stop, pause, resume, cancel]);

  return null;
}
