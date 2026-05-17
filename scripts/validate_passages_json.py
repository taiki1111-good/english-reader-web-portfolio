"""Validate the distributed passage data used by the static reader UI."""

from __future__ import annotations

import json
import string
import sys
from pathlib import Path
from typing import Any


PASSAGES_PATH = Path("data/passages.json")

PASSAGE_REQUIRED_FIELDS = {
    "id",
    "title",
    "source",
    "source_url",
    "license_type",
    "word_count",
    "level_hint",
    "difficulty",
    "tags",
    "summary_ja",
    "features",
    "text",
    "created_at",
    "status",
}

FEATURE_FIELDS = {"translation", "vocab", "grammarQuiz", "idioms"}
WORD_TOKEN_FIELDS = {"lemma", "partOfSpeech", "meaningJa", "dictionaryEntries"}
GRAMMAR_LABELS = {"S", "V", "O", "C", "M"}
PUNCTUATION_CHARS = set(string.punctuation) | {"。", "、", "，", "．", "！", "？", "；", "：", "“", "”", "‘", "’", "「", "」"}


def is_punctuation_token(token: dict[str, Any]) -> bool:
    text = token.get("text")
    if not isinstance(text, str) or not text:
        return False
    return all((not char.isalnum()) or char in PUNCTUATION_CHARS for char in text)


def format_location(passage_id: str, sentence_id: str | None = None, token_id: str | None = None) -> str:
    parts = [passage_id]
    if sentence_id:
        parts.append(sentence_id)
    if token_id:
        parts.append(token_id)
    return " / ".join(parts)


def validate_passages(data: Any) -> list[str]:
    errors: list[str] = []

    if not isinstance(data, list):
        return ["data/passages.json must contain a list of passages"]

    all_sentence_ids: set[str] = set()
    all_token_ids: set[str] = set()

    for index, passage in enumerate(data):
        if not isinstance(passage, dict):
            errors.append(f"passage at index {index} must be an object")
            continue

        passage_id = str(passage.get("id", f"<index {index}>"))

        for field in sorted(PASSAGE_REQUIRED_FIELDS):
            if field not in passage:
                errors.append(f"{passage_id}: missing required passage field '{field}'")

        features = passage.get("features")
        if not isinstance(features, dict):
            errors.append(f"{passage_id}: features must be an object")
            features = {}
        for field in sorted(FEATURE_FIELDS):
            if field not in features:
                errors.append(f"{passage_id}: missing features.{field}")

        sentences = passage.get("sentences")
        if not isinstance(sentences, list) or not sentences:
            errors.append(f"{passage_id}: sentences must be a non-empty list")
            continue

        token_ids_in_passage: set[str] = set()
        word_token_count = 0
        grammar_enabled = features.get("grammarQuiz") is True

        for sentence_index, sentence in enumerate(sentences):
            if not isinstance(sentence, dict):
                errors.append(f"{passage_id}: sentence at index {sentence_index} must be an object")
                continue

            sentence_id = sentence.get("sentenceId")
            if not isinstance(sentence_id, str) or not sentence_id:
                errors.append(f"{passage_id}: sentence at index {sentence_index} missing sentenceId")
                sentence_id = f"<sentence {sentence_index}>"
            elif sentence_id in all_sentence_ids:
                errors.append(f"{passage_id}: duplicate sentenceId '{sentence_id}'")
            else:
                all_sentence_ids.add(sentence_id)

            tokens = sentence.get("tokens")
            if not isinstance(tokens, list) or not tokens:
                errors.append(f"{format_location(passage_id, sentence_id)}: tokens must be a non-empty list")
                continue

            if grammar_enabled and not isinstance(sentence.get("answerKey"), dict):
                errors.append(f"{format_location(passage_id, sentence_id)}: grammarQuiz=true requires answerKey")

            if not grammar_enabled:
                for field, empty_value in (
                    ("sentencePattern", ""),
                    ("explanation", ""),
                    ("answerKey", {}),
                ):
                    if sentence.get(field) == empty_value:
                        errors.append(
                            f"{format_location(passage_id, sentence_id)}: empty grammar field '{field}' remains"
                        )

            for token_index, token in enumerate(tokens):
                if not isinstance(token, dict):
                    errors.append(f"{format_location(passage_id, sentence_id)}: token {token_index} must be an object")
                    continue

                token_id = token.get("id")
                if not isinstance(token_id, str) or not token_id:
                    errors.append(f"{format_location(passage_id, sentence_id)}: token {token_index} missing id")
                    token_id = f"<token {token_index}>"
                elif token_id in all_token_ids:
                    errors.append(f"{passage_id}: duplicate token id '{token_id}'")
                else:
                    all_token_ids.add(token_id)
                    token_ids_in_passage.add(token_id)

                if is_punctuation_token(token):
                    continue

                word_token_count += 1
                for field in sorted(WORD_TOKEN_FIELDS):
                    if field not in token:
                        errors.append(f"{format_location(passage_id, sentence_id, token_id)}: missing {field}")
                    elif field == "dictionaryEntries" and not isinstance(token[field], list):
                        errors.append(
                            f"{format_location(passage_id, sentence_id, token_id)}: dictionaryEntries must be a list"
                        )

            answer_key = sentence.get("answerKey")
            if grammar_enabled and isinstance(answer_key, dict):
                for token_id, labels in answer_key.items():
                    if token_id not in token_ids_in_passage:
                        errors.append(
                            f"{format_location(passage_id, sentence_id)}: answerKey references missing token '{token_id}'"
                        )
                    if not isinstance(labels, list) or not labels:
                        errors.append(
                            f"{format_location(passage_id, sentence_id)}: answerKey for '{token_id}' must be a non-empty list"
                        )
                        continue
                    for label in labels:
                        if label not in GRAMMAR_LABELS:
                            errors.append(
                                f"{format_location(passage_id, sentence_id)}: invalid grammar label '{label}' for '{token_id}'"
                            )

        if passage.get("word_count") != word_token_count:
            errors.append(f"{passage_id}: word_count {passage.get('word_count')} != word token count {word_token_count}")

        if "wordCount" in passage and passage.get("wordCount") != passage.get("word_count"):
            errors.append(f"{passage_id}: wordCount must match word_count")

        idioms = passage.get("idioms")
        idiom_count = len(idioms) if isinstance(idioms, list) else 0
        if features.get("idioms") is True and idiom_count == 0:
            errors.append(f"{passage_id}: features.idioms=true but idioms is empty or missing")
        if features.get("idioms") is False and idiom_count > 0:
            errors.append(f"{passage_id}: features.idioms=false but idioms are present")

        if idioms is not None and not isinstance(idioms, list):
            errors.append(f"{passage_id}: idioms must be a list when present")
        elif isinstance(idioms, list):
            for idiom_index, idiom in enumerate(idioms):
                if not isinstance(idiom, dict):
                    errors.append(f"{passage_id}: idiom at index {idiom_index} must be an object")
                    continue
                token_ids = idiom.get("tokenIds")
                if not isinstance(token_ids, list) or not token_ids:
                    errors.append(f"{passage_id}: idiom '{idiom.get('id', idiom_index)}' requires tokenIds")
                    continue
                for token_id in token_ids:
                    if token_id not in token_ids_in_passage:
                        errors.append(
                            f"{passage_id}: idiom '{idiom.get('id', idiom_index)}' references missing token '{token_id}'"
                        )

    return errors


def main() -> int:
    try:
        data = json.loads(PASSAGES_PATH.read_text(encoding="utf-8"))
    except FileNotFoundError:
        print(f"passages validation failed: {PASSAGES_PATH} not found")
        return 1
    except json.JSONDecodeError as exc:
        print(f"passages validation failed: invalid JSON at line {exc.lineno}, column {exc.colno}: {exc.msg}")
        return 1

    errors = validate_passages(data)
    if errors:
        print("passages validation failed")
        for error in errors:
            print(f"- {error}")
        return 1

    print("passages validation passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
