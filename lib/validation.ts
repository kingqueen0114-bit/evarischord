/**
 * Story consistency validation rules (設定整合ルール)
 *
 * Auto-checks text content for violations against the EVARIS CHORD canon.
 * Rules defined in CLAUDE.md:
 *   1. 母は生きている — warn on expressions implying the mother is dead
 *   2. タブレット統一 — detect "ノートPC"/"ラップトップ" → suggest "タブレット"
 *   3. 練習室統一 — detect "スタジオ"/"レッスン室" → suggest "練習室"
 *   4. アイリスの服は黒 — warn on white clothing descriptions for Iris
 */

export interface ValidationWarning {
  rule: string;
  message: string;
  match: string;
}

interface ValidationRule {
  id: string;
  patterns: RegExp[];
  message: string;
}

const RULES: ValidationRule[] = [
  {
    id: 'mother-alive',
    patterns: [
      /母の死/,
      /亡くなった母/,
      /母が亡/,
      /母を亡/,
      /死んだ母/,
      /母が死/,
      /母の遺/,
      /亡き母/,
      /母の墓/,
    ],
    message: '母は生きています。「母の死」に関する表現を確認してください。',
  },
  {
    id: 'tablet-unified',
    patterns: [
      /ノートPC/,
      /ノートパソコン/,
      /ラップトップ/,
    ],
    message: '「タブレット」に統一してください。',
  },
  {
    id: 'practice-room-unified',
    patterns: [
      /スタジオ/,
      /レッスン室/,
    ],
    message: '「練習室」に統一してください。',
  },
  {
    id: 'iris-black-clothes',
    patterns: [
      /アイリス.*白い服/,
      /アイリス.*白いドレス/,
      /アイリス.*白衣/,
      /Iris.*白い服/,
      /Iris.*白いドレス/,
      /白い服.*アイリス/,
      /白いドレス.*アイリス/,
    ],
    message: 'アイリスの服は黒です。白い服の描写を確認してください。',
  },
];

/**
 * Validate a text string against all story consistency rules.
 * Returns an array of warnings (empty if no issues).
 */
export function validateText(text: string): ValidationWarning[] {
  if (!text) return [];

  const warnings: ValidationWarning[] = [];

  for (const rule of RULES) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (match) {
        warnings.push({
          rule: rule.id,
          message: rule.message,
          match: match[0],
        });
        break; // One warning per rule is enough
      }
    }
  }

  return warnings;
}

/**
 * Validate all text fields in a panel (bubbles, SFX, description, prompt notes).
 */
export function validatePanel(panel: {
  description?: string;
  loveart_prompt_notes?: string;
  bubbles?: { text: string }[];
  sfx?: { text: string }[];
  sub_panels?: {
    bubbles: { text: string }[];
    sfx: { text: string }[];
  }[];
}): ValidationWarning[] {
  const texts: string[] = [];

  if (panel.description) texts.push(panel.description);
  if (panel.loveart_prompt_notes) texts.push(panel.loveart_prompt_notes);

  if (panel.bubbles) {
    for (const b of panel.bubbles) {
      if (b.text) texts.push(b.text);
    }
  }
  if (panel.sfx) {
    for (const s of panel.sfx) {
      if (s.text) texts.push(s.text);
    }
  }
  if (panel.sub_panels) {
    for (const sp of panel.sub_panels) {
      for (const b of sp.bubbles) {
        if (b.text) texts.push(b.text);
      }
      for (const s of sp.sfx) {
        if (s.text) texts.push(s.text);
      }
    }
  }

  const combined = texts.join('\n');
  return validateText(combined);
}
