import re

with open('/Users/yuiyane/evaris-editor/components/canvas/SfxElement.tsx', 'r') as f:
    c = f.read()

c = c.replace(
"""import React, { useRef, useEffect } from 'react';
import { Group, Transformer, Text } from 'react-konva';""",
"""import React, { useRef, useEffect, useState } from 'react';
import { Group, Transformer, Text, Image as KonvaImage } from 'react-konva';"""
)

old_hooks = """    const textRef = useRef<any>(null);
    const trRef = useRef<any>(null);

    useEffect(() => {"""

new_hooks = """    const textRef = useRef<any>(null);
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

    useEffect(() => {"""
c = c.replace(old_hooks, new_hooks)

old_render = """    // Konva Text calculates bounds based on fontSize. VerticalText handles its own sizing.
    // For horizontal text, we just use a single Text node.
    let textContent;

    if (isVertical) {"""

new_render = """    // Konva Text calculates bounds based on fontSize. VerticalText handles its own sizing.
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
    } else if (isVertical) {"""
c = c.replace(old_render, new_render)

with open('/Users/yuiyane/evaris-editor/components/canvas/SfxElement.tsx', 'w') as f:
    f.write(c)

print("SfxElement patched successfully!")
