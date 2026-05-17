# Lesson Data Format

This app reads static lesson data from `data/passages.json`.

The app does not call OpenAI, Google Translate, spaCy, Stanza, or any other external API at runtime. If a passage is analyzed by ChatGPT/Codex, that analysis must happen outside the app. The result should be saved into the repository as structured JSON.

## Lesson Object

Required fields for a normal lesson:

- `id`: stable lesson id
- `title`: display title
- `text`: full passage text
- `status`: usually `active`

Recommended metadata:

- `difficulty`: `beginner`, `intermediate`, or `advanced`
- `tags`: array of tags, with or without `#`
- `wordCount` or `word_count`: total word count
- `level_hint`: CEFR hint such as `CEFR A2`
- `summary_ja`: short Japanese summary
- `source`, `source_url`, `license_type`: source and rights tracking

## Pre-Analyzed Sentences

Add `sentences` when a passage has been analyzed beforehand:

```json
{
  "sentenceId": "s1",
  "text": "I found the book interesting.",
  "sentencePattern": "SVOC",
  "explanation": "interesting は the book の状態を説明しているため、目的格補語 C です。",
  "tokens": [],
  "answerKey": {}
}
```

Sentence fields:

- `sentenceId`: stable sentence id
- `text`: sentence text
- `sentencePattern`: optional pattern such as `SV`, `SVO`, `SVC`, `SVOO`, `SVOC`
- `explanation`: optional human-written explanation
- `tokens`: optional pre-tokenized word/punctuation data
- `answerKey`: optional grammar-checking key

If `tokens` is omitted, the app falls back to simple browser-side tokenization. This fallback is only for display; it is not grammar analysis.

## Token Object

Pre-analyzed token fields:

- `id`: stable token id
- `text`: surface text
- `lemma`: base form
- `partOfSpeech`: part of speech
- `meaningJa`: Japanese meaning
- `grammarRole`: `S`, `V`, `O`, `C`, or `M`

`partOfSpeech` and `meaningJa` on a token describe the word as it is used in that sentence. They are passage-specific hints, not complete dictionary data.

Dictionary-level word data should be prepared separately by the project side when needed. A future dictionary entry can contain all possible parts of speech and meanings for a word:

```json
{
  "word": "book",
  "dictionaryEntries": [
    {
      "partOfSpeech": "noun",
      "meaningsJa": ["本", "書籍"]
    },
    {
      "partOfSpeech": "verb",
      "meaningsJa": ["予約する", "記帳する"]
    }
  ]
}
```

The learner-facing vocabulary notebook should not ask users to manually create this dictionary data. If dictionary data is not registered, the UI should show a simple state such as `辞書データ未登録`.

The app also accepts older snake_case fields where present:

- `part_of_speech`
- `meaning_ja`
- `definition_ja`
- `definition_en`

## Answer Key

`answerKey` maps token ids to allowed grammar labels:

```json
{
  "s1-t0": ["S"],
  "s1-t1": ["V"],
  "s1-t2": ["O"]
}
```

The value is always an array so future alternate answers can be supported.

At runtime, users manually label tokens as `S/V/O/C/M`. The app compares those user labels with `answerKey`. It does not automatically judge grammar.

If `answerKey` is omitted but tokens include `grammarRole`, the app can derive the same static answer key from those provided roles. This is still not runtime analysis; it only uses stored lesson data.

## Adding A New Analyzed Passage

1. Ask ChatGPT/Codex outside the app to analyze the passage.
2. Review and correct the output manually.
3. Add a new lesson object to `data/passages.json`.
4. Include `sentences`, `tokens`, `answerKey`, `sentencePattern`, and `explanation` where available.
5. Open `index.html`, choose the lesson, and verify token rendering and grammar checking.

## Minimal Example

See `sample_pre_analyzed_svoc` in `data/passages.json`.

The app uses its token metadata when saving words:

- `lemma` is copied into saved word data.
- `partOfSpeech` is copied into saved word data.
- `meaningJa` is copied into the Japanese meaning field.

Missing fields are left blank and can be edited later in the vocabulary screen.
