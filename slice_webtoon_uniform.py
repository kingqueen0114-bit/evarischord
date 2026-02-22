from PIL import Image
import os
import sys

img_path = sys.argv[1]
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

img = Image.open(img_path).convert("RGB")

panel_ids = ["a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3", "c4"]
num_panels = len(panel_ids)

slice_height = img.height // num_panels

print(f"Slicing into {num_panels} panels, each roughly {slice_height}px tall.")

for i, pid in enumerate(panel_ids):
    y1 = i * slice_height
    y2 = (i + 1) * slice_height if i < num_panels - 1 else img.height
    panel = img.crop((0, y1, img.width, y2))
    
    # Save as PNG to match the JSON
    out_path = os.path.join(out_dir, f"panel-{pid}.png")
    panel.save(out_path)

print("Done.")
