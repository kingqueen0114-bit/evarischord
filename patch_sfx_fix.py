import re

with open('/Users/yuiyane/evaris-editor/components/canvas/SfxElement.tsx', 'r') as f:
    c = f.read()

# We need to make sure we don't clobber the non-uniform scale feature the user explicitly requested in Phase 9.
# Phase 9: "Support non-uniform scaling (stretch X/Y) via Konva Transformer"
# If we force scale x:1, y:1 for text, we break the "skew/stretch" feature.

old_scale = """        updateSfx(panelId, sfx.id, {
            scale: {
                // If it's an image, we preserve the scale stretches. For text, we might want to normalize.
                x: sfx.type === 'image' ? (sfx.scale?.x || 1) * scaleX : 1,
                y: sfx.type === 'image' ? (sfx.scale?.y || 1) * scaleY : 1
            },
            // For text, we bake the scale directly into the fontSize.
            // For images, fontSize acts as the base width.
            fontSize: Math.max(10, Math.round(sfx.fontSize * avgScale)),"""

new_scale = """        // Calculate a proportionate font size increase based on the average scale
        const newFontSize = Math.max(10, Math.round(sfx.fontSize * avgScale));
        
        // Calculate how much of the scale was consumed by the font size increase
        // so we can leave the remainder as the "stretch" factor (non-uniform scale).
        const scaleRatio = sfx.fontSize / newFontSize;
        const remainingScaleX = scaleX * scaleRatio;
        const remainingScaleY = scaleY * scaleRatio;

        updateSfx(panelId, sfx.id, {
            scale: {
                x: (sfx.scale?.x || 1) * (sfx.type === 'image' ? scaleX : remainingScaleX),
                y: (sfx.scale?.y || 1) * (sfx.type === 'image' ? scaleY : remainingScaleY)
            },
            fontSize: sfx.type === 'image' ? sfx.fontSize : newFontSize,"""

c = c.replace(old_scale, new_scale)

with open('/Users/yuiyane/evaris-editor/components/canvas/SfxElement.tsx', 'w') as f:
    f.write(c)

print("SFX Scaling logic refined successfully!")
