export interface Position { x: number; y: number; }
export interface Size { w: number; h: number; }

export interface BubbleTail {
  direction: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible: boolean;
  tipPosition?: { x: number, y: number };
}

export interface Bubble {
  id: string;
  type: 'normal' | 'thought' | 'whisper' | 'shout' | 'square';
  text: string;
  position: Position;      // パネル内のx,y（%ベース 0-100）
  size: Size;              // 幅、高さ（px）
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'black';
  tail: BubbleTail;
  columns: number;         // 1列 or 2列
}

export interface Sfx {
  id: string;
  type?: 'text' | 'image'; // 'text' by default if undefined
  imageUrl?: string;
  text: string;
  category: 'impact' | 'ambient' | 'emotional';
  position: Position;
  fontSize: number;
  color: string;
  rotation: number;        // -180 ~ 180
  fontWeight: 'normal' | 'bold' | 'black';
  outline: { enabled: boolean; color: string; width: number; };
  opacity: number;         // 0-1
  isVertical: boolean;
  scale: { x: number, y: number };
  skewX: number;           // -90 ~ 90
  shadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number; };
  fontFamily: string;
  effectStyle?: 'none' | 'jitter' | 'wave' | 'impact';
}

export interface SfxPreset {
  id: string;              // built-in ("impact", "ominous", etc.) or custom UUID
  name: string;            // Display name in UI (e.g. "ドン！", "俺の爆発音")
  defaultText: string;     // The text inserted by default when clicked
  // Stylistic properties
  category: 'impact' | 'ambient' | 'emotional';
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold' | 'black';
  outline: { enabled: boolean; color: string; width: number; };
  opacity: number;
  isVertical: boolean;
  scale: { x: number, y: number };
  skewX: number;
  shadow: { enabled: boolean; color: string; blur: number; offsetX: number; offsetY: number; };
  fontFamily: string;
  effectStyle?: 'none' | 'jitter' | 'wave' | 'impact';
}

export interface SubPanel {
  id: string;              // "a1-f1", "b2-f2" etc.
  y_start: number;         // 0~1 の比率
  y_end: number;           // 0~1 の比率
  gap_before: number;      // 固有のガター（px）
  gap_color: string;
  display_height_ratio?: number; // 0.5 ~ 1.5
  crop_offset_y?: number;        // 0.0 ~ 1.0 (0=Top, 0.5=Center, 1=Bottom)
  override_image?: PanelImage;   // 分割後の個別画像差し替え用
  bubbles: Bubble[];
  sfx: Sfx[];
}

/** Clipboard content for sub-panel copy/paste (excludes positional data) */
export interface SubPanelClipboard {
  override_image?: PanelImage;
  bubbles: Bubble[];
  sfx: Sfx[];
  display_height_ratio?: number;
  crop_offset_y?: number;
  sourceSubPanelId: string;
  copiedAt: number;
}

export interface PanelImage {
  src: string;
  original_size?: Size;
  history: string[];       // 差し替え履歴
}

export interface Panel {
  id: string;
  label: string;           // "A-1", "B-3" etc.
  part: string;            // "A" or "B"
  section: string;         // "プロローグ", "6ヶ月前" etc.
  frames: string;          // "1-4", "13-16" etc.
  description: string;
  image: PanelImage;
  gap_before: number;      // 上のガター（px） (SubPanel非使用時)
  gap_color: string;       // ガター色 (SubPanel非使用時)
  display_height_ratio?: number; // 0.5 ~ 1.5 (SubPanel非使用時)
  crop_offset_y?: number;        // 0.0 ~ 1.0 (SubPanel非使用時)
  bubbles: Bubble[];       // SubPanel非使用時
  sfx: Sfx[];              // SubPanel非使用時

  // 分割パラメータ
  frame_count?: number;    // "1-4"なら4
  split_mode?: 'equal' | 'manual' | 'none';
  split_positions?: number[]; // [0, 0.25, 0.5, 0.75, 1.0] etc
  sub_panels?: SubPanel[];

  characters: string[];
  mood: string;
  loveart_prompt_notes: string;
}

export interface Storyboard {
  title: string;
  episode: string;
  panels: Panel[];
}

// UI状態
export type ToolMode = 'select' | 'bubble' | 'sfx' | 'narration';
export type EditTab = 'text' | 'bubble' | 'sfx' | 'image' | 'gutter' | 'size' | 'prompt';
