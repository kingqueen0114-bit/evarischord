import re

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'r') as f:
    content = f.read()

# Split content into Bubble section and SFX section to safely replace
bubble_start = content.find("editTab === 'bubble'")
sfx_start = content.find("editTab === 'sfx'")

part1 = content[:bubble_start]
part2 = content[bubble_start:sfx_start]
part3 = content[sfx_start:]

# In part2 (bubble tab), replace selectedSubPanelId || undefined with actualBubbleSubPanelId || undefined
part2 = part2.replace('selectedSubPanelId || undefined', 'actualBubbleSubPanelId || undefined')

# In part3 (sfx tab), replace selectedSubPanelId || undefined with actualSfxSubPanelId || undefined
part3 = part3.replace('selectedSubPanelId || undefined', 'actualSfxSubPanelId || undefined')

new_content = part1 + part2 + part3

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'w') as f:
    f.write(new_content)

print("Replacement complete.")
