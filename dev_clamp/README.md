# gulp-essentials（clamp / rem）

**rem + clamp** の Gulp 環境。`html` の font-size は動かさない。

| 値 | 書き方 |
|---|---|
| 画面幅で変えない | `rm(24)` |
| 画面幅で連続的に変える | `clamp(48, 64, sp)` |
| 列数など構造が変わる | `@include mq(pc)` |

第3引数で、どの幅からどの幅まで変えるかを指定する。名前は `mq` と同じだが、幅は別。`mq()` の中に書いても自動では切り替わらない。

| 範囲 | 始点 → 終点 | `mq` との違い |
|---|---|---|
| `sp` | `$sp-camp` → SPインナー | `mq(sp)` は 767px 以下 |
| `pc` | 768 → PCインナー（1300） | `mq(pc)` は 768px 以上ずっと |
| `md` | 550 → 768 | `mq(md)` は 550px 以上 |
| `tb` | 768 → 1024 | `mq(tb)` は 768〜1023（1024px 未満の書き方） |
| `lg` | PCインナー（1300）→ `$pc-camp` | `mq(lg)` は 1300px 以上。1200 は中身の幅で、左右余白を足すと 1300 |

基本は `sp` と `pc`。スニペットは `c`。PCインナーの 1300 は `$pc-inner`（1200）+ 左右 padding。

リキッド（`html` を vw）は `dev_liquid/`、px 固定は `dev/`。

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
