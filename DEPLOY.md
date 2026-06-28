# LINEで開くまでの手順

このアプリを「LINEの中で開ける」状態にするための手順です。
3段階：**① Vercelで公開 → ② LINEにLIFF登録 → ③ スマホのLINEで開く**

---

## ① Vercelで公開する（自分のMacのターミナルで）

ターミナル（アプリ「ターミナル」）を開き、1行ずつ実行します。

```bash
cd ~/Desktop/yosaアプリ
npx vercel login
```

- ログイン方法を聞かれたら、矢印キーで「Continue with GitHub / Google / Email」など好きなものを選んで Enter。
- ブラウザが開くので、認証する（アカウントが無ければその場で作成＝無料）。

ログインできたら、公開します。

```bash
npx vercel --prod
```

聞かれたら、基本そのまま Enter でOK：

| 質問 | 答え |
|---|---|
| Set up and deploy? | `y` |
| Which scope? | 自分のアカウントを選ぶ |
| Link to existing project? | `n` |
| Project name? | そのまま Enter |
| In which directory is your code? | そのまま Enter（`./`） |
| 設定を上書きする？ | `n`（自動検出のVite設定でOK） |

完了すると **`https://〇〇〇.vercel.app`** というアドレスが表示されます。これを控える。
→ **このアドレスを私に貼ってください。**ここから先(②③)を一緒に進めます。

---

## ② LINEにLIFFとして登録する（ブラウザで）

1. <https://developers.line.biz/> にLINEアカウントでログイン
2. **プロバイダー**を作成（例：サロン名）
3. 新規チャネル作成 → **「LINEログイン」** を選ぶ
   - アプリ名・業種などを入力して作成
4. 作ったチャネルを開き、**「LIFF」タブ → 追加**
   - LIFFアプリ名：`よもぎ蒸し じぶんノート`
   - サイズ：**Full**
   - エンドポイントURL：①の `https://〇〇〇.vercel.app`
   - スコープ：`profile`、`openid` にチェック
5. 追加すると **LIFF ID**（例 `1234567890-abcdEFGH`）と **LIFF URL**（`https://liff.line.me/...`）が出る → 控える

---

## ③ LIFF IDをアプリに設定して、もう一度公開

LIFF IDを入れると、LINE内で枠なし全画面＋名前表示になります。

```bash
cd ~/Desktop/yosaアプリ
echo "VITE_LIFF_ID=ここにLIFF_IDを貼る" > .env
npx vercel env add VITE_LIFF_ID production   # 同じLIFF IDを貼る
npx vercel --prod                            # 反映のため再公開
```

---

## ④ スマホのLINEで開く

- ②で控えた **LIFF URL**（`https://liff.line.me/...`）を、自分のLINEのトーク（例：自分専用のメモ／Keepメモ）に送って、スマホでタップ。
- LINEの中でアプリが開けば成功 🎉

---

## メモ
- `.env` と LIFF ID は公開リポジトリに載せない（`.gitignore`済み）。
- 本番では来店記録の保存（データベース）や、QR→来店カウント、トーク通知が必要。これは「裏側」の設計で詰める。
