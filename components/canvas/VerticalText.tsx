'use client';

import React from 'react';
import { Group, Text as KonvaText } from 'react-konva';

interface VerticalTextProps {
    x?: number;
    y?: number;
    text: string;
    fontSize: number;
    fontFamily?: string;
    fill: string;
    fontStyle?: string;
    columns?: number;
    width?: number;
    height?: number;
    align?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;
    effectStyle?: 'none' | 'jitter' | 'wave' | 'impact';
    isVertical?: boolean; // Default true for backward compatibility
}

const ROTATE_CHARS = ['ー', '…', '—', '-', '~', '〜', '(', ')', '[', ']', '{', '}', '<', '>', '《', '》', '「', '」', '『', '』', '【', '】'];
const OFFSET_TOP_RIGHT_CHARS = ['、', '。', '，', '．'];
const OFFSET_SMALL_CHARS = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'っ', 'ゃ', 'ゅ', 'ょ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ッ', 'ャ', 'ュ', 'ョ'];

export default function VerticalText({
    x = 0,
    y = 0,
    text,
    fontSize,
    fontFamily = '"M PLUS 1p", sans-serif',
    fill,
    fontStyle = 'normal',
    columns = 1,
    width = 0,
    height = 0,
    stroke,
    strokeWidth,
    opacity = 1,
    effectStyle = 'none',
    isVertical = true
}: VerticalTextProps) {
    const lines = text.split('\n');
    const cols = lines.length;

    // Line spacing (tightened for Webtoon SFX)
    const lineHeight = fontSize * 0.95; // Was 1.1
    const colSpacing = fontSize * 1.05; // Was 1.2

    const columnData: string[][] = lines.map(line => line.split(''));

    // Text block total dimensions (filter out empty chars so multiple \n don't create massive false cols)
    const maxCharsInCol = Math.max(...columnData.map(c => c.filter(char => char.trim() !== '').length || 1));

    // Total dimensions flip based on orientation
    const totalWidth = isVertical ? (cols * colSpacing) : (maxCharsInCol * fontSize); // Approximate width for horizontal
    const totalHeight = isVertical ? (maxCharsInCol * lineHeight) : (cols * colSpacing);

    const startX = width > 0 ? (width - totalWidth) / 2 : 0;
    const startY = height > 0 ? (height - totalHeight) / 2 : 0;

    const getPseudoRandom = (seed: number) => {
        const x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    };

    const renderChars = (isStrokeLayer: boolean) => {
        return columnData.map((colChars, colIndex) => {
            // Base coordinate for the line/column
            const basePos = isVertical
                ? startX + totalWidth - (colIndex * colSpacing) - colSpacing // Right to left
                : startY + (colIndex * colSpacing); // Top to bottom

            return colChars.map((char, charIndex) => {
                const stepPos = isVertical
                    ? startY + (charIndex * lineHeight) // Top to bottom
                    : startX + (charIndex * fontSize); // Left to right

                let charX = isVertical ? basePos : stepPos;
                let charY = isVertical ? stepPos : basePos;
                let rotation = 0;
                let charFontSize = fontSize;

                if (effectStyle === 'wave') {
                    if (isVertical) charX += Math.sin(colIndex + charIndex * 0.8) * (fontSize * 0.3);
                    else charY += Math.sin(colIndex + charIndex * 0.8) * (fontSize * 0.3);
                } else if (effectStyle === 'jitter') {
                    const seed = colIndex * 100 + charIndex;
                    charX += (getPseudoRandom(seed) - 0.5) * (fontSize * 0.4);
                    charY += (getPseudoRandom(seed + 1) - 0.5) * (fontSize * 0.4);
                    rotation += (getPseudoRandom(seed + 2) - 0.5) * 30;
                    charFontSize *= 0.8 + (getPseudoRandom(seed + 3) * 0.4);
                } else if (effectStyle === 'impact') {
                    // Start large at the beginning (index 0) and shrink towards index length
                    const shrinkFactor = Math.max(0.5, 1 - (charIndex * 0.15));
                    charFontSize *= shrinkFactor;

                    // The center of the smaller characters needs to be shifted up (vertical)
                    // or left (horizontal) to align the "bottoms" or maintain baseline.
                    // Instead of multiplying by charIndex which causes drifting, we apply a static offset
                    // based on the difference in size to keep them somewhat aligned.
                    const sizeDiff = fontSize - charFontSize;

                    if (isVertical) {
                        charY -= sizeDiff * 0.3; // Slight nudge up to align vertically
                    } else {
                        charX -= sizeDiff * 0.3;
                    }
                }

                if (isVertical) {
                    if (ROTATE_CHARS.includes(char)) {
                        rotation += 90;
                        charX += charFontSize;
                        charY += charFontSize * 0.1;
                    } else if (OFFSET_TOP_RIGHT_CHARS.includes(char)) {
                        charX += charFontSize * 0.3;
                        charY -= charFontSize * 0.3;
                    } else if (OFFSET_SMALL_CHARS.includes(char)) {
                        charX += charFontSize * 0.1;
                        charY -= charFontSize * 0.1;
                    }
                } // Horizontal specific char tweaks can go here if needed later

                return (
                    <KonvaText
                        key={`char-${isStrokeLayer ? 'stroke' : 'fill'}-${colIndex}-${charIndex}`}
                        x={charX}
                        y={charY}
                        text={char}
                        fontSize={charFontSize}
                        fontFamily={fontFamily}
                        fill={isStrokeLayer ? undefined : fill}
                        fontStyle={fontStyle}
                        rotation={rotation}
                        align="center"
                        verticalAlign="middle"
                        stroke={isStrokeLayer ? stroke : undefined}
                        strokeWidth={isStrokeLayer ? strokeWidth : 0}
                        opacity={opacity}
                        lineJoin="round"
                    />
                );
            });
        });
    };

    return (
        <Group x={x} y={y}>
            {stroke && strokeWidth ? renderChars(true) : null}
            {renderChars(false)}
        </Group>
    );
}
