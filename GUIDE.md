# GULP 使い方ガイド

**案件に着手しているとき**に読むファイル。スニペット・CF7・ACF・AI の使い方など。

案件が始まったとき（テンプレコピー・Local 設定・`_variables.scss` 初期化）は **[案件開始フロー.md](案件開始フロー.md)** を参照。本番公開・移行時は **[公開・移行フロー.md](公開・移行フロー.md)** を参照。

## 目次

- [このフォルダは何？](#このフォルダは何)
- [フォルダマップ](#フォルダマップ)
- [`dev_liquid` と `dev` の違い](#dev_liquid-と-dev-の違い)
- [日常の作業](#日常の作業)
- [Cursor スニペット](#cursor-スニペット)
  - [汎用 HTML](#汎用-html)
  - [SCSS 汎用](#scss-汎用)
  - [Contact Form 7 — タグ単体](#contact-form-7--タグ単体)
  - [Contact Form 7 — 行・ブロック](#contact-form-7--行ブロック)
  - [Contact Form 7 — SCSS](#contact-form-7--scssscssjson)
  - [Contact Form 7 — JS](#contact-form-7--js)
  - [CF7 の作り方（スニペット）](#cf7-の作り方スニペット)
  - [ACF](#acfhtmljson)
- [AI の使い方](#ai-の使い方)
- [Playwright MCP（WordPress 管理画面）](#playwright-mcpwordpress-管理画面)
- [Figma MCP + Playwright MCP](#figma-mcp--playwright-mcp)
- [`.cursor/rules/` の中身](#cursorrules-の中身)
- [クイックリファレンス](#クイックリファレンス)

> 目次のリンクは GitHub 準拠のアンカーで作成。Cursor 内プレビューでジャンプしない場合は見出しを直接検索してください。

---

## このフォルダは何？

**`~/Desktop/GULP/` = コピー元の「型置き場」**

日常のコーディングは **案件フォルダ（テーマ or LP プロジェクト）** で行い、GULP 本体は新規案件開始時にコピーするだけです。

```
GULP（金庫）  →  コピー  →  案件フォルダ（作業机）
                              + Cursor スニペット（ショートカット）
```

---

## フォルダマップ

| パス | 何？ | いつ触る？ |
|---|---|---|
| **`dev_liquid/`** | リキッドレイアウト用 Gulp 環境 | 新規案件開始時にコピー |
| **`dev/`** | px 固定レイアウト用 Gulp 環境 | リキッドを使わない案件のみ |
| **`wordpress初期設定/`** | WP テーマ用 PHP 雛形 | WP 案件開始時 |
| **`.cursor/rules/`** | AI 用コーディング規約 | Cursor で GULP / テーマを開いたとき |
| **`prompts/`** | Figma / Playwright MCP 等の AI 依頼テンプレート | WP 管理画面・Figma 連携を AI に任せるとき |
| **`案件開始フロー.md`** | 案件開始時の手順 | 新規案件のセットアップ |
| **`公開・移行フロー.md`** | 本番公開・移行時の手順 | AIOM エクスポート前 |
| **`GUIDE.md`** | このファイル | 着手後のコーディング |

---

## `dev_liquid` と `dev` の違い

| | **`dev_liquid/`** | **`dev/`** |
|---|---|---|
| レイアウト | **リキッド**（`html` font-size を vw 可変 → `rm()` が伸縮） | **px 固定**（vw 設定なし） |
| いつ使う | **基本はこちら**（WP も LP も） | デザインが px 固定指定の案件 |
| WP | ○ | △（非推奨） |
| LP / 静的 | ○ | ○ |

### BrowserSync の切替（`dev_liquid` 共通）

`.env` の `BS_PROXY` で動作が変わります。

| `BS_PROXY` | 用途 |
|---|---|
| `http://example.local/` 等 | WordPress（Local をプロキシ） |
| **空** | LP / 静的 HTML（`public/` を直接配信） |

---

## 日常の作業

| やること | どこで |
|---|---|
| PHP / SCSS コーディング | **案件フォルダ** |
| スニペット入力 | Cursor（`cf7-text`, `section`, `mq` 等） |
| CF7 フォーム HTML | 一時 `.html` でスニペット展開 → CF7 管理画面へコピー |
| ACF / JS | 基本は手書き。わからない部分だけ AI に依頼 |
| コーディング規約 | `.cursor/rules/coding-guide.mdc`（AI 向け） |

---

## Cursor スニペット

場所: `~/Library/Application Support/Cursor/User/snippets/`

- **`html.json`** → メイン（`.html` / `.php` 両方で使用。`scope: html,php` 設定済み）
- **`scss.json`** → `.scss` で効く
- **`javascript.json`** → `.js` で効く
- **`markdown.json`** → `.md` で効く（`wp-playwright` / `figma-text` / `figma-page` / `figma-playwright`）
- **`php.json`** → 未使用（`html.json` に統一）

### 汎用 HTML

| prefix | 内容 |
|---|---|
| `section` / `section-h` | セクション骨組み |
| `img-php` / `picture-php` | 画像（WP） |
| `img-html` / `picture_html` | 画像（静的） |
| `header_base` | ヘッダー雛形（静的 HTML） |
| `header-base-php` | ヘッダー + ドロワー（WP パス付き） |
| `drawer` | ドロワー（js_drawer） |
| `accordion` | アコーディオン |
| `tab-change` | タブ切替 |
| `br-sp` / `br-pc` | 改行 |
| `a_target` / `target` | 外部リンク |

### SCSS 汎用

| prefix | 内容 |
|---|---|
| `mq` | `@include mq(pc)` ブロック |
| `cmt` / `cmtmin` / `cmtsmall` | コメント |
| `hover` | any-hover セット |
| `maiauto`, `main`, `pain` 等 | 論理プロパティ |

### Contact Form 7 — タグ単体

`*` 付き = 必須デフォルト。任意にしたいときは `*` を削除。

| prefix | 内容 |
|---|---|
| `cf7-tag-text` | text* |
| `cf7-tag-email` | email* |
| `cf7-tag-tel` | tel* |
| `cf7-tag-textarea` | textarea*（placeholder 本文形式） |
| `cf7-tag-select` | select* |
| `cf7-tag-radio` | radio* |
| `cf7-tag-checkbox` | checkbox* |
| `cf7-tag-file` | file*（必須） |
| `cf7-tag-file-opt` | file（任意） |
| `cf7-tag-acceptance` | 同意チェック |
| `cf7-tag-submit` | 送信ボタン |

### Contact Form 7 — 行・ブロック

| prefix | 内容 |
|---|---|
| `cf7-table` | `<table class="p-form__table">` 開始 |
| `cf7-text` | 氏名 |
| `cf7-kana` | 氏名カタカナ |
| `cf7-tel` | 電話番号 |
| `cf7-email` | メール |
| `cf7-textarea` | お問合せ内容 |
| `cf7-file-block` | ファイル1件（任意） |
| `cf7-files` | ファイル行（block を複数入れる枠） |
| `cf7-radio` / `cf7-checkbox` | ラジオ / チェックボックス行 |
| `cf7-privacy-text` | プライバシー説明文 |
| `cf7-privacy-check` | acceptance チェック版 |
| `cf7-submit` | 送信ボタン |
| `cf7-autop` | functions.php — 自動 p タグ無効 |
| `cf7-shortcode` / `cf7-page` | PHP ショートコード出力 |

### Contact Form 7 — SCSS（`scss.json`）

| prefix | 内容 |
|---|---|
| `cf7-p-form` | table / privacy / button 本体 |
| `cf7-p-form-full` | ホバー・フォーカス追加分 |
| `cf7-p-form-item` / `cf7-p-form-head` | 行・ラベル |
| `cf7-c-form-text` / `cf7-c-form-textarea` | input / textarea |
| `cf7-c-form-select` / `cf7-c-form-privacy` | select / 同意 UI |
| `cf7-p-form-radios` / `cf7-p-form-checkboxes` | ラジオ / チェック |
| `cf7-c-form-file` | ファイル UI |
| `cf7-wpcf7` | CF7 エラー表示等 |

### Contact Form 7 — JS

| prefix | 内容 |
|---|---|
| `cf7-form-file-js` | `js_formFile()` ファイル UI |

### CF7 の作り方（スニペット）

1. 一時 `.html` ファイルを Cursor で開く
2. 以下の順でスニペット展開:

```
cf7-table
  cf7-text
  cf7-kana
  cf7-tel
  cf7-email
  （ファイル必要なら cf7-files + cf7-file-block × 枚数）
  cf7-textarea
（table 閉じ）
cf7-privacy-text
cf7-submit
```

3. CF7 管理画面のフォームタブへコピペ
4. SCSS は `cf7-p-form` 等を `project/_p-form.scss` 等に展開
5. ファイル添付あり → `cf7-form-file-js` + `main.js` で import

**プラグイン設定:** Contact Form 7 + reCAPTCHA 連携。`functions.php` に `cf7-autop`（`wordpress初期設定` 同梱済み）。

### ACF（`html.json`）

| prefix | 内容 |
|---|---|
| `acf-get` | テキスト + if 表示 |
| `acf-get-front` | フロントページ固定フィールド |
| `acf-get-option` | オプションページ |
| `acf-group` | グループ（配列アクセス） |
| `acf-repeater` | foreach 方式リピーター |
| `acf-have-rows` | have_rows 方式リピーター |
| `acf-image` / `acf-image-group` | 画像 |
| `acf-wysiwyg` / `acf-link` | WYSIWYG / リンク |

`.php` テンプレートを Cursor で開いて `acf-` と入力。

---

## AI の使い方

詳細: `.cursor/rules/ai-workflow.mdc`

| 自分で書く | AI に任せる |
|---|---|
| PHP / SCSS の HTML 構造 | ACF 読み込み PHP |
| クラス命名・レイアウト | JS（ドロワー、Swiper 等） |
| | 定型的 functions.php |
| | **WP 管理画面操作**（Playwright MCP・依頼時のみ） |

**依頼例:**
```
この HTML に ACF リピーター xxx を当てはめて PHP だけ。SCSS は触らない。
js_drawer の JS だけ作って。
```

**避ける:** 「トップ全部作って」

---

## Playwright MCP（WordPress 管理画面）

Local の wp-admin（固定ページ + AIOSEO 等）を AI に操作させるとき → **`prompts/wp-admin-playwright.md`** を開き、`【】` を書き換えて Agent チャットにコピペ。

- 前提: Playwright MCP を Cursor に追加済み・Local 起動中
- ショートカット: `.md` 編集時にスニペット **`wp-playwright`**（`markdown.json`）でも同じ文面を展開できる

詳細・短縮版・向き不向きはテンプレートファイル内に記載。

---

## Figma MCP + Playwright MCP

Figma から文言・ページ名・スラッグを取得し、コード入力や固定ページ作成、Local 表示確認まで AI に任せるとき → **`prompts/figma-playwright.md`** を開き、`【】` を書き換えて Agent チャットにコピペ。

| やりたいこと | テンプレのセクション | スニペット |
|---|---|---|
| Figma 文言 → PHP/HTML | A | `figma-text` |
| Figma → 固定ページ作成 | B | `figma-page` |
| 文言入力 → 表示確認 | C | `figma-playwright` |

- 前提: Figma MCP 認証済み・Playwright MCP 追加済み・Local 起動中
- Figma URL は **`node-id` 付き**（フレーム選択 → Copy link）

詳細・短縮版・向き不向きはテンプレートファイル内に記載。

---

## `.cursor/rules/` の中身

| ファイル | 用途 |
|---|---|
| `coding-guide.mdc` | FLOCSS/BEM、パス、WP 設定等の基本ルール（AI が常時参照） |
| `coding-patterns.mdc` | ドロワー/モーダル/アコーディオン/タブ/グリッド計算/WP初期設定詳細（該当する実装時のみ AI が自動参照） |
| `ai-workflow.mdc` | 手書き優先・AI 依頼方針 |
| `code-review.mdc` | 「レビューして」と言ったとき |

テーマフォルダだけ Cursor で開いている場合は、`.cursor/rules/` をテーマ側にコピーしてください。

---

## クイックリファレンス

```
案件開始            → 案件開始フロー.md
公開・移行          → 公開・移行フロー.md
リキッド（基本）     → dev_liquid/
px 固定             → dev/
WP 案件             → dev_liquid + wordpress初期設定 + BS_PROXY あり
LP / 静的           → dev_liquid or dev + BS_PROXY 空
CF7                 → スニペット cf7-* → CF7 管理画面へコピー
ACF                 → スニペット acf-* または AI に PHP だけ依頼
WP 管理画面（AI）   → prompts/wp-admin-playwright.md
Figma + 表示確認   → prompts/figma-playwright.md
着手後・忘れた      → この GUIDE.md
```
