'use client';

import React, { useRef, useEffect } from 'react';
import { Group, Rect, Path, Ellipse, Star, Transformer, Circle } from 'react-konva';
import { Bubble } from '@/types/storyboard';
import { useEditorStore } from '@/stores/editorStore';
import VerticalText from './VerticalText';

interface BubbleElementProps {
    bubble: Bubble;
    panelId: string;
    subPanelId?: string;
    selected: boolean;
    panelWidth: number;
    panelHeight: number;
    unifiedHeight?: number;
    yOffset?: number;
}

export default function BubbleElement({ bubble, panelId, subPanelId, selected, panelWidth, panelHeight, unifiedHeight = panelHeight, yOffset = 0 }: BubbleElementProps) {
    const selectBubble = useEditorStore(state => state.selectBubble);
    const updateBubble = useEditorStore(state => state.updateBubble);

    const shapeRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {
        if (selected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [selected]);

    // The bubble's (x, y) coordinates are percentages OF THE SUB-PANEL CHUNK it belongs to.
    const x = (bubble.position.x / 100) * panelWidth;
    const y = (bubble.position.y / 100) * panelHeight;

    const handleDragEnd = (e: any) => {
        // Convert back to percentages of the sub-panel chunk
        const newX = (e.target.x() / panelWidth) * 100;
        const newY = (e.target.y() / panelHeight) * 100;

        updateBubble(panelId, bubble.id, {
            position: { x: newX, y: newY }
        }, subPanelId);
    };

    const handleTransformEnd = () => {
        const node = shapeRef.current;
        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const avgScale = (Math.abs(scaleX) + Math.abs(scaleY)) / 2;

        node.scaleX(1);
        node.scaleY(1);

        updateBubble(panelId, bubble.id, {
            size: {
                // If it was already auto-sized, scale the auto-sized display bounds, not the base bounds
                w: Math.max(20, (bubble as any).customSize ? bubble.size.w * scaleX : displayW * scaleX),
                h: Math.max(20, (bubble as any).customSize ? bubble.size.h * scaleY : displayH * scaleY),
            },
            fontSize: Math.max(8, Math.round(bubble.fontSize * avgScale)),
            // Mark as custom sized so auto-layout doesn't snap it back
            customSize: true,
            // Optionally adjust position if center changed during scale
            position: {
                x: (node.x() / panelWidth) * 100,
                y: (node.y() / panelHeight) * 100
            }
        } as any, subPanelId);
    };

    const handleTailDragEnd = (e: any) => {
        // The Circle handle is dragged relative to the sub-panel (outer Group is 0,0).
        // e.target.x() is the new absolute X inside the sub-panel.
        // We subtract the Bubble's x/y coordinate to get the localized delta (dx, dy).
        const dx = e.target.x() - x;
        const dy = e.target.y() - y;

        updateBubble(panelId, bubble.id, {
            tail: {
                ...bubble.tail,
                tipPosition: { x: dx, y: dy }
            }
        }, subPanelId);
        e.cancelBubble = true;
    };

    // Calculate dynamic size based on text length, if the user hasn't scaled it massively.
    let displayW = bubble.size.w;
    let displayH = bubble.size.h;

    // Smart sizing logic with exact tables for 1-3 chars (if no manual newlines)
    const hasNewline = bubble.text.includes('\n');
    const charCount = bubble.text.length;

    let estimatedW = 80;
    let estimatedH = 100;

    if (!hasNewline && charCount <= 3) {
        if (charCount === 1) { estimatedW = 45; estimatedH = 55; }
        else if (charCount === 2) { estimatedW = 50; estimatedH = 70; }
        else if (charCount === 3) { estimatedW = 55; estimatedH = 90; }
    } else {
        const lines = bubble.text.split('\n');
        const cols = lines.length;
        const maxCharsInCol = Math.max(...lines.map(line => line.length));

        estimatedW = Math.max(80, cols * bubble.fontSize * 1.5 + 40);
        estimatedH = Math.max(100, maxCharsInCol * bubble.fontSize * 1.2 + 40);
    }

    // If current size is smaller than estimate, use estimate.
    // UNLESS the user explicitly sized it, in which case we respect their size absolutely.
    const isCustomSized = (bubble as any).customSize === true;
    if (!isCustomSized) {
        if (displayW < estimatedW) displayW = estimatedW;
        if (displayH < estimatedH) displayH = estimatedH;
    }

    // tipPosition is stored directly as LOCAL pixel deltas (dx, dy) relative to the bubble center.
    let localTipX = bubble.tail.tipPosition?.x ?? 0;
    let localTipY = bubble.tail.tipPosition?.y ?? 30; // 30px down by default

    // Sanitize wildly out-of-bounds legacy values from previous bugs
    if (Math.abs(localTipX) > 1000 || Math.abs(localTipY) > 1000) {
        localTipX = 0;
        localTipY = 30;
    }

    // Calculate Perpendicular base for the tail so it doesn't collapse horizontally
    const tailBaseWidth = Math.min(80, Math.max(30, displayW / 2.5));
    const tipAngle = Math.atan2(localTipY, localTipX);
    const baseX1 = Math.cos(tipAngle + Math.PI / 2) * (tailBaseWidth / 2);
    const baseY1 = Math.sin(tipAngle + Math.PI / 2) * (tailBaseWidth / 2);
    const baseX2 = Math.cos(tipAngle - Math.PI / 2) * (tailBaseWidth / 2);
    const baseY2 = Math.sin(tipAngle - Math.PI / 2) * (tailBaseWidth / 2);
    const tailPath = `M ${baseX1} ${baseY1} L ${baseX2} ${baseY2} L ${localTipX} ${localTipY} Z`;

    const renderTail = (isStroke: boolean) => {
        if (!bubble.tail.visible) return null;
        return (
            <Path
                data={tailPath}
                fill={isStroke ? undefined : "#ffffff"}
                stroke={isStroke ? "#000000" : undefined}
                strokeWidth={isStroke ? 4 : 0}
                strokeEnabled={isStroke}
                fillEnabled={!isStroke}
                lineJoin="round"
                lineCap="round"
                dash={[]} // Force solid line! React-Konva can leak dashes from siblings.
            />
        );
    };

    const renderBubbleShape = (isStroke: boolean) => {
        switch (bubble.type) {
            case 'normal':
                return (
                    <Ellipse
                        radiusX={displayW / 2}
                        radiusY={displayH / 2}
                        fill={isStroke ? undefined : "#ffffff"}
                        stroke={isStroke ? "#000000" : undefined}
                        strokeWidth={isStroke ? 4 : 0}
                        strokeEnabled={isStroke}
                        fillEnabled={!isStroke}
                        dash={[]} // Force solid line
                    />
                );
            case 'thought':
                return (
                    <Ellipse
                        radiusX={displayW / 2}
                        radiusY={displayH / 2}
                        fill={isStroke ? undefined : "#ffffff"}
                        stroke={isStroke ? "#000000" : undefined}
                        strokeWidth={isStroke ? 4 : 0}
                        strokeEnabled={isStroke}
                        fillEnabled={!isStroke}
                        dash={isStroke ? [5, 5] : []}
                    />
                );
            case 'whisper':
                return (
                    <Ellipse
                        radiusX={displayW / 2}
                        radiusY={displayH / 2}
                        fill={isStroke ? undefined : "#ffffff"}
                        stroke={isStroke ? "#999999" : undefined}
                        strokeWidth={isStroke ? 2 : 0}
                        strokeEnabled={isStroke}
                        fillEnabled={!isStroke}
                        opacity={isStroke ? 0.8 : 1.0}
                        dash={isStroke ? [5, 10] : []}
                    />
                );
            case 'shout':
                return (
                    <Star
                        numPoints={12}
                        innerRadius={displayW / 2.5}
                        outerRadius={displayH / 1.5}
                        fill={isStroke ? undefined : "#ffffff"}
                        stroke={isStroke ? "#000000" : undefined}
                        strokeWidth={isStroke ? 6 : 0}
                        strokeEnabled={isStroke}
                        fillEnabled={!isStroke}
                        lineJoin="round"
                        dash={[]} // Force solid line
                    />
                );
            case 'square':
                return (
                    <Rect
                        x={-displayW / 2}
                        y={-displayH / 2}
                        width={displayW}
                        height={displayH}
                        cornerRadius={8}
                        fill={isStroke ? undefined : "#ffffff"}
                        stroke={isStroke ? "#000000" : undefined}
                        strokeWidth={isStroke ? 4 : 0}
                        strokeEnabled={isStroke}
                        fillEnabled={!isStroke}
                        dash={[]}
                    />
                );
        }
    };

    // Use vertical rendering always for Phase 7
    return (
        <Group>
            <Group
                ref={shapeRef}
                name={`bubble:${bubble.id}`}
                x={x}
                y={y}
                draggable
                onClick={(e) => {
                    selectBubble(bubble.id);
                    useEditorStore.getState().setEditTab('text');
                    // Bring to front visually
                    e.currentTarget.moveToTop();
                }}
                onTap={(e) => {
                    selectBubble(bubble.id);
                    useEditorStore.getState().setEditTab('text');
                    e.currentTarget.moveToTop();
                }}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
            >
                {/* 1. LAYER STROKES FIRST (Behind) */}
                {renderTail(true)}
                {renderBubbleShape(true)}

                {/* 2. LAYER FILLS SECOND (In front, covering internal strokes) */}
                {renderTail(false)}
                {renderBubbleShape(false)}

                <VerticalText
                    x={-displayW / 2}
                    y={-displayH / 2}
                    text={bubble.text}
                    fontSize={bubble.fontSize}
                    fontFamily='"M PLUS 1p", sans-serif'
                    fill="#000000"
                    fontStyle={bubble.fontWeight}
                    width={displayW}
                    height={displayH}
                />
            </Group>

            {selected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 40 || newBox.height < 40) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}

            {/* Draggable Tail Control Point */}
            {selected && bubble.tail.visible && (
                <Circle
                    x={x + localTipX}
                    y={y + localTipY}
                    radius={6}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={2}
                    draggable
                    onDragEnd={handleTailDragEnd}
                    onDragMove={(e) => {
                        // Prevent event bubbling to avoid moving the entire bubble
                        e.cancelBubble = true;
                    }}
                />
            )}
        </Group>
    );
}
