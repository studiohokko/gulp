# gulp-essentials（px 固定レイアウト）

**px 固定**の Gulp 環境。リキッドは `dev_liquid/` を使う。

## 手順・スニペット一覧

[`../GUIDE.md`](../GUIDE.md) を参照。

## 初回インストール

1. Node `v18.12.1` 推奨
2. `npm install`
3. `cp .env.example .env`
4. `.env` に `TINYPNG_API_KEY` を設定
5. **WP:** `BS_PROXY` = Local URL / **LP・静的:** `BS_PROXY` = 空

```zsh
npm run dev   # 開発
npm run build # 本番ビルド
```
