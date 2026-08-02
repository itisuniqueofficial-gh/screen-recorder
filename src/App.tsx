/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { useSettingsStore } from '@/store/settingsStore';
import { KeyboardShortcuts } from '@/components/recorder/KeyboardShortcuts';
import { RecordingDock } from '@/components/recorder/RecordingDock';

const RecordPage = lazy(() => import('@/pages/RecordPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ShortcutsPage = lazy(() => import('@/pages/ShortcutsPage'));

function ScrollRestoration(): null {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function RedirectHandler(): null {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    if (pathname === '/') return;
    const known = ['/history', '/settings', '/about', '/shortcuts'];
    if (!known.includes(pathname)) {
      navigate('/', { replace: true });
    }
  }, [pathname, navigate]);
  return null;
}

function RootLayout(): React.ReactElement {
  const settings = useSettingsStore((state) => state.settings);
  return (
    <>
      <ScrollRestoration />
      <RedirectHandler />
      <AppShell>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <div className="sr-hint">Loading…</div>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </AppShell>
      {settings.keyboardShortcutsEnabled ? <KeyboardShortcuts /> : null}
      <RecordingDock />
    </>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <RecordPage /> },
      { path: 'history', element: <HistoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'shortcuts', element: <ShortcutsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
