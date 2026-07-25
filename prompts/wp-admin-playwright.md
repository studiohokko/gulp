# Playwright MCP — WordPress 管理画面（固定ページ + AIOSEO）

**このファイルが依頼文の正本。** 案件ごとに **`【】`** を書き換え、Cursor の **Agent チャット** に貼り付けてください。

## 使い方

1. 下の依頼文ブロック内の `【】` を案件用に書き換える
2. コードブロックごとコピー → Agent チャットに貼り付け
3. ブラウザ操作を見守り、公開 URL を確認

**ショートカット:** `.md` を開いてスニペット **`wp-playwright`** + Tab でも同じ文面を展開できる（`markdown.json`）。

---

## 依頼文（ここからコピー）

```
Playwright MCP を使って、Local の WordPress 管理画面で次を実行してください。

【サイト】
- URL: 【http://example.local/wp-admin/】
- ユーザー名: 【admin】
- パスワード: 【パスワード】

【作業内容】
1. 管理画面にログイン
2. 固定ページを1件、新規作成
3. タイトル: 【Playwright テストページ】
4. 本文: 【これは Playwright MCP の動作確認用ページです。】
5. All in One SEO（AIOSEO）で以下を入力
   - SEO タイトル（Post Title）: 【ページ名 | サイト名】
   - メタディスクリプション: 【120字以内の説明文】
6. 【公開（Publish）する / 下書き保存まで】
7. 公開後の固定ページ URL を教える
8. 各ステップで browser_snapshot を取り、AIOSEO の入力欄が見つかったか報告する

【注意】
- AIOSEO の UI は「AIOSEO Settings」または右サイドバーの「AIOSEO」パネル内
- General タブの Post Title / Meta Description を使う
- 見つからなければスクロールして探す
- 公開前に Snippet Preview が表示されているか確認
- ログイン済みならログインをスキップしてよい
```

---

## 案件ごとに書き換える項目

| 項目 | 例 |
|---|---|
| URL | `http://cosmo.local/wp-admin/` |
| ユーザー名 / パスワード | Local の WP 管理者 |
| タイトル / 本文 | 作成する固定ページの内容 |
| SEO タイトル | `会社概要 \| コスモ` |
| メタディスクリプション | 案件用の説明文 |
| ⑥ | テスト時は「下書き保存まで」でも可 |

---

## 短縮版（慣れたらこちらでも可）

```
【http://example.local/wp-admin/】にログイン（ID: 【admin】 PW: 【***】）。
固定ページ「【ページ名】」を新規作成して【公開 / 下書き保存】。
AIOSEO: Post Title「【SEOタイトル】」、Meta Description「【説明文】」。
URL を教えて。
```

---

## 向いている / 向いていない

| 向く | 向かない |
|---|---|
| 固定ページ 1〜数件 + AIOSEO 入力 | 10ページ以上の量産 |
| 管理画面の動作確認 | 本番 wp-admin |
| Local / ステージング | SEO プラグインが Yoast 等（文面を書き換え） |

量産が必要なら AIOSEO REST API / WP-CLI を検討。
