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