# PRを作ってAnthrotechに参加しよう！

## レポジトリをフォークする

レポジトリのトップページ https://github.com/anthrotech-dev/anthrotech-dev にアクセスし、右上の「Fork」ボタンをクリックして、あなたのGitHubアカウントにレポジトリをフォークします。

## フォークしたレポジトリを編集

[PR例](https://github.com/anthrotech-dev/anthrotech-dev/pull/1)を参考に編集します。

作成(変更)するファイルは3つです。
1. メンバーファイル `/src/members/<あなたのID>/index.mdx`
2. アセットファイル `/public/assets/<あなたのID>/<アイコン画像ファイル名>`
3. CODEOWNERSファイル

### メンバーファイル/アセットファイル
`src/members`に自分のIDのフォルダを作成し、`/src/members/your-id/index.mdx`に自分の情報を記載します。

```markdown
---
id: <フォルダの名前と同じにする>
name: 
description: <簡単な自己紹介>
discord: <DiscordのユーザーID。Discord開発者モードを有効にして、自分のユーザー右クリックから取得>
avatar: /assets/<ID>/<アイコン画像のファイル名>
---

<専用ページで表示されるより詳細な自己紹介>
```

アイコン画像などのアセットは`/public/assets/<あなたのID>/`に配置します。

### CODEOWNERSファイル
あなたが今後自分のファイルを編集した際に、自分でマージできるようにするため、`CODEOWNERS`ファイルに追記します。
```
<あなたのID>/ @<あなたのGitHubユーザー名>
```

## PRを作成
フォークしたレポジトリのトップページに戻り、右上の「Pull request」ボタンをクリックします。
タイトルと説明を入力し、フォークしたレポジトリの変更を元のレポジトリに送るPRを作成します。

## おわり
あとはPRが承認されるのを待つだけです。手動なので、少し時間がかかるかもしれませんが、気長にお待ちください。

## 今後も自由に編集してね
今後も簡易的なホームページとして自由に利用してください。
`/src/members/<あなたのID>/newfile.mdx`というファイルを新しく作成すると、`https://anthrotech.dev/@<あなたのID>/newfile`というURLでアクセスできるようになります。サブディレクトリも利用可能です。

