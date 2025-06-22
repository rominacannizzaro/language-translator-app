// Types for translation request and response

export type TranslateRequest = {
  sourceLang: string;
  targetLang: string;
  sourceText: string;
};

export type TranslateResponse = {
  timestamp: string;
  targetText: string;
};

export type TranslatePrimaryKey = {
  username: string;
  requestId: string;
};

// Type that represents the full translation record stored in the database,
// including request data, response data, and primary key fields,
// to maintain a complete history of translation operations.
export type TranslateResult = TranslateRequest &
  TranslateResponse &
  TranslatePrimaryKey;

export type TranslateResultList = Array<TranslateResult>;
