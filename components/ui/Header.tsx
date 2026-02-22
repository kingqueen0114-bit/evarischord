import { useEditorStore } from '@/stores/editorStore';

export default function Header() {
    const { storyboard, undo, redo, canUndo, canRedo, selectedPanelId, zoom, setZoom } = useEditorStore();

    const handleExport = () => {
        if (!selectedPanelId) {
            alert('書き出すパネルを選択してください。');
            return;
        }

        // We get the Konva Stages within the selected panel container
        // If split, there may be multiple. For now, if there are multiple, we'll just download the first one found or prompt the user.
        // As a simple MVP implementation for Phase 4: download all canvases found under this panel id
        const panelNode = document.getElementById(`panel-${selectedPanelId}`);
        if (!panelNode) return;

        const stageContainers = panelNode.querySelectorAll('.konvajs-content');
        if (!stageContainers || stageContainers.length === 0) {
            alert('Konvaキャンバスが見つかりません。');
            return;
        }

        stageContainers.forEach((container, index) => {
            // Traverse down to get the underlying canvas element
            const canvas = container.querySelector('canvas');
            if (!canvas) return;

            // Since window.devicePixelRatio is applied to the Stage, the raw canvas dataURL
            // naturally contains the high-res image.
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            const suffix = stageContainers.length > 1 ? `-f${index + 1}` : '';
            link.download = `panel-${selectedPanelId}${suffix}.jpg`;
            link.href = dataUrl;
            link.click();
        });
    };

    return (
        <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-4 sticky top-0 z-50">
            <div className="flex items-center gap-4">
                <h1 className="font-bold text-lg tracking-wider">
                    {storyboard ? `${storyboard.title} - ${storyboard.episode}` : 'EVARIS CHORD Editor'}
                </h1>
                <div className="hidden md:flex gap-2 text-xs bg-[var(--background)] border border-[var(--border)] px-2 py-1 rounded text-[var(--color-text-dim)]">
                    Phase 3 MVP
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border-r border-[var(--border)] pr-2 mr-2">
                    <button
                        disabled={!canUndo()}
                        onClick={undo}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--background)] disabled:opacity-30 tooltip-wrap"
                        title="元に戻す (Ctrl+Z)"
                    >
                        ↶
                    </button>
                    <button
                        disabled={!canRedo()}
                        onClick={redo}
                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--background)] disabled:opacity-30 tooltip-wrap"
                        title="やり直す (Ctrl+Shift+Z)"
                    >
                        ↷
                    </button>
                </div>

                <div className="flex items-center gap-2 bg-[var(--background)] px-2 py-1 rounded border border-[var(--border)] mr-2">
                    <button
                        onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                        className="w-6 h-6 hover:bg-[#3a3a44] rounded text-lg font-bold flex items-center justify-center leading-none"
                        title="縮小 (-)"
                    >
                        -
                    </button>
                    <span className="text-xs font-mono w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(Math.min(3.0, zoom + 0.1))}
                        className="w-6 h-6 hover:bg-[#3a3a44] rounded text-lg font-bold flex items-center justify-center leading-none"
                        title="拡大 (+)"
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={handleExport}
                    disabled={!selectedPanelId}
                    className="text-sm bg-[var(--border)] hover:bg-[var(--background)] px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                >
                    🖼️ 書き出し
                </button>

                <button
                    className="text-sm bg-[var(--accent)] text-white px-4 py-1.5 rounded font-medium hover:bg-opacity-90 transition-opacity"
                    onClick={async () => {
                        if (!storyboard) return;
                        try {
                            const res = await fetch('/api/storyboard', {
                                method: 'PUT',
                                body: JSON.stringify(storyboard)
                            });
                            if (res.ok) alert('Saved successfully!');
                            else alert('Failed to save.');
                        } catch (e) {
                            alert('Error saving storyboard.');
                        }
                    }}
                >
                    保存
                </button>
            </div>
        </header>
    );
}
