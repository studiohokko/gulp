# Figma MCP + Playwright MCP — 依頼テンプレート

**このファイルが依頼文の正本。** 案件ごとに **`【】`** を書き換え、Cursor の **Agent チャット** に貼り付けてください。

## 前提

| 項目 | 内容 |
|---|---|
| Figma MCP | Cursor に接続済み（初回は Figma ログイン） |
| Playwright MCP | Cursor に追加済み |
| Local | 対象サイトが **起動中** |
| Figma URL | **`node-id` 付き**（フレームを選択 → Copy link） |

> **「MCP を使え」と毎回書かなくて OK。** 下記の依頼文をそのまま貼れば、AI が Figma MCP / Playwright MCP を選びます。

## 使い方

1. やりたいことに合った **依頼文ブロック** を選ぶ
2. `【】` を案件用に書き換える
3. コードブロックごとコピー → Agent チャットに貼り付け

**ショートカット:** `.md` 編集時にスニペット（`markdown.json`）

| スニペット | 用途 |
|---|---|
| **`figma-text`** | Figma から文言をコードに入力 |
| **`figma-page`** | Figma から固定ページを wp-admin で作成 |
| **`figma-playwright`** | 文言入力 → Local で表示確認（セット） |

---

## A. Figma 文言 → コード入力

リストや本文など、**既存 HTML/PHP の空欄に Figma のテキストを流し込む** とき。

```
次を実行してください。

【1. Figma から文言取得】
- Figma URL: 【https://www.figma.com/design/xxxxx/...?node-id=123-456】
- 対象: 【リスト部分 / 〇〇セクション】のテキスト

【2. コードに入力】
- ファイル: 【page-service.php】
- 箇所: 【45〜60 行目の <ul> 内の空 <li>】

【ルール】
- HTML 構造・クラス名は変えない
- 文言は Figma どおり（改行・記号含む）
- li の数が Figma と合わなければ報告して止める
- 入力前に取得した文言一覧を見せてから反映してよい
```

### 短縮版

```
Figma 【URL】の【セクション名】文言を、【ファイルパス】の【箇所】に順番通り入力。
構造は変えない。件数が合わなければ教えて。
```

---

## B. Figma ページ名・スラッグ → 固定ページ作成

サイトマップやページフレームから **ページ名とスラッグを読み取り、wp-admin で固定ページを作る** とき。

```
次を順番に実行してください。

【1. Figma から情報取得】
- Figma URL: 【https://www.figma.com/design/9B5G0zwwTjqIjxpG2YIzEN/...?node-id=XXX-XXX】
- 対象ページ: 【採用情報 /recruit】（サイトマップ内の1フレーム推奨）

取得するもの:
- ページ名（タイトル）
- スラッグ（Figma の `/recruit` → `recruit`。先頭 `/` は除く）

【2. WordPress 固定ページ作成（Playwright）】
- 管理画面: 【http://cosmo.local/wp-admin/】
- ユーザー名: 【admin】
- パスワード: 【パスワード】
- 公開状態: 【下書き / 公開】
- 本文: 【空で OK / プレースホルダー1行】

【ルール】
- 同じスラッグの固定ページが既にあればスキップして報告
- トップ・`/{post-name}` 詳細・投稿系は固定ページとして作らない
- 作成後、固定ページ URL を教える
- 各ステップで browser_snapshot を取り、問題があれば報告
- ログイン済みならログインをスキップしてよい
```

### 短縮版

```
Figma 【URL】から【ページ名】とスラッグを取得し、
【http://example.local/wp-admin/】（ID/PW: 【***】）で固定ページを【下書き/公開】作成。
既存スラッグはスキップ。URL を教えて。
```

---

## C. セット — 文言入力 → 表示確認

**A のあと、Local フロントで表示を確認** するとき。

```
次を順番に実行してください。

【1. Figma から文言取得・コード入力】
- Figma URL: 【https://www.figma.com/design/...?node-id=123-456】
- ファイル: 【page-recruit.php】
- 箇所: 【<ul> 内の空 <li>】
- 構造・クラス名は変えない

【2. Local で表示確認（Playwright）】
- 確認 URL: 【http://cosmo.local/recruit/】
- Figma の文言と一致しているか確認
- 不一致・404・CSS 未反映があれば報告
- browser_snapshot を取る

【注意】
- npm run dev が動いていなければ、PHP 変更後はリロードで反映
- ページが未作成で 404 の場合はその旨を報告（固定ページ作成は別途 B を使う）
```

### 短縮版

```
Figma 【URL】の文言を【ファイル】の【箇所】に入力後、
【http://cosmo.local/xxx/】を開いて Figma と一致確認。snapshot も。
```

---

## D. セット — 固定ページ作成 → 表示確認

**B のあと、フロント URL を確認** するとき。

```
次を順番に実行してください。

【1. Figma → 固定ページ作成】
（B の依頼文と同内容）

【2. 表示確認】
- 【http://cosmo.local/recruit/】を開く
- 404 でないこと、タイトルが意図どおりか確認
- browser_snapshot を取る
```

---

## 案件ごとに書き換える項目

| 項目 | 例（cosmo） |
|---|---|
| Figma URL | `https://www.figma.com/design/9B5G0zwwTjqIjxpG2YIzEN/...?node-id=1-256` |
| ページ名 / スラッグ | `採用情報` / `recruit` |
| 対象 PHP | `page-recruit.php` |
| Local フロント | `http://cosmo.local/recruit/` |
| wp-admin | `http://cosmo.local/wp-admin/` |
| ログイン | Local の WP 管理者 |

### Figma URL の選び方

| URL | 向き |
|---|---|
| **1ページ分のフレーム**（`node-id=XXX`） | ◎ 精度が高い |
| サイトマップ全体（`node-id=1-2`） | △ 一括取得向け。作成前に一覧確認を指示 |

---

## 向いている / 向いていない

| 向く | 向かない |
|---|---|
| リスト・FAQ 等の文言転記 | Figma URL なし |
| サイトマップから固定ページ 1〜数件 | 10ページ以上の量産 |
| 入力後の表示確認 | 本番 wp-admin / 本番 Figma 編集 |
| Local + 下書き作成 | テンプレート PHP 自動生成（別途依頼が必要） |

量産が必要なら WP-CLI や REST API を検討。

---

## 関連テンプレ

| ファイル | 用途 |
|---|---|
| **`prompts/wp-admin-playwright.md`** | Playwright のみ（AIOSEO 入力など） |
| **`prompts/figma-playwright.md`** | このファイル（Figma + Playwright） |
