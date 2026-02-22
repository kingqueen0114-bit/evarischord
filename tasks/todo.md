# 今後の開発タスク (Todo)

## 1. 現状の動作確認と環境テスト
- [ ] `npm run dev` によるローカルサーバーの起動確認
- [ ] AIエージェントのブラウザ機能を用いた、エディタ画面全体の視覚的・機能的な動作検証
- [ ] エラーログや未完了のUIコンポーネントの洗い出し

## 2. 進行中の機能実装・パッチ適用の完了
- [ ] ルートディレクトリに存在する 각종パッチスクリプト（`patch_sfx_ui.py`, `fix_editor_panel.py` 等）の目的確認と、必要に応じたコードベースへの反映
- [ ] 「SFX（効果音）タブ」および「EditorPanel」関連のUI/状態管理のバグ修正・完成

## 3. Phase 2 & Phase 3 の残存タスク実装 (CLAUDE.md準拠)
- [ ] SFX要素のCanvas描画（SfxElementのドラッグ・回転・スタイリング機能）の実装完了
- [ ] LoveArt用プロンプト生成機能（`app/api/prompt/route.ts` および UIのプロンプトタブ）の実装
- [ ] 画像のサーバー保存・差し替えAPI（`app/api/upload/route.ts`）とUndo/Redo機能の統合
- [ ] 最終的なストーリーボードデータの保存機能（`app/api/storyboard/route.ts` PUTメソッド）の完成

## 4. リファクタリングと最適化
- [ ] 「Demand Elegance」ルールに基づく、UIコンポーネントやZustandストア（`editorStore.ts`）のコード整理
- [ ] PWAとしての動作検証とモバイルUI（BottomSheet）のレスポンシブ対応の完成
