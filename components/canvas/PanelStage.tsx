'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage, Group } from 'react-konva';
import { Panel, SubPanel } from '@/types/storyboard';
import { useEditorStore } from '@/stores/editorStore';
import BubbleElement from './BubbleElement';
import SfxElement from './SfxElement';

export interface SubPanelLayout {
    sp: SubPanel | Panel;
    gapY: number;
    gapH: number;
    imageY: number;
    imageH: number;
    isMock: boolean;
    imgObj: HTMLImageElement; // Store the specific image instance to render
}

export interface PanelLayout {
    totalHeight: number;
    subPanels: SubPanelLayout[];
}

export default function PanelStage({
    panel,
    width,
    onLayoutCalculated
}: {
    panel: Panel,
    width: number,
    onLayoutCalculated?: (layout: PanelLayout) => void
}) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [layout, setLayout] = useState<PanelLayout>({ totalHeight: 300, subPanels: [] });
    const [pixelRatio, setPixelRatio] = useState(1);
    const selectedBubbleId = useEditorStore(state => state.selectedBubbleId);
    const selectedSfxId = useEditorStore(state => state.selectedSfxId);
    const selectPanel = useEditorStore(state => state.selectPanel);
    const selectSubPanel = useEditorStore(state => state.selectSubPanel);
    const setEditTab = useEditorStore(state => state.setEditTab);

    // Track onLayoutCalculated in a ref so we don't re-trigger useEffect on every parent render
    const onLayoutRef = useRef(onLayoutCalculated);
    useEffect(() => {
        onLayoutRef.current = onLayoutCalculated;
    }, [onLayoutCalculated]);

    useEffect(() => {
        setPixelRatio(window.devicePixelRatio || 1);

        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const image = new window.Image();
                image.src = src;
                image.onload = () => resolve(image);
                image.onerror = reject;
            });
        };

        const loadAllImages = async () => {
            try {
                const mainImage = await loadImage(panel.image.src);
                const isSplit = panel.split_mode === 'equal' || panel.split_mode === 'manual';

                let currentY = 0;
                const subPanelsLayout: SubPanelLayout[] = [];

                if (isSplit && panel.sub_panels && panel.sub_panels.length > 0) {
                    // Pre-load all override images concurrently
                    const overridePromises = panel.sub_panels.map(sp =>
                        sp.override_image ? loadImage(sp.override_image.src) : Promise.resolve(null)
                    );
                    const overrideImages = await Promise.all(overridePromises);

                    panel.sub_panels.forEach((sp, idx) => {
                        const gapH = sp.gap_before || 0;
                        const gapY = currentY;
                        currentY += gapH;

                        const spImg = overrideImages[idx] || mainImage;
                        const fullH = (width / spImg.width) * spImg.height;

                        // If it has an override_image, it uses the whole image intrinsically (y_start=0, y_end=1)
                        // If it's a slice of the main image, apply the slice ratio.
                        const sliceRatio = sp.override_image ? 1.0 : (sp.y_end - sp.y_start);
                        const baseH = fullH * sliceRatio;

                        const targetRatio = sp.display_height_ratio ?? 1.0;
                        const finalH = baseH * Math.max(0.1, targetRatio);

                        subPanelsLayout.push({
                            sp, gapY, gapH, imageY: currentY, imageH: finalH, isMock: false, imgObj: spImg
                        });

                        currentY += finalH;
                    });
                } else {
                    const fullH = (width / mainImage.width) * mainImage.height;
                    const targetRatio = panel.display_height_ratio ?? 1.0;
                    const finalH = fullH * Math.max(0.1, targetRatio);

                    subPanelsLayout.push({
                        sp: panel,
                        gapY: 0, gapH: 0, imageY: 0, imageH: finalH, isMock: true, imgObj: mainImage
                    });
                    currentY = finalH;
                }

                const newLayout = { totalHeight: Math.max(10, currentY), subPanels: subPanelsLayout };
                setLayout(newLayout);
                setIsLoaded(true);
                if (onLayoutRef.current) {
                    onLayoutRef.current(newLayout);
                }
            } catch (error) {
                console.error("Failed to load images", error);
                setIsLoaded(false);
            }
        };

        loadAllImages();
    }, [panel, width]); // Only completely rebuild layout if the panel changes significantly or width changes

    // Long-press for mobile context menu
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressPos = useRef<{ x: number; y: number } | null>(null);

    const clearLongPress = useCallback(() => {
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }, []);

    const showContextMenuAt = useCallback((clientX: number, clientY: number, target: any) => {
        let node = target;
        let bubbleId: string | undefined;
        let sfxId: string | undefined;

        while (node && node.getStage && node !== node.getStage()) {
            const name = node.name ? node.name() : '';
            if (name.startsWith('bubble:')) { bubbleId = name.replace('bubble:', ''); break; }
            if (name.startsWith('sfx:')) { sfxId = name.replace('sfx:', ''); break; }
            node = node.parent;
        }

        const stage = target.getStage ? target.getStage() : null;
        const pos = stage?.getPointerPosition();
        const stageY = pos?.y ?? 0;
        let clickedSubPanelId: string | undefined;

        for (const item of layout.subPanels) {
            if (item.isMock) continue;
            const top = item.gapY;
            const bottom = item.imageY + item.imageH;
            if (stageY >= top && stageY < bottom) {
                clickedSubPanelId = (item.sp as any).id;
                break;
            }
        }

        useEditorStore.getState().showContextMenu({
            x: clientX,
            y: clientY,
            panelId: panel.id,
            subPanelId: clickedSubPanelId,
            bubbleId,
            sfxId,
        });
    }, [layout, panel.id]);

    const handleBackgroundClick = (isMock: boolean, spId: string) => {
        selectPanel(panel.id);
        if (!isMock) selectSubPanel(spId);
        else selectSubPanel(null);

        useEditorStore.getState().selectBubble(null);
        useEditorStore.getState().selectSfx(null);
        setEditTab('size');
    };

    const handleContextMenu = (e: any) => {
        e.evt.preventDefault();
        showContextMenuAt(e.evt.clientX, e.evt.clientY, e.target);
    };

    return (
        <Stage
            width={width}
            height={layout.totalHeight}
            pixelRatio={pixelRatio}
            onContextMenu={handleContextMenu}
            onTouchStart={(e: any) => {
                clearLongPress();
                const touch = e.evt.touches?.[0];
                if (!touch) return;
                longPressPos.current = { x: touch.clientX, y: touch.clientY };
                const target = e.target;
                longPressTimer.current = setTimeout(() => {
                    if (longPressPos.current) {
                        showContextMenuAt(longPressPos.current.x, longPressPos.current.y, target);
                    }
                    longPressTimer.current = null;
                }, 500);
            }}
            onTouchMove={(e: any) => {
                if (!longPressTimer.current || !longPressPos.current) return;
                const touch = e.evt.touches?.[0];
                if (!touch) return;
                const dx = touch.clientX - longPressPos.current.x;
                const dy = touch.clientY - longPressPos.current.y;
                if (dx * dx + dy * dy > 100) clearLongPress(); // Cancel if moved > 10px
            }}
            onTouchEnd={() => clearLongPress()}
            onPointerDown={(e) => {
                // Global fallback if clicked entirely outside bounds
                if (e.target === e.target.getStage()) {
                    selectPanel(panel.id);
                    selectSubPanel(null);
                    useEditorStore.getState().selectBubble(null);
                    useEditorStore.getState().selectSfx(null);
                }
            }}
        >
            {/* Background Gutter Colors Layer */}
            <Layer>
                {layout.subPanels.map((item, idx) => {
                    const sp = item.sp as SubPanel;
                    return (
                        <Rect
                            key={`bg-${sp.id || idx}`}
                            y={item.gapY}
                            width={width}
                            height={item.gapH + item.imageH}
                            fill={sp.gap_color || panel.gap_color}
                            name="bgRect"
                            onPointerDown={() => handleBackgroundClick(item.isMock, sp.id)}
                        />
                    );
                })}
            </Layer>

            {/* Content Layer (Images + Bubbles/SFX) */}
            <Layer listening={true}>
                {isLoaded && layout.subPanels.map((item, idx) => {
                    const { sp, imageY, imageH, isMock, imgObj } = item;
                    const subSp = sp as SubPanel;
                    const p = sp as Panel;

                    const ratio = isMock ? (p.display_height_ratio ?? 1.0) : (subSp.display_height_ratio ?? 1.0);
                    const offsetY = isMock ? (p.crop_offset_y ?? 0.5) : (subSp.crop_offset_y ?? 0.5);

                    const isOverride = !isMock && !!subSp.override_image;
                    const srcW = imgObj.width;

                    // If using an override image, process it as a full stand-alone image
                    const sliceRatio = isOverride ? 1.0 : (isMock ? 1.0 : (subSp.y_end - subSp.y_start));
                    const sliceStartOffset = isOverride ? 0 : (isMock ? 0 : subSp.y_start);

                    const srcBaseH = imgObj.height * sliceRatio;
                    const srcTopY = imgObj.height * sliceStartOffset;

                    let cropW = srcW;
                    let cropH = srcBaseH;
                    let cropX = 0;
                    let cropY = srcTopY;

                    if (ratio < 1.0) {
                        cropH = srcBaseH * ratio;
                        const excessH = srcBaseH - cropH;
                        cropY = srcTopY + (excessH * offsetY);
                    } else if (ratio > 1.0) {
                        cropW = srcW / ratio;
                        const excessW = srcW - cropW;
                        cropX = excessW * 0.5;
                    }

                    const crop = { x: cropX, y: cropY, width: cropW, height: cropH };

                    const activeBubbles = sp.bubbles || [];
                    const activeSfx = sp.sfx || [];

                    return (
                        <Group key={`img-${sp.id || idx}`} y={imageY}>
                            <KonvaImage
                                image={imgObj}
                                crop={crop}
                                width={width}
                                height={imageH}
                                name="panelImage"
                                onPointerDown={() => handleBackgroundClick(isMock, sp.id)}
                            />

                            {/* Grouping so Bubbles still use 0->100% relative coordinates correctly! */}
                            {activeBubbles.map(b => (
                                <BubbleElement
                                    key={b.id}
                                    bubble={b}
                                    panelId={panel.id}
                                    subPanelId={isMock ? undefined : sp.id}
                                    selected={selectedBubbleId === b.id}
                                    panelWidth={width}
                                    panelHeight={imageH}
                                />
                            ))}

                            {activeSfx.map(s => (
                                <SfxElement
                                    key={s.id}
                                    sfx={s}
                                    panelId={panel.id}
                                    subPanelId={isMock ? undefined : sp.id}
                                    selected={selectedSfxId === s.id}
                                    panelWidth={width}
                                    panelHeight={imageH}
                                />
                            ))}
                        </Group>
                    );
                })}
            </Layer>
        </Stage>
    );
}
