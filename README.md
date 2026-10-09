# Health Support

`site-min` の本体は食事・運動・体重を管理する **Health Support** です。

## 構成

| パス | 役割 |
| --- | --- |
| `index.html` | Health Support の画面 |
| `kcal.js` / `れんじ.css` / `logo.svg` | Health Support の計算・見た目・画像 |
| `oauth/login/index.html` | 旧URLとの互換性を保つ**転送ページ**（新: `pc-agent/oauth/login/`） |
| `oauth/consent/index.html` | 旧URLとの互換性を保つ**転送ページ**（新: `pc-agent/oauth/consent/`） |

## PC Agent の認証画面は別Repositoryに移行

OAuthログイン、接続許可・拒否、Supabase Auth SDKの呼び出しを含む実装は、[EliteMay/pc-agent](https://github.com/EliteMay/pc-agent) の `web/oauth/` に移しています。

- 新ログイン: https://elitemay.github.io/pc-agent/oauth/login/
- 新同意画面: https://elitemay.github.io/pc-agent/oauth/consent/

旧URLは互換転送専用です。OAuthの認可画面に届いた `authorization_id` 等のクエリやURL fragmentを、そのまま同じOriginの新URLへ引き継ぎます。旧RepositoryにはSupabase SDK・認可・ログイン処理・PC操作処理を置きません。

**ただし、Supabase側のOAuth Authorization Path / Site URLは別設定です。** 既存設定が旧URLを指していても認証を中断させないよう互換転送を維持します。設定内容を直接確認し、実際のOAuthログイン・許可/拒否を検証するまでは旧URLを削除・改名・Archiveしません。GitHub Pagesの実デプロイ確認とOAuthの実認証は別の完了条件です。

## 検証

`node --test tests/oauth-compat.test.mjs`。GitHub Actionsでも静的検証します。運用上の残作業は [PC Agent Issue #39](https://github.com/EliteMay/pc-agent/issues/39) を確認してください。

Health Support本体のデータ・画面・保存処理にはこの移行で変更を加えません。
