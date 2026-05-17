# Future Ideas

These ideas are roadmap notes only. They are not implemented in the current task.

## Flashcards From Saved Words

Saved words and phrases should eventually become flashcards automatically.

- Front: English word or phrase
- Back: Japanese meaning
- Card sets should be creatable from all saved words, a folder, or a specific label.

## Folders For Saved Words

Allow users to create custom folders and put saved words or phrases into those folders.

## Pre-Analysis When Adding A New Passage

When adding a new long passage, eventually analyze and store:

- sentence patterns such as SV, SVO, SVC, SVOO, SVOC
- word meanings
- parts of speech

This would support later sentence-structure checking and automatic filling of word meaning / part of speech.

Do not implement this now. Without external APIs, high-accuracy automatic grammar or translation analysis is difficult. Possible future approaches:

- manually prepared lesson metadata
- offline/local dictionary
- pre-processing script
- optional local NLP pipeline
- external API only if the project policy changes later

## Multi-Token Grammar Labeling

Current grammar labels are token-based. In the future, support selecting multiple tokens first, then applying one grammar label to all selected tokens.

Example: `The big dog = S`

Implementation idea:

- tap/click tokens to select multiple tokens
- show popup for the selected group
- choosing S/V/O/C/M applies the label to all selected tokens
