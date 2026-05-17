const GRAMMAR_LABELS = ["S", "V", "O", "C", "M"];

function parseQuery() {
  return new URLSearchParams(window.location.search);
}

async function fetchJson(path) {
  let response;
  try {
    response = await fetch(path);
  } catch (error) {
    const fileHint = window.location.protocol === "file:"
      ? " ローカルファイルを直接開くと教材JSONを読み込めない場合があります。静的サーバー経由で開いてください。"
      : "";
    throw new Error(`JSON を読み込めませんでした。${fileHint}`);
  }
  if (!response.ok) {
    throw new Error(`JSON を読み込めませんでした: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getWordCount(passage) {
  if (Number.isFinite(Number(passage.wordCount))) {
    return Number(passage.wordCount);
  }
  if (Number.isFinite(Number(passage.word_count))) {
    return Number(passage.word_count);
  }
  return (passage.text || "").trim().split(/\s+/).filter(Boolean).length;
}

function getDifficultyLabel(difficulty) {
  return {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級"
  }[difficulty] || "未設定";
}

function normalizeWord(value) {
  return String(value || "").toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
}

function splitSentences(text) {
  return String(text || "").match(/[^.!?]+[.!?]?/g)?.map(item => item.trim()).filter(Boolean) || [];
}

function tokenizeSentence(sentenceId, text) {
  const parts = String(text || "").match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?|[^\sA-Za-z0-9]/g) || [];
  return parts.map((part, index) => ({
    id: `${sentenceId}-t${index}`,
    text: part
  }));
}

function buildSentenceList(passage) {
  if (Array.isArray(passage.sentences) && passage.sentences.length) {
    return passage.sentences.map((sentence, index) => {
      const sentenceId = sentence.sentenceId || `${passage.id}-s${index}`;
      const tokens = Array.isArray(sentence.tokens) && sentence.tokens.length
        ? sentence.tokens.map((token, tokenIndex) => ({
            id: token.id || `${sentenceId}-t${tokenIndex}`,
            ...token
          }))
        : tokenizeSentence(sentenceId, sentence.text);
      const answerKey = sentence.answerKey || tokens.reduce((roles, token) => {
        if (token.grammarRole) {
          roles[token.id] = [token.grammarRole];
        }
        return roles;
      }, {});
      return {
        sentenceId,
        text: sentence.text,
        translationJa: sentence.translationJa || sentence.translation_ja || "",
        sentencePattern: sentence.sentencePattern || "",
        explanation: sentence.explanation || "",
        tokens,
        answerKey
      };
    });
  }
  return splitSentences(passage.text).map((text, index) => {
    const sentenceId = `${passage.id}-s${index}`;
    return {
      sentenceId,
      text,
      translationJa: "",
      sentencePattern: "",
      explanation: "",
      tokens: tokenizeSentence(sentenceId, text),
      answerKey: {}
    };
  });
}

function shouldSpaceBefore(text, previousText) {
  if (!previousText) {
    return false;
  }
  return !/^[.,!?;:)]$/.test(text) && !/^[(]$/.test(previousText);
}

function tokenMeaning(token) {
  return token.meaningJa || token.meaning_ja || token.definition_ja || token.definitionJa || "";
}

function tokenPartOfSpeech(token) {
  return token.partOfSpeech || token.part_of_speech || "";
}

function showMessage(target, message, type = "info") {
  target.innerHTML = `<div class="message message-${type}">${message}</div>`;
}
