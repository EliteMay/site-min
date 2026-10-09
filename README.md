# Health Support / Kaito PC Agent OAuth Pages

このRepositoryには、**用途の異なる2つのWebページ群**が存在します。用途・参照先を把握せずに統合・改名・削除・アーカイブを行わないでください。

## 現在の構成

| パス | 役割 |
| --- | --- |
| [`index.html`](index.html) | **Health Support**：食事・運動・体重の記録画面 |
| [`kcal.js`](kcal.js) / [`れんじ.css`](れんじ.css) | Health Supportの計算・画面処理と見た目 |
| [`oauth/login/index.html`](oauth/login/index.html) | **Kaito PC Agent**向けSupabase OAuthログイン画面 |
| [`oauth/consent/index.html`](oauth/consent/index.html) | **Kaito PC Agent**への接続を許可・拒否する同意画面 |

Health Supportのページはブラウザ内での保存処理を実装しています。OAuth画面はSupabase AuthのSDKを呼び出すフロントエンドであり、このRepositoryだけでOAuthバックエンド全体が実装されるわけではありません。

## リポジトリ整理時の注意

- **OAuth関連のパスは動作中の認証・リダイレクト設定から参照されている可能性があります。** 外部設定の接続実態は、このREADME追加では確認していません。
- Health SupportとPC Agent OAuthの責務分離は将来の検討事項です。分割・移動する場合は、先に実際のOAuth設定、登録済みRedirect URL、GitHub Pagesの公開URL、Supabase側の設定、利用中のクライアントを確認します。
- 正式に移す前に`oauth/`を削除したり、RepositoryをArchive/Private化/改名したりしません。
- OAuth認証の成功・PC Agent接続成功を、このREADME追加で保証しません。
- APIキーやパスワード、SecretをIssueやREADMEに貼らず、セキュリティ境界は[PC Agent側の仕様](https://github.com/EliteMay/pc-agent)で確認してください。

## 関連するRepository

- [EliteMay/pc-agent](https://github.com/EliteMay/pc-agent) — PC Agent本体・Gateway・安全な操作承認の正本
- [EliteMay/web-project-guide](https://github.com/EliteMay/web-project-guide) — 共通のWeb制作・認証・デプロイの安全ルール

> このドキュメントは既存のコード構成の説明です。機能、公開方法、認証設定には変更を加えていません。
