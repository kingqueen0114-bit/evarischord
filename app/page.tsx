'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import Header from '@/components/ui/Header';
import PanelNavigator from '@/components/ui/PanelNavigator';
import WebtoonCanvas from '@/components/canvas/WebtoonCanvas';
import EditorPanel from '@/components/ui/EditorPanel';
import BottomSheet from '@/components/ui/BottomSheet';
import SidePanel from '@/components/ui/SidePanel';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

export default function Home() {
  const setStoryboard = useEditorStore(state => state.setStoryboard);
  const setZoom = useEditorStore(state => state.setZoom);
  const selectedPanelId = useEditorStore(state => state.selectedPanelId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery('(min-width: 900px)');

  // Auto-fit zoom for mobile: fit 800px canvas into screen width
  // Uses the smallest reliable viewport measurement to avoid inflated values
  // from content overflow or DevTools quirks.
  useEffect(() => {
    const computeMobileZoom = () => {
      if (isDesktop) {
        setZoom(1.0);
        return;
      }
      const canvasWidth = 800;
      // Use the smallest of several width measurements to get the true
      // device viewport width, regardless of content overflow or layout.
      const viewportWidth = Math.min(
        window.innerWidth,
        document.documentElement.clientWidth,
        window.screen?.width ?? Infinity
      );
      const fitZoom = Math.round((viewportWidth / canvasWidth) * 100) / 100;
      setZoom(Math.min(fitZoom, 1.0));
    };

    computeMobileZoom();

    // Recalculate on resize (e.g. orientation change)
    window.addEventListener('resize', computeMobileZoom);
    return () => window.removeEventListener('resize', computeMobileZoom);
  }, [isDesktop, setZoom]);

  useEffect(() => {
    async function loadStoryboard() {
      try {
        // Try localStorage first (for Vercel deployment / offline)
        const stored = useEditorStore.getState().loadFromStorage();
        if (stored) {
          setStoryboard(stored);
          setLoading(false);
          return;
        }

        // Fallback: fetch from static file (works on Vercel)
        const res = await fetch('/ep001-storyboard.json');
        if (res.ok) {
          const data = await res.json();
          setStoryboard(data);
          setLoading(false);
          return;
        }

        // Try API route as last resort (works on local dev)
        const apiRes = await fetch('/api/storyboard');
        if (!apiRes.ok) throw new Error('Failed to load storyboard');
        const data = await apiRes.json();
        setStoryboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'All storyboard sources failed');
      } finally {
        setLoading(false);
      }
    }
    loadStoryboard();
  }, [setStoryboard]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--color-text-dim)]">
      Loading EVARIS CHORD Editor...
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex items-center justify-center bg-[var(--background)] text-[var(--color-danger)]">
      Error: {error}
    </div>
  );

  return (
    <main className="flex flex-col h-screen overflow-hidden">
      <Header />
      <PanelNavigator />
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area */}
        <div className={`flex-1 overflow-y-auto ${!isDesktop && selectedPanelId ? 'pb-80' : ''}`}>
          <WebtoonCanvas />
        </div>

        {/* Desktop: SidePanel (right, always visible) */}
        {isDesktop && <SidePanel />}

        {/* Mobile: BottomSheet (slide up from bottom) */}
        {!isDesktop && (
          <BottomSheet open={!!selectedPanelId}>
            <EditorPanel />
          </BottomSheet>
        )}
      </div>
    </main>
  );
}
