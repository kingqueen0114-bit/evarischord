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
  const selectedPanelId = useEditorStore(state => state.selectedPanelId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDesktop = useMediaQuery('(min-width: 900px)');

  useEffect(() => {
    async function loadStoryboard() {
      try {
        const res = await fetch('/api/storyboard');
        if (!res.ok) throw new Error('Failed to load storyboard');
        const data = await res.json();
        setStoryboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
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
