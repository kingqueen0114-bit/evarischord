import re

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'r') as f:
    content = f.read()

# Fix handleAddBubble
content = content.replace(
    "}, selectedSubPanelId || undefined);",
    "}, selectedSubPanelId || (panel.sub_panels && panel.sub_panels.length > 0 ? panel.sub_panels[0].id : undefined));"
)

with open('/Users/yuiyane/evaris-editor/components/ui/EditorPanel.tsx', 'w') as f:
    f.write(content)
print("Handled replace")
