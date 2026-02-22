'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Group, Transformer, Text, Image as KonvaImage } from 'react-konva';
import { Sfx } from '@/types/storyboard';
import { useEditorStore } from '@/stores/editorStore';
import VerticalText from './VerticalText';

interface SfxElementProps {
    sfx: Sfx;
    panelId: string;
    subPanelId?: string;
    selected: boolean;
    panelWidth: number;
    panelHeight: number;
}

export default function SfxElement({ sfx, panelId, subPanelId, selected, panelWidth, panelHeight }: SfxElementProps) {
    const selectSfx = useEditorStore(state => state.selectSfx);
    const updateSfx = useEditorStore(state => state.updateSfx);

    const textRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

    useEffect(() => {
        if (sfx.type === 'image' && sfx.imageUrl) {
            const img = new window.Image();
            img.src = sfx.imageUrl;
            img.onload = () => {
                setImageObj(img);
            };
        } else {
            setImageObj(null);
        }
    }, [sfx.type, sfx.imageUrl]);

    useEffect(() => {
        if (selected && trRef.current && textRef.current) {
            trRef.current.nodes([textRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [selected]);

    // The SFX (x, y) coordinates are percentages OF THE SUB-PANEL CHUNK it belongs to.
    const x = (sfx.position.x / 100) * panelWidth;
    const y = (sfx.position.y / 100) * panelHeight;

    const handleDragEnd = (e: any) => {
        // Convert back to percentages of the sub-panel chunk
        const newX = (e.target.x() / panelWidth) * 100;
        const newY = (e.target.y() / panelHeight) * 100;

        updateSfx(panelId, sfx.id, {
            position: { x: newX, y: newY }
        }, subPanelId);
    };

    const handleTransformEnd = () => {
        const node = textRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        updateSfx(panelId, sfx.id, {
            scale: {
                x: (sfx.scale?.x || 1) * scaleX,
                y: (sfx.scale?.y || 1) * scaleY
            },
            rotation: node.rotation(),
            position: {
                x: (node.x() / panelWidth) * 100,
                y: (node.y() / panelHeight) * 100
            }
        }, subPanelId);
    };

    const scaleX = sfx.scale?.x || 1;
    const scaleY = sfx.scale?.y || 1;
    const isVertical = sfx.isVertical !== false; // Default to true for backward compatibility
    const fontFamily = sfx.fontFamily || '"M PLUS 1p", sans-serif';

    // Konva Text calculates bounds based on fontSize. VerticalText handles its own sizing.
    // For horizontal text, we just use a single Text node.
    let textContent;

    if (sfx.type === 'image' && imageObj) {
        // Restrict massive images to fit nicely in panel initially
        const maxW = panelWidth * 0.8;
        let imgW = imageObj.width;
        let imgH = imageObj.height;
        if (imgW > maxW) {
            const ratio = maxW / imgW;
            imgW = maxW;
            imgH = imgH * ratio;
        }

        textContent = (
            <KonvaImage
                image={imageObj}
                width={imgW}
                height={imgH}
                opacity={sfx.opacity}
                offsetX={imgW / 2}
                offsetY={imgH / 2}
            />
        );
    } else if (isVertical) {
        textContent = (
            <VerticalText
                text={sfx.text}
                fontSize={sfx.fontSize}
                fontFamily={fontFamily}
                fill={sfx.color}
                fontStyle={sfx.fontWeight}
                columns={1}
                stroke={sfx.outline?.enabled ? sfx.outline.color : undefined}
                strokeWidth={sfx.outline?.enabled ? (sfx.outline.width ?? 4) : 0}
                opacity={sfx.opacity}
                effectStyle={sfx.effectStyle}
            />
        );
    } else {
        textContent = (
            <VerticalText
                text={sfx.text}
                fontSize={sfx.fontSize}
                fontFamily={fontFamily}
                fill={sfx.color}
                fontStyle={sfx.fontWeight}
                columns={1}
                stroke={sfx.outline?.enabled ? sfx.outline.color : undefined}
                strokeWidth={sfx.outline?.enabled ? (sfx.outline.width ?? 4) : 0}
                opacity={sfx.opacity}
                effectStyle={sfx.effectStyle}
                isVertical={false}
            />
        );
    }

    return (
        <React.Fragment>
            <Group
                ref={textRef}
                x={x}
                y={y}
                draggable
                onClick={(e) => {
                    selectSfx(sfx.id);
                    useEditorStore.getState().setEditTab('sfx');
                    e.currentTarget.moveToTop();
                }}
                onTap={(e) => {
                    selectSfx(sfx.id);
                    useEditorStore.getState().setEditTab('sfx');
                    e.currentTarget.moveToTop();
                }}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
                rotation={sfx.rotation}
                scaleX={scaleX}
                scaleY={scaleY}
                skewX={sfx.skewX || 0}
                shadowColor={sfx.shadow?.enabled ? sfx.shadow?.color : "transparent"}
                shadowBlur={sfx.shadow?.enabled ? sfx.shadow?.blur : 0}
                shadowOffsetX={sfx.shadow?.enabled ? sfx.shadow?.offsetX : 0}
                shadowOffsetY={sfx.shadow?.enabled ? sfx.shadow?.offsetY : 0}
                shadowOpacity={1} // The color itself should have alpha, or 100%
            >
                {textContent}
            </Group>

            {selected && (
                <Transformer
                    ref={trRef}
                    resizeEnabled={true} // Allow scaling text
                    rotateEnabled={true} // Allow rotating SFX
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 10 || newBox.height < 10) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </React.Fragment>
    );
}
