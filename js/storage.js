const STORAGE_KEYS = {
  savedWords: "english_reader.saved_words",
  readPassages: "english_reader.read_passages",
  reviewHistory: "english_reader.review_history",
  lastOpened: "english_reader.last_opened_passage",
  grammarAnswers: "english_reader.grammar_answers",
  vocabFolders: "english_reader.vocab_folders"
};

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Failed to parse localStorage value", error);
    return fallback;
  }
}

function readStorage(key, fallback) {
  return safeParse(localStorage.getItem(key), fallback);
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readStorageArray(key) {
  const parsed = readStorage(key, []);
  return Array.isArray(parsed) ? parsed : [];
}

function readStorageObject(key) {
  const parsed = readStorage(key, {});
  return isPlainObject(parsed) ? parsed : {};
}

function normalizeDictionaryEntries(entry, partOfSpeech, meaningJa) {
  const rawEntries = Array.isArray(entry.dictionary_entries)
    ? entry.dictionary_entries
    : Array.isArray(entry.dictionaryEntries)
      ? entry.dictionaryEntries
      : [];
  const merged = new Map();

  function addEntry(part, meanings) {
    const normalizedPart = String(part || "").trim();
    const normalizedMeanings = (Array.isArray(meanings) ? meanings : [meanings])
      .map(meaning => String(meaning || "").trim())
      .filter(Boolean);
    if (!normalizedPart || !normalizedMeanings.length) {
      return;
    }
    const existing = merged.get(normalizedPart) || new Set();
    normalizedMeanings.forEach(meaning => existing.add(meaning));
    merged.set(normalizedPart, existing);
  }

  rawEntries.forEach(raw => {
    const item = raw || {};
    addEntry(item.partOfSpeech || item.part_of_speech, item.meaningsJa || item.meanings_ja || item.meaningJa || item.meaning_ja);
  });
  addEntry(partOfSpeech, meaningJa);

  return [...merged.entries()].map(([part, meanings]) => ({
    partOfSpeech: part,
    meaningsJa: [...meanings]
  }));
}

function normalizeEntry(entry) {
  const folderIds = Array.isArray(entry.folder_ids)
    ? entry.folder_ids
    : Array.isArray(entry.folderIds)
      ? entry.folderIds
      : [];
  const partOfSpeech = entry.part_of_speech || entry.partOfSpeech || "";
  const meaningJa = entry.meaning_ja || entry.meaningJa || entry.definition_ja || "";
  return {
    id: entry.id || `vocab_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    word: (entry.word || "").trim(),
    type: entry.type || "word",
    passage_id: entry.passage_id || "",
    passage_title: entry.passage_title || "",
    sentence_id: entry.sentence_id || "",
    token_id: entry.token_id || "",
    lemma: entry.lemma || "",
    part_of_speech: partOfSpeech,
    meaning_ja: meaningJa,
    definition_ja: entry.definition_ja || "",
    dictionary_entries: normalizeDictionaryEntries(entry, partOfSpeech, meaningJa),
    component_words: Array.isArray(entry.component_words)
      ? entry.component_words
      : Array.isArray(entry.componentWords)
        ? entry.componentWords
        : [],
    example: entry.example || "",
    example_translation_ja: entry.example_translation_ja || entry.exampleTranslationJa || "",
    folder_ids: [...new Set(folderIds.filter(Boolean))],
    labels: Array.isArray(entry.labels) && entry.labels.length ? entry.labels : ["保存済み"],
    saved_at: entry.saved_at || new Date().toISOString(),
    updated_at: entry.updated_at || new Date().toISOString()
  };
}

function getSavedWords() {
  return readStorageArray(STORAGE_KEYS.savedWords).map(normalizeEntry);
}

function saveWords(words) {
  writeStorage(STORAGE_KEYS.savedWords, words.map(normalizeEntry));
}

function sameEntry(left, right) {
  if (left.token_id && right.token_id) {
    return left.passage_id === right.passage_id
      && left.type === right.type
      && left.token_id === right.token_id
      && left.word.toLowerCase() === right.word.toLowerCase();
  }
  return left.passage_id === right.passage_id
    && left.type === right.type
    && left.word.toLowerCase() === right.word.toLowerCase();
}

function saveWordIfNew(entry) {
  const words = getSavedWords();
  const normalized = normalizeEntry(entry);
  const existing = words.find(item => sameEntry(item, normalized));
  if (existing) {
    return { entry: existing, created: false };
  }
  words.unshift(normalized);
  saveWords(words);
  return { entry: normalized, created: true };
}

function deleteSavedWord(id) {
  saveWords(getSavedWords().filter(item => item.id !== id));
}

function updateSavedWord(id, updates) {
  const words = getSavedWords().map(item => {
    if (item.id !== id) {
      return item;
    }
    return normalizeEntry({
      ...item,
      ...updates,
      updated_at: new Date().toISOString()
    });
  });
  saveWords(words);
}

function normalizeFolder(folder) {
  return {
    id: folder.id || `folder_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: String(folder.name || "").trim(),
    created_at: folder.created_at || new Date().toISOString(),
    updated_at: folder.updated_at || new Date().toISOString()
  };
}

function getVocabFolders() {
  return readStorageArray(STORAGE_KEYS.vocabFolders)
    .map(normalizeFolder)
    .filter(folder => folder.name);
}

function saveVocabFolders(folders) {
  writeStorage(STORAGE_KEYS.vocabFolders, folders.map(normalizeFolder).filter(folder => folder.name));
}

function createVocabFolder(name) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return { folder: null, created: false };
  }
  const folders = getVocabFolders();
  const existing = folders.find(folder => folder.name.toLowerCase() === normalizedName.toLowerCase());
  if (existing) {
    return { folder: existing, created: false };
  }
  const folder = normalizeFolder({ name: normalizedName });
  folders.push(folder);
  saveVocabFolders(folders);
  return { folder, created: true };
}

function deleteVocabFolder(folderId) {
  saveVocabFolders(getVocabFolders().filter(folder => folder.id !== folderId));
  const words = getSavedWords().map(word => normalizeEntry({
    ...word,
    folder_ids: word.folder_ids.filter(id => id !== folderId),
    updated_at: new Date().toISOString()
  }));
  saveWords(words);
}

function setWordFolderMembership(wordId, folderId, enabled) {
  const words = getSavedWords().map(word => {
    if (word.id !== wordId) {
      return word;
    }
    const folderIds = new Set(word.folder_ids);
    if (enabled) {
      folderIds.add(folderId);
    } else {
      folderIds.delete(folderId);
    }
    return normalizeEntry({
      ...word,
      folder_ids: [...folderIds],
      updated_at: new Date().toISOString()
    });
  });
  saveWords(words);
}

function getReadPassages() {
  return readStorageObject(STORAGE_KEYS.readPassages);
}

function setReadPassage(passageId, read = true) {
  const reads = getReadPassages();
  if (read) {
    reads[passageId] = {
      read: true,
      read_at: new Date().toISOString()
    };
  } else {
    delete reads[passageId];
  }
  writeStorage(STORAGE_KEYS.readPassages, reads);
}

function setLastOpenedPassage(passageId) {
  writeStorage(STORAGE_KEYS.lastOpened, {
    passage_id: passageId,
    opened_at: new Date().toISOString()
  });
}

function getLastOpenedPassage() {
  const parsed = readStorage(STORAGE_KEYS.lastOpened, null);
  return isPlainObject(parsed) ? parsed : null;
}

function getReviewHistory() {
  return readStorageArray(STORAGE_KEYS.reviewHistory);
}

function addReviewEntry(entry) {
  const history = getReviewHistory();
  history.unshift({
    id: `review_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    target_type: entry.target_type || "word",
    target_id: entry.target_id || "",
    word: entry.word || "",
    passage_id: entry.passage_id || "",
    result: entry.result || "reviewed",
    reviewed_at: new Date().toISOString()
  });
  writeStorage(STORAGE_KEYS.reviewHistory, history.slice(0, 100));
}

function getGrammarAnswers() {
  return readStorageObject(STORAGE_KEYS.grammarAnswers);
}

function getGrammarAnswersForPassage(passageId) {
  const answers = getGrammarAnswers()[passageId];
  return isPlainObject(answers) ? answers : {};
}

function setGrammarAnswer(passageId, tokenId, label) {
  const allAnswers = getGrammarAnswers();
  const passageAnswers = allAnswers[passageId] || {};
  if (label) {
    passageAnswers[tokenId] = label;
  } else {
    delete passageAnswers[tokenId];
  }
  allAnswers[passageId] = passageAnswers;
  writeStorage(STORAGE_KEYS.grammarAnswers, allAnswers);
}

function clearGrammarAnswersForPassage(passageId) {
  const allAnswers = getGrammarAnswers();
  allAnswers[passageId] = {};
  writeStorage(STORAGE_KEYS.grammarAnswers, allAnswers);
}
