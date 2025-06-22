"use client";

import { useState } from "react";
import {
  TranslateDbObject,
  TranslateRequest,
  TranslateResponse,
} from "@translator/shared-types";
import { fetchAuthSession, getCurrentUser } from "aws-amplify/auth";

// API Gateway URL (add the actual URL below)
// const URL = "https://your-api-id.execute-api.region.amazonaws.com/prod";

// Available-to-all function to make HTTP call to our server, make a translation request and receive it
const translatePublicText = async ({
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

    const result = await fetch(`${URL}/public`, {
      method: "POST",
      body: JSON.stringify(request),
    });

    const rtnValue = (await result.json()) as TranslateResponse;
    return rtnValue;
  } catch (e: unknown) {
    console.error(e);
    throw e;
  }
};

const translateUsersText = async ({
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

    const result = await fetch(`${URL}/user`, {
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

const getUsersTranslations = async () => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
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

const deleteUserTranslation = async (item: {
  username: string;
  requestId: string;
}) => {
  try {
    const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
    const result = await fetch(`${URL}/user`, {
      method: "DELETE",
      body: JSON.stringify(item),
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
          let result = null;

          try {
            // Route the translation request to the public or authenticated endpoint based on user being logged in or not
            const user = await getCurrentUser();
            if (user) {
              result = await translateUsersText({
                inputText,
                inputLang,
                outputLang,
              });
            } else {
              throw new Error("User is not logged in.");
            }
          } catch {
            result = await translatePublicText({
              inputText,
              inputLang,
              outputLang,
            });
          }
          console.log("result: ", result);
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
        className="btn bg-blue-500"
        type="button"
        onClick={async () => {
          const rtnValue = await getUsersTranslations();
          setTranslations(rtnValue);
        }}
      >
        Get translations
      </button>

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
            <button
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
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
