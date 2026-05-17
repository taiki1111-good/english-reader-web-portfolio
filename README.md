# English Reader Web

Local-first English reading, vocabulary, and grammar learning web app built with static HTML/CSS/JavaScript.

## Project Overview

English Reader Web is a browser-based study app for reading short English passages, saving useful words, reviewing them, and practicing sentence-pattern grammar labels (`S/V/O/C/M`).

- Local-first: data stays in the browser via `localStorage`
- No external API dependency
- JSON-driven learning content

## Live Demo

https://taiki1111-good.github.io/english-reader-web-portfolio/

## Features

- Passage list with level/tags/feature badges
- Reader with sentence cards and Japanese translations
- Token selection for word-level actions
- Tray workflow before saving to vocabulary
- Vocabulary notebook with filtering/folders
- Review view for memorization practice
- Flashcard mode
- Grammar grading (`S/V/O/C/M`) for Level B passages
- Correct / incorrect / unanswered visual feedback
- Manual clear button for grading results (`採点結果を消す`)

## Technical Points

- Static site architecture (`index.html`, `reader.html`, `vocab.html`, `review.html`, `flashcard.html`)
- Plain JavaScript state handling
- `localStorage` persistence for reading/vocabulary/grammar states
- Content managed in `data/passages.json`
- Validation script for content consistency
- Responsive UI for desktop and mobile

## Data / Content Workflow

- Content source: `data/passages.json`
- Validation: `scripts/validate_passages_json.py`
- Workflow docs:
  - `docs/10_content_addition_workflow.md`
  - `docs/04_content_data_spec.md`

## Screenshots

Screenshots can be added later if needed.

- Passage list with feature badges
- Reader with grammar labels
- Grading result feedback
- Vocabulary notebook
- Flashcard mode

## Status

Public demo is available via GitHub Pages. The app is a static, localStorage-based learning tool and remains open to incremental improvements.

## How To Run Locally

1. Start a static server at the repository root.

```bash
python -m http.server 8000
```

2. Open the app in a browser.

```text
http://localhost:8000
```

3. Open `reader.html?id=<passage_id>` directly when you want to test a specific passage.

## Validation

Run the content validator before publishing content changes.

```bash
python scripts/validate_passages_json.py
```

## Repository Guides

- Project map: `REPO_MAP.md`
- Continue guide: `docs/00_how_to_continue.md`
- Current tasks: `ops/CURRENT_TASKS.md`
- Decision log: `ops/DECISION_LOG.md`
