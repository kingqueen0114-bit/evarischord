'use client';

import React, { useEffect } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { Bubble, SfxPreset } from '@/types/storyboard';

const BUILTIN_PRESETS: SfxPreset[] = [
    {
        id: 'builtin-impact', name: '💥 ドン！', defaultText: 'ドン！', category: 'impact',
        fontSize: 80, color: '#ef4444', fontWeight: 'black', outline: { enabled: true, color: '#ffffff', width: 6 },
        opacity: 1, isVertical: true, scale: { x: 1, y: 1 }, skewX: -0.2, shadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 },
        fontFamily: '"Dela Gothic One", sans-serif', effectStyle: 'impact'
    },
    {
        id: 'builtin-ominous', name: '👻 ゴゴゴ…', defaultText: 'ゴゴゴ…', category: 'ambient',
        fontSize: 60, color: '#4c1d95', fontWeight: 'bold', outline: { enabled: true, color: '#000000', width: 3 },
        opacity: 1, isVertical: true, scale: { x: 1, y: 1 }, skewX: 0, shadow: { enabled: true, color: '#8b5cf6', blur: 15, offsetX: 0, offsetY: 0 },
        fontFamily: '"RocknRoll One", sans-serif', effectStyle: 'wave'
    },
    {
        id: 'builtin-scream', name: '⚡️ ギャーッ', defaultText: 'ギャーッ', category: 'emotional',
        fontSize: 90, color: '#facc15', fontWeight: 'normal', outline: { enabled: true, color: '#000000', width: 4 },
        opacity: 1, isVertical: true, scale: { x: 1, y: 1 }, skewX: 0.1, shadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 },
        fontFamily: '"Rampart One", sans-serif', effectStyle: 'jitter'
    },
    {
        id: 'builtin-pop', name: '💡 ピコーン', defaultText: 'ピコーン', category: 'emotional',
        fontSize: 50, color: '#22d3ee', fontWeight: 'normal', outline: { enabled: false, color: '#ffffff', width: 0 },
        opacity: 1, isVertical: false, scale: { x: 1, y: 1 }, skewX: 0, shadow: { enabled: true, color: '#06b6d4', blur: 10, offsetX: 0, offsetY: 0 },
        fontFamily: '"DotGothic16", sans-serif', effectStyle: 'none'
    },
    {
        id: 'builtin-rush', name: '💨 ドドド', defaultText: 'ドドドド', category: 'impact',
        fontSize: 70, color: '#fb923c', fontWeight: 'black', outline: { enabled: true, color: '#000000', width: 4 },
        opacity: 1, isVertical: true, scale: { x: 1, y: 1 }, skewX: -0.3, shadow: { enabled: true, color: '#fdba74', blur: 8, offsetX: 4, offsetY: 4 },
        fontFamily: '"Dela Gothic One", sans-serif', effectStyle: 'none'
    },
    {
        id: 'builtin-sparkle', name: '✨ キラキラ', defaultText: 'キラキラ', category: 'emotional',
        fontSize: 40, color: '#fdf08a', fontWeight: 'normal', outline: { enabled: false, color: '#000000', width: 0 },
        opacity: 0.9, isVertical: false, scale: { x: 1, y: 1 }, skewX: 0, shadow: { enabled: true, color: '#fef08a', blur: 12, offsetX: 0, offsetY: 0 },
        fontFamily: '"M PLUS 1p", sans-serif', effectStyle: 'wave'
    },
    {
        id: 'builtin-whisper', name: '🤫 ヒソヒソ', defaultText: 'ヒソヒソ', category: 'ambient',
        fontSize: 35, color: '#9ca3af', fontWeight: 'normal', outline: { enabled: false, color: '#000000', width: 0 },
        opacity: 0.7, isVertical: true, scale: { x: 1, y: 1 }, skewX: 0.1, shadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0 },
        fontFamily: '"M PLUS 1p", sans-serif', effectStyle: 'wave'
    }
];

export default function EditorPanel() {
    const {
        selectedPanelId,
        selectedSubPanelId,
        selectedBubbleId,
        selectedSfxId,
        storyboard,
        editTab,
        setEditTab,
        updateBubble,
        addBubble,
        deleteBubble,
        replaceImage,
        updateGutter,
        updateGutterColorAll,
        updatePanel,
        customSfxPresets,
        loadCustomSfxPresets,
        addCustomSfxPreset,
        deleteCustomSfxPreset
    } = useEditorStore();

    useEffect(() => {
        loadCustomSfxPresets();
    }, [loadCustomSfxPresets]);

    if (!selectedPanelId || !storyboard) return null;

    const panel = storyboard.panels.find(p => p.id === selectedPanelId);
    if (!panel) return null;

    let selectedBubble = panel.bubbles.find(b => b.id === selectedBubbleId);
    let selectedSfxTmp = panel.sfx.find(s => s.id === selectedSfxId);
    let actualBubbleSubPanelId: string | undefined = undefined;
    let actualSfxSubPanelId: string | undefined = undefined;

    if (panel.sub_panels) {
        if (!selectedBubble && selectedBubbleId) {
            for (const sp of panel.sub_panels) {
                const b = sp.bubbles.find(b => b.id === selectedBubbleId);
                if (b) {
                    selectedBubble = b;
                    actualBubbleSubPanelId = sp.id;
                    break;
                }
            }
        }
        if (!selectedSfxTmp && selectedSfxId) {
            for (const sp of panel.sub_panels) {
                const s = sp.sfx.find(s => s.id === selectedSfxId);
                if (s) {
                    selectedSfxTmp = s;
                    actualSfxSubPanelId = sp.id;
                    break;
                }
            }
        }
    }

    const handleAddBubble = (type: Bubble['type'] = 'normal') => {
        const id = `bubble-${Date.now()}`;
        addBubble(selectedPanelId, {
            id,
            type,
            text: 'セリフ',
            position: { x: 50, y: 50 },
            size: { w: 100, h: 150 }, // Starting with vertical size prediction
            fontSize: 20,
            fontWeight: 'bold', // User requested bold default
            columns: 1,
            tail: { direction: 'bottom', visible: type !== 'square', tipPosition: { x: 50, y: 70 } } // Default tip slightly below bubble
        }, selectedSubPanelId || (panel.sub_panels && panel.sub_panels.length > 0 ? panel.sub_panels[0].id : undefined));

        // Auto select and switch to text tab for quick edit
        useEditorStore.getState().selectBubble(id);
        setEditTab('text');
    };

    const handleAddSfx = (imageUrl?: string) => {
        const id = `sfx-${Date.now()}`;
        useEditorStore.getState().addSfx(selectedPanelId, {
            id,
            type: imageUrl ? 'image' : 'text',
            imageUrl: imageUrl,
            text: imageUrl ? '' : 'ドン！',
            category: 'impact',
            position: { x: 50, y: 50 },
            fontSize: 64,
            color: '#ef4444',
            rotation: 0,
            fontWeight: 'black',
            outline: { enabled: true, color: '#ffffff', width: 4 },
            opacity: 1,
            isVertical: true,
            scale: { x: 1, y: 1 },
            skewX: 0,
            shadow: { enabled: false, color: '#000000', blur: 4, offsetX: 2, offsetY: 2 },
            fontFamily: '"M PLUS 1p", sans-serif'
        }, selectedSubPanelId || (panel.sub_panels && panel.sub_panels.length > 0 ? panel.sub_panels[0].id : undefined));

        // Auto select and switch to text tab
        useEditorStore.getState().selectSfx(id);
        setEditTab('sfx');
    };

    const tabs = [
        { id: 'text', label: '🔤 セリフ' },
        { id: 'bubble', label: '💬 吹き出し' },
        { id: 'sfx', label: '🔊 SFX' },
        { id: 'image', label: '📷 画像' },
        { id: 'gutter', label: '↕ ガター' },
        { id: 'size', label: '📐 サイズ' },
        { id: 'prompt', label: '✨ 生成' }
    ] as const;

    return (
        <div className="w-full h-full flex flex-col bg-[var(--surface)] text-[var(--color-text-main)] overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-[var(--border)] overflow-x-auto hidden-scrollbar">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setEditTab(tab.id as any)}
                        className={`
              flex-1 py-3 px-2 text-sm font-bold min-w-max transition-colors
              ${editTab === tab.id
                                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                                : 'text-[var(--color-text-dim)] hover:text-white hover:bg-[#2a2a33]'}
            `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Panel Info Header */}
                <div className="pb-4 border-b border-[var(--border)]">
                    <h2 className="text-lg font-bold mb-1">
                        {panel.label}: {panel.section}
                    </h2>
                    <p className="text-sm text-[var(--color-text-dim)] line-clamp-2">
                        {panel.description}
                    </p>
                </div>

                {/* Tab Contents - For MVP, basic Bubble controls */}
                {editTab === 'text' && (
                    <div className="space-y-4">
                        <h3 className="font-bold">セリフ編集</h3>

                        {!selectedBubbleId ? (
                            <div className="text-sm text-[var(--color-text-dim)] py-4 text-center">
                                吹き出しが選択されていません。<br />キャンバス上でタップするか、新しく追加してください。
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAddBubble('normal')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 通常
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('thought')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 心内語
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('whisper')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ ささやき
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('shout')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 叫び
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('square')}
                                        className="py-2 col-span-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 四角
                                    </button>
                                </div>
                            </div>
                        ) : selectedBubble ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-[var(--color-text-dim)] mb-1">テキスト</label>
                                    <textarea
                                        value={selectedBubble.text}
                                        onChange={(e) => updateBubble(panel.id, selectedBubble!.id, { text: e.target.value }, actualBubbleSubPanelId || undefined)}
                                        className="w-full h-32 bg-[var(--background)] border border-[var(--border)] rounded p-2 focus:outline-none focus:border-[var(--accent)] resize-none"
                                        placeholder="セリフを入力..."
                                    />
                                    <div className="flex items-center gap-2 mt-2">
                                        <label className="text-xs text-[var(--color-text-dim)]">サイズ ({selectedBubble.fontSize})</label>
                                        <input
                                            type="range"
                                            min="10" max="100"
                                            value={selectedBubble.fontSize}
                                            onChange={(e) => updateBubble(panel.id, selectedBubble!.id, { fontSize: Number(e.target.value) }, actualBubbleSubPanelId || undefined)}
                                            className="flex-1 accent-[var(--accent)]"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex justify-between items-center">
                                    <button
                                        onClick={() => deleteBubble(panel.id, selectedBubble!.id, actualBubbleSubPanelId || undefined)}
                                        className="text-xs text-[var(--danger)] hover:underline"
                                    >
                                        この吹き出しを削除
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('normal')}
                                        className="text-xs text-[var(--accent)] hover:underline font-bold"
                                    >
                                        ＋ 新規追加
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {editTab === 'bubble' && (
                    <div className="space-y-4">
                        <h3 className="font-bold">吹き出し追加・スタイル</h3>
                        {!selectedBubble ? (
                            <div className="text-sm text-[var(--color-text-dim)] py-4 text-center">
                                吹き出しが選択されていません。<br />新しく追加してください。
                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => handleAddBubble('normal')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 通常
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('thought')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 心内語
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('whisper')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ ささやき
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('shout')}
                                        className="py-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 叫び
                                    </button>
                                    <button
                                        onClick={() => handleAddBubble('square')}
                                        className="py-2 col-span-2 bg-[var(--surface)] hover:bg-[#2a2a33] border border-[var(--border)] rounded-md font-bold text-xs"
                                    >
                                        ＋ 四角
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs text-[var(--color-text-dim)] mb-2">タイプ</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['normal', 'thought', 'whisper', 'shout', 'square'].map(t => (
                                            <button
                                                key={t}
                                                onClick={() => updateBubble(panel.id, selectedBubble!.id, { type: t as any }, actualBubbleSubPanelId || undefined)}
                                                className={`py-2 text-sm rounded border ${selectedBubble!.type === t
                                                    ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold'
                                                    : 'bg-[var(--background)] border-[var(--border)]'
                                                    }`}
                                            >
                                                {t === 'normal' ? '通常' : t === 'thought' ? '心内語' : t === 'whisper' ? 'ささやき' : t === 'shout' ? '叫び' : '四角'}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="tail-toggle"
                                                checked={selectedBubble.tail.visible}
                                                onChange={(e) => updateBubble(panel.id, selectedBubble!.id, {
                                                    tail: { ...selectedBubble.tail, visible: e.target.checked }
                                                }, actualBubbleSubPanelId || undefined)}
                                                className="accent-[var(--accent)]"
                                            />
                                            <label htmlFor="tail-toggle" className="text-xs">しっぽを表示する</label>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="bold-toggle"
                                                checked={selectedBubble.fontWeight === 'bold'}
                                                onChange={(e) => updateBubble(panel.id, selectedBubble!.id, {
                                                    fontWeight: e.target.checked ? 'bold' : 'normal'
                                                }, actualBubbleSubPanelId || undefined)}
                                                className="accent-[var(--accent)]"
                                            />
                                            <label htmlFor="bold-toggle" className="text-xs">強調（太字）</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {editTab === 'sfx' && (
                    <div className="space-y-4">
                        <h3 className="font-bold">SFX編集</h3>

                        {!selectedSfxId ? (
                            <div className="text-sm text-[var(--color-text-dim)] py-4 text-center">
                                SFXが選択されていません。<br />キャンバス上でタップするか、新しく追加してください。
                                <div className="flex flex-col gap-3 mt-4">
                                    <div className="text-left font-bold border-b border-[var(--border)] pb-2 mb-1">プリセットから追加</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {BUILTIN_PRESETS.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    const id = `sfx-${Date.now()}`;
                                                    useEditorStore.getState().addSfx(selectedPanelId, {
                                                        ...preset,
                                                        id, type: 'text', text: preset.defaultText, position: { x: 50, y: 50 },
                                                        rotation: 0
                                                    }, selectedSubPanelId || (panel.sub_panels && panel.sub_panels.length > 0 ? panel.sub_panels[0].id : undefined));
                                                    useEditorStore.getState().selectSfx(id); setEditTab('sfx');
                                                }}
                                                className="py-3 bg-[var(--surface)] border border-[var(--border)] hover:bg-[#2a2a33] text-white rounded-md flex items-center justify-center relative overflow-hidden group" style={{ fontFamily: preset.fontFamily, fontWeight: preset.fontWeight }}
                                            >
                                                <span style={{
                                                    color: preset.color,
                                                    textShadow: preset.outline.enabled
                                                        ? `1px 1px 0 ${preset.outline.color}, -1px -1px 0 ${preset.outline.color}, 1px -1px 0 ${preset.outline.color}, -1px 1px 0 ${preset.outline.color}`
                                                        : preset.shadow.enabled ? `0px 0px ${preset.shadow.blur}px ${preset.shadow.color}` : 'none',
                                                    transform: `skewX(${-preset.skewX}rad)`
                                                }}>{preset.name}</span>
                                            </button>
                                        ))}

                                        {customSfxPresets.map(preset => (
                                            <div key={preset.id} className="relative group flex">
                                                <button
                                                    onClick={() => {
                                                        const id = `sfx-${Date.now()}`;
                                                        useEditorStore.getState().addSfx(selectedPanelId, {
                                                            ...preset,
                                                            id, type: 'text', text: preset.defaultText, position: { x: 50, y: 50 },
                                                            rotation: 0
                                                        }, selectedSubPanelId || (panel.sub_panels && panel.sub_panels.length > 0 ? panel.sub_panels[0].id : undefined));
                                                        useEditorStore.getState().selectSfx(id); setEditTab('sfx');
                                                    }}
                                                    className="w-full py-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 text-white rounded-md flex items-center justify-center font-bold" style={{ fontFamily: preset.fontFamily }}
                                                >
                                                    <span style={{
                                                        color: preset.color,
                                                        textShadow: preset.outline.enabled
                                                            ? `1px 1px 0 ${preset.outline.color}, -1px -1px 0 ${preset.outline.color}, 1px -1px 0 ${preset.outline.color}, -1px 1px 0 ${preset.outline.color}`
                                                            : preset.shadow.enabled ? `0px 0px ${preset.shadow.blur}px ${preset.shadow.color}` : 'none',
                                                        transform: `skewX(${-preset.skewX}rad)`
                                                    }}>{preset.name}</span>
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteCustomSfxPreset(preset.id); }}
                                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border border-[var(--background)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md z-10 hover:bg-red-500"
                                                    title="このプリセットを削除"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-left font-bold border-b border-[var(--border)] pb-2 mb-1 mt-2">カスタム作成</div>
                                    <button
                                        onClick={() => handleAddSfx()}
                                        className="w-full py-2 bg-[var(--surface)] text-[var(--color-text-main)] border border-[var(--border)] rounded-md font-bold hover:bg-[#2a2a33]"
                                    >
                                        ＋ 標準テキストSFX
                                    </button>
                                    <label className="w-full py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--color-text-main)] rounded-md font-bold cursor-pointer hover:bg-[#2a2a33] text-center">
                                        🖼️ 画像SFXをアップロード
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onload = (re) => {
                                                        handleAddSfx(re.target?.result as string);
                                                    };
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (() => {
                            const selectedSfx = selectedSfxTmp;
                            if (!selectedSfx) return null;

                            return (
                                <div className="space-y-4 text-sm">
                                    {selectedSfx.type !== 'image' && (
                                        <>
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">テキスト</label>
                                                <input
                                                    type="text"
                                                    value={selectedSfx.text}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { text: e.target.value }, actualSfxSubPanelId || undefined)}
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 focus:outline-none focus:border-[var(--accent)]"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">フォント</label>
                                                <select
                                                    value={selectedSfx.fontFamily}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { fontFamily: e.target.value }, actualSfxSubPanelId || undefined)}
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                                                >
                                                    <option value='"M PLUS 1p", sans-serif'>丸ゴシック (M PLUS 1p)</option>
                                                    <option value='"Dela Gothic One", sans-serif'>極太ゴシック (Dela Gothic One)</option>
                                                    <option value='"RocknRoll One", sans-serif'>極太ポップ (RocknRoll One)</option>
                                                    <option value='"Rampart One", sans-serif'>立体ブロック (Rampart One)</option>
                                                    <option value='"DotGothic16", sans-serif'>ドット絵 (DotGothic16)</option>
                                                </select>
                                            </div>

                                            <div className="mt-4">
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">文字エフェクト（動的スタイル）</label>
                                                <select
                                                    value={selectedSfx.effectStyle || 'none'}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { effectStyle: e.target.value as any }, actualSfxSubPanelId || undefined)}
                                                    className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 text-sm focus:outline-none focus:border-[var(--accent)]"
                                                >
                                                    <option value="none">なし (標準)</option>
                                                    <option value="impact">インパクト (先細り)</option>
                                                    <option value="jitter">ジッター (ランダムなブレ)</option>
                                                    <option value="wave">ウェーブ (波打ち)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-2">文字の方向</label>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: false, scale: { x: 1, y: 1 } }, actualSfxSubPanelId || undefined)}
                                                        className={`flex-1 py-1 text-sm rounded border ${!selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                                    >
                                                        横書き
                                                    </button>
                                                    <button
                                                        onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { isVertical: true, scale: { x: 1, y: 1 } }, actualSfxSubPanelId || undefined)}
                                                        className={`flex-1 py-1 text-sm rounded border ${selectedSfx.isVertical ? 'bg-[var(--accent)]/20 border-[var(--accent)] font-bold' : 'bg-[var(--background)] border-[var(--border)]'}`}
                                                    >
                                                        縦書き
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <label className="block text-xs font-bold text-[var(--color-text-main)] mb-3">変形・スケール</label>

                                        <div className="mb-4">
                                            <label className="block text-xs text-[var(--color-text-dim)] mb-1 flex justify-between">
                                                <span>基本サイズ</span>
                                                <span>{Math.round(selectedSfx.fontSize * (selectedSfx.scale?.x || 1))}px</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="10" max="800"
                                                value={Math.round(selectedSfx.fontSize * (selectedSfx.scale?.x || 1))}
                                                onChange={(e) => {
                                                    const newSize = Number(e.target.value);
                                                    const newScale = newSize / selectedSfx.fontSize;
                                                    // When using the uniform slider, we reset any unequal stretching to keep it simple,
                                                    // but an alternative is to preserve the stretch ratio. Here we scale both X and Y.
                                                    useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                        scale: { x: newScale, y: newScale }
                                                    }, actualSfxSubPanelId || undefined);
                                                }}
                                                className="w-full accent-[var(--accent)]"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-xs text-[var(--color-text-dim)] mb-1 flex justify-between">
                                                <span>斜体 (Skew)</span>
                                                <span>{selectedSfx.skewX?.toFixed(1) || 0}</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-1" max="1" step="0.1"
                                                value={selectedSfx.skewX || 0}
                                                onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { skewX: Number(e.target.value) }, actualSfxSubPanelId || undefined)}
                                                className="w-full accent-[var(--accent)]"
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-xs text-[var(--color-text-dim)] mb-1 flex justify-between">
                                                <span>角度 (Rotation)</span>
                                                <span>{selectedSfx.rotation.toFixed(0)}°</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="-180" max="180"
                                                value={selectedSfx.rotation}
                                                onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { rotation: Number(e.target.value) }, actualSfxSubPanelId || undefined)}
                                                className="w-full accent-[var(--accent)]"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)]">
                                        <label className="block text-xs font-bold text-[var(--color-text-main)] mb-3">色と装飾</label>

                                        {selectedSfx.type !== 'image' && (
                                            <>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <label className="block text-xs text-[var(--color-text-dim)] mb-1">文字色</label>
                                                        <input
                                                            type="color"
                                                            value={selectedSfx.color}
                                                            onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { color: e.target.value }, actualSfxSubPanelId || undefined)}
                                                            className="w-full h-8 cursor-pointer rounded bg-[var(--background)] border border-[var(--border)]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-[var(--color-text-dim)] mb-1">アウトライン</label>
                                                        <input
                                                            type="color"
                                                            value={selectedSfx.outline?.color || '#000000'}
                                                            onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                                outline: { ...(selectedSfx.outline || { width: 4 }), enabled: true, color: e.target.value }
                                                            }, actualSfxSubPanelId || undefined)}
                                                            className="w-full h-8 cursor-pointer rounded bg-[var(--background)] border border-[var(--border)]"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-xs text-[var(--color-text-dim)] mb-1 flex justify-between">
                                                        <span>アウトラインの太さ</span>
                                                        <span>{selectedSfx.outline?.width || 0}px</span>
                                                    </label>
                                                    <input
                                                        type="range"
                                                        disabled={!selectedSfx.outline?.enabled}
                                                        min="0" max="25"
                                                        value={selectedSfx.outline?.width || 0}
                                                        onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                            outline: { ...(selectedSfx.outline || { color: '#000000', enabled: true }), width: Number(e.target.value) }
                                                        }, actualSfxSubPanelId || undefined)}
                                                        className="w-full accent-[var(--accent)]"
                                                    />
                                                </div>

                                                <div className="flex items-center gap-2 pt-2 mb-6">
                                                    <input
                                                        type="checkbox"
                                                        id="outline-toggle"
                                                        checked={selectedSfx.outline?.enabled || false}
                                                        onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                            outline: { ...(selectedSfx.outline || { color: '#000000', width: 4 }), enabled: e.target.checked }
                                                        }, actualSfxSubPanelId || undefined)}
                                                        className="accent-[var(--accent)]"
                                                    />
                                                    <label htmlFor="outline-toggle" className="text-xs">アウトラインを有効にする</label>
                                                </div>
                                            </>
                                        )}

                                        {/* SHADOW SETTINGS */}
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1">ドロップシャドウ</label>
                                                <input
                                                    type="color"
                                                    value={selectedSfx.shadow?.color || '#000000'}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                        shadow: { ...(selectedSfx.shadow || { blur: 4, offsetX: 2, offsetY: 2 }), enabled: true, color: e.target.value }
                                                    }, actualSfxSubPanelId || undefined)}
                                                    className="w-full h-8 cursor-pointer rounded bg-[var(--background)] border border-[var(--border)]"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-[var(--color-text-dim)] mb-1 flex justify-between">
                                                    <span>ぼかし</span>
                                                    <span>{selectedSfx.shadow?.blur || 0}px</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    disabled={!selectedSfx.shadow?.enabled}
                                                    min="0" max="20"
                                                    value={selectedSfx.shadow?.blur || 0}
                                                    onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                        shadow: { ...selectedSfx!.shadow, blur: Number(e.target.value) }
                                                    }, actualSfxSubPanelId || undefined)}
                                                    className="w-full accent-[var(--accent)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="shadow-toggle"
                                                checked={selectedSfx.shadow?.enabled || false}
                                                onChange={(e) => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, {
                                                    shadow: { ...(selectedSfx.shadow || { blur: 4, offsetX: 2, offsetY: 2, color: '#000000' }), enabled: e.target.checked }
                                                }, actualSfxSubPanelId || undefined)}
                                                className="accent-[var(--accent)]"
                                            />
                                            <label htmlFor="shadow-toggle" className="text-xs">シャドウを有効にする</label>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)] mt-6">
                                        <button
                                            onClick={() => {
                                                const name = prompt('保存するプリセット名を入力してください', 'マイプリセット');
                                                if (!name) return;

                                                const { id: _sfxId, type, imageUrl, text, position, rotation, ...styleProps } = selectedSfx;
                                                const newPreset: SfxPreset = {
                                                    id: `custom-${Date.now()}`,
                                                    name,
                                                    defaultText: text || 'SFX',
                                                    ...styleProps
                                                };
                                                addCustomSfxPreset(newPreset);
                                            }}
                                            className="w-full py-2 bg-[var(--surface)] text-[var(--color-text-main)] border border-[var(--border)] rounded-md font-bold hover:bg-[var(--accent)]/20 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                                        >
                                            ＋ 現在のスタイルをプリセットに保存
                                        </button>
                                    </div>

                                    <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-2 justify-between mt-4">
                                        <button
                                            onClick={() => useEditorStore.getState().deleteSfx(panel.id, selectedSfxId, actualSfxSubPanelId || undefined)}
                                            className="text-xs text-[var(--danger)] hover:underline"
                                        >
                                            このSFXを削除
                                        </button>
                                        <div className="flex gap-4 items-center">
                                            <button
                                                onClick={() => useEditorStore.getState().updateSfx(panel.id, selectedSfxId, { scale: { x: 1, y: 1 }, skewX: 0, rotation: 0 }, actualSfxSubPanelId || undefined)}
                                                className="text-xs text-[var(--color-text-dim)] hover:underline"
                                            >
                                                変形をリセット
                                            </button>
                                            <button
                                                onClick={() => handleAddSfx()}
                                                className="text-xs text-[var(--accent)] hover:underline font-bold"
                                            >
                                                ＋ 新規テキスト
                                            </button>
                                            <label className="text-xs text-[var(--accent)] hover:underline font-bold cursor-pointer">
                                                ＋ 新規画像
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (re) => {
                                                                handleAddSfx(re.target?.result as string);
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {editTab === 'image' && (
                    <ImageTabContent
                        panel={panel}
                        selectedSubPanelId={selectedSubPanelId}
                        replaceImage={replaceImage}
                    />
                )}

                {editTab === 'gutter' && (
                    <GutterTabContent
                        panel={panel}
                        selectedSubPanelId={selectedSubPanelId}
                        updateGutter={updateGutter}
                        updateGutterColorAll={updateGutterColorAll}
                    />
                )}

                {editTab === 'size' && (() => {
                    return <SizeTabContent panel={panel} />;
                })()}

                {editTab === 'prompt' && (() => {
                    // We'll manage local state inside this block for the fetch.
                    // React strictly requires hooks at the top level, so to do this properly we should pull this out.
                    // For MVP simplicity without rewriting the whole file, we use an inline component wrapper or just state.
                    return <PromptTabContent panel={panel} storyboard={storyboard} />;
                })()}
            </div>
        </div>
    );
}

// Inner component to handle size tab state and logic
function SizeTabContent({ panel }: { panel: any }) {
    const updatePanelSize = useEditorStore(state => state.updatePanelSize);
    const selectedSubPanelId = useEditorStore(state => state.selectedSubPanelId);

    // If panel is split, we might want to edit sub-panels individually.
    const isSplit = panel.split_mode === 'equal' || panel.split_mode === 'manual';
    const subPanels = panel.sub_panels || [];

    const [targetSubPanelId, setTargetSubPanelId] = React.useState<string | null>(
        selectedSubPanelId || (isSplit && subPanels.length > 0 ? subPanels[0].id : null)
    );

    // Sync with global state if it changes externally (e.g. clicking on canvas)
    React.useEffect(() => {
        if (selectedSubPanelId && selectedSubPanelId.startsWith(panel.id)) {
            setTargetSubPanelId(selectedSubPanelId);
        }
    }, [selectedSubPanelId, panel.id]);

    const target = isSplit && targetSubPanelId
        ? subPanels.find((sp: any) => sp.id === targetSubPanelId)
        : panel;

    if (!target) return null;

    const ratio = target.display_height_ratio ?? 1.0;
    const offset = target.crop_offset_y ?? 0.5;

    const handleRatioChange = (val: number) => {
        updatePanelSize(panel.id, val, offset, targetSubPanelId || undefined);
    };

    const handleOffsetChange = (val: number) => {
        updatePanelSize(panel.id, ratio, val, targetSubPanelId || undefined);
    };

    const applyPreset = (r: number, o: number = 0.5) => {
        updatePanelSize(panel.id, r, o, targetSubPanelId || undefined);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold">コマのサイズと表示位置</h3>

            {isSplit && (
                <div>
                    <label className="block text-xs text-[var(--color-text-dim)] mb-1">編集対象</label>
                    <select
                        value={targetSubPanelId || ''}
                        onChange={(e) => setTargetSubPanelId(e.target.value)}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded p-2 text-sm focus:outline-none"
                    >
                        {subPanels.map((sp: any, i: number) => (
                            <option key={sp.id} value={sp.id}>({i + 1}/{subPanels.length}) コマ目</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="space-y-4 bg-black/20 p-4 rounded-lg border border-white/5">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-[var(--color-text-dim)]">
                            高さの倍率: {Math.round(ratio * 100)}%
                        </label>
                        <span className="text-[10px] text-gray-500">標準は 100%</span>
                    </div>
                    <input
                        type="range"
                        min="0.5" max="1.5" step="0.05"
                        value={ratio}
                        onChange={(e) => handleRatioChange(Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs text-[var(--color-text-dim)]">
                            Y軸オフセット (表示位置)
                        </label>
                        <span className="text-[10px] text-gray-500">
                            {offset < 0.33 ? '上寄り' : offset > 0.66 ? '下寄り' : '中央'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={offset}
                        onChange={(e) => handleOffsetChange(Number(e.target.value))}
                        className="w-full accent-[var(--accent)]"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 px-1 mt-1">
                        <span>上端</span>
                        <span>中央</span>
                        <span>下端</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs text-[var(--color-text-dim)] mb-2">比率プリセット</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => applyPreset(2.0, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        極縦長 (1:4)
                    </button>
                    <button
                        onClick={() => applyPreset(1.5, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        超縦長 (1:3)
                    </button>
                    <button
                        onClick={() => applyPreset(1.0, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        縦長 (1:2)
                    </button>
                    <button
                        onClick={() => applyPreset(0.5, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        正方形 (1:1)
                    </button>
                    <button
                        onClick={() => applyPreset(0.33, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        やや横長 (3:2)
                    </button>
                    <button
                        onClick={() => applyPreset(0.25, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        横長 (2:1)
                    </button>
                    <button
                        onClick={() => applyPreset(0.16, 0.5)}
                        className="py-2 text-xs rounded border bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]"
                    >
                        極細 (3:1)
                    </button>
                </div>
                <button
                    onClick={() => applyPreset(1.0, 0.5)}
                    className="w-full mt-2 py-2 text-xs rounded border border-gray-600/50 hover:bg-gray-800 text-gray-300 transition-colors"
                >
                    リセット (元サイズ)
                </button>
            </div>
        </div>
    );
}

// Inner component to handle prompt tab state cleanly
function PromptTabContent({ panel, storyboard }: { panel: any, storyboard: any }) {
    const [generating, setGenerating] = React.useState(false);
    const [promptResult, setPromptResult] = React.useState<string | null>(null);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await fetch('/api/prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ panelId: panel.id, storyboard })
            });
            const data = await res.json();
            if (data.prompt) {
                setPromptResult(data.prompt);
            } else {
                alert('Generation failed');
            }
        } catch (e) {
            alert('Error calling prompt API');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-[var(--accent-2)]">✨ LoveArt プロンプト</h3>
            <div className="p-3 bg-[var(--background)] rounded border border-[var(--border)] text-sm space-y-2">
                <p><span className="text-[var(--color-text-dim)]">ムード:</span> {panel.mood}</p>
                <p><span className="text-[var(--color-text-dim)]">登場キャラ:</span> {panel.characters.join(', ')}</p>
            </div>

            <div>
                <label className="block text-xs text-[var(--color-text-dim)] mb-1">シーン指定・ディレクション</label>
                <textarea
                    value={panel.loveart_prompt_notes}
                    onChange={(e) => useEditorStore.getState().updatePanel(panel.id, { loveart_prompt_notes: e.target.value })}
                    className="w-full h-24 bg-[var(--background)] border border-[var(--border)] rounded p-2 text-sm text-[var(--color-text-dim)] resize-none focus:outline-none focus:border-[var(--accent)]"
                    placeholder="特になし"
                />
            </div>

            <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full py-2 bg-[var(--accent-2)] text-white rounded font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
                {generating ? '生成中...' : 'プロンプトを生成する'}
            </button>

            {promptResult && (
                <div className="mt-4 animate-fade-in relative">
                    <label className="block text-xs text-[var(--accent-2)] mb-1 font-bold">生成結果</label>
                    <textarea
                        value={promptResult}
                        readOnly
                        className="w-full h-40 bg-[var(--background)] border border-[var(--border)] rounded p-2 text-xs font-mono text-white resize-none"
                    />
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(promptResult);
                            alert('コピーしました！');
                        }}
                        className="absolute bottom-2 right-2 bg-[var(--surface)] text-[var(--color-text-dim)] hover:text-white px-2 py-1 text-xs rounded border border-[var(--border)]"
                    >
                        📋 コピー
                    </button>
                </div>
            )}
        </div>
    );
}

// Image tab: replace panel image, view history, restore previous versions
function ImageTabContent({ panel, selectedSubPanelId, replaceImage }: {
    panel: any;
    selectedSubPanelId: string | null;
    replaceImage: (panelId: string, newSrc: string, subPanelId?: string) => void;
}) {
    const [uploading, setUploading] = React.useState(false);

    // Determine current image source and history
    const isSplit = panel.sub_panels && panel.sub_panels.length > 0;
    const subPanel = isSplit && selectedSubPanelId
        ? panel.sub_panels.find((sp: any) => sp.id === selectedSubPanelId)
        : null;

    const currentSrc = subPanel?.override_image?.src || panel.image.src;
    const imageHistory = subPanel?.override_image?.history || panel.image.history || [];

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);

        try {
            // Client-side resize to 800px width
            const img = new Image();
            const reader = new FileReader();
            reader.onload = () => {
                img.onload = async () => {
                    const canvas = document.createElement('canvas');
                    const targetWidth = 800;
                    const scale = targetWidth / img.width;
                    canvas.width = targetWidth;
                    canvas.height = img.height * scale;
                    const ctx = canvas.getContext('2d')!;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    canvas.toBlob(async (blob) => {
                        if (!blob) { setUploading(false); return; }
                        const formData = new FormData();
                        formData.append('file', blob, `${panel.id}.png`);
                        formData.append('panelId', subPanel ? subPanel.id : panel.id);

                        try {
                            const res = await fetch('/api/upload', { method: 'POST', body: formData });
                            const data = await res.json();
                            if (data.src) {
                                replaceImage(panel.id, data.src, selectedSubPanelId || undefined);
                            }
                        } catch (err) {
                            console.error('Upload failed:', err);
                        } finally {
                            setUploading(false);
                        }
                    }, 'image/png');
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('File processing failed:', err);
            setUploading(false);
        }

        // Reset input
        e.target.value = '';
    };

    const handleRestore = (historySrc: string) => {
        replaceImage(panel.id, historySrc, selectedSubPanelId || undefined);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-bold">画像差し替え</h3>

            {/* Current image preview */}
            <div className="relative rounded-lg overflow-hidden border border-[var(--border)] bg-black">
                <img
                    src={currentSrc}
                    alt={panel.label}
                    className="w-full h-auto max-h-48 object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-center py-1 text-[var(--color-text-dim)]">
                    現在の画像: {panel.label}{subPanel ? ` (${subPanel.id})` : ''}
                </div>
            </div>

            {/* Upload button */}
            <label className={`
                w-full py-3 flex items-center justify-center gap-2
                bg-[var(--accent)]/10 border-2 border-dashed border-[var(--accent)]/40
                rounded-lg cursor-pointer hover:bg-[var(--accent)]/20 transition-colors font-bold text-sm
                ${uploading ? 'opacity-50 pointer-events-none' : ''}
            `}>
                {uploading ? '⏳ アップロード中...' : '📷 新しい画像を選択'}
                <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                    disabled={uploading}
                />
            </label>

            {/* Image history */}
            {imageHistory.length > 0 && (
                <div>
                    <label className="block text-xs text-[var(--color-text-dim)] mb-2">差し替え履歴 ({imageHistory.length}件)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {[...imageHistory].reverse().map((src: string, i: number) => (
                            <div key={i} className="relative group rounded overflow-hidden border border-[var(--border)] bg-black">
                                <img
                                    src={src}
                                    alt={`履歴 ${imageHistory.length - i}`}
                                    className="w-full h-20 object-cover"
                                />
                                <button
                                    onClick={() => handleRestore(src)}
                                    className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white"
                                >
                                    元に戻す
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-center py-0.5 text-gray-400">
                                    v{imageHistory.length - i}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="text-xs text-[var(--color-text-dim)] mt-2">
                画像は自動的に幅800pxにリサイズされます。<br />
                画像の加工・編集は外部ツールで行ってください。
            </p>
        </div>
    );
}

// Gutter tab: gap size slider, color picker, update all
function GutterTabContent({ panel, selectedSubPanelId, updateGutter, updateGutterColorAll }: {
    panel: any;
    selectedSubPanelId: string | null;
    updateGutter: (panelId: string, gap: number, color?: string, subPanelId?: string) => void;
    updateGutterColorAll: (color: string) => void;
}) {
    const isSplit = panel.sub_panels && panel.sub_panels.length > 0;
    const subPanel = isSplit && selectedSubPanelId
        ? panel.sub_panels.find((sp: any) => sp.id === selectedSubPanelId)
        : null;

    const currentGap = subPanel ? subPanel.gap_before : panel.gap_before;
    const currentColor = subPanel ? subPanel.gap_color : panel.gap_color;

    const handleGapChange = (val: number) => {
        updateGutter(panel.id, val, undefined, selectedSubPanelId || undefined);
    };

    const handleColorChange = (color: string) => {
        updateGutter(panel.id, currentGap, color, selectedSubPanelId || undefined);
    };

    return (
        <div className="space-y-6">
            <h3 className="font-bold">ガター設定</h3>

            {/* Gap size slider */}
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <label className="text-xs text-[var(--color-text-dim)]">上ガターの高さ</label>
                    <span className="text-xs font-mono text-[var(--accent)]">{currentGap}px</span>
                </div>
                <input
                    type="range"
                    min="0" max="200" step="1"
                    value={currentGap}
                    onChange={(e) => handleGapChange(Number(e.target.value))}
                    className="w-full accent-[var(--accent)]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 px-1">
                    <span>0px</span>
                    <span>100px</span>
                    <span>200px</span>
                </div>
            </div>

            {/* Quick gap presets */}
            <div>
                <label className="block text-xs text-[var(--color-text-dim)] mb-2">ガターサイズプリセット</label>
                <div className="grid grid-cols-4 gap-2">
                    {[0, 10, 20, 40, 60, 80, 100, 150].map(px => (
                        <button
                            key={px}
                            onClick={() => handleGapChange(px)}
                            className={`py-2 text-xs rounded border transition-colors ${currentGap === px
                                ? 'bg-[var(--accent)]/20 border-[var(--accent)] text-[var(--accent)] font-bold'
                                : 'bg-[var(--background)] border-[var(--border)] hover:bg-[#2a2a33]'
                            }`}
                        >
                            {px}px
                        </button>
                    ))}
                </div>
            </div>

            {/* Color picker */}
            <div className="space-y-2 pt-4 border-t border-[var(--border)]">
                <label className="block text-xs text-[var(--color-text-dim)]">ガター色</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                        onClick={() => handleColorChange('#ffffff')}
                        className={`py-2 text-xs rounded border ${currentColor === '#ffffff'
                            ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)]'
                        } bg-white text-black font-bold`}
                    >
                        白
                    </button>
                    <button
                        onClick={() => handleColorChange('#000000')}
                        className={`py-2 text-xs rounded border ${currentColor === '#000000'
                            ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)]'
                        } bg-black text-white font-bold`}
                    >
                        黒
                    </button>
                    <div className="relative">
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-full h-full cursor-pointer rounded border border-[var(--border)] absolute inset-0 opacity-0"
                        />
                        <div
                            className={`w-full h-full py-2 text-xs rounded border text-center font-bold ${currentColor !== '#ffffff' && currentColor !== '#000000'
                                ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)]'
                            }`}
                            style={{ backgroundColor: currentColor, color: currentColor === '#ffffff' || currentColor.toLowerCase() === '#fff' ? '#000' : '#fff' }}
                        >
                            カスタム
                        </div>
                    </div>
                </div>

                {/* Current color display */}
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded border border-[var(--border)]"
                        style={{ backgroundColor: currentColor }}
                    />
                    <span className="text-xs font-mono text-[var(--color-text-dim)]">{currentColor}</span>
                </div>
            </div>

            {/* Apply to all */}
            <div className="pt-4 border-t border-[var(--border)]">
                <button
                    onClick={() => updateGutterColorAll(currentColor)}
                    className="w-full py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-md font-bold hover:bg-[#2a2a33] transition-colors"
                >
                    この色を全パネルに適用
                </button>
                <p className="text-[10px] text-[var(--color-text-dim)] mt-1 text-center">
                    現在のガター色 ({currentColor}) を全パネルに一括適用します
                </p>
            </div>
        </div>
    );
}
