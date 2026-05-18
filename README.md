# English Reader Web

英語長文を読みながら、語句保存・既読管理・復習を行う軽量な学習支援Webアプリです。

HTML / CSS / JavaScript で構成した静的Webアプリで、外部APIやクラウド同期に依存せず、ブラウザの `localStorage` を使って学習状態を保存します。

## Live Demo

https://taiki1111-good.github.io/english-reader-web-portfolio/

## 概要

English Reader Web は、短い英語長文を読み、気になる語句を保存し、あとで復習するためのブラウザベースの学習アプリです。

読解、語彙保存、既読管理、復習、フラッシュカード、文型・文法ラベル確認を、1つの学習体験として扱えるようにしています。

主な方針は以下の通りです。

- ローカル優先: 学習データはブラウザ内の `localStorage` に保存
- 外部API非依存: 基本機能は静的ファイルだけで動作
- JSON駆動: 教材データは `data/passages.json` で管理

## 主な機能

- 難易度・タグ・語数・既読状態で絞り込める教材一覧
- 英文と日本語訳を並べた読解画面
- 語句選択と保存前トレイ
- 単語帳での保存語句管理
- 復習画面
- フラッシュカードモード
- Level B 教材向けの文型・文法ラベル確認（`S/V/O/C/M`）
- 正解・不正解・未回答の視覚的フィードバック
- 採点結果を消す手動クリア機能

## スクリーンショット

準備中です。現在は Live Demo から実際の画面を確認できます。

追加予定の画面:

- 教材一覧
- 読解画面
- 文法ラベル確認
- 採点結果フィードバック
- 単語帳
- フラッシュカードモード

## 技術的なポイント

- `index.html`, `reader.html`, `vocab.html`, `review.html`, `flashcard.html` による静的サイト構成
- プレーンな JavaScript による状態管理
- `localStorage` による読書状態・語彙保存・文法回答状態の保持
- `data/passages.json` による教材管理
- 教材データの整合性を確認する validation script
- PC / スマートフォンの両方を意識したレスポンシブUI

## 現在の状態

GitHub Pages で公開済みです。

現段階では、静的Webアプリとして動作する学習支援ツールであり、今後も教材・UI・復習機能を段階的に改善していく予定です。

## ローカルでの実行方法

リポジトリ直下で静的サーバーを起動します。

```bash
python -m http.server 8000
```

ブラウザで以下を開きます。

```text
http://localhost:8000
```

特定の教材を直接確認したい場合は、以下のように開きます。

```text
reader.html?id=<passage_id>
```

## 開発者向け

教材データは `data/passages.json` で管理しています。

教材データを変更した場合は、公開前に以下の検証スクリプトで整合性を確認できます。

```bash
python scripts/validate_passages_json.py
```

詳細な設計・開発メモは `docs/` と `ops/` に整理しています。
