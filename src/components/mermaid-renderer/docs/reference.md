# Mermaid コンポーネント仕様書（Astro）

## 1. 目的

本仕様は、Astro プロジェクトで Mermaid 図を安全かつ再利用可能な形で表示するためのコンポーネント群の仕様を定義する。

対象コンポーネント:

- `src/components/mermaid-renderer/src/Mermaid.astro`
- `src/components/mermaid-renderer/src/MermaidLoader.astro`

---

## 2. 全体アーキテクチャ

### 2.1 役割分担

- **Mermaid.astro**
  - Mermaid 記法の文字列を `.mermaid` 要素として出力する薄い表示コンポーネント。
  - 実際の SVG 描画処理は行わない。

- **MermaidLoader.astro**
  - クライアントサイドで Mermaid ライブラリを遅延読み込みする。
  - `.mermaid` 要素を走査して `mermaid.run()` で SVG へ変換する。
  - 拡大プレビュー（モーダル表示、パン/ズーム）を提供する。

### 2.2 実行フロー

1. ページロード時に `MermaidLoader` が起動
2. Mermaid コードブロック（`pre[data-language="mermaid"]` など）を `.mermaid` に変換
3. 未描画ノードのみ Mermaid で描画
4. 描画済みノードへプレビュー起動イベントを付与

補足:

- Markdown の ` ```mermaid ` コードブロックを `.mermaid` に変換した場合、生成要素は `data-mermaid-source` を持たない
- レンダラーは初回ロード時に 1 回起動する
- 動的に追加された `.mermaid` 要素は自動再走査されない

---

## 3. Mermaid.astro 仕様

### 3.1 Props

```ts
interface Props {
  chart: string;
}
```

- `chart`: Mermaid 記法文字列（必須）

### 3.2 出力仕様

```html
<div class="mermaid" data-mermaid-source="...">...</div>
```

- `data-mermaid-source` に元ソースを保持
- `.mermaid` は Loader 側で描画対象として扱う
- `data-mermaid-source` は `Mermaid.astro` を直接使った場合に付与される

### 3.3 CSS 仕様

- 横長図のため `overflow-x: auto`
- SVG の縦横比を維持してブロック表示

---

## 4. MermaidLoader.astro 仕様

### 4.1 依存読み込み

- CDN: `https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js`
- Mermaid 公式ドキュメントで案内されている jsDelivr を利用する
- シングルトン Promise (`window.__anthrotechMermaidLoader`) を利用して重複ロードを防止
- 既に `window.mermaid` が存在する場合は再利用

### 4.2 Mermaid 初期化

```js
window.mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "default",
});
```

### 4.3 クラス構成

#### MermaidPreviewModal

責務:

- プレビューモーダル DOM の生成/保持
- ツールバー操作（拡大/縮小/実寸/全体表示）
- マウス・タッチによるパン/ズーム
- `open(svg)` / `close()` の公開 API

主要状態:

- `scale`, `offsetX`, `offsetY`
- `dragState`, `pinchState`
- `baseWidth`, `baseHeight`, `previewSvg`

#### MermaidRenderer

責務:

- Mermaid コードブロックを `.mermaid` へ変換
- 未描画ノードに対する `mermaid.run()` 実行
- プレビュー起動イベントのバインド

公開 API:

- `render()`

変換対象:

- `pre[data-language="mermaid"]`
- `pre > code.language-mermaid`

### 4.4 定数

- `DEFAULT_SCALE = 1`
- `MIN_SCALE = 0.5`
- `MAX_SCALE = 3`
- `BUTTON_ZOOM_STEP = 0.2`
- `WHEEL_ZOOM_STEP = 0.12`

---

## 5. イベント仕様

### 5.1 プレビュー起動

- 対象: `.mermaid` 要素
- 操作:
  - Click
  - Enter / Space

### 5.2 モーダル操作

- Close: backdrop クリック / Close ボタン / Esc
- Zoom:
  - ボタン
  - ホイール（カーソル中心）
  - 2本指ピンチ
- Pan:
  - マウスドラッグ
  - 1本指タッチ移動

---

## 6. 冪等性・再描画制御

以下の data 属性で二重処理を防止:

- `data-mermaid-upgraded`: code block 変換済み
- `data-mermaid-rendered`: 描画済み
- `data-mermaid-preview-bound`: イベント登録済み

補足:

- `render()` は `data-mermaid-rendered !== "1"` の `.mermaid` 要素だけを描画対象にする
- プレビューイベントは `data-mermaid-preview-bound !== "1"` の要素にのみ付与される

---

## 7. アクセシビリティ

- 各図に `role="button"` を付与
- `tabIndex=0` でキーボードフォーカス可能
- `aria-label="Open Mermaid preview"`
- モーダルダイアログに `role="dialog"` / `aria-modal="true"`

注記:

- これらの属性は `MermaidLoader` が描画対象の `.mermaid` 要素へ後付けする

---

## 8. 導入手順（他プロジェクト）

1. `Mermaid.astro` と `MermaidLoader.astro` をコピー
2. レイアウトか共通ページで `MermaidLoader.astro` を 1 回読み込む
3. 使用箇所で以下を記述

```astro
---
import Mermaid from "../components/mermaid-renderer/src/Mermaid.astro";
---

<Mermaid chart={`graph TD\n  A --> B`} />
```

本リポジトリでは `src/layouts/Layout.astro` で `MermaidLoader.astro` を全ページ共通で 1 回読み込んでいる。

---

## 9. 既知の注意点

- Mermaid バージョン差異で一部記法互換性が変わる可能性あり
- 極端に巨大な図はブラウザ描画負荷が高くなる
- CDN 依存のため、ネットワーク障害や配信障害時は描画されない
- ボタンのズーム操作は中央基準で再配置され、ホイールとピンチは操作位置基準で拡大縮小される

---

## 10. 今後の拡張案

- テーマ（dark/light）連動
- 図種ごとのデフォルト設定（Gantt最適化など）
- npm package 化による横展開
- 単体テスト追加（イベント処理・再描画防止）
