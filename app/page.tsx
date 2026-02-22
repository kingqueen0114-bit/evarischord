'use client';

import { useEffect, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import Header from '@/components/ui/Header';
import PanelNavigator from '@/components/ui/PanelNavigator';
import WebtoonCanvas from '@/components/canvas/WebtoonCanvas';
import EditorPanel from '@/components/ui/EditorPanel';

export default function Home() {
  const setStoryboard = useEditorStore(state => state.setStoryboard);
  const selectedPanelId = useEditorStore(state => state.selectedPanelId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Canvas Area */}
        <div className={`flex-1 overflow-y-auto ${selectedPanelId ? 'pb-72 md:pb-0' : ''}`}>
          <WebtoonCanvas />
        </div>

        {/* Desktop SidePanel / Mobile BottomSheet */}
        {selectedPanelId && (
          <div className="
            absolute bottom-0 left-0 right-0 h-72 border-t border-[var(--border)] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50
            md:relative md:top-0 md:h-full md:w-96 md:border-t-0 md:border-l md:shadow-none
          " style={{ transition: 'transform 0.3s ease-out' }}>
            <EditorPanel />
          </div>
        )}
      </div>
    </main>
  );
}
