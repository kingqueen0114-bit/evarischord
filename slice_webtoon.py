from PIL import Image
import numpy as np
import sys
import os

img_path = sys.argv[1]
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

try:
    img = Image.open(img_path)
    img = img.convert("RGB")
except Exception as e:
    print(f"Failed to load image: {e}")
    sys.exit(1)

# Convert to grayscale numpy array
gray = np.array(img.convert("L"))
variances = np.var(gray, axis=1)

threshold = 10.0
is_gap = variances < threshold

gaps = []
in_gap = False
start = 0
for i, val in enumerate(is_gap):
    if val and not in_gap:
        in_gap = True
        start = i
    elif not val and in_gap:
        in_gap = False
        gaps.append((start, i))
if in_gap:
    gaps.append((start, len(is_gap)))

min_gap_height = 20
valid_gaps = [g for g in gaps if g[1] - g[0] >= min_gap_height]

cut_y_coords = [0]
for g in valid_gaps:
    mid = (g[0] + g[1]) // 2
    cut_y_coords.append(mid)
cut_y_coords.append(img.height)

print(f"Found {len(cut_y_coords)-1} panels.")

for i in range(len(cut_y_coords) - 1):
    y1 = cut_y_coords[i]
    y2 = cut_y_coords[i+1]
    panel = img.crop((0, y1, img.width, y2))
    out_path = os.path.join(out_dir, f"panel-{i+1:02d}.png")
    panel.save(out_path)

print("Done.")
