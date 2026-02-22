'use client';

import React, { useRef, useState } from 'react';
import { useEditorStore } from '@/stores/editorStore';

export default function ImageReplacer({ panelId, subPanelId }: { panelId: string, subPanelId?: string }) {
    const replaceImage = useEditorStore(state => state.replaceImage);
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('panelId', panelId);
            if (subPanelId) formData.append('subPanelId', subPanelId);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                replaceImage(panelId, data.src, subPanelId);
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('Upload error');
        } finally {
            setIsUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="absolute top-2 right-2 z-50 opacity-80 hover:opacity-100 transition-opacity">
            <input
                type="file"
                accept="image/*"
                ref={inputRef}
                onChange={handleUpload}
                className="hidden"
            />
            <button
                onClick={() => inputRef.current?.click()}
                disabled={isUploading}
                className="bg-black/80 backdrop-blur text-white font-bold text-xs px-3 py-2 rounded border border-white/20 hover:bg-[var(--accent)] shadow-lg"
            >
                {isUploading ? 'Uploading...' : '📷 画像差し替え'}
            </button>
        </div>
    );
}
