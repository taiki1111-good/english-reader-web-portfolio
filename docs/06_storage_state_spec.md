# 06_storage_state_spec

## 前提

- 初期段階の保存先は `localStorage`
- 保存処理は `js/storage.js` に集約する
- UI から `localStorage` を直接触りすぎない

## 固定キー名

- `english_reader.saved_words`
- `english_reader.read_passages`
- `english_reader.last_opened_passage`
- `english_reader.review_history`
- `english_reader.grammar_answers`
- `english_reader.vocab_folders`

## 保存する値の構造

### english_reader.saved_words

保存単語の配列。

```json
[
  {
    "word": "journey",
    "passage_id": "sample_passage_001",
    "saved_at": "2026-04-22T10:30:00+09:00"
  }
]
```

最小データ:

- `word`
- `passage_id`
- `saved_at`

現行データ:

```json
[
  {
    "id": "vocab_...",
    "word": "find",
    "type": "word",
    "passage_id": "sample_pre_analyzed_svoc",
    "passage_title": "Sample Pre-Analyzed SVOC Lesson",
    "sentence_id": "sample_pre_analyzed_svoc-s1",
    "token_id": "sample_pre_analyzed_svoc-s1-t1",
    "lemma": "find",
    "part_of_speech": "verb",
    "meaning_ja": "分かる、見つける",
    "dictionary_entries": [
      {
        "partOfSpeech": "verb",
        "meaningsJa": ["分かる", "見つける"]
      },
      {
        "partOfSpeech": "noun",
        "meaningsJa": ["発見"]
      }
    ],
    "example": "I found the book interesting.",
    "example_translation_ja": "私はその本が面白いと思った。",
    "folder_ids": [],
    "saved_at": "2026-04-22T10:30:00+09:00",
    "updated_at": "2026-04-22T10:30:00+09:00"
  }
]
```

定義:

- `word` は保存表示名。単語保存では原則として `lemma` を使う。
- `type` は `word` または `idiom`。
- `part_of_speech` と `meaning_ja` は本文内での使われ方を表す。
- `dictionary_entries` はその語が持つ品詞と日本語意味の一覧を表す。本文内の品詞・意味も含める。
- `example` は本文から保存した英語例文を表す。
- `example_translation_ja` は `example` に対応する日本語訳を表す。
- `folder_ids` は所属フォルダIDの配列。1単語は複数フォルダへ所属できる。
- 旧データに `folder_ids` がない場合は読込時に空配列を補う。
- 旧データで `dictionary_entries` が不足している場合は、`part_of_speech` / `meaning_ja` から最低1件を補って扱う。

### english_reader.vocab_folders

ユーザー作成フォルダの配列。

```json
[
  {
    "id": "folder_...",
    "name": "苦手単語",
    "created_at": "2026-04-22T10:30:00+09:00",
    "updated_at": "2026-04-22T10:30:00+09:00"
  }
]
```

定義:

- フォルダ削除時、単語自体は削除しない。
- 削除されたフォルダIDは各 saved word の `folder_ids` から外す。

### english_reader.read_passages

既読状態の配列または辞書。初期実装では辞書を推奨する。

```json
{
  "sample_passage_001": {
    "read": true,
    "read_at": "2026-04-22T10:45:00+09:00"
  }
}
```

既読管理の定義:

- 本文を最後まで厳密計測する必要はない
- 初期段階では「ユーザーが既読操作を行ったら既読」とする

### english_reader.last_opened_passage

最後に開いた passage の情報。

```json
{
  "passage_id": "sample_passage_001",
  "opened_at": "2026-04-22T10:40:00+09:00"
}
```

### english_reader.review_history

復習操作の履歴配列。

```json
[
  {
    "target_type": "word",
    "target_id": "journey",
    "passage_id": "sample_passage_001",
    "reviewed_at": "2026-04-22T11:00:00+09:00"
  }
]
```

注意:

- 旧復習UIの互換用にキーは残す。
- 暗記シート化後の主要UIでは新しい履歴追加を必須にしない。

### english_reader.grammar_answers

reader 画面でユーザーが付けた文型ラベルの辞書。

```json
{
  "sample_passage_001": {
    "sample_passage_001-s1-t0": "S",
    "sample_passage_001-s1-t1": "V"
  }
}
```

定義:

- passage ID ごとに token ID と `S`, `V`, `O`, `C`, `M` の対応を保持する
- reader 画面のポップアップでラベルを選んだ時点で保存する
- `clear` 操作では対象 token ID のラベルを削除する

### reader tray

reader 画面の tray は保存前の一時状態であり、初期実装では localStorage に永続化しない。

```json
[
  {
    "word": "book",
    "type": "word",
    "passage_id": "sample_pre_analyzed_svoc",
    "sentence_id": "sample_pre_analyzed_svoc-s1",
    "token_id": "sample_pre_analyzed_svoc-s1-t3"
  }
]
```

定義:

- `save` 操作で tray に入れる
- `×` 操作で tray から外す
- `全削除` 操作で tray 全体を空にする
- `単語帳に保存` 操作で `english_reader.saved_words` に移す
- 同一 passage / token の重複は tray 内に追加しない

## 実装上の注意

- JSON 文字列化して保存する
- 読込失敗時は空配列または空辞書へ安全にフォールバックする
- キー名変更時は移行処理の要否を明記する

## 将来 IndexedDB に移す時の注意

- UI 側は `storage.js` の関数経由で保存する
- キー名相当の概念を store 名へ移しやすくする
- 保存データ構造は急激に変えず、段階的に移行する

---

## 将来の拡張: 単語・イディオム情報の強化

### 概要

現在の保存単語データは最小限の構成（word, passage_id, saved_at）となっています。
学習効率を高めるため、以下の機能追加を提案します。

### 1. 単語の品詞・定義情報の追加（実装優先度: 中）

**目的**: 単語を整理して保存・復習する際に、品詞や日本語訳を参照できるようにする。

**提案データ構造**:

```json
[
  {
    "word": "journey",
    "passage_id": "sample_passage_001",
    "saved_at": "2026-04-22T10:30:00+09:00",
    "part_of_speech": "noun",
    "definition_ja": "旅行、旅",
    "definition_en": "an act of traveling from one place to another"
  }
]
```

**追加フィールド**:
- `part_of_speech`: 品詞（noun, verb, adjective, adverb など）
- `definition_ja`: 日本語訳
- `definition_en`: 英語定義（オプション）

**実装方法の検討項目**:
- 品詞は passage 生成時に事前定義するか、外部辞書API（例：Free Dictionary API）を使うか？
- 初期段階では手動入力を許容し、段階的に自動抽出へ移行する
- 辞書データを `data/` に別ファイルとして保持することも検討

### 2. イディオム認識・保存システムの設計（実装優先度: 低～中）

**問題点**: 現在のシステムでは、イディオムを手動入力する手段がなく、一単語のみの保存となっています。

**提案機能**:

#### 2-1. イディオム判定方式

- **マニュアルマーキング方式**（実装容易性: 高）
  - UI で複数単語を選択 → イディオムとして保存するボタン
  - `is_idiom: true` フラグを付けて保存

- **事前定義リスト方式**（実装容易性: 中）
  - `data/idiom_patterns.json` に一般的なイディオムリストを事前収録
  - 本文を読む際、リスト内マッチング語を自動検出・ハイライト

#### 2-2. 拡張データ構造

```json
[
  {
    "word": "journey",
    "passage_id": "sample_passage_001",
    "saved_at": "2026-04-22T10:30:00+09:00",
    "type": "word",
    "part_of_speech": "noun",
    "definition_ja": "旅行、旅"
  },
  {
    "word": "take a journey",
    "passage_id": "sample_passage_001",
    "saved_at": "2026-04-22T10:35:00+09:00",
    "type": "idiom",
    "definition_ja": "旅に出る",
    "component_words": ["take", "journey"]
  }
]
```

**新フィールド**:
- `type`: `"word"` または `"idiom"` を区別
- `component_words`: イディオムを構成する単語リスト（イディオム時のみ）

#### 2-3. UI/UX の改善案

**reader.html での操作フロー**:
1. ユーザーが複数単語をドラッグ選択
2. ポップアップメニューに以下を表示
   - 「単語として保存」
   - 「イディオムとして保存」
3. 選択に応じて `type` フィールドを変えて記録

**vocab.html での表示**:
- タイプ別フィルタ機能（単語のみ表示 / イディオムのみ表示 / 全て表示）
- イディオムの場合は構成単語を小さく併記

#### 2-4. 実装の段階的進め方

**Phase 1（初期段階）**: マニュアルマーキング方式のみ
- UI で複数単語選択 → イディオムチェックボックス付きで保存
- 最小限の実装で形を整える

**Phase 2（中期）**: イディオムリストの用意
- `idiom_patterns.json` に汎用イディオムを手動リスト化
- 本文読み込み時にハイライト表示

**Phase 3（将来）**: 自動抽出の検討
- NLP ライブラリ（例：natural.js）でイディオム候補を自動検出
- ただし実装コストが高いため、当面は後回しに

### 3. CEFR・語数表示の UX 向上

**現在の状態**: index.html で「CEFR B1 / 148語」と表示されているが、ユーザーが意味を理解しにくい可能性

**改善案**:
- マウスホバーまたはツールチップで「CEFRとは」「語数の意味」を簡潔に説明
- または UI 上に小さなアイコンヘルプを配置

### 4. パッセージ長の確認（質問への回答）

**ユーザーコメント**: 「100-200字では短すぎるので、もっと長くしてほしい」

**現状分析**:
- `04_content_data_spec.md` では「100-200語程度」が主対象と定義されている
- これは **パッセージ全体**の語数ですでに達成されている
- ユーザーが言及しているのは、おそらく **個別の文（sentence）** が短いということ？

**確認事項**:
- 実際の passages.json データで、文の平均語数を確認する
- 必要に応じて、素材選定時に「各文が 20-30 語程度」といった目安を追加

---

## 将来拡張の実装優先度整理

| 機能 | 優先度 | 実装難度 | 学習効果 | 推奨開始時期 |
|---|---|---|---|---|
| 品詞情報の追加 | 中 | 中 | 高 | Phase 2 |
| 日本語訳の保存 | 中 | 低 | 高 | Phase 2 |
| イディオム手動マーキング | 中 | 低 | 中 | Phase 2 |
| イディオム自動検出リスト | 低 | 中 | 中 | Phase 3 |
| イディオム自動抽出（NLP） | 低 | 高 | 中 | Phase 4+ |
