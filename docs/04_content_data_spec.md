# 04_content_data_spec

## 対象ファイル

- `data/passages.json`

## 基本方針

- 主対象は 100〜200語程度の英語長文
- まずは短すぎず長すぎない教材を優先する
- 出典とライセンスが追跡できるものだけを採用する
- 新規 passage 追加時の作業手順は `docs/10_content_addition_workflow.md` を参照する
- 新規 passage では、通常教材と文型採点対応教材を明確に分ける

## passages.json の基本スキーマ

各要素は 1 passage を表す。

```json
{
  "id": "sample_passage_001",
  "title": "A Short Walk After Rain",
  "source": "Example Source Name",
  "source_url": "https://example.com/text/001",
  "license_type": "CC BY 4.0",
  "word_count": 148,
  "level_hint": "CEFR B1",
  "difficulty": "intermediate",
  "tags": ["nature", "daily-life"],
  "summary_ja": "雨上がりの短い散歩についての英文。",
  "features": {
    "translation": true,
    "vocab": true,
    "grammarQuiz": false,
    "idioms": false
  },
  "text": "Full passage text...",
  "created_at": "2026-04-22",
  "status": "active"
}
```

## Content levels

### Level A: reading + vocabulary + review + flashcard compatible

通常 passage の最低受け入れ水準。reader、単語保存、単語帳、復習、フラッシュカードで使えることを目的にする。

Passage-level 必須:

- `id`
- `title`
- `source`
- `source_url`
- `license_type`
- `word_count`
- `level_hint`
- `difficulty`
- `tags`
- `summary_ja`
- `features`
- `text`
- `created_at`
- `status`

Sentence-level 必須:

- `sentenceId`
- `text`
- `translationJa`
- `tokens`

Word token-level 必須:

- `id`
- `text`
- `lemma`
- `partOfSpeech`
- `meaningJa`
- `dictionaryEntries`

句読点 token は `id` と `text` のみでよい。

### Level B: grammar grading compatible

文型採点に対応する passage。Level A の全項目に加え、次を持つ。

Passage-level:

- `features.grammarQuiz: true`

Sentence-level:

- `sentencePattern`
- `explanation`
- `answerKey`

Token-level:

- `grammarRole` where applicable

すべての passage が Level B である必要はない。

## features

新規 passage は `features` を明示する。

```json
{
  "features": {
    "translation": true,
    "vocab": true,
    "grammarQuiz": false,
    "idioms": false
  }
}
```

- `translation`: `sentences[].translationJa` を持つ。
- `vocab`: word token に `lemma`, `partOfSpeech`, `meaningJa`, `dictionaryEntries` を持つ。
- `grammarQuiz`: `answerKey` による文型採点が可能。
- `idioms`: `idioms` 配列に手動登録済みの有用なイディオムがある。

既存 passage で `features` がない場合は、既存フィールドの有無から互換的に扱ってよい。ただし新規追加では省略しない。

## Passage-level 必須項目

- `id`
- `title`
- `source`
- `source_url`
- `license_type`
- `word_count`
- `level_hint`
- `difficulty`
- `tags`
- `summary_ja`
- `features`
- `text`
- `created_at`
- `status`

## 追加 / 条件付き項目

- `author`
- `source_label`
- `sentences`
  - センテンス単位の本文、翻訳、token 情報を持つ。
  - 新規 Level A / B passage では必須。
  - 既存 passage では全センテンスに `translationJa` を付ける。
- `sentences[].translationJa`
  - センテンスごとの日本語訳。
  - reader では折りたたみ表示に使う。
- `notes`
- `updated_at`
- `difficulty_note`
- `sentences[].tokens[].partOfSpeech`
  - 教材側に手動で持たせる品詞情報。
  - 外部APIや自動判定ではなく、保存時の初期値として使う。
- `sentences[].tokens[].lemma`
  - 保存単語の見出し語として使う原形。
- `sentences[].tokens[].meaningJa`
  - 教材側に手動で持たせる日本語訳。
  - 未設定の場合は単語帳側では空欄のままにし、ユーザーが後から編集する。
- `sentences[].tokens[].dictionaryEntries`
  - その語が持つ品詞と日本語意味を一覧で持つ辞書情報（本文内の品詞・意味を含む）。
  - 保存単語の補足情報として単語帳で表示する。
- `sentences[].tokens[].grammarRole`
  - 文型採点対応 passage の手動注釈。
  - 値は `S`, `V`, `O`, `C`, `M` のいずれかを基本とする。
- `sentences[].sentencePattern`
  - 文全体の文型を短く表す。
- `sentences[].explanation`
  - 文型や構文の説明。
- `sentences[].answerKey`
  - 文型採点の正解データ。
  - token ID を key、許容ラベル配列を value にする。
- `idioms`
  - 教材内の熟語候補を手動で登録する。
  - `id`, `text`, `meaningJa`, `tokenIds` を持つ。

## Token rules

Word token は、単語帳保存、復習、フラッシュカードで使うため、本文内の使われ方に基づく `lemma`, `partOfSpeech`, `meaningJa` を持つ。

句読点 token は、本文表示や token index の安定性のために残してよいが、`lemma`, `partOfSpeech`, `meaningJa`, `dictionaryEntries`, `grammarRole` は省略できる。

## Dictionary entries

`dictionaryEntries` は品詞別の日本語意味一覧を表す。

```json
{
  "partOfSpeech": "verb",
  "meaningsJa": ["見つける", "分かる"]
}
```

ルール:

- 現在の文脈で使われている `partOfSpeech` と `meaningJa` を必ず含める。
- 学習上主要な別品詞や意味がある場合は追加する。
- すべての辞書的意味を網羅する必要はない。
- 推測で品詞や意味を埋めない。

## Grammar grading data

文型採点対応 passage では、sentence ごとに `answerKey` を持つ。

```json
{
  "sentencePattern": "SVOC",
  "explanation": "found は O が C だと分かった、という意味で使われています。",
  "answerKey": {
    "sample-s1-t0": ["S"],
    "sample-s1-t1": ["V"],
    "sample-s1-t2": ["O"],
    "sample-s1-t3": ["C", "M"]
  }
}
```

ルール:

- `answerKey` の key は実在する token ID にする。
- value は `S`, `V`, `O`, `C`, `M` の配列にする。
- 複数解釈を許す場合は複数ラベルを入れる。
- 採点対象外 token は `answerKey` に入れない。
- `grammarRole` は token 側の注釈として使うが、採点の正は `answerKey` とする。

## 命名ルール

- `id`
  - 英小文字、数字、アンダースコアを基本とする
  - 例: `sample_passage_001`
- `tags`
  - 英小文字の kebab-case を基本とする
  - 例: `daily-life`, `science`, `history`
- `status`
  - 初期値候補は `active`, `draft`, `archived`

## source / license の扱い

- `source` は配信元または出典名を記録する
- `source_url` は出典確認に使えるURLを記録する
- `license_type` は曖昧表現を避け、確認できた利用条件名を記録する
- 詳細な履歴は `materials/licenses/` 側でも管理する

## タグルール

- 教材検索や絞り込みを意識した短い語を使う
- 主題、文体、難度補助のいずれかを表す
- 初期段階では 2〜5 個程度を目安にする

## 将来の拡張項目候補

- `audio_url`
- `translation_ja`
- `question_set`
- `source_published_at`
- `estimated_reading_time`
- `rights_note`

## Idiom candidate marking

外部APIは使わず、教材データまたは内蔵辞書に登録されたイディオム候補だけを判定対象にする。

イディオム登録は全 passage 必須ではない。本文内に学習価値があり、token 範囲を明確にできる場合に手動登録する。

想定データ:

```json
{
  "idioms": [
    {
      "id": "look-forward-to",
      "text": "look forward to",
      "meaningJa": "楽しみにする",
      "tokenIds": ["s1-t3", "s1-t4", "s1-t5"]
    }
  ]
}
```

UI方針:

- tokenが登録済みイディオムの `tokenIds` に含まれる場合だけ、hover/hold時のポップアップにイディオム候補を表示する。
- イディオム内の単語にカーソルを合わせたとき、該当するイディオム全体の文字列を表示する。
- ポップアップに「イディオムとして保存する」ボタンを追加し、押した場合は一時トレイへ `type: "idiom"` として追加する。
- 自動生成や外部通信はしない。固定教材データまたはローカル辞書に登録された候補との一致だけを扱う。
