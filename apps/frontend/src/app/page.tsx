"use client";

import { useState } from "react";
import { TranslateResult, TranslateResponse } from "@translator/shared-types";
import { getCurrentUser } from "aws-amplify/auth";
import { useTranslate } from "@/hooks";

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<TranslateResponse | null>(null);
  // const [translations, setTranslations] = useState<Array<TranslateResult>>([]);

  const { isLoading, translations, translate, isTranslating } = useTranslate();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <main className="flex flex-col m-8">
      <form
        className="flex flex-col space y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          let result = await translate({
            sourceLang: inputLang,
            targetLang: outputLang,
            sourceText: inputText,
          });

          console.log("result: ", result);
        }}
      >
        <div>
          <label htmlFor="inputText">Input text</label>
          <textarea
            id="inputText"
            className="bg-white"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
          />
        </div>

        <div className="my-1">
          <label htmlFor="inputLang">Input language</label>
          <input
            id="inputLang"
            className="bg-white"
            value={inputLang}
            onChange={(event) => setInputLang(event.target.value)}
          />
        </div>

        <div className="my-1">
          <label htmlFor="outputLang">Output language</label>
          <input
            id="outputLang"
            className="bg-white"
            value={outputLang}
            onChange={(event) => setOutputLang(event.target.value)}
          />
        </div>

        <button className="btn bg-blue-500 p-2 mt-2 rounded-xl" type="submit">
          Translate
        </button>
      </form>

      <div>
        <p>Result:</p>
        <pre className="whitespace-pre-wrap w-full">
          {JSON.stringify(outputText)}
        </pre>
      </div>
      <div className="flex flex-col space-y-1 p-1">
        {translations.map((item) => (
          <div
            className="flex flex-row justify-between p-1 space-x-1 bg-slate-400"
            key={item.requestId}
          >
            <p>
              {item.sourceLang} / {item.sourceText}
            </p>
            <p>
              {item.targetLang} / {item.targetText}
            </p>
            {/* <button
              className="btn p-1 bg-red-500 hover:bg-red-300 rounded-md"
              type="button"
              onClick={async () => {
                const rtnValue = await deleteUserTranslation({
                  username: item.username,
                  requestId: item.requestId,
                });
                setTranslations(rtnValue);
              }}
            >
              X
            </button> */}
          </div>
        ))}
      </div>
    </main>
  );
}
