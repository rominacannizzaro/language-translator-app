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

// Type that represents the data to be stored in the database
export type TranslateResult = TranslateRequest &
  TranslateResponse & {
    username: string;
    requestId: string;
  };
