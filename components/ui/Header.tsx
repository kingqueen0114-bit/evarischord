import { useEditorStore } from '@/stores/editorStore';

export default function Header() {
    const { storyboard, undo, redo, canUndo, canRedo, selectedPanelId, zoom, setZoom } = useEditorStore();

    const handleExport = () => {
        if (!selectedPanelId) {
            alert('書き出すパネルを選択してください。');
            return;
        }

        const panelNode = document.getElementById(`panel-${selectedPanelId}`);
        if (!panelNode) return;

        const stageContainers = panelNode.querySelectorAll('.konvajs-content');
        if (!stageContainers || stageContainers.length === 0) {
            alert('Konvaキャンバスが見つかりません。');
            return;
        }

        stageContainers.forEach((container, index) => {
            const canvas = container.querySelector('canvas');
            if (!canvas) return;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            const link = document.createElement('a');
            const suffix = stageContainers.length > 1 ? `-f${index + 1}` : '';
            link.download = `panel-${selectedPanelId}${suffix}.jpg`;
            link.href = dataUrl;
            link.click();
        });
    };

    const handleSave = async () => {
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
    };

    return (
        <header className="h-12 sm:h-14 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-2 sm:px-4 sticky top-0 z-50 flex-shrink-0">
            {/* Left: Title */}
            <div className="flex items-center gap-2 min-w-0 flex-shrink">
                <h1 className="font-bold text-sm sm:text-lg tracking-wider truncate">
                    {storyboard ? (
                        <>
                            <span className="hidden sm:inline">{storyboard.title} - {storyboard.episode}</span>
                            <span className="sm:hidden">{storyboard.episode}</span>
                        </>
                    ) : 'EC Editor'}
                </h1>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5 sm:gap-1 border-r border-[var(--border)] pr-1 sm:pr-2 mr-1 sm:mr-2">
                    <button
                        disabled={!canUndo()}
                        onClick={undo}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-[var(--background)] disabled:opacity-30 text-sm"
                        title="元に戻す (Ctrl+Z)"
                    >
                        ↶
                    </button>
                    <button
                        disabled={!canRedo()}
                        onClick={redo}
                        className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-[var(--background)] disabled:opacity-30 text-sm"
                        title="やり直す (Ctrl+Shift+Z)"
                    >
                        ↷
                    </button>
                </div>

                {/* Zoom */}
                <div className="flex items-center gap-1 bg-[var(--background)] px-1.5 sm:px-2 py-1 rounded border border-[var(--border)] mr-1 sm:mr-2">
                    <button
                        onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
                        className="w-5 h-5 sm:w-6 sm:h-6 hover:bg-[#3a3a44] rounded text-sm sm:text-lg font-bold flex items-center justify-center leading-none"
                        title="縮小"
                    >
                        -
                    </button>
                    <span className="text-[10px] sm:text-xs font-mono w-8 sm:w-10 text-center select-none">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(Math.min(3.0, zoom + 0.1))}
                        className="w-5 h-5 sm:w-6 sm:h-6 hover:bg-[#3a3a44] rounded text-sm sm:text-lg font-bold flex items-center justify-center leading-none"
                        title="拡大"
                    >
                        +
                    </button>
                </div>

                {/* Export - icon only on mobile */}
                <button
                    onClick={handleExport}
                    disabled={!selectedPanelId}
                    className="text-xs sm:text-sm bg-[var(--border)] hover:bg-[var(--background)] px-2 sm:px-3 py-1 sm:py-1.5 rounded transition-colors disabled:opacity-50"
                    title="書き出し (Ctrl+E)"
                >
                    <span className="hidden sm:inline">🖼️ 書き出し</span>
                    <span className="sm:hidden">📤</span>
                </button>

                {/* Save */}
                <button
                    className="text-xs sm:text-sm bg-[var(--accent)] text-white px-2 sm:px-4 py-1 sm:py-1.5 rounded font-medium hover:bg-opacity-90 transition-opacity"
                    onClick={handleSave}
                    title="保存 (Ctrl+S)"
                >
                    <span className="hidden sm:inline">保存</span>
                    <span className="sm:hidden">💾</span>
                </button>
            </div>
        </header>
    );
}
