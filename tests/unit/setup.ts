import '@testing-library/jest-dom/vitest';

type MatchMediaListener = (event: MediaQueryListEvent) => void;

interface MockMediaQueryList extends MediaQueryList {
  onchange: ((event: MediaQueryListEvent) => void) | null;
  listeners: Set<MatchMediaListener>;
  dispatchEvent(event: Event): boolean;
}

function createMockMatchMedia(query: string): MockMediaQueryList {
  const matches = query.includes('prefers-color-scheme: dark');
  let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

  const list: MockMediaQueryList = {
    media: query,
    matches,
    onchange: null,
    listeners: new Set(),
    addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
      if (type === 'change' && typeof listener === 'function') {
        list.listeners.add(listener as MatchMediaListener);
      }
    },
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
      if (type === 'change') {
        list.listeners.delete(listener as MatchMediaListener);
      }
    },
    addListener(listener: MatchMediaListener): void {
      list.listeners.add(listener);
    },
    removeListener(listener: MatchMediaListener): void {
      list.listeners.delete(listener);
    },
    dispatchEvent(event: Event): boolean {
      const mqEvent = event as MediaQueryListEvent;
      if (typeof changeListener === 'function') changeListener(mqEvent);
      for (const listener of [...list.listeners]) listener(mqEvent);
      return true;
    },
  };

  Object.defineProperty(list, 'onchange', {
    get: () => changeListener,
    set: (value: ((event: MediaQueryListEvent) => void) | null) => {
      changeListener = value;
    },
  });

  return list;
}

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = createMockMatchMedia as unknown as typeof window.matchMedia;
}
