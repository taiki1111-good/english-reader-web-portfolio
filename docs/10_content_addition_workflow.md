# 10_content_addition_workflow

## 目的とスコープ

新しい英文 passage を repo に追加する時の作業手順を定義する。

対象は、素材取得から `data/passages.json` へ反映し、reader、単語帳、復習、フラッシュカード、文型採点、イディオム保存が必要な範囲で壊れないことを確認するまで。

この文書は運用手順を扱う。フィールド定義そのものは `docs/04_content_data_spec.md` を正とする。

## モデル / タスク分離

- Codex 5.5 thinking:
  - passage 追加ルール、データ契約、長期運用、検証方針、ライセンス判断、将来保守性に関わる判断。
  - `docs/04_content_data_spec.md` やこの文書を変える作業。
- Codex 5.3:
  - ルール確定後の小さな実装、既存仕様に沿った局所修正、軽微な表示調整、検証スクリプトの小修正。

迷った場合は、将来の passage 追加や保存データ契約に影響するなら 5.5 thinking の仕事として扱う。

## 全体フロー

1. `README.md` と `AGENT_INDEX.md` から読み始める。
2. `docs/03_architecture.md`, `docs/04_content_data_spec.md`, `docs/09_content_policy.md` を確認する。
3. 素材の出典、利用条件、改変可否を確認する。
4. 候補素材を `materials/raw/` に置き、出典メモを残す。
5. 採用できる素材だけを `materials/curated/` に整形して置く。
6. passage-level / sentence-level / token-level の必要項目を埋める。
7. 必要に応じて grammar / idiom データを手動で追加する。
8. `data/passages.json` に配布用 JSON として追加する。
9. JSON と UI 機能の最小確認を行う。
10. `materials/licenses/`, `ops/CURRENT_TASKS.md`, `ops/DECISION_LOG.md` の更新要否を確認する。

## Source / License Check

素材取得時点で次を確認する。

- 原出典を特定できること。
- `source_url` または参照情報を残せること。
- 教材として再掲載または配布できる利用条件であること。
- 改変が必要な場合、改変が許されていること。
- 外部配信元や二次転載が混ざっていないこと。

ライセンスが曖昧な素材は採用しない。採用候補を扱う時点で `materials/licenses/SOURCE_LOG.md` を更新し、新しいライセンス種別を採用する場合は `materials/licenses/LICENSE_REGISTRY.md` も更新する。

## materials/raw/ の使い方

`materials/raw/` には取得直後の原文、URL、取得日、候補判断メモを置く。

- 未採用の素材も、後から判断を追える範囲でメモを残す。
- 原文の意味を変える編集はここでは行わない。
- 出典が不明なテキストを仮置きして採用前提にしない。

## materials/curated/ の使い方

`materials/curated/` には採用可と判断した素材の管理用マスタを置く。

- 本文、出典、ライセンス、整形履歴の対応を保つ。
- センテンス分割、語数、必要な注釈の作業元にする。
- `data/passages.json` を直接の唯一マスタにしない。

## data/passages.json Export Rule

`data/passages.json` は静的 UI が読む配布用 JSON として扱う。

- 大きな手作業置換を避け、追加 passage の差分を小さく保つ。
- runtime に必要な項目を入れる。
- 新規 passage では `features` を明示する。
- 既存 passage の互換項目を削除しない。
- `word_count` を基本とし、既存互換で `wordCount` がある場合は値を一致させる。

## Content Levels

### Level A: reading + vocabulary + review + flashcard compatible

通常 passage の最低受け入れ水準。

Passage-level required:

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
- `text`
- `features`
- `created_at`
- `status`

Sentence-level required:

- `sentenceId`
- `text`
- `translationJa`
- `tokens`

Token-level required for word tokens:

- `id`
- `text`
- `lemma`
- `partOfSpeech`
- `meaningJa`
- `dictionaryEntries`

Punctuation tokens may contain only `id` and `text`.

### Level B: grammar grading compatible

文型採点を有効にする passage の追加水準。Level A の全項目に加えて次を持つ。

Passage-level:

- `features.grammarQuiz: true`

Sentence-level:

- `sentencePattern`
- `explanation`
- `answerKey`

Token-level:

- `grammarRole` where applicable

すべての passage を Level B にする必要はない。通常の読解、語彙、復習、フラッシュカード用 passage は Level A のままでよい。

## features Policy

新規 passage は次の形式を使う。

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

- `translation`: sentence-level `translationJa` を UI で使える。
- `vocab`: word token に `lemma`, `partOfSpeech`, `meaningJa`, `dictionaryEntries` がある。
- `grammarQuiz`: `answerKey` と `grammarRole` による文型採点ができる。
- `idioms`: `idioms` 配列に手動登録済みの有用なイディオムがある。

既存 passage に `features` がない場合は、既存フィールドの有無から UI 側または検証側で互換的に判断してよい。ただし、新規追加では省略しない。

## Sentence Split Rules

- `sentenceId` は passage ID を含めて一意にする。
- 1文は reader で折りたたみ訳と grammar answerKey の単位になる。
- 原文の意味を変えるための分割や結合はしない。
- 省略記号、略語、引用符がある場合は、人が読んで自然な文単位を優先する。

例:

```text
{passage_id}-s1
{passage_id}-s2
```

## Tokenization Rules

- token は reader 上で選択、保存、文型ラベル付けできる最小単位にする。
- `id` は sentence ID と token index から作る。
- token index は文頭から順に `t0`, `t1`, `t2` とする。
- 句読点は token として保持してよいが、語彙用フィールドは省略できる。
- contraction や hyphenated word は、学習上の扱いやすさを優先して一貫した単位にする。

例:

```text
{passage_id}-s1-t0
{passage_id}-s1-t1
```

## Dictionary Entry Rules

`partOfSpeech` と `meaningJa` は、その文での使われ方を表す。

`dictionaryEntries` は、その語の主要な品詞別意味を表し、現在の文脈での品詞と意味を必ず含める。

```json
{
  "partOfSpeech": "verb",
  "meaningsJa": ["見つける", "分かる"]
}
```

すべての辞書的意味を網羅する必要はないが、学習上主要な品詞と意味を不足させない。推測で品詞や意味を埋めず、判断できない場合は採用前に確認する。

## Grammar Grading Rules

文型採点は grammar-enabled passage のみ必須。

- allowed labels: `S`, `V`, `O`, `C`, `M`
- `answerKey` は token ID を key にし、正解ラベル配列を value にする。
- 複数正解が自然な場合は `["M", "C"]` のように配列で持つ。
- 採点対象外 token は `answerKey` に入れない。
- `grammarRole` は表示補助や初期注釈として使い、最終採点の正は `answerKey` とする。
- `sentencePattern` は文全体の型を短く表す。
- `explanation` は学習者が誤答を見直せる説明にする。

## Idiom Registration Rules

イディオム登録は全 passage 必須ではない。

ただし、本文内に学習価値のあるイディオムや定型表現があり、token 範囲を明確に指定できる場合は手動登録する。

```json
{
  "id": "look-forward-to",
  "text": "look forward to",
  "meaningJa": "楽しみにする",
  "tokenIds": ["sample-s1-t3", "sample-s1-t4", "sample-s1-t5"]
}
```

Rules:

- `id` は passage 内で一意にする。
- `tokenIds` は実在する token ID だけを含める。
- UI では登録済み idiom だけを hint / save 対象にする。
- 自動抽出や外部 API を必須にしない。

## Naming Conventions

- passage `id`: 英小文字、数字、アンダースコア。
- `sentenceId`: `{passage_id}-s{number}`。
- token `id`: `{sentenceId}-t{number}`。
- `tags`: 英小文字 kebab-case。
- idiom `id`: 英小文字 kebab-case。
- `status`: `active`, `draft`, `archived`。
- `difficulty`: `beginner`, `intermediate`, `advanced`。

## Feature Connection Checklist

- reader:
  - `title`, `source`, `source_url`, `text`, `sentences`, `translationJa`
- word tray:
  - token `id`, `text`, `lemma`, `partOfSpeech`, `meaningJa`, `dictionaryEntries`
- vocabulary notebook:
  - saved token metadata and source passage metadata
- review sheet:
  - saved word / idiom data copied from passage token or idiom data
- flashcards:
  - saved word / idiom, Japanese meaning, example sentence, example translation
- grammar grading:
  - `features.grammarQuiz`, `answerKey`, `grammarRole`, `sentencePattern`, `explanation`
- idiom saving:
  - `features.idioms`, `idioms[].tokenIds`, `idioms[].meaningJa`

## Validation Checklist

Before completion, check:

- Required passage fields exist for the intended content level.
- `features` matches actual data.
- `word_count` matches the passage text closely enough for display.
- `wordCount`, if present, matches `word_count`.
- `sentenceId` values are unique.
- token IDs are unique.
- word tokens have lexical fields.
- punctuation tokens without lexical fields are intentional.
- `dictionaryEntries` includes the contextual `partOfSpeech` and `meaningJa`.
- `answerKey` token IDs exist when `features.grammarQuiz` is true.
- `answerKey` labels are only `S`, `V`, `O`, `C`, `M`.
- `idioms[].tokenIds` exist when idioms are registered.
- `SOURCE_LOG.md` and `LICENSE_REGISTRY.md` are updated where needed.
- UI can load `data/passages.json` without JSON parse errors.

## Definition of Done

A new passage addition is done when:

- source and license are traceable;
- raw and curated material records are present where applicable;
- `data/passages.json` has a small, reviewable addition;
- Level A fields are complete for normal passages;
- Level B fields are complete if grammar quiz is enabled;
- idioms are registered when useful and clear;
- JSON validity and key ID references have been checked;
- related docs or ops notes are updated if the workflow or rule changed.

## Allowed Incomplete Items

- Grammar grading may remain absent for normal Level A passages.
- Idioms may be absent if the passage has no useful idiom target.
- Exhaustive dictionary coverage is not required.
- Future validation automation may remain a documented task.

## Must Not Be Guessed

- license and reuse permission;
- source URL or source identity;
- author attribution when required;
- contextual meaning;
- part of speech;
- grammar answerKey;
- idiom token range.

## Future Validation Script

Consider adding `scripts/validate_passages_json.py`.

Initial checks should include:

- required passage fields;
- `word_count` / `wordCount` consistency;
- unique sentence IDs;
- unique token IDs;
- existing token IDs for `answerKey`;
- existing token IDs for idioms;
- lexical fields for word tokens;
- punctuation-token exemption;
- grammar-enabled passages contain `answerKey`.
