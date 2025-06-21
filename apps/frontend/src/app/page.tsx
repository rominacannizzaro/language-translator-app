"use client";

import { useState } from "react";
import {
  TranslateDbObject,
  TranslateRequest,
  TranslateResponse,
} from "@translator/shared-types";
import { fetchAuthSession } from "aws-amplify/auth";

// API Gateway URL (add the actual URL below)
// const URL = "https://your-api-id.execute-api.region.amazonaws.com/prod";

// Function to make HTTP call to our server, make a translation request and receive it
const translateText = async ({
  inputLang,
  outputLang,
  inputText,
}: {
  inputLang: string;
  outputLang: string;
  inputText: string;
}) => {
  try {
    const request: TranslateRequest = {
      sourceLang: inputLang,
      targetLang: outputLang,
      sourceText: inputText,
    };

    // Get the logged-in user's ID token from Cognito - required in the Authorization header to authenticate API requests
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

    const result = await fetch(`${URL}`, {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as TranslateResponse;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

const getTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const rtnValue = (await result.json()) as Array<TranslateDbObject>;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

export default function Home() {
  const [inputText, setInputText] = useState<string>("");
  const [inputLang, setInputLang] = useState<string>("");
  const [outputLang, setOutputLang] = useState<string>("");
  const [outputText, setOutputText] = useState<TranslateResponse | null>(null);
  const [translations, setTranslations] = useState<Array<TranslateDbObject>>(
    []
  );

  return (
    <main className="flex flex-col m-8">
      <form
        className="flex flex-col space y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          // console.log({inputText, inputLang, outputLang});
          const result = await translateText({
            inputText,
            inputLang,
            outputLang,
          });
          setOutputText(result);
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

      <button
        className="btn bg-blue-500 p-2 mt-2 rounded-xl"
        type="button"
        onClick={async () => {
          const rtnValue = await getTranslations();
          setTranslations(rtnValue);
        }}
      >
        Get translations
      </button>

      <div>
        <p>Result:</p>
        <pre>
          {translations.map((item) => (
            <div key={item.requestId}>
              <p>
                {item.sourceLang} / {item.sourceText}
              </p>
              <p>
                {item.targetLang} / {item.targetText}
              </p>
            </div>
          ))}
        </pre>
      </div>
    </main>
  );
}
