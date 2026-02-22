# EVARIS CHORD Webtoon Editor v3 — Claude Code 開発指示書

> このファイルを `~/evaris-editor/CLAUDE.md` として配置してください。

---

## 概要

EVARIS CHORD専用のWebtoonエディタ（PWA）。
AI生成画像（LoveArt / FLUX）と吹き出し・SFXを**レイヤー構造**で管理し、スマホ・PCの両方で編集できるツール。

**画像加工機能は不要。** 画像は外部で生成→このエディタで差し替え。
吹き出し・SFX・ガターは画像レイヤーの**上**に独立して配置。

---

## レイヤー構造（最重要・全てのコンポーネントの基盤）

```
┌─────────────────────────────┐
│  Layer 3: SFX              │ ← 効果音テキスト（ドラッグ・回転・色変更可能）
│  Layer 2: 吹き出し + セリフ │ ← 楕円+縦書きテキスト（ドラッグ・リサイズ可能）
│  Layer 1: コマ画像          │ ← 差し替え可能、編集不可
│  Layer 0: 背景（ガター色）  │ ← 白 or 黒 or カスタム色
└─────────────────────────────┘
```

Konva.jsでは各レイヤーをKonva `<Layer>` として分離し、上位レイヤーが常に前面に描画されること。

---

## 技術スタック

```
Next.js 14 (App Router) + TypeScript + Tailwind CSS
Konva.js + react-konva (Canvas描画・レイヤー管理)
zustand (状態管理 + undo/redo)
next-pwa (PWA対応)
```

---

## Step 0: プロジェクト作成

```bash
cd ~
mkdir evaris-editor && cd evaris-editor

npx create-next-app@latest . --app --tailwind --typescript --eslint --no-src-dir --import-alias "@/*"

npm install react-konva konva zustand next-pwa uuid
npm install -D @types/uuid

# ディレクトリ
mkdir -p public/panels
mkdir -p public/fonts
mkdir -p app/api/storyboard
mkdir -p app/api/upload
mkdir -p app/api/prompt
mkdir -p components/canvas
mkdir -p components/ui
mkdir -p components/panels
mkdir -p lib
mkdir -p stores
mkdir -p types
```

---

## Step 1: データ準備

### パネル画像の配置

PART A・B の10枚のパネル画像を `public/panels/` に配置：

```
public/panels/
├── panel-a1.png  (A-1: コマ1-4 プロローグ冒頭)
├── panel-a2.png  (A-2: コマ5-8 タイトル+キャラ紹介)
├── panel-a3.png  (A-3: コマ9-12 コンサート+振り返り)
├── panel-b1.png  (B-1: コマ13-16 6ヶ月前+コンサート最高潮)
├── panel-b2.png  (B-2: コマ17-20 ファンの涙+楽屋)
├── panel-b3.png  (B-3: コマ21-24 アイリス意味深+葛城登場)
├── panel-b4.png  (B-4: コマ25-28 葛城タブレット+夜の高速)
├── panel-b5.png  (B-5: コマ29-32 既読スルー+ブレーキ異常)
├── panel-b6.png  (B-6: コマ33-36 衝突+沈黙)
└── panel-b7.png  (B-7: コマ37-39 病院+ニュース+レン崩壊)
```

### ストーリーボードデータ

`public/ep001-storyboard.json` を以下の構造で作成：

```json
{
  "title": "EVARIS CHORD",
  "episode": "EP001",
  "panels": [
    {
      "id": "a1",
      "label": "A-1",
      "part": "A",
      "section": "プロローグ",
      "frames": "1-4",
      "description": "暗闇→テキスト「歌うことができなくなった」→「だけど——」",
      "image": { "src": "/panels/panel-a1.png" },
      "gap_before": 0,
      "gap_color": "#000000",
      "bubbles": [],
      "sfx": [],
      "characters": ["Eva"],
      "mood": "despair → hope",
      "loveart_prompt_notes": "エヴァが暗闘で膝を抱える。テキストコマ3枚。黒→グレーグラデーション"
    }
  ]
}
```

全10パネル分のデータを含めること。各パネルに `loveart_prompt_notes` を入れる（LoveArtプロンプト再生成用のメモ）。

---

## Step 2: 型定義

### types/storyboard.ts

```typescript
export interface Position { x: number; y: number; }
export interface Size { w: number; h: number; }

export interface BubbleTail {
  direction: 'top' | 'bottom' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  visible: boolean;
}

export interface Bubble {
  id: string;
  type: 'normal' | 'thought' | 'whisper' | 'shout';
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
  text: string;
  category: 'impact' | 'ambient' | 'emotional';
  position: Position;
  fontSize: number;
  color: string;
  rotation: number;        // -180 ~ 180
  fontWeight: 'normal' | 'bold' | 'black';
  outline: { enabled: boolean; color: string; width: number; };
  opacity: number;         // 0-1
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
  gap_before: number;      // 上のガター（px）
  gap_color: string;       // ガター色
  bubbles: Bubble[];
  sfx: Sfx[];
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
```

---

## Step 3: 状態管理 (zustand)

### stores/editorStore.ts

```typescript
import { create } from 'zustand';
import { Storyboard, Panel, Bubble, Sfx, ToolMode, EditTab } from '@/types/storyboard';

interface EditorState {
  // Data
  storyboard: Storyboard | null;

  // UI
  toolMode: ToolMode;
  selectedPanelId: string | null;
  selectedBubbleId: string | null;
  selectedSfxId: string | null;
  editTab: EditTab;
  editPanelOpen: boolean;

  // Undo/Redo
  history: string[];     // JSON snapshots
  historyIndex: number;

  // Actions
  setStoryboard: (sb: Storyboard) => void;
  setToolMode: (mode: ToolMode) => void;
  selectPanel: (id: string | null) => void;
  selectBubble: (id: string | null) => void;
  selectSfx: (id: string | null) => void;
  setEditTab: (tab: EditTab) => void;
  setEditPanelOpen: (open: boolean) => void;

  // Edit operations (all push to history first)
  updatePanel: (panelId: string, updates: Partial<Panel>) => void;
  updateBubble: (panelId: string, bubbleId: string, updates: Partial<Bubble>) => void;
  addBubble: (panelId: string, bubble: Bubble) => void;
  deleteBubble: (panelId: string, bubbleId: string) => void;
  updateSfx: (panelId: string, sfxId: string, updates: Partial<Sfx>) => void;
  addSfx: (panelId: string, sfx: Sfx) => void;
  deleteSfx: (panelId: string, sfxId: string) => void;
  replaceImage: (panelId: string, newSrc: string) => void;
  updateGutter: (panelId: string, gap: number, color?: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Helpers
  getPanel: (id: string) => Panel | undefined;
  getAllPanels: () => Panel[];
}

// 実装のルール:
// 1. 全ての編集操作は pushHistory() → update の順
// 2. undo/redo は historyIndex を移動して storyboard を復元
// 3. history は最大50エントリ
```

---

## Step 4: コアコンポーネント

### app/page.tsx
- storyboard.json を fetch → editorStore.setStoryboard()
- レスポンシブレイアウト: Mobile (<900px) / Desktop (>=900px)

### app/layout.tsx
- PWA meta tags
- Google Fonts: Noto Sans JP + M PLUS 1p
- viewport: width=device-width, maximum-scale=1, user-scalable=no

### components/canvas/WebtoonCanvas.tsx (★最重要)

全パネルを縦に並べたスクロールビュー。各パネルは Konva `<Stage>` で描画。

```
レイアウト:
┌─────────────── 画面幅 ───────────────┐
│                                      │
│  ┌─── ガター（gap_before px）────┐   │
│  │    背景色（gap_color）        │   │
│  └──────────────────────────────┘   │
│  ┌─── Konva Stage ──────────────┐   │
│  │  Layer 0: 背景色             │   │
│  │  Layer 1: パネル画像         │   │
│  │  Layer 2: 吹き出し群         │   │ ← ドラッグ可能
│  │  Layer 3: SFX群              │   │ ← ドラッグ・回転可能
│  └──────────────────────────────┘   │
│                                      │
│  ┌─── 次のパネル ───────────────┐   │
│  ...                                 │
└──────────────────────────────────────┘
```

**重要:** react-konva は SSR非対応。`dynamic import` + `ssr: false` で読み込むこと。

**パフォーマンス:** 全パネルを同時にKonva化しない。`IntersectionObserver` でビューポート内のパネルだけ Konva化し、範囲外は通常の `<img>` で表示する「仮想化」を実装すること。

### components/canvas/PanelStage.tsx

1パネル分のKonvaステージ。

```tsx
<Stage width={panelWidth} height={panelHeight}>
  {/* Layer 0: 背景 */}
  <Layer>
    <Rect fill={panel.gap_color} width={panelWidth} height={panelHeight} />
  </Layer>

  {/* Layer 1: パネル画像（タップで差し替え可能、ドラッグ不可） */}
  <Layer listening={false}>
    <KonvaImage image={loadedImage} width={panelWidth} height={panelHeight} />
  </Layer>

  {/* Layer 2: 吹き出し（常に画像の上） */}
  <Layer>
    {panel.bubbles.map(b => (
      <BubbleElement key={b.id} bubble={b} selected={b.id === selectedBubbleId} />
    ))}
  </Layer>

  {/* Layer 3: SFX（常に最前面） */}
  <Layer>
    {panel.sfx.map(s => (
      <SfxElement key={s.id} sfx={s} selected={s.id === selectedSfxId} />
    ))}
  </Layer>
</Stage>
```

### components/canvas/BubbleElement.tsx

Konvaで描画する吹き出しコンポーネント。

```
描画内容:
- Ellipse（通常/心内語/ささやき）or ギザギザPath（叫び）
- 縦書きテキスト（各文字を個別 Konva.Text で縦に配置）
- しっぽ（三角形 Path）
- 選択時: 変形ハンドル（Transformer）

操作:
- ドラッグ: Group の draggable
- リサイズ: Konva Transformer
- ダブルタップ: テキスト編集モード
```

### components/canvas/SfxElement.tsx

```
描画内容:
- 縦書きテキスト（太字、アウトライン付き）
- 回転（rotation プロパティ）
- 色、不透明度

操作:
- ドラッグ
- 回転ハンドル
- ダブルタップ: テキスト編集
```

### components/ui/BottomSheet.tsx

モバイルでの編集パネル。画面下部からスライドアップ。

```
タブ:
[🔤セリフ] [💬吹き出し] [🔊SFX] [📷画像] [↕ガター] [📐サイズ] [✨プロンプト]

セリフタブ:
  - textarea（テキスト入力）
  - フォントサイズスライダー
  - 列数（自動/1列/2列）

吹き出しタブ:
  - タイプ選択: 通常 / 心内語 / ささやき / 叫び
  - サイズスライダー（幅、高さ）
  - しっぽ方向（8方向ボタン）
  - しっぽ表示/非表示
  - [追加] [削除] ボタン

SFXタブ:
  - テキスト入力
  - カテゴリ: 衝撃 / 環境音 / 感情
  - サイズスライダー
  - 色ピッカー
  - 角度スライダー (-180° ~ 180°)
  - アウトライン: ON/OFF + 色 + 太さ
  - 不透明度スライダー
  - [追加] [削除] ボタン

画像タブ:
  - [画像差し替え] ボタン → file input
  - 差し替え履歴（サムネイル一覧）
  - [元に戻す] ボタン
  - ※画像編集機能は不要

ガタータブ:
  - 上ガター: スライダー 0-200px
  - ガター色: 白/黒/カスタム

サイズタブ:
  - コマの高さスライダー (100-1200px)
  - 幅は800px固定
  - プリセット: 横長(300)/標準(500)/縦長(800)/見開き(1000)
  - サイズバッジ表示

★プロンプトタブ（新機能）:
  - このパネルの概要（description）表示
  - 登場キャラ、ムード表示
  - loveart_prompt_notes 編集可能
  - [LoveArtプロンプト生成] ボタン → 下記の生成ロジック
  - 生成されたプロンプトをコピーボタン付きで表示
```

### components/ui/SidePanel.tsx (Desktop用)

デスクトップでは右サイドパネルに以下を常時表示:
- ツール選択
- 選択中パネル情報
- 編集パネル（BottomSheetの内容と同じ）
- キーボードショートカット一覧
- ステータス（パネル数、要素数）

### components/ui/PanelNavigator.tsx

```
Mobile: 上部の横スクロールタブバー
Desktop: 左側の縦タブリスト

表示: A-1, A-2, A-3, B-1 ... B-7 + セクション名
タップ: 該当パネルにスクロール
スクロール追従: 表示中のパネルがハイライト
```

### components/ui/GutterHandle.tsx

```
コマ間に表示される薄いバー
- 現在のガターサイズ表示 ("20px")
- タップ → ガタースライダー表示
- ドラッグ → リアルタイムでガターサイズ変更
```

### components/ui/ImageReplacer.tsx

```
画像差し替えUI
1. <input type="file"> で画像選択
2. クライアント側で Canvas API でリサイズ（幅800px）
3. 元の画像を panel.image.history に追加
4. 新画像を API に POST → public/panels/ に保存
5. panel.image.src を更新
```

---

## Step 5: API Routes

### app/api/storyboard/route.ts

```typescript
// GET: public/ep001-storyboard.json を読み込んで返す
// PUT: 編集済み storyboard を保存
//   - public/ep001-storyboard.json を上書き
//   - バックアップを public/ep001-storyboard.backup.json に保存
```

### app/api/upload/route.ts

```typescript
// POST: 画像アップロード
// - multipart/form-data で画像を受信
// - public/panels/{panel_id}.png に保存
// - 元画像は public/panels/{panel_id}_v{n}.png にリネーム保存
// - レスポンス: { src: "/panels/{panel_id}.png", original_size: { w, h } }
```

### app/api/prompt/route.ts（★新機能）

```typescript
// POST: LoveArt用プロンプトを生成
// リクエスト: { panelId, storyboard }
// レスポンス: { prompt: string }
//
// 生成ロジック:
// 1. panel の description, characters, mood, loveart_prompt_notes を取得
// 2. キャラ定義辞書と照合:
//    Eva: "17歳、ピンクロングストレート、ブルーの瞳、黒ベスト+白Tシャツ"
//    Iris: "25歳、シルバーロングウェーブ、ゴールドの瞳、黒ドレス"
//    Ren: "28歳、黒髪くせ毛ショート、ロイヤルブルーの瞳、グレーパーカー+ヘッドホン"
//    Katsuragi: "45歳、黒髪オールバック+シルバーメッシュ、グレーの鋭い瞳、ダークネイビースーツ+黒タートル"
// 3. プロンプトテンプレートに埋め込み:
//    - 1枚の縦長画像に4コマを縦1列で描いてください
//    - 画風: Korean webtoon style, semi-realistic, detailed shading
//    - キャラ情報
//    - 各コマの内容（description + notes から生成）
//    - セリフがあれば吹き出しの指定
//    - SFXがあれば位置と色の指定
// 4. 結果を返す
```

---

## Step 6: PWA設定

### public/manifest.json

```json
{
  "name": "EVARIS CHORD Editor",
  "short_name": "EC Editor",
  "description": "Webtoon Editor for EVARIS CHORD",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0a0a0c",
  "theme_color": "#0a0a0c",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### next.config.js

```javascript
const withPWA = require('next-pwa')({ dest: 'public', disable: process.env.NODE_ENV === 'development' });
module.exports = withPWA({});
```

---

## Step 7: デザイン方針

```
テーマ: ダークモード
背景: #0a0a0c
サーフェス: #111115
ボーダー: #2a2a33
テキスト: #e8e8ec
テキスト薄: #78788a
アクセント: #a78bfa (紫)
アクセント2: #f472b6 (ピンク — EVARISカラー)
デンジャー: #ef4444

フォント:
- UI: Noto Sans JP
- セリフ表示: M PLUS 1p
- 縦書き対応

タッチターゲット: 最小 44×44px (Apple HIG)
アニメーション: BottomSheet のスライドアップ、選択ハイライト
```

---

## Step 8: キーボードショートカット（Desktop）

```
1-4: ツール切替 (選択/吹き出し/SFX/字幕)
Delete: 選択要素削除
Ctrl+Z: Undo
Ctrl+Shift+Z: Redo
Ctrl+S: 保存
Ctrl+D: 選択要素複製
Ctrl+E: エクスポート
Escape: 選択解除
↑↓: 前後のパネルに移動
```

---

## 実装フェーズ

### Phase 1: MVP（まずここまで動かす）
1. [x] プロジェクト作成 + 依存パッケージ
2. [ ] 型定義 (types/storyboard.ts)
3. [ ] storyboard.json 作成（10パネル分）
4. [ ] 基本レイアウト（Header + PanelNavigator + Canvas + Toolbar）
5. [ ] 全パネルの縦スクロール表示（HTML/CSS、Konvaなしで画像表示）
6. [ ] パネルタップで選択
7. [ ] ガターの表示 + GutterHandle
8. [ ] 画像差し替え（file input → 表示更新）
9. [ ] サイズバッジ表示
10. [ ] PWA設定

### Phase 2: Konva + 吹き出し
1. [ ] Konva.js で PanelStage 実装（dynamic import, ssr:false）
2. [ ] 4レイヤー構造
3. [ ] BubbleElement（静的表示）
4. [ ] 吹き出しドラッグ移動
5. [ ] 吹き出しリサイズ（Transformer）
6. [ ] セリフのインライン編集
7. [ ] 吹き出しタイプ切替
8. [ ] 吹き出し追加/削除
9. [ ] BottomSheet UI

### Phase 3: SFX + プロンプト + 完成
1. [ ] SfxElement（表示 + ドラッグ + 回転）
2. [ ] SFXの色・サイズ・角度・アウトライン
3. [ ] SFX追加/削除
4. [ ] ★LoveArtプロンプト生成（prompt API + UI）
5. [ ] Undo/Redo
6. [ ] storyboard.json 保存 API
7. [ ] エクスポート（Canvas → JPEG書き出し）
8. [ ] レスポンシブ完成（Mobile BottomSheet / Desktop SidePanel）
9. [ ] キーボードショートカット

---

## キャラクター定義辞書（プロンプト生成用）

```json
{
  "Eva": {
    "name_ja": "エヴァ",
    "age": 17,
    "hair": "腰まで届くピンクのストレートロングヘア",
    "eyes": "ブルーの瞳",
    "outfit": "黒ベスト＋白Tシャツ",
    "build": "華奢",
    "notes": "声が出せない少女"
  },
  "Iris": {
    "name_ja": "アイリス",
    "age": 25,
    "hair": "光を反射するシルバーのロングウェーブヘア",
    "eyes": "ゴールドの瞳",
    "outfit": "黒ドレス / ステージ衣装",
    "build": "女王のような気品",
    "notes": "伝説の歌姫（精神体）"
  },
  "Ren": {
    "name_ja": "藤堂レン",
    "age": 28,
    "height": "180cm",
    "hair": "黒髪のくせ毛ショート（無造作ヘア）",
    "eyes": "鮮やかなロイヤルブルーの瞳",
    "outfit": "グレーのフードパーカー＋首にヘッドホン",
    "notes": "プロデューサー"
  },
  "Katsuragi": {
    "name_ja": "葛城零司",
    "age": 45,
    "height": "178cm",
    "hair": "黒髪オールバック＋右サイドにシルバーメッシュ",
    "eyes": "グレー系の鋭い瞳",
    "outfit": "ダークネイビースーツ＋黒タートルネック",
    "build": "シャープな顎ライン",
    "notes": "AIGIS副社長・ヴィラン"
  }
}
```

---

## 設定整合ルール（バリデーション用）

エディタのバリデーション機能として、以下のルールを自動チェック:

1. **母は生きている** — 「母の死」「亡くなった母」等の表現を警告
2. **タブレット統一** — 「ノートPC」「ラップトップ」を検出して「タブレット」に警告
3. **練習室統一** — 「スタジオ」「レッスン室」を検出して「練習室」に警告
4. **アイリスの服は黒** — 白い服の描写を警告

---

## 注意事項

- **SSR回避**: react-konva は `dynamic(() => import(...), { ssr: false })` で読み込む
- **タッチ操作**: Konva.js の touch イベントを正しくハンドリング
- **パフォーマンス**: IntersectionObserver でビューポート内のパネルだけ Konva 化
- **縦書き**: Konva.Text は横書きのみ → 各文字を個別 Text ノードで縦に配置
- **フォント**: Google Fonts から Noto Sans JP + M PLUS 1p を読み込み
- **画像パス**: public/panels/*.png
