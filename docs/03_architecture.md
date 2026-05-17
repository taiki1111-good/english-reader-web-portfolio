# 03_architecture

## 全体像

この repo は、素材管理、整形、配布用データ、静的UI、ローカル保存を分離して扱う。

## 責務分離

### Raw Materials

- 配置先: `materials/raw/`
- 取得直後の原文やメモを置く
- 未整形、未採用の状態を含む
- 採用前でも出典情報は残す

### Python Normalize

- 配置先: `scripts/`
- Raw Materials を正規化し、必要項目を整理する
- 語数確認、必須項目確認、JSON 化などの build 処理を担当する
- Python は build 側であり、runtime 側には入れない

### Curated Master

- 配置先: `materials/curated/`
- 採用可と判断した素材の管理用マスタを置く
- 出典、ライセンス、整形済み本文の対応を保つ

### Site JSON Export

- 配置先候補: `data/`
- `passages.json` など、静的Webが読む配布用JSONを置く
- runtime で必要な最小項目に絞る

### Static Web UI

- 配置先: ルート直下の HTML / CSS / JavaScript / JSON
- HTML / CSS / JavaScript で表示と操作を担当する
- JavaScript は runtime 側を担当する
- `index.html`, `reader.html`, `vocab.html`, `review.html`, `flashcard.html` を最小画面とする

### Local Storage

- 配置先候補: `js/storage.js`
- 学習状態の保存と取得を担当する
- 保存処理は `storage.js` に閉じ込める
- 将来 `IndexedDB` に差し替えやすいよう、保存APIを UI から分離する

## 設計方針

- Python は build 側
- JavaScript は runtime 側
- 保存処理は `storage.js` に閉じ込める
- 将来 `IndexedDB` に差し替えやすい設計にする
- まずは最小構成で成立させ、機能追加は仕様更新後に行う

## データの流れ

1. `materials/raw/` に候補素材を置く
2. ライセンスと出典を確認する
3. `scripts/` で正規化する
4. `materials/curated/` に管理用データを置く
5. `data/passages.json` に配布用JSONを出力する
6. ルート直下の UI が JSON を読み、学習状態は `localStorage` に保存する
